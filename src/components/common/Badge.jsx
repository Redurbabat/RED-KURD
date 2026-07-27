// Kleines Etikett. Farbe allein transportiert nie eine Information —
// es steht immer Text daneben oder darin (WCAG 1.4.1).
import Icon from '../icons/Icon.jsx'

/**
 * @param {{ton?:'neutral'|'gruen'|'blau'|'gold'|'rot'|'lila'|'teal',
 *          icon?:string, children:React.ReactNode}} props
 */
export default function Badge({ ton = 'neutral', icon, className = '', children, ...rest }) {
  return (
    <span className={`rk-badge rk-badge-${ton} ${className}`} {...rest}>
      {icon && <Icon name={icon} groesse={14} />}
      {children}
    </span>
  )
}

/** Zahlenmarke, z. B. „8 fällig". */
export function CountBadge({ anzahl, label, ton = 'rot' }) {
  if (!anzahl) return null
  return (
    <span className={`rk-zaehler rk-badge-${ton}`}>
      {anzahl}
      <span className="nur-sr"> {label}</span>
    </span>
  )
}
