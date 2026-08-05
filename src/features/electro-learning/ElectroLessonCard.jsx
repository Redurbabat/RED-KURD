// Eine Elektro-Lektion als anklickbare Karte mit echtem Status.
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
export default function ElectroLessonCard({ lesson, status, onOeffnen }) {
  const s = STATUS[status] || STATUS.open
  const gesperrt = status === 'locked'
  return (
    <button
      type="button"
      className={`rk-karte rk-karte-klick el-lektion status-${status}`}
      disabled={gesperrt}
      aria-label={`${lesson.title} · ca. ${lesson.durationMinutes} Minuten · ${s.text}`}
      onClick={onOeffnen}
    >
      <span className="el-lektion-kopf">
        <span className="el-lektion-status" aria-hidden="true">
          <Icon name={s.icon} groesse={16} />
        </span>
        <span className="el-lektion-titel">{lesson.title}</span>
      </span>
      <span className="el-text">{lesson.description}</span>
      <span className="el-meta">
        <Icon name="uhr" groesse={14} /> ca. {lesson.durationMinutes} Min
      </span>
    </button>
  )
}
