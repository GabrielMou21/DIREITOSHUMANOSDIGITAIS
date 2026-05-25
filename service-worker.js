const CACHE_NAME = 'dh-digital-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'css/app.css',
  'js/app.js',
  'js/db.js',
  'js/quiz.js',
  'js/survey.js',
  'js/reports.js',
  'js/dashboard.js',
  'assets/icon.svg'
];
// Instalação do Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});
// Ativação do Service Worker
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
// Intercepção de requisições (estratégia Cache-First com Fallback de Rede)
self.addEventListener('fetch', (e) => {
  // Ignorar requisições externas (como Google Fonts que têm seu próprio cache)
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Retornar index.html para navegação se offline
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
