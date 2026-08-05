// Die App-Auswahl: RED-KURD als Website mit mehreren Apps darin.
// Jede Karte oeffnet genau EINE App — sichtbar ist danach nur diese App.
// Erscheint beim allerersten Start und jederzeit ueber „Apps" im Umschalter.
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { APP_MODES, APP_MODE_LABELS, APP_MODE_LISTE } from './appModes.js'
import './appMode.css'

const KARTEN = {
  [APP_MODES.LANGUAGE]: {
    icon: 'sprache',
    beschreibung: 'Kurdisch und weitere Sprachen: Kurse, Vokabeln, Grammatik, Aussprache.',
  },
  [APP_MODES.CODE]: {
    icon: 'puzzle',
    beschreibung: 'HTML, CSS, JavaScript, TypeScript, GitHub und VS Code — Schritt für Schritt.',
  },
  [APP_MODES.PROMPTING]: {
    icon: 'sprechblase',
    beschreibung: 'Prompts schreiben, Claude Code steuern und bessere Aufgaben geben.',
  },
  [APP_MODES.ELECTRO]: {
    icon: 'blitz',
    beschreibung: 'Strom, Spannung und Sicherheit verstehen — mit Rechenaufgaben.',
  },
}

/**
 * @param {{oeffnen:(mode:string)=>void}} props
 */
export default function AppLauncher({ oeffnen }) {
  return (
    <div className="app-launcher">
      <header className="app-launcher-kopf">
        <p className="app-launcher-marke">RED-KURD</p>
        <h1>Welche App möchtest du öffnen?</h1>
        <p className="app-launcher-text">
          Mehrere Apps in einer Website — jede öffnet sich getrennt.
        </p>
      </header>

      <div className="app-launcher-karten">
        {APP_MODE_LISTE.map((mode) => (
          <section key={mode} className={`app-launcher-karte bereich-${mode}`}>
            <span className="app-launcher-symbol" aria-hidden="true">
              <Icon name={KARTEN[mode].icon} groesse={28} />
            </span>
            <div className="app-launcher-inhalt">
              <h2>{APP_MODE_LABELS[mode]}</h2>
              <p>{KARTEN[mode].beschreibung}</p>
            </div>
            <PrimaryButton icon="pfeilRechts" onClick={() => oeffnen(mode)}>
              Öffnen
            </PrimaryButton>
          </section>
        ))}
      </div>
    </div>
  )
}
