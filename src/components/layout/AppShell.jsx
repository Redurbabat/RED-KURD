// Das Grundgeruest beider Modi: Seitenleiste am Desktop, Bottom-Navigation am
// Handy, Inhaltsspalte in der Mitte und eine optionale Zusatzspalte rechts.
import StatsHeader from './StatsHeader.jsx'
import DesktopSidebar from './DesktopSidebar.jsx'
import BottomNavigation from './BottomNavigation.jsx'
import { T } from '../../core/texts.js'

/**
 * @param {{modus:'modern'|'abenteuer'|'redlingo', nav:Array, pfad:string, marken?:Object,
 *          modusWechsel:()=>void, aside?:React.ReactNode, ohneNav?:boolean,
 *          children:React.ReactNode}} props
 */
export default function AppShell({
  modus,
  nav,
  pfad,
  marken,
  modusWechsel,
  aside,
  ohneNav = false,
  children,
}) {
  return (
    <div
      className={`rk-shell${modus === 'abenteuer' ? ' rk-shell-abenteuer' : ''}${
        modus === 'redlingo' ? ' rk-shell-redlingo' : ''
      }`}
    >
      <a className="sprunglink" href="#inhalt">
        {T.nav.zumInhalt}
      </a>

      {!ohneNav && (
        <DesktopSidebar
          eintraege={nav}
          pfad={pfad}
          marken={marken}
          modus={modus}
          modusWechsel={modusWechsel}
        />
      )}

      <div className="rk-hauptbereich">
        <StatsHeader modus={modus} />
        <div className="rk-spalten">
          <main id="inhalt" className="rk-inhalt" tabIndex={-1}>
            {children}
          </main>
          {aside && <aside className="rk-zusatzspalte">{aside}</aside>}
        </div>
      </div>

      {!ohneNav && <BottomNavigation eintraege={nav} pfad={pfad} marken={marken} />}
    </div>
  )
}
