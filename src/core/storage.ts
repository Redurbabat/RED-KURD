// Zentrale Speicherung im Browser (localStorage) + Migration der alten Schluessel.
// Alle Stores lesen und schreiben ausschliesslich ueber diese Datei.

import type {
  GespeicherterStand,
  Karte,
  Kartenschluessel,
  Profil,
  Speicherstand,
  Tagesschluessel,
  UiEinstellungen,
} from '../types/lernstand'

export const KEYS = {
  profil: 'red-kurd-profile-v2',
  fortschritt: 'red-kurd-progress-v2',
  sitzung: 'red-kurd-session-v2',
  ui: 'red-kurd-ui-v1',
  shop: 'red-kurd-shop-v1',
  auszeichnungen: 'red-kurd-achievements-v1',
  aufgaben: 'red-kurd-tasks-v1',
  herzen: 'red-kurd-hearts-v1',
  sprachkurse: 'red-kurd-language-courses-v1',
  // Aktiver App-Bereich (Sprache lernen / Code lernen / AI-Sprache).
  // appBereich ist der alte Schluessel — er wird weiter beschrieben, damit
  // ein Ruecksprung auf eine aeltere App-Version nichts verliert.
  appBereich: 'red-kurd-active-app-mode-v1',
  appAktiv: 'red-kurd-active-app-v1',
  // Lernstand der neuen Bereiche — getrennt vom Sprach-Lernstand.
  codeFortschritt: 'red-kurd-code-progress-v1',
  promptingFortschritt: 'red-kurd-prompting-progress-v1',
  electroFortschritt: 'red-kurd-electro-progress-v1',
  // Schule und Betrieb der Elektro-Lehre: Faecher, Noten, Pruefungen,
  // Berichtsheft. Bleibt lokal, wandert aber in Sicherungen mit.
  electroSchule: 'red-kurd-electro-school-v1',
  // Werkstatt der AI-Sprache: begonnene Auftraege, Bug-Reports, PR-Haken.
  promptingWerkstatt: 'red-kurd-prompting-workshop-v1',
  fehlerbuch: 'red-kurd-fehlerbuch-v1',
  // Bewusste Entscheidung „ohne Konto lernen“ — ueberlebt das Neuladen,
  // bleibt aber geraete-lokal (siehe NUR_LOKAL) und wandert nie in Sicherungen.
  ohneKonto: 'red-kurd-ohne-konto-v1',
}

/**
 * Die Namen der Speicherbereiche — die Schlüssel von `KEYS`, nicht ihre Werte.
 * `keyof typeof KEYS` liefert sie als Literaltypen, ganz ohne Zusicherung.
 * Erst dadurch lässt sich `NUR_LOKAL` unten am selben Namensvorrat messen: ein
 * Tippfehler dort fällt beim Prüfen auf und nicht erst, wenn eine Sicherung
 * einen Bereich zu viel enthält.
 */
export type Speicherbereich = keyof typeof KEYS

// Alte Schluessel aus Version 1 — werden einmalig uebernommen, nie geloescht.
const ALT = {
  fortschritt: 'red-kurd-fortschritt-v1',
  profil: 'red-kurd-profil-v1',
  sitzung: 'red-kurd-session-v1',
  modus: 'red-kurd-modus',
}

/**
 * Prüft in einem Schritt, was der Bestand an mehreren Stellen von Hand prüfte:
 * `!wert || typeof wert !== 'object'`. Das `!wert` deckt dabei nur `null`
 * zusätzlich ab — jeder andere falsy Wert ist ohnehin kein `object`.
 *
 * Listen kommen hier bewusst durch. Wer sie ausschließen muss, prüft zusätzlich
 * mit `Array.isArray` (so wie `importiereSpeicherstand()`); `migriereKarten()`
 * und `stufeVon()` taten das noch nie, und daran ändert diese Migration nichts.
 */
function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return !!wert && typeof wert === 'object'
}

