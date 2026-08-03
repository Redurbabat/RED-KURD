// Tests fuer die zentrale Sprachliste: ein Hauptkurs, saubere Verweise.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SPRACHEN,
  geplanteSprachen,
  hauptSprache,
  spracheVon,
  spracheZuKurs,
  sprachAttribute,
  verfuegbareSprachen,
} from '../src/core/languages/languages.js'
import { SPRACHKURSE } from '../src/data/sprachkurse.js'

test('es gibt genau einen Hauptkurs — Kurmancî', () => {
  const haupt = SPRACHEN.filter((s) => s.hauptkurs)
  assert.equal(haupt.length, 1)
  assert.equal(haupt[0].id, 'ku-kurmanci')
  assert.equal(hauptSprache().kursId, 'kurmanci')
})

test('alle Sprach-Ids sind einmalig und Deutsch ist immer Ausgangssprache', () => {
  const ids = SPRACHEN.map((s) => s.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const s of SPRACHEN) {
    assert.equal(s.ausgang, 'de', `${s.id} muss von Deutsch ausgehen`)
    assert.ok(s.nameDeutsch, `${s.id} braucht einen deutschen Namen`)
  }
})

test('jede verfuegbare Zusatzsprache zeigt auf einen echten Kurs', () => {
  for (const s of verfuegbareSprachen()) {
    if (s.hauptkurs) continue
    assert.ok(
      SPRACHKURSE.some((k) => k.id === s.kursId),
      `${s.id} verweist auf unbekannten Kurs ${s.kursId}`
    )
  }
})

test('geplante Sprachen haben noch keinen Kurs und tauchen nicht als lernbar auf', () => {
  for (const s of geplanteSprachen()) {
    assert.equal(s.kursId, null)
    assert.ok(!verfuegbareSprachen().includes(s))
  }
  assert.ok(geplanteSprachen().some((s) => s.id === 'ku-sorani'))
})

test('rechts-nach-links gilt nur fuer arabische Schrift', () => {
  for (const s of SPRACHEN) {
    assert.equal(s.rtl, s.schrift === 'arabic', `${s.id}: rtl passt nicht zur Schrift`)
  }
})

test('sprachAttribute liefert lang immer und dir nur bei RTL', () => {
  assert.deepEqual(sprachAttribute(spracheVon('ku-kurmanci')), { lang: 'ku' })
  assert.deepEqual(sprachAttribute(spracheVon('ku-sorani')), { lang: 'ckb', dir: 'rtl' })
  assert.deepEqual(sprachAttribute(null), {})
})

test('spracheZuKurs findet die Sprache zum bestehenden Kurssystem', () => {
  assert.equal(spracheZuKurs('kurmanci').id, 'ku-kurmanci')
  assert.equal(spracheZuKurs('englisch').id, 'en')
  assert.equal(spracheZuKurs('gibt-es-nicht'), null)
})
