// Grundbaustein aller Seiten: eine Karte mit optionalem Titel.
import Icon from '../icons/Icon.jsx'

/**
 * @param {{titel?:string, icon?:string, ton?:'normal'|'warm'|'kuehl'|'lila'|'gruen',
 *          aktion?:React.ReactNode, alsListe?:boolean, className?:string,
 *          children:React.ReactNode}} props
 */
export default function Card({
  titel,
  icon,
  ton = 'normal',
  aktion,
  className = '',
  children,
  ...rest
}) {
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

/** Anklickbare Variante — bleibt ein echter Button (Tastatur + Screenreader). */
export function ClickCard({ titel, icon, ton = 'normal', className = '', children, ...rest }) {
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