function verfuegbar(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

/**
 * `JSON.parse` liefert alles Mögliche — was auf der Platte liegt, hat niemand
 * geprüft. Statt das mit einem stillen `any` zu verdecken, benennt der Aufrufer
 * die erwartete Form: `lies<Profil>(KEYS.profil)`. Damit steht die Erwartung an
 * der Aufrufstelle, wo sie hingehört, und der Prüfer hält den Rest der
 * Rechnung daran fest. Ohne Typargument bleibt es `unknown` — auch das ist
 * ehrlich: dann interessiert nur, *ob* etwas da ist.
 *
 * Wer sich auf die Form verlässt, prüft sie selbst (siehe
 * `progressStore.istLernstand()`); dieser Typparameter ist eine Annahme, keine
 * Zusage.
 */
export function lies<T>(key: string, ersatz: T | null = null): T | null {
  if (!verfuegbar()) return ersatz
  let roh: string | null = null
  try {
    roh = localStorage.getItem(key)
    if (roh === null) return ersatz
    return JSON.parse(roh)
  } catch {
    sichereDefekt(key, roh)
    return ersatz
  }
}

/**
 * Kaputte Rohdaten nicht dem naechsten schreibe() opfern: Der erste
 * Lesefehler legt den Rohtext unter `<key>-defekt` ab. So bleibt ein evtl.
 * noch rettbarer Lernstand fuer eine Handrettung erhalten, statt still von
 * einem frischen Leerzustand ueberschrieben zu werden.
 */
function sichereDefekt(key: string, roh: string | null): void {
  if (typeof roh !== 'string' || !roh) return
  try {
    const backupKey = `${key}-defekt`
    // Ein bestehendes Backup gewinnt — es ist naeher am letzten guten Stand.
    if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, roh)
  } catch {
    /* voller Speicher — mehr ist hier nicht zu retten */
  }
}

// ===== Sichtbares Speicherversagen =====
// Scheitert das Schreiben (Speicher voll, privater Modus), zeigt die UI
// sonst Fortschritt, der beim naechsten Neuladen weg ist. Deshalb wird der
// erste Fehlschlag genau einmal gemeldet, damit die App warnen kann.

/** Wird gerufen, sobald das Schreiben zum ersten Mal scheitert. */
export type Speicherproblemhoerer = () => void

let problemGemeldet = false
let problemHoerer: Speicherproblemhoerer | null = null

/**
 * Einen Melder fuer Speicherprobleme anmelden; liefert die Abmeldung.
 *
 * `null` ist erlaubt und meldet den bisherigen Hörer ab — deshalb steht es im
 * Typ, sonst sähe die Prüfung `&& fn` unten wie toter Code aus. Es gibt
 * bewusst nur *einen* Hörer, kein Set: die App warnt genau einmal.
 */
export function beiSpeicherproblem(fn: Speicherproblemhoerer | null): () => void {
  problemHoerer = fn
  // War das Problem schon vor der Anmeldung da, sofort nachreichen.
  if (problemGemeldet && fn) fn()
  return () => {
    if (problemHoerer === fn) problemHoerer = null
  }
}

function meldeProblem(): void {
  if (problemGemeldet) return
  problemGemeldet = true
  try {
    problemHoerer?.()
  } catch {
    /* ein defekter Hoerer aendert nichts am Speicherproblem */
  }
}

export function schreibe(key: string, wert: unknown): boolean {
  if (!verfuegbar()) {
    meldeProblem()
    return false
  }
  try {
    localStorage.setItem(key, JSON.stringify(wert))
    return true
  } catch {
    // Speicher voll oder privater Modus — die App laeuft weiter, nur ohne Sicherung.
    meldeProblem()
    return false
  }
}

/**
 * Kurzlebige Werte, die nur fuer diesen Tab gelten und den Lernstand nicht
 * beruehren — z. B. die auf der Startseite gewaehlte Sitzungsdauer. Sie
 * gehoeren bewusst NICHT in KEYS: sie ueberleben den Tab nicht und wandern
 * nie in eine Sicherung.
 */
