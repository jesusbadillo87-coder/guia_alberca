const CACHE_NAME = 'pool-guide-v5';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'pool-hero.jpg',
  'icon-192.png',
  'cleaning-tools.png',
  'Tabla_practica_dosificacion.jpeg',
  'NOM-127-SSA1-2021.html',
  'NOM-018-STPS-2015.html'
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
