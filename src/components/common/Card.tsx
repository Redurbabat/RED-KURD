// Grundbaustein aller Seiten: eine Karte mit optionalem Titel.
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Icon from '../icons/Icon.tsx'
import type { Iconname } from '../icons/Icon.tsx'

/** Farbton der Karte; steuert nur das Aussehen, nie die Bedeutung. */
export type Kartenton = 'normal' | 'warm' | 'kuehl' | 'lila' | 'gruen'

// `ComponentPropsWithoutRef<'section'>` statt einer eigenen Liste: die Karte
// reicht alles Übrige an das <section>-Element durch (aria-labelledby, id,
// onClick …). Ein Tippfehler dort wäre sonst nirgends zu sehen.
export interface CardProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  titel?: string
  icon?: Iconname
  ton?: Kartenton
  aktion?: ReactNode
  children?: ReactNode
}

export default function Card({
  titel,
  icon,
  ton = 'normal',
  aktion,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <section className={`rk-karte rk-karte-${ton} ${className}`} {...rest}>
      {(titel || aktion) && (
        <header className="rk-karte-kopf">
          {titel && (
            <h3 className="rk-karte-titel">
              {icon && <Icon name={icon} groesse={18} />}
              <span>{titel}</span>
            </h3>
          )}
          {aktion && <div className="rk-karte-aktion">{aktion}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export interface ClickCardProps extends Omit<ComponentPropsWithoutRef<'button'>, 'title'> {
  titel?: string
  icon?: Iconname
  ton?: Kartenton
  children?: ReactNode
}

/** Anklickbare Variante — bleibt ein echter Button (Tastatur + Screenreader). */
export function ClickCard({
  titel,
  icon,
  ton = 'normal',
  className = '',
  children,
  ...rest
}: ClickCardProps) {
  return (
    <button type="button" className={`rk-karte rk-karte-${ton} rk-karte-klick ${className}`} {...rest}>
      {titel && (
        <span className="rk-karte-titel">
          {icon && <Icon name={icon} groesse={18} />}
          <span>{titel}</span>
        </span>
      )}
      {children}
      <Icon name="pfeilRechts" groesse={18} className="rk-karte-pfeil" />
    </button>
  )
}
