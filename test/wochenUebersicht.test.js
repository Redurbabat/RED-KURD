// Tests der gemeinsamen Wochenübersicht: sieben Tage, ehrliche Zahlen,
// keine erfundene Gesamtsumme über verschiedene Einheiten.
import test from 'node:test'
import assert from 'node:assert/strict'

const { appWoche, reiheGesamt, wochenTage, wochenUebersicht } = await import(
  '../src/core/lernbereiche/wochenUebersicht.ts'
)

test('wochenTage liefert sieben Tage, heute zuletzt', () => {
  const tage = wochenTage('2026-08-05')
  assert.equal(tage.length, 7)
  assert.equal(tage[0].datum, '2026-07-30')
  assert.equal(tage[6].datum, '2026-08-05')
  assert.equal(tage[6].heute, true)
  assert.equal(tage[0].heute, false)
  // Der 5. August 2026 ist ein Mittwoch
  assert.equal(tage[6].kurz, 'Mi')
})

test('wochenTage haelt einen Monatswechsel aus', () => {
  const tage = wochenTage('2026-03-02')
  assert.equal(tage[0].datum, '2026-02-24')
  assert.equal(tage.length, 7)
})

test('ein kaputtes Datum liefert eine leere Woche statt eines Absturzes', () => {
  assert.deepEqual(wochenTage('kein datum'), [])
  assert.deepEqual(wochenTage(''), [])
})

test('appWoche zaehlt einfache Zahlen (XP-Apps)', () => {
  const tage = wochenTage('2026-08-05')
  const app = appWoche(
    { id: 'code', name: 'Code lernen', einheit: 'XP', tage: { '2026-08-05': 30, '2026-08-03': 10 } },
    tage
  )
  assert.equal(app.summe, 40)
  assert.equal(app.aktiveTage, 2)
  assert.equal(app.hoechster, 30)
  assert.equal(app.werte[6], 30, 'heute steht hinten')
})

test('appWoche holt bei der Sprach-App das richtige Feld', () => {
  const tage = wochenTage('2026-08-05')
  const app = appWoche(
    {
      id: 'language',
      name: 'Sprache lernen',
      einheit: 'Aufgaben',
      feld: 'aufgaben',
      tage: {
        '2026-08-05': { aufgaben: 12, richtig: 10, sekunden: 300 },
        '2026-08-04': { aufgaben: 0, richtig: 0, sekunden: 0 },
      },
    },
    tage
  )
  assert.equal(app.summe, 12)
  assert.equal(app.aktiveTage, 1, 'ein Tag mit 0 Aufgaben zaehlt nicht als aktiv')
})

test('fehlende oder kaputte Tage werden zu 0, nicht zu NaN', () => {
  const tage = wochenTage('2026-08-05')
  const app = appWoche(
    { id: 'x', name: 'X', einheit: 'XP', tage: { '2026-08-05': null, '2026-08-04': 'viel' } },
    tage
  )
  assert.equal(app.summe, 0)
  assert.equal(app.aktiveTage, 0)
  assert.ok(app.werte.every((w) => Number.isFinite(w)))
})

test('die Uebersicht rechnet die Einheiten NICHT zusammen', () => {
  const uebersicht = wochenUebersicht(
    [
      { id: 'language', name: 'Sprache', einheit: 'Aufgaben', feld: 'aufgaben', tage: { '2026-08-05': { aufgaben: 12 } } },
      { id: 'code', name: 'Code', einheit: 'XP', tage: { '2026-08-04': 20 } },
    ],
    '2026-08-05'
  )
  assert.equal(uebersicht.apps.length, 2)
  assert.equal(uebersicht.apps[0].summe, 12)
  assert.equal(uebersicht.apps[1].summe, 20)
  assert.ok(!('gesamt' in uebersicht), 'Aufgaben und XP duerfen nie addiert werden')
  // Zwei verschiedene Tage, an denen etwas los war
  assert.equal(uebersicht.aktiveTage, 2)
})

test('ein Tag zaehlt als aktiv, sobald IRGENDEINE App etwas verzeichnet', () => {
  const uebersicht = wochenUebersicht(
    [
      { id: 'code', name: 'Code', einheit: 'XP', tage: { '2026-08-05': 10 } },
      { id: 'electro', name: 'Elektro', einheit: 'XP', tage: {} },
    ],
    '2026-08-05'
  )
  assert.equal(uebersicht.tageAktiv[6], true)
  assert.equal(uebersicht.tageAktiv[5], false)
  assert.equal(uebersicht.aktiveTage, 1)
})

test('ohne jede Aktivitaet bleibt die Woche leer — ohne Absturz', () => {
  const uebersicht = wochenUebersicht([], '2026-08-05')
  assert.equal(uebersicht.aktiveTage, 0)
  assert.equal(uebersicht.tage.length, 7)
  assert.deepEqual(uebersicht.apps, [])
})

test('die Reihe zaehlt Tage am Stueck — heute darf noch leer sein', () => {
  // Mo Di Mi Do Fr Sa So(heute)
  assert.equal(reiheGesamt([false, false, false, true, true, true, true]), 4)
  // Heute noch nichts: ab gestern zaehlen, die Reihe bleibt erhalten
  assert.equal(reiheGesamt([false, false, true, true, true, true, false]), 4)
  // Gestern und heute nichts: die Reihe ist wirklich vorbei
  assert.equal(reiheGesamt([true, true, true, true, false, false, false]), 0)
  assert.equal(reiheGesamt([]), 0)
  assert.equal(reiheGesamt([true, true, true, true, true, true, true]), 7)
})
