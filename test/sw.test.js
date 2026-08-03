// Tests fuer den Service Worker: Die App-Huelle darf nie durch eine
// Fehlerseite ersetzt werden, Assets kommen aus dem Cache, Medien sind
// groessenbegrenzt. Laeuft mit Attrappen fuer self/caches/fetch.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const ORIGIN = 'https://red-kurd.test'

class CacheAttrappe {
  constructor() {
    this.eintraege = new Map() // url -> Response
  }
  async match(anfrage) {
    const url = typeof anfrage === 'string' ? ORIGIN + anfrage : anfrage.url
    return this.eintraege.get(url) || undefined
  }
  async put(anfrage, antwort) {
    const url = typeof anfrage === 'string' ? ORIGIN + anfrage : anfrage.url
    // Einfuege-Reihenfolge erhalten (wie im echten Cache): erst loeschen.
    this.eintraege.delete(url)
    this.eintraege.set(url, antwort)
  }
  async delete(anfrage) {
    const url = typeof anfrage === 'string' ? ORIGIN + anfrage : anfrage.url
    return this.eintraege.delete(url)
  }
  async keys() {
    return [...this.eintraege.keys()].map((url) => new Request(url))
  }
  async addAll(pfade) {
    for (const p of pfade) this.eintraege.set(ORIGIN + p, new Response('huelle'))
  }
}

class CacheStorageAttrappe {
  constructor() {
    this.caches = new Map()
  }
  async open(name) {
    if (!this.caches.has(name)) this.caches.set(name, new CacheAttrappe())
    return this.caches.get(name)
  }
  async keys() {
    return [...this.caches.keys()]
  }
  async delete(name) {
    return this.caches.delete(name)
  }
  async match(anfrage) {
    for (const c of this.caches.values()) {
      const r = await c.match(anfrage)
      if (r) return r
    }
    return undefined
  }
}

/** Laedt public/sw.js in eine Sandbox und liefert Handler + Attrappen. */
async function ladeWorker(fetchMock) {
  const quelle = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8')
  const handlers = {}
  const speicher = new CacheStorageAttrappe()
  const sandbox = {
    self: {
      addEventListener: (typ, fn) => (handlers[typ] = fn),
      skipWaiting: () => {},
      clients: { claim: () => {} },
    },
    caches: speicher,
    location: { origin: ORIGIN },
    fetch: fetchMock,
    URL,
    Request,
    Response,
    Promise,
    setTimeout,
    clearTimeout,
    Error,
    console,
  }
  vm.createContext(sandbox)
  vm.runInContext(quelle, sandbox)
  return { handlers, speicher }
}

/** Ein Fetch-Ereignis nachbauen und die Antwort des Workers einsammeln. */
async function anfrage(handlers, pfad, { mode = 'no-cors', method = 'GET' } = {}) {
  let antwort = null
  const hintergrund = []
  const e = {
    request: { url: ORIGIN + pfad, method, mode },
    respondWith: (p) => (antwort = Promise.resolve(p)),
    waitUntil: (p) => hintergrund.push(p),
  }
  handlers.fetch(e)
  const ergebnis = antwort ? await antwort : null
  await Promise.allSettled(hintergrund)
  // Hintergrund-Puts (cache.open().then(...)) eine Runde laufen lassen.
  await new Promise((r) => setTimeout(r, 0))
  return ergebnis
}

test('eine 500er-Navigation ueberschreibt die App-Huelle nicht', async () => {
  const { handlers, speicher } = await ladeWorker(async () => new Response('kaputt', { status: 500 }))
  const cache = await speicher.open('red-kurd-v3')
  await cache.put('/index.html', new Response('gesunde huelle'))

  const res = await anfrage(handlers, '/today', { mode: 'navigate' })
  assert.equal(res.status, 500)
  const huelle = await cache.match('/index.html')
  assert.equal(await huelle.text(), 'gesunde huelle')
})

test('eine gesunde Navigation aktualisiert die Huelle', async () => {
  const { handlers, speicher } = await ladeWorker(async () => new Response('neue huelle', { status: 200 }))
  const res = await anfrage(handlers, '/today', { mode: 'navigate' })
  assert.equal(res.status, 200)
  const cache = await speicher.open('red-kurd-v3')
  const huelle = await cache.match('/index.html')
  assert.ok(huelle, 'die Huelle wurde gecacht')
})

