import { useEffect, useMemo, useState } from 'react'
import { woerter as startWoerter } from './data/woerter.js'
import Lernen from './Lernen.jsx'
import Lesen from './Lesen.jsx'
import Werkzeuge from './Werkzeuge.jsx'
import { sucheStatisch, beispieleStatisch, statischeAnzahl } from './statisch.js'
import { statistik } from './fortschritt.js'

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
      try {
        setErgebnis(await sucheStatisch(q))
        setOffline(false)
      } catch {
        setOffline(true)
        const s = q.toLowerCase()
        setErgebnis({
          woerter: startWoerter
            .filter(w => w.de.toLowerCase().includes(s) || w.ku.toLowerCase().includes(s))
            .map(w => ({ lang: 'deu', wort: w.de, ziel_lang: 'kur', uebersetzung: w.ku, quelle: 'start' })),
          wiki: [], formen: [],
        })
      }
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
    } catch {
      try { setBeispiele({ wort, saetze: await beispieleStatisch(wort) }) } catch { /* keine Daten */ }
    }
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

function Statistik() {
  const s = statistik()
  const geschafft = Object.values(s.lektionen).filter(p => p >= 80).length
  return (
    <section>
      <h2>Deine Statistik</h2>
      <div className="statgitter">
        <div className="statkarte"><div className="statzahl">{s.xp}</div><div>XP gesammelt</div></div>
        <div className="statkarte"><div className="statzahl">{s.serie}</div><div>Tage Serie 🔥</div></div>
        <div className="statkarte"><div className="statzahl">{s.gelernt}</div><div>Wörter gelernt</div></div>
        <div className="statkarte"><div className="statzahl">{s.sicher}</div><div>Wörter sicher</div></div>
        <div className="statkarte"><div className="statzahl">{s.faellig}</div><div>zum Wiederholen</div></div>
        <div className="statkarte"><div className="statzahl">{geschafft}/10</div><div>Lektionen geschafft</div></div>
      </div>
      <p className="hinweis">Dein Lernstand wird in diesem Browser gespeichert.</p>
    </section>
  )
}

export default function App() {
  const [seite, setSeite] = useState('start')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() =>
      statischeAnzahl().then(a => setStatus({ saetze: a.beispiele, woerter: a.woerter, online: true })).catch(() => setStatus(false))
    )
  }, [])

  return (
    <div className="app">
      <header>
        <h1><img src="/icon-192.png" alt="" className="logo" /> RED-KURD</h1>
        <p className="untertitel">Kurdisch lernen – frei und offen</p>
        <nav>
          <button className={seite === 'start' ? 'aktiv' : ''} onClick={() => setSeite('start')}>🏠 Start</button>
          <button className={seite === 'woerterbuch' ? 'aktiv' : ''} onClick={() => setSeite('woerterbuch')}>📕 Wörterbuch</button>
          <button className={seite === 'lernen' ? 'aktiv' : ''} onClick={() => setSeite('lernen')}>🎓 Lernen</button>
          <button className={seite === 'lesen' ? 'aktiv' : ''} onClick={() => setSeite('lesen')}>📖 Lesen</button>
          <button className={seite === 'werkzeuge' ? 'aktiv' : ''} onClick={() => setSeite('werkzeuge')}>🔤 Schrift</button>
          <button className={seite === 'statistik' ? 'aktiv' : ''} onClick={() => setSeite('statistik')}>📊 Statistik</button>
        </nav>
      </header>
      <main>
        {seite === 'start' && (
          <section>
            <h2>Silav! 👋</h2>
            {status && status.saetze ? (
              <p>✅ Datenbank verbunden: <strong>{status.saetze.toLocaleString('de')}</strong> Sätze
                 und <strong>{status.woerter.toLocaleString('de')}</strong> Wortpaare bereit.</p>
            ) : status && status.online ? (
              <p>🌐 Online-Version: <strong>{status.woerter.toLocaleString('de')}</strong> Wortpaare
                 und <strong>{status.saetze.toLocaleString('de')}</strong> kurdische Beispielsätze geladen.</p>
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
        {seite === 'lernen' && <Lernen />}
        {seite === 'lesen' && <Lesen />}
        {seite === 'werkzeuge' && <Werkzeuge />}
        {seite === 'statistik' && <Statistik />}
      </main>
      <footer>
        RED-KURD · Open Source (MIT) · Daten: Tatoeba (CC BY), FreeDict, Wiktionary ·{' '}
        <a href="https://github.com/Redurbabat/RED-KURD" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  )
}
