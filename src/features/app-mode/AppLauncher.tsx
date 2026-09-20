// Die App-Auswahl: RED-KURD als Website mit mehreren Apps darin.
// Jede Karte oeffnet genau EINE App — sichtbar ist danach nur diese App.
// Erscheint beim allerersten Start und jederzeit ueber „Apps" im Umschalter.
import Icon from '../../components/icons/Icon.tsx'
import type { Iconname } from '../../components/icons/Icon.tsx'
import PrimaryButton from '../../components/common/PrimaryButton.tsx'
import Wochenuebersicht from './Wochenuebersicht.tsx'
import { APP_MODE_LABELS, APP_MODE_LISTE } from './appModes.ts'
import type { Appbereich } from '../../types/lernstand'
import './appMode.css'

interface Startkarte {
  icon: Iconname
  beschreibung: string
  /** Zweite Zeile — heute nur bei der Sprach-App (Modern/Abenteuer). */
  zusatz?: string
}

// Die Schluessel stehen ausgeschrieben da, nicht als `[APP_MODES.LANGUAGE]`:
// `APP_MODES.LANGUAGE` hat den Typ `Appbereich`, also die ganze Union — als
// berechneter Schluessel entstuende daraus eine Index-Signatur, und dann
// faellt ein fehlender Bereich nicht mehr auf. Genau so haelt es
// `APP_MODE_LABELS` in appModes.ts.
const KARTEN: Record<Appbereich, Startkarte> = {
  language: {
    icon: 'sprache',
    beschreibung: 'Kurmancî, Deutsch, Englisch, Französisch und Spanisch lernen.',
    zusatz: 'Mit Modern-Ansicht und Abenteuer-Ansicht.',
  },
  code: {
    icon: 'puzzle',
    beschreibung: 'HTML, CSS, JavaScript, TypeScript, GitHub und VS Code Schritt für Schritt lernen.',
  },
  prompting: {
    icon: 'sprechblase',
    beschreibung: 'Lerne, wie du ChatGPT, Claude und Claude Code klare Aufgaben gibst.',
  },
  electro: {
    icon: 'blitz',
    beschreibung: 'Strom, Spannung und Sicherheit verstehen — mit Rechenaufgaben.',
  },
}

export interface AppLauncherProps {
  oeffnen: (mode: Appbereich) => void
}

export default function AppLauncher({ oeffnen }: AppLauncherProps) {
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
