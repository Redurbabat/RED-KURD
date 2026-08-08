/**
 * Die persistenten Datenformen von RED-KURD als TypeScript-Typen.
 *
 * Sie sind die maschinenlesbare Fassung von STORAGE.md — dort steht zu jedem
 * Feld die Bedeutung und die Fundstelle im Code. Beide müssen zusammen
 * geändert werden.
 *
 * Vorerst eine reine Deklarationsdatei: der Bestand ist JS, `checkJs` ist aus.
 * Wenn ein Modul nach TypeScript wandert (Reihenfolge siehe ADR-006), zieht es
 * seine Form von hier — nicht jedes Modul definiert sie neu.
 */

/** Fertigkeiten, in denen eine Vokabel getrennt geübt und bewertet wird. */
export type Fertigkeit = 'erkennen' | 'abrufen' | 'schreiben' | 'hoeren'

/** Aufgabenarten des Übungsspielers. */
export type Aufgabenart = 'wahl-ku' | 'wahl-de' | 'tippen' | 'bild' | 'hoeren'

/** Kalendertag in der Zeitzone des Geräts, Format `JJJJ-MM-TT`. */
export type Tagesschluessel = string

/** Kartenschlüssel im Format `de|ku|fertigkeit`. */
export type Kartenschluessel = string

/**
 * Die Fertigkeit, wie sie in einem Kartenschlüssel steht. `gemischt` heißt:
 * der Schlüssel nennt keine, die Karte gilt also für alle zusammen.
 */
export type Kartenfertigkeit = Fertigkeit | 'gemischt'

/**
 * Ein zerlegter Kartenschlüssel. Bewusst weit gefasst: `schluesselTeile`
 * trennt stur am `|` und prüft nicht, ob der dritte Teil wirklich eine
 * Fertigkeit ist — siehe die bekannte Grenze des Trennzeichens in STORAGE.md.
 */
export interface Kartenteile {
  de: string
  /** Fehlt, wenn der Schlüssel gar kein `|` enthält. */
  ku: string | undefined
  /** `gemischt`, wenn der Schlüssel keinen dritten Teil hat. */
  skill: string
}

/** Eine Wiederholkarte (vereinfachtes SM-2, siehe scheduler.ts). */
export interface Karte {
  /** 0–6; Abstände [1, 3, 7, 16, 35, 70] Tage. Richtig → +1, falsch → zurück auf 0. */
  stufe: number
  faellig: Tagesschluessel
  gesehen: number
  richtig: number
}

/** Aktivität eines einzelnen Tages; auf 60 Einträge begrenzt. */
export interface Tag {
  aufgaben: number
  richtig: number
  sekunden: number
  skills: Partial<Record<Fertigkeit, number>>
  folge: number
  maxFolge: number
}

/** `red-kurd-progress-v2` — der eine Lernstand aller drei Modi. */
export interface Lernstand {
  version: 2
  xp: number
  serie: number
  letzterTag: Tagesschluessel | null
  serienSchutz: number
  letzterSchutz: Tagesschluessel | null
  /** Einheit-ID → bestes Ergebnis in Prozent. */
  einheiten: Record<string, number>
  /** Einheit-ID → 0–3 Sterne. */
  sterne: Record<string, number>
  /** Einheit-ID → Anzahl bestandener Läufe (≥ 80 %). */
  bestanden: Record<string, number>
  karten: Record<Kartenschluessel, Karte>
  tage: Record<Tagesschluessel, Tag>
  edelsteine: number
  schluessel: number
  zielBelohnt: Tagesschluessel | null
  truhe: Tagesschluessel | null
  /** Welt-ID → Tag, an dem die Welttruhe geöffnet wurde. */
  weltTruhen: Record<string, Tagesschluessel>
  lernzeit: number
}

/** `red-kurd-profile-v2` — Lernprofil. */
export interface Profil {
  version: 2
  name: string
  kenntnis: string
  ziel: string
  minuten: string
  tagesziel: number
  variante: string
  erstellt: string
}

/** `red-kurd-ui-v1` — Oberflächeneinstellungen. */
export interface UiEinstellungen {
  /** Achtung: der Schlüsselname endet auf -v1, der Wert trägt version: 2. */
  version: number
  mode: 'modern' | 'abenteuer' | 'redlingo'
  theme: 'light' | 'dark'
  soundEnabled: boolean
  animationsEnabled: boolean
  remindersEnabled: boolean
  preferredVariant: string
}

/** Ein Wortpaar des Kurses. `bild` ist meist ein Emoji, manchmal ein Foto. */
export interface Wort {
  de: string
  ku: string
  bild?: string
}

/**
 * Ein Wort auf dem Weg in eine Aufgabe. Stammt es aus einer fälligen Karte,
 * bringt es deren Fertigkeit mit — dann wird genau diese trainiert.
 * `skill` ist roher Text aus dem Kartenschlüssel: `gemischt` oder etwas
 * Unbekanntes sind möglich, deshalb `string` und nicht `Fertigkeit`.
 */
export interface Uebungswort extends Wort {
  skill?: string
}

/** Eine Kachel einer Bildaufgabe. */
export interface Bildoption {
  bild: string
  ku: string
}

/** Was jede Aufgabe hat, unabhängig von ihrer Art. */
interface Aufgabenkern {
  frage: string
  antwort: string
  w: Uebungswort
}

