// ==============================================
// 🔄 CRYPTORIAN WORLD - SERVICE WORKER v1
// AUTO UPDATE & AUTO CLEAR CACHE
// ==============================================

const CACHE_NAME = 'cryptorian-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Luna_Ai.html',
  './Luna_Ai2.html',
  './terminal_verification.html',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

// 📦 INSTALL
self.addEventListener('install', event => {
  console.log('⚙️ Installing Cryptorian Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching files...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Cache siap!');
        return self.skipWaiting();
      })
  );
});

// 🚀 ACTIVATE - BUANG SEMUA CACHE LAMA
self.addEventListener('activate', event => {
  console.log('⚡ Activating new Service Worker...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`🗑️ Auto delete old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('✅ Cryptorian Service Worker activated!');
      return self.clients.claim();
    })
  );
});

// 🔄 FETCH
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // JANGAN cache fail dari luar
  if (url.includes('github.com') || 
      url.includes('googleapis.com') || 
      url.includes('cdnjs.cloudflare.com') ||
      url.includes('tailwindcss.com') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('pinata.cloud')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// 📡 TERIMA MESSAGE
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('✅ Cache cleared by page');
      event.source.postMessage('CACHE_CLEARED');
    });
  }
});
