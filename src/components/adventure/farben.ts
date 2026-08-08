// Die Farbmathematik der Abenteuer-Landschaften.
//
// Bewusst getrennt von `Landscape.tsx`: Node laedt keine `.tsx`
// (`--experimental-strip-types` entfernt Typen, transformiert aber kein JSX),
// ein Test koennte diese Funktionen dort also gar nicht importieren. Hier
// stehen sie in einer `.ts` und sind in `test/landschaftsfarben.test.js`
// geprueft — dasselbe Muster wie bei `icons/iconPfade.ts`.
//
// Warum das ueberhaupt Pruefung braucht: `loeseFarbe()` bekommt Werte aus den
// Weltdaten (`courseRepository`), und die sind CSS-Tokens wie
// `var(--rk-kurd-green)`. Fuer Verlaeufe und Mischungen brauchen wir Zahlen.
// Faellt die Aufloesung still auf den Ersatzwert zurueck, sehen alle Welten
// gleich aus — und niemand merkt es, weil ein Bild ja erscheint.

/* ---------- Farbhilfen ---------- */

/**
 * Hex nach RGB. Der Rueckfall `[37, 139, 87]` ist das Kurdisch-Gruen: bei
 * unlesbarer Eingabe soll eine Landschaft in der Hausfarbe erscheinen, nicht
 * schwarz und nicht `NaN`.
 */
export function zuRgb(hex: string): [number, number, number] {
  const roh = String(hex || '')
    .trim()
    .replace('#', '')
  const voll =
    roh.length === 3
      ? roh
          .split('')
          .map((z) => z + z)
          .join('')
      : roh
  if (!/^[0-9a-fA-F]{6}$/.test(voll)) return [37, 139, 87]
  const zahl = parseInt(voll, 16)
  return [(zahl >> 16) & 255, (zahl >> 8) & 255, zahl & 255]
}

/** Zwei Farben mischen; `anteil` 0 = ganz die erste, 1 = ganz die zweite. */
export function mische(hex: string, zielHex: string, anteil: number): string {
  const a = zuRgb(hex)
  const b = zuRgb(zielHex)
  // Ausserhalb von 0..1 waere das Ergebnis keine Mischung mehr, sondern eine
  // Extrapolation — und bei NaN gaebe es „#NaNNaNNaN".
  const t = Number.isFinite(anteil) ? Math.max(0, Math.min(1, anteil)) : 0
  return (
    '#' +
    a
      .map((wert, i) => Math.round(wert + ((b[i] ?? wert) - wert) * t)
        .toString(16)
        .padStart(2, '0'))
      .join('')
  )
}

export const heller = (hex: string, anteil: number): string => mische(hex, '#ffffff', anteil)
export const dunkler = (hex: string, anteil: number): string => mische(hex, '#000000', anteil)

/**
 * Die kurdische Farbwelt als Hex — Spiegel der Tokens aus tokens.css.
 * Flächen dürfen `var(--…)` tragen; für berechnete Kanten, Fugen und Schatten
 * brauchen wir die Werte aber als Zahl.
 */
export const TOKEN = {
  nacht: '#081c24',
  fels: '#31454b',
  tuerkis: '#00aeb3',
  gold: '#e8b83e',
  kelim: '#b72d32',
  gruen: '#258b57',
  erde: '#8a5835',
  pergament: '#f3e4bd',
  creme: '#fffaf0',
  granat: '#9e2233',
  mohn: '#c62f2a',
  orange: '#d9822b',
  himmel: '#7fc4de',
}

/** Die Welten geben ihre Farbe als Token an — hier wird daraus ein Hex. */
const TOKEN_HEX: Readonly<Record<string, string>> = {
  '--rk-night': TOKEN.nacht,
  '--rk-stone': TOKEN.fels,
  '--rk-turquoise': TOKEN.tuerkis,
  '--rk-gold': TOKEN.gold,
  '--rk-kelim-red': TOKEN.kelim,
  '--rk-kurd-green': TOKEN.gruen,
  '--rk-earth': TOKEN.erde,
  '--rk-parchment': TOKEN.pergament,
  '--rk-cream': TOKEN.creme,
  '--adv-teal': TOKEN.tuerkis,
  '--adv-gold': TOKEN.gold,
  '--adv-green': TOKEN.gruen,
  '--adv-red': TOKEN.kelim,
  '--adv-earth': TOKEN.erde,
  '--adv-granat': TOKEN.granat,
  '--adv-poppy': TOKEN.mohn,
  '--adv-orange': TOKEN.orange,
  '--adv-sky': TOKEN.himmel,
  '--adv-blue': '#3f9fc4',
  '--adv-purple': '#7b5ea8',
}

/**
 * Einen Wert aus den Weltdaten in Hex aufloesen. Erlaubt sind ein
 * `var(--token)` aus der Tabelle oben und ein Hex-Wert; alles andere ergibt
 * den Ersatzwert.
 */
export function loeseFarbe(wert: string, ersatz: string): string {
  const text = String(wert || '').trim()
  const treffer = text.match(/^var\(\s*(--[\w-]+)/)
  const name = treffer?.[1]
  if (name) return TOKEN_HEX[name] || ersatz
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text) ? text : ersatz
}
