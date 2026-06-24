const CACHE_NAME = 'time-attendance-v1';
const SHELL = [
  './',
  './index.html'
];

// Install: cache app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve cached, fallback to network
// NEVER cache Google Apps Script API calls
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((r) => {
      return (
        r ||
        fetch(e.request).catch(() => {
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});
