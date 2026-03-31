/**
 * aesv.io service worker — cache-first for assets, network-first for HTML
 */

const CACHE = 'aesv-v1'
const ASSETS = [
  '/css/pretext.css',
  '/js/bundle.js',
  '/fonts/source-code-pro-latin.woff2',
  '/fonts/source-code-pro-latin-ext.woff2',
  '/manifest.json',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Cache-first for assets
  if (ASSETS.some((a) => url.pathname === a)) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
    return
  }

  // Network-first for HTML (navigation requests)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }
})
