import test from 'node:test'
import assert from 'node:assert/strict'

// storage.js ist der datenverlust-kritischste Code der App: geht hier etwas
// schief, ist der Lernstand des Nutzers weg — er liegt nur im Browser.
// Die Tests laufen ohne DOM, deshalb bekommt globalThis eine localStorage-
// Attrappe VOR dem Import, und das Modul wird dynamisch geladen. Weil
// migriere() ein Modulflag hat (laeuft nur einmal), holt jeder Test sich ueber
// einen Cache-Buster eine frische Modulkopie — das entspricht einem Neustart
// der App im Browser.

class TestSpeicher {
  /** @param {Record<string, string>} anfang Rohwerte, wie sie im Browser laegen. */
  constructor(anfang = {}) {
    this.daten = new Map(Object.entries(anfang))
    this.lesefehler = false
    this.schreibfehler = false
  }

  get length() {
    return this.daten.size
  }

  getItem(key) {
    if (this.lesefehler) throw new Error('Privater Modus: Lesen nicht erlaubt')
    return this.daten.has(key) ? this.daten.get(key) : null
  }

  setItem(key, wert) {
    if (this.schreibfehler) throw new Error('QuotaExceededError: Speicher voll')
    this.daten.set(key, String(wert))
  }

  removeItem(key) {
    if (this.schreibfehler) throw new Error('QuotaExceededError: Speicher voll')
    this.daten.delete(key)
  }
}

/** Attrappe global setzen; `undefined` bedeutet: es gibt gar keinen localStorage. */
function setzeSpeicher(wert) {
  delete globalThis.localStorage
  if (wert !== undefined) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: wert,
      writable: true,
      configurable: true,
    })
  }
}

let ladeZaehler = 0

/** Modul frisch laden — wie ein Neustart der App auf demselben Geraet. */
async function neuStarten(speicher) {
  setzeSpeicher(speicher)
  ladeZaehler += 1
  return import(`../src/core/storage.js?frisch=${ladeZaehler}`)
}

/** Frischer Speicher + frisches Modul. */
async function frischesModul(anfang = {}) {
  const speicher = new TestSpeicher(anfang)
  const modul = await neuStarten(speicher)
  return { speicher, modul }
}

const ALT_SCHLUESSEL = {
  fortschritt: 'red-kurd-fortschritt-v1',
  profil: 'red-kurd-profil-v1',
  sitzung: 'red-kurd-session-v1',
  modus: 'red-kurd-modus',
}

const SKILLS = ['erkennen', 'abrufen', 'schreiben', 'hoeren']

// ===== 1. migriereKarten =====

test('migriereKarten benennt alte Kartenschlüssel über alle Skill-Suffixe um und behält Stufe und Fälligkeit', async () => {
  const { modul } = await frischesModul()
  const karten = {}
  SKILLS.forEach((skill, i) => {
    karten[`Pilz|kundir|${skill}`] = { stufe: i + 1, faellig: `2026-08-0${i + 1}`, fehler: i }
  })
  karten['Möchtest du Tee?|Tu çay dixwazî?|erkennen'] = { stufe: 6, faellig: '2026-09-01' }

  const { karten: neu, geaendert } = modul.migriereKarten(karten)

  assert.equal(geaendert, 5)
  assert.deepEqual(Object.keys(neu).sort(), [
    'Möchtest du Tee?|Tu çayê dixwazî?|erkennen',
    ...SKILLS.map((skill) => `Pilz|kivark|${skill}`),
  ].sort())
  // Stufe und Fälligkeit müssen den Umzug unverändert überstehen.
  SKILLS.forEach((skill, i) => {
    assert.deepEqual(neu[`Pilz|kivark|${skill}`], {
      stufe: i + 1,
      faellig: `2026-08-0${i + 1}`,
      fehler: i,
    })
  })
  assert.deepEqual(neu['Möchtest du Tee?|Tu çayê dixwazî?|erkennen'], {
    stufe: 6,
    faellig: '2026-09-01',
  })
  // Keine alte Schreibweise darf zurückbleiben.
  assert.equal(Object.keys(neu).some((k) => k.includes('kundir')), false)
})

