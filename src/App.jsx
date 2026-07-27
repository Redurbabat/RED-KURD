import { useEffect, useState } from 'react'
import Heute from './Heute.jsx'
import Kurs from './Kurs.jsx'
import Ueben from './Ueben.jsx'
import Entdecken from './Entdecken.jsx'
import Fortschritt from './Fortschritt.jsx'
import { statistik, profilLaden } from './fortschritt.js'
import Onboarding from './Onboarding.jsx'
import { statischeAnzahl } from './statisch.js'
import './styles.css'

const NAV = [
  ['heute', '🦅', 'Heute'],
  ['kurs', '🎓', 'Kurs'],
  ['ueben', '🏋️', 'Üben'],
  ['entdecken', '🧭', 'Entdecken'],
  ['fortschritt', '📊', 'Fortschritt'],
]

export default function App() {
  const [seite, setSeite] = useState('heute')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() =>
      statischeAnzahl().then(a => setStatus({ saetze: a.beispiele, woerter: a.woerter, online: true })).catch(() => setStatus(false))
    )
  }, [])

  const [eingerichtet, setEingerichtet] = useState(!!profilLaden())
  const s = statistik()

  if (!eingerichtet) {
    return <Onboarding fertig={() => setEingerichtet(true)} />
  }

  return (
    <div className="app">
      <aside className="leiste">
        <div className="marke">
          <img src="/icon-192.png" className="logo" alt="" />
          <span>RED-KURD</span>
        </div>
        {NAV.map(([id, icon, name]) => (
          <button key={id} className={'leiste-knopf' + (seite === id ? ' aktiv' : '')}
            onClick={() => setSeite(id)}>
            <span className="leiste-icon">{icon}</span>
            <span className="leiste-text">{name}</span>
          </button>
        ))}
        <a className="leiste-github" href="https://github.com/Redurbabat/RED-KURD"
          target="_blank" rel="noreferrer">Open Source · GitHub</a>
      </aside>
      <div className="inhalt">
        <div className="topbar">
          <span className="top-stat feuer">🔥 {s.serie}</span>
          <span className="top-stat stern">⭐ {s.xp} XP</span>
          <span className="top-stat buch">📚 {s.gelernt}</span>
        </div>
        <main>
          {seite === 'heute' && <Heute status={status} />}
          {seite === 'kurs' && <Kurs />}
          {seite === 'ueben' && <Ueben />}
          {seite === 'entdecken' && <Entdecken />}
          {seite === 'fortschritt' && <Fortschritt />}
        </main>
      </div>
    </div>
  )
}
