// RED-KURD Service Worker: macht die App offline-faehig.
// Seitenaufrufe (/today, /course/…) fallen offline auf die App-Huelle zurueck,
// damit auch Tiefenlinks ohne Netz funktionieren.
const VERSION = 'v3'
const CACHE = `red-kurd-${VERSION}`
const MEDIEN = `red-kurd-medien-${VERSION}`
const HUELLE = '/index.html'

// Grenze gegen unbegrenztes Wachstum: iOS raeumt uebervolle Caches sonst
// komplett ab und die Offline-Faehigkeit ist dahin. Aelteste fliegen zuerst.
const MEDIEN_LIMIT = 150

// Bei zaehem Mobilfunk soll der Cache uebernehmen, statt dass der App-Start
// minutenlang auf einen scheiternden Fetch wartet.
const NETZ_LIMIT_MS = 4000

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', HUELLE])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  const behalten = [CACHE, MEDIEN]
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => !behalten.includes(k)).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

function fetchMitLimit(anfrage, ms) {
  return new Promise((erfuellen, ablehnen) => {
    const wecker = setTimeout(() => ablehnen(new Error('Zeitlimit')), ms)
    fetch(anfrage).then(
      (res) => {
        clearTimeout(wecker)
        erfuellen(res)
      },
      (grund) => {
        clearTimeout(wecker)
        ablehnen(grund)
      }
    )
  })
}

/** Aelteste Eintraege entfernen, bis das Limit wieder stimmt. */
async function begrenze(cacheName, limit) {
  const c = await caches.open(cacheName)
  const eintraege = await c.keys()
  for (let i = 0; i < eintraege.length - limit; i++) await c.delete(eintraege[i])
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/')) return // Lokal-Server nie cachen

  // Seitenaufrufe: erst Netz, offline die App-Huelle.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetchMitLimit(e.request, NETZ_LIMIT_MS)
        .then((res) => {
          // Nur eine gesunde Antwort darf die Huelle ersetzen — eine
          // gecachte Fehlerseite wuerde die App offline dauerhaft brechen.
          if (res.ok) {
            const kopie = res.clone()
            caches.open(CACHE).then((c) => c.put(HUELLE, kopie))
          }
          return res
        })
        .catch(() => caches.match(HUELLE).then((r) => r || caches.match('/')))
    )
    return
  }

  // Gehashte Bundle-Dateien aendern sich nie: Cache zuerst, Netz nur einmal.
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (r) =>
          r ||
          fetch(e.request).then((res) => {
            if (res.ok) {
              const kopie = res.clone()
              caches.open(CACHE).then((c) => c.put(e.request, kopie))
            }
            return res
          })
      )
    )
    return
  }

  // Fotos, Audio und Kursdaten: Cache sofort anzeigen, im Hintergrund
  // aktualisieren (stale-while-revalidate) — mit begrenztem Speicher.
  if (/^\/(bilder|audio|daten)\//.test(url.pathname)) {
    e.respondWith(
      caches.open(MEDIEN).then(async (c) => {
        const alt = await c.match(e.request)
        const laden = fetch(e.request)
          .then((res) => {
            if (res.ok) {
              c.put(e.request, res.clone()).then(() => begrenze(MEDIEN, MEDIEN_LIMIT))
            }
            return res
          })
          .catch(() => null)
        if (alt) return alt
        const res = await laden
        return res || new Response('', { status: 504, statusText: 'Offline' })
      })
    )
    return
  }

  // Alles Uebrige: erst Netz, sonst Cache. Fremde Datenanfragen bekommen
  // offline keine App-Huelle untergeschoben, sondern eine ehrliche Antwort.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const kopie = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, kopie))
        }
        return res
      })
      .catch(() =>
        caches
          .match(e.request)
          .then((r) => r || new Response('', { status: 504, statusText: 'Offline' }))
      )
  )
})
