// Ansichts-Umschalter INNERHALB der Sprach-App: Modern · Abenteuer · Redlingo.
// Das sind keine eigenen Apps, sondern drei Darstellungen derselben
// Sprachlern-App — XP, Serie und aller Fortschritt sind identisch.
// Sichtbar nur, wenn die App „Sprache lernen" offen ist.
import { useRoute, navigiere } from '../../app/router.jsx'
import { istAbenteuerPfad, istRedlingoPfad } from '../../app/AppRouter.jsx'
import { useLernstand } from '../../core/store.ts'
import { appModus, setzeAppModus } from '../../core/ui/uiStore.ts'
import type { Ansicht } from '../../components/layout/AppShell.tsx'
import './appMode.css'

interface Ansichtseintrag {
  ansicht: Ansicht
  name: string
  ziel: string
}

// Frueher eine Liste aus Dreier-Feldern. Als benannte Felder muss beim Lesen
// niemand mehr wissen, dass an Stelle 2 das Ziel steht — und ein vertauschtes
// Paar faellt sofort auf.
const ANSICHTEN: readonly Ansichtseintrag[] = [
  { ansicht: 'modern', name: 'Modern', ziel: '/today' },
  { ansicht: 'abenteuer', name: 'Abenteuer', ziel: '/adventure' },
  { ansicht: 'redlingo', name: 'Redlingo', ziel: '/redlingo' },
]

export default function AnsichtSwitcher() {
  useLernstand()
  const { pfad } = useRoute()

  // Uebungs- und Lektionsseiten laufen ohne Ablenkung (wie die App-Navigation).
  const ohneNav =
    pfad === '/session' ||
    /^\/course\/[^/]+\/lesson\//.test(pfad) ||
    /^\/languages\/[^/]+\/[^/]+$/.test(pfad) ||
    /^\/adventure\/lesson\//.test(pfad) ||
    /^\/practice\/[^/]+$/.test(pfad)
  if (ohneNav) return null

  const aktiv = istAbenteuerPfad(pfad) ? 'abenteuer' : istRedlingoPfad(pfad) ? 'redlingo' : appModus()

  function wechseln(ansicht: Ansicht, ziel: string): void {
    if (ansicht === aktiv) return
    setzeAppModus(ansicht)
    navigiere(ziel)
  }

  return (
    <nav className="ansicht-umschalter" aria-label="Ansicht der Sprach-App wechseln">
      <span className="ansicht-umschalter-wort">Ansicht:</span>
      {ANSICHTEN.map(({ ansicht, name, ziel }) => (
        <button
          key={ansicht}
          type="button"
          className={`ansicht-umschalter-knopf${ansicht === aktiv ? ' aktiv' : ''}`}
          aria-pressed={ansicht === aktiv}
          onClick={() => wechseln(ansicht, ziel)}
        >
          {name}
        </button>
      ))}
    </nav>
  )
}
