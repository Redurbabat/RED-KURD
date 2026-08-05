// Der Lernpfad als Wegpunkt-Karte: die Lektionen liegen als Knoten auf
// einem Pfad, abwechselnd links und rechts, verbunden durch eine Linie.
// Fertige Knoten tragen einen Haken, der aktuelle pulst leicht, gesperrte
// ein Schloss — wie in einer Lern-App, aber ohne Spielerei.
//
// Nur Darstellung: Status und Fortschritt kommen aus dem Lernstand.
import Icon from '../../components/icons/Icon.jsx'

const BESCHRIFTUNG = {
  done: 'fertig',
  current: 'jetzt dran',
  open: 'offen',
  locked: 'noch gesperrt',
}

/**
 * @param {{lessons:Array, status:Object, oeffnen:(lektion:Object)=>void}} props
 */
export default function CodeLernpfadKarte({ lessons, status, oeffnen }) {
  return (
    <ol className="pfadkarte" aria-label="Lernpfad">
      {lessons.map((lektion, i) => {
        const s = status[lektion.id] || 'open'
        const gesperrt = s === 'locked'
        const seite = i % 2 === 0 ? 'links' : 'rechts'
        return (
          <li key={lektion.id} className={`pfadkarte-punkt ${seite} ${s}`}>
            <span className="pfadkarte-linie" aria-hidden="true" />
            <button
              type="button"
              className="pfadkarte-knoten"
              disabled={gesperrt}
              aria-label={`${lektion.title} · ${lektion.durationMinutes} Minuten · ${BESCHRIFTUNG[s]}`}
              onClick={() => oeffnen(lektion)}
            >
              <span className="pfadkarte-zeichen" aria-hidden="true">
                {s === 'done' ? (
                  <Icon name="haken" groesse={22} />
                ) : gesperrt ? (
                  <Icon name="schloss" groesse={20} />
                ) : (
                  <span className="pfadkarte-nummer">{i + 1}</span>
                )}
              </span>
            </button>
            <span className="pfadkarte-text">
              <strong>{lektion.title}</strong>
              <span className="pfadkarte-meta">
                {lektion.durationMinutes} Min · {BESCHRIFTUNG[s]}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
