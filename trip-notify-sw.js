/* Notification-only worker: intentionally no fetch/cache, push, or timer handlers. */
'use strict';
self.addEventListener('install', function (event) { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;
  // Fixed same-origin destination: never follow arbitrary notification payload URLs.
  var target = new URL('index.html#day-4', self.registration.scope).href;
  event.waitUntil((async function () {
    var windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var client of windows) {
      var url = new URL(client.url);
      if (url.origin === new URL(target).origin && url.href.startsWith(self.registration.scope)) {
        try {
          var navigated = await client.navigate(target);
          if (navigated) { await navigated.focus(); return; }
        } catch (_) { /* A closed/unavailable tab can fall back to a new one. */ }
      }
    }
    await self.clients.openWindow(target);
  })());
});
