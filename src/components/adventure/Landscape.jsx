// Gezeichnete Landschaften für den Abenteuer-Modus. Jede Welt bekommt eine
// eigene Silhouette; Farbe und Himmel kommen aus den Welt-Daten, damit die
// Kachel, die Startseite und die Weltkarte zusammenpassen.
import { useId } from 'react'

function zuRgb(hex) {
  const roh = String(hex || '').trim().replace('#', '')
  const voll =
    roh.length === 3
      ? roh
          .split('')
          .map((zeichen) => zeichen + zeichen)
          .join('')
      : roh
  if (!/^[0-9a-fA-F]{6}$/.test(voll)) return [85, 184, 90]
  const zahl = parseInt(voll, 16)
  return [(zahl >> 16) & 255, (zahl >> 8) & 255, zahl & 255]
}

function mische(hex, zielHex, anteil) {
  const a = zuRgb(hex)
  const b = zuRgb(zielHex)
  const t = Math.max(0, Math.min(1, anteil))
  return (
    '#' +
    a
      .map((wert, i) => Math.round(wert + (b[i] - wert) * t).toString(16).padStart(2, '0'))
      .join('')
  )
}

const heller = (hex, anteil) => mische(hex, '#ffffff', anteil)
const dunkler = (hex, anteil) => mische(hex, '#000000', anteil)

/** Kurze Zahlen im Pfad — sonst entstehen lange Fliesskomma-Ketten. */
const z = (wert) => Math.round(wert * 10) / 10

function baueFarben(farbe, himmel) {
  return {
    himmelOben: himmel,
    himmelUnten: heller(himmel, 0.6),
    fern: heller(farbe, 0.52),
    mittel: heller(farbe, 0.2),
    basis: farbe,
    dunkel: dunkler(farbe, 0.24),
    tief: dunkler(farbe, 0.44),
    hell: heller(farbe, 0.85),
    wasser: mische(farbe, '#2596f3', 0.66),
    stein: mische(farbe, '#8b8f96', 0.62),
    holz: mische(farbe, '#7a4b28', 0.72),
    gold: mische(farbe, '#f4b942', 0.82),
  }
}

// ===== Bausteine =====

function Nadelbaum({ x, basis, hoehe, farbe, stamm }) {
  const b = hoehe * 0.4
  const d = [
    `M${z(x)} ${z(basis - hoehe)}`,
    `L${z(x + b * 0.58)} ${z(basis - hoehe * 0.56)}`,
    `L${z(x + b * 0.34)} ${z(basis - hoehe * 0.56)}`,
    `L${z(x + b * 0.82)} ${z(basis - hoehe * 0.28)}`,
    `L${z(x + b * 0.5)} ${z(basis - hoehe * 0.28)}`,
    `L${z(x + b)} ${z(basis - hoehe * 0.02)}`,
    `L${z(x - b)} ${z(basis - hoehe * 0.02)}`,
    `L${z(x - b * 0.5)} ${z(basis - hoehe * 0.28)}`,
    `L${z(x - b * 0.82)} ${z(basis - hoehe * 0.28)}`,
    `L${z(x - b * 0.34)} ${z(basis - hoehe * 0.56)}`,
    `L${z(x - b * 0.58)} ${z(basis - hoehe * 0.56)}`,
    'Z',
  ].join(' ')
  return (
    <g>
      <rect
        x={z(x - hoehe * 0.045)}
        y={z(basis - hoehe * 0.18)}
        width={z(hoehe * 0.09)}
        height={z(hoehe * 0.2)}
        fill={stamm}
      />
      <path d={d} fill={farbe} />
    </g>
  )
}

function Laubbaum({ x, basis, hoehe, farbe, stamm }) {
  const r = hoehe * 0.3
  return (
    <g>
      <rect
        x={z(x - hoehe * 0.05)}
        y={z(basis - hoehe * 0.46)}
        width={z(hoehe * 0.1)}
        height={z(hoehe * 0.48)}
        fill={stamm}
      />
      <circle cx={z(x - r * 0.78)} cy={z(basis - hoehe * 0.52)} r={z(r * 0.74)} fill={farbe} />
      <circle cx={z(x + r * 0.78)} cy={z(basis - hoehe * 0.54)} r={z(r * 0.7)} fill={farbe} />
      <circle cx={z(x)} cy={z(basis - hoehe * 0.7)} r={z(r)} fill={farbe} />
    </g>
  )
}

