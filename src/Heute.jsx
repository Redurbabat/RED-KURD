// "Heute" im RED-KURD-Design: Plan, Weiterlernen, Rueckblick, schwierige Stelle
import { useState } from 'react'
import { kurse } from './data/kurse.js'
import { holeStand, faelligeKartenAlle, statistik, sessionLaden, sessionLoeschen, profilLaden, gesternStatistik } from './fortschritt.js'
import { Uebung, baueUebungen, mische, alleKursWoerter } from './Uebung.jsx'
import TagesZiel from './TagesZiel.jsx'

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
  return { uebungen, nWdh: Math.min(nWdh, wdhWoerter.length), nNeu: neueWoerter.length,
    einheit: naechste, rueckstand, faelligGesamt: faellig.length }
}

export default function Heute({ status }) {
  const [sitzung, setSitzung] = useState(null)
  const [modus, setModus] = useState(() => {
    const p = profilLaden()
    return p && p.minuten === '5' ? 'kurz' : p && p.minuten === '20' ? 'intensiv' : 'standard'
  })
  const [, neuZeichnen] = useState(0)

  const stand = holeStand()
  const gespeichert = sessionLaden()
  const stunde = new Date().getHours()
  const gruss = stunde < 11 ? 'Beyanî baş' : stunde < 18 ? 'Roj baş' : 'Êvar baş'
  const naechste = kurse.find(k => !(stand.lektionen[k.id] >= 80)) || kurse[0]
  const einheitNr = kurse.indexOf(naechste) + 1
  const einheitProzent = stand.lektionen[naechste.id] || 0
  const gesternS = gesternStatistik()
  const schwierige = faelligeKartenAlle().filter(k => k.stufe === 0).slice(0, 10)

  if (sitzung) {
    return (
      <section>
        <Uebung uebungen={sitzung.uebungen} titel={sitzung.titel || 'Heute'}
          startIndex={sitzung.startIndex} startPunkte={sitzung.startPunkte}
          fertigMelden={() => {}} />
        <button className="weiter zweitrangig" onClick={() => { setSitzung(null); neuZeichnen(x => x + 1) }}>
          ← Zurück zu Heute
        </button>
      </section>
    )
  }

  const plan = planeSitzung(MODI.find(m => m.id === modus).aufgaben)
  const minuten = MODI.find(m => m.id === modus).dauer

  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>{gruss}! 👋</h1>
          <p className="sprechblase">Hêlo sagt: Kurmancî lernen macht jeden Tag ein Stück reicher!</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>

      <div className="sprach-pille">🌐 Kurmancî · Grundlagen</div>

      {gespeichert && gespeichert.uebungen && gespeichert.index < gespeichert.uebungen.length && (
        <button className="heute-start fortsetzen" onClick={() => setSitzung({
          uebungen: gespeichert.uebungen, startIndex: gespeichert.index,
          startPunkte: gespeichert.punkte, titel: gespeichert.titel })}>
          <span style={{ flex: 1, textAlign: 'left' }}>▶ Sitzung fortsetzen<br />
            <small style={{ fontWeight: 600 }}>{gespeichert.titel || 'Heute'} · Aufgabe {gespeichert.index + 1} von {gespeichert.uebungen.length}</small></span>
          <span className="fortsetzen-prozent">{Math.round((gespeichert.index / gespeichert.uebungen.length) * 100)} %</span>
        </button>
      )}

      <button className="heute-start gruen-start" onClick={() => { sessionLoeschen(); setSitzung({ uebungen: plan.uebungen }) }}>
        📖 Weiterlernen — deine gemischte Sitzung
      </button>

      <div className="karte">
        <div className="karte-titel">📋 Dein Plan für heute</div>
        <div className="plan-spalten">
          <div className="plan-spalte"><span className="plan-icon">🔁</span><strong>{plan.nWdh}</strong><small>Wiederholungen</small></div>
          <div className="plan-spalte"><span className="plan-icon">📖</span><strong>{plan.nNeu}</strong><small>neue Wörter</small></div>
          <div className="plan-spalte"><span className="plan-icon">🎧</span><strong>~2</strong><small>Hörübungen</small></div>
          <div className="plan-spalte"><span className="plan-icon">✍️</span><strong>~2</strong><small>Schreiben</small></div>
        </div>
        <div className="hinweis" style={{ textAlign: 'center' }}>🕐 ca. {minuten.replace('~', '')}</div>
        <div className="richtungswahl" style={{ justifyContent: 'center' }}>
          {MODI.map(m => (
            <button key={m.id} className={modus === m.id ? 'aktiv-klein' : 'mini'}
              onClick={() => setModus(m.id)}>{m.name}</button>
          ))}
        </div>
      </div>

      {plan.rueckstand && (
        <div className="rueckstand">
          Du hast {plan.faelligGesamt} Wiederholungen offen — heute schaffen wir die wichtigsten.
          Neue Wörter sind vorübergehend reduziert.
        </div>
      )}

      <div className="karte">
        <div className="karte-titel">📗 Aktueller Kurs</div>
        <div className="kurs-zeile-heute">
          <span className="einheit-bild">{naechste.symbol}</span>
          <div style={{ flex: 1 }}>
            <strong>Einheit {einheitNr}: {naechste.name}</strong>
            <div className="balken"><div className="balken-voll" style={{ width: einheitProzent + '%' }} /></div>
          </div>
          <span className="prozent">{einheitProzent} %</span>
        </div>
      </div>

      {schwierige.length > 0 && (
        <div className="karte warm">
          <div className="karte-titel">🧠 Schwierige Stelle</div>
          <div className="kurs-zeile-heute">
            <div style={{ flex: 1 }}>{schwierige.length} Wörter brauchen Übung
              <div className="hinweis">z.B. {schwierige.slice(0, 3).map(k => k.ku).join(', ')}</div>
            </div>
            <button className="mini orange" onClick={() => {
              const woerter = schwierige.map(k => ({ de: k.de, ku: k.ku, bild: findeBild(k.ku) }))
              setSitzung({ uebungen: baueUebungen(woerter), titel: 'Schwierige Wörter' })
            }}>3 Minuten üben</button>
          </div>
        </div>
      )}

      {gesternS && (
        <div className="karte">
          <div className="karte-titel">✅ Dein Rückblick von gestern</div>
          <div>{gesternS.aufgaben} Aufgaben · {Math.round((gesternS.richtig / Math.max(1, gesternS.aufgaben)) * 100)} % richtig</div>
          <div className="hinweis">Weiter so! Jede Übung bringt dich weiter.</div>
        </div>
      )}

      <TagesZiel />

      {status && status.saetze > 0 && (
        <p className="hinweis">
          {status.online ? '🌐 Online-Version' : '✅ Datenbank verbunden'}: {status.woerter.toLocaleString('de')} Wortpaare bereit.
        </p>
      )}
    </section>
  )
}
