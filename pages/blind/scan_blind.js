// pages/blind/scan.js
var app = getApp()
var scan = require('../../utils/scan.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,'lllllllllllllllllllllll');
  },



  /* 扫码绑定面板 */
  scan: function () {
    scan.scan(this, 'blind')
  }

})