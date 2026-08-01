// Seitenleiste am Desktop: Logo oben, Bereiche in der Mitte, Profil unten.
import Icon from '../icons/Icon.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'
import { navigiere } from '../../app/router.jsx'
import { istAktiv } from './navConfig.js'
import { T } from '../../core/texts.js'

/**
 * @param {{eintraege:Array, pfad:string, marken?:Object, modus:string,
 *          modusWechsel:()=>void}} props
 */
export default function DesktopSidebar({ eintraege, pfad, marken = {}, modus, modusWechsel }) {
  const startPfad =
    modus === 'abenteuer' ? '/adventure' : modus === 'redlingo' ? '/redlingo' : '/today'

  return (
    <aside className="rk-seitenleiste">
      <button className="rk-marke" type="button" onClick={() => navigiere(startPfad)}>
        <img src="/bilder/logo.png" alt="" className="rk-marke-logo" width="40" height="40" />
        <span className="rk-marke-text">
          <strong>{T.app.name}</strong>
          <small>{T.app.claim}</small>
        </span>
      </button>

      <LanguageSwitch className="rk-seiten-sprachwahl" />

      <nav className="rk-seitennav" aria-label={T.nav.hauptnavigation}>
        <ul>
          {eintraege.map((e) => {
            const aktiv = istAktiv(e, pfad)
            const marke = marken[e.id]
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className={'rk-seitennav-knopf' + (aktiv ? ' aktiv' : '')}
                  aria-current={aktiv ? 'page' : undefined}
                  onClick={() => navigiere(e.pfad)}
                >
                  <Icon name={e.icon} groesse={22} />
                  <span>{e.name}</span>
                  {marke > 0 && (
                    <span className="rk-seitennav-marke">
                      {marke}
                      <span className="nur-sr"> offen</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="rk-seitenleiste-fuss">
        <button type="button" className="rk-seitennav-knopf" onClick={modusWechsel}>
          <Icon name="rahmen" groesse={22} />
          <span>Ansicht wechseln</span>
        </button>
        {!eintraege.some((eintrag) => eintrag.id === 'einstellungen') && (
          <button
            type="button"
            className={'rk-seitennav-knopf' + (pfad === '/settings' ? ' aktiv' : '')}
            onClick={() => navigiere('/settings')}
          >
            <Icon name="einstellungen" groesse={22} />
            <span>{T.nav.einstellungen}</span>
          </button>
        )}
        <a
          className="rk-seitenleiste-link"
          href="https://github.com/Redurbabat/RED-KURD"
          target="_blank"
          rel="noreferrer"
        >
          Open Source · GitHub
        </a>
      </div>
    </aside>
  )
}
