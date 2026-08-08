import test from 'node:test'
import assert from 'node:assert/strict'
import {
  EINHEITEN,
  LEKTIONS_ARTEN,
  WELTEN,
  ALLE_WOERTER,
} from '../src/core/courses/courseRepository.js'
import { planeLektion } from '../src/core/session/sessionPlanner.ts'

test('der Kurs waechst nur, er schrumpft nie', () => {
  // Untergrenzen statt Fixwerte: neue Kapitel sollen den Test nicht brechen,
  // ein versehentlicher Verlust von Inhalten dagegen schon.
  assert.ok(EINHEITEN.length >= 56, `nur ${EINHEITEN.length} Kapitel`)
  assert.ok(ALLE_WOERTER.length >= 596, `nur ${ALLE_WOERTER.length} Lernpaare`)
  assert.equal(LEKTIONS_ARTEN.length, 5)
  // Jedes Kapitel liegt in genau einer Welt.
  assert.equal(EINHEITEN.filter((e) => !e.weltId).length, 0)
})

test('Kennungen, Wortpaare und Weltzuordnungen sind eindeutig', () => {
  assert.equal(new Set(EINHEITEN.map((einheit) => einheit.id)).size, EINHEITEN.length)

  const paare = ALLE_WOERTER.map((wort) => `${wort.de}|${wort.ku}`)
  assert.equal(new Set(paare).size, paare.length)

  const weltEinheiten = WELTEN.flatMap((welt) => welt.einheiten)
  assert.equal(new Set(weltEinheiten).size, EINHEITEN.length)
  assert.deepEqual(new Set(weltEinheiten), new Set(EINHEITEN.map((einheit) => einheit.id)))
})

test('jedes Kapitel besitzt vollständige Wörter und fünf spielbare Lernschritte', () => {
  for (const einheit of EINHEITEN) {
    assert.ok(einheit.name)
    assert.ok(einheit.ziel)
    assert.ok(einheit.symbol)
    assert.ok(einheit.woerter.length >= 10)

    for (const wort of einheit.woerter) {
      assert.ok(wort.de, `${einheit.id}: deutsche Bedeutung fehlt`)
      assert.ok(wort.ku, `${einheit.id}: Kurmancî-Ausdruck fehlt`)
    }

    assert.equal(einheit.lektionen.length, 5)
    for (const lektion of einheit.lektionen) {
      const plan = planeLektion(einheit.id, lektion.id)
      assert.ok(plan, `${einheit.id}/${lektion.id}: Plan fehlt`)
      assert.ok(plan.uebungen.length > 0, `${einheit.id}/${lektion.id}: keine Übung gebaut`)
      assert.ok(plan.uebungen.length <= lektion.anzahl)
    }
  }
})
