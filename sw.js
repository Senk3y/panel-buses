const CACHE_NAME = 'mibus-v1';
const urlsToCache = [
    './', // Cacheamos la raíz para que funcione sin poner /index.html
    './index.html',
    './manifest.json',
    './icono_bus.png'
];

// 1. Instalar el Service Worker y guardar en caché
self.addEventListener('install', event => {
    self.skipWaiting(); // Fuerza a que el SW se active inmediatamente
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Archivos en caché guardados');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Activar el Service Worker y LIMPIAR cachés antiguas (MUY IMPORTANTE)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre de la caché no coincide con la versión actual, la borramos
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Toma el control de las pestañas abiertas inmediatamente
    );
});

// 3. Interceptar peticiones para que funcione offline/rápido
self.addEventListener('fetch', event => {
    // Excluir peticiones a la API para tener siempre datos en tiempo real
    if (event.request.url.includes('api.tmb.cat') || event.request.url.includes('onrender.com')) {
        return; 
    }
    
    // Para el resto de cosas (HTML, iconos, etc.), buscar primero en caché
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en la caché, lo devolvemos al instante
                if (response) {
                    return response;
                }
                // Si no está, lo pedimos a internet normalmente
                return fetch(event.request);
            })
    );
});