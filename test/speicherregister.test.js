// Das Register aller Speicherschluessel — und die Regel dahinter.
//
// Warum es diesen Test gibt: Eine neue App bringt einen neuen Schluessel mit.
// Vergisst jemand, ihn in `KEYS` einzutragen, laeuft alles — nur fehlt er
// still in JEDER Sicherung. Der Verlust faellt erst auf einem neuen Geraet auf,
// wenn die Daten schon weg sind. Das ist genau die Art Fehler, gegen die
// CLAUDE.md Grundsatz 2 steht.
//
// Bisher fing das nur `sicherungRundlauf.test.js` ab, und auch nur fuer die
// Bereiche, die dort ausdruecklich vorkommen. Hier wird stattdessen der ganze
// Quelltext durchsucht: JEDER Schluessel, der im Code auftaucht, muss
// eingeordnet sein — als aktiver Speicher, als Alt-Schluessel, als
// Tab-Schluessel oder als ausdrueckliche, begruendete Ausnahme.
//
// Faellt dieser Test um, ist die Frage NICHT „wie mache ich ihn wieder gruen",
// sondern: gehoert der neue Schluessel in die Sicherung? Wenn ja, nach `KEYS`.
// Wenn nein, mit Begruendung in die Liste unten.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

class SpeicherAttrappe {
  constructor() { this.daten = new Map() }
  getItem(k) { return this.daten.has(k) ? this.daten.get(k) : null }
  setItem(k, v) { this.daten.set(k, String(v)) }
  removeItem(k) { this.daten.delete(k) }
}
globalThis.localStorage = new SpeicherAttrappe()

const { KEYS, TAB_KEYS, exportiereSpeicherstand, importiereSpeicherstand, schreibe } =
  await import('../src/core/storage.ts')

/**
 * Schluessel, die absichtlich NICHT in `KEYS` stehen. Jeder Eintrag braucht
 * einen Grund — ohne Grund gehoert er nach `KEYS`.
 */
const AUSNAHMEN = {
  // Alt-Schluessel aus Version 1. Werden nur noch gelesen und nie geloescht
  // (ADR-005); in die Sicherung gehoeren sie nicht, ihr Inhalt ist laengst
  // nach v2 gehoben.
  'red-kurd-fortschritt-v1': 'Alt-Schluessel v1, nur lesend (storage.ts, ALT)',
  'red-kurd-profil-v1': 'Alt-Schluessel v1, nur lesend',
  'red-kurd-session-v1': 'Alt-Schluessel v1, nur lesend',
  'red-kurd-modus': 'Alt-Schluessel v1, nur lesend',
  // Kein localStorage.
  'red-kurd-audio': 'Name der IndexedDB, kein localStorage-Schluessel',
  'red-kurd-tab-dauer': 'sessionStorage (TAB_KEYS) — ueberlebt den Tab nicht',
  'red-kurd-lernstand': 'Dateiname der Sicherung, kein Speicherschluessel',
  'red-kurd-anki': 'Dateiname der Anki-Ausgabe, kein Speicherschluessel',
}

/** Alle Quelldateien unter src/. */
async function quelldateien(ordner) {
  const aus = []
  for (const eintrag of await readdir(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, eintrag.name)
    if (eintrag.isDirectory()) aus.push(...(await quelldateien(p)))
    else if (/\.(js|jsx|ts|tsx)$/.test(eintrag.name)) aus.push(p)
  }
  return aus
}

