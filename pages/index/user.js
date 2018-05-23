// pages/user.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.getUserInfo()
    console.log(app.globalData.token)
    console.log(app.globalData.userInfo)

  },

  /* 获取用户信息 */
  getUserInfo: function () {
    // console.log(app.globalData.userInfo.wx_info.nickName)
    if (!app.globalData.userInfo.wx_info.nickName) {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo.wx_info = res.userInfo
          wx.setStorageSync('userinfo', app.globalData.userInfo)
          this.setData({
            userInfo: app.globalData.userInfo
          })
          wx.request({
            method: 'POST',
            url: app.server + '/?mod=api&def=encode_userinfo',

            data: {
              token: app.globalData.token,
              data: res.encryptedData,
              iv: res.iv,
              rawData: res.rawData,
              signature: res.signature
            },
            success: function (res) {
              console.log('okk')
            }
          });
        }
      });
    }
  },

  /* 获取面板日志信息 */
  getPanelLog: function () {

    //_this.panelApi(serverList[i].sid, { model: 'system', action: 'GetAllInfo' })
  },


  panelApi: function (sid, pdata) {
    var _this = this
    wx.request({
      url: app.server + '/?mod=send_panel',
      method: 'POST',
      data: {
        sid: sid,
        token: app.globalData.token,
        pdata: JSON.stringify(pdata)
      },
      success: function (res) {
        console.log(sid)
        console.log('panelApi', res.data);
        _this.data.serverInfo[sid] = res.data
        _this.setData({
          serverInfo: _this.data.serverInfo,
        })

      },
    });
  },

  navigateToLogin: function () {
    console.log(app.globalData.userInfo.bt_info.bt_uid)
    if (app.globalData.userInfo.bt_info.bt_uid != 0) {
      wx.showModal({
        title: '您已经绑定了宝塔账号',
        content: '是否需要切换账号',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "../blind/login"
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: "../blind/login"
      })
    }
  }


})