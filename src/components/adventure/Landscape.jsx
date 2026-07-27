// Gezeichnete Landschaften für den Abenteuer-Modus.
// Jede Welt bekommt eine eigene Szene aus gestaffelten Ebenen: Himmel, ferne
// Schneeberge, Mittelgrund, Vordergrund. Alle Motive sind kurdisch — Kela
// (Zitadelle auf dem Siedlungshügel), Bergdorfhäuser mit Flachdach, Balkenköpfen
// und Aussentreppe, Basarstände unter Kelim-Planen, Steinbogenbrücke,
// Newroz-Feuer mit Govend-Reihe, Mandelblüte, Granatapfel, Mohnfeld,
// Kupfertablett mit Istikan, Schafherde, Zagros-Hänge.
// Bewusst nicht enthalten: europäische Burgen mit Zinnen, Spitztürmen oder
// Fantasy-Inseln, Kuppel- oder Minarett-Silhouetten.
// Rein dekorativ (aria-hidden) — alle Informationen stehen im Text daneben.
import { useId } from 'react'

/* ---------- Farbhilfen ---------- */

function zuRgb(hex) {
  const roh = String(hex || '').trim().replace('#', '')
  const voll = roh.length === 3 ? roh.split('').map((z) => z + z).join('') : roh
  if (!/^[0-9a-fA-F]{6}$/.test(voll)) return [37, 139, 87]
  const zahl = parseInt(voll, 16)
  return [(zahl >> 16) & 255, (zahl >> 8) & 255, zahl & 255]
}

function mische(hex, zielHex, anteil) {
  const a = zuRgb(hex)
  const b = zuRgb(zielHex)
  const t = Math.max(0, Math.min(1, anteil))
  return '#' + a.map((w, i) => Math.round(w + (b[i] - w) * t).toString(16).padStart(2, '0')).join('')
}

const heller = (hex, anteil) => mische(hex, '#ffffff', anteil)
const dunkler = (hex, anteil) => mische(hex, '#000000', anteil)

/**
 * Die kurdische Farbwelt als Hex — Spiegel der Tokens aus tokens.css.
 * Flächen dürfen `var(--…)` tragen; für berechnete Kanten, Fugen und Schatten
 * brauchen wir die Werte aber als Zahl.
 */
const TOKEN = {
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
const TOKEN_HEX = {
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

function loeseFarbe(wert, ersatz) {
  const text = String(wert || '').trim()
  const treffer = text.match(/^var\(\s*(--[\w-]+)/)
  if (treffer) return TOKEN_HEX[treffer[1]] || ersatz
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text) ? text : ersatz
}

/* ---------- Abgeleitete Materialfarben ---------- */

const KALKSTEIN = mische(TOKEN.pergament, TOKEN.erde, 0.2)
const KALKSTEIN_KANTE = mische(TOKEN.erde, TOKEN.nacht, 0.16)
const HOLZ = dunkler(TOKEN.erde, 0.3)
const KUPFER = mische(TOKEN.erde, TOKEN.gold, 0.4)
const LAUB = dunkler(TOKEN.gruen, 0.3)
const LAUB_HELL = heller(TOKEN.gruen, 0.14)
const WASSER = mische(TOKEN.tuerkis, TOKEN.himmel, 0.45)
const PFLASTER = mische(TOKEN.pergament, TOKEN.erde, 0.4)
const TEE = mische(TOKEN.kelim, TOKEN.erde, 0.45)
const SCHATTEN = dunkler(TOKEN.erde, 0.55)

/* ---------- Bausteine ---------- */

function Wolken({ opazitaet = 0.7 }) {
  return (
    <g fill="#ffffff" opacity={opazitaet}>
      <ellipse cx="68" cy="28" rx="26" ry="9" />
      <ellipse cx="86" cy="24" rx="17" ry="7.5" />
      <ellipse cx="214" cy="18" rx="20" ry="7" />
      <ellipse cx="230" cy="15" rx="12" ry="5.5" />
    </g>
  )
}

/** Sternenhimmel für die Newroz-Nacht. */
function Sternenhimmel() {
  const punkte = [
    [34, 24], [72, 40], [110, 18], [148, 46], [186, 22], [224, 38],
    [262, 16], [300, 44], [338, 26], [376, 48], [58, 66], [286, 70],
  ]
  return (
    <g>
      <g fill={TOKEN.pergament} opacity=".8">
        {punkte.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={i % 3 === 0 ? 1.6 : 1.1} />
        ))}
      </g>
      <g fill={TOKEN.gold} opacity=".9">
        {[[92, 32], [244, 54], [330, 62]].map(([px, py], i) => (
          <path
            key={i}
            d={`M${px} ${py - 5} L${px + 1.6} ${py - 1.6} L${px + 5} ${py} L${px + 1.6} ${py + 1.6} L${px} ${py + 5} L${px - 1.6} ${py + 1.6} L${px - 5} ${py} L${px - 1.6} ${py - 1.6} Z`}
          />
        ))}
      </g>
    </g>
  )
}

/** Ferne Bergkette mit Schneekappen — das Rückgrat fast jeder Szene. */
function Schneeberge({ farbe, y = 0 }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <path
        d="M-10 98 L48 40 L86 76 L130 26 L188 86 L232 52 L288 98 L342 42 L410 96 L410 150 L-10 150 Z"
        fill={farbe}
      />
      <path d="M130 26 L112 46 L122 50 L132 43 L143 52 L153 45 Z" fill="#ffffff" opacity=".94" />
      <path d="M342 42 L327 60 L337 63 L345 55 L354 64 L362 57 Z" fill="#ffffff" opacity=".94" />
      <path d="M48 40 L35 55 L45 58 L52 51 L61 59 L68 53 Z" fill="#ffffff" opacity=".88" />
      <path
        d="M-10 98 L48 40 L86 76 L130 26 L188 86 L232 52 L288 98 L342 42 L410 96"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
        opacity=".3"
      />
    </g>
  )
}

/**
 * Kurdische Steinsiedlung: flachgedeckte Häuser aus hellem Kalkstein,
 * gestaffelt am Hang, mit Bogenfenstern, vorstehenden Holzbalken,
 * Aussentreppe und einem Kelim über der Brüstung.
 */
function Steindorf({ x = 240, y = 78, skala = 1, stein = KALKSTEIN, kante = KALKSTEIN_KANTE }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <g fill={stein} stroke={kante} strokeWidth="0.9">
        <rect x="0" y="28" width="28" height="28" rx="1" />
        <rect x="26" y="18" width="24" height="38" rx="1" />
        <rect x="48" y="32" width="32" height="24" rx="1" />
        <rect x="76" y="22" width="26" height="34" rx="1" />
        <rect x="100" y="36" width="24" height="20" rx="1" />
      </g>
      <g stroke={dunkler(kante, 0.25)} strokeWidth="1.6" strokeLinecap="round">
        <path d="M-2 28 h32 M24 18 h28 M46 32 h36 M74 22 h30 M98 36 h28" />
      </g>
      <g fill={SCHATTEN} opacity=".8">
        <path d="M6 38 a3.2 3.2 0 0 1 6.4 0 v8 H6 z" />
        <path d="M17 38 a3.2 3.2 0 0 1 6.4 0 v8 H17 z" />
        <path d="M32 28 a3.2 3.2 0 0 1 6.4 0 v8 H32 z" />
        <path d="M56 42 a3 3 0 0 1 6 0 v6 h-6 z" />
        <path d="M66 42 a3 3 0 0 1 6 0 v6 h-6 z" />
        <path d="M82 32 a3.2 3.2 0 0 1 6.4 0 v8 H82 z" />
        <path d="M106 44 a2.6 2.6 0 0 1 5.2 0 v5 h-5.2 z" />
      </g>
      {/* Kelim lüftet über der Brüstung */}
      <g>
        <path d="M78 22 h16 v12 l-8 3.2 l-8 -3.2 z" fill={TOKEN.kelim} />
        <g stroke={TOKEN.pergament} strokeWidth="1.1" opacity=".9">
          <path d="M78 26 h16 M78 30 h16" />
        </g>
      </g>
      <g stroke={kante} strokeWidth="1.2" fill="none">
        <path d="M50 56 l0 -4 l5 0 l0 -4 l5 0 l0 -4 l5 0" />
      </g>
    </g>
  )
}

