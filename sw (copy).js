const CACHE_NAME = 'maher-coffee-v500-final';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './qahwaji-logo.glb',
  './icon-192.png',
  './icon-512.png',
  './milkshake.png',
  './5960730354593238429.jpg',
  './icetea_maher.jpg',
  './espresso_maher.jpg',
  './cortado_maher.jpg',
  './cookie-mission.html',
  './cookie.jpg'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate Event
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

// Fetch Event
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // NEVER cache API requests, non-GET, or cross-origin requests
  if (e.request.method !== 'GET' || !url.startsWith(self.location.origin) || url.includes('/api/')) {
    return;
  }
  
  // Network first for app.js and style.css and index.html to ensure live updates reach users instantly
  if (url.includes('app.js') || url.includes('style.css') || url.includes('index.html')) {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkResponse;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
