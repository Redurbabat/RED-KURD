// Tests des AI-Sprache-Baukastens: aus Feldern wird ein klarer Auftrag,
// die Pruefliste ist streng genug, und die Merge-Empfehlung laesst sich
// nicht ueberreden.
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

const bk = await import('../src/core/prompting/promptBaukasten.js')
const werkstatt = await import('../src/core/prompting/werkstattStore.js')
const { KEYS, exportiereSpeicherstand } = await import('../src/core/storage.js')

const GUTER_AUFTRAG = {
  ziel: 'Alle Knöpfe auf der Einstellungsseite sind mindestens 44 Pixel hoch.',
  ort: 'src/features/settings/',
  verboten: 'Kursdaten löschen\nneue Pakete installieren',
  pruefung: 'npm test und npm run build ausführen',
  arbeitsweise: 'Kleine Schritte, bei Risiko stoppen.',
}

test('aus leeren Feldern entsteht kein Text', () => {
  assert.equal(bk.baueAuftrag({}), '')
  assert.equal(bk.baueBugReport({}), '')
})

test('der Auftrag bekommt die Ueberschriften in fester Reihenfolge', () => {
  const text = bk.baueAuftrag(GUTER_AUFTRAG)
  const reihenfolge = ['ZIEL', 'ERLAUBT', 'NICHT ERLAUBT', 'PRÜFUNG', 'ARBEITSWEISE']
  let letzte = -1
  for (const wort of reihenfolge) {
    const stelle = text.indexOf(wort)
    assert.ok(stelle > letzte, `${wort} steht an der falschen Stelle`)
    letzte = stelle
  }
})

test('mehrzeilige Felder werden zur Aufzaehlung', () => {
  const text = bk.baueAuftrag(GUTER_AUFTRAG)
  assert.ok(text.includes('- Kursdaten löschen'))
  assert.ok(text.includes('- neue Pakete installieren'))
  // Bereits gesetzte Striche werden nicht verdoppelt
  const mitStrichen = bk.baueAuftrag({ ...GUTER_AUFTRAG, verboten: '- nichts löschen' })
  assert.ok(mitStrichen.includes('- nichts löschen'))
  assert.ok(!mitStrichen.includes('- - nichts'))
})

test('die Pruefliste erkennt einen vollstaendigen Auftrag', () => {
  const checks = bk.pruefeAuftrag(GUTER_AUFTRAG)
  assert.equal(checks.every((c) => c.ok), true)
  assert.equal(checks.length, 5)
})

test('leere Woerter wie „besser" fallen durch', () => {
  const schwach = { ...GUTER_AUFTRAG, ziel: 'Mach die Einstellungsseite einfach viel besser.' }
  const checks = bk.pruefeAuftrag(schwach)
  assert.equal(checks.find((c) => c.id === 'kein-besser').ok, false)
  // „schöner" ebenso
  const schoener = { ...GUTER_AUFTRAG, ziel: 'Die Startseite soll deutlich schöner aussehen.' }
  assert.equal(bk.pruefeAuftrag(schoener).find((c) => c.id === 'kein-besser').ok, false)
})

test('ein zu kurzes Ziel zaehlt nicht als Ziel', () => {
  const checks = bk.pruefeAuftrag({ ...GUTER_AUFTRAG, ziel: 'Buttons größer' })
  assert.equal(checks.find((c) => c.id === 'ziel').ok, false)
})

test('fehlende Bausteine werden einzeln gemeldet', () => {
  const ohneOrt = bk.pruefeAuftrag({ ...GUTER_AUFTRAG, ort: '   ' })
  assert.equal(ohneOrt.find((c) => c.id === 'ort').ok, false)
  const ohnePruefung = bk.pruefeAuftrag({ ...GUTER_AUFTRAG, pruefung: '' })
  assert.equal(ohnePruefung.find((c) => c.id === 'pruefung').ok, false)
})

