// pages/login_panel.js
var app = getApp()
var scan = require('../../utils/scan.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginS: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // scan.scan(this, 'login')
  },



  onHide: function () {
    /* 页面隐藏时跳出循环 */
    this.setData({
      loginS: false
    })
  },


  scan: function () {
    scan.scan(this, 'login')
  },


  goHome: function () {
    wx.switchTab({
      url: '../../pages/index/index',
    })
  },

})