// Eine einzelne Lektion in einem Lernpfad: Status, Titel, Dauer.
import Icon from '../../components/icons/Icon.jsx'

const STATUS = {
  done: { icon: 'haken', text: 'Erledigt' },
  current: { icon: 'play', text: 'Hier geht es weiter' },
  open: { icon: 'pfeilRechts', text: 'Offen' },
  locked: { icon: 'schloss', text: 'Noch gesperrt' },
}

/**
 * @param {{lesson:{id:string,title:string,durationMinutes:number,status:string}}} props
 */
export default function CodeLessonCard({ lesson }) {
  const status = STATUS[lesson.status] || STATUS.open
  return (
    <li className={`cl-lektion status-${lesson.status}`}>
      <span className="cl-lektion-status" aria-hidden="true">
        <Icon name={status.icon} groesse={16} />
      </span>
      <span className="cl-lektion-titel">{lesson.title}</span>
      <span className="cl-lektion-dauer">
        {lesson.durationMinutes} Min
        <span className="nur-sr"> · {status.text}</span>
      </span>
    </li>
  )
}
