// Tests fuer den Lernstand der neuen Bereiche: erledigt, XP, Serie,
// abgeleitete Status. Ein Baukasten — hier mit einem Testschluessel.
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

const { erstelleBereichsLernstand, XP_JE_LEKTION } = await import(
  '../src/core/lernbereiche/bereichsLernstand.js'
)
const { heute } = await import('../src/core/progress/scheduler.js')

const LEKTIONEN = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

function frisch(name) {
  globalThis.localStorage.removeItem(name)
  return erstelleBereichsLernstand(name)
}

test('am Anfang: erste Lektion aktuell, zweite offen, Rest gesperrt', () => {
  const stand = frisch('test-bereich-1')
  assert.deepEqual(stand.statusFuer(LEKTIONEN), { a: 'current', b: 'open', c: 'locked', d: 'locked' })
  assert.equal(stand.fortschrittProzent(LEKTIONEN), 0)
  assert.equal(stand.xpHeute(), 0)
  assert.equal(stand.serie(), 0)
})

test('eine abgeschlossene Lektion gibt einmal XP und rueckt alles weiter', () => {
  const stand = frisch('test-bereich-2')
  assert.equal(stand.schliesseAb('a'), XP_JE_LEKTION)
  assert.equal(stand.schliesseAb('a'), 0, 'zweiter Abschluss gibt nichts')
  assert.deepEqual(stand.statusFuer(LEKTIONEN), { a: 'done', b: 'current', c: 'open', d: 'locked' })
  assert.equal(stand.fortschrittProzent(LEKTIONEN), 25)
  assert.equal(stand.xpHeute(), XP_JE_LEKTION)
  assert.equal(stand.serie(), 1, 'der erste Lerntag startet die Serie')
  assert.equal(stand.stand().letzterTag, heute())
})

test('auch eine uebersprungene Lektion laesst die Ableitung stabil', () => {
  const stand = frisch('test-bereich-3')
  stand.schliesseAb('b') // jemand macht b vor a
  const status = stand.statusFuer(LEKTIONEN)
  assert.equal(status.b, 'done')
  assert.equal(status.a, 'current', 'a bleibt die naechste aktuelle')
  assert.equal(status.c, 'open')
})

test('der Lernstand ueberlebt eine frische Instanz (gespeichert)', () => {
  const stand = frisch('test-bereich-4')
  stand.schliesseAb('a')
  stand.schliesseAb('b')
  const zweite = erstelleBereichsLernstand('test-bereich-4')
  assert.equal(zweite.istErledigt('a'), true)
  assert.equal(zweite.istErledigt('b'), true)
  assert.equal(zweite.fortschrittProzent(LEKTIONEN), 50)
  assert.equal(zweite.xpHeute(), 2 * XP_JE_LEKTION)
})

test('zwei Bereiche mit verschiedenen Schluesseln bleiben getrennt', () => {
  const code = frisch('test-bereich-code')
  const prompting = frisch('test-bereich-prompting')
  code.schliesseAb('a')
  assert.equal(code.istErledigt('a'), true)
  assert.equal(prompting.istErledigt('a'), false)
  assert.equal(prompting.xpHeute(), 0)
})

test('leere Lektionslisten ergeben 0 Prozent statt Division durch null', () => {
  const stand = frisch('test-bereich-5')
  assert.equal(stand.fortschrittProzent([]), 0)
  assert.deepEqual(stand.statusFuer([]), {})
})
