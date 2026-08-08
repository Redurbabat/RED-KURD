// Tests der Elektro-Lehre: Notenrechnung, Formeln und der Schul-Speicher.
// Die Rechnungen sind reine Funktionen — hier faellt jeder Denkfehler auf,
// bevor jemand sein Zeugnis danach plant.
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

const rechnung = await import('../src/core/elektro/notenRechnung.js')
const formeln = await import('../src/core/elektro/formeln.js')
const schule = await import('../src/core/elektro/schuleStore.ts')
const { KEYS } = await import('../src/core/storage.ts')

// ===== Noten =====

test('Zahlen mit Komma und Punkt zaehlen gleich', () => {
  assert.equal(rechnung.zahl('4,5'), 4.5)
  assert.equal(rechnung.zahl('4.5'), 4.5)
  assert.equal(rechnung.zahl(' 5 '), 5)
  assert.equal(rechnung.zahl('gut'), null)
  assert.equal(rechnung.zahl(''), null)
})

test('gueltige Noten liegen im Bereich der Skala', () => {
  assert.equal(rechnung.istGueltigeNote('4,5'), true)
  assert.equal(rechnung.istGueltigeNote('6'), true)
  assert.equal(rechnung.istGueltigeNote('0,5'), false)
  assert.equal(rechnung.istGueltigeNote('7'), false)
})

test('bestanden haengt an der Richtung der Skala', () => {
  // Schweiz: 6 ist die beste Note, ab 4 bestanden
  assert.equal(rechnung.istBestanden(4, 'schweiz'), true)
  assert.equal(rechnung.istBestanden(3.5, 'schweiz'), false)
  // Deutschland: 1 ist die beste Note, bis 4 bestanden
  assert.equal(rechnung.istBestanden(4, 'deutschland'), true)
  assert.equal(rechnung.istBestanden(5, 'deutschland'), false)
  assert.equal(rechnung.istBestanden(1, 'deutschland'), true)
})

test('der Durchschnitt beachtet Gewichte', () => {
  assert.equal(rechnung.durchschnitt([{ note: 4 }, { note: 6 }]), 5)
  // Die 6 zaehlt doppelt: (4·1 + 6·2) / 3 = 5,33
  assert.equal(
    rechnung.gerundet(rechnung.durchschnitt([{ note: 4, gewicht: 1 }, { note: 6, gewicht: 2 }]), 2),
    5.33
  )
  assert.equal(rechnung.durchschnitt([]), null)
  assert.equal(rechnung.durchschnitt([{ note: 'keine' }]), null)
})

test('Zeugnisnoten runden auf halbe Noten', () => {
  assert.equal(rechnung.halbeNote(4.7), 4.5)
  assert.equal(rechnung.halbeNote(4.8), 5)
  assert.equal(rechnung.halbeNote(5.24), 5)
})

test('benoetigteNote sagt, was die naechste Pruefung bringen muss', () => {
  const noten = [{ note: 4, gewicht: 1 }, { note: 4, gewicht: 1 }]
  // Schnitt 4, Ziel 4,5, naechste Note zaehlt einfach:
  // (8 + x) / 3 = 4,5  →  x = 5,5
  const eins = rechnung.benoetigteNote(noten, 4.5, 1)
  assert.equal(rechnung.gerundet(eins.note, 2), 5.5)
  assert.equal(eins.machbar, true)
  assert.equal(eins.schonErreicht, false)

  // Doppelt gewichtet reicht eine kleinere Note: (8 + 2x) / 4 = 4,5 → x = 5
  assert.equal(rechnung.gerundet(rechnung.benoetigteNote(noten, 4.5, 2).note, 2), 5)

  // Unmoegliches Ziel wird als nicht machbar gemeldet, nicht verschwiegen
  const hart = rechnung.benoetigteNote([{ note: 2 }, { note: 2 }], 5.5, 1)
  assert.equal(hart.machbar, false)

  // Ziel schon erreicht
  const gut = rechnung.benoetigteNote([{ note: 5.5 }, { note: 5.5 }], 4.5, 1)
  assert.equal(gut.schonErreicht, true)
})

test('beste und schlechteste Note kennen die Richtung', () => {
  const noten = [{ note: 3 }, { note: 5.5 }, { note: 4 }]
  assert.equal(rechnung.besteNote(noten, 'schweiz'), 5.5)
  assert.equal(rechnung.schlechtesteNote(noten, 'schweiz'), 3)
  assert.equal(rechnung.besteNote(noten, 'deutschland'), 3)
  assert.equal(rechnung.schlechtesteNote(noten, 'deutschland'), 5.5)
})

