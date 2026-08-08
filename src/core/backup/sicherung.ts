// Sicherungsdateien prüfen, beschreiben und einspielen.
//
// Warum ein eigenes Modul: Bis hierher lag der ganze Import in
// `ProgressPage.jsx` — Lernlogik in einer Seite, was CLAUDE.md ausschließt.
// Wichtiger noch ist die Reihenfolge, in der gearbeitet wird.
//
// Vorher wurde geschrieben, während geprüft wurde: erst `speicher`, dann
// `fortschritt`, dann `profil`, `ui`, `shop`. Stolperte etwas in der Mitte,
// war die Hälfte schon auf der Platte — der Lernstand des Geräts überschrieben,
// der aus der Datei nur teilweise da. Genau der Zustand, den CLAUDE.md
// Grundsatz 2 verbietet.
//
// Hier ist es getrennt: `pruefeSicherung()` liest und beurteilt, schreibt aber
// nichts. Erst `spieleSicherungEin()` schreibt — und auch das erst, wenn jeder
// Teil für gut befunden wurde. Eine fremde oder kaputte Datei wird abgelehnt,
// statt halb eingespielt.
//
// Nebenprodukt der Prüfung ist die Vorschau: Wer eine Sicherung einspielt,
// ersetzt seinen ganzen Lernstand. Er soll vorher sehen, was in der Datei
// steckt — XP, Serie, Karten, Datum und welche der vier Apps enthalten sind.
import { KEYS, importiereSpeicherstand, lies } from '../storage.ts'
import { istLernstand, setzeFortschritt } from '../progress/progressStore.ts'
import { setzeProfil } from '../profile/profileStore.ts'
import { setzeUi } from '../ui/uiStore.ts'
import { setzeShop } from '../shop/shopStore.ts'

import type {
  GespeicherterStand,
  Profil,
  Shopstand,
  Speicherstand,
  UiEinstellungen,
} from '../../types/lernstand'

/** Ein Bereich, den die Vorschau einzeln ausweist. */
export interface Bereichsvorschau {
  /** Kurzer deutscher Name für die Oberfläche. */
  name: string
  /** Kennzahl dieses Bereichs, schon fertig formuliert. */
  wert: string
}

/** Was in einer Sicherungsdatei steckt — für die Rückfrage vor dem Einspielen. */
export interface Sicherungsvorschau {
  /** ISO-Zeitstempel des Exports, oder `null`, wenn die Datei keinen trägt. */
  exportiert: string | null
  xp: number
  serie: number
  /** Anzahl Wiederholkarten (Wortpaar × Fertigkeit). */
  karten: number
  /** Anzahl gelernter Wortpaare — Karten derselben Vokabel zählen einmal. */
  woerter: number
  /** Kapitel mit einem Ergebnis. */
  einheiten: number
  edelsteine: number
  /** Je enthaltenem Bereich eine Zeile; leer, wenn nur der Lernstand drin ist. */
  bereiche: Bereichsvorschau[]
}

/** Ergebnis von `pruefeSicherung()`. */
export type Sicherungspruefung =
  | { ok: false; grund: string }
  | { ok: true; vorschau: Sicherungsvorschau; datei: GepruefteSicherung }

/**
 * Eine Datei, die die Prüfung bestanden hat. Absichtlich nicht `Sicherungsdatei`:
 * die Werte sind geprüft, aber nicht Feld für Feld — ein `Lernstand` wäre eine
 * Zusage, die `istLernstand()` nicht einlöst (es sieht nur den Umriss an).
 */
export interface GepruefteSicherung {
  fortschritt: GespeicherterStand
  speicher: Partial<Speicherstand> | null
  /** Nur Felder mit der richtigen Art; der Rest fällt beim Prüfen weg. */
  profil: Partial<Profil> | null
  ui: Partial<UiEinstellungen> | null
  shop: Partial<Shopstand> | null
}

/** Was `spieleSicherungEin()` wirklich geschrieben hat. */
export interface Einspielergebnis {
  /** Namen der geschriebenen Bereiche, in der Reihenfolge des Schreibens. */
  geschrieben: string[]
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return typeof wert === 'object' && wert !== null && !Array.isArray(wert)
}

