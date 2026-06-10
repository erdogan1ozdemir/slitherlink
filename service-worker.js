// Slitherlink PWA service worker — cache-first shell, network-first dynamic
const VERSION = 'slitherlink-shell-v7';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Google Fonts: network-first, fallback to cache
  if (url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Same-origin: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // External: network only
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
