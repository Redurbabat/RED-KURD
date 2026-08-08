// Die App „AI-Sprache" — eigener Kopf, eigene Navigation, eigene Bereiche.
// Heute · Auftrag · Bug-Report · PR prüfen · Lernen.
import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { useLernstand } from '../../core/store.ts'
import { TAGESZIEL_XP } from '../../core/lernbereiche/bereichsLernstand.js'
import {
  AUFTRAG_FELDER,
  BUG_FELDER,
  PR_CHECKLISTE,
  baueAuftrag,
  baueBugReport,
  pruefeAuftrag,
  pruefeBugReport,
  pruefeMerge,
} from '../../core/prompting/promptBaukasten.js'
import * as werkstatt from '../../core/prompting/werkstattStore.js'
import WerkstattFormular from './WerkstattFormular.jsx'
import PrCheckliste from './PrCheckliste.jsx'
import PromptingLearningHome from './PromptingLearningHome.jsx'
import { promptLessons } from './data/promptLessons.js'
import { promptExercises } from './data/promptExercises.js'
import { promptLernstand } from './promptProgressStore.js'
import './promptingLearning.css'

const BEREICHE = [
  { id: 'heute', name: 'Heute', icon: 'heute' },
  { id: 'auftrag', name: 'Auftrag', icon: 'stift' },
  { id: 'bug', name: 'Bug-Report', icon: 'warnung' },
  { id: 'pr', name: 'PR prüfen', icon: 'schild' },
  { id: 'lernen', name: 'Lernen', icon: 'gehirn' },
]

function Heute({ zumBereich }) {
  useLernstand()
  const auftrag = werkstatt.holeAuftrag()
  const bug = werkstatt.holeBug()
  const auftragOk = pruefeAuftrag(auftrag).filter((c) => c.ok).length
  const bugOk = pruefeBugReport(bug).filter((c) => c.ok).length
  const prUrteil = pruefeMerge(werkstatt.holePr())
  const status = promptLernstand.statusFuer(promptLessons)
  const naechste = promptLessons.find((l) => status[l.id] === 'current') || null
  const offeneUebungen = promptExercises.filter((u) => !promptLernstand.istErledigt(u.id)).length

  return (
    <div className="pl-heute-seite">
      <div className="bereich-raster">
        <Card titel="Claude-Code-Auftrag" icon="stift">
          <p className="pl-gross">
            <strong>{auftragOk}</strong>/{pruefeAuftrag(auftrag).length} Bausteine
          </p>
          <p className="pl-meta">
            {baueAuftrag(auftrag)
              ? 'Angefangener Auftrag — er wartet auf dich.'
              : 'Ziel, Ort, Verbote, Prüfung — der Baukasten führt dich durch.'}
          </p>
          <PrimaryButton art="still" icon="play" onClick={() => zumBereich('auftrag')}>
            {baueAuftrag(auftrag) ? 'Weiterschreiben' : 'Auftrag bauen'}
          </PrimaryButton>
        </Card>

        <Card titel="Bug beschreiben" icon="warnung">
          <p className="pl-gross">
            <strong>{bugOk}</strong>/{pruefeBugReport(bug).length} Bausteine
          </p>
          <p className="pl-meta">Passiert · Erwartet · Nachstellen · Gerät</p>
          <PrimaryButton art="still" icon="play" onClick={() => zumBereich('bug')}>
            {baueBugReport(bug) ? 'Weiterschreiben' : 'Bug-Report bauen'}
          </PrimaryButton>
        </Card>
      </div>

      <Card titel="Pull Request prüfen" icon="schild">
        <p className="pl-text">{prUrteil.text}</p>
        <p className="pl-meta">
          {PR_CHECKLISTE.length - prUrteil.offen}/{PR_CHECKLISTE.length} Punkte abgehakt
        </p>
        <PrimaryButton art="still" icon="haken" onClick={() => zumBereich('pr')}>
          Checkliste öffnen
        </PrimaryButton>
      </Card>

      {naechste && (
        <Card titel="Heute lernen" icon="heute">
          <p className="pl-text">
            <strong>{naechste.title}</strong> — {naechste.description}
          </p>
          <p className="pl-meta">
            <Icon name="uhr" groesse={14} /> ca. {naechste.durationMinutes} Min · {offeneUebungen}{' '}
            offene Übungen
          </p>
          <PrimaryButton art="still" icon="play" onClick={() => zumBereich('lernen')}>
            Zum Lernbereich
          </PrimaryButton>
        </Card>
      )}
    </div>
  )
}

