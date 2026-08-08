// Tests fuer die Migrations-Pipeline: benannte Schritte, einzeln aufrufbar,
// mit Von- und Nach-Version — und die Zusicherung, dass ein stolpernder
// Schritt die anderen nicht mitreisst.
//
// Die Umzuege selbst (v1 -> v2 fuer Fortschritt, Profil, Sitzung, Modus) sind
// in test/storage-basis.test.js und test/storage.test.js abgedeckt. Hier geht
// es um die Pipeline als Bauteil.
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

function frischerSpeicher() {
  globalThis.localStorage = new SpeicherAttrappe()
  return globalThis.localStorage
}

let zaehler = 0
async function frischesModul() {
  return import(`../src/core/storage.ts?pipeline=${++zaehler}`)
}

test('jeder Schritt hat einen eindeutigen Namen, einen Bereich und Von/Nach', async () => {
  frischerSpeicher()
  const { MIGRATIONEN, KEYS } = await frischesModul()

  assert.ok(MIGRATIONEN.length >= 5, 'es fehlen Schritte')
  const namen = MIGRATIONEN.map((s) => s.name)
  assert.equal(new Set(namen).size, namen.length, 'zwei Schritte heissen gleich')

  for (const s of MIGRATIONEN) {
    assert.ok(s.name && typeof s.name === 'string', `${s.name}: kein Name`)
    assert.ok(s.von && s.nach, `${s.name}: Von oder Nach fehlt`)
    assert.ok(s.beschreibung.length > 10, `${s.name}: keine brauchbare Beschreibung`)
    assert.equal(typeof s.noetig, 'function', `${s.name}: noetig() fehlt`)
    assert.equal(typeof s.fuehreAus, 'function', `${s.name}: fuehreAus() fehlt`)
    // Der Bereich muss ein echter Speicherbereich sein — ein Tippfehler hier
    // waere sonst nirgends zu sehen.
    assert.ok(s.bereich in KEYS, `${s.name}: „${s.bereich}" steht nicht in KEYS`)
  }
})

test('die Reihenfolge liegt fest — sie ist bedeutungstragend', async () => {
  frischerSpeicher()
  const { MIGRATIONEN } = await frischesModul()
  assert.deepEqual(
    MIGRATIONEN.map((s) => s.name),
    ['fortschritt-v1-v2', 'profil-v1-v2', 'sitzung-v1-v2', 'modus-zu-ui', 'karten-umbenennung'],
    'Die Umbenennung muss ZULETZT laufen — sonst findet sie einen frisch aus v1 ' +
      'gehobenen Lernstand noch gar nicht vor.'
  )
})

test('ein aus v1 gehobener Lernstand bekommt seine Kartenumbenennung', async () => {
  // Der Fall, den die alte Reihenfolge verfehlte: Wechsel direkt von
  // Version 1, mit Karten in einer Schreibweise, die der Kurs nicht mehr kennt.
  const speicher = frischerSpeicher()
  speicher.setItem(
    'red-kurd-fortschritt-v1',
    JSON.stringify({
      xp: 200,
      karten: {
        'Pilz|kundir|erkennen': { stufe: 4, faellig: '2026-08-09' },
        'Möchtest du Tee?|Tu çay dixwazî?|hoeren': { stufe: 2, faellig: '2026-08-10' },
        'Brot|nan|erkennen': { stufe: 1 },
      },
    })
  )
  const modul = await frischesModul()
  modul.migriere()

  const karten = modul.lies(modul.KEYS.fortschritt).karten
  assert.deepEqual(karten, {
    'Pilz|kivark|erkennen': { stufe: 4, faellig: '2026-08-09' },
    'Möchtest du Tee?|Tu çayê dixwazî?|hoeren': { stufe: 2, faellig: '2026-08-10' },
    'Brot|nan|erkennen': { stufe: 1 },
  })
  // Der Rest des gehobenen Standes bleibt unangetastet.
  assert.equal(modul.lies(modul.KEYS.fortschritt).xp, 200)
})

test('trifft eine gehobene Karte auf eine bestehende, gewinnt die hoehere Stufe', async () => {
  // Zwei Wege zur selben Karte: der alte Schluessel aus v1 und der neue, der
  // schon im v2-Stand liegt. Verloren gehen darf der weiter fortgeschrittene.
  const speicher = frischerSpeicher()
  speicher.setItem(
    'red-kurd-fortschritt-v1',
    JSON.stringify({ karten: { 'Pilz|kundir|erkennen': { stufe: 1 }, 'Pilz|kivark|erkennen': { stufe: 6 } } })
  )
  const modul = await frischesModul()
  modul.migriere()
  assert.deepEqual(modul.lies(modul.KEYS.fortschritt).karten, {
    'Pilz|kivark|erkennen': { stufe: 6 },
  })
})

