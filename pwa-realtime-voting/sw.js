var cacheName = 'realtime-voting-v1';
var subdir = '/pwa-realtime-voting';
var filesToCache = [
    subdir + '/',
    subdir + '/index.html',
    subdir + '/assets/favicons/favicon-love.ico',
    subdir + '/assets/favicons/favicon-chart.ico',
    subdir + '/assets/ratings/emo1.png',
    subdir + '/assets/ratings/emo2.png',
    subdir + '/assets/ratings/emo3.png',
    subdir + '/assets/ratings/emo4.png',
    subdir + '/assets/ratings/emo5.png',
    subdir + '/site.css',
    subdir + '/cdn/reset.min.css',
    subdir + '/cdn/jquery-3.3.1.min.js',
    subdir + '/cdn/ably.min-1.js',
    subdir + '/js/vote.js'
];

// install
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] install');
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('[ServiceWorker] caching app shell');
                return cache.addAll(filesToCache);
            })

    );
});

// activate
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] activate');
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
    e.respondWith(
        caches.match(e.request).then(function (response) {

            // // Cache signature post request
            // if (event.request.url.includes('updateSignature') && !navigator.onLine) {
            //     var request = event.request;
            //     var headers = {};
            //     for (var entry of request.headers.entries()) {
            //         headers[entry[0]] = entry[1];
            //     }
            //     var serialized = {
            //         url: request.url,
            //         headers: headers,
            //         method: request.method,
            //         mode: request.mode,
            //         credentials: request.credentials,
            //         cache: request.cache,
            //         redirect: request.redirect,
            //         referrer: request.referrer
            //     };
            //     request.clone().text().then(function(body) {
            //         serialized.body = body;
            //         callsToCache.push(serialized);
            //         console.log(callsToCache);
            //     });     
            // }
            // // Immediately respond if request exists in the cache and user is offline
            // if (response && !navigator.onLine) {
            //     return response;
            // }
            // // Resubmit offline signature requests
            // if(navigator.onLine && callsToCache.length > 0) {
            //     callsToCache.forEach(function(signatureRequest) {
            //         fetch(signatureRequest.url, {
            //             method: signatureRequest.method,
            //             body: signatureRequest.body
            //         });
            //     });
            //     callsToCache = [];
            // }

            return response || fetch(e.request).then(function (response) {
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
