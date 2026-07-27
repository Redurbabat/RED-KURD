// Kelim-Bordüre — das wiederkehrende Ornament der App.
// Motive aus kurdischer Teppichweberei: Elîbelinde (Hände in der Hüfte),
// Rautenketten (berbang), Hakenkreuzmäander (çeng) und Sternrosetten.
// Rein dekorativ, deshalb immer aria-hidden.

const MUSTER = {
  // Rautenkette mit Haken — das häufigste Kelim-Band
  rauten: (
    <>
      <path d="M0 12 L12 0 L24 12 L12 24 Z" />
      <path d="M12 6 L18 12 L12 18 L6 12 Z" fill="none" strokeWidth="2" />
      <path d="M0 12 L-6 6 M0 12 L-6 18 M24 12 L30 6 M24 12 L30 18" fill="none" strokeWidth="2" />
    </>
  ),
  // Elîbelinde — stilisierte Frauenfigur, Symbol für Fruchtbarkeit und Schutz
  elibelinde: (
    <>
      <path d="M12 2 L16 6 L16 10 L20 12 L20 16 L14 16 L14 22 L10 22 L10 16 L4 16 L4 12 L8 10 L8 6 Z" />
    </>
  ),
  // Zickzack — Wasser und Berge
  berge: (
    <>
      <path d="M0 18 L6 6 L12 18 L18 6 L24 18" fill="none" strokeWidth="3" />
      <path d="M0 22 L6 12 L12 22 L18 12 L24 22" fill="none" strokeWidth="2" opacity=".55" />
    </>
  ),
  // Sternrosette
  sterne: (
    <>
      <path d="M12 2 L14.5 9 L22 9 L16 13.5 L18.5 21 L12 16.5 L5.5 21 L8 13.5 L2 9 L9.5 9 Z" />
    </>
  ),
}

/**
 * @param {{muster?:'rauten'|'elibelinde'|'berge'|'sterne', hoehe?:number,
 *          farbe?:string, hintergrund?:string, className?:string}} props
 */
export default function KelimBorder({
  muster = 'rauten',
  hoehe = 14,
  farbe = 'var(--adv-brown)',
  hintergrund = 'transparent',
  className = '',
}) {
  const id = `kelim-${muster}-${hoehe}`
  return (
    <svg
      className={`kelim ${className}`}
      width="100%"
      height={hoehe}
      viewBox={`0 0 24 24`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill={hintergrund} />
          <g fill={farbe} stroke={farbe} strokeLinejoin="round">
            {MUSTER[muster] || MUSTER.rauten}
          </g>
        </pattern>
      </defs>
      <rect width="24" height="24" fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * Bordüre, die sich waagerecht kachelt — für Kartenränder und Trennlinien.
 * Nutzt ein Hintergrundbild statt <svg>, damit sie sich beliebig oft
 * wiederholt, ohne verzerrt zu werden.
 */
export function KelimBand({ hoehe = 12, farbe = '#7a4b28', className = '' }) {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="14" viewBox="0 0 28 14">` +
      `<g fill="${farbe}">` +
      `<path d="M14 0 L21 7 L14 14 L7 7 Z"/>` +
      `<path d="M0 7 L4 3 L4 11 Z"/><path d="M28 7 L24 3 L24 11 Z"/>` +
      `</g>` +
      `<g fill="none" stroke="${farbe}" stroke-width="1.4" opacity="0.65">` +
      `<path d="M14 3.5 L17.5 7 L14 10.5 L10.5 7 Z"/>` +
      `</g></svg>`
  )
  return (
    <span
      className={`kelim-band ${className}`}
      aria-hidden="true"
      style={{
        display: 'block',
        height: hoehe,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: `auto ${hoehe}px`,
      }}
    />
  )
}
