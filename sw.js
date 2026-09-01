/* ============================================
   Service Worker — CPTSD Guide
   Cache-first strategy for offline access
   ============================================ */

const CACHE_NAME = 'cptsd-guide-v1';
const PRECACHE_ASSETS = [
  '/index.html',
  '/cptsd-en.html',
  '/development-en.html',
  '/references-en.html',
  '/CPTSD%20childhood%20trauma.html',
  '/development.html',
  '/references.html',
  '/CPTSD%20childhood%20trauma-cn.html',
  '/development-cn.html',
  '/references-cn.html',
  '/site-enhancements.css',
  '/site-enhancements.js',
  '/background-poster.jpg'
];

/* ----- Install: precache core assets ----- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ----- Activate: clean old caches ----- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (name) {
          return name !== CACHE_NAME;
        }).map(function (name) {
          return caches.delete(name);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ----- Fetch: cache-first, network fallback ----- */
self.addEventListener('fetch', function (event) {
  const { request } = event;

  /* Skip non-GET requests */
  if (request.method !== 'GET') return;

  /* Skip cross-origin requests */
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        /* Return cached version immediately, then refresh in background */
        fetch(request).then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(function () {});
        return cached;
      }

      /* Not in cache: fetch and cache */
      return fetch(request).then(function (networkResponse) {
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, clone);
        });
        return networkResponse;
      }).catch(function () {
        /* Network failed — return offline fallback if we have one */
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
