// Tests fuer die Texthilfen der Code-Tastatur: Einfuegen an der
// Cursorposition, Umschliessen von markiertem Text, Loeschen.
import test from 'node:test'
import assert from 'node:assert/strict'

const { fuegeEin, loescheZurueck } = await import('../src/features/app-mode/tastaturHilfen.js')

test('fuegeEin: Zeichen landet an der Cursorposition', () => {
  const e = fuegeEin('ab', 1, 1, 'X')
  assert.equal(e.wert, 'aXb')
  assert.equal(e.cursor, 2)
})

test('fuegeEin: Baustein ohne Auswahl — Cursor landet in der Mitte', () => {
  const e = fuegeEin('', 0, 0, '<h1>', '</h1>')
  assert.equal(e.wert, '<h1></h1>')
  assert.equal(e.cursor, 4)
})

test('fuegeEin: markierter Text wird vom Baustein umschlossen', () => {
  const e = fuegeEin('Hallo Welt', 6, 10, '<h1>', '</h1>')
  assert.equal(e.wert, 'Hallo <h1>Welt</h1>')
  assert.equal(e.cursor, 14)
})

test('fuegeEin: vertauschte und zu grosse Grenzen werden abgefangen', () => {
  const e = fuegeEin('abc', 3, 1, 'X', 'Y')
  assert.equal(e.wert, 'aXbcY')
  const z = fuegeEin('ab', 0, 99, 'X', 'Y')
  assert.equal(z.wert, 'XabY')
})

test('loescheZurueck: ohne Auswahl verschwindet das Zeichen vor dem Cursor', () => {
  const e = loescheZurueck('abc', 2, 2)
  assert.equal(e.wert, 'ac')
  assert.equal(e.cursor, 1)
})

test('loescheZurueck: eine Auswahl wird komplett entfernt', () => {
  const e = loescheZurueck('Hallo Welt', 5, 10)
  assert.equal(e.wert, 'Hallo')
  assert.equal(e.cursor, 5)
})

test('loescheZurueck: am Anfang passiert nichts', () => {
  const e = loescheZurueck('abc', 0, 0)
  assert.equal(e.wert, 'abc')
  assert.equal(e.cursor, 0)
})
