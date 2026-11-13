const CACHE = 'sora-headache-v10';
const FILES = ['./', './index.html', './latest.html', './manifest.webmanifest', './icon.svg', './apple-touch-icon-v6.png', './icon-192-v6.png', './icon-512-v6.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  const save = response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  };
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(save).catch(() =>
      caches.match(event.request).then(cached => cached || caches.match('./index.html'))
    ));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached =>
    cached || fetch(event.request).then(save)
  ));
});

