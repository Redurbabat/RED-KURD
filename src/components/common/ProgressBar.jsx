// Fortschrittsbalken mit korrekten ARIA-Angaben (Screenreader lesen den Wert vor).

/**
 * @param {{wert:number, max?:number, label:string, farbe?:string,
 *          zeigeWert?:boolean, klein?:boolean}} props
 */
export default function ProgressBar({
  wert,
  max = 100,
  label,
  farbe = 'primary',
  zeigeWert = false,
  klein = false,
  className = '',
}) {
  const sicher = Math.max(0, Math.min(wert, max))
  const prozent = max ? Math.round((sicher / max) * 100) : 0
  return (
    <div className={`rk-balken-zeile ${className}`}>
      <div
        className={`rk-balken ${klein ? 'rk-balken-klein' : ''}`}
        role="progressbar"
        aria-valuenow={sicher}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        aria-valuetext={`${prozent} Prozent`}
      >
        <div className={`rk-balken-voll rk-balken-${farbe}`} style={{ width: prozent + '%' }} />
      </div>
      {zeigeWert && <span className="rk-balken-wert">{prozent} %</span>}
    </div>
  )
}

// Dieselben Farbnamen wie bei ProgressBar — ein fertiger CSS-Wert geht auch.
const RING_FARBEN = {
  primary: 'var(--rk-primary)',
  green: 'var(--rk-green-dark)',
  blue: 'var(--rk-blue)',
  gold: 'var(--adv-gold)',
  orange: 'var(--rk-orange)',
  purple: 'var(--rk-purple)',
}

/** Runder Fortschrittsring. */
export function ProgressRing({ wert, label, groesse = 76, farbe = 'primary', text }) {
  const prozent = Math.max(0, Math.min(wert, 100))
  const ringFarbe = RING_FARBEN[farbe] || farbe
  return (
    <div
      className="rk-ring"
      style={{
        width: groesse,
        height: groesse,
        background: `conic-gradient(${ringFarbe} ${prozent * 3.6}deg, var(--rk-border) 0deg)`,
      }}
      role="progressbar"
      aria-valuenow={prozent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      aria-valuetext={`${prozent} Prozent`}
    >
      <span className="rk-ring-text">{text ?? `${prozent} %`}</span>
    </div>
  )
}
