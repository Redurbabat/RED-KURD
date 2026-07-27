// Ueben im RED-KURD-Design: farbige Kacheln, Empfehlung, schwierige Woerter
import { useState } from 'react'
import { faelligeKartenAlle, fertigkeiten } from './fortschritt.js'
import { Uebung, baueUebungen, mische, alleKursWoerter } from './Uebung.jsx'
import { spieleWort } from './audio.js'
import Satzbau from './Satzbau.jsx'
import Aussprache from './Aussprache.jsx'

const MODI = [
  { id: 'wdh', symbol: '📇', farbe: 'gruen', name: 'Karteikarten', text: 'Wiederholen & merken' },
  { id: 'hoeren', symbol: '🎧', farbe: 'lila', name: 'Hören', text: 'Wörter und Sätze verstehen' },
  { id: 'aussprache', symbol: '🎙️', farbe: 'orange', name: 'Sprechen', text: 'Nachsprechen & aufnehmen' },
  { id: 'schreiben', symbol: '✍️', farbe: 'teal', name: 'Schreiben', text: 'Tippen und Diktat' },
  { id: 'bilder', symbol: '🖼️', farbe: 'gruen', name: 'Bilder', text: 'Foto-Vokabeln' },
  { id: 'satzbau', symbol: '🧩', farbe: 'orange', name: 'Satzbau', text: 'Sätze aus Blöcken bauen' },
]

export default function Ueben() {
  const [aktiv, setAktiv] = useState(null)
  const faellig = faelligeKartenAlle()
  const f = fertigkeiten()
  const schwaechste = ['hoeren', 'schreiben', 'abrufen', 'erkennen']
    .filter(s => f[s + 'Anzahl'] > 0)
    .sort((a, b) => f[a] - f[b])[0]
  const schwierige = mische(faellig.filter(k => k.stufe === 0)).slice(0, 3)

  function findeBild(ku) {
    const w = alleKursWoerter.find(x => x.ku === ku)
    return w ? w.bild : undefined
  }

  if (aktiv === 'aussprache') {
    return (
      <section>
        <h1>🎙️ Sprechen</h1>
        <Aussprache />
        <button className="weiter zweitrangig" onClick={() => setAktiv(null)}>← Zum Üben</button>
      </section>
    )
  }
  if (aktiv === 'satzbau') {
    return (
      <section>
        <h1>🧩 Satzbau</h1>
        <Satzbau />
        <button className="weiter zweitrangig" onClick={() => setAktiv(null)}>← Zum Üben</button>
      </section>
    )
  }
  if (aktiv) {
    const modus = MODI.find(m => m.id === aktiv)
    let woerter, arten
    if (aktiv === 'wdh') {
      woerter = mische(faellig).slice(0, 15).map(k => ({ de: k.de, ku: k.ku, bild: findeBild(k.ku) }))
      arten = undefined
    } else {
      woerter = mische(alleKursWoerter).slice(0, 12)
      arten = aktiv === 'bilder' ? ['bild'] : aktiv === 'hoeren' ? ['hoeren'] : ['tippen']
    }
    const uebungen = baueUebungen(woerter, arten)
    return (
      <section>
        <h1>{modus.symbol} {modus.name}</h1>
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
      <div className="seiten-kopf">
        <div>
          <h1>Üben</h1>
          <p className="untertitel-neu">Trainiere gezielt deine Fähigkeiten</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>

      <div className="ueben-kacheln">
        {MODI.map(m => (
          <button key={m.id} className="ueben-kachel" onClick={() => setAktiv(m.id)}>
            <span className={'icon-chip ' + m.farbe}>{m.symbol}</span>
            <strong>{m.name}</strong>
            <span className="hinweis">{m.text}</span>
            {m.id === 'wdh' && faellig.length > 0 && <span className="abzeichen">{faellig.length}</span>}
            <span className="pfeil">›</span>
          </button>
        ))}
      </div>

      {schwaechste && (
        <div className="karte warm">
          <div className="karte-titel orange-text">⭐ Empfohlen für dich</div>
          <div className="kurs-zeile-heute">
            <div style={{ flex: 1 }}>
              <strong>{schwaechste === 'hoeren' ? 'Hören' : schwaechste === 'schreiben' ? 'Schreiben' : schwaechste === 'abrufen' ? 'Karteikarten' : 'Karteikarten'}</strong>
              <div className="hinweis">Deine schwächste Fertigkeit ({f[schwaechste]} %) — eine kurze Übung stärkt sie.</div>
            </div>
            <button className="mini orange" onClick={() =>
              setAktiv(schwaechste === 'hoeren' ? 'hoeren' : schwaechste === 'schreiben' ? 'schreiben' : 'wdh')
            }>Jetzt starten</button>
          </div>
        </div>
      )}

      {schwierige.length > 0 && (
        <div className="karte">
          <div className="karte-titel">🧠 Schwierige Wörter</div>
          <div className="tastatur">
            {schwierige.map(k => (
              <button key={k.ku} className="taste wort-chip" onClick={() => spieleWort(k.ku)}>
                {k.ku} 🔊
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
