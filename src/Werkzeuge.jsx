import { useState } from 'react'
import { lateinNachArabisch, arabischNachLatein, sprich } from './schrift.js'

export default function Werkzeuge() {
  const [latein, setLatein] = useState('Silav, tu çawa yî?')
  const [arabisch, setArabisch] = useState('')
  const [richtung, setRichtung] = useState('l2a')

  function umwandeln() {
    if (richtung === 'l2a') setArabisch(lateinNachArabisch(latein))
    else setLatein(arabischNachLatein(arabisch))
  }

  return (
    <section>
      <h2>🔤 Schrift-Umwandlung</h2>
      <p className="hinweis">
        Kurdisch wird in zwei Schriften geschrieben: Latein (Hawar, z.B. in der Türkei/Syrien)
        und arabische Schrift (z.B. im Irak/Iran). Beta-Version – einfache Regeln nach dem
        Vorbild des klpt-Projekts.
      </p>
      <div className="richtungswahl">
        <button className={richtung === 'l2a' ? 'aktiv-klein' : 'mini'} onClick={() => setRichtung('l2a')}>
          Latein → Arabisch
        </button>
        <button className={richtung === 'a2l' ? 'aktiv-klein' : 'mini'} onClick={() => setRichtung('a2l')}>
          Arabisch → Latein
        </button>
      </div>
      <label className="feld-label">Latein (Hawar)</label>
      <textarea className="umwandler" rows="3" value={latein}
        onChange={e => setLatein(e.target.value)} dir="ltr" />
      <div className="tastatur">
        {['ê','î','û','ş','ç'].map(z => (
          <button key={z} type="button" className="taste" onClick={() => setLatein(latein + z)}>{z}</button>
        ))}
        <button className="mini ton" onClick={() => sprich(latein)}>🔊 Vorlesen</button>
      </div>
      <button className="weiter" onClick={umwandeln}>⇄ Umwandeln</button>
      <label className="feld-label">Arabische Schrift</label>
      <textarea className="umwandler arabisch" rows="3" value={arabisch}
        onChange={e => setArabisch(e.target.value)} dir="rtl" />
    </section>
  )
}
