// Alle Knoepfe der App. Immer mit Text oder aria-label, nie kleiner als 44 px.
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Icon from '../icons/Icon.tsx'
import type { Iconname } from '../icons/Icon.tsx'

export type Knopfart = 'primaer' | 'gruen' | 'blau' | 'gold' | 'still' | 'gefahr'
export type Knopfgroesse = 'normal' | 'gross' | 'klein'

export interface PrimaryButtonProps extends ComponentPropsWithoutRef<'button'> {
  art?: Knopfart
  groesse?: Knopfgroesse
  breit?: boolean
  icon?: Iconname
  iconRechts?: Iconname
  children?: ReactNode
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(function PrimaryButton(
  {
    art = 'primaer',
    groesse = 'normal',
    breit = false,
    icon,
    iconRechts,
    className = '',
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`rk-knopf rk-knopf-${art} rk-knopf-${groesse} ${breit ? 'rk-knopf-breit' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} groesse={groesse === 'klein' ? 16 : 20} />}
      <span className="rk-knopf-text">{children}</span>
      {iconRechts && <Icon name={iconRechts} groesse={groesse === 'klein' ? 16 : 20} />}
    </button>
  )
})

export default PrimaryButton

/**
 * Runder Knopf, der nur ein Icon zeigt — `label` ist deshalb Pflicht und nicht
 * wahlfrei: ohne Beschriftung ist der Knopf für Screenreader stumm (CLAUDE.md).
 */
export interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon: Iconname
  label: string
  groesse?: number
}

export function IconButton({ icon, label, groesse = 20, className = '', ...rest }: IconButtonProps) {
  return (
    <button type="button" className={`rk-icon-knopf ${className}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} groesse={groesse} />
    </button>
  )
}
