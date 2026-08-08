// Der wichtigste Test des Projekts: Eine Sicherung muss ALLES aus ALLEN
// vier Apps zurückbringen. Geht hier etwas verloren, verliert jemand
// seinen echten Lernstand — deshalb wird der volle Rundlauf geprüft:
// füllen → exportieren → Gerät leeren → importieren → alles wieder da.
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
  alleLoeschen() {
    this.daten.clear()
  }
}
const speicher = new SpeicherAttrappe()
globalThis.localStorage = speicher

/**
 * Laedt alle Module frisch — so verhaelt sich der Test wie die echte App
 * nach dem Import, die sich neu laedt (window.location.reload).
 */
let welle = 0
async function frischeModule() {
  welle += 1
  const q = `?welle=${welle}`
  return {
    storage: await import(`../src/core/storage.js${q}`),
    code: await import(`../src/features/code-learning/codeProgressStore.js${q}`),
    prompt: await import(`../src/features/prompting-learning/promptProgressStore.js${q}`),
    electro: await import(`../src/features/electro-learning/electroProgressStore.js${q}`),
    schule: await import(`../src/core/elektro/schuleStore.js${q}`),
    werkstatt: await import(`../src/core/prompting/werkstattStore.js${q}`),
    fehlerbuch: await import(`../src/features/code-learning/fehlerbuchStore.js${q}`),
  }
}

test('Sicherung und Rueckspielung bringen alle vier Apps zurueck', async () => {
  speicher.alleLoeschen()
  const m = await frischeModule()

  // ===== 1. In allen vier Apps etwas tun =====

  // Sprache: der Lernstand der bisherigen App
  m.storage.schreibe(m.storage.KEYS.fortschritt, { xp: 1234, serie: 7, karten: { a: 1 } })
  m.storage.schreibe(m.storage.KEYS.profil, { version: 2, name: 'Redur' })

  // Code lernen: Lektion abschliessen + Fehlerbuch-Eintrag
  m.code.codeLernstand.schliesseAb('html-1')
  m.fehlerbuch.fehlerNotieren({
    titel: 'Tastatur klappte zu',
    fehler: 'Fokus ging verloren',
    loesung: 'Effekt nur an offen gehaengt',
  })

  // AI-Sprache: Lektion + angefangener Auftrag + PR-Haken
  m.prompt.promptLernstand.schliesseAb('prompt-was')
  m.werkstatt.setzeAuftragsFeld('ziel', 'Alle Knöpfe mindestens 44 Pixel hoch.')
  m.werkstatt.schaltePr('tests')

  // Elektro: Lektion + Note + Pruefung + Berichtsheft
  m.electro.electroLernstand.schliesseAb('el-strom')
  const fach = m.schule.faecher()[0]
  m.schule.noteHinzufuegen({ fachId: fach.id, note: 5, thema: 'Ohm' })
  m.schule.pruefungHinzufuegen({ titel: 'Test 3', datum: '2026-09-01' })
  m.schule.wocheHinzufuegen({ woche: 'KW 32', taetigkeiten: 'Rohre gelegt' })

  // ===== 2. Sicherung erstellen (wie der Export-Knopf) =====
  const sicherung = m.storage.exportiereSpeicherstand()

  // Alle vier Apps muessen in der Datei stehen
  for (const bereich of [
    'fortschritt',
    'codeFortschritt',
    'promptingFortschritt',
    'electroFortschritt',
    'electroSchule',
    'promptingWerkstatt',
    'fehlerbuch',
  ]) {
    assert.ok(bereich in sicherung, `${bereich} fehlt in der Sicherung`)
  }

  // ===== 3. Geraet leeren — als waere es ein neues Handy =====
  const kopie = JSON.parse(JSON.stringify(sicherung))
  speicher.alleLoeschen()
  const leer = await frischeModule()
  assert.equal(leer.code.codeLernstand.istErledigt('html-1'), false, 'Vorbedingung: wirklich leer')
  assert.equal(leer.schule.noten().length, 0)

  // ===== 4. Sicherung einspielen =====
  const anzahl = leer.storage.importiereSpeicherstand(kopie)
  assert.ok(anzahl >= 7, `zu wenige Bereiche geschrieben: ${anzahl}`)

  // ===== 5. Nach dem Neuladen ist alles wieder da =====
  const n = await frischeModule()

  // Sprache
  assert.equal(n.storage.lies(n.storage.KEYS.fortschritt).xp, 1234)
  assert.equal(n.storage.lies(n.storage.KEYS.profil).name, 'Redur')

  // Code lernen
  assert.equal(n.code.codeLernstand.istErledigt('html-1'), true, 'Code-Lektion verloren')
  assert.equal(n.fehlerbuch.fehlerbuchEintraege()[0].titel, 'Tastatur klappte zu', 'Fehlerbuch verloren')

  // AI-Sprache
  assert.equal(n.prompt.promptLernstand.istErledigt('prompt-was'), true, 'AI-Lektion verloren')
  assert.match(n.werkstatt.holeAuftrag().ziel, /44 Pixel/, 'angefangener Auftrag verloren')
  assert.equal(n.werkstatt.holePr().tests, true, 'PR-Haken verloren')

  // Elektro
  assert.equal(n.electro.electroLernstand.istErledigt('el-strom'), true, 'Elektro-Lektion verloren')
  assert.equal(n.schule.noten().length, 1, 'Note verloren')
  assert.equal(n.schule.noten()[0].thema, 'Ohm')
  assert.equal(n.schule.pruefungen()[0].titel, 'Test 3', 'Pruefung verloren')
  assert.equal(n.schule.berichtsheft()[0].woche, 'KW 32', 'Berichtsheft verloren')
})

