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
    var heading = target.querySelector('.h');
    if (!heading) return;
    var button = document.createElement('a');
    button.textContent = '🔔';
    button.href = link(data);
    button.className = 'trip-bell';
    button.setAttribute('aria-label', '发送' + data.title + '行程卡');
    button.title = '发送' + data.title + '行程卡';
    heading.appendChild(button);
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
  if (first && transfer && concert && hotel) {
    transfer.id = 'tonight-transfer'; concert.id = 'tonight-concert'; hotel.id = 'tonight-hotel';
    var route = document.createElement('figure');
    route.className = 'tonight-route';
    route.setAttribute('aria-label', '今晚路线示意，按时间排序，非地理比例图');
    route.innerHTML = '<figcaption><span>今晚 · 吃饭与夜游</span><small>时间路线图 · 非地理比例</small></figcaption>' +
      '<ol><li><a href="#linfen-tonight"><time>17:00</time><b>华门嘉年华</b><span>饽糕 · 换家羊汤</span></a><em>↓ 打车约5.8 km · 预留25分钟</em></li>' +
      '<li><a href="#tonight-transfer"><time>18:15 出发</time><b>鼓楼 → 鼓楼东大街</b><span>进城后步行逛街</span></a><em>↓ 财神楼北街口 · 步行距离待核</em></li>' +
      '<li><a href="#tonight-concert"><time>19:30</time><b>财神庙阳台音乐会</b><span>路口东北角 · 现场确认场次</span></a><em>↓ 打车回酒店 · 连叫车预留25分钟</em></li>' +
      '<li><a href="#tonight-hotel"><time>散场</time><b>桔子酒店</b><span>临汾高铁西站店</span></a></li></ol>' +
      '<details><summary>铃铛怎么用 · 时间说明</summary><p>点节点标题旁绿色铃铛，App 0.7 发送 C 卡；替换上一张，最长3小时。17:00与18:15是建议时间，19:30来自既有场次公告，非实时确认；道路距离为旧模型估算。</p></details>';
    first.parentNode.insertBefore(route, first);
    [first, transfer, concert, hotel].forEach(function (node) {
      var content = node.querySelector('.tl-c');
      var notes = Array.from(content.children).filter(function (el) { return el.classList.contains('n'); });
      if (notes.length < 2) return;
      var drawer = document.createElement('details'); drawer.className = 'd4-drawer';
      var summary = document.createElement('summary'); summary.textContent = '补充安排与来源'; drawer.appendChild(summary);
      notes.slice(1).forEach(function (note) { drawer.appendChild(note); });
      content.appendChild(drawer);
    });
  }
})();
