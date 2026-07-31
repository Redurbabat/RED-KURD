// Einstiegspunkt: Migration, Design anwenden, Onboarding, dann die Hülle
// des jeweiligen Modus mit der passenden Seite.
import { useEffect, useState } from 'react'
import { RouterProvider, useRoute, navigiere } from './router.jsx'
import AppRouter, { istAbenteuerPfad } from './AppRouter.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import SideColumn from '../components/layout/SideColumn.jsx'
import Modal from '../components/common/Modal.jsx'
import PrimaryButton from '../components/common/PrimaryButton.jsx'
import Onboarding from '../modes/modern/pages/Onboarding.jsx'
import { T } from '../core/texts.js'
import { MODERN_NAV, ABENTEUER_NAV } from '../components/layout/navConfig.js'
import { migriere } from '../core/storage.js'
import { useLernstand } from '../core/store.js'
import { anwenden, appModus, setzeAppModus } from '../core/ui/uiStore.js'
import { istEingerichtet } from '../core/profile/profileStore.js'
import { statistik } from '../core/progress/progressSelectors.js'
import { offeneBelohnungen } from '../core/tasks/taskStore.js'

import '../styles/tokens.css'
import '../styles/global.css'
import '../styles/components.css'
import '../styles/modern.css'
import '../styles/adventure.css'

migriere()
anwenden()

function Rahmen() {
  useLernstand()
  const { pfad } = useRoute()
  const [frage, setFrage] = useState(null)
  const modus = istAbenteuerPfad(pfad) ? 'abenteuer' : appModus()
  const s = statistik()

  const nav = modus === 'abenteuer' ? ABENTEUER_NAV : MODERN_NAV
  const marken =
    modus === 'abenteuer'
      ? { aufgaben: offeneBelohnungen() }
      : { ueben: s.faellig }

  // Auch der kurze Weg über die Seitenleiste fragt nach — der Wechsel soll nie
  // versehentlich passieren.
  function modusWechsel() {
    setFrage(modus === 'abenteuer' ? 'modern' : 'abenteuer')
  }

  function wechselBestaetigen() {
    const neu = frage
    setFrage(null)
    if (!neu) return
    setzeAppModus(neu)
    navigiere(neu === 'abenteuer' ? '/adventure' : '/today')
  }

  // Übungsseiten laufen ohne Navigation, damit nichts vom Lernen ablenkt.
  const ohneNav =
    pfad === '/session' ||
    /^\/course\/[^/]+\/lesson\//.test(pfad) ||
    /^\/languages\/[^/]+\/[^/]+$/.test(pfad) ||
    /^\/adventure\/lesson\//.test(pfad) ||
    /^\/practice\/[^/]+$/.test(pfad)

  // Die Zusatzspalte ergänzt die Übersichtsseiten — nicht die Übungen und
  // nicht die Seiten, die den Platz selbst brauchen (Einstellungen, Weltkarte).
  const MIT_ZUSATZ = ['/today', '/languages', '/course', '/practice', '/explore', '/progress', '/adventure']
  const mitZusatz = !ohneNav && MIT_ZUSATZ.some((p) => pfad === p || pfad.startsWith(p + '/'))
  const nichtZusatz = pfad.startsWith('/settings') || pfad.startsWith('/adventure/world')

  return (
    <AppShell
      modus={modus}
      nav={nav}
      pfad={pfad}
      marken={marken}
      modusWechsel={modusWechsel}
      ohneNav={ohneNav}
      aside={mitZusatz && !nichtZusatz ? <SideColumn modus={modus} /> : null}
    >
      <AppRouter />

      <Modal
        offen={frage !== null}
        titel={frage === 'abenteuer' ? T.einstellungen.zuAbenteuer : T.einstellungen.zuModern}
        schliessen={() => setFrage(null)}
        fussleiste={
          <>
            <PrimaryButton art="still" onClick={() => setFrage(null)}>
              {T.allgemein.abbrechen}
            </PrimaryButton>
            <PrimaryButton icon="haken" onClick={wechselBestaetigen}>
              Wechseln
            </PrimaryButton>
          </>
        }
      >
        <p>{T.einstellungen.modusHinweis}</p>
        <p className="gedaempft">
          XP, Serie, Wörter, Einheiten und deine Sterne zählen in beiden Modi gemeinsam.
        </p>
      </Modal>
    </AppShell>
  )
}

export default function App() {
  const [eingerichtet, setEingerichtet] = useState(() => istEingerichtet())

  useEffect(() => {
    anwenden()
    const medien = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const auf = () => anwenden()
    const druecken = (ereignis) => {
      const knopf = ereignis.target?.closest?.('button, [role="button"]')
      if (knopf && !knopf.disabled && navigator.vibrate) navigator.vibrate(8)
    }
    medien && medien.addEventListener && medien.addEventListener('change', auf)
    document.addEventListener('pointerdown', druecken, { passive: true })
    return () => {
      medien && medien.removeEventListener && medien.removeEventListener('change', auf)
      document.removeEventListener('pointerdown', druecken)
    }
  }, [])

  if (!eingerichtet) {
    return <Onboarding fertig={() => setEingerichtet(true)} />
  }

  return (
    <RouterProvider>
      <Rahmen />
    </RouterProvider>
  )
}
