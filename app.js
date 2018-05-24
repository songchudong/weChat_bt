//app.js
App({
  // 小程序初始化
  onLaunch: function () {
    // 展示本地存储能力
    this.globalData.token = wx.getStorageSync('token')
    this.globalData.userInfo = wx.getStorageSync('userinfo')
    if (!this.globalData.token || !this.globalData.userInfo) {
      this.getLogin();
    }
    console.log('小程序初始化成功');
  },
  //清除登录缓存
  removeLoginCache: function (fn) {
    wx.removeStorageSync('token')
    this.globalData.token = ''
    this.getLogin().then(()=>{
      fn();
    }).catch(()=>{

    });
    console.log('清除登陆缓存，重新登录');
  },
  // 获取登陆状态
  getLogin: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            var _this = this;
            wx.request({
              url: this.server + "/?mod=api&def=get_openid&jscode=" + res.code,
              success: function (res) {
                _this.globalData.token = res.data.token
                wx.setStorageSync('token', res.data.token)
                console.log("登录", res.data)
                resolve();
                if (res.data.wxUserInfo) {
                  _this.globalData.userInfo = {
                    wx_info: res.data.wxUserInfo,
                    bt_info: res.data.btInfo
                  }
                  wx.setStorageSync('userinfo', _this.globalData.userInfo)
                }
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg);
            reject();
          }
        }
      })
    });
  },
  /* 验证用户是否绑定宝塔账号 */
  isBlind: function (fun) {
    var count = 0
    var _this = this
    var loginFun = setInterval(function () {
      count += 1
      if (!_this.globalData.userInfo.bt_info) {
        console.log('仍在登录登录中')
      }else if (_this.globalData.userInfo.bt_info && _this.globalData.userInfo.bt_info.bt_uid == 0) {
        clearInterval(loginFun);
        // uid 不存在, 则跳转宝塔账号绑定页面
        _this.removeLoginCache();
        console.log('isblind server/login');
        wx.navigateTo({
          url: "blind/login"
        })
      }else {
        clearInterval(loginFun);
        typeof fun == "function" && fun();
      }
      if (count > 15) {
        _this.globalData.percent += 2
        clearInterval(loginFun);
        _this.showReturnInfo(false, '网络错误', '加载失败');
        console.log('重复检查超过15次，网络错误');
      }
    }, 200);
  },
  // ajax请求封装
  http:function(obj){
    let _this = this;
    return new Promise((resolve, reject)=>{
      obj.load == undefined || obj.load ?this.showLoading(obj.title || '加载中...'):''
      wx.request({
        url: _this.server + '/?mod=send_panel',
        method: 'POST',
        data:{
          sid: obj.id,
          token: this.globalData.token,
          pdata: JSON.stringify(obj.data)
        },
        success: res=>{
          if(res.statusCode == 200){
            if (res.data == null){
              reject(res);
              this.showErrorModal('获取失败，请下拉刷新重新获取数据','提示');
              wx.hideLoading();
              return false;
            }
            if (res.data === false) {
              reject(res);
              this.showErrorModal('服务不支持，请将面板和小程序插件升级至最新版本', '提示');
              wx.hideLoading();
              return false;
            }
            if (res.data.status === false) {
              reject(res);
              this.showErrorModal(res.data.msg || '未知错误', '');
              wx.hideLoading();
              return false;
            }
            resolve(res.data);
          }
        },
        fail:res=>{
          reject(res);
        },complete:()=>{
          obj.load == undefined || obj.load ?wx.hideLoading():''
        }
      });
    });
  },
  // 错误弹窗
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      confirmColor: "#1f7bff",
      showCancel: false
    });
  },
  // 加载弹窗
  showLoading: function (title) {
    wx.showLoading({
      title: title || '加载中',
      icon: 'loading',
      mask: true
    });
  },
  // 消息提示框
  showReturnInfo: function (status, content, title) {
    if (status) {
      wx.showToast({
        title: title || '绑定成功',
        icon: 'succes',
        duration: 2000,
        mask: true
      });
    } else {
      wx.showModal({
        title: title || '绑定失败',
        content: content || '请求超时',
        confirmColor: "#1f7bff",
        showCancel: false
      });
    }
  },
  server: "https://app.bt.cn",
  globalData: {
    percent: 20,
    userInfo: {},
    token: null,
    serverList: []
  }
})