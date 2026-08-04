// Ein Lernpfad als Karte: Kopf, Fortschritt, aufklappbare Lektionsliste.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import CodeLessonCard from './CodeLessonCard.jsx'

/**
 * @param {{path:{id:string,title:string,icon:string,description:string,
 *          level:string,progress:number,lessons:Array}}} props
 */
export default function CodeLearningPath({ path }) {
  const [offen, setOffen] = useState(false)
  const begonnen = path.progress > 0

  return (
    <section className="rk-karte cl-pfad">
      <header className="cl-pfad-kopf">
        <span className="cl-pfad-symbol" aria-hidden="true">
          {path.icon}
        </span>
        <div className="cl-pfad-titel">
          <h3>{path.title}</h3>
          <Badge ton="blau">{path.level}</Badge>
        </div>
      </header>

      <p className="cl-pfad-text">{path.description}</p>

      <ProgressBar
        wert={path.progress}
        label={`Fortschritt ${path.title}`}
        zeigeWert
        klein
      />

      <div className="cl-pfad-fuss">
        <PrimaryButton
          art={begonnen ? 'blau' : 'still'}
          icon={offen ? 'pfeilRunter' : 'play'}
          aria-expanded={offen}
          onClick={() => setOffen((o) => !o)}
        >
          {offen ? 'Lektionen verbergen' : begonnen ? 'Weiterlernen' : 'Starten'}
        </PrimaryButton>
        <span className="cl-pfad-anzahl">{path.lessons.length} Lektionen</span>
      </div>

      {offen && (
        <ul className="cl-lektionen">
          {path.lessons.map((lesson) => (
            <CodeLessonCard key={lesson.id} lesson={lesson} />
          ))}
        </ul>
      )}
    </section>
  )
}