export const TAB_KEYS = {
  dauer: 'red-kurd-tab-dauer',
}

/**
 * Anders als `lies()` ohne `JSON.parse`: hier steht der Rohtext, den
 * `schreibeTab()` per `String(wert)` abgelegt hat. Deshalb `string` und kein
 * Typparameter — es gibt hier nichts zu erwarten.
 */
export function liesTab(key: string, ersatz: string | null = null): string | null {
  try {
    const roh = sessionStorage.getItem(key)
    return roh === null ? ersatz : roh
  } catch {
    return ersatz
  }
}

export function schreibeTab(key: string, wert: unknown): boolean {
  try {
    sessionStorage.setItem(key, String(wert))
    return true
  } catch {
    // Privater Modus — die App laeuft weiter, nur ohne Merken.
    return false
  }
}

export function entferne(key: string): void {
  if (!verfuegbar()) return
  try {
    localStorage.removeItem(key)
  } catch {
    /* egal */
  }
}

/**
 * Vollständige, lokale Sicherung aller bekannten App-Speicher.
 * Es werden nur RED-KURD-Schlüssel gelesen; fremde Browserdaten bleiben unberührt.
 */
// Geraete-lokale Zustaende wandern nicht in Sicherungen:
// - „ohne Konto lernen" ist eine Anmelde-Entscheidung dieses Geraets — ein
//   Import darf sie nicht von einem anderen Geraet uebernehmen.
// - Die laufende Sitzung ist fluechtig — ein Import wuerde sonst auf dem
//   neuen Geraet eine halb fertige, veraltete Sitzung wiederbeleben.
// Das Typargument bindet die beiden Namen an KEYS; der deklarierte
// `ReadonlySet<string>` lässt `has()` weiter mit jedem gelesenen Namen zu.
const NUR_LOKAL: ReadonlySet<string> = new Set<Speicherbereich>(['ohneKonto', 'sitzung'])

export function exportiereSpeicherstand(): Speicherstand {
  // `Object.fromEntries` liefert eine lose Karte `Name → Wert`; erst
  // `Object.assign` legt sie in die Form `Speicherstand`. Das ist die einzige
  // Stelle, an der ungeprüfte Werte aus `JSON.parse` diese Form annehmen —
  // und prüfen ließe sich hier nichts: auf dem Gerät darf ein älterer oder von
  // Hand veränderter Eintrag liegen. `Speicherstand` sagt also, was die App
  // *schreibt*, nicht, was sie garantiert vorfindet (dieselbe Lücke benennt
  // `GespeicherterStand` für den Lernstand).
  const sicherung: Speicherstand = {}
  Object.assign(
    sicherung,
    Object.fromEntries(
      Object.entries(KEYS)
        .filter(([name]) => !NUR_LOKAL.has(name))
        .map(([name, key]): [string, unknown] => [name, lies(key)])
        .filter(([, wert]) => wert !== null)
    )
  )
  return sicherung
}

/**
 * Lokale Sicherung einspielen. Unbekannte Schlüssel werden bewusst ignoriert.
 *
 * `unknown` als Eingabe, weil die Datei vom Nutzer kommt: sie kann alles
 * enthalten. Die drei Prüfungen darunter sind deshalb keine Förmlichkeit.
 * @returns Anzahl geschriebener Bereiche
 */
export function importiereSpeicherstand(speicher: unknown): number {
  if (!istObjekt(speicher) || Array.isArray(speicher)) return 0
  let anzahl = 0
  for (const [name, key] of Object.entries(KEYS)) {
    if (!(name in speicher) || NUR_LOKAL.has(name)) continue
    if (schreibe(key, speicher[name])) anzahl += 1
  }
  return anzahl
}

/**
 * Umbenannte Lernpaare: alte Kartenschluessel muessen mitwandern, sonst
 * uebt ein bestehender Lernstand fuer immer eine Schreibweise, die der Kurs
 * nicht mehr kennt — und beide Formen koennen zugleich als Antwort erscheinen.
 * Schluessel ist `de|ku` ohne den Skill-Teil.
 */
