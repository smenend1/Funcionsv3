const CACHE_NAME = 'mathengine-cache-v5';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instal·lació: Guarda els fitxers a la memòria cau
self.addEventListener('install', event => {
  self.skipWaiting(); // Força que el nou SW s'activi immediatament
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching fitxers de la versió v3');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activació: Esborra memòries cau antigues (v1, v2...)
self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('Esborrant memòria cau antiga:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
    );
    return self.clients.claim(); // Pren el control de la pàgina immediatament
});

// Fetch: Serveix els fitxers des de la memòria cau si no hi ha connexió
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
