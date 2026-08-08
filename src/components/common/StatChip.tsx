// Kompakte Kennzahl fuer Kopfleisten (Serie, XP, Wörter, Edelsteine, Level).
import type { ReactNode } from 'react'
import Icon from '../icons/Icon.tsx'
import type { Iconname } from '../icons/Icon.tsx'

export interface StatChipProps {
  icon: Iconname
  wert: ReactNode
  /** Die volle Beschriftung; sie steht immer für Screenreader bereit. */
  label: string
  /** Kurzform für schmale Geräte; ohne Angabe wird `label` verkürzt gezeigt. */
  kurzLabel?: string
  ton?: string
  /** `true` blendet die sichtbare Beschriftung ganz aus. */
  kurz?: boolean
  className?: string
}

/**
 * Auf schmalen Geraeten wird die kurze Beschriftung gezeigt (CSS-Umschaltung),
 * damit im Kopfbereich alle Werte nebeneinander passen.
 */
export default function StatChip({
  icon,
  wert,
  label,
  kurzLabel,
  ton = 'neutral',
  kurz = false,
  className = '',
}: StatChipProps) {
  return (
    <span className={`rk-chip rk-chip-${ton} ${className}`}>
      <Icon name={icon} groesse={16} />
      <strong>{wert}</strong>
      {kurz ? (
        <span className="nur-sr">{label}</span>
      ) : (
        <>
          <small className="rk-chip-lang">{label}</small>
          <small className="rk-chip-kurz" aria-hidden="true">
            {kurzLabel || label}
          </small>
          {kurzLabel && <span className="nur-sr">{label}</span>}
        </>
      )}
    </span>
  )
}

export interface StatTileProps {
  icon: Iconname
  wert: ReactNode
  label: ReactNode
  ton?: string
}

/** Grosse Kachel mit Zahl und Beschriftung (Fortschrittsseite). */
export function StatTile({ icon, wert, label, ton = 'neutral' }: StatTileProps) {
  return (
    <div className={`rk-kachel rk-kachel-${ton}`}>
      <Icon name={icon} groesse={22} />
      <strong>{wert}</strong>
      <span>{label}</span>
    </div>
  )
}
