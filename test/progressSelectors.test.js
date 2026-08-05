// Tests fuer die Lernstand-Auswertungen: Statistik, Fertigkeiten, Woche.
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
const {
  faelligeKarten,
  fertigkeiten,
  fertigkeitStufe,
  schwaechsteFertigkeit,
  schwierigeKarten,
  statistik,
  wochenAktivitaet,
} = await import('../src/core/progress/progressSelectors.js')
const { heute, tagPlus } = await import('../src/core/progress/scheduler.js')

test('statistik zaehlt Woerter als Paare, Karten je Fertigkeit', () => {
  setzeFortschritt({
    xp: 120,
    serie: 4,
    karten: {
      'Brot|nan|erkennen': { stufe: 3 },
      'Brot|nan|schreiben': { stufe: 1 },
      'Wasser|av|erkennen': { stufe: 4 },
    },
  })
  const s = statistik()
  assert.equal(s.gelernt, 2, 'zwei Wortpaare')
  assert.equal(s.karten, 3, 'drei Karten')
  assert.equal(s.sicher, 2, 'ab Stufe 3 gilt sicher')
  assert.equal(s.level, 2)
})

test('faellige Karten: ohne Datum sofort, kuenftige nicht', () => {
  setzeFortschritt({
    karten: {
      'a|1|erkennen': { stufe: 0 },
      'b|2|erkennen': { stufe: 1, faellig: tagPlus(-1) },
      'c|3|erkennen': { stufe: 2, faellig: heute() },
      'd|4|erkennen': { stufe: 5, faellig: tagPlus(3) },
    },
  })
  const faellig = faelligeKarten().map((k) => k.de)
  assert.deepEqual(faellig.sort(), ['a', 'b', 'c'])
})

test('fertigkeiten rechnen sichere Karten in Prozent, gemischt zaehlt nicht', () => {
  setzeFortschritt({
    karten: {
      'a|1|erkennen': { stufe: 4 },
      'b|2|erkennen': { stufe: 0 },
      'c|3|schreiben': { stufe: 3 },
      'd|4': { stufe: 5 }, // Alt-Karte ohne Skill -> 'gemischt', faellt raus
    },
  })
  const f = fertigkeiten()
  assert.equal(f.erkennen, 50)
  assert.equal(f.erkennenAnzahl, 2)
  assert.equal(f.schreiben, 100)
  assert.equal(f.hoeren, 0)
  assert.equal(f.hoerenAnzahl, 0)
})

test('die schwaechste Fertigkeit braucht mindestens eine Karte', () => {
  setzeFortschritt({})
  assert.equal(schwaechsteFertigkeit(), null)
  setzeFortschritt({
    karten: { 'a|1|schreiben': { stufe: 0 }, 'b|2|erkennen': { stufe: 4 } },
  })
  assert.equal(schwaechsteFertigkeit(), 'schreiben')
})

test('fertigkeitStufe hat klare Schwellen', () => {
  assert.equal(fertigkeitStufe(80), 'Stark')
  assert.equal(fertigkeitStufe(50), 'Fortgeschritten')
  assert.equal(fertigkeitStufe(25), 'Auf dem Weg')
  assert.equal(fertigkeitStufe(0), 'Am Anfang')
})

test('schwierigeKarten sind faellige Stufe-0-Karten, oft gesehene zuerst', () => {
  setzeFortschritt({
    karten: {
      'selten|1|erkennen': { stufe: 0, gesehen: 2 },
      'oft|2|erkennen': { stufe: 0, gesehen: 9 },
      'kann-ich|3|erkennen': { stufe: 4, faellig: tagPlus(-1) },
    },
  })
  const schwer = schwierigeKarten(5)
  assert.deepEqual(
    schwer.map((k) => k.de),
    ['oft', 'selten']
  )
})

test('wochenAktivitaet liefert sieben Tage und markiert heute', () => {
  setzeFortschritt({
    tage: { [heute()]: { aufgaben: 5, richtig: 4, sekunden: 120 } },
  })
  const woche = wochenAktivitaet()
  assert.equal(woche.length, 7)
  const letzter = woche[woche.length - 1]
  assert.equal(letzter.heute, true)
  assert.equal(letzter.anzahl, 5)
  assert.equal(woche.filter((t) => t.heute).length, 1)
})
