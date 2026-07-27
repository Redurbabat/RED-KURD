// RED-KURD Service Worker: macht die App offline-faehig
const CACHE = 'red-kurd-v1'
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
})
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api/')) return  // Lokal-Server nie cachen
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && url.origin === location.origin) {
        const kopie = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, kopie))
      }
      return res
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
  )
})
