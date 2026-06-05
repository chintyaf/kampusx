const CACHE_NAME = 'kampusx-cache-v1';

// Daftar file yang mau disimpan secara offline
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/Logo_KampusX_NoText_192.png',
    '/Logo_KampusX_NoText_512.png'
];

// 1. Install & Simpan Cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching offline files');
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. Hapus Cache Lama jika ada versi baru
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Strategi Fetch (Network First, fallback to Cache)
self.addEventListener('fetch', (event) => {
    // Hanya tangani request GET (bukan POST/PUT ke API Laravel)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Jika internet nyala, update cache dengan data terbaru
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // Jika offline (fetch gagal), ambil dari cache
                return caches.match(event.request).then((response) => {
                    return response || caches.match('/');
                });
            })
    );
});

// 4. Handle Push Notification
self.addEventListener('push', function(event) {
    if (!event.data) {
        console.log('Push event received with no data.');
        return;
    }

    let payload = {};
    try {
        payload = event.data.json();
    } catch (e) {
        payload = {
            title: 'Notifikasi Baru',
            body: event.data.text()
        };
    }

    const title = payload.title || 'Pengumuman Baru';
    const options = {
        body: payload.body || 'Ada info baru untuk Anda.',
        icon: payload.icon || '/Logo_KampusX_NoText_192.png',
        badge: payload.badge || '/Logo_KampusX_NoText_192.png',
        data: {
            url: payload.data?.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 5. Handle Notification Click
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function(windowClients) {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new tab/window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});