/**
 * Einzelnes Bergdorfhaus: Steinmauern, Flachdach mit niedriger Brüstung,
 * vorstehende Holzbalken, Aussentreppe aufs Dach und ein Kelim, der über der
 * Brüstung hängt.
 */
function Bergdorfhaus({ x = 140, y = 100, skala = 1, stein = KALKSTEIN, kante = KALKSTEIN_KANTE }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      {/* Baukörper */}
      <rect x="0" y="14" width="78" height="48" fill={stein} stroke={kante} strokeWidth="1" />
      {/* Steinfugen */}
      <g stroke={kante} strokeWidth="0.6" opacity=".4" fill="none">
        <path d="M0 26 H78 M0 38 H78 M0 50 H78" />
        <path d="M14 14 v12 M40 14 v12 M64 14 v12 M6 26 v12 M28 26 v12 M54 26 v12 M70 26 v12 M18 50 v12 M62 50 v12" />
      </g>
      {/* Vorstehende Holzbalken unter der Dachplatte */}
      <g fill={HOLZ}>
        {[2, 16, 30, 44, 58, 70].map((bx) => (
          <rect key={bx} x={bx} y="14.5" width="5" height="4" rx="1" />
        ))}
        <rect x="-12" y="9" width="8" height="4" rx="1" />
        <rect x="82" y="9" width="8" height="4" rx="1" />
      </g>
      {/* Flachdach mit niedriger Brüstung — kein Giebel, kein Spitzdach */}
      <rect x="-7" y="8" width="92" height="7" fill={heller(stein, 0.12)} stroke={kante} strokeWidth="0.9" />
      <rect x="-3" y="0" width="84" height="9" fill={stein} stroke={kante} strokeWidth="0.9" />
      {/* Kelim über der Brüstung */}
      <g>
        <path d="M8 -1 h30 v23 l-7.5 3.4 l-7.5 -3.4 l-7.5 3.4 l-7.5 -3.4 z" fill={TOKEN.kelim} />
        <g stroke={TOKEN.pergament} strokeWidth="1.4" opacity=".92">
          <path d="M8 4 h30 M8 19 h30" />
        </g>
        <g fill={TOKEN.gold}>
          <path d="M16 12 l4 -3.6 l4 3.6 l-4 3.6 z" />
          <path d="M28 12 l4 -3.6 l4 3.6 l-4 3.6 z" />
        </g>
      </g>
      {/* Bogenfenster */}
      <g fill={SCHATTEN}>
        <path d="M10 36 a6 6 0 0 1 12 0 v13 H10 z" />
        <path d="M56 36 a6 6 0 0 1 12 0 v13 H56 z" />
      </g>
      <g fill="none" stroke={heller(stein, 0.3)} strokeWidth="1.4">
        <path d="M10 36 a6 6 0 0 1 12 0" />
        <path d="M56 36 a6 6 0 0 1 12 0" />
      </g>
      {/* Rundbogentür */}
      <path d="M32 62 v-14 a8 8 0 0 1 16 0 v14 z" fill={HOLZ} />
      <path d="M32 48 a8 8 0 0 1 16 0" fill="none" stroke={heller(stein, 0.3)} strokeWidth="1.6" />
      <path d="M40 62 v-12" stroke={dunkler(HOLZ, 0.3)} strokeWidth="1" />
      {/* Aussentreppe aufs Dach */}
      <path
        d="M78 20 H86 V30 H90 V40 H94 V50 H98 V62 H78 Z"
        fill={heller(stein, 0.05)}
        stroke={kante}
        strokeWidth="0.9"
      />
      <g stroke={kante} strokeWidth="0.7" opacity=".5" fill="none">
        <path d="M86 30 H90 M90 40 H94 M94 50 H98" />
      </g>
    </g>
  )
}

/**
 * Kela — die Zitadelle auf dem gewachsenen Siedlungshügel (Tell), wie in
 * Hewlêr. Oben stehen gestaffelte, flachgedeckte Lehm- und Steinhäuser, darum
 * läuft eine geschlossene Ringmauer aus Quadersteinen mit einem einfachen
 * Torbogen. Ohne Zinnenkranz, Spitztürmchen, Kuppel oder Minarett — das wäre
 * eine europäische Burg oder eine fremde Silhouette, keine Kela.
 */
function Kela({ x = 150, y = 60, skala = 1, stein = KALKSTEIN, kante = KALKSTEIN_KANTE }) {
  const haus = heller(stein, 0.07)
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      {/* Der Tell — Schicht auf Schicht gewachsener Siedlungshügel */}
      <path d="M-18 62 C -8 44, 4 30, 24 25 L 74 25 C 94 30, 106 44, 114 62 Z" fill={mische(TOKEN.erde, stein, 0.42)} />
      <g stroke={dunkler(TOKEN.erde, 0.25)} strokeWidth="0.9" fill="none" opacity=".4">
        <path d="M-11 55 C 8 47, 88 47, 107 55" />
        <path d="M-4 47 C 12 41, 84 41, 100 47" />
      </g>
      {/* Gestaffelte Häuser mit Flachdach auf der Kuppe */}
      <g fill={haus} stroke={kante} strokeWidth="0.8">
        <rect x="6" y="16" width="11" height="14" />
        <rect x="15" y="10" width="20" height="20" />
        <rect x="34" y="4" width="17" height="26" />
        <rect x="50" y="12" width="21" height="18" />
        <rect x="69" y="7" width="16" height="23" />
      </g>
      {/* Dachplatten und Balkenköpfe */}
      <g stroke={dunkler(kante, 0.15)} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 16 h15 M13 10 h24 M32 4 h21 M48 12 h25 M67 7 h20" />
      </g>
      <g fill={SCHATTEN} opacity=".85">
        <rect x="19" y="18" width="3.6" height="6" />
        <rect x="27" y="18" width="3.6" height="6" />
        <rect x="39" y="12" width="3.6" height="7" />
        <rect x="56" y="20" width="3.6" height="5" />
        <rect x="63" y="20" width="3.6" height="5" />
        <rect x="74" y="15" width="3.6" height="6" />
      </g>
      {/* Geschlossene Ringmauer aus Quadersteinen, leicht geböscht */}
      <path d="M-6 52 L2 28 L92 28 L100 52 Z" fill={stein} stroke={kante} strokeWidth="1" />
      <g stroke={kante} strokeWidth="0.7" opacity=".5" fill="none">
        <path d="M0 36 H94 M-2 44 H96" />
      </g>
      <g stroke={kante} strokeWidth="0.6" opacity=".45" fill="none">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`fuge-oben-${i}`} d={`M${8 + i * 11} 28 v8`} />
        ))}
      </g>
      <g stroke={kante} strokeWidth="0.6" opacity=".45" fill="none">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`fuge-unten-${i}`} d={`M${3 + i * 11} 36 v8`} />
        ))}
      </g>
      {/* Flaches Deckband statt Zinnen */}
      <path d="M1 28 H93 V25.5 H1 Z" fill={heller(stein, 0.18)} stroke={kante} strokeWidth="0.7" />
      {/* Einfacher Torbogen */}
      <path d="M40 52 v-11 a7 7 0 0 1 14 0 v11 z" fill={SCHATTEN} />
      <path d="M40 41 a7 7 0 0 1 14 0" fill="none" stroke={heller(stein, 0.32)} strokeWidth="2" />
      {/* Der Weg vom Tor den Hügel hinab */}
      <path
        d="M47 52 C 44 56, 34 60, 22 64"
        fill="none"
        stroke={mische(stein, TOKEN.erde, 0.3)}
        strokeWidth="3.6"
        strokeLinecap="round"
        opacity=".8"
      />
    </g>
  )
}

