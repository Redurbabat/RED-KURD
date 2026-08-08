// Tests fuer die Sprachaufnahmen, soweit sie ohne IndexedDB pruefbar sind.
//
// IndexedDB gibt es in Node nicht. Der Speicherteil wird deshalb im Browser
// geprueft; hier steht, was rein rechnerisch ist — und das ist genau die
// Stelle, an der eine Groessenangabe falsch werden kann.
import test from 'node:test'
import assert from 'node:assert/strict'

// audioService laedt uiStore, das wiederum storage anfasst.
class SpeicherAttrappe {
  constructor() { this.daten = new Map() }
  getItem(k) { return this.daten.has(k) ? this.daten.get(k) : null }
  setItem(k, v) { this.daten.set(k, String(v)) }
  removeItem(k) { this.daten.delete(k) }
}
globalThis.localStorage = new SpeicherAttrappe()

const { groesseText } = await import('../src/core/audio/audioService.js')

test('Groessen werden lesbar und ohne Nachkommastellen-Unsinn ausgegeben', () => {
  assert.equal(groesseText(0), '0 KB')
  // Alles unter einem Kilobyte als „0 KB" zu zeigen waere irrefuehrend: es ist
  // etwas da. Deshalb die kleinste sichtbare Einheit.
  assert.equal(groesseText(1), '1 KB')
  assert.equal(groesseText(500), '1 KB')
  assert.equal(groesseText(1023), '1 KB')
  assert.equal(groesseText(1024), '1 KB')
  assert.equal(groesseText(1536), '2 KB')
  assert.equal(groesseText(120 * 1024), '120 KB')
  assert.equal(groesseText(1024 * 1024), '1,0 MB')
  assert.equal(groesseText(1024 * 1024 * 2.5), '2,5 MB')
  // Deutsche Schreibweise mit Komma, nicht mit Punkt.
  assert.ok(!groesseText(1024 * 1024 * 3.7).includes('.'))
})

test('kaputte Groessen ergeben keinen kaputten Text', () => {
  for (const wert of [null, undefined, NaN, -5, 'viel', {}, [], Infinity, -Infinity]) {
    const text = groesseText(wert)
    assert.equal(typeof text, 'string')
    assert.ok(!text.includes('NaN'), `„${String(wert)}" ergab ${text}`)
    assert.ok(!text.includes('Infinity'), `„${String(wert)}" ergab ${text}`)
    assert.ok(!text.includes('undefined'), `„${String(wert)}" ergab ${text}`)
  }
  assert.equal(groesseText(NaN), '0 KB')
  assert.equal(groesseText(-5), '0 KB')
})

test('das Modul laedt ohne IndexedDB und ohne Browser', async () => {
  // Wichtig: keine der Funktionen darf beim blossen Laden schon auf
  // indexedDB zugreifen — sonst bricht jeder Test, der audioService nur
  // mitimportiert (z. B. ueber ExercisePlayer).
  assert.equal(typeof globalThis.indexedDB, 'undefined')
  const modul = await import('../src/core/audio/audioService.js')
  for (const name of [
    'speichereAufnahme',
    'holeAufnahme',
    'loescheAufnahme',
    'loescheAlleAufnahmen',
    'alleAufnahmen',
    'aufnahmenBilanz',
    'groesseText',
  ]) {
    assert.equal(typeof modul[name], 'function', `${name} fehlt`)
  }
})

test('ohne IndexedDB liefern die Lesewege leere Ergebnisse statt zu werfen', async () => {
  // Auf einem Geraet ohne IndexedDB (privater Modus mancher Browser) darf die
  // Fortschrittsseite nicht weiss bleiben.
  const { alleAufnahmen, aufnahmenBilanz, holeAufnahme, loescheAufnahme, loescheAlleAufnahmen } =
    await import('../src/core/audio/audioService.js')
  assert.deepEqual(await alleAufnahmen(), [])
  assert.deepEqual(await aufnahmenBilanz(), { anzahl: 0, bytes: 0 })
  assert.equal(await holeAufnahme('silav'), null)
  assert.equal(await loescheAufnahme('silav'), false)
  assert.equal(await loescheAlleAufnahmen(), false)
})
