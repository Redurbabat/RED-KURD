// Gezeichnete Landschaften für den Abenteuer-Modus.
// Jede Welt bekommt eine eigene Szene aus gestaffelten Ebenen: Himmel, ferne
// Schneeberge, Mittelgrund, Vordergrund. Die Motive sind kurdisch — Kela
// (Zitadelle) auf dem Felssporn, Steinhäuser mit Flachdach und Bogenfenstern,
// Steinbogenbrücke, Mandelblüte, Mohnfeld, Kelim mit Çay-Gläsern, Schafherde,
// Nadelwald der Zagros-Hänge.
// Rein dekorativ (aria-hidden) — alle Informationen stehen im Text daneben.
import { useId } from 'react'

/* ---------- Farbhilfen ---------- */

function zuRgb(hex) {
  const roh = String(hex || '').trim().replace('#', '')
  const voll = roh.length === 3 ? roh.split('').map((z) => z + z).join('') : roh
  if (!/^[0-9a-fA-F]{6}$/.test(voll)) return [85, 184, 90]
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
 * gestaffelt am Hang, mit Bogenfenstern, vorstehenden Holzbalken und
 * Aussentreppe.
 */
function Steindorf({ x = 240, y = 78, skala = 1, stein = '#dcc9a4', kante = '#b8a074' }) {
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
      <g fill={dunkler(kante, 0.35)} opacity=".8">
        <path d="M6 38 a3.2 3.2 0 0 1 6.4 0 v8 H6 z" />
        <path d="M17 38 a3.2 3.2 0 0 1 6.4 0 v8 H17 z" />
        <path d="M32 28 a3.2 3.2 0 0 1 6.4 0 v8 H32 z" />
        <path d="M56 42 a3 3 0 0 1 6 0 v6 h-6 z" />
        <path d="M66 42 a3 3 0 0 1 6 0 v6 h-6 z" />
        <path d="M82 32 a3.2 3.2 0 0 1 6.4 0 v8 H82 z" />
        <path d="M106 44 a2.6 2.6 0 0 1 5.2 0 v5 h-5.2 z" />
      </g>
      <g stroke={kante} strokeWidth="1.2" fill="none">
        <path d="M50 56 l0 -4 l5 0 l0 -4 l5 0 l0 -4 l5 0" />
      </g>
    </g>
  )
}

/**
 * Kela — die Zitadelle auf dem Felssporn, Wahrzeichen kurdischer Städte.
 * Runde Wehrtürme, Zinnenkranz, Tor mit Spitzbogen.
 */
function Kela({ x = 150, y = 60, skala = 1, stein = '#d3c09c', kante = '#a68f68' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path d="M-14 62 L4 34 L34 26 L74 30 L96 40 L108 62 Z" fill={dunkler(stein, 0.4)} />
      <path
        d="M-14 62 L4 34 L34 26 L74 30 L96 40 L108 62 Z"
        fill="none"
        stroke={dunkler(kante, 0.3)}
        strokeWidth="0.9"
      />
      <rect x="4" y="8" width="86" height="26" fill={stein} stroke={kante} strokeWidth="1" />
      <g fill={stein} stroke={kante} strokeWidth="0.8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={5 + i * 11} y="2" width="6.5" height="7" />
        ))}
      </g>
      <g fill={heller(stein, 0.12)} stroke={kante} strokeWidth="1">
        <rect x="-2" y="0" width="15" height="34" rx="2" />
        <rect x="82" y="-2" width="16" height="36" rx="2" />
      </g>
      <g fill={stein} stroke={kante} strokeWidth="0.8">
        <rect x="-4" y="-4" width="19" height="5" rx="1" />
        <rect x="80" y="-6" width="20" height="5" rx="1" />
      </g>
      <path d="M40 34 v-12 q7 -9 14 0 v12 z" fill={dunkler(kante, 0.45)} />
      <g fill={dunkler(kante, 0.45)}>
        <rect x="20" y="16" width="2.4" height="7" />
        <rect x="30" y="16" width="2.4" height="7" />
        <rect x="64" y="16" width="2.4" height="7" />
        <rect x="74" y="16" width="2.4" height="7" />
        <rect x="4" y="10" width="2.2" height="6" />
        <rect x="88" y="8" width="2.2" height="6" />
      </g>
    </g>
  )
}