function zahl(wert: unknown): number {
  const n = Number(wert)
  return Number.isFinite(n) ? n : 0
}

/**
 * Ein einzelnes Feld übernehmen, wenn es die erwartete Art hat — sonst gar
 * nicht. Weggelassene Felder füllen die Stores aus ihrem `STANDARD` auf; ein
 * übernommener Unsinn bliebe dagegen dauerhaft im Speicher stehen.
 *
 * Das ist der Unterschied zu vorher: `setzeProfil(daten.profil)` reichte jedes
 * Feld ungeprüft durch, auch `name: 42` oder `tagesziel: "viel"`.
 */
function uebernimm<T extends object>(
  ziel: Partial<T>,
  quelle: Record<string, unknown>,
  feld: string & keyof T,
  art: 'string' | 'number' | 'boolean'
): void {
  const wert = quelle[feld]
  if (typeof wert !== art) return
  // Zahlen, die keine sind (NaN, Infinity), gehören nicht in den Speicher.
  if (art === 'number' && !Number.isFinite(wert)) return
  Object.assign(ziel, { [feld]: wert })
}

/** Profil aus einer Sicherung — nur Felder mit der richtigen Art. */
function alsProfil(wert: unknown): Partial<Profil> | null {
  if (!istObjekt(wert)) return null
  const p: Partial<Profil> = {}
  uebernimm<Profil>(p, wert, 'version', 'number')
  uebernimm<Profil>(p, wert, 'name', 'string')
  uebernimm<Profil>(p, wert, 'kenntnis', 'string')
  uebernimm<Profil>(p, wert, 'ziel', 'string')
  uebernimm<Profil>(p, wert, 'minuten', 'string')
  uebernimm<Profil>(p, wert, 'tagesziel', 'number')
  uebernimm<Profil>(p, wert, 'variante', 'string')
  uebernimm<Profil>(p, wert, 'erstellt', 'string')
  return p
}

/** Oberflächeneinstellungen aus einer Sicherung. */
function alsUi(wert: unknown): Partial<UiEinstellungen> | null {
  if (!istObjekt(wert)) return null
  const u: Partial<UiEinstellungen> = {}
  uebernimm<UiEinstellungen>(u, wert, 'version', 'number')
  uebernimm<UiEinstellungen>(u, wert, 'soundEnabled', 'boolean')
  uebernimm<UiEinstellungen>(u, wert, 'animationsEnabled', 'boolean')
  uebernimm<UiEinstellungen>(u, wert, 'remindersEnabled', 'boolean')
  uebernimm<UiEinstellungen>(u, wert, 'preferredVariant', 'string')
  // Ansicht und Design sind Vereinigungen, keine beliebigen Texte. Ein
  // unbekannter Wert landete sonst als `data-mode`/`data-theme` am <html>,
  // wofür es kein CSS gibt — falsche Farben statt gebrochener Kontraste.
  if (wert['mode'] === 'modern' || wert['mode'] === 'abenteuer' || wert['mode'] === 'redlingo') {
    u.mode = wert['mode']
  }
  if (wert['theme'] === 'light' || wert['theme'] === 'dark' || wert['theme'] === 'auto') {
    u.theme = wert['theme']
  }
  return u
}

/** Shop-Stand aus einer Sicherung. */
function alsShop(wert: unknown): Partial<Shopstand> | null {
  if (!istObjekt(wert)) return null
  const s: Partial<Shopstand> = {}
  uebernimm<Shopstand>(s, wert, 'version', 'number')
  const gekauft = wert['gekauft']
  if (Array.isArray(gekauft)) s.gekauft = gekauft.filter((id) => typeof id === 'string')
  const aktiv = wert['aktiv']
  if (istObjekt(aktiv)) {
    const geprueft: Record<string, string | null> = {}
    for (const [slot, id] of Object.entries(aktiv)) {
      if (typeof id === 'string' || id === null) geprueft[slot] = id
    }
    s.aktiv = geprueft
  }
  return s
}

/** Wieviele Einträge hat dieses Feld, wenn es überhaupt ein Objekt ist? */
function anzahl(wert: unknown): number {
  return istObjekt(wert) ? Object.keys(wert).length : 0
}

