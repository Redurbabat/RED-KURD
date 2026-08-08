// Elektro-Formeln und Rechner — reine Funktionen, ohne Oberflaeche.
// Alle Rechner geben null zurueck, wenn eine Eingabe fehlt oder unsinnig
// ist (Teilen durch null) — die Oberflaeche zeigt dann einfach nichts an.
import { zahl } from './notenRechnung.ts'

/**
 * Die Eingaben kommen aus Textfeldern und koennen alles sein — `zahl()`
 * entscheidet, was davon eine Zahl ist. Deshalb `unknown` und nicht `number`:
 * ein `number` waere eine Zusage, die der Aufrufer nicht halten kann.
 */
type Eingabe = unknown

/** Aus welchem Metall die Leitung ist. */
export type Leitermaterial = 'kupfer' | 'aluminium'

/** Ohmsches Gesetz: I = U / R */
export function strom(u: Eingabe, r: Eingabe): number | null {
  const spannung = zahl(u)
  const widerstand = zahl(r)
  if (spannung === null || widerstand === null || widerstand === 0) return null
  return spannung / widerstand
}

/** Ohmsches Gesetz: U = R · I */
export function spannung(r: Eingabe, i: Eingabe): number | null {
  const widerstand = zahl(r)
  const stromstaerke = zahl(i)
  if (widerstand === null || stromstaerke === null) return null
  return widerstand * stromstaerke
}

/** Ohmsches Gesetz: R = U / I */
export function widerstand(u: Eingabe, i: Eingabe): number | null {
  const spg = zahl(u)
  const stromstaerke = zahl(i)
  if (spg === null || stromstaerke === null || stromstaerke === 0) return null
  return spg / stromstaerke
}

/** Leistung: P = U · I */
export function leistung(u: Eingabe, i: Eingabe): number | null {
  const spg = zahl(u)
  const stromstaerke = zahl(i)
  if (spg === null || stromstaerke === null) return null
  return spg * stromstaerke
}

/** Energie in Kilowattstunden: E = P · t (P in Watt, t in Stunden). */
export function energieKwh(p: Eingabe, stunden: Eingabe): number | null {
  const watt = zahl(p)
  const zeit = zahl(stunden)
  if (watt === null || zeit === null) return null
  return (watt * zeit) / 1000
}

/** Stromkosten aus kWh und Preis je kWh. */
export function kosten(kwh: Eingabe, preis: Eingabe): number | null {
  const menge = zahl(kwh)
  const p = zahl(preis)
  if (menge === null || p === null) return null
  return menge * p
}

// Spezifischer Leitwert in m/(Ω·mm²) — Kupfer und Aluminium.
export const LEITWERT: Readonly<Record<Leitermaterial, number>> = { kupfer: 56, aluminium: 35 }

/**
 * Der Leitwert zu einem Material. `material` ist `string`, weil es aus einem
 * Auswahlfeld kommt; alles ausser Aluminium gilt als Kupfer — so war es
 * vorher mit `LEITWERT[material] ?? LEITWERT.kupfer` auch.
 */
function leitwertVon(material: string): number {
  return material === 'aluminium' ? LEITWERT.aluminium : LEITWERT.kupfer
}

/** Was `spannungsfall()` braucht. */
export interface Spannungsfallfrage {
  laenge: Eingabe
  strom: Eingabe
  querschnitt: Eingabe
  material?: string
  /** 1 = Wechselstrom, 3 = Drehstrom. Alles andere zaehlt als 1-phasig. */
  phasen?: number
  /** Ohne Netzspannung gibt es kein Prozent, nur Volt. */
  netzspannung?: Eingabe
}

/** Spannungsfall in Volt, dazu der Anteil an der Netzspannung. */
export interface Spannungsfall {
  volt: number
  /** `null`, wenn keine (oder eine unbrauchbare) Netzspannung angegeben war. */
  prozent: number | null
}

