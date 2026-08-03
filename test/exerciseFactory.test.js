// Tests fuer die Aufgaben-Fabrik: Mischen, Aufgabenbau, faire Tipp-Bewertung.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ARTEN,
  SKILL_JE_ART,
  baueUebungen,
  istRichtigGetippt,
  mische,
} from '../src/core/session/exerciseFactory.js'

const WOERTER = [
  { de: 'Hallo', ku: 'Silav', bild: '👋' },
  { de: 'Danke', ku: 'Spas', bild: '🙏' },
  { de: 'Brot', ku: 'nan', bild: '🍞' },
  { de: 'Wasser', ku: 'av', bild: '💧' },
]

test('mische liefert dieselben Elemente und laesst das Original in Ruhe', () => {
  const original = [1, 2, 3, 4, 5]
  const kopie = [...original]
  const gemischt = mische(original)
  assert.deepEqual(original, kopie)
  assert.deepEqual([...gemischt].sort(), [1, 2, 3, 4, 5])
})

test('jede Aufgabenart trainiert eine bekannte Fertigkeit', () => {
  for (const art of ARTEN) {
    assert.ok(SKILL_JE_ART[art], `Art ${art} ohne Fertigkeit`)
  }
})

test('baueUebungen baut fuer jedes Wort eine Aufgabe aus den erlaubten Arten', () => {
  const uebungen = baueUebungen(WOERTER, ['tippen'])
  assert.equal(uebungen.length, WOERTER.length)
  for (const u of uebungen) {
    assert.equal(u.art, 'tippen')
    assert.equal(u.frage, u.w.de)
    assert.equal(u.antwort, u.w.ku)
  }
})

test('Wahl-Aufgaben haben vier Antwortmoeglichkeiten ohne Doppelte', () => {
  for (const u of baueUebungen(WOERTER, ['wahl-ku'])) {
    assert.equal(u.optionen.length, 4)
    assert.equal(new Set(u.optionen).size, 4, 'Antworten muessen einmalig sein')
    assert.ok(u.optionen.includes(u.antwort), 'die richtige Antwort muss dabei sein')
  }
})

test('Bedeutungs-Aufgaben fragen Kurmancî und bieten deutsche Antworten', () => {
  for (const u of baueUebungen(WOERTER, ['wahl-de'])) {
    assert.equal(u.frage, u.w.ku)
    assert.ok(u.optionen.includes(u.w.de))
    assert.equal(new Set(u.optionen).size, u.optionen.length)
  }
})

test('eine faellige Karte uebt genau ihre Fertigkeit — sonst bleibt sie ewig faellig', () => {
  const karte = [{ de: 'Hallo', ku: 'Silav', bild: '👋', skill: 'schreiben' }]
  for (let i = 0; i < 10; i++) {
    const [u] = baueUebungen(karte)
    assert.equal(u.art, 'tippen')
  }
})

test('ohne Bild entsteht keine Bildaufgabe', () => {
  // Ein kursfremdes Wort — fuer Kurswoerter ergaenzt die Fabrik das Bild selbst.
  const ohneBild = [{ de: 'Beispielwort', ku: 'peyva-nimune' }]
  for (let i = 0; i < 10; i++) {
    const [u] = baueUebungen(ohneBild, ['bild', 'wahl-ku'])
    assert.notEqual(u.art, 'bild')
  }
})

test('Bildaufgaben zeigen vier verschiedene Kacheln inklusive der richtigen', () => {
  for (const u of baueUebungen(WOERTER, ['bild'])) {
    assert.equal(u.optionen.length, 4)
    const bilder = u.optionen.map((o) => o.bild)
    assert.equal(new Set(bilder).size, 4)
    assert.ok(bilder.includes(u.antwort))
  }
})

// ===== faire Tipp-Bewertung =====

test('Gross-/Kleinschreibung und Leerzeichen sind egal', () => {
  assert.ok(istRichtigGetippt('  silav ', 'Silav'))
  assert.ok(istRichtigGetippt('BI XATIRÊ TE', 'Bi xatirê te'))
  assert.ok(istRichtigGetippt('tu  çawa   yî', 'Tu çawa yî?'))
})

test('kurdische Sonderzeichen duerfen auch als Grundbuchstaben getippt werden', () => {
  assert.ok(istRichtigGetippt('xwisk', 'xwişk'))
  assert.ok(istRichtigGetippt('cay', 'çay'))
  assert.ok(istRichtigGetippt('penc', 'pênc'))
  assert.ok(istRichtigGetippt('sir', 'şîr'))
})

test('Satzzeichen und Apostrophe zaehlen nicht als Fehler', () => {
  assert.ok(istRichtigGetippt('Tu çawa yî', 'Tu çawa yî?'))
  assert.ok(istRichtigGetippt("Ez bas im", 'Ez baş im.'))
})

test('ein wirklich anderes Wort bleibt falsch', () => {
  assert.equal(istRichtigGetippt('nan', 'av'), false)
  assert.equal(istRichtigGetippt('', 'av'), false)
  assert.equal(istRichtigGetippt(null, 'av'), false)
})
