// Integritaetstest fuer das Audio-Verzeichnis: Jeder Eintrag muss auf eine
// echte Datei zeigen und per wort.toLowerCase() auffindbar sein — sonst
// verspricht die App eine Muttersprachler-Stimme, die nie abspielt.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const index = JSON.parse(
  await readFile(new URL('../public/audio/index.json', import.meta.url), 'utf8')
)
const dateien = new Set(await readdir(new URL('../public/audio/kmr', import.meta.url)))

test('jeder Eintrag zeigt auf eine existierende Aufnahme', () => {
  for (const [wort, datei] of Object.entries(index)) {
    assert.ok(dateien.has(datei), `${wort} -> ${datei} fehlt in public/audio/kmr`)
  }
})

test('keine Muell-Schluessel aus der Dateinamen-Sanitisierung', () => {
  for (const wort of Object.keys(index)) {
    // Einzelbuchstaben (a, b, ş …) sind echte Alphabet-Aufnahmen und erlaubt.
    assert.ok(wort.length > 0, 'leerer Schluessel')
    assert.ok(!wort.startsWith('.') && !wort.startsWith('_'), `Muell-Schluessel: „${wort}"`)
    assert.equal(wort, wort.trim(), `Schluessel mit Randleerzeichen: „${wort}"`)
  }
})

test('alle Schluessel sind kleingeschrieben — so sucht die App sie', () => {
  for (const wort of Object.keys(index)) {
    assert.equal(wort, wort.toLowerCase(), `nie auffindbar: „${wort}"`)
  }
})

test('keine verwaisten Aufnahmen ohne Index-Eintrag', () => {
  const genutzt = new Set(Object.values(index))
  for (const datei of dateien) {
    assert.ok(genutzt.has(datei), `verwaiste Datei: ${datei}`)
  }
})

test('die Abdeckung faellt nicht unbemerkt unter den heutigen Stand', () => {
  assert.ok(
    Object.keys(index).length >= 321,
    `nur noch ${Object.keys(index).length} Aufnahmen im Index`
  )
})
