// BORRA TODO TU SW.JS ACTUAL Y REEMPLÁZALO POR COMPLETO CON ESTO:
const CACHE_NAME = 'r02-v4002-sistema-ok';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './brigadistas.js',
    './app.js',
    './manifest.json'
];

// Instalación e inyección limpia de archivos obligatorios
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Limpieza automática de cachés viejos
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de red: Intenta ir a internet, si no hay, usa la caché
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request);
        })
    );
});
