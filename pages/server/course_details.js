// pages/server/course_details.js
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pid:null,
    sid:null,
    course_info:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      sid:options.sid,
      pid:options.pid
    });
    console.log(options)
    this.get_course_list();
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
  
  },
  get_course_list: function () {
    app.http({
      id: this.data.sid,
      data: {
        model: 'panelPlugin',
        action: 'a',
        mod_name: 'task_manager',
        mod_s:'get_process_info',
        pid: this.data.pid
      }
    }).then(res => {
      app.showReturnInfo(true, '提示', '获取成功！');
      this.setData({
        course_info: res
      })
    })
  }
})