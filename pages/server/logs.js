var app = getApp();

Page({
      data: {
            logsData: null,
            sid: null,
            domain: null
      },
      // 生命函数 - 
      onLoad: function (option) {
            console.log(option);
            this.setData({
                  domain: option.domain,
                  sid: option.sid
            });
            this.get_logs_list();
      },
      get_logs_list: function () {
            app.http({
                  id: this.data.sid,
                  data: {
                        model: 'panelSite',
                        action: 'GetSiteLogs',
                        siteName: this.data.domain,
                  }
            }).then(res => {
                  app.showReturnInfo(true, '提示', '获取成功！');
                  this.setData({
                        logsData: res.msg
                  })
                  // setTimeout(function(){
                        this.pageScrollToBottom();
                  // },3000);

            })
      },
      pageScrollToBottom: function () {
            wx.createSelectorQuery().select('#j_page').boundingClientRect(function (rect) {
                  console.log(rect);
                  // 使页面滚动到底部
                  wx.pageScrollTo({
                        scrollTop: rect.bottom
                  })
            }).exec()
      },
});