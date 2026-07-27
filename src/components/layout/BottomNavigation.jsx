// Feste Navigation am unteren Rand (Handy und Tablet). Beruecksichtigt die
// Safe-Area moderner Smartphones, damit nichts unter der Systemleiste liegt.
import Icon from '../icons/Icon.jsx'
import { navigiere } from '../../app/router.jsx'
import { istAktiv } from './navConfig.js'
import { T } from '../../core/texts.js'

/**
 * @param {{eintraege:Array, pfad:string, marken?:Object}} props
 */
export default function BottomNavigation({ eintraege, pfad, marken = {} }) {
  return (
    <nav className="rk-untennav" aria-label={T.nav.hauptnavigation}>
      <ul>
        {eintraege.map((e) => {
          const aktiv = istAktiv(e, pfad)
          const marke = marken[e.id]
          return (
            <li key={e.id}>
              <button
                type="button"
                className={'rk-untennav-knopf' + (aktiv ? ' aktiv' : '')}
                aria-current={aktiv ? 'page' : undefined}
                onClick={() => navigiere(e.pfad)}
              >
                <span className="rk-untennav-icon">
                  <Icon name={e.icon} groesse={24} />
                  {marke > 0 && (
                    <span className="rk-untennav-marke">
                      {marke > 99 ? '99+' : marke}
                      <span className="nur-sr"> offen</span>
                    </span>
                  )}
                </span>
                <span className="rk-untennav-text">{e.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
