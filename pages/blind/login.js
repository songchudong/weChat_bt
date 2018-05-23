// pages/server/login.js
const app = getApp()
const utilMd5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    password: null,
    hiddenLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /* 绑定宝塔账号 */
  BlindBtAccount: function (username, password) {
    console.log(utilMd5.hexMD5(password))
    var _this = this;
    wx.request({
      url: app.server + '/?mod=login',
      method: "POST",
      data: {
        username: username,
        password: utilMd5.hexMD5(password),
        token: app.globalData.token,
      },
      success: function (res) {
        console.log(res)
        _this.setData({ hiddenLoading: true });
        if (res.data.status != false) {
          console.log(app.globalData.userInfo.bt_info)
          app.globalData.userInfo.bt_info = {
            bt_username: res.data.username,
            bt_uid: res.data.uid
          }
          wx.setStorageSync('userinfo', app.globalData.userInfo)
          app.showReturnInfo(true, '', '登录成功');
          setTimeout(function () {
            wx.switchTab({
              url: "/pages/index/index",
              fail: function (res) { console.log(res) },
            })
          }, 1000)

        } else {
          app.showReturnInfo(res.data.status, res.data.msg, '登录失败');
        }

      },

    })

  },
  formSubmit: function (e) {
    var username = e.detail.value.username;
    var password = e.detail.value.password;
    var tiem = null;
    var _this = this;
    wx.getSetting({
      success: (res) => {
        tiem = setInterval(function(){
          wx.getSetting({
            success: (res) => {
              console.log(res);
              if (res.authSetting['scope.userInfo']) {
                clearInterval(tiem);
                if (!password || !username) {
                  app.showReturnInfo(false, '手机及密码不能为空', '登录失败');
                } else {
                  _this.setData({
                    hiddenLoading:false
                  })
                  _this.BlindBtAccount(username, password);
                }
              }
            }
          });
        },400);
      }
    });
  },
  userinput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  pwinput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  resetName: function () {
    this.setData({
      username: null
    })
  },
  resetPwd: function () {
    this.setData({
      password: null
    })
  }
})