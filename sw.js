const CACHE_NAME = 'conversor-cache-v6'; // Cambia el número si haces cambios grandes
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];

// Instalar y forzar a que se active de inmediato
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Fuerza la actualización
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Limpiar cachés viejas cuando se active la nueva
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('bcvhoy.com') || e.request.url.includes('cromstudio.com.ve')) {
    return; // Las APIs siempre van a internet
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
