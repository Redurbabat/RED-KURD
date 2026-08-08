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

/** Eine Wiederholkarte (vereinfachtes SM-2, siehe scheduler.js). */
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

/** Eine Aufgabe im Übungsspieler. */
export interface Uebung {
  art: Aufgabenart
  frage: string
  antwort: string
  optionen: unknown[]
  w: { de: string; ku: string; bild?: string }
}

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
