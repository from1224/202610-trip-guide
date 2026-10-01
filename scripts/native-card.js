/* Explicit user click requests C notification through installed app 0.7+. */
(function () {
  'use strict';
  function link(data) {
    var query = new URLSearchParams(data).toString();
    return 'intent://import?' + query + '#Intent;scheme=tripcard;package=com.xiaocai.tripcard;end';
  }
  if (typeof module !== 'undefined') { module.exports = link; return; }
  function mount(target, data) {
    if (!target) return;
    var box = document.createElement('div');
    box.className = 'trip-notify';
    var button = document.createElement('a');
    button.textContent = data.send ? '🔔 一键发送 C 行程卡' : '导入行程卡';
    button.href = link(data);
    button.className = 'lnk';
    var note = document.createElement('small');
    note.textContent = data.send ? '需 App 0.7 · 点击即发，替换上一张 · 最长 3 小时，可手动结束' : '导入后手动发送';
    box.appendChild(button); box.appendChild(note); target.prepend(box);
  }
  mount(document.querySelector('#linfen-tonight .tl-c'), {
    send: '1',
    title: '华门嘉年华', time: '17:00', body: '17:00 饽糕 · 羊汤\n18:15 鼓楼 → 19:30 财神楼',
    place: '华门', lat: '36.052041', lon: '111.488056'
  });
  var first = document.getElementById('linfen-tonight');
  var transfer = first && first.nextElementSibling;
  var concert = transfer && transfer.nextElementSibling;
  var hotel = concert && concert.nextElementSibling;
  mount(transfer && transfer.querySelector('.tl-c'), {
    send:'1', title:'鼓楼 → 财神楼', time:'18:15', body:'打车去鼓楼 · 转场预留25分钟\n鼓楼东大街 → 财神楼北街口',
    place:'临汾鼓楼',lat:'36.082764',lon:'111.513323'
  });
  mount(concert && concert.querySelector('.tl-c'), {
    send:'1', title:'财神庙 · 阳台音乐会', time:'19:30', body:'鼓楼东大街 × 财神楼北街东北角\n现场确认场次 · 舞台坐标未核定'
  });
  mount(hotel && hotel.querySelector('.tl-c'), {
    send:'1', title:'回桔子酒店', time:'散场', body:'打车回临汾高铁西站店\n连叫车建议预留25分钟',
    place:'桔子酒店(临汾高铁西站店)',lat:'36.098572',lon:'111.473471'
  });
})();