test('migriereKarten lässt nicht betroffene Karten unverändert', async () => {
  const { modul } = await frischesModul()
  const karten = {
    'Wasser|av|erkennen': { stufe: 3, faellig: '2026-08-02' },
    'Brot|nan|hoeren': { stufe: 0, faellig: null },
    'Pilzsuppe|şorbeya kundiran|erkennen': { stufe: 2 },
    ohneTrenner: { stufe: 1 },
  }
  const original = structuredClone(karten)

  const { karten: neu, geaendert } = modul.migriereKarten(karten)

  assert.equal(geaendert, 0)
  assert.deepEqual(neu, original)
  // Die Eingabe selbst wird nicht verändert.
  assert.deepEqual(karten, original)
})

test('migriereKarten lässt bei Kollision die weiter fortgeschrittene Stufe gewinnen — in beiden Reihenfolgen', async () => {
  const { modul } = await frischesModul()
  const weit = { stufe: 5, faellig: '2026-12-01' }
  const anfang = { stufe: 1, faellig: '2026-08-08' }

  // a) alte Schreibweise zuerst gespeichert
  const altZuerst = modul.migriereKarten({
    'Pilz|kundir|erkennen': weit,
    'Pilz|kivark|erkennen': anfang,
  })
  assert.deepEqual(altZuerst.karten, { 'Pilz|kivark|erkennen': weit })

  // b) neue Schreibweise zuerst gespeichert — dieselbe Regel muss gelten
  const neuZuerst = modul.migriereKarten({
    'Pilz|kivark|erkennen': anfang,
    'Pilz|kundir|erkennen': weit,
  })
  assert.deepEqual(neuZuerst.karten, { 'Pilz|kivark|erkennen': weit })

  // c) umgekehrt: ist die neue Karte weiter, bleibt sie stehen
  const neuGewinnt = modul.migriereKarten({
    'Pilz|kundir|abrufen': anfang,
    'Pilz|kivark|abrufen': weit,
  })
  assert.deepEqual(neuGewinnt.karten, { 'Pilz|kivark|abrufen': weit })
})

test('migriereKarten antwortet robust auf null, undefined und kaputte Eingaben', async () => {
  const { modul } = await frischesModul()

  assert.deepEqual(modul.migriereKarten(null), { karten: null, geaendert: 0 })
  assert.deepEqual(modul.migriereKarten(undefined), { karten: undefined, geaendert: 0 })
  assert.deepEqual(modul.migriereKarten('kaputt'), { karten: 'kaputt', geaendert: 0 })
  assert.deepEqual(modul.migriereKarten(42), { karten: 42, geaendert: 0 })

  // Kaputte Kartenwerte dürfen die Migration nicht zum Absturz bringen.
  const kaputt = modul.migriereKarten({
    'Pilz|kivark|erkennen': { stufe: 2 },
    'Pilz|kundir|erkennen': null,
    'Pilz|kundir|hoeren': { stufe: 'keine Zahl' },
    'Wasser|av|erkennen': undefined,
  })
  assert.equal(kaputt.geaendert, 2)
  assert.deepEqual(kaputt.karten['Pilz|kivark|erkennen'], { stufe: 2 })
  assert.deepEqual(kaputt.karten['Pilz|kivark|hoeren'], { stufe: 'keine Zahl' })
})