/**
 * Die Bereiche der drei anderen Apps in der Vorschau. Sie liegen unter
 * `speicher` und tragen je einen `Bereichslernstand`; gezeigt werden ihre XP,
 * weil das dort die Maßzahl ist (die Sprach-App zählt gelöste Aufgaben —
 * bewusst nicht zusammengerechnet, siehe ADR-008).
 */
/**
 * Die Namen sind zugleich Schlüssel in `KEYS` und in `Speicherstand` — der Typ
 * hält beides fest, damit ein Tippfehler hier nicht erst beim Lesen auffällt.
 */
type Sicherungsbereich = keyof Speicherstand & keyof typeof KEYS

const FREMDE_APPS: readonly { schluessel: Sicherungsbereich; name: string }[] = [
  { schluessel: 'codeFortschritt', name: 'Code lernen' },
  { schluessel: 'promptingFortschritt', name: 'AI-Sprache' },
  { schluessel: 'electroFortschritt', name: 'Elektro-Lehre' },
]

/** Weitere Bereiche, die nur als „ja, enthalten" auftauchen. */
const WEITERE: readonly { schluessel: Sicherungsbereich; name: string }[] = [
  { schluessel: 'sprachkurse', name: 'Nebensprachkurse' },
  { schluessel: 'electroSchule', name: 'Elektro-Schule' },
  { schluessel: 'promptingWerkstatt', name: 'AI-Werkstatt' },
  { schluessel: 'fehlerbuch', name: 'Fehlerbuch' },
  { schluessel: 'auszeichnungen', name: 'Auszeichnungen' },
]

function baueVorschau(datei: GepruefteSicherung, exportiert: string | null): Sicherungsvorschau {
  const f = datei.fortschritt
  const kartenSchluessel = istObjekt(f.karten) ? Object.keys(f.karten) : []
  // Dieselbe Zählweise wie `statistik()`: Karten derselben Vokabel — also
  // gleiches `de|ku` bei unterschiedlicher Fertigkeit — sind EIN gelerntes Wort.
  const woerter = new Set(kartenSchluessel.map((k) => k.split('|').slice(0, 2).join('|')))

  const bereiche: Bereichsvorschau[] = []
  const speicher = datei.speicher
  if (speicher) {
    for (const { schluessel, name } of FREMDE_APPS) {
      const stand: unknown = speicher[schluessel]
      if (!istObjekt(stand)) continue
      // `stand` ist hier bereits als Objekt eingegrenzt; die beiden Felder
      // werden einzeln gelesen und mit `zahl()`/`anzahl()` abgesichert — eine
      // Zusage auf `Bereichslernstand` gäbe der Inhalt nicht her.
      const xp = zahl(stand['xp'])
      const erledigt = anzahl(stand['erledigt'])
      bereiche.push({ name, wert: `${xp} XP · ${erledigt} erledigt` })
    }
    if (istObjekt(speicher.shop) || datei.shop) {
      const gekauft = datei.shop?.gekauft ?? (istObjekt(speicher.shop) ? speicher.shop['gekauft'] : null)
      bereiche.push({
        name: 'Shop',
        wert: Array.isArray(gekauft) ? `${gekauft.length} gekauft` : 'enthalten',
      })
    }
    for (const { schluessel, name } of WEITERE) {
      if (speicher[schluessel] !== undefined && speicher[schluessel] !== null) {
        bereiche.push({ name, wert: 'enthalten' })
      }
    }
  }

  return {
    exportiert,
    xp: zahl(f.xp),
    serie: zahl(f.serie),
    karten: kartenSchluessel.length,
    woerter: woerter.size,
    einheiten: anzahl(f.einheiten),
    edelsteine: zahl(f.edelsteine),
    bereiche,
  }
}

/**
 * Eine Sicherungsdatei lesen und beurteilen. Schreibt nichts.
 *
 * @param text roher Dateiinhalt
 */
