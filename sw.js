const CACHE = 'novela-v1.0.8';
const STATIC = ['/', '/index.html', '/app.js?v=1.0.8', '/style.css?v=1.0.8', '/logo.png',
  '/reader.html', '/reader.css', '/reader.js?v=1.0.8', '/book_texts.js?v=1.0.8'];

self.addEventListener('install', e => {
  console.log('[SW] Installing version 1.0.8');
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(err => console.log('[SW] Cache error:', err))
  );
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', e => {
  console.log('[SW] Activating version 1.0.8');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only cache GET requests for static assets
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't cache API calls
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    // Network first for HTML/JS/CSS to always get latest
    fetch(e.request).then(res => {
      if (res.ok && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html'))) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => {
      // Fallback to cache if offline
      return caches.match(e.request);
    })
  );
});
