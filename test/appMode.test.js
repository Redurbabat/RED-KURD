// Tests fuer den App-Bereich-Umschalter (Sprache/Code/AI) und die
// Datenstrukturen der neuen Lernbereiche.
import test from 'node:test'
import assert from 'node:assert/strict'

class SpeicherAttrappe {
  constructor() {
    this.daten = new Map()
  }
  getItem(key) {
    return this.daten.has(key) ? this.daten.get(key) : null
  }
  setItem(key, wert) {
    this.daten.set(key, String(wert))
  }
  removeItem(key) {
    this.daten.delete(key)
  }
}
globalThis.localStorage = new SpeicherAttrappe()

const { APP_MODES, APP_MODE_LABELS, APP_MODE_LISTE } = await import(
  '../src/features/app-mode/appModes.js'
)
const { isValidAppMode, loadAppMode, saveAppMode } = await import(
  '../src/features/app-mode/appModeStorage.js'
)
const { KEYS, lies } = await import('../src/core/storage.js')

// ===== App-Modus =====

test('ohne gespeicherten Wert startet die App im Sprachbereich', () => {
  globalThis.localStorage.removeItem(KEYS.appBereich)
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
})

test('speichern und laden sind ein Paar — fuer jeden Bereich', () => {
  for (const mode of APP_MODE_LISTE) {
    assert.equal(saveAppMode(mode), true)
    assert.equal(loadAppMode(), mode)
  }
})

test('ungueltige Werte werden ignoriert und fallen auf Sprache zurueck', () => {
  assert.equal(saveAppMode('spielhalle'), false)
  globalThis.localStorage.setItem(KEYS.appBereich, JSON.stringify('spielhalle'))
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
  globalThis.localStorage.setItem(KEYS.appBereich, '{kaputt')
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
})

test('der gespeicherte Schluessel ist der vereinbarte', () => {
  assert.equal(KEYS.appBereich, 'red-kurd-active-app-mode-v1')
  saveAppMode(APP_MODES.CODE)
  assert.equal(lies(KEYS.appBereich), 'code')
})

test('jeder Bereich hat ein deutsches Etikett', () => {
  for (const mode of APP_MODE_LISTE) {
    assert.ok(APP_MODE_LABELS[mode], `Etikett fuer ${mode} fehlt`)
  }
  assert.equal(isValidAppMode('language'), true)
  assert.equal(isValidAppMode(''), false)
  assert.equal(isValidAppMode(null), false)
})

// ===== Code-lernen-Daten =====

const { codeLearningPaths, holeCodePfad } = await import(
  '../src/features/code-learning/data/codeLessons.js'
)
const { codeExercises } = await import('../src/features/code-learning/data/codeExercises.js')

test('jeder Code-Lernpfad ist vollstaendig und traegt echte Inhalte', () => {
  const pfadIds = codeLearningPaths.map((p) => p.id)
  assert.equal(new Set(pfadIds).size, pfadIds.length, 'Pfad-Ids sind einmalig')
  assert.ok(codeLearningPaths.length >= 7, 'mindestens sieben Lernpfade')

  for (const pfad of codeLearningPaths) {
    assert.ok(pfad.title && pfad.description && pfad.level && pfad.icon, pfad.id)
    assert.ok(pfad.lessons.length >= 3, `${pfad.id}: mindestens drei Lektionen`)
    for (const lektion of pfad.lessons) {
      assert.ok(lektion.durationMinutes > 0, `${lektion.id}: Dauer fehlt`)
      assert.ok(lektion.title, `${lektion.id}: Titel fehlt`)
      assert.ok(
        Array.isArray(lektion.inhalt) && lektion.inhalt.length >= 2,
        `${lektion.id}: Inhalt fehlt`
      )
      assert.ok(lektion.merke, `${lektion.id}: Merksatz fehlt`)
      assert.ok(!('status' in lektion), `${lektion.id}: Status kommt aus dem Lernstand, nicht aus den Daten`)
    }
  }
  assert.equal(holeCodePfad('gibt-es-nicht'), null)
  assert.equal(holeCodePfad('html').id, 'html')
})

test('alle Lektions-Ids sind ueber alle Pfade hinweg einmalig', () => {
  const ids = codeLearningPaths.flatMap((p) => p.lessons.map((l) => l.id))
  assert.equal(new Set(ids).size, ids.length)
})

test('jede Code-Uebung traegt alle Pflichtfelder', () => {
  const ids = codeExercises.map((u) => u.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(codeExercises.length >= 6)
  for (const u of codeExercises) {
    assert.ok(u.title && u.topic && u.difficulty && u.description && u.task, u.id)
    assert.ok(u.estimatedMinutes > 0, u.id)
  }
})

// ===== Prompting-Daten =====

const { promptLessons } = await import(
  '../src/features/prompting-learning/data/promptLessons.js'
)
const { promptExercises } = await import(
  '../src/features/prompting-learning/data/promptExercises.js'
)

test('die Prompting-Lektionen sind vollstaendig und traegen echte Inhalte', () => {
  const ids = promptLessons.map((l) => l.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(promptLessons.length >= 9, 'mindestens neun Lektionen')
  for (const l of promptLessons) {
    assert.ok(l.title && l.description, l.id)
    assert.ok(l.durationMinutes > 0, l.id)
    assert.ok(Array.isArray(l.inhalt) && l.inhalt.length >= 2, `${l.id}: Inhalt fehlt`)
    assert.ok(l.beispiel, `${l.id}: Beispiel fehlt`)
    assert.ok(l.merke, `${l.id}: Merksatz fehlt`)
    assert.ok(!('status' in l), `${l.id}: Status kommt aus dem Lernstand`)
  }
})

test('jede Prompting-Uebung traegt alle Pflichtfelder', () => {
  const ids = promptExercises.map((u) => u.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(promptExercises.length >= 6)
  for (const u of promptExercises) {
    assert.ok(u.title && u.topic && u.difficulty && u.description && u.task, u.id)
    assert.ok(u.estimatedMinutes > 0, u.id)
  }
})