/**
 * Steinbogenbrücke über den Fluss — Hauptbogen und zwei Nebenbögen.
 * Die Bogenöffnungen liegen im Schatten, damit sie auch über dem Ufer
 * und nicht nur über dem Wasser stimmig wirken.
 */
function Bogenbruecke({
  x = 150,
  y = 150,
  skala = 1,
  stein = KALKSTEIN,
  kante = KALKSTEIN_KANTE,
  wasser = mische(WASSER, SCHATTEN, 0.42),
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path d="M0 18 q56 -32 112 0 v10 q-56 -27 -112 0 z" fill={stein} stroke={kante} strokeWidth="0.9" />
      <path d="M0 18 q56 -32 112 0" fill="none" stroke={heller(stein, 0.28)} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 29 a24 23 0 0 1 48 0 z" fill={wasser} />
      <path d="M4 30 a12 12 0 0 1 24 0 z" fill={wasser} />
      <path d="M84 30 a12 12 0 0 1 24 0 z" fill={wasser} />
      <g fill="none" stroke={kante} strokeWidth="1">
        <path d="M32 29 a24 23 0 0 1 48 0" />
        <path d="M4 30 a12 12 0 0 1 24 0" />
        <path d="M84 30 a12 12 0 0 1 24 0" />
      </g>
      {/* Quaderfugen im Bogenring */}
      <g stroke={kante} strokeWidth="0.6" opacity=".5" fill="none">
        <path d="M36 18 l-4 -3 M46 10 l-2 -4 M56 8 v-4 M66 10 l2 -4 M76 18 l4 -3" />
      </g>
    </g>
  )
}

function Fluss({ farbe = WASSER }) {
  const d =
    'M-10 178 C 60 162, 92 150, 152 142 C 212 134, 252 120, 302 104 C 342 92, 380 86, 410 84'
  return (
    <g>
      <path d={d} fill="none" stroke={farbe} strokeWidth="11" strokeLinecap="round" opacity=".88" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity=".36" />
    </g>
  )
}

/** Mandelbaum in Blüte — der kurdische Frühling. */
function Mandelbaum({ x = 40, y = 130, skala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path
        d="M0 40 C -2 24, -6 18, -12 10 M0 40 C 2 22, 8 16, 16 8 M0 40 V 14"
        stroke={HOLZ}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
      <g fill="#f3bfcd">
        <circle cx="-14" cy="8" r="11" />
        <circle cx="2" cy="-2" r="13" />
        <circle cx="18" cy="6" r="10" />
        <circle cx="6" cy="12" r="9" />
      </g>
      <g fill={TOKEN.creme} opacity=".72">
        <circle cx="-10" cy="4" r="2.2" />
        <circle cx="6" cy="-6" r="2.4" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="0" cy="10" r="1.8" />
      </g>
    </g>
  )
}

/** Granatapfelbaum — dunkelgrüne Krone, im Herbst voller roter Früchte. */
function Granatapfelbaum({ x = 60, y = 130, skala = 1 }) {
  const fruechte = [
    [-11, 8],
    [4, 2],
    [15, 9],
    [-2, 14],
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path
        d="M0 42 V16 M0 26 C -6 20, -10 14, -14 6 M0 22 C 6 16, 11 12, 16 4"
        stroke={HOLZ}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <g fill={LAUB}>
        <circle cx="-13" cy="4" r="12" />
        <circle cx="3" cy="-5" r="14" />
        <circle cx="18" cy="3" r="11" />
        <circle cx="4" cy="9" r="10" />
      </g>
      <g fill={LAUB_HELL} opacity=".5">
        <circle cx="-9" cy="-2" r="4.6" />
        <circle cx="9" cy="-10" r="5" />
        <circle cx="15" cy="4" r="3.6" />
      </g>
      {/* Die Früchte mit ihrer typischen Krone */}
      <g fill="var(--adv-granat)">
        {fruechte.map(([fx, fy], i) => (
          <g key={i}>
            <circle cx={fx} cy={fy} r="4.2" />
            <path d={`M${fx} ${fy - 4.2} l-1.8 -3 l1.8 1.2 l1.8 -1.2 z`} />
          </g>
        ))}
      </g>
      <g fill={heller(TOKEN.granat, 0.42)} opacity=".7">
        {fruechte.map(([fx, fy], i) => (
          <circle key={i} cx={fx - 1.2} cy={fy - 1.4} r="1.3" />
        ))}
      </g>
    </g>
  )
}

