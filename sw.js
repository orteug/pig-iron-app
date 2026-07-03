const CACHE = 'pig-iron-v31';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHtml = url.pathname === '/' || url.pathname.endsWith('.html');

  if (isHtml) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});

// Timer notification — fires when app is backgrounded with an active timer
let timerTimeout = null;
self.addEventListener('message', e => {
  if (e.data?.type === 'TIMER_SCHEDULE') {
    clearTimeout(timerTimeout);
    const delay = Math.max(0, e.data.delayMs);
    timerTimeout = setTimeout(() => {
      self.registration.showNotification('Rest over — GO!', {
        body: 'Your rest timer is complete. Time to lift.',
        silent: false,
        vibrate: [300, 100, 300],
      });
    }, delay);
  }
  if (e.data?.type === 'TIMER_CANCEL') {
    clearTimeout(timerTimeout);
    timerTimeout = null;
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      if (cs.length) return cs[0].focus();
      return clients.openWindow('/');
    })
  );
});