test('migriereKarten ist idempotent: der zweite Durchlauf ändert nichts mehr', async () => {
  const { modul } = await frischesModul()
  const karten = {
    'Pilz|kundir|erkennen': { stufe: 4, faellig: '2026-08-20' },
    'Pilz|kundir|hoeren': { stufe: 1, faellig: '2026-08-09' },
    'Wasser|av|abrufen': { stufe: 2, faellig: '2026-08-11' },
  }

  const erste = modul.migriereKarten(karten)
  assert.equal(erste.geaendert, 2)

  const zweite = modul.migriereKarten(erste.karten)
  assert.equal(zweite.geaendert, 0)
  assert.deepEqual(zweite.karten, erste.karten)
})

// ===== 2. migriere() =====

test('migriere hebt Fortschritt, Profil und Sitzung von v1 auf v2', async () => {
  const altFortschritt = {
    xp: 320,
    serie: 4,
    letzterTag: '2026-07-30',
    lektionen: { begruessung: true },
    karten: { 'Wasser|av|erkennen': { stufe: 3, faellig: '2026-08-01' } },
    tage: { '2026-07-30': 20 },
    edelsteine: 12,
    zielBelohnt: '2026-07-30',
    truhe: { offen: false },
  }
  const altProfil = {
    name: 'Alan',
    kenntnis: 'fortgeschritten',
    ziel: 'reise',
    minuten: '20',
    erstellt: '2026-01-05T10:00:00.000Z',
  }
  const altSitzung = { uebungen: [{ id: 'a1' }, { id: 'a2' }], index: 1 }

  const { modul } = await frischesModul({
    [ALT_SCHLUESSEL.fortschritt]: JSON.stringify(altFortschritt),
    [ALT_SCHLUESSEL.profil]: JSON.stringify(altProfil),
    [ALT_SCHLUESSEL.sitzung]: JSON.stringify(altSitzung),
    [ALT_SCHLUESSEL.modus]: 'klassik',
  })

  modul.migriere()

  assert.deepEqual(modul.lies(modul.KEYS.fortschritt), {
    version: 2,
    xp: 320,
    serie: 4,
    letzterTag: '2026-07-30',
    einheiten: { begruessung: true },
    karten: { 'Wasser|av|erkennen': { stufe: 3, faellig: '2026-08-01' } },
    tage: { '2026-07-30': 20 },
    edelsteine: 12,
    schluessel: 0,
    zielBelohnt: '2026-07-30',
    truhe: { offen: false },
    lernzeit: 0,
  })
  assert.deepEqual(modul.lies(modul.KEYS.profil), {
    version: 2,
    name: 'Alan',
    kenntnis: 'fortgeschritten',
    ziel: 'reise',
    minuten: '20',
    tagesziel: 30,
    variante: 'kurmanci-standard',
    erstellt: '2026-01-05T10:00:00.000Z',
  })
  assert.deepEqual(modul.lies(modul.KEYS.sitzung), altSitzung)
  // Der alte Modus "klassik" wird zum dunklen Erscheinungsbild.
  assert.equal(modul.lies(modul.KEYS.ui).theme, 'dark')
  assert.equal(modul.lies(modul.KEYS.ui).mode, 'modern')
})

test('migriere rechnet das Tagesziel aus der alten Minutenwahl und setzt sonst das helle Erscheinungsbild', async () => {
  for (const [minuten, tagesziel] of [['5', 10], ['10', 20], ['20', 30], ['30', 30]]) {
    const { modul } = await frischesModul({
      [ALT_SCHLUESSEL.profil]: JSON.stringify({ name: 'Test', minuten }),
    })
    modul.migriere()
    assert.equal(modul.lies(modul.KEYS.profil).tagesziel, tagesziel, `Minuten ${minuten}`)
    // Ohne alten Modus bleibt es hell.
    assert.equal(modul.lies(modul.KEYS.ui).theme, 'light')
  }
})

test('migriere übernimmt eine v1-Sitzung nur, wenn sie Übungen enthält', async () => {
  const { modul } = await frischesModul({
    [ALT_SCHLUESSEL.sitzung]: JSON.stringify({ index: 3 }),
  })
  modul.migriere()
  assert.equal(modul.lies(modul.KEYS.sitzung), null)
})