/** Mohnfeld — die roten Tupfer im Vordergrund. */
function Mohn({ punkte }) {
  return (
    <g>
      {punkte.map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M${x} ${y} v${(r || 3) + 5}`} stroke={dunkler(TOKEN.gruen, 0.15)} strokeWidth="1.2" />
          <circle cx={x} cy={y} r={r || 3} fill="var(--adv-poppy)" />
          <circle cx={x} cy={y} r={(r || 3) * 0.34} fill={dunkler(TOKEN.granat, 0.6)} />
        </g>
      ))}
    </g>
  )
}

/** Istikan — das schlanke Teeglas mit der typischen Taille. */
function Istikan({ x = 0, y = 0, skala = 1, farbe = TEE }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <ellipse cx="1.7" cy="8.6" rx="4.4" ry="1.5" fill={heller(KUPFER, 0.34)} />
      <path d="M0 0 q1.7 3 0 6 q1.7 2.6 3.4 0 q-1.7 -3 0 -6 z" fill={farbe} />
      <path d="M0 0 h3.4" stroke={heller(farbe, 0.45)} strokeWidth="0.9" />
    </g>
  )
}

/** Kelim mit Çay-Service — das Herzstück kurdischer Gastfreundschaft. */
function KelimMitCay({ x = 26, y = 152, skala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path d="M0 18 L54 6 L74 16 L20 30 Z" fill={TOKEN.kelim} />
      <path d="M0 18 L54 6 L74 16 L20 30 Z" fill="none" stroke={dunkler(TOKEN.kelim, 0.35)} strokeWidth="1.2" />
      <g stroke={TOKEN.pergament} strokeWidth="1.3" opacity=".9" fill="none">
        <path d="M6 18.5 L56 7.5" />
        <path d="M16 22 L66 11" />
      </g>
      <g fill={TOKEN.gold}>
        <path d="M22 17 l4 -3 l4 3 l-4 3 z" />
        <path d="M36 14 l4 -3 l4 3 l-4 3 z" />
        <path d="M50 11 l4 -3 l4 3 l-4 3 z" />
      </g>
      {/* Bauchige Kanne aus Kupfer */}
      <g>
        <path d="M30 4 q6 -8 12 0 v6 q-6 4 -12 0 z" fill={KUPFER} />
        <path d="M42 6 q5 1 4 5" stroke={dunkler(KUPFER, 0.25)} strokeWidth="1.4" fill="none" />
        <path d="M30 6 q-5 2 -3 5" stroke={dunkler(KUPFER, 0.25)} strokeWidth="1.4" fill="none" />
        <rect x="34" y="-2" width="4" height="3" rx="1" fill={dunkler(KUPFER, 0.25)} />
      </g>
      <Istikan x={15} y={12} />
      <Istikan x={23} y={10} />
    </g>
  )
}

/**
 * Kupfertablett mit bauchiger Kanne und zwei Istikan-Gläsern —
 * so wird in jedem Haus Tee gereicht.
 */
function Kupfertablett({ x = 300, y = 176, skala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      {/* Rundes Tablett */}
      <ellipse cx="0" cy="1" rx="32" ry="9.5" fill={dunkler(KUPFER, 0.32)} />
      <ellipse cx="0" cy="-2" rx="32" ry="9.5" fill={KUPFER} />
      <ellipse cx="0" cy="-2" rx="24" ry="6.4" fill="none" stroke={heller(KUPFER, 0.38)} strokeWidth="1.2" />
      <g fill={heller(KUPFER, 0.3)} opacity=".85">
        <path d="M-28 -2 l3 -2.4 l3 2.4 l-3 2.4 z" />
        <path d="M28 -2 l-3 -2.4 l-3 2.4 l3 2.4 z" />
      </g>
      {/* Bauchige Kanne */}
      <g>
        <path
          d="M-11 -8 C -15 -16, -13 -25, -3 -27 C 7 -25, 9 -16, 5 -8 Z"
          fill={KUPFER}
          stroke={dunkler(KUPFER, 0.3)}
          strokeWidth="0.9"
        />
        <path d="M-9 -20 C -7 -24, 1 -24, 3 -20.5" fill="none" stroke={heller(KUPFER, 0.4)} strokeWidth="1.4" />
        <path d="M-8 -27 h11" stroke={dunkler(KUPFER, 0.3)} strokeWidth="2" strokeLinecap="round" />
        <circle cx="-2.5" cy="-30" r="2" fill={dunkler(KUPFER, 0.2)} />
        <path d="M5 -20 q9 -1 10 -9" fill="none" stroke={KUPFER} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M-11 -21 q-8 3 -6 10" fill="none" stroke={KUPFER} strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* Zwei Istikan */}
      <Istikan x={12} y={-13} skala={1.1} />
      <Istikan x={21} y={-11} skala={1.1} />
    </g>
  )
}

/**
 * Basarstand: gestreifte Kelim-Plane über dem Gerüst, Theke mit Kelim-Behang,
 * Gewürzkegel, Körbe und ein hängender Kelim.
 */
function Basarstand({ x = 40, y = 180, skala = 1, planeA = TOKEN.kelim, planeB = TOKEN.pergament }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      {/* Pfosten */}
      <g fill={HOLZ}>
        <rect x="-2" y="-40" width="3.6" height="40" rx="1" />
        <rect x="58" y="-40" width="3.6" height="40" rx="1" />
      </g>
      {/* Gestreifte Kelim-Plane */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`plane-${i}`} d={`M${-6 + i * 9} -42 h9 l-1.4 11 h-6.2 z`} fill={i % 2 ? planeA : planeB} />
        ))}
      </g>
      <path d="M-7 -42 H 67" stroke={dunkler(HOLZ, 0.2)} strokeWidth="2.2" strokeLinecap="round" />
      {/* Zackenkante der Plane */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`zacke-${i}`} d={`M${-7.4 + i * 9} -31 l4.5 6 l4.5 -6 z`} fill={i % 2 ? planeB : planeA} />
        ))}
      </g>
      {/* Theke mit Kelim-Behang */}
      <rect
        x="0"
        y="-16"
        width="56"
        height="5"
        rx="1"
        fill={mische(HOLZ, TOKEN.pergament, 0.45)}
        stroke={dunkler(HOLZ, 0.2)}
        strokeWidth="0.8"
      />
      <rect x="0" y="-11" width="56" height="11" fill={planeA} />
      <g stroke={TOKEN.gold} strokeWidth="1.3" opacity=".85">
        <path d="M0 -8 H56 M0 -4 H56" />
      </g>
      {/* Gewürzkegel — Sumak, Kurkuma, Minze */}
      <g>
        <path d="M6 -16 l5 -9 l5 9 z" fill="var(--adv-granat)" />
        <path d="M20 -16 l5 -9 l5 9 z" fill={TOKEN.gold} />
        <path d="M34 -16 l5 -9 l5 9 z" fill={LAUB} />
        <path d="M46 -16 l4 -7 l4 7 z" fill={TOKEN.orange} />
      </g>
      {/* Körbe daneben */}
      <g fill={mische(TOKEN.erde, TOKEN.gold, 0.5)} stroke={dunkler(TOKEN.erde, 0.25)} strokeWidth="0.7">
        <path d="M-18 0 l2.6 -11 h13 l2.6 11 z" />
        <path d="M64 0 l2.2 -9 h11 l2.2 9 z" />
      </g>
      <g stroke={dunkler(TOKEN.erde, 0.2)} strokeWidth="0.7" opacity=".7" fill="none">
        <path d="M-16.6 -5 h15.2 M66 -4.5 h12.2" />
      </g>
      <g fill="var(--adv-granat)">
        <circle cx="-14" cy="-12" r="2.4" />
        <circle cx="-8.6" cy="-12.6" r="2.4" />
        <circle cx="-11.4" cy="-15" r="2.4" />
      </g>
      {/* Kelim hängt am Gerüst */}
      <g>
        <rect x="60" y="-30" width="16" height="22" fill={TOKEN.kelim} />
        <g stroke={TOKEN.pergament} strokeWidth="1.2">
          <path d="M60 -25 h16 M60 -13 h16" />
        </g>
        <path d="M64 -19 l4 -3.4 l4 3.4 l-4 3.4 z" fill={TOKEN.gold} />
      </g>
    </g>
  )
}

/** Menschen-Silhouetten — Leben auf Gasse und Platz. */
function Menschen({ punkte, farbe = SCHATTEN, opazitaet = 0.78 }) {
  return (
    <g fill={farbe} opacity={opazitaet}>
      {punkte.map(([x, y, h], i) => (
        <g key={i}>
          <circle cx={x} cy={y - h * 0.86} r={h * 0.15} />
          <path
            d={`M${x - h * 0.21} ${y} L${x - h * 0.14} ${y - h * 0.7} q${h * 0.14} ${h * 0.1} ${h * 0.28} 0 L${x + h * 0.21} ${y} Z`}
          />
        </g>
      ))}
    </g>
  )
}

/**
 * Govend — der Reihentanz: Silhouetten, die sich an den Händen halten,
 * der Vortänzer schwingt das Destmal.
 */
function Govend({ x = 100, y = 178, skala = 1, anzahl = 5, farbe = SCHATTEN, destmal = true }) {
  const leute = Array.from({ length: anzahl }, (_, i) => i)
  const abstand = 22
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <g fill={farbe}>
        {leute.map((i) => {
          const px = i * abstand
          const hoehe = i % 2 ? 28 : 31
          return (
            <g key={i}>
              <circle cx={px} cy={-hoehe} r="4.4" />
              <path d={`M${px - 6} 0 L${px - 4.4} ${-hoehe + 6} q4.4 3.2 8.8 0 L${px + 6} 0 Z`} />
            </g>
          )
        })}
      </g>
      {/* Beine im Tanzschritt */}
      <g stroke={farbe} strokeWidth="2.2" strokeLinecap="round" fill="none">
        {leute.map((i) => (
          <path key={i} d={`M${i * abstand - 2.5} 0 l-3.5 6 M${i * abstand + 2.5} 0 l4 5`} />
        ))}
      </g>
      {/* Die Hände fassen sich — die Reihe reisst nie ab */}
      <g stroke={farbe} strokeWidth="2.4" strokeLinecap="round" fill="none">
        {leute.slice(0, -1).map((i) => (
          <path key={i} d={`M${i * abstand + 5} -21 Q${i * abstand + 11} -29 ${(i + 1) * abstand - 5} -21`} />
        ))}
      </g>
      {/* Destmal — das Tuch des Vortänzers */}
      {destmal && <path d="M-6 -22 q-12 -8 -18 2 q8 -2 12 4 z" fill={TOKEN.gold} />}
    </g>
  )
}

/**
 * Newroz-Feuer — Symbol für Aufbruch, Frühling und jede gehaltene Serie:
 * drei Flammenzungen in Gold, Orange und Kelim-Rot, Funken darüber,
 * davor die Govend-Reihe.
 */
function NewrozFeuer({ x = 200, y = 168, skala = 1 }) {
  const funken = [
    [-22, -46, 2],
    [20, -56, 2.4],
    [8, -66, 1.6],
    [-12, -64, 1.8],
    [26, -38, 1.4],
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <ellipse cx="0" cy="2" rx="30" ry="8" fill={TOKEN.kelim} opacity=".35" />
      {/* Holzscheite */}
      <g stroke={HOLZ} strokeWidth="5" strokeLinecap="round">
        <path d="M-18 0 L14 -8" />
        <path d="M18 0 L-14 -8" />
        <path d="M-10 2 L12 2" />
      </g>
      {/* Drei Flammenzungen — aussen Kelim-Rot, dann Orange, innen Gold */}
      <path
        d="M0 -52 C 14 -36, 20 -26, 18 -14 C 16 -2, 8 4, 0 4 C -8 4, -16 -2, -18 -14 C -20 -26, -14 -36, 0 -52 Z"
        fill={TOKEN.kelim}
      />
      <path
        d="M0 -42 C 10 -30, 14 -22, 12 -12 C 10 -3, 5 2, 0 2 C -5 2, -10 -3, -12 -12 C -14 -22, -10 -30, 0 -42 Z"
        fill={TOKEN.orange}
      />
      <path
        d="M0 -28 C 6 -20, 8 -14, 7 -8 C 6 -2, 3 1, 0 1 C -3 1, -6 -2, -7 -8 C -8 -14, -6 -20, 0 -28 Z"
        fill={TOKEN.gold}
      />
      {/* Funken */}
      <g fill={TOKEN.gold} opacity=".85">
        {funken.map(([fx, fy, r], i) => (
          <circle key={i} cx={fx} cy={fy} r={r} />
        ))}
      </g>
      {/* Govend vor dem Feuer */}
      <Govend x={-62} y={14} skala={0.6} anzahl={3} farbe={dunkler(TOKEN.nacht, 0.15)} />
      <Govend x={22} y={14} skala={0.6} anzahl={3} farbe={dunkler(TOKEN.nacht, 0.15)} destmal={false} />
    </g>
  )
}

function Nadelwald({ punkte, farbe = LAUB_HELL, dunkelFarbe = LAUB }) {
  return (
    <g>
      {punkte.map(([x, y, h], i) => (
        <g key={i}>
          <rect x={x - 1.4} y={y} width="2.8" height={h * 0.28} fill={HOLZ} />
          <path
            d={`M${x} ${y - h} L${x + h * 0.42} ${y} L${x - h * 0.42} ${y} Z`}
            fill={i % 2 ? dunkelFarbe : farbe}
          />
          <path
            d={`M${x} ${y - h * 0.62} L${x + h * 0.32} ${y - h * 0.18} L${x - h * 0.32} ${y - h * 0.18} Z`}
            fill={i % 2 ? farbe : dunkelFarbe}
            opacity=".85"
          />
        </g>
      ))}
    </g>
  )
}

/** Verfallene Steinmauer — die alten Wege Kurdistans. */
function Ruine({ x = 320, y = 128, skala = 1, stein = mische(KALKSTEIN, TOKEN.erde, 0.14) }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${skala})`}
      fill={stein}
      stroke={dunkler(stein, 0.28)}
      strokeWidth="0.8"
    >
      <path d="M0 30 h8 v-16 h6 v16 h6 v-22 h7 v22 h9 v6 H0 Z" />
      <path d="M36 36 a10 12 0 0 1 20 0 v-2 a10 14 0 0 0 -20 0 z" />
      <rect x="52" y="18" width="6" height="18" />
    </g>
  )
}