test('XP der vier Apps bleiben getrennt — keine App zaehlt fuer die andere', async () => {
  speicher.alleLoeschen()
  const m = await frischeModule()

  m.code.codeLernstand.schliesseAb('html-1')
  m.code.codeLernstand.schliesseAb('html-2')
  m.prompt.promptLernstand.schliesseAb('prompt-was')

  assert.equal(m.code.codeLernstand.xpHeute(), 20, 'Code: zwei Lektionen = 20 XP')
  assert.equal(m.prompt.promptLernstand.xpHeute(), 10, 'AI: eine Lektion = 10 XP')
  assert.equal(m.electro.electroLernstand.xpHeute(), 0, 'Elektro hat nichts abbekommen')
})

test('geraete-lokale Werte wandern NICHT in die Sicherung', async () => {
  speicher.alleLoeschen()
  const m = await frischeModule()

  m.storage.schreibe(m.storage.KEYS.ohneKonto, true)
  m.storage.schreibe(m.storage.KEYS.sitzung, { laeuft: true })
  m.storage.schreibe(m.storage.KEYS.codeFortschritt, { xp: 10 })

  const sicherung = m.storage.exportiereSpeicherstand()
  assert.ok(!('ohneKonto' in sicherung), 'die Anmelde-Entscheidung gehoert diesem Geraet')
  assert.ok(!('sitzung' in sicherung), 'eine halb fertige Sitzung darf nicht mitwandern')
  assert.ok('codeFortschritt' in sicherung)
})

test('eine fremde oder kaputte Datei ueberschreibt nichts', async () => {
  speicher.alleLoeschen()
  const m = await frischeModule()
  m.code.codeLernstand.schliesseAb('html-1')

  // Weder Unsinn noch fremde Formen duerfen etwas anrichten
  assert.equal(m.storage.importiereSpeicherstand(null), 0)
  assert.equal(m.storage.importiereSpeicherstand('kaputt'), 0)
  assert.equal(m.storage.importiereSpeicherstand([1, 2, 3]), 0)
  assert.equal(m.storage.importiereSpeicherstand({ fremd: 'daten' }), 0)

  const danach = await frischeModule()
  assert.equal(danach.code.codeLernstand.istErledigt('html-1'), true, 'Lernstand blieb unberuehrt')
})
