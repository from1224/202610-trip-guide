/* Explicit user click only; imports a draft, never auto-posts a notification. */
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
    button.textContent = '发送到原生行程卡 ↗';
    button.href = link(data);
    button.className = 'lnk';
    var note = document.createElement('small');
    note.textContent = '需先安装 0.4 APK · 打开 App 后选样式并发送 · 测试卡保留 10 分钟';
    box.appendChild(button); box.appendChild(note); target.prepend(box);
  }
  mount(document.getElementById('d4-notification'), {
    title: '临汾博物馆', time: '09:00', body: '09:00–17:00 开放 · 16:00 停入\n公益讲解 09:30 / 12:00 / 14:30'
  });
  mount(document.querySelector('#linfen-tonight .tl-c'), {
    title: '华门嘉年华', time: '17:00', body: '17:00 饽糕 · 羊汤\n18:15 鼓楼 → 19:30 财神楼',
    place: '华门', lat: '36.052041', lon: '111.488056'
  });
})();
