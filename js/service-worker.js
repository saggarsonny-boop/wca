// Service Worker for Blue Collar Diner PWA
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('bcd-cache-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './css/style.css',
        './assets/favicon.svg',
        './assets/portrait.jpg',
        './assets/portrait.webp'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