/**
 * Spannungsfall auf einer Leitung.
 * Wechselstrom (1-phasig): ΔU = 2 · l · I / (γ · A)
 * Drehstrom (3-phasig):    ΔU = √3 · l · I / (γ · A)
 */
export function spannungsfall({
  laenge,
  strom: i,
  querschnitt,
  material = 'kupfer',
  phasen = 1,
  netzspannung,
}: Spannungsfallfrage): Spannungsfall | null {
  const l = zahl(laenge)
  const stromstaerke = zahl(i)
  const a = zahl(querschnitt)
  const gamma = leitwertVon(material)
  if (l === null || stromstaerke === null || a === null || a === 0) return null
  const faktor = phasen === 3 ? Math.sqrt(3) : 2
  const volt = (faktor * l * stromstaerke) / (gamma * a)
  const u = zahl(netzspannung)
  return { volt, prozent: u && u !== 0 ? (volt / u) * 100 : null }
}

/** Was `mindestQuerschnitt()` braucht. */
export interface Querschnittfrage {
  laenge: Eingabe
  strom: Eingabe
  erlaubterFall: Eingabe
  material?: string
  phasen?: number
}

/**
 * Grober Mindestquerschnitt, damit ein erlaubter Spannungsfall nicht
 * ueberschritten wird — eine Planungshilfe, keine Norm-Auslegung.
 */
export function mindestQuerschnitt({
  laenge,
  strom: i,
  erlaubterFall,
  material = 'kupfer',
  phasen = 1,
}: Querschnittfrage): number | null {
  const l = zahl(laenge)
  const stromstaerke = zahl(i)
  const fall = zahl(erlaubterFall)
  const gamma = leitwertVon(material)
  if (l === null || stromstaerke === null || fall === null || fall === 0) return null
  const faktor = phasen === 3 ? Math.sqrt(3) : 2
  return (faktor * l * stromstaerke) / (gamma * fall)
}

/** Ein Eintrag der Formelsammlung. */
export interface Formeleintrag {
  id: string
  formel: string
  text: string
  einheit: string
}

/** Die Formelsammlung fuers Nachschlagen — reine Daten. */
export const FORMELN: readonly Formeleintrag[] = [
  { id: 'ohm-u', formel: 'U = R · I', text: 'Spannung aus Widerstand und Strom', einheit: 'V' },
  { id: 'ohm-i', formel: 'I = U ÷ R', text: 'Strom aus Spannung und Widerstand', einheit: 'A' },
  { id: 'ohm-r', formel: 'R = U ÷ I', text: 'Widerstand aus Spannung und Strom', einheit: 'Ω' },
  { id: 'p-ui', formel: 'P = U · I', text: 'Leistung aus Spannung und Strom', einheit: 'W' },
  { id: 'p-u2r', formel: 'P = U² ÷ R', text: 'Leistung aus Spannung und Widerstand', einheit: 'W' },
  { id: 'p-i2r', formel: 'P = I² · R', text: 'Leistung aus Strom und Widerstand', einheit: 'W' },
  { id: 'e-pt', formel: 'E = P · t', text: 'Energie aus Leistung und Zeit', einheit: 'Wh' },
  { id: 'du-1', formel: 'ΔU = 2 · l · I ÷ (γ · A)', text: 'Spannungsfall, Wechselstrom', einheit: 'V' },
  { id: 'du-3', formel: 'ΔU = √3 · l · I ÷ (γ · A)', text: 'Spannungsfall, Drehstrom', einheit: 'V' },
]

/** Die fünf Sicherheitsregeln — Reihenfolge ist Teil der Regel. */
export const SICHERHEITSREGELN: readonly string[] = [
  'Freischalten',
  'Gegen Wiedereinschalten sichern',
  'Spannungsfreiheit feststellen',
  'Erden und kurzschließen',
  'Benachbarte, unter Spannung stehende Teile abdecken oder abschranken',
]