test('der Trend braucht genug Noten und kennt die Richtung', () => {
  assert.equal(rechnung.trend([{ note: 4, datum: '2026-01-01' }]), 'zuwenig')
  const besser = [
    { note: 3, datum: '2026-01-01' },
    { note: 3.5, datum: '2026-02-01' },
    { note: 5, datum: '2026-03-01' },
    { note: 5.5, datum: '2026-04-01' },
    { note: 5.5, datum: '2026-05-01' },
  ]
  assert.equal(rechnung.trend(besser, 'schweiz'), 'besser')
  // Dieselben Zahlen sind in Deutschland eine Verschlechterung
  assert.equal(rechnung.trend(besser, 'deutschland'), 'schlechter')
})

test('tageBis rechnet Tage bis zu einem Datum', () => {
  assert.equal(rechnung.tageBis('2026-08-10', '2026-08-05'), 5)
  assert.equal(rechnung.tageBis('2026-08-01', '2026-08-05'), -4)
  assert.equal(rechnung.tageBis('', '2026-08-05'), null)
  assert.equal(rechnung.tageBis('kein datum', '2026-08-05'), null)
})

// ===== Formeln =====

test('Ohmsches Gesetz rechnet in alle Richtungen', () => {
  assert.equal(formeln.strom(24, 8), 3)
  assert.equal(formeln.spannung(8, 3), 24)
  assert.equal(formeln.widerstand(24, 3), 8)
  // Teilen durch null gibt kein Unendlich, sondern nichts
  assert.equal(formeln.strom(24, 0), null)
  assert.equal(formeln.widerstand(24, 0), null)
  assert.equal(formeln.strom('', 8), null)
})

test('Leistung, Energie und Kosten', () => {
  assert.equal(formeln.leistung(230, 10), 2300)
  assert.equal(formeln.energieKwh(2000, 1.5), 3)
  assert.equal(formeln.kosten(3, 0.3), 0.8999999999999999)
  assert.equal(rechnung.gerundet(formeln.kosten(3, 0.3), 2), 0.9)
})

test('Spannungsfall: Wechselstrom und Drehstrom', () => {
  // 2 · 30 m · 16 A / (56 · 2,5 mm²) = 6,857 V
  const wechsel = formeln.spannungsfall({ laenge: 30, strom: 16, querschnitt: 2.5, netzspannung: 230 })
  assert.equal(rechnung.gerundet(wechsel.volt, 2), 6.86)
  assert.equal(rechnung.gerundet(wechsel.prozent, 2), 2.98)

  // Drehstrom rechnet mit √3 statt 2 — der Fall ist kleiner
  const dreh = formeln.spannungsfall({ laenge: 30, strom: 16, querschnitt: 2.5, phasen: 3, netzspannung: 400 })
  assert.ok(dreh.volt < wechsel.volt)

  // Aluminium leitet schlechter — der Fall ist groesser
  const alu = formeln.spannungsfall({ laenge: 30, strom: 16, querschnitt: 2.5, material: 'aluminium' })
  assert.ok(alu.volt > wechsel.volt)

  assert.equal(formeln.spannungsfall({ laenge: 30, strom: 16, querschnitt: 0 }), null)
})

test('Mindestquerschnitt passt zum Spannungsfall', () => {
  const a = formeln.mindestQuerschnitt({ laenge: 30, strom: 16, erlaubterFall: 6.86 })
  // Rueckwaerts gerechnet kommt wieder etwa 2,5 mm² heraus
  assert.equal(rechnung.gerundet(a, 1), 2.5)
})

test('die fuenf Sicherheitsregeln stehen in der richtigen Reihenfolge', () => {
  assert.equal(formeln.SICHERHEITSREGELN.length, 5)
  assert.equal(formeln.SICHERHEITSREGELN[0], 'Freischalten')
  assert.equal(formeln.SICHERHEITSREGELN[2], 'Spannungsfreiheit feststellen')
  assert.ok(formeln.FORMELN.length >= 7)
})

// ===== Speicher =====

