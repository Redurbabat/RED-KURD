// Tests fuer die Kursdaten: Vollstaendigkeit, Status-Logik, Fortschritt.
import test from 'node:test'
import assert from 'node:assert/strict'
import { setzeFortschritt } from '../src/core/progress/progressStore.js'
import {
  BESTANDEN_AB,
  EINHEITEN,
  LEKTIONS_ARTEN,
  WELTEN,
  aktuelleEinheit,
  einheitStatus,
  einheitenDerWelt,
  holeEinheit,
  holeLektion,
  kursFortschritt,
  weltPfad,
  weltStatus,
} from '../src/core/courses/courseRepository.ts'

// ===== Datenvollstaendigkeit =====

test('alle Einheiten-Ids sind einmalig', () => {
  const ids = EINHEITEN.map((e) => e.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('jede Welt verweist nur auf Einheiten, die es wirklich gibt', () => {
  for (const welt of WELTEN) {
    for (const id of welt.einheiten) {
      assert.ok(holeEinheit(id), `Welt ${welt.id} verweist auf unbekannte Einheit ${id}`)
    }
  }
})

test('jede Einheit hat genug Woerter fuer Wahl-Aufgaben mit vier Antworten', () => {
  for (const e of EINHEITEN) {
    assert.ok(e.woerter.length >= 4, `Einheit ${e.id} hat nur ${e.woerter.length} Woerter`)
    for (const w of e.woerter) {
      assert.ok(w.de && w.ku, `Einheit ${e.id}: Wort ohne beide Seiten`)
    }
  }
})

test('jede Einheit traegt die fuenf Abschnitte in fester Reihenfolge', () => {
  for (const e of EINHEITEN) {
    assert.deepEqual(
      e.lektionen.map((l) => l.id),
      LEKTIONS_ARTEN.map((l) => `${e.id}-${l.id}`)
    )
    assert.ok(e.lektionen[e.lektionen.length - 1].pruefung, 'der letzte Abschnitt ist die Pruefung')
  }
})

test('kein Wortpaar ist innerhalb einer Einheit doppelt', () => {
  for (const e of EINHEITEN) {
    const paare = e.woerter.map((w) => `${w.de}|${w.ku}`)
    assert.equal(new Set(paare).size, paare.length, `Doppelte Paare in ${e.id}`)
  }
})

// ===== Status-Logik =====

test('am Anfang ist genau die erste Einheit aktuell, der Rest gesperrt', () => {
  setzeFortschritt({})
  assert.equal(einheitStatus(EINHEITEN[0].id), 'aktuell')
  assert.equal(einheitStatus(EINHEITEN[1].id), 'gesperrt')
  assert.equal(einheitStatus('gibt-es-nicht'), 'gesperrt')
})

test('ab der Bestehensgrenze gilt eine Einheit als fertig und schaltet die naechste frei', () => {
  setzeFortschritt({ einheiten: { [EINHEITEN[0].id]: BESTANDEN_AB } })
  assert.equal(einheitStatus(EINHEITEN[0].id), 'fertig')
  assert.equal(einheitStatus(EINHEITEN[1].id), 'aktuell')
})

test('eine angefangene, aber noch nicht freigeschaltete Einheit heisst begonnen', () => {
  setzeFortschritt({ einheiten: { [EINHEITEN[2].id]: 40 } })
  assert.equal(einheitStatus(EINHEITEN[2].id), 'begonnen')
})

test('aktuelleEinheit ist die erste unfertige — und am Ende die letzte', () => {
  setzeFortschritt({ einheiten: { [EINHEITEN[0].id]: 100 } })
  assert.equal(aktuelleEinheit().id, EINHEITEN[1].id)

  const alleFertig = Object.fromEntries(EINHEITEN.map((e) => [e.id, 100]))
  setzeFortschritt({ einheiten: alleFertig })
  assert.equal(aktuelleEinheit().id, EINHEITEN[EINHEITEN.length - 1].id)
})

test('kursFortschritt rechnet fertige Einheiten in Prozent um', () => {
  setzeFortschritt({})
  assert.deepEqual(kursFortschritt(), { fertig: 0, gesamt: EINHEITEN.length, prozent: 0 })

  setzeFortschritt({ einheiten: { [EINHEITEN[0].id]: 100, [EINHEITEN[1].id]: 85 } })
  const stand = kursFortschritt()
  assert.equal(stand.fertig, 2)
  assert.equal(stand.prozent, Math.round((2 / EINHEITEN.length) * 100))
})

// ===== Welten und Lernpfad =====

test('die erste Welt ist offen, spaetere Welten sind anfangs gesperrt', () => {
  setzeFortschritt({})
  assert.equal(weltStatus(WELTEN[0].id), 'aktuell')
  assert.equal(weltStatus(WELTEN[2].id), 'gesperrt')
})

test('eine komplett gelernte Welt gilt als fertig', () => {
  const einheiten = Object.fromEntries(einheitenDerWelt(WELTEN[0].id).map((e) => [e.id, 100]))
  setzeFortschritt({ einheiten })
  assert.equal(weltStatus(WELTEN[0].id), 'fertig')
})

test('der Lernpfad endet mit Pruefung und Abschluss', () => {
  setzeFortschritt({})
  const pfad = weltPfad(WELTEN[0].id)
  assert.ok(pfad.length > 0)
  const lernStationen = pfad.filter((k) => k.art === 'lektion' || k.art === 'pruefung')
  assert.equal(lernStationen.length, WELTEN[0].einheiten.length)
  assert.equal(pfad[pfad.length - 1].art, 'abschluss')
  assert.equal(pfad[pfad.length - 1].status, 'gesperrt')
})

test('weltPfad einer unbekannten Welt ist leer statt kaputt', () => {
  assert.deepEqual(weltPfad('gibt-es-nicht'), [])
})

test('holeLektion versteht Kurz- und Langform', () => {
  const e = EINHEITEN[0]
  assert.equal(holeLektion(e.id, 'lernen').id, `${e.id}-lernen`)
  assert.equal(holeLektion(e.id, `${e.id}-lernen`).id, `${e.id}-lernen`)
  assert.equal(holeLektion('gibt-es-nicht', 'lernen'), null)
})
