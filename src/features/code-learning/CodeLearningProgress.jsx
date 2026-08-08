// Fortschritts-Ueberblick: jeder Lernpfad mit seinem echten Prozentwert.
import Card from '../../components/common/Card.tsx'
import ProgressBar from '../../components/common/ProgressBar.tsx'
import { codeLearningPaths } from './data/codeLessons.js'
import { codeLernstand } from './codeProgressStore.ts'

export default function CodeLearningProgress() {
  return (
    <Card titel="Fortschritt" icon="fortschritt">
      <ul className="cl-fortschritt">
        {codeLearningPaths.map((pfad) => (
          <li key={pfad.id}>
            <span className="cl-fortschritt-name">
              <span aria-hidden="true">{pfad.icon}</span> {pfad.title}
            </span>
            <ProgressBar
              wert={codeLernstand.fortschrittProzent(pfad.lessons)}
              label={`Fortschritt ${pfad.title}`}
              zeigeWert
              klein
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
