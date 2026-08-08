// Tests fuer die Herzen des Abenteuer-Modus: Verlust, Nachwachsen, Auffuellen.
// Grundsatz: Herzen sperren nie Lerninhalte — das prueft die UI, hier geht es
// um die Zahlenlogik. Frische Modulinstanz je Test (Cache-Merker im Store).
import test from 'node:test'
import assert from 'node:assert/strict'

class SpeicherAttrappe {
  constructor() {
    this.daten = new Map()
  }
  getItem(key) {
    return this.daten.has(key) ? this.daten.get(key) : null
  }
  setItem(key, wert) {
    this.daten.set(key, String(wert))
  }
  removeItem(key) {
    this.daten.delete(key)
  }
}
globalThis.localStorage = new SpeicherAttrappe()

const { KEYS, schreibe } = await import('../src/core/storage.ts')
const { setzeFortschritt, holeFortschritt } = await import('../src/core/progress/progressStore.ts')

const VIER_STUNDEN = 4 * 60 * 60 * 1000

let zaehler = 0
async function frischeHerzen(stand) {
  if (stand !== undefined) schreibe(KEYS.herzen, stand)
  else globalThis.localStorage.removeItem(KEYS.herzen)
  return import(`../src/core/hearts/heartsStore.js?frisch=${++zaehler}`)
}

test('ohne Vorgeschichte sind alle fuenf Herzen da', async () => {
  const h = await frischeHerzen()
  assert.equal(h.herzen(), h.MAX_HERZEN)
  assert.equal(h.naechstesHerzIn(), null)
})

test('ein Fehler kostet ein Herz und startet die Nachwachs-Uhr', async () => {
  const h = await frischeHerzen()
  assert.equal(h.verliereHerz(), h.MAX_HERZEN - 1)
  const minuten = h.naechstesHerzIn()
  assert.ok(minuten > 0 && minuten <= 240, `${minuten} Minuten bis zum Herz`)
})

test('bei null Herzen geht es nicht unter null', async () => {
  const h = await frischeHerzen({ version: 1, herzen: 0, zuletzt: Date.now() })
  assert.equal(h.verliereHerz(), 0)
})

test('alle vier Stunden waechst ein Herz nach', async () => {
  const h = await frischeHerzen({
    version: 1,
    herzen: 2,
    zuletzt: Date.now() - 2 * VIER_STUNDEN - 60000,
  })
  assert.equal(h.herzen(), 4)
  assert.ok(h.naechstesHerzIn() <= 240)
})

test('volle Regeneration stoppt die Uhr', async () => {
  const h = await frischeHerzen({
    version: 1,
    herzen: 4,
    zuletzt: Date.now() - VIER_STUNDEN - 60000,
  })
  assert.equal(h.herzen(), h.MAX_HERZEN)
  assert.equal(h.naechstesHerzIn(), null)
})

test('auffuellen kostet Edelsteine — und nur wenn welche da sind', async () => {
  setzeFortschritt({ edelsteine: 4 })
  let h = await frischeHerzen({ version: 1, herzen: 1, zuletzt: Date.now() })
  assert.equal(h.fuelleHerzenAuf(), false, 'zu wenig Edelsteine')
  assert.equal(holeFortschritt().edelsteine, 4)

  setzeFortschritt({ edelsteine: 25 })
  h = await frischeHerzen({ version: 1, herzen: 1, zuletzt: Date.now() })
  assert.equal(h.fuelleHerzenAuf(), true)
  assert.equal(h.herzen(), h.MAX_HERZEN)
  assert.equal(holeFortschritt().edelsteine, 25 - h.NACHFUELL_PREIS)
})

test('volle Herzen lassen sich nicht noch einmal kaufen', async () => {
  setzeFortschritt({ edelsteine: 50 })
  const h = await frischeHerzen()
  assert.equal(h.fuelleHerzenAuf(), false)
  assert.equal(holeFortschritt().edelsteine, 50)
})

test('gibHerz belohnt, aber nie ueber das Maximum hinaus', async () => {
  const h = await frischeHerzen({ version: 1, herzen: 3, zuletzt: Date.now() })
  h.gibHerz(1)
  assert.equal(h.herzen(), 4)
  h.gibHerz(5)
  assert.equal(h.herzen(), h.MAX_HERZEN)
})