export function pruefeSicherung(text: string): Sicherungspruefung {
  let roh: unknown
  try {
    roh = JSON.parse(text)
  } catch {
    return { ok: false, grund: 'Die Datei ist kein gültiges JSON.' }
  }

  if (!istObjekt(roh)) {
    return { ok: false, grund: 'Die Datei enthält kein Objekt, sondern etwas anderes.' }
  }

  // `app` gibt es erst seit Version 2 der Datei. Eine ältere Sicherung ohne
  // dieses Feld wird trotzdem angenommen — entscheidend ist der Lernstand.
  // Steht dort aber ein FREMDER Name, ist es sicher nicht unsere Datei.
  if (roh['app'] !== undefined && roh['app'] !== 'RED-KURD') {
    return { ok: false, grund: 'Die Datei stammt aus einer anderen App.' }
  }

  if (!istLernstand(roh['fortschritt'])) {
    return {
      ok: false,
      grund: 'In der Datei steckt kein RED-KURD-Lernstand.',
    }
  }

  // Jeder weitere Teil wird VOR dem Schreiben geprüft. Was nicht die richtige
  // Form hat, wird verworfen statt eingespielt — lieber ein Bereich weniger
  // als ein kaputter.
  const speicher = istObjekt(roh['speicher']) ? roh['speicher'] : null
  if (roh['speicher'] !== undefined && speicher === null) {
    return { ok: false, grund: 'Der Abschnitt „speicher" hat die falsche Form.' }
  }

  const datei: GepruefteSicherung = {
    fortschritt: roh['fortschritt'],
    speicher,
    // Ältere Dateien tragen Profil, Oberfläche und Shop zusätzlich oben —
    // dort haben sie Vorrang, weil eine alte App sie genau so geschrieben hat.
    profil: alsProfil(roh['profil']),
    ui: alsUi(roh['ui']),
    shop: alsShop(roh['shop']),
  }

  const exportiert = typeof roh['exportiert'] === 'string' ? roh['exportiert'] : null
  return { ok: true, vorschau: baueVorschau(datei, exportiert), datei }
}

/**
 * Eine geprüfte Sicherung einspielen. Nimmt bewusst NICHT den Dateitext,
 * sondern das Ergebnis von `pruefeSicherung()` — so lässt sich nicht aus
 * Versehen etwas Ungeprüftes einspielen.
 *
 * Die Reihenfolge ist bedeutungstragend: `speicher` zuerst, damit die
 * anschließenden Setzer den Modul-Cache mit dem endgültigen Wert füllen und
 * `melden()` auslösen. Käme `speicher` zuletzt, stünde in den Caches noch der
 * alte Stand.
 */
export function spieleSicherungEin(datei: GepruefteSicherung): Einspielergebnis {
  const geschrieben: string[] = []

  if (datei.speicher) {
    const anzahlBereiche = importiereSpeicherstand(datei.speicher)
    if (anzahlBereiche > 0) geschrieben.push(`speicher (${anzahlBereiche})`)
  }

  setzeFortschritt(datei.fortschritt)
  geschrieben.push('fortschritt')

  // Profil, Oberfläche und Shop stehen in neueren Dateien nur noch unter
  // `speicher` — `importiereSpeicherstand()` hat sie dann schon geschrieben.
  // Die Setzer laufen hier trotzdem, wenn die Datei sie oben mitbringt: sie
  // füllen zusätzlich den Modul-Cache und melden die Änderung.
  if (datei.profil) {
    setzeProfil(datei.profil)
    geschrieben.push('profil')
  }
  if (datei.ui) {
    setzeUi(datei.ui)
    geschrieben.push('ui')
  }
  if (datei.shop) {
    setzeShop(datei.shop)
    geschrieben.push('shop')
  }

  return { geschrieben }
}

/**
 * Was aktuell auf dem Gerät liegt — dieselbe Form wie die Vorschau, damit die
 * Oberfläche „vorher" und „nachher" nebeneinanderstellen kann. Wer eine
 * Sicherung einspielt, soll sehen, was er dabei aufgibt.
 */
export function vorschauVomGeraet(): Sicherungsvorschau {
  const fortschritt = lies<GespeicherterStand>(KEYS.fortschritt) || {}
  const speicher: Partial<Speicherstand> = {}
  for (const { schluessel } of [...FREMDE_APPS, ...WEITERE]) {
    const wert = lies(KEYS[schluessel])
    if (wert !== null) Object.assign(speicher, { [schluessel]: wert })
  }
  const shop = lies(KEYS.shop)
  if (shop !== null) Object.assign(speicher, { shop })
  return baueVorschau({ fortschritt, speicher, profil: null, ui: null, shop: null }, null)
}
