// Fortschrittsbalken mit korrekten ARIA-Angaben (Screenreader lesen den Wert vor).
import type { ReactNode } from 'react'

/**
 * Die benannten Farben aus `RING_FARBEN`. Ein beliebiger CSS-Wert geht auch —
 * deshalb `| string` und keine reine Vereinigung: das ist keine Nachlässigkeit,
 * sondern die tatsächliche Absicht (siehe `RING_FARBEN[farbe] || farbe`).
 */
export type Balkenfarbe = 'primary' | 'green' | 'blue' | 'gold' | 'orange' | 'purple'

export interface ProgressBarProps {
  wert: number
  max?: number
  /** Pflicht: der Balken ist sonst für Screenreader namenlos. */
  label: string
  farbe?: Balkenfarbe | string
  zeigeWert?: boolean
  klein?: boolean
  className?: string
}

export default function ProgressBar({
  wert,
  max = 100,
  label,
  farbe = 'primary',
  zeigeWert = false,
  klein = false,
  className = '',
}: ProgressBarProps) {
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
const RING_FARBEN: Readonly<Record<Balkenfarbe, string>> = {
  primary: 'var(--rk-primary)',
  green: 'var(--rk-green-dark)',
  blue: 'var(--rk-blue)',
  gold: 'var(--adv-gold)',
  orange: 'var(--rk-orange)',
  purple: 'var(--rk-purple)',
}

export interface ProgressRingProps {
  wert: number
  label: string
  groesse?: number
  farbe?: Balkenfarbe | string
  /** Was in der Mitte steht; ohne Angabe der Prozentwert. */
  text?: ReactNode
}

function istBalkenfarbe(wert: string): wert is Balkenfarbe {
  return wert in RING_FARBEN
}

/** Runder Fortschrittsring. */
export function ProgressRing({
  wert,
  label,
  groesse = 76,
  farbe = 'primary',
  text,
}: ProgressRingProps) {
  const prozent = Math.max(0, Math.min(wert, 100))
  // Erst in der Tabelle nachsehen, sonst den Wert unverändert als CSS-Farbe
  // nehmen. `istBalkenfarbe` statt eines Zugriffs mit beliebigem String: so
  // bleibt die Tabelle vollständig geprüft.
  const ringFarbe = istBalkenfarbe(farbe) ? RING_FARBEN[farbe] : farbe
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
