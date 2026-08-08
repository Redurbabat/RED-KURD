// Tests fuer das Wiederholsystem: Stufen, Abstaende, Faelligkeit.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ABSTAENDE,
  SICHER_AB,
  heute,
  istFaellig,
  kartenSchluessel,
  naechsteKarte,
  schluesselTeile,
  tagPlus,
  tagVon,
} from '../src/core/progress/scheduler.ts'

test('tagVon liefert den Kalendertag in der Zeitzone des Geraets', () => {
  assert.equal(tagVon(new Date(2026, 7, 3, 23, 59)), '2026-08-03')
  assert.equal(tagVon(new Date(2026, 0, 1, 0, 0)), '2026-01-01')
})

test('kartenSchluessel und schluesselTeile sind ein Paar', () => {
  const key = kartenSchluessel('Brot', 'nan', 'schreiben')
  assert.equal(key, 'Brot|nan|schreiben')
  assert.deepEqual(schluesselTeile(key), { de: 'Brot', ku: 'nan', skill: 'schreiben' })
})

test('ohne Fertigkeit gilt der Schluessel als gemischt', () => {
  assert.equal(kartenSchluessel('Brot', 'nan'), 'Brot|nan')
  assert.equal(schluesselTeile('Brot|nan').skill, 'gemischt')
})

test('eine richtige Antwort hebt die Stufe und schiebt die Karte nach hinten', () => {
  const karte = { stufe: 1, faellig: heute(), gesehen: 4, richtig: 3 }
  const neu = naechsteKarte(karte, true)
  assert.equal(neu.stufe, 2)
  assert.equal(neu.faellig, tagPlus(ABSTAENDE[1]))
  assert.equal(neu.gesehen, 5)
  assert.equal(neu.richtig, 4)
})

test('eine falsche Antwort setzt auf Stufe 0 und macht die Karte sofort faellig', () => {
  const karte = { stufe: 4, faellig: '2026-09-01', gesehen: 9, richtig: 7 }
  const neu = naechsteKarte(karte, false)
  assert.equal(neu.stufe, 0)
  assert.equal(neu.faellig, heute())
  assert.equal(neu.gesehen, 10)
  assert.equal(neu.richtig, 7)
})

test('die Stufe waechst nie ueber den laengsten Abstand hinaus', () => {
  let karte = { stufe: ABSTAENDE.length, gesehen: 0, richtig: 0 }
  karte = naechsteKarte(karte, true)
  assert.equal(karte.stufe, ABSTAENDE.length)
  assert.equal(karte.faellig, tagPlus(ABSTAENDE[ABSTAENDE.length - 1]))
})

test('eine ganz neue Karte startet bei Stufe 1 nach dem ersten Treffer', () => {
  const neu = naechsteKarte(null, true)
  assert.equal(neu.stufe, 1)
  assert.equal(neu.faellig, tagPlus(ABSTAENDE[0]))
  assert.equal(neu.gesehen, 1)
  assert.equal(neu.richtig, 1)
})

test('istFaellig: ohne Datum sofort, sonst ab dem Stichtag', () => {
  assert.equal(istFaellig({}), true)
  assert.equal(istFaellig({ faellig: '2020-01-01' }), true)
  assert.equal(istFaellig({ faellig: heute() }), true)
  assert.equal(istFaellig({ faellig: tagPlus(1) }), false)
})

test('die Abstaende wachsen streng an — sonst lernt man rueckwaerts', () => {
  for (let i = 1; i < ABSTAENDE.length; i++) {
    assert.ok(ABSTAENDE[i] > ABSTAENDE[i - 1])
  }
  assert.ok(SICHER_AB <= ABSTAENDE.length)
})
