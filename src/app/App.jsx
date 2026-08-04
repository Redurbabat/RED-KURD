// Einstiegspunkt: Migration, Design anwenden, Onboarding, dann die Hülle
// des jeweiligen Modus mit der passenden Seite.
import { useEffect, useState } from 'react'
import { RouterProvider, useRoute, navigiere } from './router.jsx'
import AppRouter, { istAbenteuerPfad, istRedlingoPfad } from './AppRouter.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import SideColumn from '../components/layout/SideColumn.jsx'
import Modal from '../components/common/Modal.jsx'
import PrimaryButton from '../components/common/PrimaryButton.jsx'
import Onboarding from '../modes/modern/pages/Onboarding.jsx'
import { T } from '../core/texts.js'
import { MODERN_NAV, ABENTEUER_NAV, REDLINGO_NAV } from '../components/layout/navConfig.js'
import { KEYS, beiSpeicherproblem, entferne, lies, migriere, schreibe } from '../core/storage.js'
import { useLernstand } from '../core/store.js'
import { anwenden, appModus, setzeAppModus } from '../core/ui/uiStore.js'
import { istEingerichtet } from '../core/profile/profileStore.js'
import { statistik } from '../core/progress/progressSelectors.js'
import { offeneBelohnungen } from '../core/tasks/taskStore.js'
import { kontoStatus } from '../core/auth/authApi.js'
import AuthPage, { AuthLoading } from '../features/auth/AuthPage.jsx'

import '../styles/tokens.css'
import '../styles/global.css'
import '../styles/components.css'
import '../styles/modern.css'
import '../styles/adventure.css'
import '../styles/redlingo.css'

migriere()
anwenden()

function Rahmen() {
  useLernstand()
  const { pfad } = useRoute()
  const [frage, setFrage] = useState(null)
  // Scheitert das Speichern (voll/privater Modus), muss die Lernende das
  // erfahren — sonst zeigt die App Fortschritt, der beim Neuladen weg ist.
  const [speicherProblem, setSpeicherProblem] = useState(false)
  useEffect(() => beiSpeicherproblem(() => setSpeicherProblem(true)), [])
  const modus = istAbenteuerPfad(pfad)
    ? 'abenteuer'
    : istRedlingoPfad(pfad)
      ? 'redlingo'
      : appModus()
  const s = statistik()

  // Ein direkt geöffneter Redlingo-Link übernimmt die Ansicht auch für die
  // gemeinsamen Kurs- und Übungsseiten, deren Adressen bewusst unverändert bleiben.
  useEffect(() => {
    if (istRedlingoPfad(pfad) && appModus() !== 'redlingo') setzeAppModus('redlingo')
  }, [pfad])

  const nav =
    modus === 'abenteuer' ? ABENTEUER_NAV : modus === 'redlingo' ? REDLINGO_NAV : MODERN_NAV
  const marken =
    modus === 'abenteuer'
      ? { aufgaben: offeneBelohnungen() }
      : { ueben: s.faellig }

  // Auch der kurze Weg über die Seitenleiste fragt nach — der Wechsel soll nie
  // versehentlich passieren.
  function modusWechsel() {
    const naechster = { modern: 'abenteuer', abenteuer: 'redlingo', redlingo: 'modern' }
    setFrage(naechster[modus] || 'modern')
  }

  function wechselBestaetigen() {
    const neu = frage
    setFrage(null)
    if (!neu) return
    setzeAppModus(neu)
    navigiere(neu === 'abenteuer' ? '/adventure' : neu === 'redlingo' ? '/redlingo' : '/today')
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
  const MIT_ZUSATZ = ['/today', '/languages', '/course', '/practice', '/explore', '/progress', '/adventure', '/redlingo']
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
      {speicherProblem && (
        <p className="rk-fehler" role="alert">
          {T.allgemein.speicherProblem}
        </p>
      )}
      <AppRouter />

      <Modal
        offen={frage !== null}
        titel={
          frage === 'abenteuer'
            ? T.einstellungen.zuAbenteuer
            : frage === 'redlingo'
              ? T.einstellungen.zuRedlingo
              : T.einstellungen.zuModern
        }
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
          XP, Serie, Wörter, Einheiten und deine Sterne zählen in allen drei Modi gemeinsam.
        </p>
      </Modal>
    </AppShell>
  )
}

export default function App() {
  const [eingerichtet, setEingerichtet] = useState(() => istEingerichtet())
  const [konto, setKonto] = useState({ status: 'laedt', wert: null, fehler: '' })

  async function kontoPruefen() {
    setKonto((alt) => ({ ...alt, status: 'laedt', fehler: '' }))
    // Local-first: gibt es keinen Anmelde-Server (lokal, Vercel, offline),
    // läuft die App ohne Konto weiter — der Lernstand liegt ohnehin im Browser.
    // Nur wenn der Server da ist, verlangt sie eine Anmeldung — es sei denn,
    // die Nutzerin hat sich ausdrücklich für „ohne Konto lernen“ entschieden.
    const { backend, konto: wert } = await kontoStatus()
    if (!backend || (!wert && lies(KEYS.ohneKonto) === true)) {
      setKonto({ status: 'lokal', wert: null, fehler: '' })
      return
    }
    // Eine bestehende Sitzung raeumt eine liegengebliebene Gast-Entscheidung ab.
    if (wert) entferne(KEYS.ohneKonto)
    setKonto({ status: wert ? 'angemeldet' : 'gast', wert, fehler: '' })
  }

  function ohneKontoWeiter() {
    schreibe(KEYS.ohneKonto, true)
    setKonto({ status: 'lokal', wert: null, fehler: '' })
  }

  useEffect(() => {
    kontoPruefen()
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

  if (konto.status === 'laedt') return <AuthLoading />

  if (konto.status === 'gast') {
    return (
      <AuthPage
        anfangsFehler={konto.fehler}
        onErneut={kontoPruefen}
        onErfolg={(wert) => {
          // Eine echte Anmeldung hebt die „ohne Konto“-Entscheidung auf.
          entferne(KEYS.ohneKonto)
          setKonto({ status: 'angemeldet', wert, fehler: '' })
        }}
        onOhneKonto={ohneKontoWeiter}
      />
    )
  }

  if (!eingerichtet) {
    return <Onboarding fertig={() => setEingerichtet(true)} />
  }

  return (
    <RouterProvider>
      <Rahmen />
    </RouterProvider>
  )
}