/** Steinbogenbrücke über den Fluss. */
function Bogenbruecke({ x = 150, y = 150, skala = 1, stein = '#c1b090', kante = '#9b8a68' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path d="M0 16 q56 -30 112 0 v8 q-56 -24 -112 0 z" fill={stein} stroke={kante} strokeWidth="0.9" />
      <path d="M34 22 a22 20 0 0 1 44 0 z" fill="#7fb7d6" />
      <path d="M8 24 a12 11 0 0 1 24 0 z" fill="#7fb7d6" />
      <path d="M80 24 a12 11 0 0 1 24 0 z" fill="#7fb7d6" />
    </g>
  )
}

function Fluss({ farbe = '#7cc3e8' }) {
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
        stroke="#6b4a2f"
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
      <g fill="#ffffff" opacity=".72">
        <circle cx="-10" cy="4" r="2.2" />
        <circle cx="6" cy="-6" r="2.4" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="0" cy="10" r="1.8" />
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
          <path d={`M${x} ${y} v${(r || 3) + 5}`} stroke="#3f7a3a" strokeWidth="1.2" />
          <circle cx={x} cy={y} r={r || 3} fill="#dd4436" />
          <circle cx={x} cy={y} r={(r || 3) * 0.34} fill="#4a1410" />
        </g>
      ))}
    </g>
  )
}

/** Kelim mit Çay-Service — das Herzstück kurdischer Gastfreundschaft. */
function KelimMitCay({ x = 26, y = 152, skala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <path d="M0 18 L54 6 L74 16 L20 30 Z" fill="#b8473a" />
      <path d="M0 18 L54 6 L74 16 L20 30 Z" fill="none" stroke="#7d2c24" strokeWidth="1.2" />
      <g stroke="#f1d9a8" strokeWidth="1.3" opacity=".9" fill="none">
        <path d="M6 18.5 L56 7.5" />
        <path d="M16 22 L66 11" />
      </g>
      <g fill="#f4b942">
        <path d="M22 17 l4 -3 l4 3 l-4 3 z" />
        <path d="M36 14 l4 -3 l4 3 l-4 3 z" />
        <path d="M50 11 l4 -3 l4 3 l-4 3 z" />
      </g>
      <g>
        <path d="M30 4 q6 -8 12 0 v6 q-6 4 -12 0 z" fill="#c98a2e" />
        <path d="M42 6 q5 1 4 5" stroke="#a76d1c" strokeWidth="1.4" fill="none" />
        <path d="M30 6 q-5 2 -3 5" stroke="#a76d1c" strokeWidth="1.4" fill="none" />
        <rect x="34" y="-2" width="4" height="3" rx="1" fill="#a76d1c" />
      </g>
      {/* Istikan — Gläser mit schmaler Taille */}
      <g fill="#8b3a1a">
        <path d="M16 14 q1.6 3 0 6 q1.6 2 3.4 0 q-1.6 -3 0 -6 z" />
        <path d="M24 12 q1.6 3 0 6 q1.6 2 3.4 0 q-1.6 -3 0 -6 z" />
      </g>
    </g>
  )
}

