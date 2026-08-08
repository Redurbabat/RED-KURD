// Die Farbmathematik der Abenteuer-Landschaften.
//
// Warum das Pruefung braucht: `loeseFarbe()` bekommt Werte aus den Weltdaten,
// und die sind CSS-Tokens wie `var(--rk-kurd-green)`. Faellt die Aufloesung
// still auf den Ersatzwert zurueck, sehen alle zehn Welten gleich aus — und
// niemand merkt es, weil ein Bild ja erscheint. Ein Fehler, der nicht auffaellt,
// ist genau der, den ein Test fangen soll.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  TOKEN,
  TOKEN_HEX,
  dunkler,
  heller,
  loeseFarbe,
  mische,
  zuRgb,
} from '../src/components/adventure/farben.ts'
import { WELTEN } from '../src/core/courses/courseRepository.ts'

const HEX = /^#[0-9a-f]{6}$/

/**
 * Die Tokens des hellen `:root`-Blocks aus tokens.css lesen und `var(--x)`
 * so weit aufloesen, bis ein Hex-Wert dasteht. Der zweite `:root`-Block ist
 * der dunkle Modus und ueberschreibt dieselben Namen — er darf hier nicht
 * mitgelesen werden.
 */
function tokensAusCss() {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
  const start = css.indexOf(':root {')
  const ende = css.indexOf('\n}', start)
  assert.ok(start >= 0 && ende > start, 'tokens.css hat keinen lesbaren :root-Block')
  const roh = {}
  for (const [, name, wert] of css
    .slice(start, ende)
    .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    roh[name] = wert.trim()
  }
  assert.ok(Object.keys(roh).length > 40, 'zu wenige Tokens gefunden — Parser kaputt?')
  // Selbstpruefung: `--rk-blue` steht in beiden :root-Bloecken. Steht hier der
  // dunkle Wert, hat der Parser zu weit gelesen. Ohne diese Zeile faellt das
  // erst auf, wenn irgendwann ein Token aus TOKEN_HEX im dunklen Modus
  // ueberschrieben wird — heute ueberschneiden sich die beiden Mengen nicht.
  assert.equal(roh['--rk-blue'], '#2596f3', 'Parser liest ueber den hellen :root-Block hinaus')

  const aufgeloest = (name, tiefe = 0) => {
    const wert = roh[name]
    if (wert === undefined || tiefe > 8) return undefined
    const zeiger = wert.match(/^var\(\s*(--[\w-]+)\s*\)$/)
    return zeiger ? aufgeloest(zeiger[1], tiefe + 1) : wert
  }
  return { namen: Object.keys(roh), aufgeloest }
}

test('zuRgb liest kurze und lange Schreibweisen', () => {
  assert.deepEqual(zuRgb('#ffffff'), [255, 255, 255])
  assert.deepEqual(zuRgb('#000000'), [0, 0, 0])
  assert.deepEqual(zuRgb('ffffff'), [255, 255, 255], 'auch ohne Doppelkreuz')
  assert.deepEqual(zuRgb('#fff'), [255, 255, 255], 'Kurzform')
  assert.deepEqual(zuRgb('#f00'), [255, 0, 0])
  assert.deepEqual(zuRgb('#123456'), [0x12, 0x34, 0x56])
  assert.deepEqual(zuRgb('  #ABCDEF  '), [0xab, 0xcd, 0xef], 'Grossbuchstaben und Leerraum')
})

test('unlesbare Eingaben ergeben Kurdisch-Gruen, nie NaN', () => {
  const gruen = [37, 139, 87]
  for (const kaputt of ['', '#12', '#12345', 'blau', 'var(--x)', null, undefined, 42, {}, []]) {
    const rgb = zuRgb(kaputt)
    assert.deepEqual(rgb, gruen, `„${String(kaputt)}" ergab ${rgb}`)
    assert.ok(
      rgb.every((w) => Number.isInteger(w)),
      `„${String(kaputt)}" ergab keine ganzen Zahlen`
    )
  }
})

test('mische liefert immer eine gueltige Hex-Farbe', () => {
  assert.equal(mische('#000000', '#ffffff', 0), '#000000')
  assert.equal(mische('#000000', '#ffffff', 1), '#ffffff')
  assert.equal(mische('#000000', '#ffffff', 0.5), '#808080')
  // Ausserhalb von 0..1 wird gedeckelt — sonst waere es keine Mischung mehr.
  assert.equal(mische('#000000', '#ffffff', -5), '#000000')
  assert.equal(mische('#000000', '#ffffff', 99), '#ffffff')
})

