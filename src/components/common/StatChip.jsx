// Kompakte Kennzahl fuer Kopfleisten (Serie, XP, Wörter, Edelsteine, Level).
import Icon from '../icons/Icon.jsx'

/**
 * Auf schmalen Geraeten wird die kurze Beschriftung gezeigt (CSS-Umschaltung),
 * damit im Kopfbereich alle Werte nebeneinander passen.
 * @param {{icon:string, wert:string|number, label:string, kurzLabel?:string,
 *          ton?:string, kurz?:boolean}} props
 */
export default function StatChip({
  icon,
  wert,
  label,
  kurzLabel,
  ton = 'neutral',
  kurz = false,
  className = '',
}) {
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
