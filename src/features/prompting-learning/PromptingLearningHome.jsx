// Startseite des Bereichs „AI-Sprache": klare Auftraege an KIs lernen.
// XP, Reihe und Fortschritt kommen aus dem echten, gespeicherten Lernstand.
import { useState } from 'react'
import { useLernstand } from '../../core/store.js'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import LektionModal from '../app-mode/LektionModal.jsx'
import UebungModal from '../app-mode/UebungModal.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { TAGESZIEL_XP } from '../../core/lernbereiche/bereichsLernstand.js'
import PromptLessonCard from './PromptLessonCard.jsx'
import PromptTrainingCard from './PromptTrainingCard.jsx'
import { promptLessons } from './data/promptLessons.js'
import { promptExercises } from './data/promptExercises.js'
import { promptLernstand } from './promptProgressStore.js'
import './promptingLearning.css'

export default function PromptingLearningHome() {
  useLernstand()
  const [aktiveLektion, setAktiveLektion] = useState(null)
  const [aktiveUebung, setAktiveUebung] = useState(null)

  const status = promptLernstand.statusFuer(promptLessons)
  const gesamt = promptLernstand.fortschrittProzent(promptLessons)
  const naechste = promptLessons.find((l) => status[l.id] === 'current') || null
  const offeneUebungen = promptExercises.filter((u) => !promptLernstand.istErledigt(u.id)).length
  const xpHeute = promptLernstand.xpHeute()

  function abschliessen() {
    if (aktiveLektion) promptLernstand.schliesseAb(aktiveLektion.id)
    setAktiveLektion(null)
  }

  return (
    <div className="bereich-seite bereich-prompting">
      <header className="bereich-kopf">
        <h1>
          <span aria-hidden="true">🤖</span> AI-Sprache lernen
        </h1>
        <p>Lerne, wie du ChatGPT, Claude und Claude Code klare Aufgaben gibst.</p>

        <div className="bereich-werte">
          <span className="bereich-wert">
            <Icon name="blitz" groesse={16} />
            <span>
              XP heute: <strong>{xpHeute}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="flamme" groesse={16} />
            <span>
              Reihe:{' '}
              <strong>
                {promptLernstand.serie()} {promptLernstand.serie() === 1 ? 'Tag' : 'Tage'}
              </strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="stift" groesse={16} />
            <span>
              Offene Übungen: <strong>{offeneUebungen}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="fortschritt" groesse={16} />
            <span>
              Gesamt: <strong>{gesamt} %</strong>
            </span>
          </span>
        </div>

        <div className="bereich-tagesziel">
          <span className="bereich-tagesziel-text">
            Tagesziel: {Math.min(xpHeute, TAGESZIEL_XP)}/{TAGESZIEL_XP} XP
            {xpHeute >= TAGESZIEL_XP ? ' — geschafft!' : ''}
          </span>
          <ProgressBar wert={xpHeute} max={TAGESZIEL_XP} label="Tagesziel" klein />
        </div>
      </header>

      {naechste && (
        <Card titel="Heute lernen" icon="heute">
          <p className="pl-heute">
            <strong>{naechste.title}</strong> — {naechste.description}{' '}
            <span className="pl-meta">
              (<Icon name="uhr" groesse={14} /> ca. {naechste.durationMinutes} Min)
            </span>
          </p>
        </Card>
      )}

      <section className="bereich-abschnitt" aria-labelledby="pl-lektionen-titel">
        <h2 id="pl-lektionen-titel">Lektionen</h2>
        <div className="bereich-raster">
          {promptLessons.map((lesson) => (
            <PromptLessonCard
              key={lesson.id}
              lesson={lesson}
              status={status[lesson.id]}
              onOeffnen={() => setAktiveLektion(lesson)}
            />
          ))}
        </div>
      </section>

      <section className="bereich-abschnitt" aria-labelledby="pl-training-titel">
        <h2 id="pl-training-titel">Training: selbst formulieren</h2>
        <div className="bereich-raster">
          {promptExercises.map((exercise) => (
            <PromptTrainingCard
              key={exercise.id}
              exercise={exercise}
              erledigt={promptLernstand.istErledigt(exercise.id)}
              onOeffnen={() => setAktiveUebung(exercise)}
            />
          ))}
        </div>
      </section>

      <LektionModal
        lektion={aktiveLektion}
        erledigt={aktiveLektion ? promptLernstand.istErledigt(aktiveLektion.id) : false}
        schliessen={() => setAktiveLektion(null)}
        abschliessen={abschliessen}
      />

      <UebungModal
        key={aktiveUebung?.id || 'leer'}
        uebung={aktiveUebung}
        lernstand={promptLernstand}
        schliessen={() => setAktiveUebung(null)}
      />
    </div>
  )
}
