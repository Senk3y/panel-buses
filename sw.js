// ¡ATENCIÓN! Cambiamos a v2 para forzar que se borre la caché antigua atascada
const CACHE_NAME = 'mibus-v2'; 
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icono_bus.png'
];

// 1. Instalar el Service Worker...
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 2. Activar y limpiar cachés antiguas...
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Interceptar peticiones
self.addEventListener('fetch', event => {
    // AQUÍ ESTÁ LA MAGIA: Añadimos la palabra clave de la API de AMB
    // (Ajusta 'ambmobilitat' o 'amb' según sea la URL exacta a la que llamas)
    if (event.request.url.includes('api.tmb.cat') || 
        event.request.url.includes('onrender.com') ||
        event.request.url.includes('amb')) { 
        return; // No cachear, ir a internet siempre
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});