// Startseite des Bereichs „Elektro-Lehre": Grundlagen, Sicherheit, Praxis.
// XP, Reihe und Fortschritt kommen aus dem echten, gespeicherten Lernstand.
import { useState } from 'react'
import { useLernstand } from '../../core/store.js'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import LektionModal from '../app-mode/LektionModal.jsx'
import UebungModal from '../app-mode/UebungModal.jsx'
import PraxisAufgabe from '../app-mode/PraxisAufgabe.jsx'
import { TAGESZIEL_XP } from '../../core/lernbereiche/bereichsLernstand.js'
import ElectroLessonCard from './ElectroLessonCard.jsx'
import { electroGruppen, electroLessons } from './data/electroLessons.js'
import { electroExercises } from './data/electroExercises.js'
import { electroPraxisAufgaben } from './data/electroPraxis.js'
import { electroLernstand } from './electroProgressStore.js'
import './electroLearning.css'

export default function ElectroLearningHome() {
  useLernstand()
  const [aktiveLektion, setAktiveLektion] = useState(null)
  const [aktiveUebung, setAktiveUebung] = useState(null)
  const [aktivePraxis, setAktivePraxis] = useState(null)

  const status = electroLernstand.statusFuer(electroLessons)
  const gesamt = electroLernstand.fortschrittProzent(electroLessons)
  const naechste = electroLessons.find((l) => status[l.id] === 'current') || null
  const offeneUebungen = electroExercises.filter((u) => !electroLernstand.istErledigt(u.id)).length
  const xpHeute = electroLernstand.xpHeute()

  function abschliessen() {
    if (aktiveLektion) electroLernstand.schliesseAb(aktiveLektion.id)
    setAktiveLektion(null)
  }

  return (
    <div className="bereich-seite bereich-electro">
      <header className="bereich-kopf">
        <h1>
          <span aria-hidden="true">⚡</span> Elektro-Lehre
        </h1>
        <p>
          Verstehe Strom, Spannung und Sicherheit — Schritt für Schritt, mit den Regeln der
          Ausbildung. Theorie zum Verstehen: An Anlagen arbeiten Elektrofachkräfte.
        </p>

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
                {electroLernstand.serie()} {electroLernstand.serie() === 1 ? 'Tag' : 'Tage'}
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
          <p className="el-heute">
            <strong>{naechste.title}</strong> — {naechste.description}{' '}
            <span className="el-meta">
              (<Icon name="uhr" groesse={14} /> ca. {naechste.durationMinutes} Min)
            </span>
          </p>
        </Card>
      )}

      {electroGruppen.map((gruppe) => (
        <section key={gruppe} className="bereich-abschnitt" aria-label={gruppe}>
          <h2>{gruppe}</h2>
          <div className="bereich-raster">
            {electroLessons
              .filter((l) => l.gruppe === gruppe)
              .map((lesson) => (
                <ElectroLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={status[lesson.id]}
                  onOeffnen={() => setAktiveLektion(lesson)}
                />
              ))}
          </div>
        </section>
      ))}

      <section className="bereich-abschnitt" aria-labelledby="el-praxis-titel">
        <h2 id="el-praxis-titel">Rechnen: direkt prüfen</h2>
        <p className="el-text">
          Tippe dein Ergebnis ein — die App prüft sofort, ob es stimmt.
        </p>
        <div className="bereich-raster">
          {electroPraxisAufgaben.map((aufgabe) => (
            <Card key={aufgabe.id} className="el-uebung">
              <div className="el-uebung-kopf">
                <h3>{aufgabe.title}</h3>
                {electroLernstand.istErledigt(aufgabe.id) ? (
                  <Badge ton="gruen" icon="haken">
                    Erledigt
                  </Badge>
                ) : (
                  <Badge ton="gold">{aufgabe.topic}</Badge>
                )}
              </div>
              <p className="el-text">{aufgabe.description}</p>
              <p className="el-meta">
                <Icon name="uhr" groesse={14} /> ca. {aufgabe.estimatedMinutes} Min · mit
                Sofort-Prüfung
              </p>
              <PrimaryButton art="still" icon="play" onClick={() => setAktivePraxis(aufgabe)}>
                {electroLernstand.istErledigt(aufgabe.id) ? 'Ansehen' : 'Loslegen'}
              </PrimaryButton>
            </Card>
          ))}
        </div>
      </section>

      <section className="bereich-abschnitt" aria-labelledby="el-uebungen-titel">
        <h2 id="el-uebungen-titel">Übungen</h2>
        <div className="bereich-raster">
          {electroExercises.map((uebung) => (
            <Card key={uebung.id} className="el-uebung">
              <div className="el-uebung-kopf">
                <h3>{uebung.title}</h3>
                {electroLernstand.istErledigt(uebung.id) ? (
                  <Badge ton="gruen" icon="haken">
                    Erledigt
                  </Badge>
                ) : (
                  <Badge ton="gold">{uebung.topic}</Badge>
                )}
              </div>
              <p className="el-text">{uebung.description}</p>
              <p className="el-meta">
                <Icon name="uhr" groesse={14} /> ca. {uebung.estimatedMinutes} Min ·{' '}
                {uebung.difficulty}
              </p>
              <PrimaryButton art="still" icon="stift" onClick={() => setAktiveUebung(uebung)}>
                {electroLernstand.istErledigt(uebung.id) ? 'Ansehen' : 'Übung öffnen'}
              </PrimaryButton>
            </Card>
          ))}
        </div>
      </section>

      <LektionModal
        lektion={aktiveLektion}
        erledigt={aktiveLektion ? electroLernstand.istErledigt(aktiveLektion.id) : false}
        schliessen={() => setAktiveLektion(null)}
        abschliessen={abschliessen}
      />

      <UebungModal
        key={aktiveUebung?.id || 'leer'}
        uebung={aktiveUebung}
        lernstand={electroLernstand}
        schliessen={() => setAktiveUebung(null)}
      />

      <PraxisAufgabe
        key={aktivePraxis?.id || 'keine'}
        aufgabe={aktivePraxis}
        lernstand={electroLernstand}
        schliessen={() => setAktivePraxis(null)}
      />
    </div>
  )
}
