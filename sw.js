const CACHE_NAME = 'conversor-cache-v13'; // Sube este número en cada cambio importante
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar y forzar a que pase a espera/activación rápida
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Borrar cachés antiguas y tomar control de los clientes
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar peticiones: APIs directo a red; HTML/assets con Network First + fallback a caché
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  if (url.includes('bcvhoy.com') || url.includes('cromstudio.com.ve')) {
    return;
  }

  if (e.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copia = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copia));
          }
          return networkRes;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Para otros recursos (íconos, librerías, etc.): caché primero y luego red
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && e.request.method === 'GET') {
          const copia = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copia));
        }
        return networkRes;
      });
    })
  );
});
 = 'conversor-cache-v12'; // Cambia el número si haces cambios grandes
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
