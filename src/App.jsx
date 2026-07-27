import { useEffect, useState } from 'react'
import Heute from './Heute.jsx'
import Kurs from './Kurs.jsx'
import Ueben from './Ueben.jsx'
import Entdecken from './Entdecken.jsx'
import Fortschritt from './Fortschritt.jsx'
import Onboarding from './Onboarding.jsx'
import { statistik, profilLaden, edelsteine, level, appModus, setzeAppModus } from './fortschritt.js'
import Einstellungen from './Einstellungen.jsx'
import { statischeAnzahl } from './statisch.js'
import './styles.css'

const NAV = [
  ['heute', '🏠', 'Heute'],
  ['kurs', '📗', 'Kurs'],
  ['ueben', '🏋️', 'Üben'],
  ['entdecken', '🧭', 'Entdecken'],
  ['fortschritt', '📊', 'Fortschritt'],
]

export default function App() {
  const [seite, setSeite] = useState('heute')
  const [status, setStatus] = useState(null)
  const [eingerichtet, setEingerichtet] = useState(!!profilLaden())

  useEffect(() => { setzeAppModus(appModus()) }, [])

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() =>
      statischeAnzahl().then(a => setStatus({ saetze: a.beispiele, woerter: a.woerter, online: true })).catch(() => setStatus(false))
    )
  }, [])

  const s = statistik()

  if (!eingerichtet) {
    return <Onboarding fertig={() => setEingerichtet(true)} />
  }

  return (
    <div className="app">
      <aside className="leiste">
        <div className="marke">
          <img src="/bilder/logo.png" className="logo" alt="" />
          <span>RED-KURD<small>Lerne Kurmancî</small></span>
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
          <img src="/bilder/logo.png" className="top-logo" alt="RED-KURD" />
          <span className="top-lücke" />
          <span className="stat-chip klein">🔥 <strong>{s.serie}</strong> <small>Tage</small></span>
          <span className="stat-chip klein gelb">⭐ <strong>{s.xp}</strong> <small>XP</small></span>
          <span className="stat-chip klein">💎 <strong>{edelsteine()}</strong></span>
          <span className="stat-chip klein">🎖️ <strong>{level().stufe}</strong></span>
          <button className="avatar-knopf" onClick={() => setSeite('einstellungen')}>
            <img src="/bilder/helo-avatar.png" alt="Einstellungen" />
          </button>
        </div>
        <main>
          {seite === 'heute' && <Heute status={status} />}
          {seite === 'kurs' && <Kurs />}
          {seite === 'ueben' && <Ueben />}
          {seite === 'entdecken' && <Entdecken />}
          {seite === 'fortschritt' && <Fortschritt />}
          {seite === 'einstellungen' && <Einstellungen zurueck={() => setSeite('heute')}
            neustart={() => setEingerichtet(false)} />}
        </main>
      </div>
    </div>
  )
}
