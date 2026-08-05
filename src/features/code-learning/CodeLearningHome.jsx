// Startseite des Bereichs „Code lernen": Dashboard, Lernpfade, Uebungen.
// XP, Reihe und Fortschritt kommen aus dem echten, gespeicherten Lernstand.
import { useLernstand } from '../../core/store.js'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import CodeLearningPath from './CodeLearningPath.jsx'
import CodeLearningProgress from './CodeLearningProgress.jsx'
import { codeLearningPaths } from './data/codeLessons.js'
import { codeExercises } from './data/codeExercises.js'
import { codeLernstand } from './codeProgressStore.js'
import './codeLearning.css'

/** Die naechste offene Lektion je Pfad — fuer „Heute lernen". */
function naechsteLektionen(anzahl = 3) {
  const aus = []
  for (const pfad of codeLearningPaths) {
    const status = codeLernstand.statusFuer(pfad.lessons)
    const lektion = pfad.lessons.find((l) => status[l.id] === 'current')
    if (lektion) aus.push({ pfad, lektion })
    if (aus.length === anzahl) break
  }
  return aus
}

export default function CodeLearningHome() {
  useLernstand()
  const heute = naechsteLektionen(3)
  const alleLektionen = codeLearningPaths.flatMap((p) => p.lessons)
  const gesamt = codeLernstand.fortschrittProzent(alleLektionen)

  return (
    <div className="bereich-seite bereich-code">
      <header className="bereich-kopf">
        <h1>
          <span aria-hidden="true">💻</span> Code lernen
        </h1>
        <p>Lerne Schritt für Schritt HTML, CSS, JavaScript, TypeScript, GitHub und VS Code.</p>

        <div className="bereich-werte">
          <span className="bereich-wert">
            <Icon name="blitz" groesse={16} />
            <span>
              XP heute: <strong>{codeLernstand.xpHeute()}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="flamme" groesse={16} />
            <span>
              Reihe:{' '}
              <strong>
                {codeLernstand.serie()} {codeLernstand.serie() === 1 ? 'Tag' : 'Tage'}
              </strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="stift" groesse={16} />
            <span>
              Offene Übungen: <strong>{codeExercises.length}</strong>
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

      <div className="bereich-raster">
        <Card titel="Heute lernen" icon="heute">
          <ul className="cl-heute">
            {heute.map(({ pfad, lektion }) => (
              <li key={lektion.id}>
                <span aria-hidden="true">{pfad.icon}</span>
                <span className="cl-heute-text">
                  <strong>{pfad.title.split(' ')[0]}:</strong> {lektion.title}
                </span>
                <span className="cl-lektion-dauer">{lektion.durationMinutes} Min</span>
              </li>
            ))}
          </ul>
        </Card>

        <CodeLearningProgress />
      </div>

      <section className="bereich-abschnitt" aria-labelledby="cl-pfade-titel">
        <h2 id="cl-pfade-titel">Lernpfade</h2>
        <div className="bereich-raster">
          {codeLearningPaths.map((pfad) => (
            <CodeLearningPath key={pfad.id} path={pfad} />
          ))}
        </div>
      </section>

      <section className="bereich-abschnitt" aria-labelledby="cl-uebungen-titel">
        <h2 id="cl-uebungen-titel">Übungen</h2>
        <div className="bereich-raster">
          {codeExercises.map((uebung) => (
            <Card key={uebung.id} className="cl-uebung">
              <div className="cl-uebung-kopf">
                <h3>{uebung.title}</h3>
                <Badge ton="lila">{uebung.topic}</Badge>
              </div>
              <p className="cl-pfad-text">{uebung.description}</p>
              <p className="cl-uebung-aufgabe">{uebung.task}</p>
              <p className="cl-uebung-meta">
                <Icon name="uhr" groesse={14} /> ca. {uebung.estimatedMinutes} Min ·{' '}
                {uebung.difficulty}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bereich-abschnitt" aria-labelledby="cl-fehlerbuch-titel">
        <h2 id="cl-fehlerbuch-titel">Fehlerbuch</h2>
        <Card>
          <p className="cl-pfad-text">
            Speichere Fehler, Lösungen und was du daraus gelernt hast. Das Fehlerbuch wird als
            Nächstes gebaut — deine Einträge bleiben dann lokal auf deinem Gerät.
          </p>
          <Badge ton="gold">Bald verfügbar</Badge>
        </Card>
      </section>
    </div>
  )
}
