// Eine Prompting-Uebung: selbst einen Auftrag formulieren.
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'

/**
 * @param {{exercise:{id:string,title:string,topic:string,difficulty:string,
 *          estimatedMinutes:number,description:string,task:string},
 *          erledigt:boolean, onOeffnen:Function}} props
 */
export default function PromptTrainingCard({ exercise, erledigt, onOeffnen }) {
  return (
    <section className="rk-karte pl-uebung">
      <header className="pl-uebung-kopf">
        <h3>{exercise.title}</h3>
        {erledigt ? (
          <Badge ton="gruen" icon="haken">
            Erledigt
          </Badge>
        ) : (
          <Badge ton="gold">{exercise.topic}</Badge>
        )}
      </header>
      <p className="pl-text">{exercise.description}</p>
      <p className="pl-meta">
        <Icon name="uhr" groesse={14} /> ca. {exercise.estimatedMinutes} Min ·{' '}
        {exercise.difficulty}
      </p>
      <PrimaryButton art="still" icon="stift" onClick={onOeffnen}>
        {erledigt ? 'Ansehen' : 'Übung öffnen'}
      </PrimaryButton>
    </section>
  )
}
