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
    // Hanya tangani request GET
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // ─── FILTER PENYIMPANAN CACHE ───
    // Jangan cache API Laravel
    if (url.pathname.includes('/api/')) return;

    // Jangan cache gambar/assets dinamis dari folder storage backend
    if (url.pathname.includes('/storage/')) return;

    // Jangan cache request ke server eksternal (Google Fonts, Midtrans, Maps, dll)
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Hanya cache response yang sukses dan berasal dari origin kita sendiri
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // Jika offline, coba ambil dari cache
                return caches.match(event.request).then((response) => {
                    return response || caches.match('/');
                });
            })
    );
});