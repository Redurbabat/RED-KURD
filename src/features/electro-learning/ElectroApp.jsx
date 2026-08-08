// Die App „Elektro-Lehre" — eigener Kopf, eigene Navigation, eigene
// Bereiche. Sichtbar ist immer genau ein Bereich dieser App; von den
// anderen RED-KURD-Apps ist hier nichts zu sehen.
import { useState } from 'react'
import Icon from '../../components/icons/Icon.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { useLernstand } from '../../core/store.ts'
import { TAGESZIEL_XP } from '../../core/lernbereiche/bereichsLernstand.ts'
import { heute } from '../../core/progress/scheduler.ts'
import * as schule from '../../core/elektro/schuleStore.ts'
import { gerundet } from '../../core/elektro/notenRechnung.js'
import ElektroHeute from './ElektroHeute.jsx'
import NotenBereich from './NotenBereich.jsx'
import PruefungenBereich from './PruefungenBereich.jsx'
import BerichtsheftBereich from './BerichtsheftBereich.jsx'
import FormelnBereich from './FormelnBereich.jsx'
import ElectroLearningHome from './ElectroLearningHome.jsx'
import { electroLernstand } from './electroProgressStore.ts'
import './electroLearning.css'

const BEREICHE = [
  { id: 'heute', name: 'Heute', icon: 'heute' },
  { id: 'noten', name: 'Noten', icon: 'fortschritt' },
  { id: 'pruefungen', name: 'Prüfung', icon: 'uhr' },
  { id: 'bericht', name: 'Bericht', icon: 'buch' },
  { id: 'formeln', name: 'Formeln', icon: 'blitz' },
  { id: 'lernen', name: 'Lernen', icon: 'gehirn' },
]

export default function ElectroApp() {
  useLernstand()
  const [bereich, setBereich] = useState('heute')

  const heuteWert = heute()
  const naechste = schule.naechstePruefung(heuteWert)
  const gesamt = schule.gesamtschnitt()
  const xpHeute = electroLernstand.xpHeute()

  return (
    <div className="bereich-seite bereich-electro el-app">
      <header className="bereich-kopf">
        <h1>
          <span aria-hidden="true">⚡</span> Elektro-Lehre
        </h1>
        <p>Alles für Schule, Betrieb und Prüfungsvorbereitung.</p>

        <div className="bereich-werte">
          <span className="bereich-wert">
            <Icon name="fortschritt" groesse={16} />
            <span>
              Schnitt: <strong>{gesamt === null ? '—' : gerundet(gesamt, 2)}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="uhr" groesse={16} />
            <span>
              Nächste Prüfung:{' '}
              <strong>
                {naechste
                  ? naechste.tage === 0
                    ? 'heute'
                    : `in ${naechste.tage} Tagen`
                  : '—'}
              </strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="buch" groesse={16} />
            <span>
              Bericht offen: <strong>{schule.offeneWochen()}</strong>
            </span>
          </span>
          <span className="bereich-wert">
            <Icon name="blitz" groesse={16} />
            <span>
              XP heute: <strong>{xpHeute}</strong>
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

      <nav className="el-nav" aria-label="Bereiche der Elektro-Lehre">
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

      {bereich === 'heute' && <ElektroHeute zumBereich={setBereich} />}
      {bereich === 'noten' && <NotenBereich />}
      {bereich === 'pruefungen' && <PruefungenBereich />}
      {bereich === 'bericht' && <BerichtsheftBereich />}
      {bereich === 'formeln' && <FormelnBereich />}
      {bereich === 'lernen' && <ElectroLearningHome ohneKopf />}
    </div>
  )
}
