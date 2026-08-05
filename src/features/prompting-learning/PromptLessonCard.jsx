// Eine Prompting-Lektion als anklickbare Karte mit echtem Status.
import Icon from '../../components/icons/Icon.jsx'

const STATUS = {
  done: { icon: 'haken', text: 'Erledigt — zum Nachlesen öffnen' },
  current: { icon: 'play', text: 'Hier geht es weiter' },
  open: { icon: 'pfeilRechts', text: 'Offen' },
  locked: { icon: 'schloss', text: 'Noch gesperrt — erst die Lektionen davor' },
}

/**
 * @param {{lesson:{id:string,title:string,description:string,durationMinutes:number},
 *          status:string, onOeffnen:Function}} props
 */
export default function PromptLessonCard({ lesson, status, onOeffnen }) {
  const s = STATUS[status] || STATUS.open
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