/** Schneekappe auf einem Berggipfel — unten gezackt wie eine Schneegrenze. */
function Schneekappe({ x, y, breite = 16, farbe }) {
  // Hoehe passt zur Steigung der Bergflanken, damit die Kappe im Gipfel bleibt.
  const w = breite / 2
  const h = breite * 0.62
  const d = [
    `M${z(x)} ${z(y)}`,
    `L${z(x + w)} ${z(y + h)}`,
    `L${z(x + w * 0.45)} ${z(y + h * 0.8)}`,
    `L${z(x + w * 0.1)} ${z(y + h * 1.08)}`,
    `L${z(x - w * 0.3)} ${z(y + h * 0.78)}`,
    `L${z(x - w * 0.62)} ${z(y + h * 1.02)}`,
    `L${z(x - w)} ${z(y + h)}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={farbe} />
}

// ===== Die sieben Landschaften =====

function Dorf({ p }) {
  return (
    <>
      <path
        d="M0 130 Q60 102 130 124 Q200 146 268 116 Q334 92 400 114 L400 200 L0 200 Z"
        fill={p.fern}
      />
      <path d="M0 156 Q80 132 170 152 Q262 172 400 142 L400 200 L0 200 Z" fill={p.mittel} />

      <g>
        <rect x="58" y="126" width="46" height="32" fill={p.hell} />
        <path d="M50 126 L81 100 L112 126 Z" fill={p.holz} />
        <rect x="74" y="142" width="14" height="16" fill={p.holz} />
      </g>
      <g>
        <rect x="132" y="134" width="38" height="26" fill={p.hell} />
        <path d="M124 134 L151 112 L178 134 Z" fill={p.holz} />
        <rect x="145" y="148" width="12" height="12" fill={p.holz} />
      </g>
      <g>
        <rect x="232" y="128" width="46" height="30" fill={p.hell} />
        <path d="M224 128 L255 103 L286 128 Z" fill={p.holz} />
        <rect x="248" y="142" width="14" height="16" fill={p.holz} />
        <rect x="236" y="134" width="10" height="10" fill={p.gold} />
      </g>

      <g>
        <rect x="330" y="130" width="9" height="30" fill={p.holz} />
        <circle cx="334" cy="124" r="21" fill={p.dunkel} />
        <circle cx="320" cy="134" r="14" fill={p.dunkel} />
        <circle cx="348" cy="133" r="13" fill={p.dunkel} />
      </g>

      <path d="M0 180 Q90 168 200 180 Q300 190 400 174 L400 200 L0 200 Z" fill={p.dunkel} />
    </>
  )
}

function Felder({ p }) {
  return (
    <>
      <circle cx="326" cy="46" r="30" fill={p.gold} opacity="0.35" />
      <circle cx="326" cy="46" r="19" fill={p.gold} />

      <path
        d="M0 112 Q70 92 150 108 Q240 126 320 100 Q362 88 400 100 L400 200 L0 200 Z"
        fill={p.fern}
      />
      <g fill={p.dunkel} opacity="0.55">
        <circle cx="42" cy="106" r="8" />
        <circle cx="62" cy="109" r="6" />
        <circle cx="118" cy="105" r="7" />
      </g>

      <rect x="0" y="118" width="400" height="82" fill={p.mittel} />
      <g fill={p.basis}>
        <path d="M10 118 H46 L10 200 H-80 Z" />
        <path d="M90 118 H126 L130 200 H40 Z" />
        <path d="M170 118 H206 L250 200 H160 Z" />
        <path d="M250 118 H286 L370 200 H280 Z" />
        <path d="M330 118 H366 L490 200 H400 Z" />
      </g>

      <g>
        <circle cx="88" cy="164" r="19" fill={p.gold} />
        <circle cx="88" cy="164" r="10" fill="none" stroke={p.holz} strokeWidth="3" opacity="0.6" />
        <circle cx="292" cy="148" r="13" fill={p.gold} />
        <circle cx="292" cy="148" r="7" fill="none" stroke={p.holz} strokeWidth="2.5" opacity="0.6" />
      </g>

      <path d="M0 186 Q140 176 400 188 L400 200 L0 200 Z" fill={p.dunkel} />
    </>
  )
}

function Stadt({ p }) {
  return (
    <>
      <g fill={p.fern}>
        <rect x="0" y="96" width="44" height="72" />
        <rect x="38" y="76" width="34" height="92" />
        <rect x="68" y="104" width="48" height="64" />
        <rect x="110" y="86" width="30" height="82" />
        <rect x="268" y="92" width="42" height="76" />
        <rect x="304" y="70" width="30" height="98" />
        <rect x="330" y="100" width="44" height="68" />
        <rect x="368" y="84" width="36" height="84" />
      </g>

      <g>
        <rect x="196" y="54" width="17" height="114" fill={p.hell} />
        <path d="M194 56 q10.5 -20 22 0 Z" fill={p.gold} />
        <path d="M205 18 L209 40 L201 40 Z" fill={p.gold} />
        <rect x="191" y="76" width="27" height="5" fill={p.holz} />
        <rect x="200" y="96" width="9" height="16" fill={p.holz} />
      </g>

      <g fill={p.basis}>
        <rect x="8" y="118" width="54" height="50" />
        <rect x="58" y="102" width="40" height="66" />
        <rect x="94" y="126" width="56" height="42" />
        <rect x="146" y="112" width="38" height="56" />
        <rect x="222" y="120" width="48" height="48" />
        <rect x="266" y="104" width="38" height="64" />
        <rect x="300" y="128" width="54" height="40" />
        <rect x="350" y="114" width="46" height="54" />
      </g>
      <g fill={p.gold} opacity="0.8">
        <rect x="18" y="128" width="9" height="11" />
        <rect x="36" y="128" width="9" height="11" />
        <rect x="18" y="148" width="9" height="11" />
        <rect x="68" y="114" width="9" height="11" />
        <rect x="82" y="134" width="9" height="11" />
        <rect x="106" y="136" width="9" height="11" />
        <rect x="126" y="136" width="9" height="11" />
        <rect x="156" y="124" width="9" height="11" />
        <rect x="232" y="130" width="9" height="11" />
        <rect x="250" y="130" width="9" height="11" />
        <rect x="276" y="116" width="9" height="11" />
        <rect x="312" y="138" width="9" height="11" />
        <rect x="332" y="138" width="9" height="11" />
        <rect x="360" y="126" width="9" height="11" />
      </g>

      <rect x="0" y="174" width="400" height="26" fill={p.wasser} />
      <g fill={p.stein}>
        <rect x="60" y="172" width="18" height="24" />
        <rect x="190" y="172" width="18" height="24" />
        <rect x="318" y="172" width="18" height="24" />
      </g>
      <rect x="0" y="164" width="400" height="10" fill={p.holz} />
      <path
        d="M20 154v11M68 154v11M116 154v11M164 154v11M212 154v11M260 154v11M308 154v11M356 154v11"
        fill="none"
        stroke={p.hell}
        strokeWidth="4"
      />
      <path
        d="M0 186 q30 -20 60 0M78 186 q56 -24 112 0M208 186 q55 -24 110 0M336 186 q32 -20 64 0"
        fill="none"
        stroke={p.stein}
        strokeWidth="5"
        opacity="0.75"
      />
    </>
  )
}

function See({ p }) {
  return (
    <>
      <path
        d="M0 118 Q60 88 130 110 Q200 132 262 104 Q332 76 400 108 L400 150 L0 150 Z"
        fill={p.fern}
      />
      <path d="M0 132 Q100 122 200 132 Q300 142 400 128 L400 150 L0 150 Z" fill={p.mittel} />
      <rect x="0" y="142" width="400" height="58" fill={p.wasser} />

      <g fill="none" stroke={p.hell} strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M22 158 q10 -5 20 0 t20 0" />
        <path d="M124 152 q10 -5 20 0 t20 0" />
        <path d="M252 162 q10 -5 20 0 t20 0" />
        <path d="M64 178 q10 -5 20 0 t20 0" />
        <path d="M192 186 q10 -5 20 0 t20 0" />
        <path d="M308 176 q10 -5 20 0 t20 0" />
      </g>

      <g>
        <path d="M226 168 h58 l-11 13 h-36 z" fill={p.holz} />
        <path d="M254 168 V136" fill="none" stroke={p.holz} strokeWidth="4" />
        <path d="M258 138 L282 164 H258 Z" fill={p.hell} />
      </g>

      <g fill="none" stroke={p.dunkel} strokeWidth="4" strokeLinecap="round">
        <path d="M30 200 q-4 -30 2 -46" />
        <path d="M44 200 q2 -28 10 -40" />
        <path d="M58 200 q-2 -24 -8 -36" />
      </g>
      <g fill={p.dunkel}>
        <ellipse cx="32" cy="146" rx="4.5" ry="10" />
        <ellipse cx="54" cy="152" rx="4.5" ry="10" />
        <ellipse cx="50" cy="156" rx="4" ry="9" />
      </g>
    </>
  )
}

function Berge({ p }) {
  return (
    <>
      <path
        d="M0 128 L58 70 L104 112 L164 48 L232 106 L296 58 L356 112 L400 84 L400 200 L0 200 Z"
        fill={p.fern}
      />
      <Schneekappe x={164} y={48} breite={17} farbe={p.hell} />
      <Schneekappe x={296} y={58} breite={15} farbe={p.hell} />

      <path
        d="M0 156 L48 114 L96 150 L152 100 L206 146 L268 104 L330 152 L400 122 L400 200 L0 200 Z"
        fill={p.basis}
      />
      <Schneekappe x={152} y={100} breite={16} farbe={p.hell} />
      <Schneekappe x={268} y={104} breite={15} farbe={p.hell} />

      <path
        d="M0 182 L64 142 L124 178 L192 134 L252 176 L324 148 L400 184 L400 200 L0 200 Z"
        fill={p.dunkel}
      />
      <Schneekappe x={192} y={134} breite={14} farbe={p.hell} />
    </>
  )
}

function Wald({ p }) {
  const hintereBaeume = [
    [24, 72],
    [62, 86],
    [100, 66],
    [140, 80],
    [182, 70],
    [222, 84],
    [262, 68],
    [302, 82],
    [342, 72],
    [382, 84],
  ]
  return (
    <>
      <path d="M0 122 Q100 102 200 120 Q300 138 400 112 L400 200 L0 200 Z" fill={p.fern} />

      {hintereBaeume.map(([x, h]) => (
        <Nadelbaum key={x} x={x} basis={148} hoehe={h} farbe={p.mittel} stamm={p.mittel} />
      ))}

      <path d="M0 144 Q120 134 240 146 Q322 154 400 140 L400 200 L0 200 Z" fill={p.basis} />

      <Nadelbaum x={40} basis={196} hoehe={104} farbe={p.dunkel} stamm={p.holz} />
      <Laubbaum x={112} basis={196} hoehe={92} farbe={p.dunkel} stamm={p.holz} />
      <Nadelbaum x={182} basis={200} hoehe={122} farbe={p.tief} stamm={p.holz} />
      <Laubbaum x={262} basis={196} hoehe={84} farbe={p.dunkel} stamm={p.holz} />
      <Nadelbaum x={330} basis={198} hoehe={110} farbe={p.tief} stamm={p.holz} />
      <Nadelbaum x={382} basis={196} hoehe={88} farbe={p.dunkel} stamm={p.holz} />
    </>
  )
}

function Hochland({ p }) {
  return (
    <>
      <g fill="none" stroke={p.tief} strokeWidth="3.5" strokeLinecap="round">
        <path d="M56 46 q12 -11 22 2 q10 -13 22 -2" />
        <path d="M302 30 q8 -8 15 1 q7 -9 15 -1" />
      </g>

      <path d="M-10 126 L20 94 H118 L150 126 Z" fill={p.fern} />
      <path d="M232 124 L258 88 H358 L392 124 Z" fill={p.fern} />

      <path d="M0 126 Q120 118 240 128 Q322 134 400 124 L400 200 L0 200 Z" fill={p.mittel} />

      <path d="M60 156 L96 122 H236 L286 156 Z" fill={p.basis} />
      <g fill="none" stroke={p.dunkel} strokeWidth="2.5" opacity="0.55">
        <path d="M86 134 H250" />
        <path d="M74 146 H268" />
      </g>

      <path d="M0 188 Q200 178 400 190 L400 200 L0 200 Z" fill={p.dunkel} />

      <path d="M0 200 L18 158 L44 176 L64 148 L92 200 Z" fill={p.tief} />
      <path d="M150 200 L168 172 L186 184 L204 166 L226 200 Z" fill={p.dunkel} />
      <path d="M300 200 L322 152 L346 172 L368 140 L400 200 Z" fill={p.tief} />
      <g fill={p.stein}>
        <ellipse cx="120" cy="192" rx="14" ry="7" />
        <ellipse cx="262" cy="194" rx="10" ry="5" />
      </g>
    </>
  )
}

const INHALT = {
  dorf: Dorf,
  felder: Felder,
  stadt: Stadt,
  see: See,
  berge: Berge,
  wald: Wald,
  hochland: Hochland,
}

/** Alle Landschaften, die eine Welt haben kann — alles andere wird zu 'dorf'. */
export const LANDSCHAFTEN = Object.keys(INHALT)

/**
 * @param {{art?:string, farbe?:string, himmel?:string, className?:string}} props
 * Rein dekorativ — der Text steht immer daneben auf einer Karte.
 */
export default function Landscape({
  art = 'dorf',
  farbe = '#55b85a',
  himmel = '#a8e4b6',
  className = 'adv-landschaft-svg',
}) {
  const roh = useId()
  const id = 'rk-ls-' + roh.replace(/[^a-zA-Z0-9]/g, '')
  const p = baueFarben(farbe, himmel)
  const Bild = INHALT[art] || INHALT.dorf

  return (
    <svg
      className={className}
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.himmelOben} />
          <stop offset="100%" stopColor={p.himmelUnten} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="200" fill={`url(#${id})`} />
      <Bild p={p} />
    </svg>
  )
}
