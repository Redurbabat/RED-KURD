// Tests fuer den Sitzungsplaner: Mischung aus Wiederholungen und neuem Stoff.
import test from 'node:test'
import assert from 'node:assert/strict'
import { setzeFortschritt } from '../src/core/progress/progressStore.js'
import { EINHEITEN, holeEinheit } from '../src/core/courses/courseRepository.js'
import {
  DAUERN,
  dauerVon,
  planeLektion,
  planeSitzung,
  planeTraining,
  planeWiederholung,
} from '../src/core/session/sessionPlanner.js'

/** Faellige Karten aus echten Kurswoertern bauen, damit Aufgaben entstehen koennen. */
function faelligeKartenAus(anzahlWoerter, skill = 'erkennen') {
  const karten = {}
  const woerter = EINHEITEN.flatMap((e) => e.woerter).slice(0, anzahlWoerter)
  for (const w of woerter) {
    karten[`${w.de}|${w.ku}|${skill}`] = { stufe: 1, faellig: '2020-01-01', gesehen: 2, richtig: 1 }
  }
  return karten
}

test('die Dauerstufen sind vollstaendig und dauerVon faellt auf Standard zurueck', () => {
  assert.deepEqual(DAUERN.map((d) => d.id), ['kurz', 'standard', 'intensiv'])
  assert.equal(dauerVon('gibt-es-nicht').id, 'standard')
  assert.equal(dauerVon('kurz').aufgaben, 8)
})

test('ohne Lernstand besteht die Sitzung nur aus neuem Stoff', () => {
  setzeFortschritt({})
  const plan = planeSitzung('kurz')
  assert.equal(plan.wiederholungen, 0)
  assert.ok(plan.neueWoerter > 0)
  assert.ok(plan.uebungen.length > 0)
  assert.ok(plan.uebungen.length <= 8)
  assert.equal(plan.rueckstand, false)
})

test('bei grossem Rueckstand haben Wiederholungen Vorrang', () => {
  setzeFortschritt({ karten: faelligeKartenAus(30) })
  const plan = planeSitzung('kurz')
  assert.equal(plan.rueckstand, true)
  assert.equal(plan.faelligGesamt, 30)
  assert.ok(plan.wiederholungen >= plan.neueWoerter)
  assert.ok(plan.uebungen.length <= 8)
})

test('planeWiederholung nimmt nur faellige Karten und haelt die Obergrenze', () => {
  setzeFortschritt({ karten: faelligeKartenAus(20) })
  const plan = planeWiederholung(5)
  assert.equal(plan.anzahl, 5)
  assert.equal(plan.titel, 'Wiederholen')
  assert.ok(plan.uebungen.length <= 5)
})

test('planeWiederholung ohne faellige Karten bleibt leer statt zu raten', () => {
  setzeFortschritt({})
  const plan = planeWiederholung(5)
  assert.equal(plan.anzahl, 0)
  assert.equal(plan.uebungen.length, 0)
})

test('planeLektion baut Aufgaben nur aus den Arten des Abschnitts', () => {
  setzeFortschritt({})
  const einheit = EINHEITEN[0]
  const schreiben = einheit.lektionen.find((l) => l.id.endsWith('-schreiben'))
  const plan = planeLektion(einheit.id, schreiben.id)
  assert.ok(plan.uebungen.length > 0)
  assert.ok(plan.titel.includes(einheit.name))
  for (const u of plan.uebungen) assert.equal(u.art, 'tippen')
})

test('planeLektion versteht auch die Kurzform der Lektions-Id', () => {
  const einheit = EINHEITEN[0]
  const lang = planeLektion(einheit.id, `${einheit.id}-lernen`)
  const kurz = planeLektion(einheit.id, 'lernen')
  assert.equal(lang.lektion.id, kurz.lektion.id)
})

test('planeLektion mit unbekannter Einheit liefert null statt Absturz', () => {
  assert.equal(planeLektion('gibt-es-nicht', 'lernen'), null)
})

test('planeTraining uebt ausschliesslich die gewuenschte Art', () => {
  setzeFortschritt({ karten: faelligeKartenAus(15, 'schreiben') })
  const plan = planeTraining('tippen', 6)
  assert.ok(plan.uebungen.length > 0)
  for (const u of plan.uebungen) assert.equal(u.art, 'tippen')
})

test('planeTraining laesst skill-fremde faellige Karten draussen', () => {
  // Eine „erkennen"-Karte in einem Tipp-Training wuerde die falsche Karte
  // bewerten — die faellige Karte selbst bliebe fuer immer faellig.
  setzeFortschritt({ karten: faelligeKartenAus(15, 'erkennen') })
  const plan = planeTraining('tippen', 6)
  for (const u of plan.uebungen) {
    assert.notEqual(u.w.skill, 'erkennen', `${u.w.de} kam aus einer erkennen-Karte`)
  }
})

test('die gemeldeten Zahlen passen exakt zu den gebauten Uebungen', () => {
  for (const [karten, dauerId] of [
    [faelligeKartenAus(30), 'kurz'],
    [faelligeKartenAus(5), 'standard'],
    [{}, 'intensiv'],
  ]) {
    setzeFortschritt({ karten })
    const plan = planeSitzung(dauerId)
    assert.equal(
      plan.uebungen.length,
      plan.wiederholungen + plan.neueWoerter,
      'wiederholungen + neueWoerter muss die Uebungszahl ergeben'
    )
    assert.ok(plan.uebungen.length <= plan.dauer.aufgaben)
  }
})

test('dasselbe Wortpaar steht nur einmal in einer Wiederholung — egal wie viele Fertigkeiten faellig sind', () => {
  const wort = EINHEITEN[0].woerter[0]
  const karten = {}
  for (const skill of ['erkennen', 'abrufen', 'schreiben', 'hoeren']) {
    karten[`${wort.de}|${wort.ku}|${skill}`] = { stufe: 1, faellig: '2020-01-01' }
  }
  setzeFortschritt({ karten })
  const plan = planeWiederholung(10)
  assert.equal(plan.anzahl, 1)
})

test('die Einheit einer Lektion existiert wirklich im Kurs', () => {
  setzeFortschritt({})
  const plan = planeSitzung('standard')
  assert.ok(holeEinheit(plan.einheit.id))
})
