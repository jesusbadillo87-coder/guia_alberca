const CACHE_NAME = 'pool-guide-v3';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'pool-hero.jpg',
  'icon-192.png',
  'cleaning-tools.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
