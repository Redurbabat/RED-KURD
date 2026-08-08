// Tests fuer das Pruefen, Beschreiben und Einspielen von Sicherungsdateien.
//
// Die wichtigste Zusage steht ganz unten: eine fremde oder kaputte Datei darf
// NICHTS schreiben. Vorher lief das Einspielen mitten in der Pruefung — bei
// einem Fehler in der Mitte war der Lernstand des Geraets schon ueberschrieben
// und der aus der Datei nur halb da.
import test from 'node:test'
import assert from 'node:assert/strict'

class SpeicherAttrappe {
  constructor() {
    this.daten = new Map()
  }
  getItem(k) {
    return this.daten.has(k) ? this.daten.get(k) : null
  }
  setItem(k, v) {
    this.daten.set(k, String(v))
  }
  removeItem(k) {
    this.daten.delete(k)
  }
  abbild() {
    return Object.fromEntries([...this.daten.entries()].sort())
  }
}

globalThis.localStorage = new SpeicherAttrappe()
// Ohne `document` faellt uiStore.anwenden() sauber durch — die Tests laufen
// also ohne Browser, so wie der Rest der Testreihe.

const { pruefeSicherung, spieleSicherungEin, vorschauVomGeraet } = await import(
  '../src/core/backup/sicherung.ts'
)
const { KEYS } = await import('../src/core/storage.ts')
const { setzeFortschritt } = await import('../src/core/progress/progressStore.ts')

function frisch() {
  globalThis.localStorage = new SpeicherAttrappe()
  return globalThis.localStorage
}

/** Eine Sicherungsdatei, wie exportiereAlles() sie heute schreibt. */
function sicherung(zusatz = {}) {
  return JSON.stringify({
    version: 2,
    app: 'RED-KURD',
    exportiert: '2026-08-01T10:00:00.000Z',
    fortschritt: {
      version: 2,
      xp: 1200,
      serie: 9,
      einheiten: { begruessung: 100, familie: 80 },
      karten: {
        'Brot|nan|erkennen': { stufe: 3 },
        'Brot|nan|schreiben': { stufe: 1 },
        'Wasser|av|erkennen': { stufe: 5 },
      },
      tage: {},
      edelsteine: 44,
    },
    speicher: {
      profil: { version: 2, name: 'Evin' },
      codeFortschritt: { version: 1, xp: 90, erledigt: { a: '2026-07-01', b: '2026-07-02' } },
      electroFortschritt: { version: 1, xp: 10, erledigt: {} },
      shop: { version: 1, gekauft: ['helo-schal', 'klangpaket'], aktiv: {} },
      sprachkurse: { version: 1, kapitel: {}, letzterKurs: null },
    },
    ...zusatz,
  })
}

// ===== Pruefen =====

test('eine gueltige Sicherung wird angenommen und beschrieben', () => {
  frisch()
  const e = pruefeSicherung(sicherung())
  assert.equal(e.ok, true)
  assert.equal(e.vorschau.xp, 1200)
  assert.equal(e.vorschau.serie, 9)
  assert.equal(e.vorschau.karten, 3, 'drei Karten')
  assert.equal(e.vorschau.woerter, 2, '„Brot" zaehlt einmal, nicht zweimal')
  assert.equal(e.vorschau.einheiten, 2)
  assert.equal(e.vorschau.edelsteine, 44)
  assert.equal(e.vorschau.exportiert, '2026-08-01T10:00:00.000Z')
})

test('die Vorschau nennt die anderen Apps einzeln', () => {
  frisch()
  const e = pruefeSicherung(sicherung())
  const namen = e.vorschau.bereiche.map((b) => b.name)
  assert.ok(namen.includes('Code lernen'), namen.join(', '))
  assert.ok(namen.includes('Elektro-Lehre'), namen.join(', '))
  assert.ok(namen.includes('Shop'), namen.join(', '))
  assert.ok(namen.includes('Nebensprachkurse'), namen.join(', '))
  // AI-Sprache ist in dieser Datei nicht drin — dann darf sie auch nicht
  // auftauchen, sonst verspricht die Vorschau etwas, das nicht kommt.
  assert.ok(!namen.includes('AI-Sprache'), namen.join(', '))

  const code = e.vorschau.bereiche.find((b) => b.name === 'Code lernen')
  assert.equal(code.wert, '90 XP · 2 erledigt')
  assert.equal(e.vorschau.bereiche.find((b) => b.name === 'Shop').wert, '2 gekauft')
})

