let app = getApp();
Page({

        /**
         * 页面的初始数据
         */
        data: {
                sid: null,
                site_name: null,
                site_logs_date:[],
                site_toDate:0,
                site_logs_list: [],
                site_logs_page: 1,
                btwaf_loading:false,
                btwaf_loadingComplete:false,
                is_initial: true//是否初始获取数据
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
                this.setData({
                        sid: options.sid,
                        site_name: options.site
                });
                wx.setNavigationBarTitle({ title: '日志管理 -- ' + options.site});
        },

        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function () {
                this.get_site_logs_date();
        },

        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function () {

        },

        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide: function () {

        },

        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload: function () {

        },
        // 获取日志时间列表
        get_site_logs_date: function () {
                app.http({
                        id:this.data.sid,
                        data:{
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name:'btwaf',
                                mod_s:'get_logs_list',
                                siteName:this.data.site_name
                        }
                }).then(res=>{
                        console.log(res);
                        if (res.length > 0){
                                this.data.site_toDate = 0;
                                this.setData({
                                        site_logs_date: res,
                                        site_logs_page:1,
                                        is_initial:true
                                });
                                this.get_site_logs_list();
                        }
                });
        },
        // 切换日志周期
        bindPickerChange:function(e){
                console.log(e);
                var picker_value = e.detail.value;
                this.setData({site_toDate: e.detail.value});
                this.get_site_logs_list();
        },
        // 获取站点日志列表
        get_site_logs_list:function(){
                console.log();
                app.http({
                        id: this.data.sid,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_safe_logs',
                                siteName: this.data.site_name,
                                toDate: this.data.site_logs_date[this.data.site_toDate] ,
                                p: this.data.site_logs_page
                        }
                }).then(res => {
                        if (res.length != 10) {
                                this.setData({
                                        site_logs_list:res,
                                        btwaf_loading: false,
                                        btwaf_loadingComplete: true
                                });
                        } else {
                                if (this.data.is_initial) {
                                        this.data.site_logs_list = res;
                                } else {
                                        this.data.site_logs_list = this.data.site_logs_list.concat(res);
                                }
                                 this.setData({
                                        site_logs_list: this.data.site_logs_list,
                                        btwaf_loading: true,
                                        btwaf_loadingComplete: false
                                });
                        }
                });
        },
        // 日志详情视图
        logs_details_view:function(e){
                let index = e.currentTarget.dataset.index;
                let detailsData6 = this.data.site_logs_list[index][6].split(" &gt;&gt; ")
                let detailsData6_1 = detailsData6[1]
                if (detailsData6_1 == undefined) detailsData6_1 = '空';
                let detailsData7 =  detailsData6_1.match(new RegExp(detailsData6[0].replace(/\//g, '\\/'), 'i'));
                detailsData7 = (detailsData7 ? detailsData7[0]:'空');
                let logs = this.data.site_logs_list[index].join('-^-^-');
                logs = logs +'-^-^-' + detailsData6_1 + '-^-^-' + detailsData7;
                wx.navigateTo({
                        url: '/pages/server/site_logs_details?logs=' + escape(logs) + '&site=' + this.data.site_name,
                        fail: function (res) {
                                app.showErrorModal('页面加载失败');  
                        }
                })
        } ,
        /**
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function () {

        },

        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function () {
                if (this.data.btwaf_loading && !this.data.btwaf_loadingComplete) {
                        this.data.site_logs_page = this.data.site_logs_page + 1,  //每次触发上拉事件，把searchPageNum+1 
                        this.data.is_initial = false;
                        this.get_site_logs_list();
                }
        },

        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function () {

        }
})