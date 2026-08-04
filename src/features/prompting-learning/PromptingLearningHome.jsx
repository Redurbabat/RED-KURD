// Startseite des Bereichs „AI-Sprache": klare Auftraege an KIs lernen.
// XP/Reihe sind bewusst noch Beispielwerte — die Speicherung kommt spaeter.
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PromptLessonCard from './PromptLessonCard.jsx'
import PromptTrainingCard from './PromptTrainingCard.jsx'
import { naechstePromptLektion, promptLessons } from './data/promptLessons.js'
import { promptExercises } from './data/promptExercises.js'
import './promptingLearning.css'

export default function PromptingLearningHome() {
  const naechste = naechstePromptLektion()
  const erledigt = promptLessons.filter((l) => l.status === 'done').length
  const gesamt = Math.round((erledigt / promptLessons.length) * 100)

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
              XP heute: <strong>40</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="flamme" groesse={16} />
            <span>
              Reihe: <strong>3 Tage</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="stift" groesse={16} />
            <span>
              Offene Übungen: <strong>{promptExercises.length}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="fortschritt" groesse={16} />
            <span>
              Gesamt: <strong>{gesamt} %</strong>
            </span>
          </span>
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
            <PromptLessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      <section className="bereich-abschnitt" aria-labelledby="pl-training-titel">
        <h2 id="pl-training-titel">Training: selbst formulieren</h2>
        <div className="bereich-raster">
          {promptExercises.map((exercise) => (
            <PromptTrainingCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </section>
    </div>
  )
}
