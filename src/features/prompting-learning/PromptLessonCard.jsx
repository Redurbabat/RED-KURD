// Eine Prompting-Lektion als Karte: Status, Titel, Beschreibung, Dauer.
import Icon from '../../components/icons/Icon.jsx'

const STATUS = {
  done: { icon: 'haken', text: 'Erledigt' },
  current: { icon: 'play', text: 'Hier geht es weiter' },
  open: { icon: 'pfeilRechts', text: 'Offen' },
  locked: { icon: 'schloss', text: 'Noch gesperrt' },
}

/**
 * @param {{lesson:{id:string,title:string,description:string,
 *          durationMinutes:number,status:string}}} props
 */
export default function PromptLessonCard({ lesson }) {
  const status = STATUS[lesson.status] || STATUS.open
  return (
    <section className={`rk-karte pl-lektion status-${lesson.status}`}>
      <header className="pl-lektion-kopf">
        <span className="pl-lektion-status" aria-hidden="true">
          <Icon name={status.icon} groesse={16} />
        </span>
        <h3>{lesson.title}</h3>
      </header>
      <p className="pl-text">{lesson.description}</p>
      <p className="pl-meta">
        <Icon name="uhr" groesse={14} /> ca. {lesson.durationMinutes} Min
        <span className="nur-sr"> · {status.text}</span>
      </p>
    </section>
  )
}
