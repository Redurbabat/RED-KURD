// Noten-Mathematik der Elektro-Lehre — reine Funktionen, keine Oberflaeche,
// kein Speicher. Alles hier ist testbar ohne Browser.
//
// Zwei Skalen, weil beide Laender vorkommen: In der Schweiz ist 6 die beste
// Note, in Deutschland die 1. Die Richtung steckt in `hochIstBesser` — jede
// Rechnung fragt die Skala, niemand raet.

export const SKALEN = {
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

export const STANDARD_SKALA = 'schweiz'

/** Die Skala zu einer Id — unbekannte Werte fallen auf die Schweizer Skala. */
export function holeSkala(id) {
  return SKALEN[id] || SKALEN[STANDARD_SKALA]
}

/** Zahl aus Text: Komma und Punkt zaehlen beide (4,5 und 4.5). */
export function zahl(wert) {
  if (typeof wert === 'number') return Number.isFinite(wert) ? wert : null
  if (typeof wert !== 'string') return null
  const sauber = wert.trim().replace(',', '.')
  if (!sauber) return null
  const n = Number(sauber)
  return Number.isFinite(n) ? n : null
}

export function istGueltigeNote(wert, skalaId = STANDARD_SKALA) {
  const skala = holeSkala(skalaId)
  const n = zahl(wert)
  return n !== null && n >= skala.min && n <= skala.max
}

export function istBestanden(note, skalaId = STANDARD_SKALA) {
  const skala = holeSkala(skalaId)
  const n = zahl(note)
  if (n === null) return false
  return skala.hochIstBesser ? n >= skala.bestanden : n <= skala.bestanden
}

/**
 * Gewichteter Durchschnitt. Jede Note darf ein Gewicht tragen
 * (Standard 1) — eine grosse Pruefung zaehlt so doppelt.
 * @returns {number|null} null, wenn es nichts zu rechnen gibt
 */
export function durchschnitt(noten) {
  const gueltige = (noten || [])
    .map((n) => ({ wert: zahl(n.note), gewicht: zahl(n.gewicht) ?? 1 }))
    .filter((n) => n.wert !== null && n.gewicht > 0)
  if (!gueltige.length) return null
  const summe = gueltige.reduce((s, n) => s + n.wert * n.gewicht, 0)
  const gewichte = gueltige.reduce((s, n) => s + n.gewicht, 0)
  return summe / gewichte
}

/** Auf eine Stelle gerundet — so steht es auf jedem Zeugnis. */
export function gerundet(wert, stellen = 1) {
  if (wert === null || wert === undefined) return null
  const faktor = 10 ** stellen
  return Math.round(wert * faktor) / faktor
}

/** Zeugnisnote: auf halbe Noten gerundet (Schweizer Praxis). */
export function halbeNote(wert) {
  if (wert === null || wert === undefined) return null
  return Math.round(wert * 2) / 2
}

/**
 * „Was brauche ich in der naechsten Pruefung, um den Zielschnitt zu
 * erreichen?" Rechnet die noetige Note bei gegebenem Gewicht.
 * @returns {{note:number, machbar:boolean, schonErreicht:boolean}|null}
 */
export function benoetigteNote(noten, zielSchnitt, gewicht = 1, skalaId = STANDARD_SKALA) {
  const skala = holeSkala(skalaId)
  const ziel = zahl(zielSchnitt)
  const g = zahl(gewicht) ?? 1
  if (ziel === null || g <= 0) return null

  const gueltige = (noten || [])
    .map((n) => ({ wert: zahl(n.note), gewicht: zahl(n.gewicht) ?? 1 }))
    .filter((n) => n.wert !== null && n.gewicht > 0)
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
export function besteNote(noten, skalaId = STANDARD_SKALA) {
  const skala = holeSkala(skalaId)
  const werte = (noten || []).map((n) => zahl(n.note)).filter((n) => n !== null)
  if (!werte.length) return null
  return skala.hochIstBesser ? Math.max(...werte) : Math.min(...werte)
}

export function schlechtesteNote(noten, skalaId = STANDARD_SKALA) {
  const skala = holeSkala(skalaId)
  const werte = (noten || []).map((n) => zahl(n.note)).filter((n) => n !== null)
  if (!werte.length) return null
  return skala.hochIstBesser ? Math.min(...werte) : Math.max(...werte)
}

/**
 * Trend: die letzten drei Noten gegen die davor. Braucht mindestens vier
 * Noten — vorher ist jede Aussage geraten.
 * @returns {'besser'|'schlechter'|'gleich'|'zuwenig'}
 */
export function trend(noten, skalaId = STANDARD_SKALA) {
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
export function tageBis(datum, heute) {
  if (!datum) return null
  const ziel = new Date(`${datum}T00:00:00`)
  if (Number.isNaN(ziel.getTime())) return null
  const start = new Date(`${heute}T00:00:00`)
  if (Number.isNaN(start.getTime())) return null
  return Math.round((ziel - start) / 86400000)
}