test('offline liefert die Navigation die gecachte Huelle', async () => {
  const { handlers, speicher } = await ladeWorker(async () => {
    throw new Error('kein Netz')
  })
  const cache = await speicher.open('red-kurd-v3')
  await cache.put('/index.html', new Response('huelle'))
  const res = await anfrage(handlers, '/course/essen', { mode: 'navigate' })
  assert.equal(await res.text(), 'huelle')
})

test('gehashte Assets kommen ab dem zweiten Mal aus dem Cache', async () => {
  let netzAufrufe = 0
  const { handlers } = await ladeWorker(async () => {
    netzAufrufe += 1
    return new Response('bundle', { status: 200 })
  })
  await anfrage(handlers, '/assets/index-abc123.js')
  const zweite = await anfrage(handlers, '/assets/index-abc123.js')
  assert.equal(netzAufrufe, 1, 'das Netz wird nur einmal gefragt')
  assert.equal(await zweite.text(), 'bundle')
})

test('/api-Anfragen und fremde Hosts fasst der Worker nicht an', async () => {
  const { handlers } = await ladeWorker(async () => new Response('x'))
  assert.equal(await anfrage(handlers, '/api/suche?q=nan'), null)
  let antwort = null
  handlers.fetch({
    request: { url: 'https://fremd.example/bild.jpg', method: 'GET', mode: 'no-cors' },
    respondWith: (p) => (antwort = p),
    waitUntil: () => {},
  })
  assert.equal(antwort, null)
})

test('POST-Anfragen laufen am Worker vorbei', async () => {
  const { handlers } = await ladeWorker(async () => new Response('x'))
  assert.equal(await anfrage(handlers, '/daten/woerter.json', { method: 'POST' }), null)
})

test('Medien werden gecacht und beim zweiten Mal sofort aus dem Cache bedient', async () => {
  let netzAufrufe = 0
  const { handlers } = await ladeWorker(async () => {
    netzAufrufe += 1
    return new Response(`foto-${netzAufrufe}`, { status: 200 })
  })
  const erste = await anfrage(handlers, '/bilder/kapitel/essen.jpg')
  assert.equal(await erste.text(), 'foto-1')
  const zweite = await anfrage(handlers, '/bilder/kapitel/essen.jpg')
  assert.equal(await zweite.text(), 'foto-1', 'Cache zuerst, Netz aktualisiert im Hintergrund')
})

test('der Medien-Cache haelt sein Limit — die aeltesten fliegen zuerst', async () => {
  const { handlers, speicher } = await ladeWorker(async () => new Response('m', { status: 200 }))
  for (let i = 0; i < 160; i++) {
    await anfrage(handlers, `/audio/kmr/wort-${i}.mp3`)
  }
  // Hintergrund-Beschneidung fertig laufen lassen.
  await new Promise((r) => setTimeout(r, 20))
  const medien = await speicher.open('red-kurd-medien-v3')
  const eintraege = await medien.keys()
  assert.ok(eintraege.length <= 150, `Limit eingehalten (${eintraege.length})`)
  const urls = eintraege.map((r) => r.url)
  assert.ok(!urls.includes(`${ORIGIN}/audio/kmr/wort-0.mp3`), 'der aelteste Eintrag ist raus')
  assert.ok(urls.includes(`${ORIGIN}/audio/kmr/wort-159.mp3`), 'der neueste Eintrag ist da')
})

test('offline ohne Cache gibt es fuer Daten eine ehrliche 504 statt der Huelle', async () => {
  const { handlers, speicher } = await ladeWorker(async () => {
    throw new Error('kein Netz')
  })
  const cache = await speicher.open('red-kurd-v3')
  await cache.put('/index.html', new Response('huelle'))
  const res = await anfrage(handlers, '/manifest.webmanifest')
  assert.equal(res.status, 504)
  const medienRes = await anfrage(handlers, '/bilder/kapitel/essen.jpg')
  assert.equal(medienRes.status, 504)
})

test('activate raeumt alte Cache-Versionen ab, behaelt aber die aktuellen', async () => {
  const { handlers, speicher } = await ladeWorker(async () => new Response('x'))
  await speicher.open('red-kurd-v2')
  await speicher.open('red-kurd-v3')
  await speicher.open('red-kurd-medien-v3')
  let fertig = null
  handlers.activate({ waitUntil: (p) => (fertig = p) })
  await fertig
  const namen = await speicher.keys()
  assert.deepEqual(namen.sort(), ['red-kurd-medien-v3', 'red-kurd-v3'])
})
