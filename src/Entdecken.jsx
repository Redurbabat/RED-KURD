// Entdecken: Woerterbuch, Lesen, Schrift unter einem Dach
import { useState } from 'react'
import Woerterbuch from './Woerterbuch.jsx'
import Lesen from './Lesen.jsx'
import Werkzeuge from './Werkzeuge.jsx'

const TABS = [
  ['woerterbuch', '📕 Wörterbuch'],
  ['lesen', '📖 Lesen'],
  ['schrift', '🔤 Schrift'],
]

export default function Entdecken() {
  const [tab, setTab] = useState('woerterbuch')
  return (
    <section>
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
