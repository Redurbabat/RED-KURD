// Tests fuer die Auszeichnungen: aus dem Lernstand berechnet, einmal
// erreicht bleibt das Datum stehen.
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

const { setzeFortschritt } = await import('../src/core/progress/progressStore.js')
const { AUSZEICHNUNGEN, anzahlFrei, holeAuszeichnungen, zuruecksetzen } = await import(
  '../src/core/achievements/achievementsStore.js'
)
const { heute } = await import('../src/core/progress/scheduler.js')

test('jede Auszeichnung traegt Name, Beschreibung und eine Pruefung', () => {
  const ids = AUSZEICHNUNGEN.map((a) => a.id)
  assert.equal(new Set(ids).size, ids.length, 'Ids sind einmalig')
  for (const a of AUSZEICHNUNGEN) {
    assert.ok(a.name && a.beschreibung && typeof a.pruefe === 'function', a.id)
  }
})

test('ohne Lernstand ist nichts frei — aber alles sichtbar', () => {
  zuruecksetzen()
  setzeFortschritt({})
  const liste = holeAuszeichnungen()
  assert.equal(liste.length, AUSZEICHNUNGEN.length)
  assert.equal(anzahlFrei(), 0)
  for (const a of liste) assert.equal(a.seit, null)
})

test('erreichte Auszeichnungen werden frei und mit Datum gemerkt', () => {
  zuruecksetzen()
  setzeFortschritt({
    serie: 7,
    karten: { 'Brot|nan|erkennen': { stufe: 1 } },
  })
  const liste = holeAuszeichnungen()
  const serie3 = liste.find((a) => a.id === 'serie-3')
  const woche = liste.find((a) => a.id === 'wochen-lerner')
  const schritte = liste.find((a) => a.id === 'erste-schritte')
  assert.equal(serie3.frei, true)
  assert.equal(woche.frei, true)
  assert.equal(schritte.frei, true)
  assert.equal(serie3.seit, heute())
  assert.ok(liste.find((a) => a.id === 'meisterschueler').frei === false)
})

test('das Erreicht-Datum bleibt stehen, auch wenn die Bedingung spaeter kippt', () => {
  zuruecksetzen()
  setzeFortschritt({ serie: 3 })
  holeAuszeichnungen()
  // Serie reisst ab — die Auszeichnung wurde aber schon einmal erreicht.
  setzeFortschritt({ serie: 0 })
  const danach = holeAuszeichnungen().find((a) => a.id === 'serie-3')
  assert.equal(danach.seit, heute(), 'das gemerkte Datum ueberlebt den Rueckfall')
})
