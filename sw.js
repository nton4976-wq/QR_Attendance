const CACHE_NAME = 'time-attendance-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
// BUT skip caching for Google Apps Script API calls
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Never cache Google Apps Script API calls
  if (req.url.includes('script.google.com')) {
    return;
  }
  
  // For everything else, try cache first
  event.respondWith(
    caches.match(req).then((response) => {
      if (response) {
        return response;
      }
      return fetch(req).then((networkResponse) => {
        // Optionally cache new same-origin requests
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
