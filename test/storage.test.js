// Tests fuer die zentrale Speicherung: Lesen, Schreiben, Sicherung,
// Migration. Der Lernstand darf unter keinen Umstaenden verloren gehen.
import test from 'node:test'
import assert from 'node:assert/strict'

// Nachbau von localStorage fuer Node. `kaputt` simuliert vollen Speicher
// oder privaten Modus (setItem wirft), wie es Safari auf dem iPhone tut.
class SpeicherAttrappe {
  constructor() {
    this.daten = new Map()
    this.kaputt = false
  }
  getItem(key) {
    return this.daten.has(key) ? this.daten.get(key) : null
  }
  setItem(key, wert) {
    if (this.kaputt) throw new DOMException('Speicher voll', 'QuotaExceededError')
    this.daten.set(key, String(wert))
  }
  removeItem(key) {
    this.daten.delete(key)
  }
}

function frischerSpeicher() {
  const speicher = new SpeicherAttrappe()
  globalThis.localStorage = speicher
  return speicher
}

// `migriere()` laeuft pro Modulinstanz genau einmal. Ein Import mit
// eigenem Query-String liefert eine frische Instanz samt frischem Merker.
let importZaehler = 0
async function frischesModul() {
  return import(`../src/core/storage.js?frisch=${++importZaehler}`)
}

// Fuer alle Tests ohne Migration reicht eine gemeinsame Modulinstanz.
const storage = await frischesModul()
const { KEYS, lies, schreibe, entferne, exportiereSpeicherstand, importiereSpeicherstand, migriereKarten } = storage

test('lies liefert den Ersatzwert, wenn der Schluessel fehlt', () => {
  frischerSpeicher()
  assert.equal(lies('gibt-es-nicht', 'ersatz'), 'ersatz')
  assert.equal(lies('gibt-es-nicht'), null)
})

test('schreibe und lies arbeiten als Paar, auch mit Objekten', () => {
  frischerSpeicher()
  assert.equal(schreibe(KEYS.profil, { name: 'Zilan', minuten: '10' }), true)
  assert.deepEqual(lies(KEYS.profil), { name: 'Zilan', minuten: '10' })
})

test('kaputtes JSON zerstoert nichts — es kommt der Ersatzwert', () => {
  const speicher = frischerSpeicher()
  speicher.daten.set(KEYS.fortschritt, '{kaputt!!')
  assert.deepEqual(lies(KEYS.fortschritt, { xp: 0 }), { xp: 0 })
})

test('ohne localStorage laeuft die App weiter, nur ohne Sicherung', () => {
  globalThis.localStorage = undefined
  assert.equal(lies('x', 'ersatz'), 'ersatz')
  assert.equal(schreibe('x', 1), false)
  assert.doesNotThrow(() => entferne('x'))
})

test('voller Speicher (QuotaExceeded) laesst schreibe still scheitern', () => {
  const speicher = frischerSpeicher()
  speicher.kaputt = true
  assert.equal(schreibe(KEYS.fortschritt, { xp: 10 }), false)
})

test('entferne loescht genau einen Schluessel', () => {
  frischerSpeicher()
  schreibe(KEYS.ui, { mode: 'modern' })
  schreibe(KEYS.shop, { gekauft: [] })
  entferne(KEYS.ui)
  assert.equal(lies(KEYS.ui), null)
  assert.deepEqual(lies(KEYS.shop), { gekauft: [] })
})

test('die Sicherung enthaelt alle Bereiche mit Daten, aber keine leeren', () => {
  frischerSpeicher()
  schreibe(KEYS.profil, { name: 'Delal' })
  schreibe(KEYS.fortschritt, { xp: 120 })
  const sicherung = exportiereSpeicherstand()
  assert.deepEqual(sicherung, {
    profil: { name: 'Delal' },
    fortschritt: { xp: 120 },
  })
})

test('die geraete-lokale Entscheidung „ohne Konto" wandert nie in Sicherungen', () => {
  frischerSpeicher()
  schreibe(KEYS.ohneKonto, true)
  schreibe(KEYS.profil, { name: 'Delal' })
  assert.deepEqual(exportiereSpeicherstand(), { profil: { name: 'Delal' } })
})

test('der Import schreibt bekannte Bereiche und zaehlt sie', () => {
  frischerSpeicher()
  const anzahl = importiereSpeicherstand({
    profil: { name: 'Rojda' },
    fortschritt: { xp: 300, karten: {} },
  })
  assert.equal(anzahl, 2)
  assert.deepEqual(lies(KEYS.profil), { name: 'Rojda' })
  assert.deepEqual(lies(KEYS.fortschritt), { xp: 300, karten: {} })
})

test('der Import ignoriert unbekannte Schluessel und „ohne Konto"', () => {
  frischerSpeicher()
  const anzahl = importiereSpeicherstand({
    voelligFremd: { boese: true },
    ohneKonto: true,
    profil: { name: 'Baran' },
  })
  assert.equal(anzahl, 1)
  assert.equal(lies('voelligFremd'), null)
  assert.equal(lies(KEYS.ohneKonto), null)
})

test('unbrauchbare Importe (null, Liste, Text) schreiben nichts', () => {
  frischerSpeicher()
  assert.equal(importiereSpeicherstand(null), 0)
  assert.equal(importiereSpeicherstand(['profil']), 0)
  assert.equal(importiereSpeicherstand('profil'), 0)
})

// ===== migriereKarten =====

