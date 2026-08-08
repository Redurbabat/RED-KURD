// Die App-Auswahl: RED-KURD als Website mit mehreren Apps darin.
// Jede Karte oeffnet genau EINE App — sichtbar ist danach nur diese App.
// Erscheint beim allerersten Start und jederzeit ueber „Apps" im Umschalter.
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import Wochenuebersicht from './Wochenuebersicht.jsx'
import { APP_MODES, APP_MODE_LABELS, APP_MODE_LISTE } from './appModes.ts'
import './appMode.css'

const KARTEN = {
  [APP_MODES.LANGUAGE]: {
    icon: 'sprache',
    beschreibung: 'Kurmancî, Deutsch, Englisch, Türkisch, Französisch und Spanisch lernen.',
    zusatz: 'Mit Modern-Ansicht und Abenteuer-Ansicht.',
  },
  [APP_MODES.CODE]: {
    icon: 'puzzle',
    beschreibung: 'HTML, CSS, JavaScript, TypeScript, GitHub und VS Code Schritt für Schritt lernen.',
  },
  [APP_MODES.PROMPTING]: {
    icon: 'sprechblase',
    beschreibung: 'Lerne, wie du ChatGPT, Claude und Claude Code klare Aufgaben gibst.',
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
        <h1>Deine kostenlose lokale Lernwelt.</h1>
        <p className="app-launcher-text">Wähle, was du lernen möchtest.</p>
      </header>

      <Wochenuebersicht />

      <div className="app-launcher-karten">
        {APP_MODE_LISTE.map((mode) => (
          <section key={mode} className={`app-launcher-karte bereich-${mode}`}>
            <span className="app-launcher-symbol" aria-hidden="true">
              <Icon name={KARTEN[mode].icon} groesse={28} />
            </span>
            <div className="app-launcher-inhalt">
              <h2>{APP_MODE_LABELS[mode]}</h2>
              <p>{KARTEN[mode].beschreibung}</p>
              {KARTEN[mode].zusatz && <p className="app-launcher-zusatz">{KARTEN[mode].zusatz}</p>}
            </div>
            <PrimaryButton icon="pfeilRechts" onClick={() => oeffnen(mode)}>
              Öffnen
            </PrimaryButton>
          </section>
        ))}
      </div>

      <p className="app-launcher-fuss">
        Kostenlos · lokal · ohne Konto — dein Lernstand bleibt auf deinem Gerät.
      </p>
    </div>
  )
}
