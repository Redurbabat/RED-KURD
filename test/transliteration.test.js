// Tests fuer die Schrift-Umwandlung Kurmancî: Latein (Hawar) <-> Arabisch.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  arabischNachLatein,
  lateinNachArabisch,
} from '../src/core/schrift/transliteration.js'

test('einfache Woerter wandern korrekt in die arabische Schrift', () => {
  assert.equal(lateinNachArabisch('nan'), 'نان')
  assert.equal(lateinNachArabisch('roj'), 'رۆژ')
})

test('ein Wortanfang mit Vokal bekommt das Hamza-Traegerzeichen', () => {
  assert.equal(lateinNachArabisch('av'), 'ئاڤ')
  assert.equal(lateinNachArabisch('ez'), 'ئەز')
})

test('die Digraphen xw und û werden als Einheit umgesetzt', () => {
  assert.equal(lateinNachArabisch('xwarin'), 'خوارن')
  assert.equal(lateinNachArabisch('şûr'), 'شوور')
})

test('das kurze i wird ausgelassen, Grossschreibung ist egal', () => {
  assert.equal(lateinNachArabisch('Silav'), 'سلاڤ')
  assert.equal(lateinNachArabisch('silav'), lateinNachArabisch('SILAV'))
})

test('Leerzeichen und unbekannte Zeichen bleiben erhalten', () => {
  assert.equal(lateinNachArabisch('roj baş'), 'رۆژ باش')
  assert.ok(lateinNachArabisch('roj 3!').includes('3!'))
})

test('arabische Schrift laesst sich zurueck nach Latein wandeln', () => {
  assert.equal(arabischNachLatein('نان'), 'nan')
  assert.equal(arabischNachLatein('شوور'), 'şûr')
  assert.equal(arabischNachLatein('ئاڤ'), 'av')
})

test('Sonderzeichen der arabischen Schrift werden abgebildet, Unbekanntes bleibt', () => {
  assert.equal(arabischNachLatein('ڕۆژ'), 'roj')
  assert.equal(arabischNachLatein('باش!'), 'baş!')
})

test('Woerter ohne i-Auslassung ueberleben den Rundflug', () => {
  for (const wort of ['nan', 'roj baş', 'şûr', 'av']) {
    assert.equal(arabischNachLatein(lateinNachArabisch(wort)), wort)
  }
})
