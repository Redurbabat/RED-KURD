// Die gemischte Tagessitzung. Läuft ohne Navigation, damit nichts ablenkt.
// Entweder wird eine gespeicherte Sitzung fortgesetzt oder eine neue geplant.
import { useEffect, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere, useRoute } from '../../../app/router.jsx'
import { DAUERN, planeSitzung } from '../../../core/session/sessionPlanner.js'
import { sitzungLaden } from '../../../core/session/sessionStore.js'
import { baueUebungen } from '../../../core/session/exerciseFactory.js'
import { standardDauer } from '../../../core/profile/profileStore.js'
import ExercisePlayer from '../../../features/exercise/ExercisePlayer.jsx'
import ExerciseResult from '../../../features/exercise/ExerciseResult.jsx'
import EmptyState, { ErrorState } from '../../../components/common/EmptyState.jsx'

const SCHLUESSEL_DAUER = 'rk-dauer'
const XP_JE_AUFGABE = 10

/** Die auf der Startseite gewählte Dauer, sonst der Vorschlag aus dem Profil. */
function gewaehlteDauer() {
  try {
    const id = window.sessionStorage.getItem(SCHLUESSEL_DAUER)
    if (id && DAUERN.some((d) => d.id === id)) return id
  } catch {
    /* Kein sessionStorage verfügbar — dann gilt der Wert aus dem Profil. */
  }
  return standardDauer()
}

function planeNeueRunde() {
  try {
    const plan = planeSitzung(gewaehlteDauer())
    return {
      schluessel: 'neu-' + Date.now(),
      uebungen: plan.uebungen || [],
      titel: plan.titel,
      index: 0,
      punkte: 0,
      fehlgeschlagen: false,
    }
  } catch {
    return {
      schluessel: 'fehler-' + Date.now(),
      uebungen: [],
      titel: 'Heutige Mischung',
      index: 0,
      punkte: 0,
      fehlgeschlagen: true,
    }
  }
}

function ersteRunde(neuGewuenscht) {
  if (!neuGewuenscht) {
    const s = sitzungLaden()
    if (s) {
      return {
        schluessel: 'fort-' + (s.gespeichert || s.uebungen.length),
        uebungen: s.uebungen,
        titel: s.titel,
        index: s.index,
        punkte: s.punkte || 0,
        fehlgeschlagen: false,
      }
    }
  }
  return planeNeueRunde()
}

export default function SessionPage() {
  useLernstand()
  const { voll } = useRoute()
  const neuGewuenscht = /[?&]neu=1(&|$)/.test(voll || '')
  const [runde, setRunde] = useState(() => ersteRunde(neuGewuenscht))
  const [ergebnis, setErgebnis] = useState(null)

  // Adresse aufräumen: nach dem Start soll ein Neuladen fortsetzen, nicht neu planen.
  useEffect(() => {
    if (neuGewuenscht) navigiere('/session', { ersetzen: true, haltePosition: true })
  }, [neuGewuenscht])

  function fehlerUeben() {
    const uebungen = baueUebungen(ergebnis.fehler)
    if (!uebungen.length) return
    setRunde({
      schluessel: 'fehler-runde-' + Date.now(),
      uebungen,
      titel: 'Fehler üben',
      index: 0,
      punkte: 0,
      fehlgeschlagen: false,
    })
    setErgebnis(null)
  }

  if (runde.fehlgeschlagen) {
    return (
      <ErrorState
        titel="Die Sitzung liess sich nicht zusammenstellen."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
        nochmal={() => setRunde(planeNeueRunde())}
      />
    )
  }

  if (!runde.uebungen.length) {
    return (
      <EmptyState
        variante="denken"
        titel="Heute gibt es hier keine Aufgaben."
        text="Für diese Sitzung liessen sich keine Aufgaben zusammenstellen. Starte zuerst ein Kapitel im Kurs."
        aktion={() => navigiere('/today')}
        aktionText="Zurück zu Heute"
      />
    )
  }

  if (ergebnis) {
    return (
      <ExerciseResult
        stil="modern"
        ergebnis={ergebnis}
        belohnung={{ xp: ergebnis.richtig * XP_JE_AUFGABE }}
        weiter={() => navigiere('/today')}
        fehlerUeben={ergebnis.fehler.length ? fehlerUeben : undefined}
      />
    )
  }

  return (
    <ExercisePlayer
      key={runde.schluessel}
      uebungen={runde.uebungen}
      titel={runde.titel}
      stil="modern"
      startIndex={runde.index}
      startPunkte={runde.punkte}
      mitLeben={false}
      abbrechen={() => navigiere('/today')}
      fertig={(erg) => setErgebnis(erg)}
    />
  )
}
