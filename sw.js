const CACHE_NAME = 'conversor-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];

// Instalar el Service Worker y guardar los archivos en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Interceptar las peticiones para servir desde caché si no hay internet
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones a la API de tasas (esas siempre deben ir a internet)
  if (e.request.url.includes('bcvhoy.com') || e.request.url.includes('cromstudio.com.ve')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});