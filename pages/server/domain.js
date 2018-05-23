var app = getApp()

Page({
  data: {
    domain_info:null,
    domain_list: []
  },
  // 生命函数 - 
  onLoad: function (param) {
    this.setData({
      domain: param.domain,
      id: param.id,
      sid: param.sid
    });
    console.log(param);
    this.get_domain_list();
  },
  // 获取域名列表
  get_domain_list:function(){
    app.http({
      id:this.data.sid,
      data:{
        model: 'data',
        action: 'getData',
        table:'domain',
        list:'True',
        search: this.data.id
      }
    }).then(res=>{
      this.setData({
        domain_list:res
      })
    });
  },
  // 添加域名
  add_domain:function(e){
    let domain = e.detail.value.name,
        port = e.detail.value.port;
    port == '' ? port = 80 : port;
    if (domain == ''){
      app.showReturnInfo(false, '域名不能为空！','提示');
      return false;
    }
    app.http({
      id:this.data.sid,
      data:{
        model: 'panelSite',
        action: 'AddDomain',
        domain: port == '' ? domain : (domain + ':' + port),
        webname: this.data.domain,
        id:this.data.id
      }
    }).then(res=>{
      
      app.showReturnInfo(false,res.msg,'提示');
      this.setData({domain_info:null});
      this.get_domain_list();

    }).catch(res=>{
      this.setData({ domain_info: null });
    });
  },
  // 删除域名
  del_domain:function(e){
    let index = e.currentTarget.dataset.index,
        domain_list = this.data.domain_list;
    if (domain_list.length == 1){
      app.showErrorModal('最后一个域名不能删除!','警告');
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '您真的要从站点中删除这个域名吗？',
      success: sm => {
        if (sm.confirm) {
          app.http({
            id: this.data.sid,
            data: {
              model: 'panelSite',
              action: 'DelDomain',
              id: this.data.id,
              webname: this.data.domain,
              domain: domain_list[index].name,
              port: domain_list[index].port
            }
          }).then(res => {
            this.get_domain_list();
            app.showReturnInfo(true,'',res.msg);
          })
        } else if (sm.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  }
});