test('kaputtes JSON, fremde Apps und formlose Dateien werden abgelehnt', () => {
  frisch()
  for (const [text, teilDesGrunds] of [
    ['das ist kein json', 'JSON'],
    ['[]', 'Objekt'],
    ['"nur ein Text"', 'Objekt'],
    ['42', 'Objekt'],
    ['null', 'Objekt'],
    ['{}', 'Lernstand'],
    [JSON.stringify({ app: 'EineAndereApp', fortschritt: { xp: 1 } }), 'anderen App'],
    [JSON.stringify({ fortschritt: 'text' }), 'Lernstand'],
    [JSON.stringify({ fortschritt: [] }), 'Lernstand'],
    [JSON.stringify({ fortschritt: { irgendwas: 1 } }), 'Lernstand'],
    [JSON.stringify({ fortschritt: { xp: 1, karten: 'kaputt' } }), 'Lernstand'],
    [JSON.stringify({ fortschritt: { xp: 1 }, speicher: 'kaputt' }), 'speicher'],
    [JSON.stringify({ fortschritt: { xp: 1 }, speicher: [] }), 'speicher'],
  ]) {
    const e = pruefeSicherung(text)
    assert.equal(e.ok, false, `haette abgelehnt werden muessen: ${text.slice(0, 60)}`)
    assert.ok(e.grund.includes(teilDesGrunds), `Grund passt nicht: ${e.grund}`)
  }
})

test('eine aeltere Datei ohne app-Feld wird noch angenommen', () => {
  frisch()
  const alt = JSON.stringify({
    version: 2,
    fortschritt: { xp: 10, karten: {} },
    profil: { version: 2, name: 'Alt' },
  })
  const e = pruefeSicherung(alt)
  assert.equal(e.ok, true)
  assert.equal(e.vorschau.xp, 10)
  assert.equal(e.vorschau.exportiert, null)
  assert.equal(e.datei.profil.name, 'Alt', 'das oben stehende Profil bleibt lesbar')
})

test('Felder mit falscher Art werden verworfen statt eingespielt', () => {
  frisch()
  const e = pruefeSicherung(
    JSON.stringify({
      fortschritt: { xp: 5, karten: {} },
      profil: { name: 42, tagesziel: 'viel', variante: 'kurmanci-botan', erstellt: null },
      ui: { mode: 'unbekannt', theme: 'auto', soundEnabled: 'ja' },
      shop: { gekauft: ['echt', 7, null], aktiv: { thema: 'x', klang: null, kaputt: 9 } },
    })
  )
  assert.equal(e.ok, true)
  // Behalten wird nur, was die richtige Art hat.
  assert.deepEqual(e.datei.profil, { variante: 'kurmanci-botan' })
  assert.deepEqual(e.datei.ui, { theme: 'auto' })
  assert.deepEqual(e.datei.shop, { gekauft: ['echt'], aktiv: { thema: 'x', klang: null } })
})

test('pruefeSicherung schreibt nichts', () => {
  const speicher = frisch()
  speicher.setItem(KEYS.fortschritt, JSON.stringify({ version: 2, xp: 7 }))
  const vorher = speicher.abbild()
  pruefeSicherung(sicherung())
  pruefeSicherung('kaputt{')
  pruefeSicherung('{}')
  assert.deepEqual(speicher.abbild(), vorher, 'die Pruefung hat geschrieben')
})

// ===== Die entscheidende Zusage =====

test('eine abgelehnte Datei laesst den vorhandenen Lernstand unangetastet', () => {
  const speicher = frisch()
  setzeFortschritt({ version: 2, xp: 5000, serie: 30, karten: {}, einheiten: {} })
  speicher.setItem(KEYS.codeFortschritt, JSON.stringify({ version: 1, xp: 500 }))
  const vorher = speicher.abbild()

  for (const kaputt of [
    'kaputt{',
    '{}',
    JSON.stringify({ app: 'Fremd', fortschritt: { xp: 1 } }),
    JSON.stringify({ fortschritt: { xp: 1 }, speicher: 'kaputt' }),
  ]) {
    const e = pruefeSicherung(kaputt)
    assert.equal(e.ok, false)
    // Und weil `spieleSicherungEin()` nur ein geprueftes Ergebnis annimmt,
    // gibt es gar keinen Weg, so etwas einzuspielen.
    assert.deepEqual(speicher.abbild(), vorher, `„${kaputt.slice(0, 30)}" hat geschrieben`)
  }
})