test('migriere löscht niemals die alten v1-Schlüssel (ADR-005: kopieren, nie löschen)', async () => {
  const roh = {
    [ALT_SCHLUESSEL.fortschritt]: JSON.stringify({ xp: 99, karten: {} }),
    [ALT_SCHLUESSEL.profil]: JSON.stringify({ name: 'Rojda', minuten: '10' }),
    [ALT_SCHLUESSEL.sitzung]: JSON.stringify({ uebungen: [{ id: 'x' }] }),
    [ALT_SCHLUESSEL.modus]: 'modern',
  }
  const { speicher, modul } = await frischesModul(roh)

  modul.migriere()

  for (const [key, wert] of Object.entries(roh)) {
    assert.equal(speicher.daten.get(key), wert, `${key} muss unverändert liegen bleiben`)
  }
})

test('migriere überschreibt vorhandene v2-Daten nicht', async () => {
  const v2Fortschritt = { version: 2, xp: 5000, karten: { 'Wasser|av|erkennen': { stufe: 4 } } }
  const v2Profil = { version: 2, name: 'Neu', tagesziel: 20 }
  const v2Sitzung = { uebungen: [{ id: 'neu' }] }
  const v2Ui = { version: 1, mode: 'redlingo', theme: 'dark' }

  const { modul } = await frischesModul({
    'red-kurd-progress-v2': JSON.stringify(v2Fortschritt),
    'red-kurd-profile-v2': JSON.stringify(v2Profil),
    'red-kurd-session-v2': JSON.stringify(v2Sitzung),
    'red-kurd-ui-v1': JSON.stringify(v2Ui),
    [ALT_SCHLUESSEL.fortschritt]: JSON.stringify({ xp: 1, karten: {} }),
    [ALT_SCHLUESSEL.profil]: JSON.stringify({ name: 'Alt', minuten: '5' }),
    [ALT_SCHLUESSEL.sitzung]: JSON.stringify({ uebungen: [{ id: 'alt' }] }),
    [ALT_SCHLUESSEL.modus]: 'klassik',
  })

  modul.migriere()

  assert.deepEqual(modul.lies(modul.KEYS.fortschritt), v2Fortschritt)
  assert.deepEqual(modul.lies(modul.KEYS.profil), v2Profil)
  assert.deepEqual(modul.lies(modul.KEYS.sitzung), v2Sitzung)
  assert.deepEqual(modul.lies(modul.KEYS.ui), v2Ui)
})

test('migriere läuft nur einmal pro Prozess', async () => {
  const { speicher, modul } = await frischesModul({
    [ALT_SCHLUESSEL.fortschritt]: JSON.stringify({ xp: 42, karten: {} }),
  })

  modul.migriere()
  assert.equal(modul.lies(modul.KEYS.fortschritt).xp, 42)

  // Zweiter Aufruf im selben Prozess: das Modulflag verhindert jede Arbeit.
  speicher.daten.delete(modul.KEYS.fortschritt)
  speicher.daten.delete(modul.KEYS.ui)
  modul.migriere()
  assert.equal(modul.lies(modul.KEYS.fortschritt), null)
  assert.equal(modul.lies(modul.KEYS.ui), null)

  // Erst ein Neustart (frisches Modul) migriert wieder.
  const neu = await neuStarten(speicher)
  neu.migriere()
  assert.equal(neu.lies(neu.KEYS.fortschritt).xp, 42)
})

test('migriere hebt Karten aus einem v1-Bestand spätestens beim nächsten Start auf die neue Schreibweise', async () => {
  const { speicher, modul } = await frischesModul({
    [ALT_SCHLUESSEL.fortschritt]: JSON.stringify({
      xp: 10,
      karten: { 'Pilz|kundir|erkennen': { stufe: 4, faellig: '2026-08-09' } },
    }),
  })

  modul.migriere()
  const zweiterStart = await neuStarten(speicher)
  zweiterStart.migriere()

  const karten = zweiterStart.lies(zweiterStart.KEYS.fortschritt).karten
  assert.deepEqual(karten, { 'Pilz|kivark|erkennen': { stufe: 4, faellig: '2026-08-09' } })
})

