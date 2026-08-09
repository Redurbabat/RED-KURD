// Jeder Iconname, der irgendwo in der App steht, muss es auch wirklich geben.
//
// Warum das nötig ist: `Icon` gibt bei einem unbekannten Namen `null` zurück.
// Ein Tippfehler erzeugt also keinen Fehler, sondern ein Icon, das einfach
// nicht erscheint — und das fällt beim Durchklicken kaum auf. Genau das ist
// mir beim Bauen der Aufnahmen-Karte passiert: `pfeilOben` heisst in Wahrheit
// `pfeilHoch`, der Aufklapp-Knopf war eine Zeile lang unsichtbar leer.
//
// Fuer .tsx-Dateien faengt das inzwischen der Typ `Iconname` ab. Der Bestand
// ist aber ueberwiegend .jsx und damit ungeprueft — dieser Test schliesst die
// Luecke, bis die Komponenten-Migration durch ist.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const { ICONNAMEN, istIconname } = await import('../src/components/icons/iconPfade.ts')
const { WOCHENLIGEN } = await import('../src/core/progress/gamification.ts')

async function quelldateien(ordner) {
  const aus = []
  for (const eintrag of await readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, eintrag.name)
    if (eintrag.isDirectory()) aus.push(...(await quelldateien(p)))
    else if (/\.(jsx|tsx)$/.test(eintrag.name)) aus.push(p)
  }
  return aus
}

test('der Iconsatz ist nicht leer und hat keine doppelten Namen', () => {
  assert.ok(ICONNAMEN.length > 50, `nur ${ICONNAMEN.length} Icons`)
  assert.equal(new Set(ICONNAMEN).size, ICONNAMEN.length)
})

test('jeder verwendete Iconname existiert', async () => {
  const dateien = await quelldateien(new URL('../src', import.meta.url).pathname)
  const bekannt = new Set(ICONNAMEN)
  const fehlend = []

  for (const datei of dateien) {
    const text = await readFile(datei, 'utf8')
    // Trifft `<Icon name="x"`, `icon="x"` und `icon: 'x'` — die drei Formen,
    // in denen ein Iconname im Baum vorkommt.
    const stellen = [
      ...text.matchAll(/<Icon\s[^>]*?name=["']([a-zA-Z]+)["']/g),
      ...text.matchAll(/\bicon=["']([a-zA-Z]+)["']/g),
      ...text.matchAll(/\bicon:\s*['"]([a-zA-Z]+)['"]/g),
    ]
    for (const treffer of stellen) {
      const name = treffer[1]
      if (!bekannt.has(name)) {
        fehlend.push(`${name} (in ${path.relative(process.cwd(), datei)})`)
      }
    }
  }

  assert.deepEqual(
    [...new Set(fehlend)],
    [],
    'Diese Iconnamen gibt es nicht — sie erscheinen zur Laufzeit als nichts:\n  ' +
      [...new Set(fehlend)].join('\n  ')
  )
})

test('istIconname erkennt echte und erfundene Namen', () => {
  assert.ok(istIconname('stern'), 'stern ist ein echter Iconname')
  assert.ok(istIconname(ICONNAMEN[0]), 'der erste Name der Liste muss durchgehen')
  assert.ok(!istIconname('gibt-es-nicht'), 'ein erfundener Name darf nicht durchgehen')
  assert.ok(!istIconname(''), 'der leere Name darf nicht durchgehen')
  // Nur eigene Schluessel zaehlen — sonst waeren „toString" oder
  // „constructor" ploetzlich gueltige Iconnamen.
  assert.ok(!istIconname('toString'), 'geerbte Eigenschaften sind keine Iconnamen')
  assert.ok(!istIconname('constructor'), 'geerbte Eigenschaften sind keine Iconnamen')
})

test('die Wochenligen tragen echte Iconnamen', () => {
  // Genau dafuer gibt es istIconname(): `Wochenliga.icon` ist blosser Text,
  // und ein Tippfehler darin waere in der Oberflaeche nur eine leere Flaeche
  // neben dem Ligennamen. Der Rueckfall auf „stern" in RedlingoHomePage faengt
  // ihn ab — bemerken wuerde es niemand.
  for (const liga of WOCHENLIGEN) {
    assert.ok(
      istIconname(liga.icon),
      `Liga „${liga.name}": „${liga.icon}" ist kein bekannter Iconname`
    )
  }
})
