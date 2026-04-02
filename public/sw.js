// Minimal Service Worker for PWA installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch (required for PWA installability)
  event.respondWith(fetch(event.request));
});
