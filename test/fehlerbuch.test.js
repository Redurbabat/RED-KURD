// Tests fuer das Fehlerbuch: notieren, loeschen, lokal gespeichert.
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

const { fehlerNotieren, fehlerEntfernen, fehlerbuchEintraege } = await import(
  '../src/features/code-learning/fehlerbuchStore.js'
)
const { KEYS, lies } = await import('../src/core/storage.js')
const { heute } = await import('../src/core/progress/scheduler.ts')

test('ein Eintrag braucht Titel und Fehlerbeschreibung', () => {
  assert.equal(fehlerNotieren({ titel: '', fehler: 'x' }), null)
  assert.equal(fehlerNotieren({ titel: '   ', fehler: 'x' }), null)
  assert.equal(fehlerNotieren({ titel: 'x', fehler: '' }), null)
  assert.equal(fehlerbuchEintraege().length, 0)
})

test('notieren speichert mit Datum, neueste stehen oben', () => {
  const erster = fehlerNotieren({ titel: 'Button tot', fehler: 'Klick tat nichts' })
  const zweiter = fehlerNotieren({
    titel: 'Bild fehlt',
    fehler: '404 fuer /bilder/x.jpg',
    loesung: 'Pfad war falsch geschrieben',
  })
  assert.ok(erster && zweiter)
  assert.equal(erster.datum, heute())
  const liste = fehlerbuchEintraege()
  assert.equal(liste.length, 2)
  assert.equal(liste[0].titel, 'Bild fehlt', 'der neueste zuerst')
  assert.equal(liste[0].loesung, 'Pfad war falsch geschrieben')
  assert.notEqual(liste[0].id, liste[1].id)
})

test('entfernen loescht genau einen Eintrag', () => {
  const liste = fehlerbuchEintraege()
  assert.equal(fehlerEntfernen(liste[1].id), true)
  assert.equal(fehlerEntfernen('f-gibt-es-nicht'), false)
  assert.equal(fehlerbuchEintraege().length, 1)
  assert.equal(fehlerbuchEintraege()[0].titel, 'Bild fehlt')
})

test('alles liegt unter dem eigenen Schluessel im lokalen Speicher', () => {
  assert.equal(KEYS.fehlerbuch, 'red-kurd-fehlerbuch-v1')
  const roh = lies(KEYS.fehlerbuch)
  assert.equal(roh.eintraege.length, 1)
  assert.ok(roh.naechsteId >= 3, 'Ids werden nie wiederverwendet')
})
