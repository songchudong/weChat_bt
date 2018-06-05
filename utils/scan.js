var app = getApp()
function scan(_this, where) {
  wx.scanCode({
    success: (res) => {

      var data = res.result.split("?")
      console.log(data[2])

      if (data[2] == 'login') {
        app.showLoading('登录中');
        loginPanel(_this, data[1]);
      }
      else if (data[2] == 'blind') {
        app.showLoading('绑定中');
        blindPanel(data[1])
      }
      else if (where == 'login') {
        app.showLoading('登录中');
        loginPanel(_this, data[1]);
      }
      else {
        app.showLoading('绑定中');
        blindPanel(data[1])
      }


    }
  })
}

function loginPanel(_this, data) {
  wx.request({
    url: app.server + '/?mod=scan_login&token=' + app.globalData.token + data,
    method: "GET",
    success: function (res) {
      wx.hideLoading()
      if (res.data.status) {
        _this.setData({
          loginS: true
        })
        app.showReturnInfo(true, '', '登录成功')
      } else {
        app.showReturnInfo(false, '可能未绑定服务器面板', '登录失败')
      }
    },
  })
}



function blindPanel(data) {
        console.log(app.server + '/?mod=bind_panel&' + data + '&token=' + app.globalData.token)
        
  wx.request({
    url: app.server + '/?mod=bind_panel&' + data + '&token=' + app.globalData.token,
    method: "GET",
    success: function (res) {
            console.log(res)
      wx.hideLoading();
      if (res.data) {
        app.showReturnInfo(res.data.status, res.data.msg)
        if (res.data.status == true) {
          setTimeout(function () {
            wx.switchTab({
              url: "/pages/index/index",
              fail: function (res) { console.log(res) },
            })
          }, 5000)
        }
      } else {
        app.showReturnInfo(false, '绑定面板超时，请稍后重试')
      }
    },
    complete: function (res) {
      
    }
  })
}

module.exports = {
  scan: scan
}  