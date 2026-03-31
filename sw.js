// ==============================================
// 📦 INSTALL - Cache semua fail
// ==============================================
self.addEventListener('install', event => {
  console.log('⚙️ Installing Service Worker v3...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching files...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Cache siap!');
        return self.skipWaiting(); // Aktifkan segera
      })
  );
});

// ==============================================
// 🚀 ACTIVATE - BUANG CACHE LAMA (PENTING!)
// ==============================================
self.addEventListener('activate', event => {
  console.log('⚡ Activating new Service Worker...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // 🔥 BUANG semua cache version lama
          if (key !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker v3 sedia!');
      // 🔥 Ambil alih semua tabs
      return self.clients.claim();
    })
  );
});

// ==============================================
// 🔄 FETCH - Cache First, Network Second
// ==============================================
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // 🔥 JANGAN cache API calls
  if (url.includes('googleapis.com') || 
      url.includes('workers.dev') || 
      url.includes('gateway.ipfs.io.cloud') ||
      url.includes('api.')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          // Cache untuk lanjutan
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
