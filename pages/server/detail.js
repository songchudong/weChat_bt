// pages/server/detail.js
var app = getApp()
var charts = require('../../utils/charts.js');

Page({
  //页面的初始数据
  data: {
    loadInfo: null,
    sid: null,
    start_date: '2017-03-11',
    end_date: null,
    index_cut: 2,
    monitor_index: 0,
    environment_index: 0,
    task_index: 0,
    tab_list: [
      { name: '监控列表', index: 0},
      { name: '环境状态', index: 1},
      { name: '任务管理', index: 2},
      { name: '网站管理', index: 3}
    ],

    monitor_list: [
      { name: '今天', index: 0 },
      { name: '昨天', index: 1 },
      { name: '近7天', index: 7 },
      { name: '自定义', index: -1 }
    ],
    environment_list: [
      { name: '全部', index: 0 },
      { name: '运行中', index: 1 },
      { name: '暂停中', index: 2 }
    ],
    task_list: [
      { name: '进程', index: 0 },
      { name: '启动项', index: 1 },
      { name: '服务', index: 2 },
      { name: '网络', index: 3 },
      { name: '用户', index: 4 },
      { name: '计划任务', index: 5 },
      { name: '会话', index: 6 }
    ],
    task_view:null,
    mask_view: false,
    plugin_list: [],
    plugin_view_box: false,
    plugin_status: true,
    plugin_name: null,
    plugin_index: null,
    plugin_version: null,
    plugin_cut: null,
    course_list: [],
    course_info: null,
    run_list: [],
    run_info: null,
    service_list: [],
    service_info: null,
    network_list: [],
    network_info: null,
    user_list: [],
    cron_list: [],
    who_list: [],
    sites_list: []
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    var myDate = new Date()
    var Y = myDate.getFullYear();
    var M = myDate.getMonth() + 1;
    var D = myDate.getDate();
    if (D > 7) {
      this.data.start_date = Y + '-' + M + '-' + (D - 7)
    }
    else {
      if (M > 1) {
        this.data.start_date = Y + '-' + (M - 1) + '-' + '28'
      }
    }
    var end_date = Y + '-' + M + '-' + D
    this.setloading();
    this.setData({
      sid: options.sid,
      end_date: end_date,
      start_date: this.data.start_date
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取版本
    // app.http({
    //   id: this.data.sid,
    //   data: {
    //     model: 'system',
    //     action: 'GetSystemTotal',
    //   }
    // }).then(res => {
    //   let version = parseInt(res.version.replace('.', ''))
    //   if (version > 588) {
    //     console.log('当前面板版本为' + res.version);
    //   }
    // });
    this.serverInfoApi(this.data.sid, { stype: 0, model: 'ajax', action: 'loadInfo' }, 'loadInfo');
  },
  // 切换分类
  tab_lord_cut:function(e){
    switch (e.target.id){
      case '0':
        this.serverInfoApi(this.data.sid,{stype: 0,model: 'ajax', action: 'loadInfo'},'loadInfo');
        this.setData({monitor_index:0});
      break;
      case '1':
        this.get_plugin_list();
        this.setData({ environment_index: 0 });
      break;
      case '2':
        this.get_task_list();

        this.setData({ task_index: 0 });
      break;
      case '3':
        this.get_site_list();
      break;
    }
    this.setData({
      index_cut: e.target.id
    });
  },
  
  // 切换分类-类型
  tabCut: function (e) {
    let index = parseInt(this.data.index_cut);
    switch (index){
      case 0:
        if (e.currentTarget.dataset.index != -1 || (e.currentTarget.dataset.index == -1 && this.data.end_date && this.data.start_date)) {
          this.serverInfoApi(this.data.sid, {stype: e.currentTarget.dataset.index,model: 'ajax',action: 'loadInfo',start: this.data.start_date, end: this.data.end_date,}, 'loadInfo')
        }
        this.setData({ monitor_index: e.currentTarget.dataset.index});
      break;
      case 1:
        this.get_plugin_list(e.currentTarget.dataset.index);
        this.setData({ environment_index: e.currentTarget.dataset.index });
      break;
      case 2:
        switch (e.currentTarget.dataset.index) {
          case 0:
            this.get_task_list();
          break;
          case 1:
            this.get_run_list();
          break;
          case 2:
            this.get_service_list();
          break;
          case 3:
            this.get_network_list();
          break;
          case 4:
            this.get_user_list();
          break;
          case 5:
            this.get_cron_list();
          break;
          case 6:
            this.get_who_list();
          break;
        }
        this.setData({ task_index: e.currentTarget.dataset.index });
      break;
    }
  },
  
  // 显示加载中
  setloading: function () {
    let stype = ['pro', 'mem', 'network', 'disk', 'loadAverage']
    stype.forEach(function (item, index) {
      charts.loading(item)
    });
  },

  serverInfoApi: function (sid, pdata, saveName) {
    app.http({
      id:sid,
      data: pdata
    }).then(res=>{
      this.data.saveName = res;
      charts.charts(res['cpuIO'][1], 'pro', res['cpuIO'][0]) // cpu
      charts.charts(res['cpuIO'][2], 'mem', res['cpuIO'][0]) // mem
      charts.charts(res['netWorkIo'][1], 'network', res['netWorkIo'][0]) // NetWorkIo
      charts.charts(res['diskIo'][1], 'disk', res['diskIo'][0]) // NetWorkIo
      charts.charts(res['LoadAverage'][1], 'loadAverage', res['LoadAverage'][0]) // NetWorkIo
    });
  },
  
  // 设置开始时间
  setStartDate: function (e) {
    console.log('setStartDate', e.detail.value, e.target.id)
    console.log(e.detail.value, this.data.end_date)
    this.setData({
      start_date: e.detail.value
    })
    this.serverInfoApi(this.data.sid,
      {
        stype: '-1',
        model: 'ajax',
        action: 'loadInfo',
        start: e.detail.value,
        end: this.data.end_date,
      },
      'loadInfo')
  },
  
  // 设置结束时间
  setEndDate: function (e) {
    console.log('setEndDate', e.detail.value, e.target.id)
    console.log(this.data.start_date, e.detail.value)
    this.setData({
      end_date: e.detail.value
    })
    this.serverInfoApi(this.data.sid,
      {
        stype: '-1',
        model: 'ajax',
        action: 'loadInfo',
        start: this.data.start_date,
        end: e.detail.value,
      },
      'loadInfo')
  },

  // 获取环境插件
  get_plugin_list: function (index) {
    let _this = this;
    app.http({
      id: this.data.sid,
      data: {
          model: 'panelPlugin',
          action: 'getPluginList',
          type: '1'
      }
    }).then(res => {
      console.log(res);
      let res_data = res.data;
      let res_arry = [];
      this.data.plugin_list = [];
      for (let i = 0; i < res_data.length; i++) {
        if (typeof res_data[i] == 'object') {
          for (let j = 0; j < res_data[i].versions.length; j++) {
            if (res_data[i].versions[j].status) {
              res_arry.push({
                name: res_data[i].name,
                type: res_data[i].type,
                version: res_data[i].versions[j].version,
                version_on: res_data[i].versions[j].no,
                run: res_data[i].versions[j].run
              })
            }
          }
        }
      }
      for (let z = 0; z < res_arry.length; z++) {
        if (res_arry[z].run && index == 1) {
          this.data.plugin_list.push(res_arry[z]);
        }
        if (!res_arry[z].run && index == 2) {
          this.data.plugin_list.push(res_arry[z]);
        }
        if (index == 0 || index == undefined) {
          this.data.plugin_list.push(res_arry[z]);
        }
      }
      this.setData({
        plugin_list: _this.data.plugin_list
      });
    })
  },

  // 获取插件状态
  set_plugin: function (e) {
    let name = e.currentTarget.dataset.name;
    if (name === "pm2" || name === "docker") {
      app.showReturnInfo(false, '该软件未提供操作管理功能', '提示');
      return false;
    }
    if (name === "mongodb" || name === "gitlab"){
      this.data.plugin_cut = false;
    }else{
      this.data.plugin_cut = true;
    }
    this.setData({
      plugin_view_box: true,
      mask_view: true,
      plugin_name: name,
      plugin_status: e.currentTarget.dataset.status,
      plugin_index: e.currentTarget.dataset.index,
      plugin_version: e.currentTarget.dataset.version,
      plugin_cut: this.data.plugin_cut
    });
  },
  // 设置状态
  set_plugin_Service: function (e) {
    let type = e.currentTarget.dataset.type, loading_tip = '', obj = {};
    for (let i = 0; i < this.data.plugin_list.length; i++) {
      if (this.data.plugin_list[i].name === this.data.plugin_name) {
        if (this.data.plugin_name === 'mysql') this.data.plugin_name = (this.data.plugin_name + 'd');
        if (this.data.plugin_name == 'php') this.data.plugin_name = 'php-fpm-' + this.data.plugin_version.replace('.', '');
        switch (type) {
          case 'stop':
            loading_tip = '正在停止服务中，请稍后...'
            break;
          case 'start':
            loading_tip = '正在启动服务中，请稍后...'
            break;
          case 'restart':
            loading_tip = '正在重启服务中，请稍后...'
            break;
          case 'reload':
            loading_tip = '正在重载服务中，请稍后...'
        }
        switch (this.data.plugin_name) {
          case 'gitlab':
            obj = {
              model: 'panelPlugin',
              action: 'a',
              mod_s: 'ServiceAdmin',
              mod_name: this.data.plugin_name,
              status: type
            }
            break;
          case 'mongodb':
            let status = '';
            switch (type) {
              case 'stop':
                status = 0;
                break;
              case 'start':
                status = 1;
                break;
              case 'restart':
                status = 2;
                break;
            }
            obj = {
              model: 'panelPlugin',
              action: 'a',
              mod_s: 'service_admin',
              mod_name: this.data.plugin_name,
              status: status
            }
            break;
          default:
            obj = {
              model: 'system',
              action: 'ServiceAdmin',
              mod_name: this.data.plugin_name,
              type: type
            }
            break;
        }
        app.http({
          id: this.data.sid,
          data:obj
        }).then(res=>{
            app.showReturnInfo(true, '空', res.msg);
            this.data.plugin_list[this.data.plugin_index].run = !this.data.plugin_status;
            this.setData({ plugin_status: !this.data.plugin_status, plugin_list: this.data.plugin_list });
        })
        app.showLoading(loading_tip);
        break;
      }
    }
  },

  // 遮罩tap
  mask_tap: function () {
    this.setData({
      plugin_view_box: false,
      mask_view: false,
    });
  },

  // 获取进程
  get_task_list: function () {
    let _this = this;
    if (this.data.task_view === null){
      app.http({
        id: this.data.sid,
        data: {
          model: 'panelPlugin',
          action: 'getPluginList',
          type: '4'
        }
      }).then(res => {
        let resdata = res.data;
        console.log(res);
        for (let i = 0; i < resdata.length; i++) {
          if (resdata[i].name == "task_manager") {
            switch (resdata[i].end) {
              case '待支付':
                this.setData({ task_view: false });
                break;
              case '已过期':
                this.setData({ task_view: false });
                break;
              default:
                this.setData({ task_view: true });
                req();
                break;
            }
          }
        }
      });
    }else{
      req();
    }
    function req(){
      app.http({
        id: _this.data.sid,
        data: {
          model: 'panelPlugin',
          action: 'a',
          mod_s: 'get_process_list',
          mod_name: 'task_manager',
          sortx: 'cpu_percent'
        }
      }).then(res => {
        _this.setData({
          course_info: res.info,
          course_list: res.process_list,
        });
      });
    }
  },

  // 获取启动项
  get_run_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_s: 'get_run_list',
        mod_name: 'task_manager'
      }
    }).then(res => {
      this.setData({
        run_list: res.run_list,
        run_info: res.run_level
      })
    });
  },

  // 获取服务
  get_service_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s: 'get_service_list'
      }
    }).then(res => {
      this.setData({
        service_list: res.serviceList,
        service_info: res.runlevel
      })
    });
  },

  // 获取网络
  get_network_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s: 'get_network_list'
      }
    }).then(res => {
      this.setData({
        network_list: res.list,
        network_info: res.state
      })
    });
  },

  // 获取用户
  get_user_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s: 'get_user_list'
      }
    }).then(res => {
      this.setData({
        user_list: res
      })
    });
  },

  // 获取任务
  get_cron_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s: 'get_cron_list'
      }
    }).then(res => {
      this.setData({
        cron_list: res
      })
    });
  },

  // 获取会话
  get_who_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s: 'get_who'
      }
    }).then(res => {
      this.setData({
        who_list: res
      })
    });
  },

  // 获取站点列表
  get_site_list: function () {
    app.http({
      id:this.data.sid,
      data:{
        model: 'data',
        action: 'getData',
        tojs: 'getWeb',
        table: 'sites',
        limit: 50,
        p: 1,
        search: '',
        order: 'id desc',
        zunfile: '',
        data: ''
      }
    }).then(res => {
      this.setData({
        sites_list: res.data
      })
    });
  },

  // 设置站点启动状态
  site_stop: function (e) {
    let index = e.currentTarget.dataset.index,
        sites_list = this.data.sites_list,
        tip = '确定要' + (parseInt(sites_list[index].status) ? '暂停' : '开启') + '该站点吗？';
    wx.showModal({
      title: sites_list[index].name,
      content: tip,
      success: sm => {
        if (sm.confirm) {
          app.http({
            id:this.data.sid,
            data:{
              model: 'panelSite',
              action: parseInt(sites_list[index].status) ? 'SiteStop' : 'SiteStart',
              id: sites_list[index].id,
              mod_name: sites_list[index].name,
            }
          }).then(res => {
            this.data.sites_list[index].status = sites_list[index].status == '1' ? '0' : '1'
            this.setData({
              sites_list: this.data.sites_list
            })
            app.showReturnInfo(true, '', res.msg);
          })
        } else if (sm.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  // 设置域名状态
  set_domain:function(e){
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/server/domain?domain=' + this.data.sites_list[index].name + '&id=' + this.data.sites_list[index].id + '&sid='+ this.data.sid,
      fail:function(res){
        app.showErrorModal('页面加载失败');
      }
    })
  },

  // 跳转日志视图
  logs_view:function(e){
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/server/logs?domain=' + this.data.sites_list[index].name +'&sid=' + this.data.sid,
      fail: function (res) {
        app.showErrorModal('页面加载失败');
      }
    })
  },


  // 跳转进程详情
  curse_view: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/server/course_details?pid=' + this.data.course_list[index].pid + '&sid=' + this.data.sid,
      fail: function (res) {
        app.showErrorModal('页面加载失败');
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    let index = parseInt(this.data.index_cut);
    switch (index) {
      case 0:
        if (this.data.monitor_index != -1 || (this.data.monitor_index == -1 && this.data.end_date && this.data.start_date)) {
          this.serverInfoApi(this.data.sid, { stype: this.data.monitor_index, model: 'ajax', action: 'loadInfo', start: this.data.start_date, end: this.data.end_date, }, 'loadInfo')
        }
        break;
      case 1:
        this.get_plugin_list(this.data.environment_index);
        break;
      case 2:
        switch (this.data.task_index) {
          case 0:
            this.get_task_list();
            break;
          case 1:
            this.get_run_list();
            break;
          case 2:
            this.get_service_list();
            break;
          case 3:
            this.get_network_list();
            break;
          case 4:
            this.get_user_list();
            break;
          case 5:
            this.get_cron_list();
            break;
          case 6:
            this.get_who_list();
            break;
        }
        break;
      case 3:
        this.get_site_list();
      break;
    }
    // index_cut: 0,
    // monitor_index: 0,
    // environment_index: 0,
    // task_index: 0,

    // 下拉 不添加任何动作处理
    wx.stopPullDownRefresh() //停止下拉刷新
    wx.hideNavigationBarLoading() //完成停止加载
  }
})