// Der Lernpfad als Wegpunkt-Karte: die Lektionen liegen als Knoten auf
// einem Pfad, abwechselnd links und rechts, verbunden durch eine Linie.
// Fertige Knoten tragen einen Haken, der aktuelle pulst leicht, gesperrte
// ein Schloss — wie in einer Lern-App, aber ohne Spielerei.
//
// Nur Darstellung: Status und Fortschritt kommen aus dem Lernstand.
import Icon from '../../components/icons/Icon.tsx'
import type { Lektionsstatus } from '../../types/lernstand'
import type { Einheitsstatus } from '../../types/kurs'

const BESCHRIFTUNG: Readonly<Record<Lektionsstatus, string>> = {
  done: 'fertig',
  current: 'jetzt dran',
  open: 'offen',
  locked: 'noch gesperrt',
}

/**
 * Was die Aufrufer als Status hereinreichen. Die drei Bereichs-Apps liefern
 * `Lektionsstatus` (englisch, aus `statusFuer()`), die Sprach-App
 * `Einheitsstatus` (deutsch, aus `einheitStatus()`).
 */
export type Pfadstatus = Lektionsstatus | Einheitsstatus

// Die Sprach-App benennt ihre Zustaende deutsch — hier zusammengefuehrt,
// damit dieselbe Wegkarte in allen Apps funktioniert. Die englischen Namen
// zeigen auf sich selbst: so kommt die Tabelle ohne Rueckfall und ohne
// Typzusicherung aus, und `Pfadstatus` ist hier vollstaendig abgedeckt.
const NORMAL: Readonly<Record<Pfadstatus, Lektionsstatus>> = {
  fertig: 'done',
  aktuell: 'current',
  begonnen: 'open',
  gesperrt: 'locked',
  done: 'done',
  current: 'current',
  open: 'open',
  locked: 'locked',
}

/**
 * Das Mindeste, was ein Wegpunkt mitbringen muss. Bewusst kein
 * `Bereichslektion`: die Sprach-App reicht auf `CoursePage` ihre Einheiten
 * herein (`{...einheit, title: einheit.name}`), und die haben keine
 * `durationMinutes`, sondern liefern ihre Zeile ueber `meta`.
 */
export interface Pfadeintrag {
  id: string
  title: string
  durationMinutes?: number
}

export interface LernpfadKarteProps<T extends Pfadeintrag> {
  lessons: readonly T[]
  /** Status je Eintrags-ID. Fehlt eine ID, gilt `open`. */
  status: Readonly<Record<string, Pfadstatus>>
  oeffnen: (lektion: T) => void
  /** Die Zeile unter dem Titel — Standard: Dauer in Minuten. */
  meta?: (lektion: T) => string
}

export default function LernpfadKarte<T extends Pfadeintrag>({
  lessons,
  status,
  oeffnen,
  meta = (l) => `${l.durationMinutes} Min`,
}: LernpfadKarteProps<T>) {
  return (
    <ol className="pfadkarte" aria-label="Lernpfad">
      {lessons.map((lektion, i) => {
        const roh = status[lektion.id] || 'open'
        const s = NORMAL[roh]
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
