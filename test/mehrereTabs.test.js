// Zwei Tabs auf demselben Geraet.
//
// Jeder Store haelt seine Daten in einem Modul-Cache. Schreibt ein zweiter Tab
// in den localStorage, muss dieser Tab seinen Cache verwerfen — sonst arbeitet
// er mit veralteten Daten weiter und ueberschreibt beim naechsten Speichern,
// was der andere geschrieben hat.
//
// Der gefaehrlichste Fall ist `localStorage.clear()`: dort ist `e.key === null`.
// Genau der fiel frueher durch die Pruefung `if (!e.key) return` — mit der
// Folge, dass dieser Tab den geloeschten Lernstand vollstaendig zurueckschrieb.
// Der Nutzer loescht seine Daten, und sie kommen wieder.
//
// AUFBAU: Dieser Tab ist das Programm selbst — EIN Satz Modulinstanzen, so wie
// im Browser. Der zweite Tab wird nachgestellt, indem der geteilte Speicher
// direkt veraendert und danach das Ereignis ausgeloest wird, das der Browser
// dabei schickt. (Ein zweiter Modulsatz per Query-Parameter waere falsch: die
// Stores importieren `store.ts` ohne Parameter und bekaemen dann eine dritte,
// unbeteiligte Instanz — mein erster Anlauf ist genau daran gescheitert.)
import test from 'node:test'
import assert from 'node:assert/strict'

class Speicher {
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
  clear() {
    this.daten.clear()
  }
}

class Fenster {
  constructor() {
    this.hoerer = []
  }
  addEventListener(art, fn) {
    if (art === 'storage') this.hoerer.push(fn)
  }
  removeEventListener(art, fn) {
    this.hoerer = this.hoerer.filter((h) => h !== fn)
  }
  /** Was der Browser meldet, wenn ein anderer Tab einen Schluessel schreibt. */
  fremdSchreiben(key) {
    this.hoerer.forEach((h) => h({ key }))
  }
  /** Was der Browser meldet, wenn ein anderer Tab localStorage.clear() ruft. */
  fremdesClear() {
    this.hoerer.forEach((h) => h({ key: null }))
  }
}

// Beides MUSS vor dem ersten Import stehen: die Stores melden sich beim Laden an.
const speicher = new Speicher()
const fenster = new Fenster()
globalThis.localStorage = speicher
globalThis.window = fenster

const store = await import('../src/core/store.ts')
const { KEYS } = await import('../src/core/storage.ts')
const progress = await import('../src/core/progress/progressStore.ts')
const profil = await import('../src/core/profile/profileStore.ts')

/** Vor jedem Test: leerer Speicher und leere Caches. */
function frisch() {
  speicher.clear()
  fenster.fremdesClear()
}

test('ein fremdes clear() meldet JEDEN bekannten Schluessel', () => {
  frisch()
  const gemeldet = []
  const ab = store.beiFremdaenderung((key) => gemeldet.push(key))

  fenster.fremdesClear()

  // Jeder Schluessel muss dabei sein — sonst kann ein Store, der nur auf seinen
  // eigenen prueft, seinen Cache nicht verwerfen. Genau darauf beruht die
  // Behebung: nicht die Rueckruf-Form weiten (dann muesste jeder einzelne Store
  // den null-Fall mitbedenken und einer wuerde es vergessen), sondern jeden
  // bekannten Schluessel melden.
  assert.deepEqual([...new Set(gemeldet)].sort(), Object.values(KEYS).sort())
  ab()
})

test('nach einem fremden clear() kann dieser Tab den Lernstand nicht zurueckschreiben', () => {
  frisch()
  // Dieser Tab hat gelernt; der Stand liegt im Modul-Cache.
  progress.setzeFortschritt({ version: 2, xp: 500, serie: 12, karten: {}, einheiten: {} })
  assert.equal(progress.holeFortschritt().xp, 500)

  // Der andere Tab loescht alles — Devtools oder „Websitedaten loeschen".
  speicher.clear()
  fenster.fremdesClear()

  // Dieser Tab lernt weiter. OHNE die Behebung stuende hier 510: der Cache
  // haette ueberlebt und der geloeschte Stand waere vollstaendig zurueck.
  progress.gibXp(10)
  const nachher = JSON.parse(speicher.getItem(KEYS.fortschritt))
  assert.equal(nachher.xp, 10, 'der geloeschte Lernstand ist zurueckgekommen')
  // Die Serie beginnt bei 1, nicht bei 0: wer heute lernt, hat einen Lerntag.
  // Entscheidend ist, dass es NICHT die alten 12 sind.
  assert.equal(nachher.serie, 1, 'die alte Serie kam aus dem Cache zurueck')
})

test('das gilt fuer alle Stores, nicht nur den Lernstand', () => {
  frisch()
  profil.setzeProfil({ version: 2, name: 'Evin', tagesziel: 50 })
  assert.equal(profil.holeProfil().name, 'Evin')

  speicher.clear()
  fenster.fremdesClear()

  assert.equal(profil.holeProfil(), null, 'das geloeschte Profil kam aus dem Cache zurueck')
  assert.equal(profil.istEingerichtet(), false)
})

test('ein einzelner fremder Schluessel leert weiterhin nur den einen Cache', () => {
  // Die Behebung darf den bisherigen Weg nicht verbreitern: wer nur das Profil
  // schreibt, soll nicht den ganzen Lernstand neu einlesen lassen.
  frisch()
  const gemeldet = []
  const ab = store.beiFremdaenderung((key) => gemeldet.push(key))

  fenster.fremdSchreiben(KEYS.profil)
  assert.deepEqual(gemeldet, [KEYS.profil])
  ab()
})

test('Schluessel anderer Anwendungen bleiben unbeachtet', () => {
  frisch()
  const gemeldet = []
  const ab = store.beiFremdaenderung((key) => gemeldet.push(key))

  fenster.fremdSchreiben('irgendeine-andere-app')
  fenster.fremdSchreiben('')
  assert.deepEqual(gemeldet, [])
  ab()
})

test('ein clear() loest genau EINE Meldung an die Oberflaeche aus', () => {
  // Achtzehn Schluessel zu melden darf nicht achtzehn Neuzeichnungen ausloesen.
  frisch()
  let meldungen = 0
  const ab = store.abonniere(() => {
    meldungen += 1
  })

  fenster.fremdesClear()
  assert.equal(meldungen, 1, `${meldungen} Meldungen statt einer`)
  ab()
})

test('ein defekter Hoerer blockiert die anderen nicht', () => {
  frisch()
  const gesehen = []
  const ab1 = store.beiFremdaenderung(() => {
    throw new Error('kaputt')
  })
  const ab2 = store.beiFremdaenderung((key) => gesehen.push(key))

  assert.doesNotThrow(() => fenster.fremdesClear())
  assert.ok(gesehen.length > 0, 'der zweite Hoerer kam nie dran')
  ab1()
  ab2()
})

test('ohne Fenster laedt das Modul trotzdem', async () => {
  // Der Rest der Testreihe laeuft ohne `window` — dabei darf nichts stolpern.
  assert.equal(typeof store.melden, 'function')
  assert.doesNotThrow(() => store.melden())
})
