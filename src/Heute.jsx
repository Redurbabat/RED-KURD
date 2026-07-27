// "Heute": automatisch geplante Tagessitzung – das Herz der App
import { useState } from 'react'
import { kurse } from './data/kurse.js'
import { holeStand, faelligeKartenAlle, statistik, sessionLaden, sessionLoeschen } from './fortschritt.js'
import { Uebung, baueUebungen, mische, alleKursWoerter } from './Uebung.jsx'

const MODI = [
  { id: 'kurz', name: 'Kurz', dauer: '~5 Min', aufgaben: 8 },
  { id: 'standard', name: 'Standard', dauer: '~10 Min', aufgaben: 14 },
  { id: 'intensiv', name: 'Intensiv', dauer: '~20 Min', aufgaben: 24 },
]

function findeBild(ku) {
  const w = alleKursWoerter.find(x => x.ku === ku)
  return w ? w.bild : undefined
}

function planeSitzung(anzahl) {
  const faellig = faelligeKartenAlle()
  const stand = holeStand()
  const naechste = kurse.find(k => !(stand.lektionen[k.id] >= 80)) || kurse[0]

  // 50–65 % Wiederholungen, Rest neue Woerter aus der aktuellen Einheit
  const rueckstand = faellig.length > anzahl * 2
  const nWdh = Math.min(faellig.length, Math.ceil(anzahl * (rueckstand ? 0.8 : 0.6)))
  const wdhWoerter = mische(faellig).slice(0, nWdh)
    .map(k => ({ de: k.de, ku: k.ku, bild: findeBild(k.ku) }))
  const nNeu = Math.max(anzahl - nWdh, rueckstand ? 2 : 3)
  const neueWoerter = mische(naechste.woerter).slice(0, nNeu)

  const uebungen = mische([
    ...baueUebungen(wdhWoerter),
    ...baueUebungen(neueWoerter),
  ]).slice(0, anzahl)

  return { uebungen, nWdh: wdhWoerter.length, nNeu: neueWoerter.length,
    einheit: naechste, rueckstand, faelligGesamt: faellig.length }
}

export default function Heute({ status }) {
  const [sitzung, setSitzung] = useState(null)
  const [modus, setModus] = useState('standard')
  const [, neuZeichnen] = useState(0)

  const stat = statistik()
  const stand = holeStand()
  const gespeichert = sessionLaden()
  const stunde = new Date().getHours()
  const gruss = stunde < 11 ? 'Beyanî baş' : stunde < 18 ? 'Roj baş' : 'Êvar baş'
  const naechste = kurse.find(k => !(stand.lektionen[k.id] >= 80)) || kurse[0]
  const einheitProzent = stand.lektionen[naechste.id] || 0
  const faellig = faelligeKartenAlle().length

  if (sitzung) {
    return (
      <section>
        <h2>🦅 Deine Sitzung</h2>
        <Uebung uebungen={sitzung.uebungen} titel="Heute"
          startIndex={sitzung.startIndex} startPunkte={sitzung.startPunkte}
          fertigMelden={() => {}} />
        <button className="weiter zweitrangig" onClick={() => { setSitzung(null); neuZeichnen(x => x + 1) }}>
          ← Zurück zu Heute
        </button>
      </section>
    )
  }

  const plan = planeSitzung(MODI.find(m => m.id === modus).aufgaben)

  return (
    <section>
      <div className="heute-kopf">
        <span className="maskottchen">🦅</span>
        <div>
          <h2>{gruss}!</h2>
          <p className="hinweis">Hêlo sagt: Kurmancî · {naechste.name} · heute {MODI.find(m => m.id === modus).dauer}</p>
        </div>
      </div>

      {gespeichert && gespeichert.uebungen && gespeichert.index < gespeichert.uebungen.length && (
        <button className="heute-start fortsetzen" onClick={() => setSitzung({
          uebungen: gespeichert.uebungen, startIndex: gespeichert.index, startPunkte: gespeichert.punkte })}>
          ▶ Sitzung fortsetzen (Aufgabe {gespeichert.index + 1} von {gespeichert.uebungen.length})
        </button>
      )}

      <button className="heute-start" onClick={() => { sessionLoeschen(); setSitzung({ uebungen: plan.uebungen }) }}>
        Weiterlernen
      </button>

      <div className="heute-plan">
        <div>🔁 {plan.nWdh} Wiederholungen</div>
        <div>✨ {plan.nNeu} neue Wörter</div>
        <div>👂 Hör- und Schreibaufgaben gemischt</div>
      </div>

      {plan.rueckstand && (
        <div className="rueckstand">
          Du hast {plan.faelligGesamt} Wiederholungen offen. Heute schaffen wir die wichtigsten —
          neue Wörter sind vorübergehend reduziert.
        </div>
      )}

      <div className="richtungswahl" style={{ marginTop: '1rem' }}>
        {MODI.map(m => (
          <button key={m.id} className={modus === m.id ? 'aktiv-klein' : 'mini'}
            onClick={() => setModus(m.id)}>{m.name} · {m.dauer}</button>
        ))}
      </div>

      <div className="heute-karten">
        <div className="heute-karte">
          <h3>Dein Kurs</h3>
          <div>{naechste.symbol} Einheit: {naechste.name}</div>
          <div className="balken"><div className="balken-voll" style={{ width: einheitProzent + '%' }} /></div>
          <span className="hinweis">{einheitProzent} %</span>
        </div>
        <div className="heute-karte">
          <h3>Dein Stand</h3>
          <div>🔥 {stat.serie} Tage Serie · ⭐ {stat.xp} XP</div>
          <div>📚 {stat.gelernt} Wörter · {faellig} fällig</div>
        </div>
      </div>

      {status && status.saetze > 0 && (
        <p className="hinweis">
          {status.online ? '🌐 Online-Version' : '✅ Datenbank verbunden'}: {status.woerter.toLocaleString('de')} Wortpaare bereit.
        </p>
      )}
    </section>
  )
}
