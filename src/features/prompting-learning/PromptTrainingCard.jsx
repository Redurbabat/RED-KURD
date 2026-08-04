// Eine Prompting-Uebung: selbst einen Auftrag formulieren.
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'

/**
 * @param {{exercise:{id:string,title:string,topic:string,difficulty:string,
 *          estimatedMinutes:number,description:string,task:string}}} props
 */
export default function PromptTrainingCard({ exercise }) {
  return (
    <section className="rk-karte pl-uebung">
      <header className="pl-uebung-kopf">
        <h3>{exercise.title}</h3>
        <Badge ton="gold">{exercise.topic}</Badge>
      </header>
      <p className="pl-text">{exercise.description}</p>
      <p className="pl-uebung-aufgabe">{exercise.task}</p>
      <p className="pl-meta">
        <Icon name="uhr" groesse={14} /> ca. {exercise.estimatedMinutes} Min ·{' '}
        {exercise.difficulty}
      </p>
    </section>
  )
}