/** Schafherde — der Alltag im Hochland. */
function Herde({ x = 60, y = 176, skala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <g fill={TOKEN.creme} stroke={mische(TOKEN.erde, TOKEN.pergament, 0.55)} strokeWidth="0.8">
        <ellipse cx="0" cy="0" rx="7" ry="5" />
        <ellipse cx="16" cy="3" rx="6" ry="4.4" />
        <ellipse cx="30" cy="-1" rx="6.5" ry="4.6" />
      </g>
      <g fill={HOLZ}>
        <circle cx="-6" cy="-2" r="2.4" />
        <circle cx="11" cy="1" r="2.2" />
        <circle cx="24" cy="-3" r="2.3" />
      </g>
      <g stroke={HOLZ} strokeWidth="1">
        <path d="M-2 5 v3 M3 5 v3 M14 7 v3 M19 7 v3 M28 4 v3 M33 4 v3" />
      </g>
    </g>
  )
}

/* ---------- Szenen ---------- */

const SZENEN = {
  /* Welt 1 — das Bergdorf am Fluss. */
  dorf: (f) => (
    <>
      <Wolken />
      <Schneeberge farbe={f.bergFern} y={-6} />
      <path d="M-10 120 Q 90 92, 190 116 T 410 104 L410 200 L-10 200 Z" fill={f.hangFern} />
      <Fluss />
      <Steindorf x={238} y={70} skala={0.92} />
      <Ruine x={336} y={116} skala={0.55} />
      <path d="M-10 148 Q 110 126, 220 150 T 410 138 L410 200 L-10 200 Z" fill={f.wiese} />
      <Mandelbaum x={44} y={126} skala={0.95} />
      <Granatapfelbaum x={132} y={132} skala={0.7} />
      <KelimMitCay x={10} y={160} skala={0.85} />
      <Mohn
        punkte={[
          [268, 168, 3.4],
          [286, 176, 3],
          [302, 166, 3.6],
          [322, 178, 3],
          [344, 170, 3.4],
          [366, 180, 3],
        ]}
      />
      <path d="M-10 186 Q 120 172, 250 188 T 410 178 L410 200 L-10 200 Z" fill={f.wieseDunkel} />
    </>
  ),

  /* Welt 2 — der Hof eines Familienhauses: Haus, Hofmauer, Granatapfel, Çay. */
  familienhaus: (f) => (
    <>
      <Wolken opazitaet={0.55} />
      <Schneeberge farbe={f.bergFern} y={6} />
      <path d="M-10 122 Q 100 108, 210 124 T 410 114 L410 200 L-10 200 Z" fill={f.hangFern} />
      <Steindorf x={272} y={62} skala={0.6} />
      <path d="M-10 148 Q 120 134, 250 152 T 410 142 L410 200 L-10 200 Z" fill={f.wiese} />
      {/* Das Haus der Familie steht gross im Vordergrund */}
      <Bergdorfhaus x={78} y={86} skala={1.08} />
      {/* Hofmauer aus Feldsteinen */}
      <g fill={mische(KALKSTEIN, TOKEN.erde, 0.12)} stroke={KALKSTEIN_KANTE} strokeWidth="0.8">
        {[196, 212, 228, 244, 260, 276].map((mx) => (
          <rect key={`mauer-unten-${mx}`} x={mx} y="150" width="15" height="10" rx="2" />
        ))}
        {[204, 220, 236, 252, 268].map((mx) => (
          <rect key={`mauer-oben-${mx}`} x={mx} y="141" width="15" height="10" rx="2" />
        ))}
      </g>
      <Granatapfelbaum x={330} y={112} skala={1} />
      <path d="M-10 180 Q 130 168, 260 184 T 410 174 L410 200 L-10 200 Z" fill={f.wieseDunkel} />
      {/* Der Tee steht schon bereit */}
      <Kupfertablett x={232} y={188} skala={0.95} />
      <Mohn punkte={[[24, 180, 3.4], [50, 190, 3], [172, 186, 3.2], [364, 184, 3.4]]} />
    </>
  ),

  /* Welt 3 — die Basargasse: Kelim-Planen, Gewürze, Menschen. */
  basar: (f) => (
    <>
      <Wolken opazitaet={0.4} />
      <Schneeberge farbe={f.bergFern} y={16} />
      <path d="M-10 118 Q 100 108, 210 120 T 410 112 L410 200 L-10 200 Z" fill={f.hangFern} />
      {/* Steinhäuser hinter den Ständen */}
      <Steindorf x={-14} y={54} skala={0.9} />
      <Steindorf x={220} y={62} skala={0.82} stein={mische(KALKSTEIN, TOKEN.erde, 0.14)} />
      {/* Tuchbahnen spannen sich über die Gasse */}
      <g>
        <path d="M40 118 Q 200 138, 360 114 L360 124 Q 200 148, 40 128 Z" fill={TOKEN.gold} opacity=".9" />
        <path d="M40 132 Q 200 152, 360 128 L360 136 Q 200 160, 40 140 Z" fill={TOKEN.kelim} opacity=".75" />
      </g>
      {/* Gepflasterte Gasse */}
      <path d="M-10 158 Q 130 148, 260 162 T 410 154 L410 200 L-10 200 Z" fill={PFLASTER} />
      <g stroke={mische(PFLASTER, TOKEN.erde, 0.35)} strokeWidth="1" opacity=".5" fill="none">
        <path d="M-10 176 H410 M-10 190 H410 M46 166 v34 M132 168 v32 M228 172 v28 M320 170 v30" />
      </g>
      <Basarstand x={12} y={184} skala={0.94} />
      <Menschen punkte={[[110, 186, 26], [124, 190, 21]]} />
      <Basarstand x={152} y={194} skala={1} planeA={TOKEN.gold} planeB={TOKEN.kelim} />
      <Menschen punkte={[[252, 186, 23], [264, 191, 27]]} />
      <Basarstand x={292} y={182} skala={0.86} planeA={TOKEN.gruen} planeB={TOKEN.pergament} />
    </>
  ),

  /* Welt 4 — die grosse Steinbogenbrücke über den Fluss. */
  bruecke: (f) => (
    <>
      <Wolken opazitaet={0.5} />
      <Schneeberge farbe={dunkler(f.bergFern, 0.14)} y={-14} />
      <Schneeberge farbe={f.bergFern} y={4} />
      <path d="M-10 122 Q 100 110, 210 124 T 410 114 L410 200 L-10 200 Z" fill={f.hangFern} />
      {/* Steindorf am Ufer */}
      <Steindorf x={254} y={64} skala={0.8} />
      <Steindorf x={330} y={92} skala={0.55} stein={mische(KALKSTEIN, TOKEN.erde, 0.14)} />
      <path d="M-10 146 Q 120 134, 250 152 T 410 142 L410 200 L-10 200 Z" fill={f.wiese} />
      {/* Der Fluss unter der Brücke */}
      <path d="M-10 164 Q 120 154, 260 168 T 410 158 L410 200 L-10 200 Z" fill={WASSER} />
      <g stroke={TOKEN.creme} strokeWidth="2" opacity=".38" fill="none" strokeLinecap="round">
        <path d="M20 186 q10 -4 20 0 t20 0" />
        <path d="M250 192 q10 -4 20 0 t20 0" />
        <path d="M322 178 q10 -4 20 0 t20 0" />
      </g>
      <Bogenbruecke x={70} y={132} skala={1.5} />
      {/* Weidenzweige am Ufer */}
      <g stroke={LAUB} strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M368 178 q-4 -20 2 -30" />
        <path d="M378 180 q2 -22 8 -32" />
      </g>
      <Granatapfelbaum x={30} y={126} skala={0.7} />
      <Mohn punkte={[[136, 190, 3.2], [166, 194, 3], [212, 188, 3.4]]} />
    </>
  ),

  /* Welt 5 — die Newroz-Nacht: Feuer, Govend, Fackelkette am Hang. */
  newroz: (f) => (
    <>
      {/* Newroz wird nachts gefeiert — der Himmel wird dunkel. Auf der hohen
          Karte bleibt der Talgrund nur gedämpft, damit der Weg sichtbar ist. */}
      <rect x="-10" y="-10" width="420" height="220" fill={TOKEN.nacht} opacity=".86" />
      {f.hoch && <rect x="-10" y="200" width="420" height="620" fill={TOKEN.nacht} opacity=".5" />}
      <Sternenhimmel />
      {/* Bergsilhouetten */}
      <path
        d="M-10 122 L52 62 L96 100 L150 52 L212 104 L262 66 L320 108 L378 70 L410 104 L410 200 L-10 200 Z"
        fill={mische(TOKEN.nacht, f.bergFern, 0.4)}
      />
      <path
        d="M-10 142 L60 98 L118 132 L182 94 L248 136 L312 100 L370 138 L410 120 L410 200 L-10 200 Z"
        fill={mische(TOKEN.nacht, f.bergFern, 0.18)}
      />
      {/* Fackelkette den Berghang hinauf — das Feuer wird weitergetragen */}
      <g>
        {[
          [44, 116],
          [78, 106],
          [116, 98],
          [156, 92],
        ].map(([fx, fy], i) => (
          <g key={i}>
            <path d={`M${fx} ${fy} v10`} stroke={HOLZ} strokeWidth="2" strokeLinecap="round" />
            <path d={`M${fx} ${fy - 8} q4 5 0 8 q-4 -3 0 -8 z`} fill={TOKEN.gold} />
          </g>
        ))}
      </g>
      {/* Der Festplatz */}
      <path d="M-10 156 Q 140 146, 280 162 T 410 154 L410 200 L-10 200 Z" fill={dunkler(f.wiese, 0.55)} />
      <ellipse cx="200" cy="176" rx="176" ry="28" fill={mische(TOKEN.nacht, PFLASTER, 0.35)} />
      {/* Der Schein des Feuers */}
      <ellipse cx="200" cy="166" rx="140" ry="46" fill={TOKEN.gold} opacity=".14" />
      <ellipse cx="200" cy="168" rx="82" ry="30" fill={TOKEN.orange} opacity=".2" />
      <NewrozFeuer x={200} y={166} skala={1.05} />
      {/* Weitere Reihen tanzen am Rand */}
      <Govend x={34} y={192} skala={0.76} anzahl={4} farbe={dunkler(TOKEN.nacht, 0.2)} />
      <Govend x={302} y={190} skala={0.72} anzahl={4} farbe={dunkler(TOKEN.nacht, 0.2)} destmal={false} />
    </>
  ),

  /* Welt 7 — die Kela auf dem Siedlungshügel. */
  kela: (f) => (
    <>
      <Wolken opazitaet={0.45} />
      <Schneeberge farbe={f.bergFern} y={12} />
      <Kela x={122} y={48} skala={1.35} />
      <path d="M-10 132 Q 100 124, 210 136 T 410 128 L410 200 L-10 200 Z" fill={f.hangFern} />
      {/* Die Unterstadt schmiegt sich an den Hügel */}
      <Steindorf x={-14} y={104} skala={0.78} />
      <Steindorf x={286} y={108} skala={0.82} stein={mische(KALKSTEIN, TOKEN.erde, 0.14)} />
      <Ruine x={356} y={138} skala={0.6} />
      <path d="M-10 166 Q 120 156, 260 170 T 410 160 L410 200 L-10 200 Z" fill={f.wiese} />
      {/* Der Weg hinauf zum Tor */}
      <path
        d="M170 134 C 154 156, 118 176, 48 200"
        fill="none"
        stroke={mische(PFLASTER, TOKEN.erde, 0.24)}
        strokeWidth="17"
        strokeLinecap="round"
        opacity=".8"
      />
      <path
        d="M170 134 C 154 156, 118 176, 48 200"
        fill="none"
        stroke={TOKEN.pergament}
        strokeWidth="11"
        strokeLinecap="round"
        opacity=".85"
      />
      <Granatapfelbaum x={228} y={150} skala={0.76} />
      <Mohn
        punkte={[
          [24, 172, 3.4],
          [50, 184, 3],
          [96, 192, 3.6],
          [286, 180, 3.2],
          [320, 192, 3],
          [352, 176, 3.4],
        ]}
      />
      <path d="M-10 194 Q 140 186, 280 198 T 410 190 L410 200 L-10 200 Z" fill={f.wieseDunkel} />
    </>
  ),

  felder: (f) => (
    <>
      <Wolken opazitaet={0.55} />
      <Schneeberge farbe={f.bergFern} y={4} />
      <path
        d="M-10 122 Q 100 106, 200 122 T 410 112 L410 200 L-10 200 Z"
        fill={mische(TOKEN.gold, TOKEN.erde, 0.28)}
      />
      <g stroke={mische(TOKEN.erde, TOKEN.gold, 0.42)} strokeWidth="2.2" opacity=".7" fill="none">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${-10 + i * 50} 200 Q ${10 + i * 50} 160, ${34 + i * 50} 126`} />
        ))}
      </g>
      <Steindorf x={268} y={62} skala={0.6} />
      <g fill={mische(TOKEN.gold, TOKEN.erde, 0.22)} stroke={dunkler(TOKEN.erde, 0.15)} strokeWidth="1">
        <ellipse cx="86" cy="164" rx="15" ry="12" />
        <ellipse cx="86" cy="164" rx="8" ry="6" fill="none" />
        <ellipse cx="150" cy="180" rx="12" ry="10" />
        <ellipse cx="150" cy="180" rx="6" ry="5" fill="none" />
      </g>
      <Mohn
        punkte={[
          [216, 172, 3.6],
          [238, 182, 3],
          [262, 170, 3.4],
          [292, 184, 3.6],
          [330, 174, 3],
          [364, 186, 3.4],
        ]}
      />
      <path
        d="M-10 190 Q 130 178, 260 192 T 410 182 L410 200 L-10 200 Z"
        fill={mische(TOKEN.gold, TOKEN.erde, 0.45)}
        opacity=".8"
      />
    </>
  ),

  stadt: (f) => (
    <>
      <Wolken opazitaet={0.5} />
      <Schneeberge farbe={f.bergFern} y={4} />
      <Kela x={222} y={68} skala={0.92} />
      <path d="M-10 130 Q 100 120, 210 132 T 410 124 L410 200 L-10 200 Z" fill={f.hangFern} />
      <Steindorf x={26} y={80} skala={1.02} />
      <Steindorf x={300} y={98} skala={0.66} stein={mische(KALKSTEIN, TOKEN.erde, 0.14)} />
      <path d="M-10 168 Q 120 160, 260 172 T 410 164 L410 200 L-10 200 Z" fill={WASSER} opacity=".85" />
      <Bogenbruecke x={124} y={146} skala={0.94} />
      <path d="M-10 188 Q 140 180, 280 192 T 410 184 L410 200 L-10 200 Z" fill={f.wiese} />
      <Kupfertablett x={318} y={194} skala={0.62} />
    </>
  ),

  see: (f) => (
    <>
      <Schneeberge farbe={f.bergFern} y={-2} />
      <path d="M-10 118 Q 110 104, 220 120 T 410 110 L410 150 L-10 150 Z" fill={f.wiese} />
      <path d="M-10 140 Q 120 130, 250 144 T 410 134 L410 200 L-10 200 Z" fill={WASSER} />
      <g stroke={TOKEN.creme} strokeWidth="2" opacity=".42" fill="none" strokeLinecap="round">
        <path d="M40 162 q10 -4 20 0 t20 0" />
        <path d="M180 176 q10 -4 20 0 t20 0" />
        <path d="M280 158 q10 -4 20 0 t20 0" />
        <path d="M110 188 q10 -4 20 0 t20 0" />
      </g>
      <g stroke={LAUB} strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M22 190 q-3 -18 1 -28" />
        <path d="M30 192 q2 -20 6 -30" />
        <path d="M38 190 q-2 -16 2 -24" />
      </g>
      <g fill={TOKEN.erde}>
        <ellipse cx="23" cy="160" rx="2.2" ry="5" />
        <ellipse cx="36" cy="160" rx="2.2" ry="5" />
      </g>
      <g>
        <path d="M280 172 q16 10 34 0 z" fill={TOKEN.erde} />
        <path d="M296 172 v-16 l14 12 z" fill={TOKEN.pergament} />
      </g>
      <Granatapfelbaum x={352} y={104} skala={0.68} />
    </>
  ),

  berge: (f) => (
    <>
      <Wolken opazitaet={0.5} />
      <Schneeberge farbe={dunkler(f.bergFern, 0.12)} y={-16} />
      <Schneeberge farbe={f.bergFern} y={6} />
      <path
        d="M-10 132 L60 74 L118 118 L176 66 L242 122 L300 82 L360 126 L410 96 L410 200 L-10 200 Z"
        fill={f.hangFern}
      />
      <path d="M176 66 L160 84 L170 88 L178 82 L188 90 L198 84 Z" fill="#ffffff" opacity=".9" />
      <Kela x={98} y={88} skala={0.54} />
      <path d="M-10 158 Q 110 142, 220 160 T 410 150 L410 200 L-10 200 Z" fill={f.wiese} />
      <Nadelwald
        punkte={[
          [36, 178, 26],
          [58, 184, 20],
          [82, 176, 24],
          [330, 180, 22],
          [356, 174, 26],
          [380, 184, 18],
        ]}
      />
      <Ruine x={196} y={152} skala={0.75} />
      <Herde x={244} y={186} skala={0.85} />
      <Mohn punkte={[[128, 182, 3.4], [152, 190, 3], [172, 180, 3.6]]} />
    </>
  ),

  wald: (f) => (
    <>
      <Wolken opazitaet={0.45} />
      <Schneeberge farbe={f.bergFern} y={10} />
      <path d="M-10 130 Q 100 116, 210 132 T 410 122 L410 200 L-10 200 Z" fill={f.wiese} />
      <Nadelwald
        punkte={[
          [24, 150, 34],
          [56, 146, 40],
          [92, 152, 30],
          [126, 148, 36],
          [300, 150, 32],
          [334, 144, 42],
          [372, 152, 30],
        ]}
      />
      <Mandelbaum x={200} y={118} skala={1.1} />
      <path d="M-10 168 Q 120 156, 250 170 T 410 160 L410 200 L-10 200 Z" fill={f.wieseDunkel} />
      <Nadelwald punkte={[[64, 190, 26], [140, 194, 22], [232, 190, 28], [286, 196, 20]]} />
      <Mohn punkte={[[164, 184, 3.4], [186, 192, 3], [258, 186, 3.4]]} />
    </>
  ),

  hochland: (f) => (
    <>
      <Schneeberge farbe={f.bergFern} y={-10} />
      {/* Adler über dem Hochland */}
      <g stroke={dunkler(TOKEN.erde, 0.35)} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7">
        <path d="M96 44 q10 -8 18 0 q8 -8 18 0" />
        <path d="M170 30 q7 -6 13 0 q6 -6 13 0" />
      </g>
      <path
        d="M-10 128 L110 118 L170 124 L260 112 L410 124 L410 200 L-10 200 Z"
        fill={mische(TOKEN.erde, TOKEN.pergament, 0.44)}
      />
      <Kela x={272} y={80} skala={0.62} />
      <path
        d="M-10 142 L120 134 L200 140 L300 130 L410 140 L410 200 L-10 200 Z"
        fill={mische(TOKEN.erde, TOKEN.pergament, 0.3)}
      />
      <g fill={mische(TOKEN.erde, TOKEN.fels, 0.4)} stroke={dunkler(TOKEN.erde, 0.3)} strokeWidth="0.8">
        <path d="M52 168 l14 -18 l16 18 z" />
        <path d="M74 172 l10 -12 l12 12 z" />
        <path d="M300 166 l16 -20 l18 20 z" />
      </g>
      <path
        d="M-10 182 Q 130 172, 270 186 T 410 176 L410 200 L-10 200 Z"
        fill={mische(TOKEN.gruen, TOKEN.erde, 0.42)}
      />
      <Herde x={120} y={186} skala={0.95} />
      <KelimMitCay x={210} y={172} skala={0.62} />
    </>
  ),
}

/**
 * Talgrund unterhalb der Szene — damit die hohe Kartenfläche gefüllt ist,
 * ohne die Landschaft zu strecken.
 */
function Talgrund({ f, art }) {
  const streu = [
    [34, 250, 3.4],
    [96, 286, 3],
    [312, 262, 3.6],
    [366, 300, 3],
    [58, 372, 3.2],
    [330, 388, 3.4],
    [148, 452, 3],
    [286, 470, 3.6],
    [46, 528, 3.2],
    [352, 546, 3],
    [122, 604, 3.4],
    [268, 628, 3],
  ]
  const weg = 'M96 176 C 40 240, 150 300, 104 372 C 60 442, 170 486, 118 566 C 74 636, 180 676, 130 780'
  return (
    <>
      <rect y="196" width="400" height="604" fill={f.wiese} />
      <path d="M-10 210 Q 120 232, 250 212 T 410 226 L410 300 L-10 300 Z" fill={f.wieseDunkel} opacity=".55" />
      <path d="M-10 340 Q 140 316, 268 342 T 410 326 L410 420 L-10 420 Z" fill={f.wieseDunkel} opacity=".4" />
      <path d="M-10 480 Q 110 460, 240 486 T 410 468 L410 560 L-10 560 Z" fill={f.wieseDunkel} opacity=".45" />
      <path d="M-10 630 Q 150 606, 280 634 T 410 616 L410 800 L-10 800 Z" fill={f.wieseDunkel} opacity=".55" />
      {/* Der Steinweg schlängelt sich durch das Tal — die Stationen liegen darauf. */}
      <path
        d={weg}
        fill="none"
        stroke={mische(PFLASTER, TOKEN.erde, 0.24)}
        strokeWidth="30"
        strokeLinecap="round"
        opacity=".55"
      />
      <path d={weg} fill="none" stroke={TOKEN.pergament} strokeWidth="22" strokeLinecap="round" opacity=".92" />
      <path
        d={weg}
        fill="none"
        stroke={mische(TOKEN.erde, TOKEN.gold, 0.35)}
        strokeWidth="2.4"
        strokeDasharray="10 12"
        strokeLinecap="round"
        opacity=".6"
      />
      {/* Streusteine am Wegrand */}
      <g fill={mische(f.wiese, TOKEN.fels, 0.55)} opacity=".55">
        <ellipse cx="196" cy="330" rx="9" ry="5" />
        <ellipse cx="336" cy="430" rx="11" ry="6" />
        <ellipse cx="228" cy="546" rx="8" ry="4.5" />
        <ellipse cx="300" cy="672" rx="10" ry="5.5" />
      </g>
      {/* Trockenmauer aus Feldsteinen */}
      <g fill={mische(f.wiese, KALKSTEIN, 0.75)} stroke={mische(f.wiese, KALKSTEIN_KANTE, 0.7)} strokeWidth="0.8">
        <rect x="256" y="238" width="14" height="9" rx="2" />
        <rect x="270" y="238" width="16" height="9" rx="2" />
        <rect x="286" y="238" width="13" height="9" rx="2" />
        <rect x="262" y="230" width="15" height="9" rx="2" />
        <rect x="278" y="230" width="15" height="9" rx="2" />
      </g>
      {art !== 'felder' && art !== 'hochland' && art !== 'basar' && (
        <>
          <Mandelbaum x={352} y={252} skala={0.62} />
          <Nadelwald punkte={[[30, 420, 30], [62, 432, 22], [368, 590, 28], [340, 604, 20]]} />
        </>
      )}
      {/* Granatapfelbäume und ein gedecktes Kupfertablett säumen den Weg */}
      <Granatapfelbaum x={44} y={266} skala={0.66} />
      <Granatapfelbaum x={332} y={708} skala={0.7} />
      <KelimMitCay x={278} y={352} skala={0.58} />
      <Kupfertablett x={300} y={532} skala={0.62} />
      <Herde x={64} y={664} skala={0.72} />
      <Mohn punkte={streu} />
    </>
  )
}

/**
 * @param {{art?:string, farbe?:string, himmel?:string, className?:string,
 *          format?:'band'|'karte'}} props
 * `band` ist das flache Kopfbild, `karte` die hohe Fläche der Weltkarte.
 */
export default function Landscape({
  art = 'dorf',
  farbe = 'var(--rk-kurd-green)',
  himmel = 'var(--adv-sky)',
  className = '',
  format = 'band',
}) {
  const id = useId().replace(/:/g, '')
  const Szene = SZENEN[art] || SZENEN.dorf
  const hoch = format === 'karte'
  // Die Welten liefern Tokens — für Verläufe und Mischungen brauchen wir Hex.
  const grund = loeseFarbe(farbe, TOKEN.gruen)
  const himmelFarbe = loeseFarbe(himmel, TOKEN.himmel)
  const wiese = mische(grund, '#8f8a4e', 0.22)
  const f = {
    bergFern: mische(himmelFarbe, '#5b5f6b', 0.52),
    hangFern: mische(grund, mische(TOKEN.erde, TOKEN.gruen, 0.45), 0.42),
    wiese,
    wieseDunkel: dunkler(wiese, 0.18),
    hoch,
  }

  return (
    <svg
      className={`landschaft ${className}`}
      viewBox={hoch ? '0 0 400 800' : '0 0 400 200'}
      preserveAspectRatio={hoch ? 'xMidYMin slice' : 'none'}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`himmel-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={himmelFarbe} />
          <stop offset="62%" stopColor={heller(himmelFarbe, 0.6)} />
          <stop offset="100%" stopColor={heller(grund, 0.7)} />
        </linearGradient>
      </defs>
      <rect width="400" height={hoch ? 800 : 200} fill={`url(#himmel-${id})`} />
      {hoch && <Talgrund f={f} art={art} />}
      <Szene {...f} />
    </svg>
  )
}

export {
  Kela,
  Steindorf,
  Bergdorfhaus,
  Mandelbaum,
  Granatapfelbaum,
  KelimMitCay,
  Kupfertablett,
  Basarstand,
  NewrozFeuer,
  Govend,
  Menschen,
  Schneeberge,
  Mohn,
  Bogenbruecke,
  Herde,
}
