// Kurs im RED-KURD-Design: Ring-Uebersicht + nummerierte Einheiten-Liste
import { useState } from 'react'
import { kurse } from './data/kurse.js'
import { holeStand, lektionAbgeschlossen, zaehleAufgabe } from './fortschritt.js'
import { Uebung, baueUebungen, mische } from './Uebung.jsx'

export default function Kurs() {
  const [aktiv, setAktiv] = useState(null)
  const [phase, setPhase] = useState('intro')
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
          <h1>{kurs.symbol} {kurs.name}</h1>
          <div className="karte">
            <div className="karte-titel">🎯 Lernziel</div>
            <div>{kurs.ziel}</div>
            <p className="hinweis" style={{ marginTop: '.5rem' }}>
              {kurs.woerter.length} Wörter lernen → Mini-Prüfung mit 5 Aufgaben.
              Ab 80 % ist die Einheit geschafft. ✓
            </p>
          </div>
          <button className="heute-start" onClick={() => setPhase('lernen')}>▶ Los geht's</button>
          <button className="weiter zweitrangig" onClick={zurueck}>← Zum Kurs</button>
        </section>
      )
    }

    if (phase === 'lernen') {
      return (
        <section>
          <h1>{kurs.symbol} {kurs.name}</h1>
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
          <h1>📝 Mini-Prüfung: {kurs.name}</h1>
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
        <h1>{kurs.symbol} {kurs.name}</h1>
        {ergebnis >= 80 ? (
          <div className="feedback gut">
            <img src="/bilder/helo-daumen.png" alt="" className="helo-mini" />
            <div><strong>Einheit geschafft — {ergebnis} %!</strong><br />
              <span className="hinweis">Hêlo plant die Wiederholung automatisch ein.</span></div>
          </div>
        ) : (
          <div className="rueckstand">
            <strong>{ergebnis} % — fast!</strong> Ab 80 % gilt die Einheit als geschafft.
            Wiederhole die Wörter unter „Üben" und versuch es nochmal. 💪
          </div>
        )}
        <button className="heute-start" onClick={zurueck}>Zum Kurs</button>
      </section>
    )
  }

  const geschafft = kurse.filter(k => stand.lektionen[k.id] >= 80).length
  const gesamtProzent = Math.round((geschafft / kurse.length) * 100)
  const aktuelleNr = kurse.findIndex(k => !(stand.lektionen[k.id] >= 80)) + 1 || kurse.length

  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>Dein Kurs</h1>
          <p className="untertitel-neu">Schritt für Schritt zum Sprechen</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>
      <div className="sprach-pille">🌐 Kurmancî · Grundlagen</div>

      <div className="karte ring-karte">
        <div className="ring" style={{ background: `conic-gradient(var(--teal) ${gesamtProzent * 3.6}deg, var(--rand) 0deg)` }}>
          <span>{gesamtProzent} %</span>
        </div>
        <div>
          <strong>A1 Grundlagen</strong>
          <div className="hinweis">Einheit {aktuelleNr} von {kurse.length}</div>
        </div>
      </div>

      <div className="einheiten-liste">
        {kurse.map((k, i) => {
          const best = stand.lektionen[k.id]
          const fertig = best >= 80
          const begonnen = best > 0 && !fertig
          const naechste = !best && kurse.slice(0, i).every(v => stand.lektionen[v.id] >= 80)
          return (
            <button key={k.id}
              className={'einheit-zeile' + (naechste ? ' aktuell' : '') + (fertig ? ' fertig' : '')}
              onClick={() => oeffne(k.id)}>
              <span className={'einheit-nr' + (fertig ? ' gruen' : naechste ? ' teal' : '')}>{i + 1}</span>
              <span className="einheit-bild">{k.symbol}</span>
              <span className="einheit-text">
                <strong>{k.name}</strong>
                {fertig && <small className="gruen-text">Abgeschlossen · {best} %</small>}
                {begonnen && <small>{best} % — noch nicht bestanden</small>}
                {naechste && <small className="teal-text">Als Nächstes empfohlen</small>}
                {!best && !naechste && <small>Empfohlen nach Einheit {i}</small>}
              </span>
              {fertig ? <span className="status-haken">✓</span>
                : naechste ? <span className="fortsetzen-knopf">Starten ›</span>
                : <span className="status-schloss">›</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
