var cacheName = 'green-v1';
var subdir = '/green';
var filesToCache = [
    subdir + '/',
    subdir + '/index.html',
    subdir + '/assets/fonts/Roboto-Regular.ttf',
    subdir + '/assets/icons/icon-48x48.png',
    subdir + '/assets/ratings/icon-72x72.png',
    subdir + '/assets/ratings/icon-96x96.png',
    subdir + '/assets/ratings/icon-144x144.png',
    subdir + '/assets/ratings/icon-192x192.png',
    subdir + '/assets/images/green.jpeg',
    subdir + '/assets/reset.min.css'
];

// install
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] installing…');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

// activate
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] now ready to handle fetches!');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// fetch
self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] now fetch!');
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request).then(function (response) {
                var shouldCache = response.ok;

                if (e.request.method == 'POST') {
                    shouldCache = false;
                }

                if (shouldCache) {
                    return caches.open(cacheName).then(function (cache) {
                        console.log('[ServiceWorker] caching new fetch');
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
