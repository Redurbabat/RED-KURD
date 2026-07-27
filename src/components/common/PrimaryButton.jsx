// Alle Knoepfe der App. Immer mit Text oder aria-label, nie kleiner als 44 px.
import Icon from '../icons/Icon.jsx'

/**
 * @param {{art?:'primaer'|'gruen'|'blau'|'gold'|'still'|'gefahr',
 *          groesse?:'normal'|'gross'|'klein', breit?:boolean, icon?:string,
 *          iconRechts?:string, children:React.ReactNode}} props
 */
export default function PrimaryButton({
  art = 'primaer',
  groesse = 'normal',
  breit = false,
  icon,
  iconRechts,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`rk-knopf rk-knopf-${art} rk-knopf-${groesse} ${breit ? 'rk-knopf-breit' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} groesse={groesse === 'klein' ? 16 : 20} />}
      <span className="rk-knopf-text">{children}</span>
      {iconRechts && <Icon name={iconRechts} groesse={groesse === 'klein' ? 16 : 20} />}
    </button>
  )
}

/** Runder Knopf, der nur ein Icon zeigt — braucht deshalb zwingend ein Label. */
export function IconButton({ icon, label, groesse = 20, className = '', ...rest }) {
  return (
    <button type="button" className={`rk-icon-knopf ${className}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} groesse={groesse} />
    </button>
  )
}
