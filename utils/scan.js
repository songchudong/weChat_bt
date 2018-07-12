var app = getApp()
function scan(_this, where) {
        wx.scanCode({
                success: (res) => {
                        console.log(res);
                        var scan_url = res.result.split("?")[1]
                        var scan_type = res.result.split("?")[2]
                        console.log(scan_type)
                        if (scan_type == 'login') {
                                app.showLoading('登录中');
                                loginPanel(_this, scan_url);
                        }
                        else if (scan_type == 'blind') {
                                app.showLoading('绑定中');
                                blindPanel(scan_url)
                        }
                        else if (where == 'login') {
                                app.showLoading('登录中');
                                loginPanel(_this, scan_url);
                        }
                        else {
                                app.showLoading('绑定中');
                                blindPanel(scan_url)
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