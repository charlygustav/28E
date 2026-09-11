// ══════════════════════════════════════════════════════════════════════════════
// 28E Service Worker — Progressive Web App
// Version: 1.0.0
// ══════════════════════════════════════════════════════════════════════════════

const CACHE_NAME = '28e-pwa-v14';

// Recursos esenciales pre-cacheados para arranque instantáneo y offline básico
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './tulip.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

// ── 1. INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Algunos recursos no pudieron precachearse:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── 2. ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('28e-') && name !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ── 3. FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo gestionar peticiones HTTP(S) de tipo GET
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Omitir peticiones de tiempo real, WebSockets, Firebase RTDB y señalización
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.includes('socket.io') ||
    url.port === '3000' ||
    url.pathname.includes('signaling')
  ) {
    return;
  }

  // Omitir streaming de audio / archivos con Range headers para evitar romper la reproducción de música
  if (
    request.headers.get('range') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.includes('/radio/') ||
    url.pathname.includes('/sounds/')
  ) {
    return;
  }

  // A) NAVEGACIÓN (Páginas HTML): Network-First con fallback a Caché
  // Garantiza que el usuario reciba siempre la versión más reciente online, pero cargue si está offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('./index.html');
        })
    );
    return;
  }

  // B) RECURSOS ESTÁTICOS (Estilos, Fuentes, Scripts, Iconos): Stale-While-Revalidate
  const isStatic = (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  );

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        }).catch(() => {
          // Fallo de red silencioso para peticiones en segundo plano
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
