// Fortschritt im RED-KURD-Design: Ring, Fertigkeiten, Wochen-Chart, naechstes Ziel
import { statistik, fertigkeiten, ankiExport, exportiereAlles, importiereAlles, holeStand, wochenAktivitaet } from './fortschritt.js'
import { kurse } from './data/kurse.js'
import { alleKursWoerter } from './Uebung.jsx'

const SKILLS = [
  ['erkennen', '👁️', 'Erkennen', 'teal'],
  ['abrufen', '🧠', 'Abrufen', 'gruen'],
  ['schreiben', '✍️', 'Schreiben', 'orange'],
  ['hoeren', '🎧', 'Hören', 'lila'],
]

function stufeName(p) {
  return p >= 70 ? 'Stark' : p >= 50 ? 'Fortgeschritten' : p >= 25 ? 'Mittelmäßig' : 'Am Anfang'
}

export default function Fortschritt() {
  const s = statistik()
  const f = fertigkeiten()
  const stand = holeStand()
  const woche = wochenAktivitaet()
  const geschafft = kurse.filter(k => stand.lektionen[k.id] >= 80).length
  const wortschatz = Math.min(100, Math.round((s.sicher / alleKursWoerter.length) * 100))
  const maxWoche = Math.max(1, ...woche.map(w => w.anzahl))
  const naechstesZiel = SKILLS.filter(([id]) => f[id + 'Anzahl'] > 0).sort((a, b) => f[a[0]] - f[b[0]])[0]

  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>Fortschritt</h1>
          <p className="untertitel-neu">So entwickelst du dich weiter</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>

      <div className="held-karte">
        <div>
          <div className="karte-titel hell">Gesamtfortschritt · Wortschatz</div>
          <div className="held-zahl">{wortschatz} %</div>
          <div className="hell-text">Du bist auf dem richtigen Weg!</div>
        </div>
        <div className="ring hell-ring" style={{ background: `conic-gradient(#fff ${wortschatz * 3.6}deg, rgba(255,255,255,.25) 0deg)` }}>
          <span>{wortschatz} %</span>
        </div>
      </div>

      <div className="chip-reihe">
        <div className="stat-chip">🔥 <strong>{s.serie}</strong> Tage Serie</div>
        <div className="stat-chip">⭐ <strong>{s.xp}</strong> XP</div>
        <div className="stat-chip">🔁 <strong>{s.faellig}</strong> fällig heute</div>
        <div className="stat-chip">📚 <strong>{s.gelernt}</strong> Wörter</div>
      </div>

      <div className="karte">
        <div className="karte-titel">Fertigkeiten</div>
        <div className="skill-liste">
          {SKILLS.map(([id, icon, name, farbe]) => (
            <div key={id} className="skill-zeile">
              <span className="skill-name">{icon} {name}</span>
              <div className="balken skill-balken"><div className={'balken-voll ' + farbe} style={{ width: f[id] + '%' }} /></div>
              <span className="skill-wert">{f[id + 'Anzahl'] ? f[id] + ' %' : '–'}</span>
              <span className="skill-stufe">{f[id + 'Anzahl'] ? stufeName(f[id]) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="karte">
        <div className="karte-titel">Letzte 7 Tage</div>
        <div className="wochen-chart">
          {woche.map((w, i) => (
            <div key={i} className="wochen-saeule">
              {w.anzahl > 0 && <span className="saeulen-zahl">{w.anzahl}</span>}
              <div className="saeule" style={{ height: Math.max(4, (w.anzahl / maxWoche) * 70) + 'px' }} />
              <small>{w.tag}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="chip-reihe">
        <div className="stat-chip">📗 <strong>{geschafft}/{kurse.length}</strong> Einheiten</div>
        <div className="stat-chip">🛡️ <strong>{s.sicher}</strong> Wörter sicher</div>
      </div>

      {naechstesZiel && (
        <div className="karte lila-karte">
          <div className="karte-titel">🎯 Nächstes Ziel</div>
          <div><strong>{naechstesZiel[2]}</strong> stärken — aktuell {f[naechstesZiel[0]]} %.
            <span className="hinweis"> Kurze Übungen unter „Üben" bringen dich weiter!</span></div>
        </div>
      )}

      <div className="karte">
        <div className="karte-titel">Geräte-Sync & Export</div>
        <div className="knopfzelle" style={{ flexWrap: 'wrap', gap: '.5rem' }}>
          <button className="mini" onClick={() => {
            const blob = new Blob([exportiereAlles()], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'red-kurd-lernstand.json'
            a.click()
          }}>⬆️ Lernstand exportieren</button>
          <label className="mini" style={{ cursor: 'pointer' }}>
            ⬇️ Lernstand importieren
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => {
              const datei = e.target.files[0]
              if (!datei) return
              const leser = new FileReader()
              leser.onload = () => {
                try { importiereAlles(leser.result); window.location.reload() }
                catch { alert('Datei konnte nicht gelesen werden.') }
              }
              leser.readAsText(datei)
            }} />
          </label>
          <button className="mini" onClick={() => {
            const blob = new Blob([ankiExport()], { type: 'text/tab-separated-values' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'red-kurd-anki.txt'
            a.click()
          }}>📤 Anki-Export</button>
        </div>
        <p className="hinweis">Alles bleibt bei dir — ohne Konto, ohne Cloud.</p>
      </div>
    </section>
  )
}
