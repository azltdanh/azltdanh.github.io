var cacheName = 'realtime-voting-v1';
var filesToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/assets/ratings/emo1.png',
    '/assets/ratings/emo2.png',
    '/assets/ratings/emo3.png',
    '/assets/ratings/emo4.png',
    '/assets/ratings/emo5.png',
    '/styles.css',
    '/cdn/reset.min.css',
    '/cdn/jquery-3.3.1.min.js',
    '/cdn/ably.min-1.js',
    '/vote.js'
];

// install
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(filesToCache);
            })

    );
});

// activate
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// fetch
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            if (response) {
                return response;
            }

            return fetch(e.request).then(function (response) {
                var shouldCache = response.ok;

                if (e.request.method == 'POST') {
                    shouldCache = false;
                }

                if (shouldCache) {
                    return caches.open(cacheName).then(function (cache) {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                } else {
                    return response;
                }
            });
        })
    );
});
