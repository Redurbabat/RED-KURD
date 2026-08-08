// Die Inhalte von Code lernen, AI-Sprache und Elektro-Lehre sind JavaScript;
// ihre Form kennt TypeScript nur aus src/types/lernbereich.d.ts. Eine solche
// Zusage waechst nicht mit den Daten mit — sie kann luegen, ohne dass der
// Typpruefer etwas merkt. Hier stehen die echten Daten gegen genau diese
// Zusagen.
//
// Vorbild ist test/kursdaten-form.test.js. Faellt hier etwas um, ist die
// Frage: haben sich die Daten geaendert (dann gehoert die Deklaration
// angepasst) oder ist ein Datensatz kaputt (dann die Daten)? Beides still
// laufen zu lassen ist die einzige falsche Antwort.
import test from 'node:test'
import assert from 'node:assert/strict'
import { codeLearningPaths } from '../src/features/code-learning/data/codeLessons.js'
import { codeExercises } from '../src/features/code-learning/data/codeExercises.js'
import { promptLessons } from '../src/features/prompting-learning/data/promptLessons.js'
import { promptExercises } from '../src/features/prompting-learning/data/promptExercises.js'
import { electroLessons } from '../src/features/electro-learning/data/electroLessons.js'
import { electroExercises } from '../src/features/electro-learning/data/electroExercises.js'

function istText(wert) {
  return typeof wert === 'string' && wert.length > 0
}

function istTextOderFehlt(wert) {
  return wert === undefined || istText(wert)
}

function istZahl(wert) {
  return typeof wert === 'number' && Number.isFinite(wert) && wert > 0
}

/** Prueft eine Lektion gegen `Bereichslektion`. */
function pruefeLektion(l, wo) {
  assert.ok(istText(l?.id), `${wo}: id fehlt`)
  assert.ok(istText(l.title), `${wo}: title fehlt`)
  assert.ok(istTextOderFehlt(l.description), `${wo}: description ist weder Text noch abwesend`)
  assert.ok(istZahl(l.durationMinutes), `${wo}: durationMinutes ist keine positive Zahl`)
  assert.ok(Array.isArray(l.inhalt) && l.inhalt.length > 0, `${wo}: inhalt ist keine gefuellte Liste`)
  for (const [i, absatz] of l.inhalt.entries()) {
    assert.ok(istText(absatz), `${wo}: Absatz ${i} ist kein Text`)
  }
  assert.ok(istTextOderFehlt(l.beispiel), `${wo}: beispiel ist weder Text noch abwesend`)
  assert.ok(istTextOderFehlt(l.merke), `${wo}: merke ist weder Text noch abwesend`)
  assert.ok(istTextOderFehlt(l.gruppe), `${wo}: gruppe ist weder Text noch abwesend`)
}

/** Prueft eine Uebung gegen `Bereichsuebung`. */
function pruefeUebung(u, wo) {
  for (const feld of ['id', 'title', 'topic', 'difficulty', 'description', 'task']) {
    assert.ok(istText(u?.[feld]), `${wo}: ${feld} fehlt`)
  }
  assert.ok(istZahl(u.estimatedMinutes), `${wo}: estimatedMinutes ist keine positive Zahl`)
}

/** Doppelte IDs waeren fatal: der Lernstand merkt sich Erledigtes je ID. */
function pruefeEindeutig(ids, wo) {
  const gesehen = new Set()
  for (const id of ids) {
    assert.ok(!gesehen.has(id), `${wo}: die ID „${id}" kommt zweimal vor`)
    gesehen.add(id)
  }
}

test('die Lernpfade von „Code lernen" haben die zugesagte Form', () => {
  assert.ok(Array.isArray(codeLearningPaths) && codeLearningPaths.length > 0, 'keine Lernpfade')
  for (const p of codeLearningPaths) {
    const wo = `Lernpfad ${p?.id}`
    for (const feld of ['id', 'title', 'icon', 'description', 'level']) {
      assert.ok(istText(p?.[feld]), `${wo}: ${feld} fehlt`)
    }
    assert.ok(Array.isArray(p.lessons) && p.lessons.length > 0, `${wo}: keine Lektionen`)
    for (const l of p.lessons) pruefeLektion(l, `${wo} / Lektion ${l?.id}`)
  }
  pruefeEindeutig(codeLearningPaths.map((p) => p.id), 'Lernpfade')
})

test('alle Lektionen der drei Bereiche haben dieselbe Form', () => {
  // Genau darauf beruhen LektionModal und LernpfadKarte: eine Darstellung
  // fuer drei Apps. Weichen die Daten ab, faellt es hier auf und nicht erst
  // an einer leeren Stelle im Fenster.
  for (const l of promptLessons) pruefeLektion(l, `AI-Sprache / ${l?.id}`)
  for (const l of electroLessons) pruefeLektion(l, `Elektro-Lehre / ${l?.id}`)
  assert.ok(promptLessons.length > 0 && electroLessons.length > 0, 'ein Bereich ist leer')
})

test('alle Uebungen der drei Bereiche haben dieselbe Form', () => {
  for (const u of codeExercises) pruefeUebung(u, `Code / ${u?.id}`)
  for (const u of promptExercises) pruefeUebung(u, `AI-Sprache / ${u?.id}`)
  for (const u of electroExercises) pruefeUebung(u, `Elektro-Lehre / ${u?.id}`)
  assert.ok(
    codeExercises.length > 0 && promptExercises.length > 0 && electroExercises.length > 0,
    'ein Bereich hat keine Uebungen'
  )
})

test('IDs sind je Bereich eindeutig — der Lernstand haengt daran', () => {
  // Erledigtes wird als { id: Datum } gespeichert. Zwei Eintraege mit
  // derselben ID waeren fuer den Lernstand ein einziger: eine Lektion
  // abschliessen wuerde die andere gleich mit abhaken.
  const codeLektionen = codeLearningPaths.flatMap((p) => p.lessons.map((l) => l.id))
  pruefeEindeutig([...codeLektionen, ...codeExercises.map((u) => u.id)], 'Code lernen')
  pruefeEindeutig([...promptLessons, ...promptExercises].map((e) => e.id), 'AI-Sprache')
  pruefeEindeutig([...electroLessons, ...electroExercises].map((e) => e.id), 'Elektro-Lehre')
})