// ===== 3. Export / Import =====

test('exportiereSpeicherstand und importiereSpeicherstand bilden einen vollständigen Roundtrip', async () => {
  const { modul } = await frischesModul()
  for (const [name, key] of Object.entries(modul.KEYS)) {
    modul.schreibe(key, { probe: name, tief: { wert: 1 } })
  }

  const sicherung = modul.exportiereSpeicherstand()
  const erwartet = Object.keys(modul.KEYS).filter((name) => name !== 'ohneKonto')
  assert.deepEqual(Object.keys(sicherung).sort(), erwartet.sort())

  // Auf einem leeren Gerät einspielen.
  const zweites = await frischesModul()
  const anzahl = zweites.modul.importiereSpeicherstand(sicherung)
  assert.equal(anzahl, erwartet.length)
  for (const name of erwartet) {
    assert.deepEqual(zweites.modul.lies(zweites.modul.KEYS[name]), sicherung[name])
  }
  assert.equal(zweites.speicher.daten.size, erwartet.length)
})

test('die geräte-lokale Entscheidung „ohne Konto lernen" wandert weder in den Export noch in den Import', async () => {
  const { speicher, modul } = await frischesModul()
  modul.schreibe(modul.KEYS.ohneKonto, true)
  modul.schreibe(modul.KEYS.profil, { name: 'Rojda' })

  const sicherung = modul.exportiereSpeicherstand()
  assert.equal('ohneKonto' in sicherung, false)
  assert.deepEqual(sicherung, { profil: { name: 'Rojda' } })
  // Der lokale Wert bleibt aber auf dem Gerät stehen.
  assert.equal(speicher.daten.get(modul.KEYS.ohneKonto), 'true')

  const zweites = await frischesModul()
  const anzahl = zweites.modul.importiereSpeicherstand({ ohneKonto: true, profil: { name: 'Rojda' } })
  assert.equal(anzahl, 1)
  assert.equal(zweites.speicher.daten.has(zweites.modul.KEYS.ohneKonto), false)
  assert.equal(zweites.modul.lies(zweites.modul.KEYS.ohneKonto), null)
})

test('importiereSpeicherstand ignoriert unbekannte Schlüssel und zählt nur geschriebene Bereiche', async () => {
  const { speicher, modul } = await frischesModul()

  const anzahl = modul.importiereSpeicherstand({
    profil: { name: 'Alan' },
    fortschritt: { version: 2, xp: 7 },
    unbekannt: { boese: true },
    'red-kurd-progress-v2': 'roh',
    __proto__: { verseucht: true },
  })

  assert.equal(anzahl, 2)
  assert.equal(speicher.daten.size, 2)
  assert.deepEqual([...speicher.daten.keys()].sort(), [modul.KEYS.fortschritt, modul.KEYS.profil].sort())
  assert.equal(({}).verseucht, undefined)
})

test('importiereSpeicherstand antwortet auf kaputte Sicherungen mit 0', async () => {
  const { speicher, modul } = await frischesModul()

  for (const kaputt of [null, undefined, 'text', 42, [], [{ profil: {} }]]) {
    assert.equal(modul.importiereSpeicherstand(kaputt), 0)
  }
  assert.equal(speicher.daten.size, 0)

  // Ist der Speicher voll, wird nichts geschrieben — und nichts gezählt.
  speicher.schreibfehler = true
  assert.equal(modul.importiereSpeicherstand({ profil: { name: 'Alan' } }), 0)
  assert.equal(speicher.daten.size, 0)
})

// ===== 4. lies / schreibe / entferne =====

