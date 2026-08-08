/**
 * Die Formen der Kursinhalte von RED-KURD als TypeScript-Typen.
 *
 * Abgegrenzt von `lernstand.d.ts`: dort stehen die Formen, die **gespeichert**
 * werden und deshalb Versionen und Migrationen brauchen. Hier stehen die
 * Formen der **Inhalte** — sie liegen im Quelltext unter `src/data/`, kommen
 * mit dem Build und werden nie geschrieben.
 *
 * Die Kursdaten selbst sind noch JavaScript. Damit ein migriertes Modul ihre
 * Form kennt, liegt neben jeder Datendatei eine Deklarationsdatei, die auf die
 * Typen von hier zeigt. Weil eine solche Deklaration nicht mitwächst, wenn
 * jemand die Daten ändert, prüft `test/kursdaten-form.test.js` die echten
 * Daten gegen genau diese Zusagen.
 */

import type { Aufgabenart, Wort } from './lernstand'

/** Ein Beispielsatz eines Kapitels — Deutsch zuerst, Kurmancî darunter. */
export interface Beispielsatz {
  de: string
  ku: string
}

/** Eine Grammatik-Notiz: eine einzige Sache, kurz erklärt, mit einem Beispiel. */
export interface Grammatiknotiz {
  titel: string
  text: string
  beispiel: Beispielsatz
}

/** Zusatzinhalte zu einem Kapitel (`data/kapitelExtras.js`). */
export interface Kapitelextra {
  saetze?: readonly Beispielsatz[]
  grammatik?: Grammatiknotiz
}

/**
 * Ein Bild samt Quellenangabe. Nur `src` und `alt` sind sicher da: die
 * Lernwelt-Fotos in `kurse.js` tragen keine Lizenzangabe, die aus Wikimedia
 * geernteten Fotos schon.
 */
export interface Bildnachweis {
  src: string
  alt: string
  urheber?: string
  lizenz?: string
  lizenzUrl?: string
  quelle?: string
  titel?: string
}

/** Ein Kapitelfoto aus `data/kapitelFotos.js` (generiert). */
export interface Kapitelfoto extends Bildnachweis {
  /** Die Kapitel-ID, unter der das Foto auch im Verzeichnis steht. */
  id: string
}

/** Ein Wortfoto aus `data/wortFotos.js` (generiert). */
export interface Wortfoto extends Bildnachweis {
  /** Das Kurmancî-Wort, exakt wie in den Kursdaten. */
  ku: string
}

/**
 * Ein Kapitel, wie es roh in `data/kurse.js` steht — vor der Anreicherung
 * durch `courseRepository`.
 */
export interface Kurseinheit {
  id: string
  name: string
  /** Was man nach dem Kapitel kann, in einem Satz. */
  ziel: string
  /** Emoji des Kapitels; steht auf den Kacheln und Pfadstationen. */
  symbol: string
  woerter: readonly Wort[]
  /** Lernwelt-Foto aus `KURS_FOTOS`; `null`, wenn das Kapitel keins hat. */
  foto: Bildnachweis | null
  /** Nur die Vertiefungskapitel tragen Sätze direkt bei sich. */
  saetze?: readonly Beispielsatz[]
  grammatik?: Grammatiknotiz
}

/** Einer der fünf Abschnitte, aus denen jedes Kapitel besteht. */
export interface Lektionsart {
  id: string
  nr: number
  name: string
  beschreibung: string
  dauer: string
  icon: string
  arten: readonly Aufgabenart[]
  anzahl: number
  /** Nur die Kapitelprüfung setzt das. */
  pruefung?: boolean
}

/**
 * Ein Abschnitt, wie er an einer konkreten Einheit hängt. `id` ist dann nicht
 * mehr `lernen`, sondern `begruessung-lernen`.
 */
export interface Lektion extends Lektionsart {
  einheitId: string
}

/**
 * Eine Kurseinheit, wie `courseRepository` sie ausliefert: die Rohdaten plus
 * Platz im Kurs, Welt, Foto, Extras und die fünf Abschnitte.
 */
export interface Einheit extends Omit<Kurseinheit, 'saetze' | 'grammatik'> {
  /** Platz in der Gesamtreihenfolge, beginnend bei 1. */
  nr: number
  /** `null` für Einheiten, die in keiner Welt vorkommen — die hängen hinten an. */
  weltId: string | null
  saetze: readonly Beispielsatz[] | null
  grammatik: Grammatiknotiz | null
  lektionen: readonly Lektion[]
}

/** Eine Welt des Lernpfads: ein Ort, eine Landschaft, eine Handvoll Einheiten. */
export interface Welt {
  id: string
  nr: number
  name: string
  /** Der Name auf Kurmancî. */
  untertitel: string
  ort: string
  /** Schlüssel der Landschaftszeichnung (`components/adventure/Landscape.jsx`). */
  landschaft: string
  /** CSS-Wert, meist eine `var(--rk-…)`. */
  farbe: string
  /** Himmelsfarbe als Hex-Wert. */
  himmel: string
  /** IDs der Einheiten dieser Welt, in Lernreihenfolge. */
  einheiten: readonly string[]
}

/**
 * Stand einer Einheit. `gesperrt` ist nur eine Empfehlung — die Oberfläche
 * lässt das Öffnen trotzdem zu.
 */
export type Einheitsstatus = 'fertig' | 'aktuell' | 'begonnen' | 'gesperrt'

/** Stand einer Welt. Anders als bei Einheiten gibt es kein `begonnen`. */
export type Weltstatus = 'fertig' | 'aktuell' | 'gesperrt'

/** Die Knotenarten des Lernpfads. */
export type Knotenart =
  | 'lektion'
  | 'wiederholen'
  | 'hoeren'
  | 'truhe'
  | 'spiel'
  | 'pruefung'
  | 'abschluss'

/** Was jede Station des Lernpfads hat. */
interface Knotenkern {
  id: string
  art: Knotenart
  name: string
  untertitel: string
  status: Einheitsstatus
  icon: string
}

/** Eine echte Lernstation — sie hängt an einer Einheit. */
export interface Lernknoten extends Knotenkern {
  art: 'lektion' | 'pruefung'
  einheitId: string
  prozent: number
  sterne: number
  symbol: string
}

/**
 * Truhe, Bonusspiel und Abschluss. Sie sperren nie etwas und hängen an keiner
 * Einheit — deshalb tragen sie weder `einheitId` noch Prozente oder Sterne.
 */
export interface Beiwerkknoten extends Knotenkern {
  art: 'truhe' | 'spiel' | 'abschluss'
}

/** Eine Station des Lernpfads. */
export type Pfadknoten = Lernknoten | Beiwerkknoten

/** Gesamtfortschritt des Kurses. */
export interface Kursfortschritt {
  fertig: number
  gesamt: number
  prozent: number
}

/** Fortschritt in einer Welt, samt Sternen. */
export interface Weltfortschritt {
  fertig: number
  gesamt: number
  sterne: number
  maxSterne: number
  /** 0, wenn die Welt gar keine Einheiten hat — nicht `NaN`. */
  prozent: number
  /** `true`, solange noch eine Einheit offen ist. */
  offen: boolean
}
