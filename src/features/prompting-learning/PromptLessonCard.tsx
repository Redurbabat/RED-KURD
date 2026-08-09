// Eine Prompting-Lektion als anklickbare Karte mit echtem Status.
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

export interface PromptLessonCardProps {
  lesson: Bereichslektion
  /**
   * Fehlt nie wirklich — `statusFuer()` liefert jede uebergebene Id
   * zurueck. Der Nachschlag im Aufrufer ergibt trotzdem
   * `| undefined`, und der Rueckfall auf `open` steht seit jeher da.
   */
  status: Lektionsstatus | undefined
  onOeffnen: () => void
}

export default function PromptLessonCard({ lesson, status, onOeffnen }: PromptLessonCardProps) {
  const s = (status && STATUS[status]) || STATUS.open
  const gesperrt = status === 'locked'
  return (
    <button
      type="button"
      className={`rk-karte rk-karte-klick pl-lektion status-${status}`}
      disabled={gesperrt}
      aria-label={`${lesson.title} · ca. ${lesson.durationMinutes} Minuten · ${s.text}`}
      onClick={onOeffnen}
    >
      <span className="pl-lektion-kopf">
        <span className="pl-lektion-status" aria-hidden="true">
          <Icon name={s.icon} groesse={16} />
        </span>
        <span className="pl-lektion-titel">{lesson.title}</span>
      </span>
      <span className="pl-text">{lesson.description}</span>
      <span className="pl-meta">
        <Icon name="uhr" groesse={14} /> ca. {lesson.durationMinutes} Min
      </span>
    </button>
  )
}
