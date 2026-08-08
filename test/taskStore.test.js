// Tests fuer die Wochenaufgaben: Sie beginnen montags bei null.
// Regression: Das fruehere rollierende 7-Tage-Fenster enthielt Montag frueh
// noch die Vorwoche — Belohnungen waren ohne neue Lernleistung erneut abholbar.
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

const { setzeFortschritt } = await import('../src/core/progress/progressStore.ts')
const { wochenMinutenSeitMontag, wochenStartTag, wochenSummeSeitMontag } = await import(
  '../src/core/progress/progressSelectors.ts'
)
const { holeAufgaben, holeBelohnung } = await import('../src/core/tasks/taskStore.ts')

/** Kalendertag mit Abstand zu einem 'JJJJ-MM-TT'-Tag. */
function tagMitAbstand(tag, tage) {
  const [jahr, monat, tagZahl] = tag.split('-').map(Number)
  const d = new Date(jahr, monat - 1, tagZahl + tage)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const tt = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${tt}`
}

function tagVonHeute() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const tt = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${tt}`
}

test('wochenStartTag ist ein Montag und liegt nicht in der Zukunft', () => {
  const start = wochenStartTag()
  assert.match(start, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(new Date(`${start}T12:00:00`).getDay(), 1, 'Montag hat getDay() === 1')
  assert.ok(start <= tagVonHeute())
})

test('die Wochenzaehler ignorieren Leistung aus der Vorwoche', () => {
  const start = wochenStartTag()
  setzeFortschritt({
    tage: {
      // Sonntag der Vorwoche — laege im alten 7-Tage-Fenster fast immer drin.
      [tagMitAbstand(start, -1)]: { aufgaben: 200, richtig: 180, sekunden: 7200 },
      [tagVonHeute()]: { aufgaben: 10, richtig: 9, sekunden: 600 },
    },
  })
  assert.equal(wochenSummeSeitMontag(), 10)
  assert.equal(wochenMinutenSeitMontag(), 10)
})

test('Vorwochen-Leistung schaltet keine Wochenaufgabe frei', () => {
  const start = wochenStartTag()
  setzeFortschritt({
    tage: { [tagMitAbstand(start, -1)]: { aufgaben: 200, richtig: 180, sekunden: 7200 } },
  })
  const { woechentlich } = holeAufgaben()
  const w100 = woechentlich.find((a) => a.id === 'w-100')
  const wZeit = woechentlich.find((a) => a.id === 'w-zeit')
  assert.equal(w100.stand, 0)
  assert.equal(w100.geschafft, false)
  assert.equal(wZeit.stand, 0)
  assert.equal(wZeit.geschafft, false)
})

test('Leistung seit Montag zaehlt — und eine Belohnung gibt es nur einmal', () => {
  setzeFortschritt({
    tage: { [tagVonHeute()]: { aufgaben: 150, richtig: 140, sekunden: 4000 } },
  })
  const { woechentlich } = holeAufgaben()
  const w100 = woechentlich.find((a) => a.id === 'w-100')
  assert.equal(w100.stand, 100)
  assert.equal(w100.geschafft, true)

  const belohnung = holeBelohnung('w-100')
  assert.deepEqual(belohnung, { xp: 100, edelsteine: 5 })
  assert.equal(holeBelohnung('w-100'), null, 'zweite Abholung ist gesperrt')
})

test('Tagesaufgaben zaehlen nur den heutigen Tag', () => {
  const start = wochenStartTag()
  setzeFortschritt({
    tage: {
      [tagMitAbstand(start, -1)]: { aufgaben: 50, richtig: 40, sekunden: 1000 },
      [tagVonHeute()]: { aufgaben: 12, richtig: 10, sekunden: 300, skills: { hoeren: 6 } },
    },
  })
  const { taeglich } = holeAufgaben()
  const wdh = taeglich.find((a) => a.id === 't-wdh')
  const hoeren = taeglich.find((a) => a.id === 't-hoeren')
  assert.equal(wdh.stand, 10)
  assert.equal(wdh.geschafft, true)
  assert.equal(hoeren.stand, 5)
})
