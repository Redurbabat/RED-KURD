// Entdecken nach PDF-Design: Woerterbuch, Texte, Schrift, Redewendungen & Kultur
import { useState } from 'react'
import Woerterbuch from './Woerterbuch.jsx'
import Lesen from './Lesen.jsx'
import Werkzeuge from './Werkzeuge.jsx'
import { texte } from './data/texte.js'
import { redewendungen, kultur } from './data/kultur.js'
import { spieleWort } from './audio.js'

export default function Entdecken() {
  const [tab, setTab] = useState('start')

  if (tab === 'woerterbuch' || tab === 'lesen' || tab === 'schrift' || tab === 'kultur') {
    return (
      <section>
        <div className="richtungswahl">
          <button className="mini" onClick={() => setTab('start')}>← Entdecken</button>
          <button className={tab === 'woerterbuch' ? 'aktiv-klein' : 'mini'} onClick={() => setTab('woerterbuch')}>📕 Wörterbuch</button>
          <button className={tab === 'lesen' ? 'aktiv-klein' : 'mini'} onClick={() => setTab('lesen')}>📖 Lesen</button>
          <button className={tab === 'schrift' ? 'aktiv-klein' : 'mini'} onClick={() => setTab('schrift')}>🔤 Schrift</button>
          <button className={tab === 'kultur' ? 'aktiv-klein' : 'mini'} onClick={() => setTab('kultur')}>🎶 Kultur</button>
        </div>
        {tab === 'woerterbuch' && <Woerterbuch />}
        {tab === 'lesen' && <Lesen />}
        {tab === 'schrift' && <Werkzeuge />}
        {tab === 'kultur' && (
          <div>
            <h2>Redewendungen & Kultur</h2>
            <p className="hinweis">Sprüche, Weisheiten und Einblicke in die kurdische Kultur.</p>
            {redewendungen.map((r, i) => (
              <div key={i} className="karte">
                <div className="ku" style={{ fontSize: '1.05rem' }}>{r.ku}{' '}
                  <button className="ton" onClick={() => spieleWort(r.ku)}>🔊</button></div>
                <div>{r.de}</div>
                <div className="hinweis">{r.sinn}</div>
              </div>
            ))}
            <h3 style={{ marginTop: '1.2rem' }}>Kultur & Alltag</h3>
            {kultur.map((k, i) => (
              <div key={i} className="karte">
                <strong>{k.titel}</strong>
                <p className="hinweis" style={{ fontSize: '.9rem' }}>{k.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>Entdecken</h1>
          <p className="untertitel-neu">Wissen erweitern. Kultur erleben. Weiter wachsen.</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>

      <button className="karte klick-karte" onClick={() => setTab('woerterbuch')}>
        <div className="karte-titel">🔍 Wörterbuch</div>
        <div><strong>840.000+ Wörter & Ausdrücke</strong> aus Kurmancî, Soranî & Zazakî</div>
        <div className="hinweis">💡 Beispiel: dil – Herz · can – Seele · heval – Freund</div>
      </button>

      <div className="karte">
        <div className="karte-titel">📖 Kurze Texte <button className="mini" style={{ float: 'right' }}
          onClick={() => setTab('lesen')}>Alle ansehen</button></div>
        <div className="text-karten">
          {texte.slice(0, 3).map(t => (
            <button key={t.id} className="text-karte" onClick={() => setTab('lesen')}>
              <img src={t.id === 'ciya' || t.id === 'berf' ? '/bilder/welt-band.jpg' : '/bilder/tee.jpg'} alt="" />
              <span className={'niveau niveau-' + t.niveau}>{t.niveau}</span>
              <strong>{t.titel}</strong>
              <small>{t.text.split(' ').length} Wörter · ~3 Min</small>
            </button>
          ))}
        </div>
      </div>

      <button className="karte warm klick-karte" onClick={() => setTab('schrift')}>
        <div className="karte-titel orange-text">🔤 Schrift-Umwandlung</div>
        <div>Kurmancî in verschiedenen Schriften umwandeln</div>
        <div className="tastatur" style={{ marginTop: '.4rem' }}>
          <span className="dauer-chip">LATÎN → ARABÎ</span>
          <span className="dauer-chip">ARABÎ → LATÎN</span>
        </div>
      </button>

      <button className="karte lila-karte klick-karte" onClick={() => setTab('kultur')}>
        <div className="karte-titel" style={{ color: 'var(--lila)' }}>🎶 Redewendungen & Kultur</div>
        <div>Sprüche, Weisheiten und Einblicke in unsere Kultur</div>
      </button>
    </section>
  )
}
