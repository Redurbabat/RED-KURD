// RED-KURD Service Worker: macht die App offline-faehig.
// Seitenaufrufe (/today, /course/…) fallen offline auf die App-Huelle zurueck,
// damit auch Tiefenlinks ohne Netz funktionieren.
const CACHE = 'red-kurd-v2'
const HUELLE = '/index.html'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', HUELLE])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/')) return // Lokal-Server nie cachen

  // Seitenaufrufe: erst Netz, offline die App-Huelle
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const kopie = res.clone()
          caches.open(CACHE).then((c) => c.put(HUELLE, kopie))
          return res
        })
        .catch(() => caches.match(HUELLE).then((r) => r || caches.match('/')))
    )
    return
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const kopie = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, kopie))
        }
        return res
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match(HUELLE)))
  )
})
