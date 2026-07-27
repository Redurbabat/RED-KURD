// Kurs: Lernpfad mit echten Einheiten (Lernziel -> Lernen -> Mini-Pruefung)
import { useState } from 'react'
import { kurse } from './data/kurse.js'
import { holeStand, lektionAbgeschlossen } from './fortschritt.js'
import { Uebung, baueUebungen, mische } from './Uebung.jsx'

export default function Kurs() {
  const [aktiv, setAktiv] = useState(null)
  const [phase, setPhase] = useState('intro')   // intro -> lernen -> pruefung -> ergebnis
  const [lernenFertig, setLernenFertig] = useState(false)
  const [ergebnis, setErgebnis] = useState(null)
  const [stand, setStand] = useState(holeStand())

  function zurueck() {
    setAktiv(null); setPhase('intro'); setLernenFertig(false); setErgebnis(null)
    setStand(holeStand())
  }

  function oeffne(id) {
    setAktiv(id); setPhase('intro'); setLernenFertig(false); setErgebnis(null)
  }

  if (aktiv) {
    const kurs = kurse.find(k => k.id === aktiv)

    if (phase === 'intro') {
      return (
        <section>
          <h2>{kurs.symbol} Einheit: {kurs.name}</h2>
          <div className="plan-karte">
            <strong>🎯 Lernziel</strong>
            <div>{kurs.ziel}</div>
            <div className="hinweis" style={{ marginTop: '.5rem' }}>
              So läuft die Einheit: {kurs.woerter.length} Wörter lernen (Bilder, Hören,
              Auswählen, Tippen) → dann eine kurze <strong>Mini-Prüfung</strong> mit 5 Aufgaben.
              Ab 80 % gilt die Einheit als geschafft. ✓
            </div>
          </div>
          <button className="heute-start" onClick={() => setPhase('lernen')}>Los geht's</button>
          <button className="weiter zweitrangig" onClick={zurueck}>← Zum Kurs</button>
        </section>
      )
    }

    if (phase === 'lernen') {
      return (
        <section>
          <h2>{kurs.symbol} {kurs.name} · Lernen</h2>
          <Uebung uebungen={baueUebungen(kurs.woerter)} titel={kurs.name}
            fertigMelden={() => setLernenFertig(true)} />
          {lernenFertig && (
            <button className="heute-start" onClick={() => setPhase('pruefung')}>
              Zur Mini-Prüfung →
            </button>
          )}
          <button className="weiter zweitrangig" onClick={zurueck}>← Zum Kurs</button>
        </section>
      )
    }

    if (phase === 'pruefung') {
      const pruefWoerter = mische(kurs.woerter).slice(0, 5)
      return (
        <section>
          <h2>📝 Mini-Prüfung: {kurs.name}</h2>
          <Uebung uebungen={baueUebungen(pruefWoerter, ['wahl-ku', 'tippen', 'hoeren'])}
            titel="Mini-Prüfung"
            fertigMelden={(prozent) => {
              setErgebnis(prozent)
              lektionAbgeschlossen(kurs.id, prozent)
              setPhase('ergebnis')
            }} />
          <button className="weiter zweitrangig" onClick={zurueck}>← Abbrechen</button>
        </section>
      )
    }

    return (
      <section>
        <h2>{kurs.symbol} {kurs.name}</h2>
        {ergebnis >= 80 ? (
          <div className="plan-karte bestanden">
            <span className="maskottchen">🦅</span>
            <strong>Einheit geschafft — {ergebnis} %!</strong>
            <div className="hinweis">Hêlo plant die Wörter automatisch zur Wiederholung ein.
              In ein paar Tagen fragt „Heute" sie wieder ab — dann sitzt es wirklich.</div>
          </div>
        ) : (
          <div className="rueckstand">
            <strong>{ergebnis} % — fast!</strong> Ab 80 % gilt die Einheit als geschafft.
            Hêlo empfiehlt: Wiederhole die Wörter unter „Üben" und versuch es dann nochmal. 💪
          </div>
        )}
        <button className="heute-start" onClick={zurueck}>Zum Kurs</button>
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
                onClick={() => oeffne(k.id)}>
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
      <p className="hinweis">Jede Einheit: Lernziel → Lernen → Mini-Prüfung. Du darfst jede öffnen — Hêlo empfiehlt die Reihenfolge. 🦅</p>
    </section>
  )
}
