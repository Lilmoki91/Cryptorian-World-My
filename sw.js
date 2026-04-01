// ==============================================
// 🔄 CRYPTORIAN WORLD - SERVICE WORKER v2
// ==============================================

const CACHE_NAME = 'cryptorian-cache-v2'; // ← TUKAR VERSION!

// JANGAN CACHE LUNA AI & TERMINAL VERIFICATION
// Biarkan mereka selalu ambil dari network
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

// ==============================================
// 📦 INSTALL - Hanya cache static files
// ==============================================
self.addEventListener('install', event => {
  console.log('⚙️ Installing Cryptorian SW v2...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Cache siap!');
        return self.skipWaiting();
      })
  );
});

// ==============================================
:// 🚀 ACTIVATE - BUANG CACHE LAMA
// ==============================================
self.addEventListener('activate', event => {
  console.log('⚡ Activating new SW...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log(`🗑️ Delete old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW v2 activated!');
      return self.clients.claim();
    })
  );
});

// ==============================================
:// 🔄 FETCH - Network First untuk HTML
// ==============================================
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // JANGAN cache API & CDN
  if (url.includes('github.com') || 
      url.includes('googleapis.com') || 
      url.includes('cdnjs.cloudflare.com') ||
      url.includes('tailwindcss.com') ||
      url.includes('pinata.cloud')) {
    return;
  }
  
  // UNTUK LUNA AI & TERMINAL - Network First
  if (url.includes('Luna_Ai.html') || 
      url.includes('Luna_Ai2.html') || 
      url.includes('terminal_verification.html')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // UNTUK STATIC FILES - Cache First
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
