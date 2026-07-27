// Fortschritt: Koennen statt nur XP
import { statistik, fertigkeiten, ankiExport, exportiereAlles, importiereAlles } from './fortschritt.js'
import { kurse } from './data/kurse.js'
import { holeStand } from './fortschritt.js'

const SKILL_NAMEN = {
  erkennen: '👁️ Erkennen', abrufen: '🗣️ Abrufen',
  schreiben: '✍️ Schreiben', hoeren: '👂 Hören',
}

export default function Fortschritt() {
  const s = statistik()
  const f = fertigkeiten()
  const stand = holeStand()
  const geschafft = kurse.filter(k => stand.lektionen[k.id] >= 80).length

  return (
    <section>
      <h2>Dein Fortschritt</h2>

      <h3>Fertigkeiten</h3>
      <div className="skill-liste">
        {Object.entries(SKILL_NAMEN).map(([id, name]) => (
          <div key={id} className="skill-zeile">
            <span className="skill-name">{name}</span>
            <div className="balken skill-balken"><div className="balken-voll" style={{ width: f[id] + '%' }} /></div>
            <span className="skill-wert">{f[id + 'Anzahl'] ? f[id] + ' %' : '–'}</span>
          </div>
        ))}
      </div>
      <p className="hinweis">Anteil sicher beherrschter Wörter je Fertigkeit (ab Stufe 3 im Wiederholsystem).</p>

      <h3>Kurs</h3>
      <div className="statgitter">
        <div className="statkarte"><div className="statzahl">{geschafft}/{kurse.length}</div><div>Einheiten geschafft</div></div>
        <div className="statkarte"><div className="statzahl">{s.gelernt}</div><div>Wörter im System</div></div>
        <div className="statkarte"><div className="statzahl">{s.sicher}</div><div>Wörter sicher</div></div>
        <div className="statkarte"><div className="statzahl">{s.faellig}</div><div>zum Wiederholen</div></div>
      </div>

      <h3>Aktivität</h3>
      <div className="statgitter">
        <div className="statkarte"><div className="statzahl">{s.serie}</div><div>Tage Serie 🔥</div></div>
        <div className="statkarte"><div className="statzahl">{s.xp}</div><div>XP gesammelt</div></div>
      </div>

      <button className="weiter" onClick={() => {
        const daten = ankiExport()
        const blob = new Blob([daten], { type: 'text/tab-separated-values' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'red-kurd-anki.txt'
        a.click()
      }}>📤 Für Anki exportieren</button>
      <h3>Geräte-Sync (ohne Konto)</h3>
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
      </div>
      <p className="hinweis">Exportiere deinen Lernstand als Datei und importiere ihn auf dem Handy
        (oder umgekehrt) — deine Daten bleiben komplett bei dir, ganz ohne Konto.
        Dein Lernstand wird sonst in diesem Browser gespeichert.</p>
    </section>
  )
}
