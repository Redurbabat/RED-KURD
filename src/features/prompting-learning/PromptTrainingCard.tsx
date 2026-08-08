// Eine Prompting-Uebung: selbst einen Auftrag formulieren.
import Badge from '../../components/common/Badge.tsx'
import Icon from '../../components/icons/Icon.tsx'
import PrimaryButton from '../../components/common/PrimaryButton.tsx'

import type { Bereichsuebung } from '../../types/lernbereich'

export interface PromptTrainingCardProps {
  exercise: Bereichsuebung
  erledigt: boolean
  onOeffnen: () => void
}

export default function PromptTrainingCard({
  exercise,
  erledigt,
  onOeffnen,
}: PromptTrainingCardProps) {
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
