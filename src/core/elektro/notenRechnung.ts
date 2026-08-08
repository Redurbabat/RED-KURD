// Noten-Mathematik der Elektro-Lehre — reine Funktionen, keine Oberflaeche,
// kein Speicher. Alles hier ist testbar ohne Browser.
//
// Zwei Skalen, weil beide Laender vorkommen: In der Schweiz ist 6 die beste
// Note, in Deutschland die 1. Die Richtung steckt in `hochIstBesser` — jede
// Rechnung fragt die Skala, niemand raet.

/** Eine Notenskala. `hochIstBesser` dreht jede Richtungsfrage um. */
export interface Notenskala {
  id: Skalenkennung
  name: string
  min: number
  max: number
  /** Ab (bzw. bis) dieser Note gilt es als bestanden. */
  bestanden: number
  hochIstBesser: boolean
}

/** Die beiden Skalen, die es gibt. */
export type Skalenkennung = 'schweiz' | 'deutschland'

/**
 * Das Minimum, das die Rechnungen von einer Note brauchen.
 *
 * `note` und `gewicht` sind bewusst `string | number`: sie kommen roh aus dem
 * Eingabefeld, wo `'4,5'` und `'1'` stehen. Gerechnet wird nie direkt,
 * sondern ueber `zahl()`. Wer hier `number` verspricht, bringt die erste
 * Stelle zum Absturz, die sich darauf verlaesst — siehe `Noteneintrag` in
 * lernstand.d.ts.
 */
export interface Rechennote {
  note?: string | number
  gewicht?: string | number
  /** `JJJJ-MM-TT`. Nur `trend()` liest es. */
  datum?: string
}

export const SKALEN: Readonly<Record<Skalenkennung, Notenskala>> = {
  schweiz: {
    id: 'schweiz',
    name: 'Schweiz (6 ist die beste Note)',
    min: 1,
    max: 6,
    bestanden: 4,
    hochIstBesser: true,
  },
  deutschland: {
    id: 'deutschland',
    name: 'Deutschland (1 ist die beste Note)',
    min: 1,
    max: 6,
    bestanden: 4,
    hochIstBesser: false,
  },
}

export const STANDARD_SKALA: Skalenkennung = 'schweiz'

/**
 * Die Skala zu einer Id — unbekannte Werte fallen auf die Schweizer Skala.
 * Die Id ist `string` und nicht `Skalenkennung`, weil auf der Platte jeder
 * Wert liegen darf: `setzeSkala()` schreibt ungeprueft durch.
 */
export function holeSkala(id: string | undefined): Notenskala {
  return id === 'deutschland' ? SKALEN.deutschland : SKALEN.schweiz
}

/** Eine Note, bei der Wert und Gewicht schon geprueft sind. */
interface Gewichtete {
  wert: number
  gewicht: number
}

/** Die lesbaren Notenwerte einer Liste — ohne die unlesbaren. */
function werteVon(noten: readonly Rechennote[] | null | undefined): number[] {
  const werte: number[] = []
  for (const n of noten || []) {
    const wert = zahl(n.note)
    if (wert !== null) werte.push(wert)
  }
  return werte
}

/** Zahl aus Text: Komma und Punkt zaehlen beide (4,5 und 4.5). */
export function zahl(wert: unknown): number | null {
  if (typeof wert === 'number') return Number.isFinite(wert) ? wert : null
  if (typeof wert !== 'string') return null
  const sauber = wert.trim().replace(',', '.')
  if (!sauber) return null
  const n = Number(sauber)
  return Number.isFinite(n) ? n : null
}

export function istGueltigeNote(wert: unknown, skalaId: string = STANDARD_SKALA): boolean {
  const skala = holeSkala(skalaId)
  const n = zahl(wert)
  return n !== null && n >= skala.min && n <= skala.max
}

export function istBestanden(note: unknown, skalaId: string = STANDARD_SKALA): boolean {
  const skala = holeSkala(skalaId)
  const n = zahl(note)
  if (n === null) return false
  return skala.hochIstBesser ? n >= skala.bestanden : n <= skala.bestanden
}

/**
 * Gewichteter Durchschnitt. Jede Note darf ein Gewicht tragen
 * (Standard 1) — eine grosse Pruefung zaehlt so doppelt.
 * `null`, wenn es nichts zu rechnen gibt.
 */
export function durchschnitt(noten: readonly Rechennote[] | null | undefined): number | null {
  // `wert !== null` steht im Filter, der Pruefer traegt das aber nicht in die
  // Reduktion weiter. Die Zwischenform mit `Gewichtete` haelt fest, was der
  // Filter entschieden hat — ohne Typzusicherung.
  const gueltige: Gewichtete[] = []
  for (const n of noten || []) {
    const wert = zahl(n.note)
    const gewicht = zahl(n.gewicht) ?? 1
    if (wert !== null && gewicht > 0) gueltige.push({ wert, gewicht })
  }
  if (!gueltige.length) return null
  const summe = gueltige.reduce((s, n) => s + n.wert * n.gewicht, 0)
  const gewichte = gueltige.reduce((s, n) => s + n.gewicht, 0)
  return summe / gewichte
}

