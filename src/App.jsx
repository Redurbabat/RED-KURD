import { useEffect, useMemo, useState } from 'react'
import { woerter as startWoerter } from './data/woerter.js'

const SPRACHEN = { deu: 'Deutsch', kur: 'Kurdisch', kmr: 'Kurmancî', ckb: 'Soranî', eng: 'Englisch', tur: 'Türkisch' }
const name = (c) => SPRACHEN[c] || c

function Woerterbuch() {
  const [suche, setSuche] = useState('')
  const [ergebnis, setErgebnis] = useState(null)
  const [beispiele, setBeispiele] = useState(null)
  const [laden, setLaden] = useState(false)
  const [offline, setOffline] = useState(false)

  async function suchen(e) {
    e && e.preventDefault()
    const q = suche.trim()
    if (!q) return
    setLaden(true); setBeispiele(null)
    try {
      const r = await fetch('/api/suche?q=' + encodeURIComponent(q))
      const d = await r.json()
      setErgebnis(d); setOffline(false)
    } catch {
      setOffline(true)
      const s = q.toLowerCase()
      setErgebnis({
        woerter: startWoerter
          .filter(w => w.de.toLowerCase().includes(s) || w.ku.toLowerCase().includes(s))
          .map(w => ({ lang: 'deu', wort: w.de, ziel_lang: 'kur', uebersetzung: w.ku, quelle: 'start' })),
        wiki: [],
      })
    }
    setLaden(false)
  }

  async function zeigBeispiele(wort, lang) {
    try {
      const ziel = lang === 'deu' ? 'kur' : 'deu'
      const zielLang = (lang === 'kur' || lang === 'kmr') ? 'deu' : 'kmr'
      const quellLang = lang === 'deu' ? 'deu' : (lang === 'kur' ? 'kmr' : lang)
      const r = await fetch(`/api/beispiele?q=${encodeURIComponent(wort)}&lang=${quellLang}&ziel=${zielLang}`)
      const d = await r.json()
      setBeispiele({ wort, saetze: d.saetze || [] })
    } catch { /* Server aus */ }
  }

  return (
    <section>
      <h2>Wörterbuch</h2>
      <form onSubmit={suchen} className="suchzeile">
        <input className="suche" placeholder="Wort suchen (Deutsch, Kurmancî, …)"
          value={suche} onChange={(e) => setSuche(e.target.value)} />
        <button className="weiter" type="submit">Suchen</button>
      </form>
      <div className="tastatur">
        {['ê','î','û','ş','ç'].map(z => (
          <button key={z} type="button" className="taste" onClick={() => setSuche(suche + z)}>{z}</button>
        ))}
      </div>
      {laden && <p className="hinweis">Suche in 13,5 Millionen Sätzen…</p>}
      {offline && <p className="hinweis">⚠ Datenbank-Server läuft nicht (START-LOKAL.bat nutzen) – zeige Grundwortschatz.</p>}
      {ergebnis && !laden && (
        <>
          {ergebnis.woerter.length === 0 && ergebnis.wiki.length === 0 && (
            <p className="hinweis">Nichts gefunden für „{suche}".</p>
          )}
          {ergebnis.woerter.length > 0 && (
            <table>
              <thead><tr><th>Wort</th><th>Übersetzung</th><th>Sprachen</th><th></th></tr></thead>
              <tbody>
                {ergebnis.woerter.map((w, i) => (
                  <tr key={i}>
                    <td>{w.wort}</td>
                    <td className="ku">{w.uebersetzung}</td>
                    <td className="kat">{name(w.lang)} → {name(w.ziel_lang)}</td>
                    <td><button className="mini" onClick={() => zeigBeispiele(w.wort, w.lang)}>Sätze</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {ergebnis.wiki.length > 0 && (
            <div className="wikibox">
              <h3>Aus dem Wiktionary</h3>
              {ergebnis.wiki.map((w, i) => (
                <div key={i} className="wikieintrag">
                  <strong>{w.wort}</strong> <span className="kat">({name(w.lang)}, {w.wortart}{w.ipa ? ', ' + w.ipa : ''})</span>
                  <div>{w.bedeutungen}</div>
                  {w.formen && <div className="kat">Formen: {w.formen}</div>}
                </div>
              ))}
            </div>
          )}
          {beispiele && (
            <div className="wikibox">
              <h3>Beispielsätze mit „{beispiele.wort}"</h3>
              {beispiele.saetze.length === 0 && <p className="hinweis">Keine verknüpften Sätze gefunden.</p>}
              {beispiele.saetze.map((s, i) => (
                <div key={i} className="wikieintrag">
                  <div className="ku">{s.satz}</div>
                  <div>{s.uebersetzung}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {!ergebnis && <p className="hinweis">Tippe ein Wort und drücke „Suchen" – durchsucht 82.000 Wortpaare + 376.000 Wiktionary-Einträge + Beispielsätze aus Tatoeba.</p>}
    </section>
  )
}

function mische(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function Lektion() {
  const [fragen, setFragen] = useState(null)
  const [index, setIndex] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [antwort, setAntwort] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/vokabeln?von=deu&nach=kur&anzahl=10')
        const d = await r.json()
        if (d.vokabeln && d.vokabeln.length >= 4) {
          setFragen(d.vokabeln.map(v => ({ de: v.wort, ku: v.uebersetzung })))
          return
        }
      } catch { /* Server aus */ }
      setFragen(mische(startWoerter).slice(0, 10))
    })()
  }, [])

  if (!fragen) return <section><p className="hinweis">Lade Vokabeln…</p></section>

  const frage = fragen[index]
  const optionen = (() => {
    const falsche = mische(fragen.filter(w => w.ku !== frage.ku)).slice(0, 3)
    while (falsche.length < 3) falsche.push(mische(startWoerter)[0])
    return mische([frage, ...falsche])
  })()
  const fertig = index === fragen.length - 1 && antwort !== null

  function waehle(opt) {
    if (antwort !== null) return
    setAntwort(opt.ku)
    if (opt.ku === frage.ku) setPunkte(p => p + 1)
  }

  return (
    <section>
      <h2>Lernen · Zufalls-Vokabeln aus der Datenbank</h2>
      <p className="hinweis">Frage {index + 1} von {fragen.length} · {punkte} richtig</p>
      <div className="frage">Was heißt <strong>„{frage.de}"</strong> auf Kurdisch?</div>
      <div className="optionen">
        {optionen.map((opt, i) => {
          let cls = 'option'
          if (antwort !== null) {
            if (opt.ku === frage.ku) cls += ' richtig'
            else if (opt.ku === antwort) cls += ' falsch'
          }
          return <button key={i} className={cls} onClick={() => waehle(opt)}>{opt.ku}</button>
        })}
      </div>
      {antwort !== null && !fertig && (
        <button className="weiter" onClick={() => { setAntwort(null); setIndex(i => i + 1) }}>Weiter →</button>
      )}
      {fertig && (
        <div className="ergebnis">
          🎉 {punkte} von {fragen.length} richtig!
          <button className="weiter" onClick={() => window.location.reload()}>Neue Runde</button>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [seite, setSeite] = useState('start')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => setStatus(false))
  }, [])

  return (
    <div className="app">
      <header>
        <h1>RED-KURD</h1>
        <p className="untertitel">Kurdisch lernen – frei und offen</p>
        <nav>
          <button className={seite === 'start' ? 'aktiv' : ''} onClick={() => setSeite('start')}>Start</button>
          <button className={seite === 'woerterbuch' ? 'aktiv' : ''} onClick={() => setSeite('woerterbuch')}>Wörterbuch</button>
          <button className={seite === 'lernen' ? 'aktiv' : ''} onClick={() => setSeite('lernen')}>Lernen</button>
        </nav>
      </header>
      <main>
        {seite === 'start' && (
          <section>
            <h2>Silav! 👋</h2>
            {status && status.saetze ? (
              <p>✅ Datenbank verbunden: <strong>{status.saetze.toLocaleString('de')}</strong> Sätze
                 und <strong>{status.woerter.toLocaleString('de')}</strong> Wortpaare bereit.</p>
            ) : status === false ? (
              <p>⚠ Datenbank-Server läuft nicht. Starte die App mit <strong>START-LOKAL.bat</strong>,
                 dann stehen 13,5 Millionen Sätze bereit. (Ohne Server funktioniert der Grundwortschatz.)</p>
            ) : (
              <p className="hinweis">Prüfe Datenbank…</p>
            )}
            <ul>
              <li><strong>Wörterbuch</strong> – alle Sprachen durchsuchen, mit Beispielsätzen</li>
              <li><strong>Lernen</strong> – Vokabel-Quiz mit Wörtern aus der echten Datenbank</li>
            </ul>
            <p className="hinweis">Datenquellen: Tatoeba (CC BY), FreeDict, Wiktionary/kaikki.org</p>
          </section>
        )}
        {seite === 'woerterbuch' && <Woerterbuch />}
        {seite === 'lernen' && <Lektion />}
      </main>
      <footer>
        RED-KURD · Open Source (MIT) · Daten: Tatoeba (CC BY), FreeDict, Wiktionary ·{' '}
        <a href="https://github.com/Redurbabat/RED-KURD" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  )
}