const UMBENANNT: Record<string, string> = {
  'Pilz|kundir': 'Pilz|kivark',
  'Möchtest du Tee?|Tu çay dixwazî?': 'Möchtest du Tee?|Tu çayê dixwazî?',
}

/** Stufe einer Karte robust lesen — auch bei fehlenden oder kaputten Werten. */
function stufeVon(karte: unknown): number {
  if (!istObjekt(karte)) return 0
  const stufe = Number(karte.stufe)
  return Number.isFinite(stufe) ? stufe : 0
}

/**
 * Was `migriereKarten()` zurückgibt.
 *
 * `karten` ist `unknown`, weil die Funktion ihre Eingabe bei allem, was kein
 * Objekt ist, unverändert zurückreicht — `null`, `undefined` und sogar `42`
 * kommen so wieder heraus (`test/storage.test.js:155–173`). Ein engerer Typ
 * wäre an genau der Stelle falsch, die den Datenverlust verhindert.
 */
export interface Kartenmigration {
  karten: unknown
  geaendert: number
}

/** Karten auf die aktuellen Schreibweisen umschreiben, Stufe und Faelligkeit behalten. */
export function migriereKarten(karten: unknown): Kartenmigration {
  if (!istObjekt(karten)) return { karten, geaendert: 0 }
  const neu: Record<string, unknown> = {}
  let geaendert = 0
  for (const [schluessel, wert] of Object.entries(karten)) {
    const teile = schluessel.split('|')
    const paar = teile.slice(0, 2).join('|')
    const ziel = UMBENANNT[paar]
    const neuerSchluessel = ziel ? [ziel, ...teile.slice(2)].join('|') : schluessel
    if (ziel) geaendert += 1
    // Treffen beide Schreibweisen aufeinander, gewinnt der weiter fortgeschrittene
    // Stand — unabhaengig davon, welche Schreibweise zuerst gespeichert wurde.
    const vorhanden = neu[neuerSchluessel]
    neu[neuerSchluessel] =
      vorhanden !== undefined && stufeVon(vorhanden) >= stufeVon(wert) ? vorhanden : wert
  }
  return { karten: neu, geaendert }
}

/* ===== Die Formen der Version 1 =====
   Sie stehen nicht in types/lernstand.d.ts: dort steht, was die App *heute*
   schreibt. Diese drei Formen liest sie nur noch — einmalig, beim ersten Start
   nach dem Umstieg. Alle Felder sind wahlfrei, denn ein v1-Stand konnte jedes
   davon vermissen lassen, und geprüft hat sie nie jemand. */

/**
 * `red-kurd-fortschritt-v1`. Die drei `unknown`-Felder sind kein Übermaß an
 * Vorsicht, sondern Tatsache: v1 legte je Tag eine **Zahl** ab (v2 ein
 * `Tag`-Objekt), je Einheit einen **Wahrheitswert** (v2 einen Prozentwert) und
 * unter `truhe` ein **Objekt** (v2 einen Tagesschlüssel). Die Migration reicht
 * das unverändert durch — siehe die Erwartungen in
 * `test/storage.test.js:193–236`.
 */
export interface AlterLernstand {
  xp?: number
  serie?: number
  letzterTag?: Tagesschluessel | null
  /** Hieß in v1 `lektionen` und wandert nach `einheiten`. */
  lektionen?: unknown
  karten?: Record<Kartenschluessel, Karte>
  tage?: unknown
  edelsteine?: number
  zielBelohnt?: unknown
  truhe?: unknown
}

/** `red-kurd-profil-v1`. `tagesziel` und `variante` gab es dort noch nicht. */
export interface AltesProfil {
  name?: string
  kenntnis?: string
  ziel?: string
  /** Wunschdauer als String — daraus rechnet die Migration das Tagesziel. */
  minuten?: string
  erstellt?: string
}

/**
 * `red-kurd-session-v1`. Bewusst nur dieses eine Feld: die Migration schaut
 * nur nach, *ob* Übungen drinstehen, und schreibt den Eintrag danach
 * unverändert weiter. Welche Form die Übungen hatten, prüft sie nicht.
 */
