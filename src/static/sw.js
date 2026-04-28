// Self-unregistering service worker.
// Replaces the previous PRECACHE worker which served stale assets after the
// site rebuild. New visitors don't see this; returning visitors get cleaned up.
self.addEventListener('install', () => {
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll()
      clients.forEach((c) => c.navigate(c.url))
    })()
  )
})
