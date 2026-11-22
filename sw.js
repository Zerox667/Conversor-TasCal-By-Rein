const CACHE_NAME = 'conversor-cache-v17'; // Cambia este número en cada versión nueva
const STATIC_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // APIs de tasas siempre directo a red
  if (url.hostname.includes('bcvhoy.com') || url.hostname.includes('cromstudio.com.ve')) {
    return;
  }

  // Para la página principal y navegación: intentar red primero (siempre fresco en GitHub)
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((networkRes) => {
          const copia = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
          return networkRes;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Otros recursos: caché primero con respaldo a red
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((networkRes) => {
        if (req.method === 'GET' && networkRes.ok) {
          const copia = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        }
        return networkRes;
      });
    })
  );
});
