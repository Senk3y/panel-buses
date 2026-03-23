const CACHE_NAME = 'mibus-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icono_bus.png'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptar peticiones para que funcione offline/rápido
self.addEventListener('fetch', event => {
  // No cacheamos las peticiones a la API (queremos datos en tiempo real)
  if (event.request.url.includes('api.tmb.cat') || event.request.url.includes('onrender.com')) {
      return; 
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});