export default function PromptingApp() {
  useLernstand()
  const [bereich, setBereich] = useState('heute')
  const xpHeute = promptLernstand.xpHeute()

  return (
    <div className="bereich-seite bereich-prompting pl-app">
      <header className="bereich-kopf">
        <h1>
          <span aria-hidden="true">🤖</span> AI-Sprache lernen
        </h1>
        <p>Lerne, wie du KI richtig steuerst und bessere Aufgaben schreibst.</p>

        <div className="bereich-werte">
          <span className="bereich-wert">
            <Icon name="blitz" groesse={16} />
            <span>
              XP heute: <strong>{xpHeute}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="flamme" groesse={16} />
            <span>
              Reihe:{' '}
              <strong>
                {promptLernstand.serie()} {promptLernstand.serie() === 1 ? 'Tag' : 'Tage'}
              </strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="fortschritt" groesse={16} />
            <span>
              Gesamt: <strong>{promptLernstand.fortschrittProzent(promptLessons)} %</strong>
            </span>
          </span>
        </div>

        <div className="bereich-tagesziel">
          <span className="bereich-tagesziel-text">
            Tagesziel: {Math.min(xpHeute, TAGESZIEL_XP)}/{TAGESZIEL_XP} XP
            {xpHeute >= TAGESZIEL_XP ? ' — geschafft!' : ''}
          </span>
          <ProgressBar wert={xpHeute} max={TAGESZIEL_XP} label="Tagesziel" klein />
        </div>
      </header>

      <nav className="el-nav pl-nav" aria-label="Bereiche der AI-Sprache">
        {BEREICHE.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`el-nav-knopf${bereich === b.id ? ' aktiv' : ''}`}
            aria-current={bereich === b.id ? 'page' : undefined}
            onClick={() => setBereich(b.id)}
          >
            <Icon name={b.icon} groesse={18} />
            <span>{b.name}</span>
          </button>
        ))}
      </nav>

      {bereich === 'heute' && <Heute zumBereich={setBereich} />}
      {bereich === 'auftrag' && (
        <WerkstattFormular
          titel="Claude-Code-Auftrag bauen"
          hinweis="Füll die Felder aus — unten entsteht dein fertiger Auftrag zum Kopieren. Die Prüfliste zeigt, welcher Baustein noch fehlt."
          felder={AUFTRAG_FELDER}
          werte={werkstatt.holeAuftrag()}
          setzeFeld={werkstatt.setzeAuftragsFeld}
          leeren={werkstatt.leereAuftrag}
          bauen={baueAuftrag}
          pruefen={pruefeAuftrag}
        />
      )}
      {bereich === 'bug' && (
        <WerkstattFormular
          titel="Bug-Report schreiben"
          hinweis="Was passiert, was war erwartet, wie stellt man es nach? Mit diesen drei Teilen findet jede KI den Fehler zehnmal schneller."
          felder={BUG_FELDER}
          werte={werkstatt.holeBug()}
          setzeFeld={werkstatt.setzeBugFeld}
          leeren={werkstatt.leereBug}
          bauen={baueBugReport}
          pruefen={pruefeBugReport}
        />
      )}
      {bereich === 'pr' && <PrCheckliste />}
      {bereich === 'lernen' && <PromptingLearningHome ohneKopf />}
    </div>
  )
}
