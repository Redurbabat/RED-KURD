// Führt ein einzelnes Training aus. Die reinen Trainings speichern die Sitzung
// bewusst nicht — sonst würde die Tagessitzung unter /session überschrieben.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import {
  planeSitzung,
  planeWiederholung,
  planeSchwierige,
  planeTraining,
} from '../../../core/session/sessionPlanner.js'
import { standardDauer } from '../../../core/profile/profileStore.js'
import { baueUebungen } from '../../../core/session/exerciseFactory.js'
import ExercisePlayer from '../../../features/exercise/ExercisePlayer.jsx'
import ExerciseResult from '../../../features/exercise/ExerciseResult.jsx'
import SentenceBuilder from '../../../features/sentence-builder/SentenceBuilder.jsx'
import PronunciationStudio from '../../../features/speaking/PronunciationStudio.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import EmptyState, { ErrorState } from '../../../components/common/EmptyState.jsx'

const XP_JE_AUFGABE = 10

/** Zuordnung Adresse -> Plan. Nur diese Kennungen sind Übungs-Trainings. */
const TRAININGS = {
  mix: { titel: 'Heutige Mischung', plane: () => planeSitzung(standardDauer()) },
  review: {
    titel: 'Wiederholen',
    plane: () => planeWiederholung(15),
    leer: 'Es ist gerade keine Wiederholung fällig. Lerne eine neue Einheit — die neuen Wörter kommen morgen zurück.',
  },
  hard: {
    titel: 'Schwierige Wörter',
    plane: () => planeSchwierige(10),
    leer: 'Gerade fällt dir kein Wort besonders schwer. Wörter, die du mehrmals falsch beantwortest, landen hier.',
  },
  images: { titel: 'Bilder', plane: () => planeTraining('bild', 12) },
  listening: { titel: 'Hören', plane: () => planeTraining('hoeren', 12) },
  writing: { titel: 'Schreiben', plane: () => planeTraining('tippen', 12) },
}

function planeRunde(trainingId) {
  const training = TRAININGS[trainingId]
  if (!training) return null
  try {
    const plan = training.plane()
    return {
      schluessel: `${trainingId}-${Date.now()}`,
      titel: (plan && plan.titel) || training.titel,
      uebungen: (plan && plan.uebungen) || [],
      fehlgeschlagen: false,
    }
  } catch {
    return { schluessel: `${trainingId}-fehler`, titel: training.titel, uebungen: [], fehlgeschlagen: true }
  }
}

export default function PracticeRunPage({ trainingId }) {
  useLernstand()
  const [runde, setRunde] = useState(() => planeRunde(trainingId))
  const [geplantFuer, setGeplantFuer] = useState(trainingId)
  const [ergebnis, setErgebnis] = useState(null)

  // Wechselt die Adresse auf ein anderes Training, beginnt alles von vorn.
  if (geplantFuer !== trainingId) {
    setGeplantFuer(trainingId)
    setRunde(planeRunde(trainingId))
    setErgebnis(null)
  }

  function neuePlanung() {
    setRunde(planeRunde(trainingId))
    setErgebnis(null)
  }

  function fehlerUeben() {
    const uebungen = baueUebungen(ergebnis.fehler)
    if (!uebungen.length) return
    setRunde({
      schluessel: 'fehler-runde-' + Date.now(),
      titel: 'Fehler üben',
      uebungen,
      fehlgeschlagen: false,
    })
    setErgebnis(null)
  }

  if (trainingId === 'speaking') {
    return (
      <>
        <PageHeader
          titel="Aussprache"
          untertitel="Anhören, nachsprechen, aufnehmen und vergleichen."
          variante="sprechen"
          zurueck="/practice"
          zurueckText="Zum Üben"
        />
        <PronunciationStudio />
      </>
    )
  }

  if (trainingId === 'sentence-builder') {
    return (
      <>
        <PageHeader
          titel="Satzbau"
          untertitel="Bringe die Wörter in die richtige Reihenfolge."
          variante="denken"
          zurueck="/practice"
          zurueckText="Zum Üben"
        />
        <SentenceBuilder />
      </>
    )
  }

  if (!runde) {
    return (
      <>
        <PageHeader
          titel="Training nicht gefunden"
          untertitel="Diese Adresse gehört zu keinem Training."
          variante="denken"
          zurueck="/practice"
          zurueckText="Zum Üben"
        />
        <EmptyState
          titel="Dieses Training gibt es nicht"
          text={`Zur Kennung „${trainingId}“ gibt es kein Training. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen.`}
          variante="denken"
          aktion={() => navigiere('/practice')}
          aktionText="Zurück zum Üben"
        />
      </>
    )
  }

  if (runde.fehlgeschlagen) {
    return (
      <ErrorState
        titel="Das Training liess sich nicht zusammenstellen."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
        nochmal={neuePlanung}
      />
    )
  }

  if (!runde.uebungen.length) {
    return (
      <EmptyState
        variante="feiern"
        titel="Nichts zu wiederholen — super!"
        text={
          (TRAININGS[trainingId] && TRAININGS[trainingId].leer) ||
          'Für dieses Training liessen sich gerade keine Aufgaben zusammenstellen. Starte zuerst eine Einheit im Kurs.'
        }
        aktion={() => navigiere('/practice')}
        aktionText="Zurück zum Üben"
      />
    )
  }

  if (ergebnis) {
    return (
      <ExerciseResult
        stil="modern"
        ergebnis={ergebnis}
        belohnung={{ xp: ergebnis.richtig * XP_JE_AUFGABE }}
        weiter={() => navigiere('/practice')}
        wiederholen={neuePlanung}
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
      /* Trainings sind eigenstaendig — die Tagessitzung unter /session
         darf dabei nie ueberschrieben werden. */
      speichern={false}
      abbrechen={() => navigiere('/practice')}
      fertig={(erg) => setErgebnis(erg)}
    />
  )
}
