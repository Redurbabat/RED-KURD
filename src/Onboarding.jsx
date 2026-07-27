// Onboarding: beim ersten Start den Lernplan festlegen
import { useState } from 'react'
import { profilSpeichern } from './fortschritt.js'

const SCHRITTE = [
  { id: 'kenntnis', frage: 'Wie gut kannst du schon Kurmancî?', optionen: [
    ['neu', '🌱 Ich beginne ganz neu'],
    ['etwas', '🙂 Ich kenne einige Wörter'],
    ['gespraech', '💬 Ich kann einfache Gespräche führen'],
  ]},
  { id: 'ziel', frage: 'Warum lernst du Kurdisch?', optionen: [
    ['familie', '👨‍👩‍👧 Familie & Wurzeln'],
    ['alltag', '🏠 Alltag & Gespräche'],
    ['kultur', '🎶 Kultur, Musik & Lesen'],
    ['reise', '✈️ Reisen'],
  ]},
  { id: 'minuten', frage: 'Wie viel Zeit hast du pro Tag?', optionen: [
    ['5', '⏱️ 5 Minuten'],
    ['10', '⏰ 10 Minuten'],
    ['20', '🕐 20 Minuten oder mehr'],
  ]},
]

export default function Onboarding({ fertig }) {
  const [schritt, setSchritt] = useState(0)
  const [antworten, setAntworten] = useState({})

  if (schritt >= SCHRITTE.length) {
    const minuten = antworten.minuten || '10'
    return (
      <div className="onboarding">
        <span className="maskottchen">🦅</span>
        <h2>Dein Plan steht!</h2>
        <div className="plan-karte">
          <div><strong>Kurmancî</strong> · Grundlagen</div>
          <div>{minuten} Minuten täglich</div>
          <div className="hinweis">Hêlo stellt dir jeden Tag die passende Sitzung zusammen —
            Wiederholungen, neue Wörter, Hören und Schreiben gemischt.</div>
        </div>
        <button className="heute-start" onClick={() => {
          profilSpeichern({ ...antworten, erstellt: new Date().toISOString() })
          fertig()
        }}>Erste Lektion starten</button>
      </div>
    )
  }

  const s = SCHRITTE[schritt]
  return (
    <div className="onboarding">
      <span className="maskottchen">🦅</span>
      <h2>{schritt === 0 ? 'Silav! Ich bin Hêlo.' : ''}</h2>
      <p className="frage">{s.frage}</p>
      <div className="onboarding-optionen">
        {s.optionen.map(([wert, text]) => (
          <button key={wert} className="option onboarding-option" onClick={() => {
            setAntworten(a => ({ ...a, [s.id]: wert }))
            setSchritt(x => x + 1)
          }}>{text}</button>
        ))}
      </div>
      <p className="hinweis">Schritt {schritt + 1} von {SCHRITTE.length} · später in „Fortschritt" änderbar</p>
    </div>
  )
}
