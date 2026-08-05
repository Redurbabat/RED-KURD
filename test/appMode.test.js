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
const { hatGespeicherteApp, isValidAppMode, loadAppMode, saveAppMode } = await import(
  '../src/features/app-mode/appModeStorage.js'
)
const { KEYS, lies } = await import('../src/core/storage.js')

// ===== App-Modus =====

test('ohne gespeicherten Wert startet die App im Sprachbereich', () => {
  globalThis.localStorage.removeItem(KEYS.appBereich)
  globalThis.localStorage.removeItem(KEYS.appAktiv)
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
  assert.equal(hatGespeicherteApp(), false)
})

test('speichern und laden sind ein Paar — fuer jeden Bereich', () => {
  for (const mode of APP_MODE_LISTE) {
    assert.equal(saveAppMode(mode), true)
    assert.equal(loadAppMode(), mode)
  }
})

test('ungueltige Werte werden ignoriert und fallen auf Sprache zurueck', () => {
  assert.equal(saveAppMode('spielhalle'), false)
  globalThis.localStorage.setItem(KEYS.appAktiv, JSON.stringify('spielhalle'))
  globalThis.localStorage.setItem(KEYS.appBereich, JSON.stringify('spielhalle'))
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
  globalThis.localStorage.setItem(KEYS.appAktiv, '{kaputt')
  globalThis.localStorage.setItem(KEYS.appBereich, '{kaputt')
  assert.equal(loadAppMode(), APP_MODES.LANGUAGE)
})

test('die gespeicherten Schluessel sind die vereinbarten — beide werden geschrieben', () => {
  assert.equal(KEYS.appBereich, 'red-kurd-active-app-mode-v1')
  assert.equal(KEYS.appAktiv, 'red-kurd-active-app-v1')
  saveAppMode(APP_MODES.CODE)
  assert.equal(lies(KEYS.appAktiv), 'code')
  // Der alte Schluessel wird weiter mitgeschrieben — ein Ruecksprung auf
  // eine aeltere App-Version verliert nichts.
  assert.equal(lies(KEYS.appBereich), 'code')
})

test('ein alter Speicherstand wird uebernommen, nie geloescht', () => {
  globalThis.localStorage.removeItem(KEYS.appAktiv)
  globalThis.localStorage.setItem(KEYS.appBereich, JSON.stringify('electro'))
  assert.equal(hatGespeicherteApp(), true)
  assert.equal(loadAppMode(), APP_MODES.ELECTRO)
  // Beim Lesen wird der Wert in den neuen Schluessel kopiert …
  assert.equal(lies(KEYS.appAktiv), 'electro')
  // … und der alte bleibt unangetastet stehen.
  assert.equal(lies(KEYS.appBereich), 'electro')
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

// ===== Elektro-Daten =====

const { electroLessons, electroGruppen } = await import(
  '../src/features/electro-learning/data/electroLessons.js'
)
const { electroExercises } = await import(
  '../src/features/electro-learning/data/electroExercises.js'
)

test('die Elektro-Lektionen sind vollstaendig, gruppiert und sicherheitsbewusst', () => {
  const ids = electroLessons.map((l) => l.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(electroLessons.length >= 9, 'mindestens neun Lektionen')
  for (const l of electroLessons) {
    assert.ok(l.title && l.description, l.id)
    assert.ok(electroGruppen.includes(l.gruppe), `${l.id}: unbekannte Gruppe ${l.gruppe}`)
    assert.ok(Array.isArray(l.inhalt) && l.inhalt.length >= 2, `${l.id}: Inhalt fehlt`)
    assert.ok(l.beispiel && l.merke, `${l.id}: Beispiel/Merksatz fehlt`)
    assert.ok(!('status' in l), `${l.id}: Status kommt aus dem Lernstand`)
  }
  // Die 5 Sicherheitsregeln muessen als eigene Lektion existieren.
  const regeln = electroLessons.find((l) => l.id === 'el-5regeln')
  assert.ok(regeln, 'Lektion zu den 5 Sicherheitsregeln fehlt')
  assert.ok(regeln.beispiel.includes('Freischalten'))
  assert.ok(regeln.beispiel.includes('Spannungsfreiheit'))
})

test('jede Elektro-Uebung traegt alle Pflichtfelder', () => {
  const ids = electroExercises.map((u) => u.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(electroExercises.length >= 6)
  for (const u of electroExercises) {
    assert.ok(u.title && u.topic && u.difficulty && u.description && u.task, u.id)
    assert.ok(u.estimatedMinutes > 0, u.id)
  }
})

test('der Export nimmt die Lernstaende aller Bereiche mit', async () => {
  const { schreibe, exportiereSpeicherstand } = await import('../src/core/storage.js')
  schreibe(KEYS.codeFortschritt, { version: 1, xp: 20, erledigt: { 'html-1': '2026-08-05' } })
  schreibe(KEYS.electroFortschritt, { version: 1, xp: 10, erledigt: {} })
  schreibe(KEYS.fehlerbuch, { version: 1, naechsteId: 2, eintraege: [] })
  const sicherung = exportiereSpeicherstand()
  assert.equal(sicherung.codeFortschritt.xp, 20)
  assert.equal(sicherung.electroFortschritt.xp, 10)
  assert.ok(sicherung.fehlerbuch, 'auch das Fehlerbuch wandert in die Sicherung')
  assert.ok(sicherung.appBereich, 'der aktive Bereich ebenfalls')
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
