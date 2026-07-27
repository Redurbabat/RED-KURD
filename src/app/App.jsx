// Einstiegspunkt: Migration, Design anwenden, Onboarding, dann die Hülle
// des jeweiligen Modus mit der passenden Seite.
import { useEffect, useState } from 'react'
import { RouterProvider, useRoute, navigiere } from './router.jsx'
import AppRouter, { istAbenteuerPfad } from './AppRouter.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import Onboarding from '../modes/modern/pages/Onboarding.jsx'
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
  const modus = istAbenteuerPfad(pfad) ? 'abenteuer' : appModus()
  const s = statistik()

  const nav = modus === 'abenteuer' ? ABENTEUER_NAV : MODERN_NAV
  const marken =
    modus === 'abenteuer'
      ? { aufgaben: offeneBelohnungen() }
      : { ueben: s.faellig }

  function modusWechsel() {
    const neu = modus === 'abenteuer' ? 'modern' : 'abenteuer'
    setzeAppModus(neu)
    navigiere(neu === 'abenteuer' ? '/adventure' : '/today')
  }

  // Übungsseiten laufen ohne Navigation, damit nichts vom Lernen ablenkt.
  const ohneNav =
    pfad === '/session' ||
    /^\/course\/[^/]+\/lesson\//.test(pfad) ||
    /^\/adventure\/lesson\//.test(pfad) ||
    /^\/practice\/[^/]+$/.test(pfad)

  return (
    <AppShell modus={modus} nav={nav} pfad={pfad} marken={marken} modusWechsel={modusWechsel} ohneNav={ohneNav}>
      <AppRouter />
    </AppShell>
  )
}

export default function App() {
  const [eingerichtet, setEingerichtet] = useState(() => istEingerichtet())

  useEffect(() => {
    anwenden()
    const medien = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const auf = () => anwenden()
    medien && medien.addEventListener && medien.addEventListener('change', auf)
    return () => medien && medien.removeEventListener && medien.removeEventListener('change', auf)
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
