
var context = wx.createContext();
var color = ['#fe8c00', '#1e90ff']
var y_b = 30
var x_b = 30
// 起始点X坐标
var startX = x_b;
// 起始点y坐标 
var startY = 160 + y_b;
// 起始点y坐标
var endY = 0;
// 终点x坐标


function charts(datas, canvasId, categories) {
  var endX = wx.getSystemInfoSync().windowWidth - x_b;

  // 坐标轴 横线数目 不包括坐标轴
  var line_count = 4
  // 每条横线之间的 间距
  var line_distance = (startY - y_b) / line_count
  var max_data = 0
  var min_data = 0
  // 计算传入数据中的 最大值 最小值
  for (var i in datas) {
    for (var key in datas[i]) {
      var max = Math.max.apply(null, datas[i][key])
      var min = Math.min.apply(null, datas[i][key])
      if (max > max_data) {
        max_data = max
      }
      if (min < min_data) {
        min_data = max
      }
    }
  }

  // console.log('max_data', max_data)
  // console.log('min_data', min_data)

  // 计算第一条横线的 纵坐标值
  var min_ordinate = Math.ceil(max_data / line_count)
  var eachSpacing = Math.floor((endX - startX) / categories.length);
  var points = [];


  // 计算每个分类的起始点x坐标
  categories.forEach(function (item, index) {
    points.push(startX + index * eachSpacing);
  });
  points.push(endX);

  // 绘制横线
  context.beginPath();
  if (max_data >= 1000){
    context.setFontSize(12);
  }else{
    context.setFontSize(14);
  }
  
  context.setLineWidth(0.8)
  
  for (var i = 0; i < line_count + 1; i++) {
    /* 打印标记的横线 */
    //console.log(i * min_ordinate, startY - line_distance * i)
    var y_text = i * min_ordinate
    if (i * min_ordinate >= 10000) {
      y_text = (i * min_ordinate / 10000).toFixed(1) + 'w'
      console.log(y_text)
    } 
    context.fillText(y_text, 0, startY - line_distance * i)
    context.moveTo(startX, startY - line_distance * i)
    context.lineTo(endX, startY - line_distance * i)
  }
  context.setStrokeStyle("#dddddd");
  context.closePath();
  context.stroke();

  // 绘制横坐标轴的 参数
  context.beginPath();
  context.setFontSize(13);
  context.setStrokeStyle('#666666');
  categories.forEach(function (item, index) {
    context.fillText(item, points[index], startY + 25);
  });
  context.closePath();
  context.stroke();


  // 绘制 颜色指示的类型
  if (datas.length != 1) {

    var fontsize = 11.5

    for (var i = 0; i < datas.length; i++) {
      for (var name in datas[i]) {
        var wordsize = name.length * fontsize + 40
        var start_point = endX - wordsize * (i + 1) - 20

        context.beginPath();
        context.setFontSize(12);
        context.setFillStyle(color[i]);
        context.setStrokeStyle(color[i]);
        context.setLineWidth(1.8);
        context.rect(start_point + 30, y_b / 3, 8, 8)
        context.fillText(name, start_point + 45, y_b / 3 + 9);
        context.fill();
        context.closePath();
        context.stroke();
      }

    }
  }

  // 绘制曲线
  for (var i in datas) {
    for (var key in datas[i]) {
      var data = datas[i][key]
      context.beginPath();
      context.setLineWidth(1.5);
      var interval_value = (startY - y_b) / (min_ordinate * line_count)
      var interval_time = (endX - startX) / data.length

      context.setMiterLimit(5);
      data.forEach(function (item, index) {
        context.lineTo(index * interval_time + startX, startY - item * interval_value)
      });
      context.setStrokeStyle(color[i]);
      context.stroke();
    }
  }


  wx.drawCanvas({
    canvasId: canvasId,
    actions: context.getActions()
  });

}

function loading(canvasId) {
  var endX = wx.getSystemInfoSync().windowWidth - x_b;
  context.beginPath();
  context.setFontSize(13);
  context.setFillStyle('#666666');
  context.fillText('加载中...', (endX - startX) / 2, (startY - endY) / 2)
  context.stroke();
  wx.drawCanvas({
    canvasId: canvasId,
    actions: context.getActions()
  });

}
module.exports = {
  charts: charts,
  loading: loading
}  