const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/trip-notify.js', 'utf8');
const workerSource = fs.readFileSync(__dirname + '/../trip-notify-sw.js', 'utf8');
async function pageCase(permission, supported = true, fail = false) {
  const events = {}, calls = [], status = {}, button = { addEventListener: (name, fn) => events[name] = fn };
  const box = { querySelector: selector => selector === 'button' ? button : status };
  const registration = { active: { state: 'activated' }, showNotification: async (title, options) => calls.push({ title, options }) };
  const context = {
    URL, setTimeout, clearTimeout,
    document: { currentScript: { src: 'https://example.test/guide/scripts/trip-notify.js?v=1' }, getElementById: () => ({ appendChild() {} }), createElement: () => box },
    window: { isSecureContext: true, Notification: {}, ServiceWorkerRegistration: {} },
    ServiceWorkerRegistration: { prototype: { showNotification() {} } },
    Notification: { permission, requestPermission: async () => { calls.push('permission'); return 'granted'; } },
    navigator: { serviceWorker: { register: async (url, options) => { calls.push({ url, options }); if (fail) throw new TypeError('offline'); return registration; } } }
  };
  if (!supported) delete context.window.Notification;
  vm.runInNewContext(source, context);
  assert.equal(calls.length, 0, 'no automatic permission request or worker registration');
  if (events.click) await events.click();
  return { calls, status, button, events };
}
async function workerCase(action, existing) {
  const handlers = {}, calls = []; let pending;
  const client = { url: 'https://example.test/guide/index.html#linfen-pick', navigate: async url => { calls.push(url); return { focus: async () => calls.push('focus') }; } };
  vm.runInNewContext(workerSource, { URL, self: {
    addEventListener: (name, fn) => handlers[name] = fn,
    registration: { scope: 'https://example.test/guide/' },
    clients: { matchAll: async () => existing ? [client] : [], openWindow: async url => calls.push(url) }
  } });
  assert.deepEqual(Object.keys(handlers).sort(), ['activate', 'install', 'notificationclick']);
  handlers.notificationclick({ action, notification: { close: () => calls.push('close'), data: { url: 'https://untrusted.test/' } }, waitUntil: promise => pending = promise });
  await pending;
  return calls;
}
(async () => {
  let result = await pageCase('default');
  assert.equal(result.calls[0], 'permission');
  assert.equal(result.calls[1].url, 'https://example.test/guide/trip-notify-sw.js');
  assert.equal(result.calls[1].options.scope, 'https://example.test/guide/');
  assert.equal(result.calls[2].options.tag, 'trip-20261001-museum');
  assert.equal(result.calls[2].title, '10/1 · 临汾博物馆');
  assert.equal(result.calls[2].options.icon, 'https://example.test/guide/media/d4/bird-he.png');
  assert.equal(result.calls[2].options.data.url, 'https://example.test/guide/index.html#day-4');
  assert.match(result.status.textContent, /下拉通知栏确认/);
  await result.events.click();
  assert.equal(result.calls[5].options.tag, result.calls[2].options.tag);
  result = await pageCase('denied');
  assert.equal(result.calls.length, 0); assert.match(result.status.textContent, /被阻止/);
  result = await pageCase('default', false);
  assert.equal(result.button.disabled, true); assert.match(result.status.textContent, /不支持/);
  result = await pageCase('granted', true, true);
  assert.equal(result.button.disabled, false); assert.match(result.status.textContent, /未成功/);
  assert.deepEqual(await workerCase('dismiss', true), ['close']);
  assert.deepEqual(await workerCase('open', true), ['close', 'https://example.test/guide/index.html#day-4', 'focus']);
  assert.deepEqual(await workerCase('', false), ['close', 'https://example.test/guide/index.html#day-4']);
  console.log('PASS: opt-in only, permission denial, unsupported browser, failure recovery, stable tag, worker navigation/dismiss; no caching or push handlers');
})().catch(error => { console.error(error); process.exitCode = 1; });
