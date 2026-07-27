// Kurs: der Lernpfad mit Einheiten
import { useState } from 'react'
import { kurse } from './data/kurse.js'
import { holeStand, lektionAbgeschlossen } from './fortschritt.js'
import { Uebung, baueUebungen } from './Uebung.jsx'

export default function Kurs() {
  const [aktiv, setAktiv] = useState(null)
  const [stand, setStand] = useState(holeStand())

  function zurueck() { setAktiv(null); setStand(holeStand()) }

  if (aktiv) {
    const kurs = kurse.find(k => k.id === aktiv)
    return (
      <section>
        <h2>{kurs.symbol} {kurs.name}</h2>
        <Uebung uebungen={baueUebungen(kurs.woerter)} titel={kurs.name}
          fertigMelden={(prozent) => lektionAbgeschlossen(kurs.id, prozent)} />
        <button className="weiter zweitrangig" onClick={zurueck}>← Zum Kurs</button>
      </section>
    )
  }

  return (
    <section>
      <h2>Dein Kurs · Deutsch → Kurmancî</h2>
      <div className="pfad">
        {kurse.map((k, i) => {
          const best = stand.lektionen[k.id]
          const cls = best >= 80 ? ' fertig' : best ? ' teil' : ''
          const naechste = !best && kurse.slice(0, i).every(v => stand.lektionen[v.id] >= 80)
          return (
            <div key={k.id} className={'knoten-halter versatz-' + (i % 4)}>
              {naechste && <div className="start-blase">START</div>}
              <button className={'knoten' + cls + (naechste ? ' naechste' : '')}
                onClick={() => setAktiv(k.id)}>
                <span className="knoten-bild">{k.symbol}</span>
                {best >= 80 && <span className="haken">✓</span>}
              </button>
              <div className="knoten-name">{k.name}{best ? ` · ${best}%` : ''}</div>
            </div>
          )
        })}
        <div className="knoten-halter versatz-0">
          <div className="pokal">🏆</div>
          <div className="knoten-name">Alles geschafft!</div>
        </div>
      </div>
      <p className="hinweis">Du darfst jede Einheit öffnen — Hêlo empfiehlt aber die Reihenfolge des Pfades. 🦅</p>
    </section>
  )
}
