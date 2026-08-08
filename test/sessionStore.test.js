// Tests fuer die laufende Sitzung: sichern, laden, verwerfen.
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
const { sitzungLaden, sitzungLoeschen, sitzungProzent, sitzungSpeichern } = await import(
  '../src/core/session/sessionStore.ts'
)

const UEBUNGEN = [{ art: 'tippen' }, { art: 'tippen' }, { art: 'tippen' }, { art: 'tippen' }]

test('sichern und laden sind ein Paar — mit Zeitstempel', () => {
  sitzungSpeichern({ titel: 'Test', index: 2, punkte: 1, uebungen: UEBUNGEN })
  const s = sitzungLaden()
  assert.equal(s.index, 2)
  assert.equal(s.punkte, 1)
  assert.ok(s.gespeichert, 'der Zeitstempel wird beim Sichern ergaenzt')
  assert.equal(sitzungProzent(s), 50)
})

test('eine fertige oder leere Sitzung wird nicht angeboten', () => {
  sitzungSpeichern({ index: 4, uebungen: UEBUNGEN })
  assert.equal(sitzungLaden(), null)
  sitzungSpeichern({ index: 0, uebungen: [] })
  assert.equal(sitzungLaden(), null)
  sitzungLoeschen()
  assert.equal(sitzungLaden(), null)
})

test('ein korrupter Zeiger (fehlend, NaN, negativ) verwirft die Sitzung', () => {
  schreibe(KEYS.sitzung, { uebungen: UEBUNGEN, gespeichert: new Date().toISOString() })
  assert.equal(sitzungLaden(), null)
  schreibe(KEYS.sitzung, { index: NaN, uebungen: UEBUNGEN })
  assert.equal(sitzungLaden(), null)
  schreibe(KEYS.sitzung, { index: -1, uebungen: UEBUNGEN })
  assert.equal(sitzungLaden(), null)
  schreibe(KEYS.sitzung, { index: 1.5, uebungen: UEBUNGEN })
  assert.equal(sitzungLaden(), null)
})

test('eine tagelang liegengebliebene Sitzung verfaellt', () => {
  const vorDreiTagen = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  schreibe(KEYS.sitzung, { index: 1, uebungen: UEBUNGEN, gespeichert: vorDreiTagen })
  assert.equal(sitzungLaden(), null)
})

test('eine frische Sitzung von gestern Abend bleibt fortsetzbar', () => {
  const vorZwoelfStunden = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  schreibe(KEYS.sitzung, { index: 1, uebungen: UEBUNGEN, gespeichert: vorZwoelfStunden })
  assert.ok(sitzungLaden())
})

test('ein unlesbarer Zeitstempel verwirft die Sitzung lieber', () => {
  schreibe(KEYS.sitzung, { index: 1, uebungen: UEBUNGEN, gespeichert: 'kein-datum' })
  assert.equal(sitzungLaden(), null)
})

test('Altbestand ohne Zeitstempel bleibt nutzbar', () => {
  schreibe(KEYS.sitzung, { index: 1, uebungen: UEBUNGEN })
  assert.ok(sitzungLaden(), 'alte Sitzungen ohne gespeichert-Feld nicht wegwerfen')
})

test('sitzungProzent bleibt auch bei Unsinn eine Zahl', () => {
  assert.equal(sitzungProzent(null), 0)
  assert.equal(sitzungProzent({ uebungen: [] }), 0)
})
