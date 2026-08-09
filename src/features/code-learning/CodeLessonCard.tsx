// Eine einzelne Lektion in einem Lernpfad: anklickbar, mit echtem Status.
import Icon from '../../components/icons/Icon.tsx'
import type { Iconname } from '../../components/icons/Icon.tsx'
import type { Lektionsstatus } from '../../types/lernstand'
import type { Bereichslektion } from '../../types/lernbereich'

/** Symbol und Vorlesetext je Status. */
interface Statusbild {
  icon: Iconname
  text: string
}

// Dieselbe Tabelle steht in CodeLessonCard, PromptLessonCard und
// ElectroLessonCard — Wort fuer Wort gleich. Zusammengelegt ist sie nicht:
// das waere eine Umbaute, keine Typisierung. Als Befund notiert.
const STATUS: Readonly<Record<Lektionsstatus, Statusbild>> = {
  done: { icon: 'haken', text: 'Erledigt — zum Nachlesen öffnen' },
  current: { icon: 'play', text: 'Hier geht es weiter' },
  open: { icon: 'pfeilRechts', text: 'Offen' },
  locked: { icon: 'schloss', text: 'Noch gesperrt — erst die Lektionen davor' },
}

export interface CodeLessonCardProps {
  lesson: Bereichslektion
  /**
   * Fehlt nie wirklich — `statusFuer()` liefert jede uebergebene Id
   * zurueck. Der Nachschlag im Aufrufer ergibt trotzdem
   * `| undefined`, und der Rueckfall auf `open` steht seit jeher da.
   */
  status: Lektionsstatus | undefined
  onOeffnen: () => void
}

export default function CodeLessonCard({ lesson, status, onOeffnen }: CodeLessonCardProps) {
  const s = (status && STATUS[status]) || STATUS.open
  const gesperrt = status === 'locked'
  return (
    <li className={`cl-lektion status-${status}`}>
      <button
        type="button"
        className="cl-lektion-knopf"
        disabled={gesperrt}
        aria-label={`${lesson.title} · ${lesson.durationMinutes} Minuten · ${s.text}`}
        onClick={onOeffnen}
      >
        <span className="cl-lektion-status" aria-hidden="true">
          <Icon name={s.icon} groesse={16} />
        </span>
        <span className="cl-lektion-titel">{lesson.title}</span>
        <span className="cl-lektion-dauer">{lesson.durationMinutes} Min</span>
      </button>
    </li>
  )
}
