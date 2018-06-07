let app = getApp();
Page({

        /**
         * 页面的初始数据
         */
        data: {
                sid: null,
                site_name: null,
                site_logs_date:[],
                site_toDate:null,
                site_logs_list: [],
                site_logs_page: 1,
                btwaf_loading:false,
                btwaf_loadingComplete:false,
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
                                this.data.site_toDate = res[0];
                                this.get_site_logs_list();
                                this.setData({site_logs_date: res});
                        }
                });
        },
        get_site_logs_list:function(){
                app.http({
                        id: this.data.sid,
                        data: {
                                model: 'panelPlugin',
                                action: 'a',
                                mod_name: 'btwaf',
                                mod_s: 'get_safe_logs',
                                siteName: this.data.site_name,
                                toDate:this.data.site_toDate,
                                p: this.data.site_logs_page
                        }
                }).then(res => {
                        if (res.length <10){
                                this.setData({
                                        btwaf_loadingComplete: true
                                })
                        }
                        this.setData({
                                site_logs_list: res
                        })
                });
        },
        logs_details_view:function(e){
                let index = e.currentTarget.dataset.index;
                // console.log();
                let logs = this.data.site_logs_list[index].join('-^-^-')
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

        },

        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function () {

        }
})