// Ueben: gezieltes Training einzelner Fertigkeiten
import { useState } from 'react'
import { faelligeKartenAlle } from './fortschritt.js'
import { Uebung, baueUebungen, mische, alleKursWoerter } from './Uebung.jsx'
import Satzbau from './Satzbau.jsx'

const MODI = [
  { id: 'wdh', symbol: '🔁', name: 'Wiederholen', text: 'Fällige Wörter aus deinem Wiederholsystem' },
  { id: 'bilder', symbol: '🖼️', name: 'Bilder', text: 'Bild-Zuordnung wie bei Duolingo' },
  { id: 'hoeren', symbol: '👂', name: 'Hören', text: 'Wort anhören, Bedeutung wählen' },
  { id: 'schreiben', symbol: '✍️', name: 'Schreiben', text: 'Wörter aktiv eintippen' },
  { id: 'satzbau', symbol: '🧩', name: 'Satzbau', text: 'Echte Sätze aus Blöcken bauen' },
]

export default function Ueben() {
  const [aktiv, setAktiv] = useState(null)
  const faellig = faelligeKartenAlle()

  if (aktiv === 'satzbau') {
    return (
      <section>
        <h2>🧩 Satzbau</h2>
        <Satzbau />
        <button className="weiter zweitrangig" onClick={() => setAktiv(null)}>← Zum Üben</button>
      </section>
    )
  }

  if (aktiv) {
    const modus = MODI.find(m => m.id === aktiv)
    let woerter, arten
    if (aktiv === 'wdh') {
      woerter = mische(faellig).slice(0, 15).map(k => ({ de: k.de, ku: k.ku,
        bild: (alleKursWoerter.find(x => x.ku === k.ku) || {}).bild }))
      arten = undefined
    } else {
      woerter = mische(alleKursWoerter).slice(0, 12)
      arten = aktiv === 'bilder' ? ['bild'] : aktiv === 'hoeren' ? ['hoeren'] : ['tippen']
    }
    const uebungen = baueUebungen(woerter, arten)
    return (
      <section>
        <h2>{modus.symbol} {modus.name}</h2>
        {uebungen.length === 0 ? (
          <p>Nichts zu üben — super! {aktiv === 'wdh' ? 'Keine Wiederholungen fällig.' : ''}</p>
        ) : (
          <Uebung uebungen={uebungen} titel={modus.name} fertigMelden={() => {}} />
        )}
        <button className="weiter zweitrangig" onClick={() => setAktiv(null)}>← Zum Üben</button>
      </section>
    )
  }

  return (
    <section>
      <h2>Üben</h2>
      <p className="hinweis">Trainiere gezielt einzelne Fertigkeiten. {faellig.length > 0 ? `🔁 ${faellig.length} Wörter warten auf Wiederholung.` : ''}</p>
      <div className="ueben-kacheln">
        {MODI.map(m => (
          <button key={m.id} className="ueben-kachel" onClick={() => setAktiv(m.id)}>
            <span className="ueben-symbol">{m.symbol}</span>
            <strong>{m.name}</strong>
            <span className="hinweis">{m.text}</span>
            {m.id === 'wdh' && faellig.length > 0 && <span className="abzeichen">{faellig.length}</span>}
          </button>
        ))}
      </div>
    </section>
  )
}
