#!/usr/bin/env node
// Zieht Importpfade nach, wenn Module von .js/.jsx nach .ts/.tsx wandern.
//
// Warum das ein Werkzeug braucht: Vite bildet einen `.js`-Import nur dann auf
// eine `.ts`-Datei ab, wenn der IMPORTIERENDE selbst TypeScript ist. Eine
// `.jsx`-Seite, die weiter auf `.js` zeigt, bricht den Build — und Node bricht
// beim Testen sowieso ab. Nach jeder Umbenennung müssen also alle Aufrufer
// mitgezogen werden, und das sind schnell siebzig Dateien.
//
// Warum nicht mit sed: Muster raten geht schief. In Welle 4 verfehlte ein
// handgeschriebenes Muster zwei Fälle — einen Import über eine
// Vorlagenzeichenkette mit angehängter Abfrage und einen Nachbarimport ohne
// Verzeichnisanteil. Beide Male half kein besseres Muster, sondern die
// richtige Frage: zeigt dieser Pfad noch auf eine Datei, die es gibt?
//
// Also wird jeder relative Import gegen das Dateisystem aufgelöst. Zeigt er
// ins Leere und liegt daneben dieselbe Datei mit .ts oder .tsx, wird genau
// dieser Pfad umgeschrieben — sonst nichts. Ein `.js`-Import auf eine Datei,
// die wirklich `.js` heißt, bleibt unangetastet.
//
//   node scripts/importe-nachziehen.mjs            schreibt
//   node scripts/importe-nachziehen.mjs --pruefen  meldet nur
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NUR_PRUEFEN = process.argv.includes('--pruefen')
const ENDUNGEN = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'])
const ORDNER = ['src', 'test', 'scripts']

async function dateien(verzeichnis) {
  const aus = []
  for (const eintrag of await readdir(verzeichnis, { withFileTypes: true })) {
    if (eintrag.name === 'node_modules' || eintrag.name.startsWith('.')) continue
    const p = path.join(verzeichnis, eintrag.name)
    if (eintrag.isDirectory()) aus.push(...(await dateien(p)))
    else if (ENDUNGEN.has(path.extname(eintrag.name))) aus.push(p)
  }
  return aus
}

// Ein Importziel steht hinter einem Anführungszeichen und endet vor dem
// nächsten — oder vor einem `${…}` in einer Vorlagenzeichenkette. Die
// Nachschau verhindert, dass `.js` innerhalb von `.jsx` getroffen wird.
const ZIEL = /(?<=['"`])(\.[^'"`\n]*?\.(?:js|jsx))(?=['"`]|\$\{)/g

const alle = (await Promise.all(ORDNER.map((o) => dateien(path.join(WURZEL, o))))).flat()

/**
 * Zeigt der Pfad überhaupt in den Quellbaum? `prepare-sites-build.mjs`
 * verweist auf `dist/server/*.js` — Build-Ausgaben, die es vor dem Build
 * schlicht nicht gibt. Sie als kaputt zu melden wäre falsch.
 */
function imQuellbaum(pfad) {
  return ORDNER.some((o) => pfad.startsWith(path.join(WURZEL, o) + path.sep))
}

let stellen = 0
let geaenderteDateien = 0
const offen = []

for (const datei of alle) {
  const text = readFileSync(datei, 'utf8')
  let hier = 0
  const neu = text.replace(ZIEL, (ganz, ziel) => {
    const aufgeloest = path.resolve(path.dirname(datei), ziel)
    if (existsSync(aufgeloest)) return ganz // zeigt auf eine echte Datei
    for (const endung of ['.ts', '.tsx']) {
      const kandidat = aufgeloest.replace(/\.(js|jsx)$/, endung)
      if (existsSync(kandidat)) {
        hier += 1
        return ziel.replace(/\.(js|jsx)$/, endung)
      }
    }
    if (imQuellbaum(aufgeloest)) offen.push(`${path.relative(WURZEL, datei)} -> ${ziel}`)
    return ganz
  })
  if (hier) {
    stellen += hier
    geaenderteDateien += 1
    if (!NUR_PRUEFEN) writeFileSync(datei, neu)
  }
}

console.log(
  NUR_PRUEFEN
    ? `${stellen} Importe in ${geaenderteDateien} Dateien müssten umgestellt werden`
    : `${stellen} Importe in ${geaenderteDateien} Dateien umgestellt`
)

// Gegenprobe über den ganzen Baum: danach muss jeder relative Import
// auflösen. Ohne diese Zeile wäre das Werkzeug eine Behauptung.
const kaputt = []
for (const datei of alle) {
  for (const treffer of readFileSync(datei, 'utf8').matchAll(ZIEL)) {
    const p = path.resolve(path.dirname(datei), treffer[1])
    if (!existsSync(p) && imQuellbaum(p)) {
      kaputt.push(`${path.relative(WURZEL, datei)} -> ${treffer[1]}`)
    }
  }
}

if (kaputt.length) {
  console.error(`\n${kaputt.length} Importe zeigen ins Leere:\n  ` + kaputt.join('\n  '))
  process.exit(1)
}
console.log('Gegenprobe: alle relativen Importe lösen auf.')
if (offen.length) {
  console.log('\nHinweis — diese Ziele gibt es weder als .js noch als .ts:')
  for (const o of [...new Set(offen)]) console.log('  ' + o)
}
