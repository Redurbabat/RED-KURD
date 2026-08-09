// Die Lesetexte sind JavaScript; ihre Form kennt TypeScript nur aus
// src/data/texte.d.ts. Diese Datei haelt die echten Daten dagegen — und
// gegen das, worauf sich ReadingView beim Anzeigen verlaesst.
import test from 'node:test'
import assert from 'node:assert/strict'
import { texte } from '../src/data/texte.js'

test('jeder Lesetext hat die Form, die texte.d.ts zusagt', () => {
  assert.ok(Array.isArray(texte) && texte.length > 0, 'keine Lesetexte')
  for (const t of texte) {
    const wo = `Text ${t?.id}`
    for (const feld of ['id', 'titel', 'niveau', 'thema', 'text', 'uebersetzung']) {
      assert.equal(typeof t?.[feld], 'string', `${wo}: ${feld} fehlt`)
      assert.ok(t[feld].length > 0, `${wo}: ${feld} ist leer`)
    }
    assert.ok(Array.isArray(t.fragen), `${wo}: fragen ist keine Liste`)
  }
})

test('die Antwort steht wirklich unter den Optionen', () => {
  // ReadingView vergleicht die angetippte Option mit `antwort` als Text.
  // Steht dort etwas, das gar nicht zur Auswahl steht, ist keine Antwort
  // richtig — sichtbar nur daran, dass es „nie stimmt".
  for (const t of texte) {
    for (const [i, f] of t.fragen.entries()) {
      const wo = `Text ${t.id} / Frage ${i + 1}`
      assert.equal(typeof f?.frage, 'string', `${wo}: frage fehlt`)
      assert.ok(Array.isArray(f.optionen) && f.optionen.length > 1, `${wo}: zu wenige Optionen`)
      assert.ok(
        f.optionen.includes(f.antwort),
        `${wo}: „${f.antwort}" steht nicht unter ${JSON.stringify(f.optionen)}`
      )
    }
  }
})

test('die Optionen einer Frage sind untereinander verschieden', () => {
  // Zwei gleiche Optionen hiessen zwei richtige Antworten — und beide
  // Knoepfe traegen denselben Text.
  for (const t of texte) {
    for (const [i, f] of t.fragen.entries()) {
      assert.equal(
        new Set(f.optionen).size,
        f.optionen.length,
        `Text ${t.id} / Frage ${i + 1}: doppelte Option in ${JSON.stringify(f.optionen)}`
      )
    }
  }
})

test('die IDs sind einmalig — ReadingView waehlt Texte darueber aus', () => {
  const gesehen = new Set()
  for (const t of texte) {
    assert.ok(!gesehen.has(t.id), `die ID „${t.id}" kommt zweimal vor`)
    gesehen.add(t.id)
  }
})
