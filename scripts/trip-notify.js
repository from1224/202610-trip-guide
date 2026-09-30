/* Opt-in, immediate local notification only. No push subscription or page caching. */
(function () {
  'use strict';
  var mount = document.getElementById('d4-notification');
  if (!mount) return;
  var box = document.createElement('div');
  box.className = 'trip-notify';
  box.innerHTML = '<button type="button">🔔 随身行程卡</button><details class="notify-help"><summary>通知说明</summary><small>点击立即显示，不是定时提醒；重复点击更新同一条。无需 Google 云推送，也不订阅后台推送。外观由手机系统控制，不保证常驻；其他浏览器需支持通知 API。Chrome 名称和系统按钮不能隐藏。</small><small><a href="https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification" target="_blank" rel="noopener">通知接口说明</a></small></details><small role="status" aria-live="polite"></small>';
  mount.appendChild(box);
  var button = box.querySelector('button');
  var status = box.querySelector('[role="status"]');
  var base = new URL('../', document.currentScript.src);
  var supported = window.isSecureContext && 'Notification' in window && 'serviceWorker' in navigator && 'ServiceWorkerRegistration' in window && 'showNotification' in ServiceWorkerRegistration.prototype;
  if (!supported) {
    button.disabled = true;
    status.textContent = '当前环境不支持通知；请用支持通知的浏览器打开 HTTPS 线上页面。安卓 Chrome 已实测可用，其他浏览器待实测。';
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
      await registration.showNotification('10/1 · 临汾博物馆', {
        body: '09:00–17:00 ｜ 16:00停入\n公益讲解 09:30 / 12:00 / 14:30',
        icon: new URL('media/d4/bird-he.png', base).href,
        tag: 'trip-20261001-museum',
        lang: 'zh-CN',
        silent: true,
        requireInteraction: true,
        data: { url: new URL('index.html#day-4', base).href },
        actions: [{ action: 'open', title: '路线 · 看展' }, { action: 'dismiss', title: '清除' }]
      });
      status.textContent = '已发送，请下拉通知栏确认；未出现时检查浏览器和系统通知权限。';
    } catch (error) {
      status.textContent = '通知未成功（' + (error.name || 'Error') + '）。请确认网络正常、Chrome及本站允许通知后重试；行程页面仍可正常使用。';
    } finally { button.disabled = false; }
  });
})();
