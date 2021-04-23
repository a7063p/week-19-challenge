const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01'
const DATA_CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/js/idb.js',
    '/js/index.js',
];

//install the service worker
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(DATA_CACHE_NAME).then(cache => {
            console.log('your files were pre-cached');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate the service worker and remove old data from cache
self.addEventListener('active', function(e) {
    e.waitUntil(
        caches.keys().then(keylist => {
            return Promise.all(
                keylist.map(key => {
                    if (key !== DATA_CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing Old Cache data', key);
                        return caches.delete(key)
                    }
                })
            );
        })
    );
    self.ClientRectList.claim()
});

// Intercept Fetch requests
self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
      e.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(e.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(e.request.url, response.clone());
                }
  
                return response;
              })
              .catch(error => {
                // Network request failed, try to get it from the cache.
                return cache.match(e.request);
              });
          })
          .catch(error => console.log(error))
      );
  
      return;
    }
  
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request).then(function(response) {
          if (response) {
            return response;
          } 
           return caches.match('/')
        });
      })
    );
  });