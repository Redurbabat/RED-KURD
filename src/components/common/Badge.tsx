// Kleines Etikett. Farbe allein transportiert nie eine Information —
// es steht immer Text daneben oder darin (WCAG 1.4.1).
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Icon from '../icons/Icon.tsx'
import type { Iconname } from '../icons/Icon.tsx'

export type Badgeton = 'neutral' | 'gruen' | 'blau' | 'gold' | 'rot' | 'lila' | 'teal'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  ton?: Badgeton
  icon?: Iconname
  children?: ReactNode
}

export default function Badge({
  ton = 'neutral',
  icon,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={`rk-badge rk-badge-${ton} ${className}`} {...rest}>
      {icon && <Icon name={icon} groesse={14} />}
      {children}
    </span>
  )
}

export interface CountBadgeProps {
  anzahl: number
  /** Was gezählt wird — steht nur für Screenreader daneben. */
  label: string
  ton?: Badgeton
}

/** Zahlenmarke, z. B. „8 fällig". */
export function CountBadge({ anzahl, label, ton = 'rot' }: CountBadgeProps) {
  if (!anzahl) return null
  return (
    <span className={`rk-zaehler rk-badge-${ton}`}>
      {anzahl}
      <span className="nur-sr"> {label}</span>
    </span>
  )
}
