/**
 * Service Worker — Riqsi Rutas PWA
 * Estrategia:
 *   - Cache-First  → assets estáticos (JS, CSS, imágenes)
 *   - Network-First → API Flask /api/*
 *   - Stale-While-Revalidate → /api/places (datos turísticos)
 *   - Offline fallback → página shell cacheada
 */

const CACHE_NAME = 'riqsi-rutas-v4'
const API_CACHE  = 'riqsi-api-v4'

// Recursos a pre-cachear en la instalación
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/cochabamba-hero.jpg',
  '/assets/patrimonio.jpg',
  '/assets/tunari.jpg',
  '/assets/gastronomia.jpg',
  '/assets/gato-explorador.png',
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  )
})

// ─── Activate: limpiar caches viejos agresivamente ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  // 1. Navegación principal (HTML): Network-First para siempre recibir el último build
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME))
    return
  }

  // 2. API calls
  if (url.pathname.startsWith('/api/places')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
    return
  }
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // 3. Tiles de mapas externos: NUNCA interceptar por service worker (dejar a la red directa)
  if (url.hostname.includes('arcgisonline.com') || url.hostname.includes('openstreetmap.org') || url.hostname.includes('project-osrm.org')) {
    return
  }

  // 4. Assets estáticos (imágenes, fuentes, css, js)
  if (url.pathname.startsWith('/assets/') || url.pathname.match(/\.(js|css|woff2?|png|webp|svg|jpg|jpeg|ico)$/)) {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }

  event.respondWith(networkWithSpaFallback(request))
})

// ─── Estrategias ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached && cached.ok && cached.status === 200) return cached
  try {
    const response = await fetch(request)
    if (response.ok && response.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Recurso no disponible sin conexión', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)

  return cached ?? (await networkPromise) ??
    new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
}

async function networkWithSpaFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) return response
  } catch {}

  // Fallback al index.html cacheado (SPA shell)
  const cached = await caches.match('/index.html') ?? await caches.match('/')
  if (cached) return cached

  return new Response('<h1>Riqsi Rutas — Sin conexión</h1><p>Verifica tu conexión e intenta de nuevo.</p>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 503,
  })
}

// ─── Background Sync (reservas pendientes sin conexión) ──────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingBookings())
  }
})

async function syncPendingBookings() {
  try {
    const db = await openPendingStore()
    const pending = await db.getAll('pending-bookings')
    for (const booking of pending) {
      try {
        const response = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        })
        if (response.ok) {
          await db.delete('pending-bookings', booking.id)
        }
      } catch {}
    }
  } catch {}
}

// Minimal IndexedDB wrapper for background sync
async function openPendingStore() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('riqsi-sync', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('pending-bookings', { keyPath: 'id' })
    }
    req.onsuccess = () => {
      const db = req.result
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readonly')
          const req2 = tx.objectStore(store).getAll()
          req2.onsuccess = () => res(req2.result)
          req2.onerror = () => rej(req2.error)
        }),
        delete: (store, key) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite')
          const req2 = tx.objectStore(store).delete(key)
          req2.onsuccess = () => res(undefined)
          req2.onerror = () => rej(req2.error)
        }),
      })
    }
    req.onerror = () => reject(req.error)
  })
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Riqsi Rutas', {
      body: data.body ?? 'Tienes una actualización',
      icon: '/gato-explorador.png',
      badge: '/gato-explorador.png',
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'open', title: 'Ver' },
        { action: 'dismiss', title: 'Cerrar' },
      ],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    }),
  )
})

