// ─── VERSION ─────────────────────────────────────────────────────────────────
// Cada vez que se actualice la app este número cambia automáticamente.
// El navegador detecta el cambio y descarga la versión nueva en todos los
// dispositivos sin que el usuario tenga que borrar datos manualmente.
const CACHE_VERSION = 'pool-guide-v6';

// ─── ARCHIVOS A CACHEAR ───────────────────────────────────────────────────────
const ASSETS = [
  '/',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'pool-hero.jpg',
  'pool-equipment.jpg',
  'pool-parts.jpg',
  'cleaning-tools.png',
  'pool_cleaning.png',
  'pool_disinfection.png',
  'pool_rules.png',
  'pool_safety.png',
  'user_hygiene.png',
  'water_quality.png',
  'safety-epp.jpg',
  'Tiras_reactivas.jpeg',
  'Colorimetro.jpeg',
  'Herramienta_digital.jpeg',
  'Mantenimiento_diario.jpeg',
  'Mantenimiento_semanal.jpeg',
  'Principios_segurdiad.jpeg',
  'Tabla_practica_dosificacion.jpeg',
  'Partes_alberca_1.jpg',
  'desinfeccion.jpeg',
  'desinfeccion_2.jpeg',
  'productos-de-limpieza-para-albercas-1024x683.webp',
  'NOM-127-SSA1-2021.html',
  'NOM-018-STPS-2015.html',
  'NOM_230_SSA1_2002.pdf',
  'NOM-017-STPS-2008.pdf'
];

// ─── INSTALL: pre-cachear recursos ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // Forzar activación inmediata sin esperar a que cierren las pestañas
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE: eliminar cachés antiguas ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)  // todas menos la actual
          .map((name) => {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Tomar control de todos los clientes (pestañas/apps abiertas) inmediatamente
      return self.clients.claim();
    })
  );
});

// ─── FETCH: Network First (siempre intenta red, caché como respaldo) ──────────
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la red respondió OK, guardar en caché y devolver
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Sin red: servir desde caché (modo offline)
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Sin conexión y sin caché disponible.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
