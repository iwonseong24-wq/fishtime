const CACHE_NAME = 'tidecast-cache-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install event - caching assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('TideCast service worker: caching static files');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('TideCast service worker: clearing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first fallback to cache strategy
self.addEventListener('fetch', (e) => {
  // We skip caching API requests to Open-Meteo so weather remains fresh
  if (e.request.url.includes('api.open-meteo.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If valid network response, clone it into cache
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, load from local cache
        return caches.match(e.request);
      })
  );
});
