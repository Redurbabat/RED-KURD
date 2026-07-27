// Lektionsablauf: Übungen abspielen, Ergebnis zeigen, Mini-Prüfung werten.
import { useEffect, useRef, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { planeLektion } from '../../../core/session/sessionPlanner.js'
import { baueUebungen } from '../../../core/session/exerciseFactory.js'
import { einheitAbgeschlossen, setzeSterne } from '../../../core/progress/progressStore.js'
import { BESTANDEN_AB } from '../../../core/courses/courseRepository.js'
import ExercisePlayer from '../../../features/exercise/ExercisePlayer.jsx'
import ExerciseResult from '../../../features/exercise/ExerciseResult.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import EmptyState, { LoadingState } from '../../../components/common/EmptyState.jsx'
import './LessonPage.css'

const XP_JE_AUFGABE = 10

/**
 * Ein Durchgang. Der Plan liegt im Zustand, damit die Aufgaben beim
 * Neuzeichnen nicht neu gewürfelt werden. `schluessel` bindet ihn an die Adresse.
 */
function baueLauf(schluessel, unitId, lessonId, nr) {
  const plan = planeLektion(unitId, lessonId)
  return {
    schluessel,
    nr,
    plan,
    uebungen: plan ? plan.uebungen : [],
    titel: plan ? plan.titel : '',
    werten: !!(plan && plan.lektion && plan.lektion.pruefung),
    fehlerlauf: false,
  }
}

export default function LessonPage({ unitId, lessonId }) {
  useLernstand()

  const schluessel = unitId + '/' + lessonId
  const [lauf, setLauf] = useState(() => baueLauf(schluessel, unitId, lessonId, 0))
  const [ergebnis, setErgebnis] = useState(null)
  const [sterne, setSterne] = useState(null)
  const gewertet = useRef(false)

  // Neue Adresse -> neuer Durchgang, altes Ergebnis verwerfen.
  useEffect(() => {
    setLauf((alt) => (alt.schluessel === schluessel ? alt : baueLauf(schluessel, unitId, lessonId, 0)))
    setErgebnis(null)
    setSterne(null)
    gewertet.current = false
  }, [schluessel, unitId, lessonId])

  // Eine Mini-Prüfung zählt genau einmal je Durchgang für den Lernstand.
  useEffect(() => {
    if (!ergebnis || !lauf.werten || gewertet.current) return
    gewertet.current = true
    einheitAbgeschlossen(unitId, ergebnis.prozent)
    setSterne(setzeSterne(unitId, ergebnis.prozent))
  }, [ergebnis, lauf, unitId])

  // Der Zustand gehört noch zur vorigen Adresse — der Effekt oben baut ihn sofort neu auf.
  if (lauf.schluessel !== schluessel) return <LoadingState text="Lektion wird vorbereitet …" />

  const plan = lauf.plan

  if (!plan || plan.uebungen.length === 0) {
    const ziel = plan ? '/course/' + unitId : '/course'
    return (
      <>
        <PageHeader
          titel="Lektion nicht gefunden"
          untertitel="Diese Lektion konnten wir nicht vorbereiten."
          variante="denken"
          zurueck={ziel}
        />
        <EmptyState
          titel="Hier gibt es gerade nichts zu üben."
          text="Vielleicht stimmt die Adresse nicht. Gehe zurück und wähle einen Schritt der Einheit."
          variante="denken"
          aktion={() => navigiere(ziel)}
          aktionText="Zurück zum Kurs"
        />
      </>
    )
  }

  const einheit = plan.einheit
  const lektion = plan.lektion
  const platz = einheit.lektionen.findIndex((l) => l.id === lektion.id)
  const naechste = platz >= 0 ? einheit.lektionen[platz + 1] || null : null

  function neuStarten() {
    const neu = baueLauf(schluessel, unitId, lessonId, lauf.nr + 1)
    // Sollte der Planer nichts liefern, laufen die Aufgaben von eben noch einmal.
    setLauf(
      neu.uebungen.length
        ? neu
        : { ...lauf, nr: lauf.nr + 1, uebungen: plan.uebungen, titel: plan.titel,
            werten: !!lektion.pruefung, fehlerlauf: false }
    )
    setErgebnis(null)
    setSterne(null)
    gewertet.current = false
  }

  function fehlerUeben() {
    const uebungen = baueUebungen(ergebnis.fehler)
    if (!uebungen.length) return
    setLauf({
      ...lauf,
      nr: lauf.nr + 1,
      uebungen,
      titel: `Fehler üben · ${einheit.name}`,
      werten: false,
      fehlerlauf: true,
    })
    setErgebnis(null)
    setSterne(null)
  }

  if (!ergebnis) {
    return (
      <ExercisePlayer
        speichern={false}
        key={lauf.schluessel + '#' + lauf.nr}
        stil="modern"
        uebungen={lauf.uebungen}
        titel={lauf.titel}
        abbrechen={() => navigiere('/course/' + unitId)}
        fertig={setErgebnis}
      />
    )
  }

  let ergebnisTitel
  if (lauf.fehlerlauf) ergebnisTitel = 'Fehler geübt!'
  else if (lauf.werten)
    ergebnisTitel = ergebnis.prozent >= BESTANDEN_AB ? 'Mini-Prüfung bestanden!' : 'Noch nicht bestanden'
  else ergebnisTitel = `Schritt ${lektion.nr} geschafft!`

  return (
    <>
      <ExerciseResult
        stil="modern"
        titel={ergebnisTitel}
        ergebnis={ergebnis}
        sterne={sterne}
        belohnung={{ xp: ergebnis.richtig * XP_JE_AUFGABE }}
        weiter={() => navigiere('/course/' + unitId)}
        wiederholen={neuStarten}
        fehlerUeben={fehlerUeben}
      />

      {naechste && (
        <div className="lesson-naechster">
          <PrimaryButton
            breit
            groesse="gross"
            art="gruen"
            iconRechts="pfeilRechts"
            onClick={() => navigiere(`/course/${unitId}/lesson/${naechste.id}`)}
          >
            Weiter zu Schritt {naechste.nr}
          </PrimaryButton>
          <p className="gedaempft zentriert">
            {naechste.name} · {naechste.dauer}
          </p>
        </div>
      )}

      {lauf.werten && ergebnis.prozent < BESTANDEN_AB && (
        <p className="lesson-hinweis gedaempft zentriert">
          Ab {BESTANDEN_AB} % gilt die Einheit als bestanden — wiederhole die Prüfung, wenn du magst.
        </p>
      )}
    </>
  )
}
