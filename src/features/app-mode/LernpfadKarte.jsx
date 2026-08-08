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

// Die Sprach-App benennt ihre Zustaende deutsch — hier zusammengefuehrt,
// damit dieselbe Wegkarte in allen Apps funktioniert.
const NORMAL = {
  fertig: 'done',
  aktuell: 'current',
  begonnen: 'open',
  gesperrt: 'locked',
}

/**
 * @param {{lessons:Array, status:Object, oeffnen:(lektion:Object)=>void,
 *          meta?:(lektion:Object)=>string}} props
 *   meta liefert die Zeile unter dem Titel — Standard: Dauer in Minuten.
 */
export default function LernpfadKarte({
  lessons,
  status,
  oeffnen,
  meta = (l) => `${l.durationMinutes} Min`,
}) {
  return (
    <ol className="pfadkarte" aria-label="Lernpfad">
      {lessons.map((lektion, i) => {
        const roh = status[lektion.id] || 'open'
        const s = NORMAL[roh] || roh
        const gesperrt = s === 'locked'
        const seite = i % 2 === 0 ? 'links' : 'rechts'
        return (
          <li key={lektion.id} className={`pfadkarte-punkt ${seite} ${s}`}>
            <span className="pfadkarte-linie" aria-hidden="true" />
            <button
              type="button"
              className="pfadkarte-knoten"
              disabled={gesperrt}
              aria-label={`${lektion.title} · ${meta(lektion)} · ${BESCHRIFTUNG[s]}`}
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
                {meta(lektion)} · {BESCHRIFTUNG[s]}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
