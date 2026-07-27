// Kompakte Kennzahl fuer Kopfleisten (Serie, XP, Wörter, Edelsteine, Level).
import Icon from '../icons/Icon.jsx'

/**
 * @param {{icon:string, wert:string|number, label:string, ton?:string, kurz?:boolean}} props
 */
export default function StatChip({ icon, wert, label, ton = 'neutral', kurz = false, className = '' }) {
  return (
    <span className={`rk-chip rk-chip-${ton} ${className}`}>
      <Icon name={icon} groesse={16} />
      <strong>{wert}</strong>
      {kurz ? <span className="nur-sr">{label}</span> : <small>{label}</small>}
    </span>
  )
}

/** Grosse Kachel mit Zahl und Beschriftung (Fortschrittsseite). */
export function StatTile({ icon, wert, label, ton = 'neutral' }) {
  return (
    <div className={`rk-kachel rk-kachel-${ton}`}>
      <Icon name={icon} groesse={22} />
      <strong>{wert}</strong>
      <span>{label}</span>
    </div>
  )
}