test('migriere() berichtet je Schritt, was passiert ist', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem('red-kurd-fortschritt-v1', JSON.stringify({ xp: 120, serie: 2 }))
  const modul = await frischesModul()

  const bericht = modul.migriere()
  assert.equal(bericht.length, modul.MIGRATIONEN.length)

  const nach = Object.fromEntries(bericht.map((e) => [e.name, e.stand]))
  // Kein v2-Stand da -> nichts umzubenennen; der v1-Stand wird gehoben.
  assert.equal(nach['karten-umbenennung'], 'uebersprungen')
  assert.equal(nach['fortschritt-v1-v2'], 'gelaufen')
  assert.equal(nach['profil-v1-v2'], 'uebersprungen')
  assert.equal(nach['sitzung-v1-v2'], 'uebersprungen')
  // Die Oberflaeche wird immer angelegt, auch ohne Altwert.
  assert.equal(nach['modus-zu-ui'], 'gelaufen')
  assert.ok(bericht.every((e) => e.fehler === undefined), 'unerwarteter Fehler')
})

test('der zweite Aufruf berichtet nichts mehr', async () => {
  frischerSpeicher()
  const modul = await frischesModul()
  assert.ok(modul.migriere().length > 0)
  assert.deepEqual(modul.migriere(), [], 'die Migration lief ein zweites Mal')
})

test('ohne localStorage berichtet migriere() nichts und wirft nicht', async () => {
  globalThis.localStorage = undefined
  const modul = await frischesModul()
  assert.doesNotThrow(() => modul.migriere())
  assert.deepEqual(modul.migriere(), [])
})

test('ein einzelner Schritt laesst sich gezielt ausfuehren', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem('red-kurd-profil-v1', JSON.stringify({ name: 'Rojîn', minuten: '5' }))
  const modul = await frischesModul()

  const schritt = modul.MIGRATIONEN.find((s) => s.name === 'profil-v1-v2')
  assert.ok(schritt.noetig(), 'der Schritt haette anstehen muessen')

  const ergebnis = modul.fuehreSchrittAus(schritt)
  assert.equal(ergebnis.stand, 'gelaufen')
  assert.equal(modul.lies(modul.KEYS.profil).name, 'Rojîn')
  assert.equal(modul.lies(modul.KEYS.profil).tagesziel, 10)

  // Und nur dieser eine — der Rest bleibt unangetastet.
  assert.equal(modul.lies(modul.KEYS.ui), null)
  assert.equal(modul.lies(modul.KEYS.fortschritt), null)

  // Ein zweites Mal ist er nicht mehr noetig.
  assert.equal(schritt.noetig(), false)
  assert.equal(modul.fuehreSchrittAus(schritt).stand, 'uebersprungen')
})

test('noetig() entscheidet, ohne etwas zu schreiben', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem('red-kurd-fortschritt-v1', JSON.stringify({ xp: 5 }))
  const modul = await frischesModul()

  const vorher = new Map(speicher.daten)
  for (const s of modul.MIGRATIONEN) s.noetig()
  assert.deepEqual(
    Object.fromEntries(speicher.daten),
    Object.fromEntries(vorher),
    'noetig() hat geschrieben — es darf nur fragen'
  )
})

test('ein stolpernder Schritt reisst die anderen nicht mit', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem('red-kurd-profil-v1', JSON.stringify({ name: 'Baran' }))
  const modul = await frischesModul()

  // Genau das ist der Grund fuer die Pipeline: vorher war es EINE Funktion,
  // in der ein Fehler beim Lernstand auch Profil, Sitzung und Oberflaeche
  // ungehoben gelassen haette.
  const kaputt = {
    name: 'absichtlich-kaputt',
    bereich: 'fortschritt',
    von: 'x',
    nach: 'y',
    beschreibung: 'Wirft, um die Absicherung zu pruefen.',
    noetig: () => true,
    fuehreAus() {
      throw new Error('geplatzt')
    },
  }

  const ergebnis = modul.fuehreSchrittAus(kaputt)
  assert.equal(ergebnis.stand, 'fehlgeschlagen')
  assert.equal(ergebnis.fehler, 'geplatzt')

  // Die echten Schritte laufen danach ganz normal.
  const bericht = modul.migriere()
  const nach = Object.fromEntries(bericht.map((e) => [e.name, e.stand]))
  assert.equal(nach['profil-v1-v2'], 'gelaufen')
  assert.equal(modul.lies(modul.KEYS.profil).name, 'Baran')
})

test('auch ein Schritt, dessen noetig() wirft, bleibt folgenlos', async () => {
  frischerSpeicher()
  const modul = await frischesModul()
  const ergebnis = modul.fuehreSchrittAus({
    name: 'frage-wirft',
    bereich: 'ui',
    von: 'x',
    nach: 'y',
    beschreibung: 'Die Frage selbst wirft.',
    noetig() {
      throw new TypeError('kaputte Frage')
    },
    fuehreAus() {
      throw new Error('darf nie laufen')
    },
  })
  assert.equal(ergebnis.stand, 'fehlgeschlagen')
  assert.equal(ergebnis.fehler, 'kaputte Frage')
})

test('kein Schritt fasst einen fremden Speicherschluessel an', async () => {
  const speicher = frischerSpeicher()
  speicher.setItem('irgendeine-andere-app', '{"wichtig":true}')
  speicher.setItem('red-kurd-fortschritt-v1', JSON.stringify({ xp: 1 }))
  const modul = await frischesModul()
  modul.migriere()
  assert.equal(speicher.getItem('irgendeine-andere-app'), '{"wichtig":true}')
})
