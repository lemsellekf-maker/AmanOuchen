const CACHE_NAME = 'aman-ouchen-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Install - cache les fichiers de base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Network first, fallback cache
self.addEventListener('fetch', e => {
  // Ne pas intercepter les requêtes Supabase/API
  if(e.request.url.includes('supabase.co') || 
     e.request.url.includes('anthropic.com') ||
     e.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre en cache la réponse
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
