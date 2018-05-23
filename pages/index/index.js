// pages/index.js
let app = getApp();

Page({
  data: {
    serverList: [],
    serverInfo: {},
    isNeedRefresh: true,
    pageHide: true,
    percent: 95,
    refreshTime: 6000,
    coord: {
      startX: 0, //开始坐标
      startY: 0
    },
    panel_state: 0,
    ssh_state: 1,
    ping_state: 0,
    Interval_list:null,
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    let _this = this;
    app.isBlind(function () { _this.get_server_list() });
  },
  //生命周期函数--监听页面显示
  onShow: function () {
    let _this = this;
    // app.isBlind(function () { _this.get_server_list() });
    this.setData({ serverList: app.globalData.serverList, pageHide: false});
    setTimeout(function () { 
      _this.cycleRefresh();
      console.log('页面循环刷新数据');
    },5000);
  },
  // 生命周期函数--监听页面隐藏
  onHide: function () {
    /* 页面隐藏时跳出循环 */
    this.setData({pageHide: true,percent: 100})
      console.log('页面隐藏时跳出循环');
  },

  // 监听用户下拉动作 -- 系统事件
  onPullDownRefresh: function () {
    let _this = this;
    app.isBlind(function () {
      wx.showNavigationBarLoading(); //在标题栏中显示加载
      _this.data.isNeedRefresh = true;
      app.removeLoginCache(()=>{
        _this.get_server_list(true);
      })
    });
  },

  // 分享宝塔面板 -- 系统事件
  onShareAppMessage: function (options) {
    // console.log(options);
    return {
      title: '宝塔面板',
      imageUrl: "/img/bt.png",
    }
  },

  // 获取用户服务器列表信息
  get_server_list: function (state) {
    let _this = this;
    wx.request({
      method: 'POST',
      url: app.server + '/?mod=get_server_list',
      data: { token: app.globalData.token, },
      success: res => {
        if (res.statusCode == 200) {
          let datas = res.data;
          for (let i = 0; i < datas.length; i++) {
            datas[i].isTouchMove = false;
          }
          app.globalData.serverList = datas;
          this.data.serverList = datas;
          if (!state){
            _this.setData({ serverList: this.data.serverList, pageHide: false })
          }
          _this.get_panel_info();
          _this.get_panel_switch();
          wx.stopPullDownRefresh() //停止下拉刷新
          wx.hideNavigationBarLoading() //完成停止加载 
        } else {
          // 定时刷新
          app.removeLoginCache(() => {
            _this.get_server_list(true);
          });
        }
        console.log(this.data.serverList);
      },
      complete: function () {
        // 设置加载进度
        _this.setData({ percent: 100 });
      }
    });
  },
  // 循环刷新 列表数据
  cycleRefresh: function () {
    let _this = this;
    let serverList = _this.data.serverList;
    let time = null;
    for (let i = 0; i < serverList.length; i++) {
      if (serverList[i].state == 1) {
        time += _this.data.refreshTime;
      }
    }
    if (_this.data.serverList.length > 0) {
      _this.data.Interval_list = setInterval(function () {
        if (_this.data.pageHide) {
          clearInterval(_this.data.Interval_list);
        }else{
          _this.get_panel_info();
        }

      },time);
    }
  },
  // 获取面板详情信息
  get_panel_info: function () {
    let serverList = this.data.serverList,
      length = serverList.length,
      _this = this;
    console.log(serverList.length);
    for (let i = 0; i < serverList.length; i++){
      if (serverList[i].state == 1) {
        app.http({
          id: serverList[i].sid,
          load: false,
          data: {
            model: 'system',
            action: 'GetAllInfo'
          }
        }).then(res => {
          serverList[i].info = res;
          this.setData({serverList: serverList});
          app.globalData.serverList = this.data.serverList;
        });
      }
    }
    console.log(this.data.serverList);
  },
  get_panel_switch:function(){
    let serverList = this.data.serverList,
      length = serverList.length,
      _this = this;
    for (let i = 0; i < serverList.length; i++) {
      if (serverList[i].state == 1) {
        wx.request({
          url: app.server + '/?mod=send_panel',
          method: 'POST',
          data: {
            sid: serverList[i].sid,
            token: app.globalData.token,
            pdata: JSON.stringify({
              model: 'firewalls',
              action: 'GetSshInfo'
            })
          },
          method: 'post',
          success: res => {
            serverList[i].SshInfo = res.data
            this.setData({
              serverList: serverList
            });
            app.globalData.serverList = this.data.serverList;
            wx.request({
              url: app.server + '/?mod=send_panel',
              method: 'POST',
              data: {
                sid: serverList[i].sid,
                token: app.globalData.token,
                pdata: JSON.stringify({
                  model: 'config',
                  action: 'getPanelState'
                })
              },
              method: 'post',
              success: res => {
                serverList[i].panel = res.data
                this.setData({
                  serverList: serverList
                });
                app.globalData.serverList = this.data.serverList;
              },
              fail: function (res) { },
              complete: function (res) { },
            });
          },
          fail: function (res) { },
          complete: function (res) { },
        });
      }
    }
    console.log(this.data.serverList);
  },
  // 添加服务器
  add_server: function () {
    let _this = this;
    if (app.globalData.userInfo.bt_info && app.globalData.userInfo.bt_info.bt_uid == 0) {
      wx.showModal({
        title: '您尚未绑定宝塔账号',
        content: '点击确定跳转到登录页面',
        success: function (res) {
          if (res.confirm) {
            // 保存当前页面，跳转至新页面
            wx.navigateTo({ url: "../blind/login" });
          }
        }
      });
    }
    else {
      wx.navigateTo({ url: "../blind/scan_blind" });
    }
  },
  // 关闭面板
  close_panel: function (e) {
    let index = e.currentTarget.dataset.index,
        serverList = this.data.serverList,
        tip = '';
    if (serverList[index].panel){
      tip = '当前面板已关闭，是否开启面板！';
    }else{
      tip = '关闭面板会导致您无法访问面板 ,您真的要关闭宝塔Linux面板吗？';
    }
    console.log(tip);
    wx.showModal({
      title: '提示',
      content:tip,
      success: sm => {
        if (sm.confirm) {
          app.http({
            id: serverList[index].sid,
            data: {
              model: 'config',
              action: 'ClosePanel'
            }
          }).then(res => {
            serverList[index].panel = !serverList[index].panel;
            this.setData({
              serverList: serverList
            })
            app.showReturnInfo(true, '', res.msg);
          })
        } else if (sm.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  // 设置ssh
  set_ssh:function(e){
    let index = e.currentTarget.dataset.index,
      serverList = this.data.serverList,
      content = '';
    if (this.data.serverList[index].SshInfo.status) {
      content = '停用SSH服务的同时也将注销所有已登录用户,继续吗？'
    } else {
      content = '确定启用SSH服务吗？'
    }
    wx.showModal({
      title: '警告 ',
      content: content,
      success: sm => {
        if (sm.confirm) {
          app.http({
            id: serverList[index].sid,
            data: {
              model: 'firewalls',
              action: 'SetSshStatus',
              status: !this.data.serverList[index].SshInfo.status?0:1
            }
          }).then(res => {
            this.data.serverList[index].SshInfo.status = !this.data.serverList[index].SshInfo.status;
            this.setData({
              serverList: this.data.serverList
            })
            app.showReturnInfo(true, '', res.msg);
          })
        } else if (sm.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  // 设置ping
  set_ping:function(e){
    let index = e.currentTarget.dataset.index,
      serverList = this.data.serverList,
      content = '';
    if (this.data.serverList[index].SshInfo.status) {
      content = '启用PING状态可能会被黑客发现您的服务器，您真的要启用PING吗？'
    } else {
      content = '禁用PING后不影响服务器正常使用，但无法ping通服务器，您真的要禁用PING吗？？'
    }
    wx.showModal({
      title: '警告 ',
      content: content,
      success: sm => {
        if (sm.confirm) {
          app.http({
            id: serverList[index].sid,
            data: {
              model: 'firewalls',
              action: 'SetPing',
              status: !this.data.serverList[index].SshInfo.status ? 0 : 1
            }
          }).then(res => {
            this.data.serverList[index].SshInfo.ping = !this.data.serverList[index].SshInfo.ping;
            this.setData({
              serverList: this.data.serverList
            })
            app.showReturnInfo(true, '', res.msg);
          })
        } else if (sm.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  // 删除绑定事件
  del_server: function (e) {
    let index = e.currentTarget.dataset.index;
    let _this = this;
    wx.showModal({
      title: '删除面板',
      content: '是否删除该面板？',
      success: res => {
        if (res.confirm) {
          // console.log(index, this.data.serverList[index].sid);
          wx.request({
            url: app.server + '?mod=remove_server',
            method: 'POST',
            data: { 
              sid: this.data.serverList[index].sid,
              token: app.globalData.token
            },
            success:res=>{
              // console.log(res);
              // if (!res.data.status) {
              //   this.showErrorModal(res.data.msg || '未知错误', '');
              //   wx.hideLoading();
              //   return false;
              // }
              if (res.statusCode == 200) {
                this.data.pageHide = false;
                this.data.serverList.splice(index, 1);
                this.setData({ serverList: this.data.serverList });
                app.showReturnInfo(true,'',res.data.msg);
              }
            }
          });
        }
      }
    })
  },

  // 判断是否跳转详情页面
  navigateToDetail: function (event) {
    if (event.currentTarget.dataset.status != 0) {
      wx.navigateTo({
        url: '../server/detail?sid=' + event.currentTarget.dataset.id,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
    else {
      app.showReturnInfo(false, '该面板已关闭,请手动使用SSH开启', '服务已停止');
    }
  },

  // 手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.serverList.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      serverList: this.data.serverList
    })
  },

  // 滑动事件处理
  touchmove: function (e) {
    let that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.serverList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else
          //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      serverList: that.data.serverList
    })
  },

  // 计算滑动角度
  angle: function (start, end) {
    let _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
})