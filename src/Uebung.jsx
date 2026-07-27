// Gemeinsame Uebungs-Engine: alle Aufgabentypen, Skill-Bewertung, Fortsetzen
import { useEffect, useState } from 'react'
import { kurse } from './data/kurse.js'
import { gibXp, karteBewertenSkill, sessionSpeichern, sessionLoeschen } from './fortschritt.js'
import { sprich } from './schrift.js'
import { spieleWort } from './audio.js'

// Fisher-Yates statt sort(random) – fair gemischt
export function mische(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const alleKursWoerter = kurse.flatMap(k => k.woerter)

const SKILL_JE_ART = {
  'wahl-de': 'erkennen', 'bild': 'erkennen',
  'wahl-ku': 'abrufen', 'tippen': 'schreiben', 'hoeren': 'hoeren',
}

// Baut Uebungen aus Woertern. arten: welche Aufgabentypen erlaubt sind
export function baueUebungen(woerter, arten) {
  const erlaubt = arten || ['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren']
  const alle = alleKursWoerter
  const uebungen = []
  let letzteArt = null, gleicheFolge = 0
  for (const w of mische(woerter)) {
    let auswahl = [...erlaubt]
    if (!w.bild) auswahl = auswahl.filter(x => x !== 'bild')
    // Nicht mehr als 3 gleiche Aufgaben hintereinander
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
    } else if (art === 'hoeren') {
      const falsche = mische(alle.filter(x => x.de !== w.de)).slice(0, 3)
      uebungen.push({ art, frage: w.ku, antwort: w.de,
        optionen: mische([w.de, ...falsche.map(x => x.de)]), w })
    } else if (art === 'wahl-de') {
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

function istRichtigGetippt(eingabe, richtig) {
  const norm = (s) => s.toLowerCase().trim()
    .replace(/ê/g, 'e').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/[.,!?']/g, '').replace(/\s+/g, ' ')
  return norm(eingabe) === norm(richtig)
}

export function Uebung({ uebungen, titel, fertigMelden, startIndex, startPunkte }) {
  const [index, setIndex] = useState(startIndex || 0)
  const [punkte, setPunkte] = useState(startPunkte || 0)
  const [antwort, setAntwort] = useState(null)
  const [eingabe, setEingabe] = useState('')

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
      <div className="ergebnis">
        <span className="maskottchen-gross">🦅</span>
        <div>
          <strong>Hêlo ist stolz auf dich!</strong><br />
          {punkte} von {uebungen.length} richtig · +{punkte * 10} XP
        </div>
      </div>
    )
  }

  function bewerten(richtig) {
    if (richtig) { setPunkte(p => p + 1); gibXp(10) }
    karteBewertenSkill(u.w.de, u.w.ku, SKILL_JE_ART[u.art] || 'erkennen', richtig)
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
      <p className="hinweis">{titel} · Aufgabe {index + 1} von {uebungen.length} · {punkte} richtig</p>

      {u.art === 'bild' && (
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
                <button key={opt.bild} className={cls} onClick={() => waehle(opt.bild)}>
                  <span className="gross-bild">{opt.bild}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {u.art === 'hoeren' && (
        <>
          <div className="frage">
            <button className="hoer-knopf" onClick={() => spieleWort(u.frage)}>🔊</button>
            {' '}Was hörst du? Wähle die Bedeutung:
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
          {antwort !== null && <div className="hinweis">Das Wort war: <strong>{u.frage}</strong></div>}
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
          {antwort !== null && (
            <div className={antwort === u.antwort ? 'richtig-text' : 'falsch-text'}>
              {antwort === u.antwort ? '✓ Richtig!' : `✗ Richtig wäre: ${u.antwort}`}
            </div>
          )}
        </>
      )}

      {(u.art === 'wahl-ku' || u.art === 'wahl-de') && (
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