test('Faecher, Noten und Schnitte werden gespeichert', () => {
  globalThis.localStorage.removeItem(KEYS.electroSchule)
  schule._cacheLeeren()

  assert.ok(schule.faecher().length >= 8, 'Startbestand an Faechern')
  const fach = schule.faecher()[0]

  schule.noteHinzufuegen({ fachId: fach.id, note: '5', thema: 'Ohm', datum: '2026-05-01' })
  schule.noteHinzufuegen({ fachId: fach.id, note: '4', gewicht: 2, datum: '2026-06-01' })
  assert.equal(schule.notenFuerFach(fach.id).length, 2)
  // (5·1 + 4·2) / 3 = 4,33
  assert.equal(rechnung.gerundet(schule.schnittFuerFach(fach.id), 2), 4.33)

  // Ohne Note passiert nichts
  assert.equal(schule.noteHinzufuegen({ fachId: fach.id, note: '' }), null)

  // Neu laden: alles ist noch da
  schule._cacheLeeren()
  assert.equal(schule.notenFuerFach(fach.id).length, 2)
})

test('Noten lassen sich entfernen, Faecher hinzufuegen', () => {
  globalThis.localStorage.removeItem(KEYS.electroSchule)
  schule._cacheLeeren()

  const neu = schule.fachHinzufuegen({ name: 'Englisch', lehrer: 'Frau B.', zielnote: 5 })
  assert.ok(neu && neu.id)
  assert.ok(schule.faecher().some((f) => f.name === 'Englisch'))
  assert.equal(schule.fachHinzufuegen({ name: '   ' }), null, 'leerer Name wird abgelehnt')

  const note = schule.noteHinzufuegen({ fachId: neu.id, note: 5.5 })
  schule.noteEntfernen(note.id)
  assert.equal(schule.notenFuerFach(neu.id).length, 0)
})

test('die naechste Pruefung ist die naechste offene', () => {
  globalThis.localStorage.removeItem(KEYS.electroSchule)
  schule._cacheLeeren()

  schule.pruefungHinzufuegen({ titel: 'Weit weg', datum: '2026-12-01' })
  schule.pruefungHinzufuegen({ titel: 'Bald', datum: '2026-08-10' })
  schule.pruefungHinzufuegen({ titel: 'Vorbei', datum: '2026-01-01' })
  const erledigt = schule.pruefungHinzufuegen({ titel: 'Schon geschrieben', datum: '2026-08-07' })
  schule.pruefungAendern(erledigt.id, { status: 'Erledigt' })

  const naechste = schule.naechstePruefung('2026-08-05')
  assert.equal(naechste.pruefung.titel, 'Bald')
  assert.equal(naechste.tage, 5)
  assert.equal(schule.pruefungHinzufuegen({ titel: '' }), null)
})

test('das Berichtsheft zaehlt offene Wochen — neueste oben', () => {
  globalThis.localStorage.removeItem(KEYS.electroSchule)
  schule._cacheLeeren()

  schule.wocheHinzufuegen({ woche: 'KW 30', taetigkeiten: 'Rohre gelegt' })
  const zweite = schule.wocheHinzufuegen({ woche: 'KW 31', taetigkeiten: 'Dosen gesetzt' })
  assert.equal(schule.berichtsheft()[0].woche, 'KW 31', 'neueste Woche steht oben')
  assert.equal(schule.offeneWochen(), 2)

  schule.wocheAendern(zweite.id, { status: 'Abgegeben' })
  assert.equal(schule.offeneWochen(), 1)

  schule.wocheEntfernen(zweite.id)
  assert.equal(schule.berichtsheft().length, 1)
})

test('ein kaputter Speicherstand wirft die App nicht um', () => {
  globalThis.localStorage.setItem(KEYS.electroSchule, '{kaputt')
  schule._cacheLeeren()
  assert.ok(Array.isArray(schule.noten()))
  assert.ok(schule.faecher().length >= 8)
})

test('der Schul-Schluessel wandert in die Sicherung', async () => {
  const { exportiereSpeicherstand } = await import('../src/core/storage.ts')
  globalThis.localStorage.removeItem(KEYS.electroSchule)
  schule._cacheLeeren()
  schule.fachHinzufuegen({ name: 'Prüffach' })
  const sicherung = exportiereSpeicherstand()
  assert.ok('electroSchule' in sicherung, 'Elektro-Schuldaten fehlen im Export')
  assert.ok(
    sicherung.electroSchule.faecher.some((f) => f.name === 'Prüffach'),
    'die Faecher stehen wirklich in der Sicherung'
  )
})
