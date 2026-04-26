// sw.js - Service Worker для GGPoint
// Версия кеша (меняйте при обновлении сайта)
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `ggpoint-${CACHE_VERSION}`;

// Файлы, которые кешируем сразу (критические)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/catalog.html',
    '/about.html',
    '/contacts.html',
    '/tracking.html',
    '/keycaps.html',
    '/pads.html',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Установка...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Кеширование критических файлов');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация (очищаем старые кеши)
self.addEventListener('activate', event => {
    console.log('[SW] Активация...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Удаление старого кеша:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Стратегия: сначала кеш, потом сеть (для быстрой загрузки)
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Пропускаем Firebase и аналитику (им нужна свежая информация)
    if (url.hostname.includes('firebaseio.com') || 
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Для изображений — кеш + сеть (stale-while-revalidate)
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                    });
                    return response;
                }).catch(() => {
                    // Если нет сети и нет кеша — показываем заглушку
                    if (!cached) {
                        return new Response('/images/placeholder.svg', {
                            status: 200,
                            headers: { 'Content-Type': 'image/svg+xml' }
                        });
                    }
                });
                return cached || networkFetch;
            })
        );
        return;
    }
    
    // Для HTML и CSS — сначала кеш, потом сеть
    if (event.request.destination === 'document' || 
        event.request.destination === 'style' ||
        url.pathname.endsWith('.html')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                return cached || fetch(event.request).then(response => {
                    // Кешируем новые страницы
                    if (response.ok && event.request.method === 'GET') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                });
            }).catch(() => {
                // Офлайн страница
                return caches.match('/offline.html');
            })
        );
        return;
    }
    
    // Для всего остального — сначала сеть, потом кеш
    event.respondWith(
        fetch(event.request).then(response => {
            // Кешируем успешные ответы
            if (response.ok && event.request.method === 'GET') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clone);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Фоновая синхронизация (для форм обратной связи)
self.addEventListener('sync', event => {
    if (event.tag === 'send-messages') {
        event.waitUntil(sendPendingMessages());
    }
});

// Push уведомления (опционально)
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/icon-192x192.png',
        badge: '/images/badge.png',
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Открыть' },
            { action: 'close', title: 'Закрыть' }
        ]
    };
    event.waitUntil(
        self.registration.showNotification('GGPoint', options)
    );
});