test('jeder Schluessel im Quelltext ist eingeordnet — sonst fehlt er still in jeder Sicherung', async () => {
  const dateien = await quelldateien(new URL('../src', import.meta.url).pathname)
  const gefunden = new Map()

  for (const datei of dateien) {
    const text = await readFile(datei, 'utf8')
    for (const treffer of text.matchAll(/['"`](red-kurd-[a-z0-9-]+)/g)) {
      const schluessel = treffer[1]
      if (!gefunden.has(schluessel)) gefunden.set(schluessel, [])
      gefunden.get(schluessel).push(path.relative(process.cwd(), datei))
    }
  }

  assert.ok(gefunden.size > 15, `nur ${gefunden.size} Schluessel gefunden — sucht der Test noch richtig?`)

  const bekannt = new Set([...Object.values(KEYS), ...Object.values(TAB_KEYS)])
  const unbekannt = []
  for (const [schluessel, orte] of gefunden) {
    if (bekannt.has(schluessel)) continue
    if (schluessel in AUSNAHMEN) continue
    unbekannt.push(`${schluessel} (in ${orte.join(', ')})`)
  }

  assert.deepEqual(
    unbekannt,
    [],
    'Diese Schluessel stehen weder in KEYS noch in der Ausnahmeliste.\n' +
      'Gehoert der Bereich in die Sicherung? Dann nach KEYS in src/core/storage.ts.\n' +
      'Wenn nicht, mit Begruendung in AUSNAHMEN in dieser Datei:\n  ' +
      unbekannt.join('\n  ')
  )
})

test('keine Ausnahme ist veraltet — jede muss im Quelltext noch vorkommen', async () => {
  // Eine Ausnahmeliste, die niemand aufraeumt, verliert ihre Aussagekraft.
  const dateien = await quelldateien(new URL('../src', import.meta.url).pathname)
  const alleTexte = (await Promise.all(dateien.map((d) => readFile(d, 'utf8')))).join('\n')
  const tot = Object.keys(AUSNAHMEN).filter((s) => !alleTexte.includes(s))
  assert.deepEqual(tot, [], `Diese Ausnahmen kommen im Code nicht mehr vor: ${tot.join(', ')}`)
})

test('keine Ausnahme steht zugleich in KEYS', () => {
  const inKeys = Object.keys(AUSNAHMEN).filter((s) => Object.values(KEYS).includes(s))
  assert.deepEqual(inKeys, [], `widerspruechlich eingeordnet: ${inKeys.join(', ')}`)
})

test('jeder Eintrag in KEYS wandert wirklich in die Sicherung — bis auf die geraetelokalen', () => {
  // NUR_LOKAL ist in storage.ts modul-intern. Statt es zu exportieren, wird es
  // hier ueber das Verhalten festgestellt: was nach dem Schreiben nicht im
  // Export auftaucht, ist geraetelokal.
  globalThis.localStorage = new SpeicherAttrappe()
  for (const [name, schluessel] of Object.entries(KEYS)) {
    schreibe(schluessel, { probe: name })
  }
  const stand = exportiereSpeicherstand()
  const fehlend = Object.keys(KEYS).filter((name) => !(name in stand))

  assert.deepEqual(
    fehlend.sort(),
    ['ohneKonto', 'sitzung'],
    'Es fehlen andere Bereiche im Export als die beiden bewusst geraetelokalen.\n' +
      'Entweder ist NUR_LOKAL gewachsen (dann gehoert es hier und in STORAGE.md nachgezogen)\n' +
      'oder ein Bereich faellt versehentlich aus jeder Sicherung.'
  )
})

test('was exportiert wurde, laesst sich auch wieder einspielen', () => {
  // Der Rueckweg wird leicht vergessen: `importiereSpeicherstand()` laeuft ueber
  // dieselbe KEYS-Liste, koennte aber eine andere Ausnahme haben.
  globalThis.localStorage = new SpeicherAttrappe()
  for (const [name, schluessel] of Object.entries(KEYS)) schreibe(schluessel, { probe: name })
  const stand = exportiereSpeicherstand()

  globalThis.localStorage = new SpeicherAttrappe()
  const anzahl = importiereSpeicherstand(stand)
  assert.equal(anzahl, Object.keys(stand).length, 'nicht jeder exportierte Bereich kam zurueck')

  const wieder = exportiereSpeicherstand()
  assert.deepEqual(wieder, stand, 'der Rundlauf Export → Import → Export ist nicht deckungsgleich')
})

// ===== Namensdrift: Schluesselname und Schemaversion sind zweierlei =====

test('die Schemaversion steht im Wert, nicht im Schluesselnamen', async () => {
  // `red-kurd-ui-v1` traegt intern `version: 2`. Das sieht nach einem Fehler
  // aus und ist keiner: das `-vN` im Schluesselnamen ist historisch und
  // bezeichnet die Generation des SCHLUESSELS, die `version` im Wert die Form
  // der DATEN. Beide umzubenennen waere eine weitere Migration mit doppeltem
  // Schreiben — Aufwand und Risiko fuer null Nutzen, denn den Schluesselnamen
  // sieht niemand.
  //
  // Dieser Test haelt die heutige Zuordnung fest, damit sie niemand
  // versehentlich „aufraeumt": wer `red-kurd-ui-v1` in `-v2` umbenennt, ohne
  // den alten Schluessel weiter zu schreiben, verliert die Einstellungen jedes
  // Nutzers, der zurueckwechselt (ADR-005).
  globalThis.localStorage = new SpeicherAttrappe()
  const { holeUi } = await import('../src/core/ui/uiStore.ts?register=1')

  assert.equal(KEYS.ui, 'red-kurd-ui-v1', 'der Schluesselname ist historisch — nicht umbenennen')
  assert.equal(holeUi().version, 2, 'die Form der Daten ist Version 2')
})

test('jeder gespeicherte Bereich sagt, nach welcher Form er gebaut ist', async () => {
  // Ohne Versionsangabe im Wert laesst sich eine alte Form nicht von einer
  // neuen unterscheiden — und eine Migration nicht sicher schreiben.
  globalThis.localStorage = new SpeicherAttrappe()
  const { sitzungSpeichern, SITZUNG_VERSION } = await import(
    '../src/core/session/sessionStore.ts?register=1'
  )
  sitzungSpeichern({ titel: 'Probe', index: 0, punkte: 0, uebungen: [] })
  const roh = JSON.parse(globalThis.localStorage.getItem(KEYS.sitzung))
  assert.equal(roh.version, SITZUNG_VERSION, 'die Sitzung traegt jetzt eine Versionsangabe')
  assert.equal(roh.version, 2)
})

test('eine Sitzung ohne Versionsangabe bleibt nutzbar', async () => {
  // Alles, was vor dieser Aenderung gespeichert wurde, hat kein `version`.
  // Es waere ein Datenverlust, so eine Sitzung zu verwerfen.
  globalThis.localStorage = new SpeicherAttrappe()
  const { sitzungLaden } = await import('../src/core/session/sessionStore.ts?register=2')
  globalThis.localStorage.setItem(
    KEYS.sitzung,
    JSON.stringify({ titel: 'Alt', index: 1, punkte: 5, uebungen: [{}, {}, {}] })
  )
  const geladen = sitzungLaden()
  assert.ok(geladen, 'eine Sitzung ohne Versionsangabe wurde verworfen')
  assert.equal(geladen.titel, 'Alt')
})
