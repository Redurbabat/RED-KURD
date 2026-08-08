// Feste Navigation am unteren Rand (Handy und Tablet). Beruecksichtigt die
// Safe-Area moderner Smartphones, damit nichts unter der Systemleiste liegt.
import Icon from '../icons/Icon.tsx'
import { navigiere } from '../../app/router.jsx'
import { istAktiv } from './navConfig.ts'
import { T } from '../../core/texts.js'
import type { Navigationseintrag } from './navConfig.ts'

/** Zahl offener Punkte je Navigations-ID; fehlt ein Eintrag, gibt es keine Marke. */
export type Navmarken = Partial<Record<string, number>>

export interface BottomNavigationProps {
  eintraege: readonly Navigationseintrag[]
  pfad: string
  marken?: Navmarken
}

export default function BottomNavigation({
  eintraege,
  pfad,
  marken = {},
}: BottomNavigationProps) {
  return (
    <nav className="rk-untennav" aria-label={T.nav.hauptnavigation}>
      <ul>
        {eintraege.map((e) => {
          const aktiv = istAktiv(e, pfad)
          const marke = marken[e.id] ?? 0
          return (
            <li key={e.id}>
              <button
                type="button"
                className={`rk-untennav-knopf rk-nav-${e.id}${aktiv ? ' aktiv' : ''}`}
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
