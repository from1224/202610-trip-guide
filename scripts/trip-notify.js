/* Opt-in, immediate local notification only. No push subscription or page caching. */
(function () {
  'use strict';
  var heading = Array.from(document.querySelectorAll('#day-4 .tl-c > .h')).find(function (h) {
    return h.textContent.trim() === '临汾市博物馆 · 按自己的节奏看';
  });
  if (!heading) return;
  var box = document.createElement('div');
  box.className = 'trip-notify';
  box.innerHTML = '<button type="button">🔔 放到通知栏 · 试用</button><small>点击后立即发送，不是定时闹钟；可手动清除，不保证常驻。</small><small role="status" aria-live="polite"></small>';
  heading.parentElement.appendChild(box);
  var button = box.querySelector('button');
  var status = box.querySelector('[role="status"]');
  var base = new URL('../', document.currentScript.src);
  var supported = window.isSecureContext && 'Notification' in window && 'serviceWorker' in navigator && 'ServiceWorkerRegistration' in window && 'showNotification' in ServiceWorkerRegistration.prototype;
  if (!supported) {
    button.disabled = true;
    status.textContent = '当前浏览器不支持此通知方式；请在安卓 Chrome 普通标签页打开。';
    return;
  }
  function waitActive(registration) {
    if (registration.active && registration.active.state === 'activated') return Promise.resolve(registration);
    var worker = registration.installing || registration.waiting || registration.active;
    if (!worker) return Promise.reject(new Error('worker-missing'));
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { finish(new Error('activation-timeout')); }, 12000);
      function finish(error) { clearTimeout(timer); worker.removeEventListener('statechange', check); error ? reject(error) : resolve(registration); }
      function check() { if (worker.state === 'activated') finish(); else if (worker.state === 'redundant') finish(new Error('worker-redundant')); }
      worker.addEventListener('statechange', check);
      check();
    });
  }
  button.addEventListener('click', async function () {
    button.disabled = true;
    try {
      // Request directly in the user gesture, before network/registration awaits.
      var permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        status.textContent = permission === 'denied'
          ? '通知被阻止。可在 Chrome 此网站权限中允许通知，并检查手机设置中 Chrome 的通知开关。不会反复弹窗。'
          : '尚未允许通知，没有发送；想试时可再点击。';
        return;
      }
      status.textContent = '正在准备行程通知…';
      var registration = await navigator.serviceWorker.register(new URL('trip-notify-sw.js', base).href, { scope: base.href, updateViaCache: 'none' });
      await waitActive(registration);
      await registration.showNotification('D4 · 10月1日 · 临汾博物馆', {
        body: '带身份证｜09:00–17:00开放，16:00停入。入馆预约出发前确认。点此返回今日行程。',
        tag: 'trip-20261001-museum',
        lang: 'zh-CN',
        silent: true,
        requireInteraction: true,
        data: { url: new URL('index.html#day-4', base).href },
        actions: [{ action: 'open', title: '查看 D4' }, { action: 'dismiss', title: '清除' }]
      });
      status.textContent = '已交给 Chrome 发送，请下拉通知栏确认。未出现时检查 Chrome 和系统通知权限；重复点击更新同一条，不堆叠。';
    } catch (error) {
      status.textContent = '通知未成功（' + (error.name || 'Error') + '）。请确认网络正常、Chrome及本站允许通知后重试；行程页面仍可正常使用。';
    } finally { button.disabled = false; }
  });
})();