/** Bildaufgabe: vier Kacheln, gesucht ist das Bild zum Kurmancî-Wort. */
export interface Bildaufgabe extends Aufgabenkern {
  art: 'bild'
  optionen: Bildoption[]
}

/** Wahlaufgabe: vier Wörter zur Auswahl. */
export interface Wahlaufgabe extends Aufgabenkern {
  art: 'wahl-ku' | 'wahl-de' | 'hoeren'
  optionen: string[]
}

/** Tippaufgabe: die Antwort wird geschrieben — sie hat gar keine Optionen. */
export interface Tippaufgabe extends Aufgabenkern {
  art: 'tippen'
}

/**
 * Eine Aufgabe im Übungsspieler. Die Optionen hängen an der Art: Bildaufgaben
 * tragen Kacheln, Wahlaufgaben Wörter, die Tippaufgabe hat keine. Das eine
 * `optionen: unknown[]` von früher hat genau das verdeckt — siehe
 * exerciseFactory.ts, wo die drei Formen entstehen.
 */
export type Uebung = Bildaufgabe | Wahlaufgabe | Tippaufgabe

/** `red-kurd-session-v2` — laufende Sitzung. Hat bisher kein version-Feld. */
export interface Sitzung {
  titel: string
  index: number
  punkte: number
  uebungen: Uebung[]
}

/** `red-kurd-shop-v1` — gekaufte und aktive Kosmetik. */
export interface Shopstand {
  version: 1
  gekauft: string[]
  aktiv: Record<string, string>
}

/** `red-kurd-language-courses-v1` — getrennter Fortschritt der Nebensprachen. */
export interface Sprachkursstand {
  version: 1
  kapitel: Record<string, { prozent: number; fertig: boolean }>
  zuletzt: string | null
}

/**
 * Inhalt einer Sicherungsdatei. Enthält bewusst NICHT: `ohneKonto`
 * (gerätelokale Entscheidung) und die Sprachaufnahmen aus der IndexedDB.
 */
export interface Sicherung {
  fortschritt?: Lernstand
  profil?: Profil
  ui?: UiEinstellungen
  sitzung?: Sitzung
  shop?: Shopstand
  sprachkurse?: Sprachkursstand
  auszeichnungen?: unknown
  aufgaben?: unknown
  herzen?: unknown
}

/* ===== Die anderen drei Apps =====
   Code lernen, AI-Sprache und Elektro-Lehre teilen sich EINE Implementierung
   (core/lernbereiche/bereichsLernstand.js), aber je einen eigenen Schlüssel.
   Geteilt werden die Regeln, nicht die Zahlen — siehe ADR-008. */

/** Zustand einer Lektion, immer aus dem Lernstand abgeleitet, nie aus den Daten. */
export type Lektionsstatus = 'done' | 'current' | 'open' | 'locked'

/**
 * Lernstand eines App-Bereichs. Gilt für codeFortschritt,
 * promptingFortschritt und electroFortschritt gleichermaßen.
 */
export interface Bereichslernstand {
  version: 1
  /** Lektions- oder Übungs-ID → Tag der Erledigung. */
  erledigt: Record<string, Tagesschluessel>
  /** Übungs-ID → eigene Lösung oder Notiz. */
  notizen: Record<string, string>
  xp: number
  serie: number
  letzterTag: Tagesschluessel | null
  /** Tag → an diesem Tag gesammelte XP. Wächst bisher ohne Obergrenze. */
  tage: Record<Tagesschluessel, number>
}

/* ===== Gamification =====
   Serie und Wochenliga werden nicht als eigene Form gespeichert, sondern aus
   einem Lernstand berechnet (core/progress/gamification.ts). Die Regeln sind
   für alle vier Apps dieselben, die Zahlen nicht — siehe ADR-008. */

/**
 * Der Ausschnitt eines Lernstands, den die Serienberechnung liest. Alle Felder
 * sind wahlfrei: der Bereichs-Lernstand der drei neuen Apps kennt keinen
 * `serienSchutz`, der Lernstand der Sprach-App schon.
 */
export interface Serienstand {
  serie?: number
  letzterTag?: Tagesschluessel | null
  serienSchutz?: number
}

/** Ergebnis der Serienberechnung für den ersten Lernmoment eines Tages. */
export interface Serienergebnis {
  serie: number
  letzterTag: Tagesschluessel
  serienSchutz: number
  /** Zahl der Schutz-Tage, die diese Berechnung verbraucht hat; sonst 0. */
  schutzBenutzt: number
}

/** Eine Stufe der persönlichen Wochenliga. */
export interface Wochenliga {
  id: string
  name: string
  /** Untere Schwelle in gelösten Aufgaben, einschließlich. */
  start: number
  /** Obere Schwelle; `null` in der höchsten Liga. */
  ziel: number | null
  icon: string
  text: string
}

/** Eine Ligastufe samt Einordnung des aktuellen Wochenstands. */
export interface Wochenligastand extends Wochenliga {
  /** Gelöste Aufgaben dieser Woche, nie negativ. */
  aufgaben: number
  naechste: Wochenliga | null
  /** Fortschritt innerhalb der Stufe; in der höchsten Liga fest 1. */
  fortschritt: number
  /** Breite der Stufe; in der höchsten Liga fest 1. */
  spanne: number
  /** Aufgaben bis zur nächsten Stufe; in der höchsten Liga 0. */
  fehlen: number
}