test('der Bug-Report nummeriert die Schritte', () => {
  const text = bk.baueBugReport({
    passiert: 'Nach dem Import steht mein XP-Stand auf 0.',
    erwartet: 'Der XP-Stand aus der Sicherungsdatei.',
    nachstellen: 'Export erstellen\nApp neu laden\nDatei importieren',
    geraet: 'iPhone 13, Safari',
  })
  assert.ok(text.includes('1. Export erstellen'))
  assert.ok(text.includes('3. Datei importieren'))
  assert.ok(text.includes('GERÄT'))
})

test('ein Bug-Report ohne Schritte ist unvollstaendig', () => {
  const checks = bk.pruefeBugReport({
    passiert: 'Es geht einfach nicht mehr.',
    erwartet: 'Es sollte funktionieren.',
    nachstellen: 'App öffnen',
    geraet: 'iPhone',
  })
  assert.equal(checks.find((c) => c.id === 'schritte').ok, false, 'ein Schritt reicht nicht')
})

test('Merge-Empfehlung: Tests und Verbote sind Ausschlusskriterien', () => {
  const alles = Object.fromEntries(bk.PR_CHECKLISTE.map((p) => [p.id, true]))
  assert.equal(bk.pruefeMerge(alles).mergen, true)

  const ohneTests = { ...alles, tests: false }
  assert.equal(bk.pruefeMerge(ohneTests).mergen, false)
  assert.match(bk.pruefeMerge(ohneTests).text, /Zurückgeben/)

  const ohneVerbote = { ...alles, verbote: false }
  assert.equal(bk.pruefeMerge(ohneVerbote).mergen, false)

  // Ein weicher Punkt offen: kein Merge, aber auch kein Zurueckgeben
  const ohneHandy = { ...alles, handy: false }
  const urteil = bk.pruefeMerge(ohneHandy)
  assert.equal(urteil.mergen, false)
  assert.equal(urteil.offen, 1)
  assert.doesNotMatch(urteil.text, /Zurückgeben/)

  assert.equal(bk.pruefeMerge({}).mergen, false)
})

test('die Werkstatt merkt sich angefangene Texte', () => {
  globalThis.localStorage.removeItem(KEYS.promptingWerkstatt)
  werkstatt._cacheLeeren()

  werkstatt.setzeAuftragsFeld('ziel', 'Ein klares Ziel mit genug Zeichen für die Prüfliste.')
  werkstatt.setzeBugFeld('passiert', 'Die Tastatur klappt zu.')
  werkstatt.schaltePr('tests')

  werkstatt._cacheLeeren() // neu laden, als hätte man die App geschlossen
  assert.match(werkstatt.holeAuftrag().ziel, /klares Ziel/)
  assert.equal(werkstatt.holeBug().passiert, 'Die Tastatur klappt zu.')
  assert.equal(werkstatt.holePr().tests, true)

  // Haken schaltet zurueck
  werkstatt.schaltePr('tests')
  assert.equal(werkstatt.holePr().tests, false)

  // Leeren betrifft nur den einen Bereich
  werkstatt.leereAuftrag()
  assert.deepEqual(werkstatt.holeAuftrag(), {})
  assert.equal(werkstatt.holeBug().passiert, 'Die Tastatur klappt zu.')
})

test('ein kaputter Werkstatt-Stand wirft die App nicht um', () => {
  globalThis.localStorage.setItem(KEYS.promptingWerkstatt, '{kaputt')
  werkstatt._cacheLeeren()
  assert.deepEqual(werkstatt.holeAuftrag(), {})
  assert.deepEqual(werkstatt.holePr(), {})
})

test('die Werkstatt wandert in die Sicherung', () => {
  globalThis.localStorage.removeItem(KEYS.promptingWerkstatt)
  werkstatt._cacheLeeren()
  werkstatt.setzeAuftragsFeld('ziel', 'Etwas Merkbares')
  const sicherung = exportiereSpeicherstand()
  assert.ok('promptingWerkstatt' in sicherung)
  assert.equal(sicherung.promptingWerkstatt.auftrag.ziel, 'Etwas Merkbares')
})
