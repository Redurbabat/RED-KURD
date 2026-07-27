// Gemeinsame Uebungs-Engine im RED-KURD-Design: A/B/C/D-Karten, Herzen, Helo-Feedback
import { useEffect, useState } from 'react'
import { kurse } from './data/kurse.js'
import { gibXp, karteBewertenSkill, sessionSpeichern, sessionLoeschen, zaehleAufgabe, istRichtigGetippt } from './fortschritt.js'
import { sprich } from './schrift.js'
import { spieleWort } from './audio.js'

export function mische(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const alleKursWoerter = kurse.flatMap(k => k.woerter)
const DE_VON_KU = new Map(alleKursWoerter.map(w => [w.ku, w.de]))
const KU_VON_DE = new Map(alleKursWoerter.map(w => [w.de, w.ku]))
const BUCHSTABEN = ['A', 'B', 'C', 'D']

const SKILL_JE_ART = {
  'wahl-de': 'erkennen', 'bild': 'erkennen',
  'wahl-ku': 'abrufen', 'tippen': 'schreiben', 'hoeren': 'hoeren',
}

export function baueUebungen(woerter, arten) {
  const erlaubt = arten || ['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren']
  const alle = alleKursWoerter
  const uebungen = []
  let letzteArt = null, gleicheFolge = 0
  for (const w of mische(woerter)) {
    let auswahl = [...erlaubt]
    if (!w.bild) auswahl = auswahl.filter(x => x !== 'bild')
    if (gleicheFolge >= 2 && auswahl.length > 1) auswahl = auswahl.filter(x => x !== letzteArt)
    const art = mische(auswahl)[0]
    gleicheFolge = art === letzteArt ? gleicheFolge + 1 : 0
    letzteArt = art
    if (art === 'bild') {
      const falsche = []
      const gesehen = new Set([w.bild])
      for (const x of mische(alle)) {
        if (x.bild && !gesehen.has(x.bild) && x.ku !== w.ku) {
          falsche.push(x); gesehen.add(x.bild)
          if (falsche.length === 3) break
        }
      }
      if (falsche.length < 3) continue
      uebungen.push({ art, frage: w.ku, antwort: w.bild,
        optionen: mische([w, ...falsche]).map(x => ({ bild: x.bild, ku: x.ku })), w })
    } else if (art === 'hoeren' || art === 'wahl-de') {
      const falsche = mische(alle.filter(x => x.de !== w.de)).slice(0, 3)
      uebungen.push({ art, frage: w.ku, antwort: w.de,
        optionen: mische([w.de, ...falsche.map(x => x.de)]), w })
    } else if (art === 'tippen') {
      uebungen.push({ art, frage: w.de, antwort: w.ku, w })
    } else {
      const falsche = mische(alle.filter(x => x.ku !== w.ku)).slice(0, 3)
      uebungen.push({ art, frage: w.de, antwort: w.ku,
        optionen: mische([w.ku, ...falsche.map(x => x.ku)]), w })
    }
  }
  return uebungen
}

export function Uebung({ uebungen, titel, fertigMelden, startIndex, startPunkte }) {
  const [index, setIndex] = useState(startIndex || 0)
  const [punkte, setPunkte] = useState(startPunkte || 0)
  const [antwort, setAntwort] = useState(null)
  const [eingabe, setEingabe] = useState('')
  const [leben, setLeben] = useState(3)

  const u = uebungen[index]
  const fertig = index >= uebungen.length

  useEffect(() => {
    if (fertig) {
      sessionLoeschen()
      fertigMelden && fertigMelden(Math.round((punkte / uebungen.length) * 100))
    } else {
      sessionSpeichern({ titel, index, punkte,
        uebungen: uebungen.map(x => ({ ...x, w: { de: x.w.de, ku: x.w.ku, bild: x.w.bild } })) })
    }
  }, [index, fertig])

  useEffect(() => {
    if (u && u.art === 'hoeren' && antwort === null) spieleWort(u.frage)
  }, [index])

  if (fertig) {
    return (
      <div className="feedback gut ergebnis-feld">
        <img src="/bilder/helo-daumen.png" alt="" className="helo-mini" />
        <div>
          <strong>Hêlo ist stolz auf dich!</strong><br />
          {punkte} von {uebungen.length} richtig · +{punkte * 10} XP
        </div>
      </div>
    )
  }

  const richtigGewaehlt = antwort !== null && antwort === u.antwort

  function bewerten(richtig) {
    if (richtig) { setPunkte(p => p + 1); gibXp(10) }
    else setLeben(l => Math.max(0, l - 1))
    karteBewertenSkill(u.w.de, u.w.ku, SKILL_JE_ART[u.art] || 'erkennen', richtig)
    zaehleAufgabe(richtig)
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

  function untertitel(opt) {
    return DE_VON_KU.get(opt) || KU_VON_DE.get(opt) || ''
  }

  return (
    <div>
      <div className="uebung-kopf">
        <div className="balken"><div className="balken-voll" style={{ width: `${(index / uebungen.length) * 100}%` }} /></div>
        <span className="herzen">{'❤️'.repeat(leben)}{'🤍'.repeat(3 - leben)}</span>
      </div>
      <p className="hinweis">{titel} · Aufgabe {index + 1} von {uebungen.length}</p>

      {u.art === 'bild' && (
        <>
          <div className="frage">Welches Bild passt zu <strong>„{u.frage}"</strong>?</div>
          <button className="hoer-pille" onClick={() => spieleWort(u.frage)}>▶ Aussprache anhören</button>
          <div className="optionen bild-optionen">
            {u.optionen.map(opt => {
              let cls = 'option bild-option'
              if (antwort !== null) {
                if (opt.bild === u.antwort) cls += ' richtig'
                else if (opt.bild === antwort) cls += ' falsch'
              }
              return (
                <button key={opt.bild} className={cls} onClick={() => waehle(opt.bild)}>
                  <span className="gross-bild">{opt.bild}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {(u.art === 'hoeren' || u.art === 'wahl-de' || u.art === 'wahl-ku') && (
        <>
          {u.art === 'hoeren' ? (
            <>
              <div className="frage">Was hörst du?</div>
              <button className="hoer-pille" onClick={() => spieleWort(u.frage)}>▶ Aussprache anhören</button>
            </>
          ) : (
            <>
              <div className="frage">
                {u.w.bild && <span className="frage-bild">{u.w.bild}</span>}
                Wie sagt man <strong>„{u.frage}"</strong>?
              </div>
              {u.art === 'wahl-de' && (
                <button className="hoer-pille" onClick={() => spieleWort(u.w.ku)}>▶ Aussprache anhören</button>
              )}
            </>
          )}
          <div className="optionen liste">
            {u.optionen.map((opt, i) => {
              let cls = 'option antwort-karte'
              if (antwort !== null) {
                if (opt === u.antwort) cls += ' richtig'
                else if (opt === antwort) cls += ' falsch'
              }
              return (
                <button key={opt} className={cls} onClick={() => waehle(opt)}>
                  <span className="buchstabe">{BUCHSTABEN[i]}</span>
                  <span className="antwort-text">
                    <strong>{opt}</strong>
                    {untertitel(opt) && <small>{untertitel(opt)}</small>}
                  </span>
                  {antwort !== null && opt === u.antwort && <span className="haken-klein">✓</span>}
                </button>
              )
            })}
          </div>
          {u.art === 'hoeren' && antwort !== null && (
            <p className="hinweis">Das Wort war: <strong>{u.frage}</strong></p>
          )}
        </>
      )}

      {u.art === 'tippen' && (
        <>
          <div className="frage">
            {u.w.bild && <span className="frage-bild">{u.w.bild}</span>}
            Tippe auf Kurmancî: <strong>„{u.frage}"</strong>
          </div>
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
        </>
      )}

      {antwort !== null && (
        <div className={'feedback ' + (richtigGewaehlt ? 'gut' : 'schlecht')}>
          {richtigGewaehlt ? (
            <>
              <img src="/bilder/helo-daumen.png" alt="" className="helo-mini" />
              <div><strong>Super!</strong> Das ist richtig.</div>
            </>
          ) : (
            <div><strong>Fast!</strong> Richtig wäre: <strong>{u.antwort}</strong>
              {u.art === 'tippen' ? '' : ` (${untertitel(u.antwort)})`}</div>
          )}
        </div>
      )}

      {antwort !== null && (
        <button className="weiter breit" onClick={weiter}>Weiter zur nächsten Aufgabe ›</button>
      )}

      <p className="tipp-zeile">💡 <strong>Tipp:</strong> Höre dir die Aussprache an und sprich mit!{' '}
        <button className="ton" onClick={() => spieleWort(u.w.ku)}>🔊</button></p>
    </div>
  )
}
