// Ein Lernpfad als Karte: Kopf, echter Fortschritt, aufklappbare Lektionen.
// Der Status jeder Lektion kommt aus dem gespeicherten Lernstand.
import { useState } from 'react'
import Badge from '../../components/common/Badge.tsx'
import PrimaryButton from '../../components/common/PrimaryButton.tsx'
import ProgressBar from '../../components/common/ProgressBar.tsx'
import LektionModal from '../app-mode/LektionModal.tsx'
import LektionPlayer from '../app-mode/LektionPlayer.tsx'
import CodeLessonCard from './CodeLessonCard.tsx'
import LernpfadKarte from '../app-mode/LernpfadKarte.tsx'
import { codeLernstand } from './codeProgressStore.ts'
import { holeSchritte } from './data/codeSchritte.js'

import type { Bereichslektion, Lernpfad } from '../../types/lernbereich'

export interface CodeLearningPathProps {
  path: Lernpfad
}

export default function CodeLearningPath({ path }: CodeLearningPathProps) {
  const [offen, setOffen] = useState(false)
  const [aktiveLektion, setAktiveLektion] = useState<Bereichslektion | null>(null)
  // Zwei Darstellungen derselben Lektionen: nüchterne Liste oder Wegkarte.
  const [alsKarte, setAlsKarte] = useState(false)

  const status = codeLernstand.statusFuer(path.lessons)
  const fortschritt = codeLernstand.fortschrittProzent(path.lessons)
  const begonnen = fortschritt > 0

  function abschliessen(): void {
    if (aktiveLektion) codeLernstand.schliesseAb(aktiveLektion.id)
    setAktiveLektion(null)
  }

  // Einmal nachschlagen statt zweimal: der Aufruf in der Bedingung engt den
  // zweiten sonst nicht ein, und `schritte` waere weiter „vielleicht nichts".
  const schritte = aktiveLektion ? holeSchritte(aktiveLektion.id) : undefined

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
      {aktiveLektion && schritte ? (
        <LektionPlayer
          key={aktiveLektion.id}
          lektion={aktiveLektion}
          schritte={schritte}
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
