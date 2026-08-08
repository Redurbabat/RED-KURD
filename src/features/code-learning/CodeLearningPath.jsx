// Ein Lernpfad als Karte: Kopf, echter Fortschritt, aufklappbare Lektionen.
// Der Status jeder Lektion kommt aus dem gespeicherten Lernstand.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import LektionModal from '../app-mode/LektionModal.jsx'
import LektionPlayer from '../app-mode/LektionPlayer.jsx'
import CodeLessonCard from './CodeLessonCard.jsx'
import LernpfadKarte from '../app-mode/LernpfadKarte.jsx'
import { codeLernstand } from './codeProgressStore.ts'
import { holeSchritte } from './data/codeSchritte.js'

/**
 * @param {{path:{id:string,title:string,icon:string,description:string,
 *          level:string,lessons:Array}}} props
 */
export default function CodeLearningPath({ path }) {
  const [offen, setOffen] = useState(false)
  const [aktiveLektion, setAktiveLektion] = useState(null)
  // Zwei Darstellungen derselben Lektionen: nüchterne Liste oder Wegkarte.
  const [alsKarte, setAlsKarte] = useState(false)

  const status = codeLernstand.statusFuer(path.lessons)
  const fortschritt = codeLernstand.fortschrittProzent(path.lessons)
  const begonnen = fortschritt > 0

  function abschliessen() {
    if (aktiveLektion) codeLernstand.schliesseAb(aktiveLektion.id)
    setAktiveLektion(null)
  }

  return (
    <section className="rk-karte cl-pfad">
      <header className="cl-pfad-kopf">
        <span className="cl-pfad-symbol" aria-hidden="true">
          {path.icon}
        </span>
        <div className="cl-pfad-titel">
          <h3>{path.title}</h3>
          <Badge ton="blau">{path.level}</Badge>
        </div>
      </header>

      <p className="cl-pfad-text">{path.description}</p>

      <ProgressBar wert={fortschritt} label={`Fortschritt ${path.title}`} zeigeWert klein />

      <div className="cl-pfad-fuss">
        <PrimaryButton
          art={begonnen ? 'blau' : 'still'}
          icon={offen ? 'pfeilRunter' : 'play'}
          aria-expanded={offen}
          onClick={() => setOffen((o) => !o)}
        >
          {offen ? 'Lektionen verbergen' : begonnen ? 'Weiterlernen' : 'Starten'}
        </PrimaryButton>
        <span className="cl-pfad-anzahl">{path.lessons.length} Lektionen</span>
      </div>

      {offen && (
        <>
          <div className="pfad-ansicht-wahl" role="group" aria-label="Darstellung der Lektionen">
            <button
              type="button"
              className={`pfad-ansicht-knopf${!alsKarte ? ' aktiv' : ''}`}
              aria-pressed={!alsKarte}
              onClick={() => setAlsKarte(false)}
            >
              Liste
            </button>
            <button
              type="button"
              className={`pfad-ansicht-knopf${alsKarte ? ' aktiv' : ''}`}
              aria-pressed={alsKarte}
              onClick={() => setAlsKarte(true)}
            >
              Wegkarte
            </button>
          </div>

          {alsKarte ? (
            <LernpfadKarte
              lessons={path.lessons}
              status={status}
              oeffnen={setAktiveLektion}
            />
          ) : (
            <ul className="cl-lektionen">
              {path.lessons.map((lesson) => (
                <CodeLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={status[lesson.id]}
                  onOeffnen={() => setAktiveLektion(lesson)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Lektionen mit interaktiven Schritten oeffnen den Player (wie Mimo,
          mit Live-Vorschau) — alle anderen das bewaehrte Lese-Modal. */}
      {aktiveLektion && holeSchritte(aktiveLektion.id) ? (
        <LektionPlayer
          key={aktiveLektion.id}
          lektion={aktiveLektion}
          schritte={holeSchritte(aktiveLektion.id)}
          lernstand={codeLernstand}
          schliessen={() => setAktiveLektion(null)}
        />
      ) : (
        <LektionModal
          lektion={aktiveLektion}
          erledigt={aktiveLektion ? codeLernstand.istErledigt(aktiveLektion.id) : false}
          schliessen={() => setAktiveLektion(null)}
          abschliessen={abschliessen}
        />
      )}
    </section>
  )
}