test('kaputte Anteile ergeben keine kaputte Farbe', () => {
  // Ohne die Number.isFinite-Pruefung stuende hier „#NaNNaNNaN" — im SVG
  // waere die Flaeche dann unsichtbar, ohne jede Fehlermeldung.
  for (const anteil of [NaN, Infinity, -Infinity, undefined, null, 'viel']) {
    const farbe = mische('#123456', '#abcdef', anteil)
    assert.match(farbe, HEX, `Anteil „${String(anteil)}" ergab ${farbe}`)
  }
  assert.equal(mische('#123456', '#abcdef', NaN), '#123456', 'NaN bedeutet: gar nicht mischen')
})

test('jede Stelle ist zweistellig — auch bei kleinen Werten', () => {
  // Ohne padStart entstuende aus (1,2,3) das fuenfstellige „#123", das der
  // Browser als Kurzform ganz anders liest.
  const dunkel = mische('#010203', '#010203', 0)
  assert.equal(dunkel, '#010203')
  assert.match(dunkel, HEX)
})

test('heller und dunkler bewegen sich in die richtige Richtung', () => {
  const grund = '#4a7c59'
  const [r0] = zuRgb(grund)
  const [rHell] = zuRgb(heller(grund, 0.5))
  const [rDunkel] = zuRgb(dunkler(grund, 0.5))
  assert.ok(rHell > r0, 'heller ist nicht heller')
  assert.ok(rDunkel < r0, 'dunkler ist nicht dunkler')
  assert.equal(heller(grund, 0), grund)
  assert.equal(heller(grund, 1), '#ffffff')
  assert.equal(dunkler(grund, 1), '#000000')
})

test('loeseFarbe kennt die Tokens der Farbwelt', () => {
  assert.equal(loeseFarbe('var(--rk-kurd-green)', '#000000'), TOKEN.gruen)
  assert.equal(loeseFarbe('var(--adv-gold)', '#000000'), TOKEN.gold)
  assert.equal(loeseFarbe('var( --rk-gold )', '#000000'), TOKEN.gold, 'Leerraum im var()')
  assert.equal(loeseFarbe('#abcdef', '#000000'), '#abcdef', 'Hex geht direkt durch')
  assert.equal(loeseFarbe('#abc', '#000000'), '#abc', 'auch die Kurzform')
})

test('unbekannte Werte fallen auf den Ersatz zurueck', () => {
  for (const wert of ['var(--gibt-es-nicht)', 'rebeccapurple', '', null, undefined, 'rgb(1,2,3)']) {
    assert.equal(loeseFarbe(wert, '#123456'), '#123456', `„${String(wert)}"`)
  }
})

test('JEDE Welt hat eine Farbe, die wirklich aufgeloest wird', () => {
  // Der eigentliche Grund fuer diese Testdatei: eine Welt, deren Token nicht in
  // der Tabelle steht, faellt auf den Ersatzwert zurueck und sieht aus wie die
  // Nachbarwelt. Sichtbar ist das nur im Vergleich — hier faellt es sofort auf.
  const ERSATZ = '#ff00ff'
  for (const welt of WELTEN) {
    assert.notEqual(
      loeseFarbe(welt.farbe, ERSATZ),
      ERSATZ,
      `Welt ${welt.id} (${welt.name}): „${welt.farbe}" steht nicht in TOKEN_HEX`
    )
    assert.notEqual(
      loeseFarbe(welt.himmel, ERSATZ),
      ERSATZ,
      `Welt ${welt.id}: Himmel „${welt.himmel}" liess sich nicht lesen`
    )
  }
})

test('TOKEN_HEX sagt dasselbe wie tokens.css', () => {
  // Der Grund, warum w8 und w9 monatelang gruen waren: die Tabelle wird von
  // Hand gepflegt, tokens.css aendert sich unabhaengig davon, und ein falscher
  // Hex-Wert sieht im Code voellig unauffaellig aus. Hier faellt jede
  // Abweichung sofort auf — inklusive der beiden Werte (`--adv-blue`,
  // `--adv-purple`), die den kurdischen Umbau nicht mitgemacht hatten.
  const { namen, aufgeloest } = tokensAusCss()
  for (const [name, hex] of Object.entries(TOKEN_HEX)) {
    assert.ok(namen.includes(name), `„${name}" steht in TOKEN_HEX, aber nicht in tokens.css`)
    assert.equal(
      aufgeloest(name),
      hex,
      `„${name}": tokens.css sagt „${aufgeloest(name)}", TOKEN_HEX sagt „${hex}"`
    )
  }
})

test('die Weltfarben ergeben unterschiedliche Landschaften', () => {
  // Zwei Welten duerfen dieselbe Farbe haben (w1, w6 und w10 teilen sich das
  // Kurdisch-Gruen). Es duerfen aber nicht ALLE gleich sein — das waere das
  // Bild eines stillen Rueckfalls.
  const farben = new Set(WELTEN.map((w) => loeseFarbe(w.farbe, '#000000')))
  assert.ok(farben.size >= 4, `nur ${farben.size} verschiedene Weltfarben`)
})
