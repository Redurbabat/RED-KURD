// Startseite des Bereichs „AI-Sprache": klare Auftraege an KIs lernen.
// XP, Reihe und Fortschritt kommen aus dem echten, gespeicherten Lernstand.
import { useState } from 'react'
import { useLernstand } from '../../core/store.ts'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import Icon from '../../components/icons/Icon.jsx'
import LektionModal from '../app-mode/LektionModal.jsx'
import UebungModal from '../app-mode/UebungModal.jsx'
import PraxisAufgabe from '../app-mode/PraxisAufgabe.jsx'
import LernpfadKarte from '../app-mode/LernpfadKarte.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { TAGESZIEL_XP } from '../../core/lernbereiche/bereichsLernstand.js'
import PromptLessonCard from './PromptLessonCard.jsx'
import PromptTrainingCard from './PromptTrainingCard.jsx'
import { promptLessons } from './data/promptLessons.js'
import { promptExercises } from './data/promptExercises.js'
import { promptPraxisAufgaben } from './data/promptPraxis.js'
import { promptLernstand } from './promptProgressStore.js'
import './promptingLearning.css'

/**
 * Der Lernbereich der AI-Sprache (Lektionen, Mitmachen, Training).
 * @param {{ohneKopf?:boolean}} props — innerhalb der App-Hülle trägt
 *   PromptingApp bereits Titel und Kennzahlen.
 */
export default function PromptingLearningHome({ ohneKopf = false }) {
  useLernstand()
  const [aktiveLektion, setAktiveLektion] = useState(null)
  const [aktiveUebung, setAktiveUebung] = useState(null)
  const [aktivePraxis, setAktivePraxis] = useState(null)
  // Zwei Darstellungen derselben Lektionen: Liste oder Wegkarte.
  const [alsKarte, setAlsKarte] = useState(false)

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
    <div className={ohneKopf ? 'pl-lernen' : 'bereich-seite bereich-prompting'}>
      {!ohneKopf && (
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
      )}

      <section className="bereich-abschnitt" aria-labelledby="pl-praxis-titel">
        <h2 id="pl-praxis-titel">Mitmachen: mit Prüfliste schreiben</h2>
        <p className="pl-text">
          Schreib deinen Auftrag hier in der App — die Prüfliste zeigt live, welche
          Bausteine noch fehlen.
        </p>
        <div className="bereich-raster">
          {promptPraxisAufgaben.map((aufgabe) => (
            <Card key={aufgabe.id} className="pl-uebung">
              <div className="pl-uebung-kopf">
                <h3>{aufgabe.title}</h3>
                {promptLernstand.istErledigt(aufgabe.id) ? (
                  <Badge ton="gruen" icon="haken">
                    Erledigt
                  </Badge>
                ) : (
                  <Badge ton="gold">{aufgabe.topic}</Badge>
                )}
              </div>
              <p className="pl-text">{aufgabe.description}</p>
              <p className="pl-meta">
                <Icon name="uhr" groesse={14} /> ca. {aufgabe.estimatedMinutes} Min · mit
                Prüfliste
              </p>
              <PrimaryButton art="still" icon="play" onClick={() => setAktivePraxis(aufgabe)}>
                {promptLernstand.istErledigt(aufgabe.id) ? 'Ansehen' : 'Loslegen'}
              </PrimaryButton>
            </Card>
          ))}
        </div>
      </section>

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
          <LernpfadKarte lessons={promptLessons} status={status} oeffnen={setAktiveLektion} />
        ) : (
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
        )}
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

      <PraxisAufgabe
        key={aktivePraxis?.id || 'keine'}
        aufgabe={aktivePraxis}
        lernstand={promptLernstand}
        schliessen={() => setAktivePraxis(null)}
      />
    </div>
  )
}
