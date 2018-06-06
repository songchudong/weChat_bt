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
                index_cut: 0,
                monitor_index: 0,
                environment_index: 0,
                task_index: 0,
                firewall_index:0,
                tab_list: [
                        { name: '监控', index: 0 },
                        { name: '防火墙', index: 1 },
                        { name: '任务管理', index: 2 },
                        { name: '环境', index: 3 },
                        { name: '网站', index: 4 },
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
                firewall_list: [
                        { name: '概览', index: 0 },
                        { name: '全局配置', index: 1 },
                        { name: '站点配置', index: 2 },
                        { name: '封锁历史', index: 3 },
                        { name: '操作日志', index: 4 },
                ],
                task_view: null,
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
                sites_list: [],
                firewall_view: null,
                btwaf_total_all: null,
                btwaf_config:null,
                btwaf_site:null,
                btwaf_gl_logs_page:1,
                btwaf_gl_logs: [],
                btwaf_safe_logs:[],
                btwaf_safe_logs_page: 1,
                 btwaf_loading: false, //"上拉加载"的变量，默认false，隐藏  
                 btwaf_loadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
                 is_initial:true//是否初始获取数据
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
                // 获取监控数据
                this.serverInfoApi(this.data.sid, { stype: 0, model: 'ajax', action: 'loadInfo' }, 'loadInfo');
        },
        // 切换分类
        tab_lord_cut: function (e) {
                console.log(e);
                switch (e.target.id) {
                        case '0':
                                this.serverInfoApi(this.data.sid, { stype: 0, model: 'ajax', action: 'loadInfo' }, 'loadInfo');//监控管理
                                this.setData({ monitor_index: 0 });
                                break;
                        case '1':
                                this.get_total_all();//防火墙
                                this.setData({ firewall_index: 0 });
                                break;
                        case '2':
                                this.get_task_list();//任务管理
                                this.setData({ task_index: 0 });

                                break;
                        case '3':
                                this.get_plugin_list();//环境管理
                                this.setData({ environment_index: 0 });
                                break;
                        case '4':
                                this.get_site_list();//站点管理
                                break;
                }
                this.setData({
                        index_cut: e.target.id
                });
        },

        // 切换分类-类型
        tabCut: function (e) {
                let index = parseInt(this.data.index_cut);
                switch (index) {
                        case 0:
                                if (e.currentTarget.dataset.index != -1 || (e.currentTarget.dataset.index == -1 && this.data.end_date && this.data.start_date)) {
                                        this.serverInfoApi(this.data.sid, { stype: e.currentTarget.dataset.index, model: 'ajax', action: 'loadInfo', start: this.data.start_date, end: this.data.end_date, }, 'loadInfo')
                                }
                                this.setData({ monitor_index: e.currentTarget.dataset.index });
                                break;
                        case 1:
                                switch (e.currentTarget.dataset.index) {
                                        case 0:
                                                this.get_total_all();
                                                break;
                                        case 1:
                                                this.get_config();
                                                break;
                                        case 2:
                                                this.get_safe_site();
                                                break;
                                        case 3:
                                                this.get_safe_logs();
                                                break;
                                        case 4:
                                                this.get_gl_logs();
                                                break;
                                }
                                this.setData({ firewall_index: e.currentTarget.dataset.index });
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
                        case 3:
                                this.get_plugin_list(e.currentTarget.dataset.index);
                                this.setData({ environment_index: e.currentTarget.dataset.index });
                                break;
                }
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
                                switch (this.data.task_index) {
                                        case 0:
                                                this.get_total_all();
                                                break;
                                        case 1:
                                                this.get_config();
                                                break;
                                        case 2:
                                                this.get_safe_site();
                                                break;
                                        case 3:
                                                this.get_safe_logs();
                                                break;
                                        case 4:
                                                this.get_gl_logs();
                                                break;
                                }
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
                                this.get_plugin_list(this.data.environment_index);
                                break;
                        case 4:
                                this.get_site_list();
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
        // 监控
        serverInfoApi: function (sid, pdata, saveName) {
                wx.setNavigationBarTitle({ title: '宝塔面板-监控列表' })
                app.http({
                        id: sid,
                        load: false,
                        data: pdata
                }).then(res => {
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
                        'loadInfo');
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
                wx.setNavigationBarTitle({ title: '宝塔面板-环境状态' });
                let _this = this;
                console.log(this.data.plugin_list);
                app.http({
                        id: this.data.sid,
                        load: this.data.plugin_list.length == 0?true:false,
                        data: {
                                model: 'panelPlugin',
                                action: 'getPluginList',
                                type: '1'
                        }
                }).then(res => {
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
                if (name === "mongodb" || name === "gitlab") {
                        this.data.plugin_cut = false;
                } else {
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
                // console.log(e);
                let type = e.currentTarget.dataset.type, loading_tip = '', obj = {};
                for (let i = 0; i < this.data.plugin_list.length; i++) {
                        if (this.data.plugin_list[i].name === this.data.plugin_name) {
                                // if (this.data.plugin_name === 'mysql') this.data.plugin_name = (this.data.plugin_name + 'd');
                                if (this.data.plugin_name == 'php') this.data.plugin_name = 'php-fpm-' + this.data.plugin_version.replace('.', '');
                                console.log(this.data.plugin_name)
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
                                                        mod_name: this.data.plugin_name == 'mysql' ? this.data.plugin_name + 'd' : this.data.plugin_name,
                                                        type: type
                                                }
                                                break;
                                }
                                app.http({
                                        id: this.data.sid,
                                        data: obj
                                }).then(res => {
                                        app.showReturnInfo(true, '空', res.msg);
                                        if (type == "restart") {
                                                this.data.plugin_list[this.data.plugin_index].plugin_status = true;
                                        } else if (type == "stop" || type == "start") {
                                                this.data.plugin_list[this.data.plugin_index].plugin_status = !this.data.plugin_status;
                                        }
                                        this.setData({ plugin_status: this.data.plugin_list[this.data.plugin_index].plugin_status, plugin_list: this.data.plugin_list });
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
                wx.setNavigationBarTitle({ title: '宝塔面板-任务管理' });
                let _this = this;
                this.data.course_list.length == 0 ? app.showLoading('加载中...') : '',
                wx.request({
                        url: app.server + '/?mod=send_panel',
                        data: {
                                sid: this.data.sid,
                                token: app.globalData.token,
                                pdata: JSON.stringify({
                                        model: 'panelPlugin',
                                        action: 'a',
                                        mod_s: 'get_process_list',
                                        mod_name: 'task_manager',
                                        sortx: 'cpu_percent'
                                })
                        },
                        method: 'POST',
                        dataType: 'json',
                        responseType: 'text',
                        success: res => {
                                if (res.statusCode != 200) {
                                        this.showErrorModal('当前网络错误，请重新下拉刷新列表', '提示');
                                }
                                let resdata = res.data;
                                if (resdata.status != false) {
                                        this.setData({
                                                course_info: resdata.info,
                                                course_list: resdata.process_list,
                                                task_view: true
                                        });
                                } else {
                                        this.setData({ task_view: false });
                                }
                        },
                        fail: function (res) { },
                        complete: function (res) {
                                wx.hideLoading();
                                // 下拉 不添加任何动作处理
                                wx.stopPullDownRefresh() //停止下拉刷新
                                wx.hideNavigationBarLoading() //完成停止加载
                        },
                })
        },

        // 获取启动项
        get_run_list: function () {
                app.http({
                        id: this.data.sid,
                        load: this.data.run_list.length == 0 ? true : false,
                        data: {
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
                        id: this.data.sid,
                        load: this.data.service_list.length == 0 ? true : false,
                        data: {
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
                        id: this.data.sid,
                        load: this.data.network_list.length == 0 ? true : false,
                        data: {
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
                        id: this.data.sid,
                        load: this.data.user_list.length == 0 ? true : false,
                        data: {
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
                        id: this.data.sid,
                        load: this.data.cron_list.length == 0 ? true : false,
                        data: {
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
                        id: this.data.sid,
                        load: this.data.who_list.length == 0 ? true : false,
                        data: {
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
                wx.setNavigationBarTitle({ title: '宝塔面板-网站管理' })
                app.http({
                        id: this.data.sid,
                        load: this.data.sites_list.length == 0 ? true : false,
                        data: {
                                model: 'data',
                                action: 'getData',
                                tojs: 'getWeb',
                                table: 'sites',
                                limit: 40,
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
                                                id: this.data.sid,
                                                data: {
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
        set_domain: function (e) {
                let index = e.currentTarget.dataset.index;
                wx.navigateTo({
                        url: '/pages/server/domain?domain=' + this.data.sites_list[index].name + '&id=' + this.data.sites_list[index].id + '&sid=' + this.data.sid,
                        fail: function (res) {
                                app.showErrorModal('页面加载失败');
                        }
                })
        },

        // 跳转日志视图
        logs_view: function (e) {
                let index = e.currentTarget.dataset.index;
                wx.navigateTo({
                        url: '/pages/server/logs?domain=' + this.data.sites_list[index].name + '&sid=' + this.data.sid,
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

        // 获取防火墙—概览
        get_total_all: function () {
                wx.setNavigationBarTitle({ title: '宝塔面板-防火墙' });
                let _this = this;
                this.data.btwaf_total_all == null ? app.showLoading('加载中...'):'';
                wx.request({
                        url: app.server + '/?mod=send_panel',
                        data: {
                                sid: this.data.sid,
                                token: app.globalData.token,
                                pdata: JSON.stringify({
                                        model: 'panelPlugin',
                                        action: 'a',
                                        mod_name: 'btwaf',
                                        mod_s: 'get_total_all'
                                })
                        },
                        method: 'POST',
                        dataType: 'json',
                        responseType: 'text',
                        success: res => {
                                if (res.statusCode != 200) {
                                        this.showErrorModal('当前网络错误，请重新下拉刷新列表', '提示');
                                }
                                let resdata = res.data;
                                if (resdata.status != false) {
                                        this.setData({
                                                btwaf_total_all: resdata,
                                                firewall_view: true
                                        });
                                } else {
                                        this.setData({ firewall_view: false });
                                }
                        },
                        fail: function (res) { },
                        complete: function (res) {
                                wx.hideLoading();
                        },
                })
        },

        // 设置防火墙开关
        set_total_all:function(e){
                let open = e.currentTarget.dataset.open,
                        tip = '确定要' + (open ? '暂停' : '开启') + '网站防火墙吗？';
                wx.showModal({
                        title: (open ? '暂停' : '开启') +'--网站防火墙' ,
                        content: tip,
                        success: sm => {
                                console.log(sm.confirm);
                                if (sm.confirm) {
                                        app.http({
                                                id: this.data.sid,
                                                data: {
                                                        model: 'panelPlugin',
                                                        action: 'a',
                                                        mod_name: 'btwaf',
                                                        mod_s: 'set_open'
                                                }
                                        }).then(res => {
                                                if (res.status){
                                                        this.data.btwaf_total_all.open = !this.data.btwaf_total_all.open;
                                                        this.setData({
                                                                btwaf_total_all: this.data.btwaf_total_all
                                                        });
                                                }
                                                app.showReturnInfo(res.status, res.msg, res.status?res.msg:'提示');
                                        });
                                }else{
                                        this.setData({
                                                btwaf_total_all: this.data.btwaf_total_all
                                        });
                                }
                        }
                });
        },


        // 获取全局配置
        get_config:function(){
                app.http({
                        id: this.data.sid,
                        load: this.data.btwaf_config == null ? true : false,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_config'
                        }
                }).then(res => {
                        console.log(res);
                        this.setData({
                                btwaf_config: res
                        })
                });
        },

        // 设置全局配置—开关
        set_config_state: function (e) {
                let state = e.currentTarget.dataset.state,
                        obj = e.currentTarget.dataset.obj,
                        server = e.currentTarget.dataset.server,
                        tip = '确定要' + (state ? '暂停' : '开启') + server + '吗？';
                wx.showModal({
                        title: (state ? '暂停' : '开启') + '--' + server,
                        content: tip,
                        success: sm => {
                                if (sm.confirm) {
                                        app.http({
                                                id: this.data.sid,
                                                data: {
                                                        model: 'panelPlugin',
                                                        action: 'a',
                                                        mod_name: 'btwaf',
                                                        mod_s: 'set_obj_open',
                                                        obj: obj
                                                }
                                        }).then(res => {
                                                if (res.status) {
                                                        this.data.btwaf_config[obj].open = !this.data.btwaf_config[obj].open;
                                                        this.setData({
                                                                btwaf_config: this.data.btwaf_config
                                                        });
                                                }
                                                app.showReturnInfo(res.status, res.msg, res.status ? res.msg : '提示');
                                        });
                                } else {
                                        this.setData({ btwaf_config: this.data.btwaf_config });
                                }
                        }
                });
        },

        // 获取防火墙-操作日志
        get_gl_logs:function(){
                app.http({
                        id: this.data.sid,
                        load: this.data.btwaf_gl_logs == null ? true : false,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_gl_logs',
                                tojs:'viewdata',
                                p: this.data.btwaf_gl_logs_page
                        }
                }).then(res => {
                        if (res.data.length != 0) {
                                if (this.data.is_initial) {
                                        this.data.btwaf_gl_logs = res.data;
                                } else {
                                        this.data.btwaf_gl_logs = this.data.btwaf_gl_logs.concat(res.data);
                                }
                                this.setData({
                                        btwaf_gl_logs: this.data.btwaf_gl_logs,
                                        btwaf_loading: true,
                                        btwaf_loadingComplete: false
                                })
                        } else {
                                this.setData({
                                        btwaf_loading: false,
                                        btwaf_loadingComplete: true
                                })
                        }
                });
        },

        // 获取站点配置
        get_safe_site:function(){
                app.http({
                        id: this.data.sid,
                        load: this.data.btwaf_site == null ? true : false,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_site_config'
                        }
                }).then(res => {
                        this.setData({
                                btwaf_site: res
                        })
                });
        },

        // 设置站点开关
        set_config_site:function(e){
                let state = e.currentTarget.dataset.state,
                        server = e.currentTarget.dataset.server,
                        index = e.currentTarget.dataset.index,
                        tip = '确定要' + (state ? '暂停' : '开启') +'该站点安全配置吗？';
                wx.showModal({
                        title: server  ,
                        content: tip,
                        success: sm => {
                                if (sm.confirm) {
                                        app.http({
                                                id: this.data.sid,
                                                data: {
                                                        model: 'panelPlugin',
                                                        action: 'a',
                                                        mod_name: 'btwaf',
                                                        mod_s: 'set_site_obj_open',
                                                        obj:'open',
                                                        siteName: server
                                                }
                                        }).then(res => {
                                                if (res.status) {
                                                        this.data.btwaf_site[index].open = !this.data.btwaf_site[index].open;
                                                        this.setData({btwaf_site: this.data.btwaf_site});
                                                }
                                                app.showReturnInfo(res.status, res.msg, res.status ? res.msg : '提示');
                                        });
                                } else {
                                        this.setData({ btwaf_site: this.data.btwaf_site });
                                }
                        }
                });
        },

        // 获取封锁历史
        get_safe_logs:function(){
                console.log(this.data.btwaf_safe_logs);
                app.http({
                        id: this.data.sid,
                        load: this.data.btwaf_safe_logs.length == 0 ? true : false,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_safe_logs',
                                drop_ip:'1',
                                p: this.data.btwaf_safe_logs_page
                        }
                }).then(res => {
                        if(res.length !=0){
                                if (this.data.is_initial){
                                        this.data.btwaf_safe_logs = res;
                                }else{
                                        this.data.btwaf_safe_logs = this.data.btwaf_safe_logs.concat(res);
                                }
                                this.setData({
                                        btwaf_safe_logs: this.data.btwaf_safe_logs,
                                        btwaf_loading:true,
                                        btwaf_loadingComplete:false
                                })
                        }else{
                                this.setData({
                                        btwaf_loading: false,
                                        btwaf_loadingComplete:true
                                })
                        }
                });
        },
        
        // 解封IP
        set_safe_drop_ip:function(){
                wx.showModal({
                        title: '解封IP地址',
                        content: '是否要从防火墙解封所有IP',
                        success: sm => {
                                if (sm.confirm) {
                                        app.http({
                                                id: this.data.sid,
                                                data: {
                                                        model: 'panelPlugin',
                                                        action: 'a',
                                                        mod_name: 'btwaf',
                                                        mod_s: 'clean_waf_drop_ip',
                                                }
                                        }).then(res => {
                                                if (res.status) {
                                                        this.get_safe_logs();
                                                }
                                                app.showReturnInfo(res.status, res.msg, res.status ? res.msg : '提示');
                                        });
                                }
                        }
                });
        },

        // 解封指定ip
        set_safe_uncover_ip:function(e){
                let ip = e.currentTarget.dataset.ip;
                wx.showModal({
                        title: '解封IP:'+ip,
                        content: '是否要从防火墙解封IP:'+ip,
                        success: sm => {
                                if (sm.confirm) {
                                        app.http({
                                                id: this.data.sid,
                                                data: {
                                                        model: 'panelPlugin',
                                                        action: 'a',
                                                        mod_name: 'btwaf',
                                                        mod_s: 'remove_waf_drop_ip',
                                                        ip:ip
                                                }
                                        }).then(res => {
                                                if (res.status) {
                                                        this.get_safe_logs();
                                                }
                                                app.showReturnInfo(res.status, res.msg, res.status ? res.msg : '提示');
                                        });
                                }
                        }
                });
        },

        // 全局配置—设置按钮
        set_state:function(){
                app.showErrorModal('功能开发中，敬请期待。','提示');
        },

        // 滚动事件
        safe_logs_scroll_lower: function (e) {
                console.log('滚动置底')
                if (this.data.btwaf_loading && !this.data.btwaf_loadingComplete){
                        this.data.btwaf_safe_logs_page = this.data.btwaf_safe_logs_page + 1,  //每次触发上拉事件，把searchPageNum+1  
                        this.data.is_initial = false
                        this.get_safe_logs();
                }


        },

        // 下拉事件
        gl_logs_scroll_lower:function(e){
                if (this.data.btwaf_loading && !this.data.btwaf_loadingComplete) {
                        this.data.btwaf_gl_logs_page = this.data.btwaf_gl_logs_page + 1,  //每次触发上拉事件，把searchPageNum+1  
                        this.data.is_initial = false
                        this.get_gl_logs();
                }
        },
})