test('eine gueltige Sicherung wird vollstaendig eingespielt', () => {
  const speicher = frisch()
  setzeFortschritt({ version: 2, xp: 5, serie: 1, karten: {}, einheiten: {} })

  const e = pruefeSicherung(sicherung())
  assert.equal(e.ok, true)
  const ergebnis = spieleSicherungEin(e.datei)

  assert.ok(ergebnis.geschrieben.includes('fortschritt'))
  const stand = JSON.parse(speicher.getItem(KEYS.fortschritt))
  assert.equal(stand.xp, 1200)
  assert.equal(stand.serie, 9)
  // Auch die anderen Apps muessen ankommen — sonst waere der Geraetewechsel
  // fuer sie ein Datenverlust.
  assert.equal(JSON.parse(speicher.getItem(KEYS.codeFortschritt)).xp, 90)
  assert.equal(JSON.parse(speicher.getItem(KEYS.electroFortschritt)).xp, 10)
  assert.equal(JSON.parse(speicher.getItem(KEYS.profil)).name, 'Evin')
  assert.deepEqual(JSON.parse(speicher.getItem(KEYS.shop)).gekauft, ['helo-schal', 'klangpaket'])
})

test('die laufende Sitzung wandert nicht mit — auch nicht aus einer alten Datei', () => {
  const speicher = frisch()
  const mitSitzung = JSON.parse(sicherung())
  mitSitzung.speicher.sitzung = { titel: 'fremd', index: 2, punkte: 0, uebungen: [{}] }
  const e = pruefeSicherung(JSON.stringify(mitSitzung))
  assert.equal(e.ok, true)
  spieleSicherungEin(e.datei)
  assert.equal(
    speicher.getItem(KEYS.sitzung),
    null,
    'eine halbfertige Uebungsrunde eines fremden Geraets wurde wiederbelebt'
  )
})

test('„ohne Konto lernen" bleibt eine Entscheidung dieses Geraets', () => {
  const speicher = frisch()
  speicher.setItem(KEYS.ohneKonto, JSON.stringify(true))
  const mitKonto = JSON.parse(sicherung())
  mitKonto.speicher.ohneKonto = false
  const e = pruefeSicherung(JSON.stringify(mitKonto))
  spieleSicherungEin(e.datei)
  assert.equal(speicher.getItem(KEYS.ohneKonto), JSON.stringify(true))
})

test('fremde Speicherschluessel bleiben unberuehrt', () => {
  const speicher = frisch()
  speicher.setItem('eine-andere-app', '{"wichtig":true}')
  const e = pruefeSicherung(sicherung())
  spieleSicherungEin(e.datei)
  assert.equal(speicher.getItem('eine-andere-app'), '{"wichtig":true}')
})

// ===== Vorschau vom Geraet =====

test('vorschauVomGeraet zaehlt nach denselben Regeln wie die Dateivorschau', () => {
  const speicher = frisch()
  const e = pruefeSicherung(sicherung())
  spieleSicherungEin(e.datei)

  const jetzt = vorschauVomGeraet()
  assert.equal(jetzt.xp, e.vorschau.xp)
  assert.equal(jetzt.serie, e.vorschau.serie)
  assert.equal(jetzt.karten, e.vorschau.karten)
  assert.equal(jetzt.woerter, e.vorschau.woerter)
  assert.equal(jetzt.einheiten, e.vorschau.einheiten)
  assert.equal(jetzt.edelsteine, e.vorschau.edelsteine)
  assert.ok(speicher)
})

test('vorschauVomGeraet kommt auch mit einem leeren Geraet zurecht', () => {
  frisch()
  const v = vorschauVomGeraet()
  assert.equal(v.xp, 0)
  assert.equal(v.karten, 0)
  assert.equal(v.woerter, 0)
  assert.deepEqual(v.bereiche, [])
})