test('lies liefert bei kaputtem JSON den Ersatzwert, statt zu werfen', async () => {
  const { modul } = await frischesModul({
    'red-kurd-progress-v2': '{"xp": 12,',
    'red-kurd-profile-v2': 'undefined',
  })

  assert.deepEqual(modul.lies(modul.KEYS.fortschritt, { xp: 0 }), { xp: 0 })
  assert.equal(modul.lies(modul.KEYS.fortschritt), null)
  assert.equal(modul.lies(modul.KEYS.profil, 'ersatz'), 'ersatz')
  // Fehlender Schlüssel: ebenfalls der Ersatzwert.
  assert.equal(modul.lies('gibt-es-nicht', 'ersatz'), 'ersatz')
  assert.equal(modul.lies('gibt-es-nicht'), null)
})

test('schreibe, lies und entferne arbeiten zusammen', async () => {
  const { speicher, modul } = await frischesModul()
  const wert = { version: 2, karten: { 'Wasser|av|erkennen': { stufe: 2 } }, tage: {} }

  assert.equal(modul.schreibe(modul.KEYS.fortschritt, wert), true)
  assert.equal(speicher.daten.get(modul.KEYS.fortschritt), JSON.stringify(wert))
  assert.deepEqual(modul.lies(modul.KEYS.fortschritt), wert)

  modul.entferne(modul.KEYS.fortschritt)
  assert.equal(speicher.daten.has(modul.KEYS.fortschritt), false)
  assert.deepEqual(modul.lies(modul.KEYS.fortschritt, { leer: true }), { leer: true })
})

test('ohne localStorage arbeiten lies, schreibe, entferne und migriere ohne Fehler', async () => {
  const modul = await neuStarten(undefined)

  assert.equal(modul.lies(modul.KEYS.profil, 'ersatz'), 'ersatz')
  assert.equal(modul.schreibe(modul.KEYS.profil, { name: 'Alan' }), false)
  assert.doesNotThrow(() => modul.entferne(modul.KEYS.profil))
  assert.doesNotThrow(() => modul.migriere())
  assert.deepEqual(modul.exportiereSpeicherstand(), {})
  assert.equal(modul.importiereSpeicherstand({ profil: { name: 'Alan' } }), 0)
})

test('wirft der Speicher bei jedem Zugriff (privater Modus), läuft die App trotzdem weiter', async () => {
  const speicher = new TestSpeicher()
  speicher.lesefehler = true
  speicher.schreibfehler = true
  const modul = await neuStarten(speicher)

  assert.equal(modul.lies(modul.KEYS.fortschritt, { xp: 0 }).xp, 0)
  assert.equal(modul.schreibe(modul.KEYS.fortschritt, { xp: 1 }), false)
  assert.doesNotThrow(() => modul.entferne(modul.KEYS.fortschritt))
  assert.doesNotThrow(() => modul.migriere())
  assert.deepEqual(modul.exportiereSpeicherstand(), {})
  assert.equal(modul.importiereSpeicherstand({ profil: { name: 'Alan' } }), 0)
  assert.equal(speicher.daten.size, 0)
})

test('wirft schon der Zugriff auf localStorage selbst, wird auch das abgefangen', async () => {
  delete globalThis.localStorage
  Object.defineProperty(globalThis, 'localStorage', {
    get() {
      throw new Error('Zugriff auf Speicher verweigert')
    },
    configurable: true,
  })
  ladeZaehler += 1
  const modul = await import(`../src/core/storage.js?frisch=${ladeZaehler}`)

  assert.equal(modul.lies(modul.KEYS.profil, 'ersatz'), 'ersatz')
  assert.equal(modul.schreibe(modul.KEYS.profil, { name: 'Alan' }), false)
  assert.doesNotThrow(() => modul.entferne(modul.KEYS.profil))
  assert.doesNotThrow(() => modul.migriere())

  setzeSpeicher(undefined)
})