export interface AlteSitzung {
  uebungen?: unknown
}

// ===== Migration =====
// Laeuft genau einmal beim Start. Alte Daten werden kopiert, nicht verschoben —
// so geht beim Wechsel zurueck auf eine aeltere Version nichts verloren.
let migriert = false

export function migriere(): void {
  if (migriert || !verfuegbar()) return
  migriert = true

  // 0. Umbenannte Lernpaare: Karten auf die aktuelle Schreibweise heben.
  const stand = lies<GespeicherterStand>(KEYS.fortschritt)
  if (stand && stand.karten) {
    const { karten, geaendert } = migriereKarten(stand.karten)
    if (geaendert) schreibe(KEYS.fortschritt, { ...stand, karten })
  }

  // 1. Lernfortschritt v1 -> v2
  if (lies(KEYS.fortschritt) === null) {
    const alt = lies<AlterLernstand>(ALT.fortschritt)
    if (alt) {
      // Das geschriebene Objekt ist absichtlich nicht als `Lernstand`
      // ausgezeichnet: es ist keiner. Die v1-Werte wandern in ihrer alten Form
      // in die neuen Felder, und die Felder von v2, die es damals nicht gab
      // (Sterne, Serienschutz, Welttruhen), fehlen ganz. Beides fängt der
      // `LEER`-Spread im progressStore beim Laden ab.
      schreibe(KEYS.fortschritt, {
        version: 2,
        xp: alt.xp || 0,
        serie: alt.serie || 0,
        letzterTag: alt.letzterTag || null,
        einheiten: alt.lektionen || {},
        karten: alt.karten || {},
        tage: alt.tage || {},
        edelsteine: alt.edelsteine || 0,
        schluessel: 0,
        zielBelohnt: alt.zielBelohnt || null,
        truhe: alt.truhe || null,
        lernzeit: 0,
      })
    }
  }

  // 2. Profil v1 -> v2
  if (lies(KEYS.profil) === null) {
    const alt = lies<AltesProfil>(ALT.profil)
    if (alt) {
      // Anders als beim Lernstand entsteht hier ein vollständiges `Profil` —
      // jedes Feld wird gesetzt, keins bleibt in der v1-Form.
      const profil: Profil = {
        version: 2,
        name: alt.name || '',
        kenntnis: alt.kenntnis || 'neu',
        ziel: alt.ziel || 'alltag',
        minuten: alt.minuten || '10',
        tagesziel: Number(alt.minuten) >= 20 ? 30 : Number(alt.minuten) === 5 ? 10 : 20,
        variante: 'kurmanci-standard',
        erstellt: alt.erstellt || new Date().toISOString(),
      }
      schreibe(KEYS.profil, profil)
    }
  }

  // 3. Laufende Sitzung v1 -> v2
  if (lies(KEYS.sitzung) === null) {
    const alt = lies<AlteSitzung>(ALT.sitzung)
    if (alt && alt.uebungen) schreibe(KEYS.sitzung, alt)
  }

  // 4. Alter App-Modus ("modern" / "klassik") -> UI-Einstellungen
  if (lies(KEYS.ui) === null) {
    let alterModus: string | null = null
    try {
      alterModus = localStorage.getItem(ALT.modus)
    } catch {
      /* egal */
    }
    // `version: 1` ist Absicht und kein Vertipper: uiStore.js:25 erkennt genau
    // daran den Stand vor der Design-Migration. Der Typ lässt es zu, weil
    // `UiEinstellungen.version` `number` ist.
    const einstellungen: UiEinstellungen = {
      version: 1,
      mode: 'modern',
      theme: alterModus === 'klassik' ? 'dark' : 'light',
      soundEnabled: true,
      animationsEnabled: true,
      remindersEnabled: false,
      preferredVariant: 'kurmanci-standard',
    }
    schreibe(KEYS.ui, einstellungen)
  }
}