function Nadelwald({ punkte, farbe = '#2f6b3d', dunkelFarbe = '#24532f' }) {
  return (
    <g>
      {punkte.map(([x, y, h], i) => (
        <g key={i}>
          <rect x={x - 1.4} y={y} width="2.8" height={h * 0.28} fill="#5a3f26" />
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
function Ruine({ x = 320, y = 128, skala = 1, stein = '#c3b394' }) {
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
      <g fill="#f4efe2" stroke="#cfc4ad" strokeWidth="0.8">
        <ellipse cx="0" cy="0" rx="7" ry="5" />
        <ellipse cx="16" cy="3" rx="6" ry="4.4" />
        <ellipse cx="30" cy="-1" rx="6.5" ry="4.6" />
      </g>
      <g fill="#6b5642">
        <circle cx="-6" cy="-2" r="2.4" />
        <circle cx="11" cy="1" r="2.2" />
        <circle cx="24" cy="-3" r="2.3" />
      </g>
      <g stroke="#6b5642" strokeWidth="1">
        <path d="M-2 5 v3 M3 5 v3 M14 7 v3 M19 7 v3 M28 4 v3 M33 4 v3" />
      </g>
    </g>
  )
}

/* ---------- Szenen ---------- */

const SZENEN = {
  dorf: (f) => (
    <>
      <Wolken />
      <Schneeberge farbe={f.bergFern} y={-6} />
      <path d="M-10 120 Q 90 92, 190 116 T 410 104 L410 200 L-10 200 Z" fill={f.hangFern} />
      <Fluss />
      <Steindorf x={238} y={70} skala={0.92} />
      <Ruine x={332} y={116} skala={0.55} />
      <path d="M-10 148 Q 110 126, 220 150 T 410 138 L410 200 L-10 200 Z" fill={f.wiese} />
      <Mandelbaum x={44} y={126} skala={0.95} />
      <KelimMitCay x={12} y={158} skala={0.85} />
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

  felder: (f) => (
    <>
      <Wolken opazitaet={0.55} />
      <Schneeberge farbe={f.bergFern} y={4} />
      <path d="M-10 122 Q 100 106, 200 122 T 410 112 L410 200 L-10 200 Z" fill="#e0c56a" />
      <g stroke="#c9a94c" strokeWidth="2.2" opacity=".75" fill="none">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${-10 + i * 50} 200 Q ${10 + i * 50} 160, ${34 + i * 50} 126`} />
        ))}
      </g>
      <Steindorf x={268} y={62} skala={0.6} stein="#e2d0aa" kante="#c2ab80" />
      <g fill="#d9b558" stroke="#b8933d" strokeWidth="1">
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
      <path d="M-10 190 Q 130 178, 260 192 T 410 182 L410 200 L-10 200 Z" fill="#c9a94c" opacity=".72" />
    </>
  ),

  stadt: (f) => (
    <>
      <Wolken opazitaet={0.5} />
      <Schneeberge farbe={f.bergFern} y={4} />
      <Kela x={228} y={54} skala={0.9} />
      <path d="M-10 130 Q 100 120, 210 132 T 410 124 L410 200 L-10 200 Z" fill={f.hangFern} />
      <Steindorf x={26} y={80} skala={1.02} />
      <Steindorf x={296} y={96} skala={0.7} stein="#cbb68e" kante="#a89066" />
      <path d="M-10 168 Q 120 160, 260 172 T 410 164 L410 200 L-10 200 Z" fill="#7fb7d6" opacity=".6" />
      <Bogenbruecke x={132} y={146} skala={0.92} />
      <path d="M-10 186 Q 140 178, 280 190 T 410 182 L410 200 L-10 200 Z" fill={f.wiese} />
      <KelimMitCay x={276} y={168} skala={0.66} />
    </>
  ),

  see: (f) => (
    <>
      <Schneeberge farbe={f.bergFern} y={-2} />
      <path d="M-10 118 Q 110 104, 220 120 T 410 110 L410 150 L-10 150 Z" fill={f.wiese} />
      <path d="M-10 140 Q 120 130, 250 144 T 410 134 L410 200 L-10 200 Z" fill="#5fa8cf" />
      <g stroke="#ffffff" strokeWidth="2" opacity=".42" fill="none" strokeLinecap="round">
        <path d="M40 162 q10 -4 20 0 t20 0" />
        <path d="M180 176 q10 -4 20 0 t20 0" />
        <path d="M280 158 q10 -4 20 0 t20 0" />
        <path d="M110 188 q10 -4 20 0 t20 0" />
      </g>
      <g stroke="#3f7a3a" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M22 190 q-3 -18 1 -28" />
        <path d="M30 192 q2 -20 6 -30" />
        <path d="M38 190 q-2 -16 2 -24" />
      </g>
      <g fill="#7a4b28">
        <ellipse cx="23" cy="160" rx="2.2" ry="5" />
        <ellipse cx="36" cy="160" rx="2.2" ry="5" />
      </g>
      <g>
        <path d="M280 172 q16 10 34 0 z" fill="#8a5a33" />
        <path d="M296 172 v-16 l14 12 z" fill="#f6efdd" />
      </g>
      <Mandelbaum x={356} y={124} skala={0.7} />
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
      <Kela x={104} y={92} skala={0.52} />
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
        farbe="#3c7a45"
        dunkelFarbe="#2d6137"
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
      <g stroke="#5c4a3a" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7">
        <path d="M96 44 q10 -8 18 0 q8 -8 18 0" />
        <path d="M170 30 q7 -6 13 0 q6 -6 13 0" />
      </g>
      <path d="M-10 128 L110 118 L170 124 L260 112 L410 124 L410 200 L-10 200 Z" fill="#a08f6f" />
      <Kela x={276} y={70} skala={0.62} />
      <path d="M-10 142 L120 134 L200 140 L300 130 L410 140 L410 200 L-10 200 Z" fill="#8c7d60" />
      <g fill="#7a6d55" stroke="#645941" strokeWidth="0.8">
        <path d="M52 168 l14 -18 l16 18 z" />
        <path d="M74 172 l10 -12 l12 12 z" />
        <path d="M300 166 l16 -20 l18 20 z" />
      </g>
      <path d="M-10 182 Q 130 172, 270 186 T 410 176 L410 200 L-10 200 Z" fill="#6d8455" />
      <Herde x={120} y={186} skala={0.95} />
      <KelimMitCay x={216} y={172} skala={0.62} />
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
  return (
    <>
      <rect y="196" width="400" height="604" fill={f.wiese} />
      <path d="M-10 210 Q 120 232, 250 212 T 410 226 L410 300 L-10 300 Z" fill={f.wieseDunkel} opacity=".55" />
      <path d="M-10 340 Q 140 316, 268 342 T 410 326 L410 420 L-10 420 Z" fill={f.wieseDunkel} opacity=".4" />
      <path d="M-10 480 Q 110 460, 240 486 T 410 468 L410 560 L-10 560 Z" fill={f.wieseDunkel} opacity=".45" />
      <path d="M-10 630 Q 150 606, 280 634 T 410 616 L410 800 L-10 800 Z" fill={f.wieseDunkel} opacity=".55" />
      {/* Der Steinweg schlängelt sich durch das Tal — die Stationen liegen darauf. */}
      <path
        d="M96 176 C 40 240, 150 300, 104 372 C 60 442, 170 486, 118 566 C 74 636, 180 676, 130 780"
        fill="none"
        stroke="#c7ab74"
        strokeWidth="30"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M96 176 C 40 240, 150 300, 104 372 C 60 442, 170 486, 118 566 C 74 636, 180 676, 130 780"
        fill="none"
        stroke="#f4e6c4"
        strokeWidth="22"
        strokeLinecap="round"
        opacity=".92"
      />
      <path
        d="M96 176 C 40 240, 150 300, 104 372 C 60 442, 170 486, 118 566 C 74 636, 180 676, 130 780"
        fill="none"
        stroke="#c49f66"
        strokeWidth="2.4"
        strokeDasharray="10 12"
        strokeLinecap="round"
        opacity=".6"
      />
      {/* Streusteine am Wegrand */}
      <g fill={mische(f.wiese, '#8d8570', 0.62)} opacity=".6">
        <ellipse cx="196" cy="330" rx="9" ry="5" />
        <ellipse cx="336" cy="430" rx="11" ry="6" />
        <ellipse cx="228" cy="546" rx="8" ry="4.5" />
        <ellipse cx="300" cy="672" rx="10" ry="5.5" />
      </g>
      {/* Trockenmauer aus Feldsteinen */}
      <g fill={mische(f.wiese, '#a2937a', 0.72)} stroke={mische(f.wiese, '#6f6555', 0.75)} strokeWidth="0.8">
        <rect x="256" y="238" width="14" height="9" rx="2" />
        <rect x="270" y="238" width="16" height="9" rx="2" />
        <rect x="286" y="238" width="13" height="9" rx="2" />
        <rect x="262" y="230" width="15" height="9" rx="2" />
        <rect x="278" y="230" width="15" height="9" rx="2" />
      </g>
      {art !== 'felder' && art !== 'hochland' && (
        <>
          <Mandelbaum x={352} y={252} skala={0.62} />
          <Nadelwald punkte={[[30, 420, 30], [62, 432, 22], [368, 590, 28], [340, 604, 20]]} />
        </>
      )}
      <KelimMitCay x={278} y={352} skala={0.58} />
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
  farbe = '#55b85a',
  himmel = '#90d7f8',
  className = '',
  format = 'band',
}) {
  const id = useId().replace(/:/g, '')
  const Szene = SZENEN[art] || SZENEN.dorf
  const hoch = format === 'karte'
  const f = {
    bergFern: mische(himmel, '#4d6076', 0.5),
    hangFern: mische(farbe, '#6f8258', 0.4),
    wiese: farbe,
    wieseDunkel: dunkler(farbe, 0.18),
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
          <stop offset="0%" stopColor={himmel} />
          <stop offset="62%" stopColor={heller(himmel, 0.6)} />
          <stop offset="100%" stopColor={heller(farbe, 0.7)} />
        </linearGradient>
      </defs>
      <rect width="400" height={hoch ? 800 : 200} fill={`url(#himmel-${id})`} />
      {hoch && <Talgrund f={f} art={art} />}
      <Szene {...f} />
    </svg>
  )
}

export { Kela, Steindorf, Mandelbaum, KelimMitCay, Schneeberge, Mohn, Bogenbruecke, Herde }
