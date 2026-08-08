// Das Grundgeruest beider Modi: Seitenleiste am Desktop, Bottom-Navigation am
// Handy, Inhaltsspalte in der Mitte und eine optionale Zusatzspalte rechts.
import StatsHeader from './StatsHeader.tsx'
import DesktopSidebar from './DesktopSidebar.tsx'
import BottomNavigation from './BottomNavigation.tsx'
import { T } from '../../core/texts.ts'
import type { ReactNode } from 'react'
import type { Navigationseintrag } from './navConfig.ts'
import type { Navmarken } from './BottomNavigation.tsx'

/** Die drei Ansichten der Sprach-App — nicht zu verwechseln mit den vier Apps. */
export type Ansicht = 'modern' | 'abenteuer' | 'redlingo'

export interface AppShellProps {
  modus: Ansicht
  nav: readonly Navigationseintrag[]
  pfad: string
  marken?: Navmarken
  modusWechsel: () => void
  /** Zusatzspalte rechts; nur am Desktop sichtbar. */
  aside?: ReactNode
  /** Übungsseiten blenden die Navigation aus, damit nichts ablenkt. */
  ohneNav?: boolean
  children?: ReactNode
}

export default function AppShell({
  modus,
  nav,
  pfad,
  marken,
  modusWechsel,
  aside,
  ohneNav = false,
  children,
}: AppShellProps) {
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
