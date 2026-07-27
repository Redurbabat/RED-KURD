import { useEffect, useState } from 'react'
import { kurse } from './data/kurse.js'
import { gibXp, lektionAbgeschlossen, karteBewerten, faelligeKarten, statistik, istRichtigGetippt, holeStand } from './fortschritt.js'

function mische(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// Baut gemischte Uebungen aus einer Wortliste: Auswahl (beide Richtungen) + Tippen
function baueUebungen(woerter, alleWoerter) {
  const uebungen = []
  for (const w of mische(woerter)) {
    const arten = ['wahl-ku', 'wahl-de', 'tippen']
    // Bild-Uebung nur, wenn genug verschiedene Bilder da sind
    if (w.bild) {
      const andere = alleWoerter.filter(x => x.bild && x.bild !== w.bild && x.ku !== w.ku)
      if (andere.length >= 3) arten.push('bild', 'bild')
    }
    const art = mische(arten)[0]
    if (art === 'bild') {
      const falsche = []
      const gesehen = new Set([w.bild])
      for (const x of mische(alleWoerter)) {
        if (x.bild && !gesehen.has(x.bild) && x.ku !== w.ku) {
          falsche.push(x); gesehen.add(x.bild)
          if (falsche.length === 3) break
        }
      }
      uebungen.push({ art, frage: w.ku, antwort: w.bild,
        optionen: mische([w, ...falsche]).map(x => ({ bild: x.bild, ku: x.ku })), w })
      continue
    }
    if (art === 'tippen') {
      uebungen.push({ art, frage: w.de, antwort: w.ku, w })
    } else if (art === 'wahl-de') {
      const falsche = mische(alleWoerter.filter(x => x.de !== w.de)).slice(0, 3)
      uebungen.push({ art, frage: w.ku, antwort: w.de, optionen: mische([w.de, ...falsche.map(x => x.de)]), w })
    } else {
      const falsche = mische(alleWoerter.filter(x => x.ku !== w.ku)).slice(0, 3)
      uebungen.push({ art, frage: w.de, antwort: w.ku, optionen: mische([w.ku, ...falsche.map(x => x.ku)]), w })
    }
  }
  return uebungen
}

function Uebung({ titel, woerter, alleWoerter, fertigMelden }) {
  const [uebungen] = useState(() => baueUebungen(woerter, alleWoerter))
  const [index, setIndex] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [antwort, setAntwort] = useState(null)
  const [eingabe, setEingabe] = useState('')

  const u = uebungen[index]
  const fertig = index >= uebungen.length

  useEffect(() => {
    if (fertig) fertigMelden(Math.round((punkte / uebungen.length) * 100))
  }, [fertig])

  if (fertig) {
    return (
      <div className="ergebnis">
        🎉 Fertig! {punkte} von {uebungen.length} richtig (+{punkte * 10} XP)
      </div>
    )
  }

  function bewerten(richtig) {
    if (richtig) { setPunkte(p => p + 1); gibXp(10) }
    karteBewerten(u.w.de, u.w.ku, richtig)
  }

  function waehle(opt) {
    if (antwort !== null) return
    setAntwort(opt)
    bewerten(opt === u.antwort)
  }

  function pruefeTipp(e) {
    e.preventDefault()
    if (antwort !== null) return
    const ok = istRichtigGetippt(eingabe, u.antwort)
    setAntwort(ok ? u.antwort : eingabe || '(leer)')
    bewerten(ok)
  }

  function weiter() { setAntwort(null); setEingabe(''); setIndex(i => i + 1) }

  return (
    <div>
      <div className="balken"><div className="balken-voll" style={{ width: `${(index / uebungen.length) * 100}%` }} /></div>
      <p className="hinweis">{titel} · Übung {index + 1} von {uebungen.length} · {punkte} richtig</p>
      {u.art === 'bild' ? (
        <>
          <div className="frage">Welches Bild passt zu <strong>„{u.frage}"</strong>?
            {' '}<span className="kat">({u.w.de})</span></div>
          <div className="optionen bild-optionen">
            {u.optionen.map(opt => {
              let cls = 'option bild-option'
              if (antwort !== null) {
                if (opt.bild === u.antwort) cls += ' richtig'
                else if (opt.bild === antwort) cls += ' falsch'
              }
              return (
                <button key={opt.bild} className={cls} onClick={() => {
                  if (antwort !== null) return
                  setAntwort(opt.bild)
                  bewerten(opt.bild === u.antwort)
                }}>
                  <span className="gross-bild">{opt.bild}</span>
                </button>
              )
            })}
          </div>
        </>
      ) : u.art === 'tippen' ? (
        <>
          <div className="frage">Tippe auf Kurmancî: <strong>„{u.frage}"</strong></div>
          <form onSubmit={pruefeTipp} className="suchzeile">
            <input className="suche" autoFocus value={eingabe} onChange={e => setEingabe(e.target.value)}
              placeholder="Antwort tippen…" disabled={antwort !== null} />
            <button className="weiter" type="submit" disabled={antwort !== null}>Prüfen</button>
          </form>
          <div className="tastatur">
            {['ê','î','û','ş','ç'].map(z => (
              <button key={z} type="button" className="taste" onClick={() => setEingabe(eingabe + z)}>{z}</button>
            ))}
          </div>
          {antwort !== null && (
            <div className={antwort === u.antwort ? 'richtig-text' : 'falsch-text'}>
              {antwort === u.antwort ? '✓ Richtig!' : `✗ Richtig wäre: ${u.antwort}`}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="frage">
            {u.w.bild && <span className="frage-bild">{u.w.bild}</span>}
            Was heißt <strong>„{u.frage}"</strong> auf {u.art === 'wahl-de' ? 'Deutsch' : 'Kurmancî'}?
          </div>
          <div className="optionen">
            {u.optionen.map(opt => {
              let cls = 'option'
              if (antwort !== null) {
                if (opt === u.antwort) cls += ' richtig'
                else if (opt === antwort) cls += ' falsch'
              }
              return <button key={opt} className={cls} onClick={() => waehle(opt)}>{opt}</button>
            })}
          </div>
        </>
      )}
      {antwort !== null && <button className="weiter" onClick={weiter}>Weiter →</button>}
    </div>
  )
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

function Satzbau() {
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

export default function Lernen() {
  const [aktiv, setAktiv] = useState(null)   // null | 'wdh' | kursId
  const [stand, setStand] = useState(holeStand())
  const [stat, setStat] = useState(statistik())
  const alleWoerter = kurse.flatMap(k => k.woerter)

  function zurueck() {
    setAktiv(null)
    setStand(holeStand())
    setStat(statistik())
  }

  if (aktiv === 'satzbau') {
    return (
      <section>
        <h2>🧩 Satzbau</h2>
        <Satzbau />
        <button className="weiter" onClick={zurueck}>← Zum Kursbaum</button>
      </section>
    )
  }

  if (aktiv === 'wdh') {
    const faellig = mische(faelligeKarten()).slice(0, 15).map(k => ({ de: k.de, ku: k.ku }))
    return (
      <section>
        <h2>🔁 Wiederholen</h2>
        {faellig.length === 0 ? (
          <p>Nichts fällig — super! Komm morgen wieder oder lerne eine neue Lektion.</p>
        ) : (
          <Uebung titel="Wiederholung" woerter={faellig} alleWoerter={alleWoerter}
            fertigMelden={() => {}} />
        )}
        <button className="weiter" onClick={zurueck}>← Zum Kursbaum</button>
      </section>
    )
  }

  if (aktiv) {
    const kurs = kurse.find(k => k.id === aktiv)
    return (
      <section>
        <h2>{kurs.symbol} {kurs.name}</h2>
        <Uebung titel={kurs.name} woerter={kurs.woerter} alleWoerter={alleWoerter}
          fertigMelden={(prozent) => lektionAbgeschlossen(kurs.id, prozent)} />
        <button className="weiter" onClick={zurueck}>← Zum Kursbaum</button>
      </section>
    )
  }

  return (
    <section>
      <h2>Dein Kurs · Deutsch → Kurmancî</h2>
      <div className="statzeile">
        <span>⭐ {stat.xp} XP</span>
        <span>🔥 {stat.serie} Tage Serie</span>
        <span>📚 {stat.gelernt} Wörter gelernt</span>
        <span>✅ {stat.sicher} sicher</span>
      </div>
      {stat.faellig > 0 && (
        <button className="wdh-knopf" onClick={() => setAktiv('wdh')}>
          🔁 {stat.faellig} Wörter warten auf Wiederholung — jetzt üben!
        </button>
      )}
      <button className="wdh-knopf satzbau-knopf" onClick={() => setAktiv('satzbau')}>
        🧩 Satzbau-Training — baue echte Sätze aus Wortblöcken!
      </button>
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
      <p className="hinweis">Übungsarten wechseln automatisch: Auswählen (beide Richtungen) und Eintippen.
        Richtige Wörter kommen in dein Wiederholsystem — falsche fragt die App bald wieder ab.</p>
    </section>
  )
}
