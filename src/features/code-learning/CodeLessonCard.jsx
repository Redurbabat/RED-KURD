// Eine einzelne Lektion in einem Lernpfad: anklickbar, mit echtem Status.
import Icon from '../../components/icons/Icon.jsx'

const STATUS = {
  done: { icon: 'haken', text: 'Erledigt — zum Nachlesen öffnen' },
  current: { icon: 'play', text: 'Hier geht es weiter' },
  open: { icon: 'pfeilRechts', text: 'Offen' },
  locked: { icon: 'schloss', text: 'Noch gesperrt — erst die Lektionen davor' },
}

/**
 * @param {{lesson:{id:string,title:string,durationMinutes:number},
 *          status:string, onOeffnen:Function}} props
 */
export default function CodeLessonCard({ lesson, status, onOeffnen }) {
  const s = STATUS[status] || STATUS.open
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
