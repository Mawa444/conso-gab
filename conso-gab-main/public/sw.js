// Service Worker pour ConsoGab PWA
// Version: 1.0.0

const CACHE_NAME = 'consogab-v1.0.0';
const STATIC_CACHE = 'consogab-static-v1.0.0';
const API_CACHE = 'consogab-api-v1.0.0';

// Ressources statiques à cacher
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Lalezar&display=swap',
];

// API endpoints à cacher (GET seulement)
const API_ENDPOINTS = [
  '/rest/v1/business_profiles',
  '/rest/v1/catalogs',
  '/rest/v1/user_profiles',
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache first pour les assets statiques
  CACHE_FIRST: 'cache-first',

  // Network first pour les données dynamiques
  NETWORK_FIRST: 'network-first',

  // Stale while revalidate pour les données qui changent peu
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // Cache les ressources statiques critiques
      await cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));

      // Cache les fonts externes
      try {
        await cache.addAll(STATIC_ASSETS.filter(url => url.startsWith('http')));
      } catch (error) {
        console.warn('[SW] Failed to cache external fonts:', error);
      }

      // Force l'activation immédiate
      self.skipWaiting();
    })()
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    (async () => {
      // Nettoie les anciens caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
          .map(name => caches.delete(name))
      );

      // Prend le contrôle immédiatement
      self.clients.claim();
    })()
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignore les requêtes Chrome extension
  if (url.protocol === 'chrome-extension:') return;

  // Stratégie selon le type de ressource
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // Fallback: network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Stratégies de cache
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline - Ressource non disponible', { status: 503 });
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline - Données non disponibles', { status: 503 });
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Helpers pour identifier les types de requêtes
function isStaticAsset(url) {
  return (
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
  );
}

function isApiRequest(url) {
  return (
    url.hostname.includes('supabase') ||
    API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))
  );
}

function isImageRequest(url) {
  return (
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.gif')
  );
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Fonction utilitaire pour nettoyer les caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
}

// Gestion des notifications push (si implémenté plus tard)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion du clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Performance monitoring (si Web Vitals disponible)
if ('performance' in self && 'PerformanceObserver' in self) {
  try {
    // Monitor Core Web Vitals
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Send to analytics if needed
        console.log('[SW] Web Vital:', entry.name, entry.value);
      }
    }).observe({ entryTypes: ['measure'] });
  } catch (error) {
    console.warn('[SW] Performance monitoring failed:', error);
  }
}