test('migriereKarten hebt umbenannte Paare an und behaelt Stufe und Faelligkeit', () => {
  const { karten, geaendert } = migriereKarten({
    'Pilz|kundir|erkennen': { stufe: 3, faellig: '2026-08-01' },
    'Brot|nan|erkennen': { stufe: 5, faellig: '2026-07-30' },
  })
  assert.equal(geaendert, 1)
  assert.deepEqual(karten, {
    'Pilz|kivark|erkennen': { stufe: 3, faellig: '2026-08-01' },
    'Brot|nan|erkennen': { stufe: 5, faellig: '2026-07-30' },
  })
})

test('bei doppelten Karten gewinnt der weiter fortgeschrittene Stand', () => {
  const { karten } = migriereKarten({
    'Pilz|kivark|erkennen': { stufe: 4 },
    'Pilz|kundir|erkennen': { stufe: 2 },
  })
  assert.deepEqual(karten, { 'Pilz|kivark|erkennen': { stufe: 4 } })
})

test('migriereKarten laesst leere oder fehlende Eingaben unangetastet', () => {
  assert.deepEqual(migriereKarten(null), { karten: null, geaendert: 0 })
  assert.deepEqual(migriereKarten(undefined), { karten: undefined, geaendert: 0 })
})

// ===== migriere: v1 -> v2 =====

const ALT_FORTSCHRITT = 'red-kurd-fortschritt-v1'
const ALT_PROFIL = 'red-kurd-profil-v1'
const ALT_MODUS = 'red-kurd-modus'

test('die Migration uebernimmt den v1-Lernstand vollstaendig nach v2', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem(
    ALT_FORTSCHRITT,
    JSON.stringify({
      xp: 250,
      serie: 7,
      letzterTag: '2026-08-01',
      lektionen: { begruessung: 2 },
      karten: { 'Brot|nan|erkennen': { stufe: 4 } },
      tage: { '2026-08-01': 12 },
      edelsteine: 30,
    })
  )
  const modul = await frischesModul()
  modul.migriere()
  const stand = modul.lies(modul.KEYS.fortschritt)
  assert.equal(stand.version, 2)
  assert.equal(stand.xp, 250)
  assert.equal(stand.serie, 7)
  assert.deepEqual(stand.einheiten, { begruessung: 2 })
  assert.deepEqual(stand.karten, { 'Brot|nan|erkennen': { stufe: 4 } })
  assert.equal(stand.edelsteine, 30)
})

test('die Migration kopiert alte Schluessel — sie loescht sie nie', async () => {
  const speicher = frischerSpeicher()
  const altWert = JSON.stringify({ xp: 90, serie: 3 })
  speicher.setItem(ALT_FORTSCHRITT, altWert)
  speicher.setItem(ALT_PROFIL, JSON.stringify({ name: 'Evin' }))
  const modul = await frischesModul()
  modul.migriere()
  assert.equal(speicher.getItem(ALT_FORTSCHRITT), altWert)
  assert.equal(speicher.getItem(ALT_PROFIL), JSON.stringify({ name: 'Evin' }))
})

test('vorhandene v2-Daten werden von der Migration nicht ueberschrieben', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem(ALT_FORTSCHRITT, JSON.stringify({ xp: 1 }))
  const modul = await frischesModul()
  modul.schreibe(modul.KEYS.fortschritt, { version: 2, xp: 999 })
  modul.migriere()
  assert.equal(modul.lies(modul.KEYS.fortschritt).xp, 999)
})

test('die Migration hebt umbenannte Karten im bestehenden v2-Stand an', async () => {
  frischerSpeicher()
  const modul = await frischesModul()
  modul.schreibe(modul.KEYS.fortschritt, {
    version: 2,
    xp: 50,
    karten: { 'Pilz|kundir|erkennen': { stufe: 2, faellig: '2026-08-05' } },
  })
  modul.migriere()
  const stand = modul.lies(modul.KEYS.fortschritt)
  assert.deepEqual(stand.karten, {
    'Pilz|kivark|erkennen': { stufe: 2, faellig: '2026-08-05' },
  })
  assert.equal(stand.xp, 50)
})

test('das alte Profil wird mit sinnvollem Tagesziel nach v2 gehoben', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem(
    ALT_PROFIL,
    JSON.stringify({ name: 'Evin', kenntnis: 'etwas', ziel: 'familie', minuten: '20' })
  )
  const modul = await frischesModul()
  modul.migriere()
  const profil = modul.lies(modul.KEYS.profil)
  assert.equal(profil.version, 2)
  assert.equal(profil.name, 'Evin')
  assert.equal(profil.tagesziel, 30)
  assert.equal(profil.variante, 'kurmanci-standard')
})

test('der alte App-Modus „klassik" wird zum dunklen Design', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem(ALT_MODUS, 'klassik')
  const modul = await frischesModul()
  modul.migriere()
  const ui = modul.lies(modul.KEYS.ui)
  assert.equal(ui.theme, 'dark')
  assert.equal(ui.mode, 'modern')
})

test('die Migration laeuft pro Start nur einmal', async () => {
  const speicher = frischerSpeicher()
  const modul = await frischesModul()
  modul.migriere()
  // Nachtraeglich eingespielte Alt-Daten duerfen den Stand nicht mehr aendern.
  speicher.setItem(ALT_FORTSCHRITT, JSON.stringify({ xp: 777 }))
  modul.migriere()
  assert.equal(modul.lies(modul.KEYS.fortschritt), null)
})

test('ohne localStorage stuerzt die Migration nicht ab', async () => {
  globalThis.localStorage = undefined
  const modul = await frischesModul()
  assert.doesNotThrow(() => modul.migriere())
})
