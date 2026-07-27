// Satzbau-Training: echte Saetze aus Wortbloecken bauen
import { useEffect, useState } from 'react'
import { gibXp } from './fortschritt.js'

function mische(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function holeSatzpaare(anzahl) {
  try {
    const r = await fetch('/api/satzpaare?anzahl=' + anzahl)
    const d = await r.json()
    if (d.paare && d.paare.length) return d.paare
  } catch { /* Server aus */ }
  const { zufallsPaare } = await import('./statisch.js')
  return zufallsPaare(anzahl)
}

export default function Satzbau() {
  const [paare, setPaare] = useState(null)
  const [runde, setRunde] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [gewaehlt, setGewaehlt] = useState([])
  const [ergebnis, setErgebnis] = useState(null)

  useEffect(() => {
    holeSatzpaare(30).then(alle => {
      const passend = alle.filter(p => {
        const n = p.satz.split(/\s+/).length
        return n >= 3 && n <= 8
      }).slice(0, 8)
      setPaare(passend)
    })
  }, [])

  if (!paare) return <p className="hinweis">Lade Sätze…</p>
  if (paare.length === 0) return <p className="hinweis">Keine passenden Sätze gefunden.</p>

  const fertig = runde >= paare.length
  if (fertig) {
    return <div className="ergebnis">🎉 Satzbau fertig! {punkte} von {paare.length} richtig (+{punkte * 15} XP)</div>
  }

  const paar = paare[runde]
  const richtige = paar.satz.split(/\s+/)
  const bloecke = [...richtige].map((w, i) => ({ w, i })).sort((a, b) =>
    (a.w + a.i).localeCompare(b.w + b.i))

  function pruefen() {
    const ok = gewaehlt.map(b => b.w).join(' ') === richtige.join(' ')
    setErgebnis(ok)
    if (ok) { setPunkte(p => p + 1); gibXp(15) }
  }

  function weiter() {
    setGewaehlt([]); setErgebnis(null); setRunde(r => r + 1)
  }

  return (
    <div>
      <div className="balken"><div className="balken-voll" style={{ width: `${(runde / paare.length) * 100}%` }} /></div>
      <p className="hinweis">Satz {runde + 1} von {paare.length} · {punkte} richtig</p>
      <div className="frage">Baue den Satz auf Kurmancî: <strong>„{paar.uebersetzung}"</strong></div>
      <div className="satzbau-ziel">
        {gewaehlt.length === 0 && <span className="hinweis">Tippe die Blöcke in der richtigen Reihenfolge an…</span>}
        {gewaehlt.map((b, i) => (
          <button key={i} className="block gewaehlt" onClick={() => {
            if (ergebnis !== null) return
            setGewaehlt(gewaehlt.filter((_, j) => j !== i))
          }}>{b.w}</button>
        ))}
      </div>
      <div className="satzbau-pool">
        {bloecke.map((b) => {
          const benutzt = gewaehlt.some(g => g.i === b.i)
          return (
            <button key={b.i} className="block" disabled={benutzt || ergebnis !== null}
              onClick={() => setGewaehlt([...gewaehlt, b])}>{b.w}</button>
          )
        })}
      </div>
      {ergebnis === null && gewaehlt.length === richtige.length && (
        <button className="weiter" onClick={pruefen}>Prüfen</button>
      )}
      {ergebnis === true && <div className="richtig-text">✓ Richtig! {paar.satz}</div>}
      {ergebnis === false && <div className="falsch-text">✗ Richtig wäre: {paar.satz}</div>}
      {ergebnis !== null && <button className="weiter" onClick={weiter}>Weiter →</button>}
    </div>
  )
}