/**
 * Auf eine Stelle gerundet — so steht es auf jedem Zeugnis.
 *
 * Die beiden Signaturen sagen, was ohnehin gilt: eine Zahl hinein heisst eine
 * Zahl heraus, `null` gibt es nur fuer `null`. Ohne sie muesste jede Stelle,
 * die mit einer echten Zahl rechnet, das Ergebnis noch einmal auf `null`
 * pruefen — `trend()` tut genau das nicht.
 */
export function gerundet(wert: number, stellen?: number): number
export function gerundet(wert: number | null | undefined, stellen?: number): number | null
export function gerundet(wert: number | null | undefined, stellen = 1): number | null {
  if (wert === null || wert === undefined) return null
  const faktor = 10 ** stellen
  return Math.round(wert * faktor) / faktor
}

/** Zeugnisnote: auf halbe Noten gerundet (Schweizer Praxis). */
export function halbeNote(wert: number): number
export function halbeNote(wert: number | null | undefined): number | null
export function halbeNote(wert: number | null | undefined): number | null {
  if (wert === null || wert === undefined) return null
  return Math.round(wert * 2) / 2
}

/** Was `benoetigteNote()` ausrechnet. */
export interface Zielnote {
  note: number
  /** Liegt die noetige Note ueberhaupt noch in der Skala? */
  machbar: boolean
  schonErreicht: boolean
}

/**
 * „Was brauche ich in der naechsten Pruefung, um den Zielschnitt zu
 * erreichen?" Rechnet die noetige Note bei gegebenem Gewicht.
 */
export function benoetigteNote(
  noten: readonly Rechennote[] | null | undefined,
  zielSchnitt: unknown,
  gewicht: unknown = 1,
  skalaId: string = STANDARD_SKALA
): Zielnote | null {
  const skala = holeSkala(skalaId)
  const ziel = zahl(zielSchnitt)
  const g = zahl(gewicht) ?? 1
  if (ziel === null || g <= 0) return null

  const gueltige: Gewichtete[] = []
  for (const n of noten || []) {
    const wert = zahl(n.note)
    const g2 = zahl(n.gewicht) ?? 1
    if (wert !== null && g2 > 0) gueltige.push({ wert, gewicht: g2 })
  }
  const summe = gueltige.reduce((s, n) => s + n.wert * n.gewicht, 0)
  const gewichte = gueltige.reduce((s, n) => s + n.gewicht, 0)

  // (summe + note * g) / (gewichte + g) = ziel  →  nach note aufloesen
  const noetig = (ziel * (gewichte + g) - summe) / g
  const schnitt = gueltige.length ? summe / gewichte : null
  const schonErreicht =
    schnitt !== null && (skala.hochIstBesser ? schnitt >= ziel : schnitt <= ziel)
  const machbar = noetig >= skala.min && noetig <= skala.max

  return { note: noetig, machbar, schonErreicht }
}

/** Beste und schlechteste Note — richtungsabhaengig. */
export function besteNote(
  noten: readonly Rechennote[] | null | undefined,
  skalaId: string = STANDARD_SKALA
): number | null {
  const skala = holeSkala(skalaId)
  const werte = werteVon(noten)
  if (!werte.length) return null
  return skala.hochIstBesser ? Math.max(...werte) : Math.min(...werte)
}

export function schlechtesteNote(
  noten: readonly Rechennote[] | null | undefined,
  skalaId: string = STANDARD_SKALA
): number | null {
  const skala = holeSkala(skalaId)
  const werte = werteVon(noten)
  if (!werte.length) return null
  return skala.hochIstBesser ? Math.min(...werte) : Math.max(...werte)
}

/** Wohin es geht. `zuwenig`, solange es weniger als vier Noten sind. */
export type Notentrend = 'besser' | 'schlechter' | 'gleich' | 'zuwenig'

/**
 * Trend: die letzten drei Noten gegen die davor. Braucht mindestens vier
 * Noten — vorher ist jede Aussage geraten.
 */
export function trend(
  noten: readonly Rechennote[] | null | undefined,
  skalaId: string = STANDARD_SKALA
): Notentrend {
  const skala = holeSkala(skalaId)
  const sortiert = [...(noten || [])]
    .filter((n) => zahl(n.note) !== null)
    .sort((a, b) => String(a.datum || '').localeCompare(String(b.datum || '')))
  if (sortiert.length < 4) return 'zuwenig'
  const letzte = sortiert.slice(-3)
  const davor = sortiert.slice(0, -3)
  const a = durchschnitt(davor)
  const b = durchschnitt(letzte)
  if (a === null || b === null) return 'zuwenig'
  const unterschied = gerundet(b - a, 2)
  if (Math.abs(unterschied) < 0.1) return 'gleich'
  const hoeher = unterschied > 0
  return hoeher === skala.hochIstBesser ? 'besser' : 'schlechter'
}

/** Tage bis zu einem Datum (JJJJ-MM-TT) — negativ heisst vorbei. */
export function tageBis(datum: string | null | undefined, heute: string): number | null {
  if (!datum) return null
  const ziel = new Date(`${datum}T00:00:00`)
  if (Number.isNaN(ziel.getTime())) return null
  const start = new Date(`${heute}T00:00:00`)
  if (Number.isNaN(start.getTime())) return null
  return Math.round((ziel.getTime() - start.getTime()) / 86400000)
}
