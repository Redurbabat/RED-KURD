// Die Grammatik-Fragen sind JavaScript; ihre Form kennt TypeScript nur aus
// src/data/grammatikUebungen.d.ts. Diese Datei haelt die echten Daten gegen
// genau diese Zusage — und gegen das, worauf sich der GrammarTrainer beim
// Anzeigen verlaesst.
//
// Der Kommentar in der Deklaration nennt diese Datei. Als ich ihn schrieb,
// gab es sie noch nicht; das ist genau die Art von Zusage, die still falsch
// wird. Deshalb steht sie jetzt hier.
import test from 'node:test'
import assert from 'node:assert/strict'
import { grammatikUebungen } from '../src/data/grammatikUebungen.js'
import { EINHEITEN } from '../src/core/courses/courseRepository.ts'

const eintraege = Object.entries(grammatikUebungen)

test('jede Frage hat die Form, die grammatikUebungen.d.ts zusagt', () => {
  assert.ok(eintraege.length > 0, 'gar keine Grammatik-Fragen')
  for (const [kapitel, fragen] of eintraege) {
    assert.ok(Array.isArray(fragen) && fragen.length > 0, `${kapitel}: keine Fragen`)
    for (const [i, f] of fragen.entries()) {
      const wo = `${kapitel} / Frage ${i + 1}`
      assert.equal(typeof f?.frage, 'string', `${wo}: frage fehlt`)
      assert.ok(f.frage.length > 0, `${wo}: frage ist leer`)
      assert.equal(typeof f.erklaerung, 'string', `${wo}: erklaerung fehlt`)
      assert.ok(f.erklaerung.length > 0, `${wo}: erklaerung ist leer`)
      assert.ok(Array.isArray(f.optionen), `${wo}: optionen ist keine Liste`)
      for (const o of f.optionen) {
        assert.ok(typeof o === 'string' && o.length > 0, `${wo}: leere Option`)
      }
    }
  }
})

test('richtig zeigt immer auf eine vorhandene Option', () => {
  // Zeigt `richtig` daneben, gibt es keine richtige Antwort mehr: jede Wahl
  // gilt als falsch, und niemand kann die Runde bestehen. Im Fenster sieht
  // man davon nichts — nur dass es „nie stimmt".
  for (const [kapitel, fragen] of eintraege) {
    for (const [i, f] of fragen.entries()) {
      const wo = `${kapitel} / Frage ${i + 1}`
      assert.ok(Number.isInteger(f.richtig), `${wo}: richtig ist keine ganze Zahl`)
      assert.ok(
        f.richtig >= 0 && f.richtig < f.optionen.length,
        `${wo}: richtig=${f.richtig}, es gibt aber ${f.optionen.length} Optionen`
      )
    }
  }
})

test('die Optionen einer Frage sind untereinander verschieden', () => {
  // Zwei gleiche Optionen waeren nicht nur verwirrend: der GrammarTrainer
  // nimmt den Optionstext als React-key. Doppelte Schluessel heissen doppelt
  // gezeichnete Knoepfe und eine Auswahl, die auf den falschen zeigt.
  for (const [kapitel, fragen] of eintraege) {
    for (const [i, f] of fragen.entries()) {
      const einmalig = new Set(f.optionen)
      assert.equal(
        einmalig.size,
        f.optionen.length,
        `${kapitel} / Frage ${i + 1}: doppelte Option in ${JSON.stringify(f.optionen)}`
      )
    }
  }
})

test('jeder Schluessel gehoert zu einem echten Kapitel', () => {
  // Ein Tippfehler im Kapitelnamen faellt sonst nirgends auf: der Trainer
  // sucht die Fragen ueber die Kapitel-ID, findet nichts und ueberspringt
  // das Kapitel stillschweigend.
  const bekannt = new Set(EINHEITEN.map((e) => e.id))
  for (const [kapitel] of eintraege) {
    assert.ok(bekannt.has(kapitel), `„${kapitel}" ist kein Kapitel aus EINHEITEN`)
  }
})

test('der Trainer findet ueberhaupt Kapitel mit Notiz UND Fragen', () => {
  // Genau diese Schnittmenge zieht `zieheRegeln()`. Waere sie leer, zeigte
  // der Trainer nur noch „Noch keine Grammatik-Fragen da." — und das saehe
  // aus wie ein leeres Feature, nicht wie ein Fehler.
  const mitBeidem = EINHEITEN.filter((e) => e.grammatik && grammatikUebungen[e.id]?.length)
  assert.ok(mitBeidem.length >= 5, `nur ${mitBeidem.length} Kapitel mit Notiz und Fragen`)
})
