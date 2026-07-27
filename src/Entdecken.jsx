// Entdecken im RED-KURD-Design: Suche + Chips fuer Lesen/Woerterbuch/Schrift
import { useState } from 'react'
import Woerterbuch from './Woerterbuch.jsx'
import Lesen from './Lesen.jsx'
import Werkzeuge from './Werkzeuge.jsx'

const TABS = [
  ['lesen', '📖 Lesen'],
  ['woerterbuch', '📕 Wörterbuch'],
  ['schrift', '🔤 Schrift'],
]

export default function Entdecken() {
  const [tab, setTab] = useState('lesen')
  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>Entdecken</h1>
          <p className="untertitel-neu">Lies, suche und vertiefe dein Kurmancî</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>
      <div className="richtungswahl">
        {TABS.map(([id, name]) => (
          <button key={id} className={tab === id ? 'aktiv-klein' : 'mini'}
            onClick={() => setTab(id)}>{name}</button>
        ))}
      </div>
      {tab === 'woerterbuch' && <Woerterbuch />}
      {tab === 'lesen' && <Lesen />}
      {tab === 'schrift' && <Werkzeuge />}
    </section>
  )
}
