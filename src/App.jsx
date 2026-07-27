import { useMemo, useState } from 'react'
import { woerter } from './data/woerter.js'

function Woerterbuch() {
  const [suche, setSuche] = useState('')
  const treffer = useMemo(() => {
    const s = suche.trim().toLowerCase()
    if (!s) return woerter
    return woerter.filter(
      (w) => w.de.toLowerCase().includes(s) || w.ku.toLowerCase().includes(s)
    )
  }, [suche])

  return (
    <section>
      <h2>Wörterbuch</h2>
      <input
        className="suche"
        placeholder="Deutsch oder Kurmancî suchen…"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
      />
      <p className="hinweis">{treffer.length} von {woerter.length} Einträgen</p>
      <table>
        <thead>
          <tr><th>Deutsch</th><th>Kurmancî</th><th>Kategorie</th></tr>
        </thead>
        <tbody>
          {treffer.map((w) => (
            <tr key={w.de + w.ku}>
              <td>{w.de}</td>
              <td className="ku">{w.ku}</td>
              <td className="kat">{w.kat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function mische(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function Lektion() {
  const [fragen] = useState(() => mische(woerter).slice(0, 10))
  const [index, setIndex] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [antwort, setAntwort] = useState(null)

  const frage = fragen[index]
  const optionen = useMemo(() => {
    if (!frage) return []
    const falsche = mische(woerter.filter((w) => w.ku !== frage.ku)).slice(0, 3)
    return mische([frage, ...falsche])
  }, [frage])

  if (!frage) return null
  if (index >= fragen.length) return null

  const fertig = index === fragen.length - 1 && antwort !== null

  function waehle(opt) {
    if (antwort !== null) return
    setAntwort(opt.ku)
    if (opt.ku === frage.ku) setPunkte((p) => p + 1)
  }

  function weiter() {
    setAntwort(null)
    setIndex((i) => i + 1)
  }

  return (
    <section>
      <h2>Lektion 1 · Grundwortschatz</h2>
      <p className="hinweis">Frage {index + 1} von {fragen.length} · {punkte} richtig</p>
      <div className="frage">Was heißt <strong>„{frage.de}"</strong> auf Kurmancî?</div>
      <div className="optionen">
        {optionen.map((opt) => {
          let cls = 'option'
          if (antwort !== null) {
            if (opt.ku === frage.ku) cls += ' richtig'
            else if (opt.ku === antwort) cls += ' falsch'
          }
          return (
            <button key={opt.ku} className={cls} onClick={() => waehle(opt)}>
              {opt.ku}
            </button>
          )
        })}
      </div>
      {antwort !== null && !fertig && (
        <button className="weiter" onClick={weiter}>Weiter →</button>
      )}
      {fertig && (
        <div className="ergebnis">
          🎉 Geschafft! {punkte} von {fragen.length} richtig.
          <button className="weiter" onClick={() => window.location.reload()}>
            Nochmal üben
          </button>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [seite, setSeite] = useState('start')
  return (
    <div className="app">
      <header>
        <h1>BABAT Lernen</h1>
        <p className="untertitel">Kurdisch (Kurmancî) lernen – frei und offen</p>
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
            <p>
              Das ist der Anfang deiner Lernapp. Sie startet mit
              <strong> Deutsch–Kurmancî</strong> und wächst Schritt für Schritt:
              mehr Wörter, Beispielsätze aus Tatoeba, weitere Sprachen.
            </p>
            <ul>
              <li><strong>Wörterbuch</strong> – Wörter in beide Richtungen suchen</li>
              <li><strong>Lernen</strong> – Lektion 1 mit 10 Quiz-Fragen</li>
            </ul>
            <p className="hinweis">
              Nächster Schritt: die große Datenbank (Supabase) mit allen
              Wörtern und Sätzen aus Tatoeba, FreeDict und Wiktionary anschließen.
            </p>
          </section>
        )}
        {seite === 'woerterbuch' && <Woerterbuch />}
        {seite === 'lernen' && <Lektion />}
      </main>
      <footer>
        BABAT Lernen · Open Source ·{' '}
        <a href="https://github.com/Redurbabat" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </div>
  )
}
