import { useEffect, useState } from 'react'
import { merkeWort } from './fortschritt.js'
import { sprich } from './schrift.js'
import { spieleWort } from './audio.js'
import { zufallsPaare, sucheStatisch } from './statisch.js'
import { texte } from './data/texte.js'
import { gibXp } from './fortschritt.js'

async function holePaare() {
  try {
    const r = await fetch('/api/satzpaare?anzahl=15')
    const d = await r.json()
    if (d.paare && d.paare.length) return d.paare
  } catch { /* Server aus */ }
  return zufallsPaare(15)
}

async function schlagNach(wort) {
  try {
    const r = await fetch('/api/suche?q=' + encodeURIComponent(wort))
    const d = await r.json()
    if ((d.woerter || []).length || (d.wiki || []).length) return d
  } catch { /* Server aus */ }
  try { return await sucheStatisch(wort) } catch { return { woerter: [], wiki: [] } }
}

function Satz({ paar }) {
  const [zeigeUeb, setZeigeUeb] = useState(false)
  const [popup, setPopup] = useState(null)
  const [gemerkt, setGemerkt] = useState(false)

  const teile = paar.satz.split(/([^\s.,!?;:"«»()„“”…-]+)/g)

  async function klickWort(wort) {
    setGemerkt(false)
    setPopup({ wort, laden: true })
    const d = await schlagNach(wort.toLowerCase())
    const treffer = (d.woerter || []).filter(w => w.lang === 'kmr' || w.lang === 'kur' || w.lang === 'ckb')
    const erklaerungen = (d.wiki || []).slice(0, 2)
    setPopup({ wort, treffer: treffer.slice(0, 4), erklaerungen })
  }

  function merken() {
    const ueb = popup.treffer && popup.treffer[0] ? popup.treffer[0].uebersetzung : paar.uebersetzung
    merkeWort(ueb, popup.wort)
    setGemerkt(true)
  }

  return (
    <div className="satzkarte">
      <div className="satz-ku">
        {teile.map((t, i) =>
          /^[^\s.,!?;:"«»()„“”…-]+$/.test(t) ? (
            <span key={i} className="klickwort" onClick={() => klickWort(t)}>{t}</span>
          ) : (
            <span key={i}>{t}</span>
          )
        )}
        <button className="mini ton" title="Vorlesen" onClick={() => sprich(paar.satz)}>🔊</button>
      </div>
      {popup && (
        <div className="popup">
          <strong>{popup.wort}</strong>{' '}
          <button className="mini ton" onClick={() => spieleWort(popup.wort)}>🔊</button>
          {popup.laden && <span className="hinweis"> suche…</span>}
          {popup.treffer && popup.treffer.length === 0 && (!popup.erklaerungen || !popup.erklaerungen.length) && (
            <div className="hinweis">Nichts gefunden (vielleicht eine gebeugte Form).</div>
          )}
          {popup.treffer && popup.treffer.map((t, i) => (
            <div key={i}>→ {t.uebersetzung} <span className="kat">({t.ziel_lang})</span></div>
          ))}
          {popup.erklaerungen && popup.erklaerungen.map((e, i) => (
            <div key={'e' + i} className="hinweis">{e.bedeutungen}</div>
          ))}
          {!popup.laden && (
            <div className="popup-knoepfe">
              <button className="mini" onClick={merken} disabled={gemerkt}>
                {gemerkt ? '✓ gemerkt' : '+ Zum Lernen merken'}
              </button>
              <button className="mini" onClick={() => setPopup(null)}>Schließen</button>
            </div>
          )}
        </div>
      )}
      <div>
        <button className="mini" onClick={() => setZeigeUeb(!zeigeUeb)}>
          {zeigeUeb ? 'Übersetzung verbergen' : 'Übersetzung zeigen'}
        </button>
        {zeigeUeb && <div className="satz-de">{paar.uebersetzung}</div>}
      </div>
    </div>
  )
}

function LeseText({ text, zurueck }) {
  const [zeigeUeb, setZeigeUeb] = useState(false)
  const [antworten, setAntworten] = useState({})

  const woerter = text.text.split(' ').length

  return (
    <div>
      <h3>{text.titel} <span className="kat">· {text.niveau} · {text.thema} · {woerter} Wörter</span></h3>
      <div className="lesetext">
        <Satz paar={{ satz: text.text, uebersetzung: text.uebersetzung }} />
      </div>
      <button className="mini" onClick={() => setZeigeUeb(!zeigeUeb)}>
        {zeigeUeb ? 'Übersetzung verbergen' : 'Ganze Übersetzung zeigen'}
      </button>
      {zeigeUeb && <p className="satz-de">{text.uebersetzung}</p>}

      <h3 style={{ marginTop: '1.2rem' }}>Hast du verstanden?</h3>
      {text.fragen.map((f, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <div className="frage" style={{ fontSize: '1.05rem' }}>{f.frage}</div>
          <div className="optionen">
            {f.optionen.map(opt => {
              let cls = 'option'
              if (antworten[i] !== undefined) {
                if (opt === f.antwort) cls += ' richtig'
                else if (opt === antworten[i]) cls += ' falsch'
              }
              return (
                <button key={opt} className={cls} onClick={() => {
                  if (antworten[i] !== undefined) return
                  setAntworten(a => ({ ...a, [i]: opt }))
                  if (opt === f.antwort) gibXp(10)
                }}>{opt}</button>
              )
            })}
          </div>
        </div>
      ))}
      <button className="weiter zweitrangig" onClick={zurueck}>← Zu den Texten</button>
    </div>
  )
}

export default function Lesen() {
  const [modus, setModus] = useState('texte')
  const [paare, setPaare] = useState(null)
  const [textId, setTextId] = useState(null)

  useEffect(() => { holePaare().then(setPaare) }, [])

  if (modus === 'texte') {
    const text = texte.find(t => t.id === textId)
    return (
      <section>
        <h2>📖 Lesen</h2>
        <div className="richtungswahl">
          <button className="aktiv-klein" onClick={() => setModus('texte')}>📚 Kurze Texte</button>
          <button className="mini" onClick={() => setModus('saetze')}>💬 Tatoeba-Sätze</button>
        </div>
        {text ? (
          <LeseText text={text} zurueck={() => setTextId(null)} />
        ) : (
          <>
            <p className="hinweis">Kuratierte Texte nach Niveau — tippe Wörter an, um sie nachzuschlagen und zu merken.</p>
            <div className="ueben-kacheln">
              {texte.map(t => (
                <button key={t.id} className="ueben-kachel" onClick={() => setTextId(t.id)}>
                  <span className={'niveau niveau-' + t.niveau}>{t.niveau}</span>
                  <strong>{t.titel}</strong>
                  <span className="hinweis">{t.thema} · {t.text.split(' ').length} Wörter · {t.fragen.length} Fragen</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    )
  }

  return (
    <section>
      <h2>📖 Lesen · Kurmancî-Sätze aus Tatoeba</h2>
      <div className="richtungswahl">
        <button className="mini" onClick={() => setModus('texte')}>📚 Kurze Texte</button>
        <button className="aktiv-klein" onClick={() => setModus('saetze')}>💬 Tatoeba-Sätze</button>
      </div>
      <p className="hinweis">
        Klicke auf ein Wort, um die Übersetzung zu sehen und es in dein
        Wiederholsystem zu übernehmen. 🔊 liest vor (beste verfügbare Stimme).
      </p>
      {!paare && <p className="hinweis">Lade Sätze…</p>}
      {paare && paare.map((p, i) => <Satz key={i} paar={p} />)}
      {paare && (
        <button className="weiter" onClick={() => { setPaare(null); holePaare().then(setPaare) }}>
          Neue Sätze laden
        </button>
      )}
    </section>
  )
}
