// Lesen: kuratierte Kurztexte und echte Tatoeba-Sätze.
// Jedes Wort ist anklickbar — Nachschlagen, Anhören und Merken in einem Panel.
import { useEffect, useMemo, useState } from 'react'
import { useLernstand } from '../../core/store.js'
import { gibXp, merkeWort, holeFortschritt } from '../../core/progress/progressStore.js'
import { spieleWort } from '../../core/audio/audioService.js'
import { sprich } from '../../core/schrift/transliteration.ts'
import { sucheStatisch, zufallsPaare } from '../../core/data/staticData.js'
import { ALLE_WOERTER } from '../../core/courses/courseRepository.js'
import { woerter as grundwortschatz } from '../../data/woerter.js'
import { texte } from '../../data/texte.js'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import Badge from '../../components/common/Badge.jsx'
import PrimaryButton, { IconButton } from '../../components/common/PrimaryButton.jsx'
import { LoadingState, ErrorState } from '../../components/common/EmptyState.jsx'
import './ReadingView.css'

// Wörter trennen, Satzzeichen und Leerraum aber behalten (split mit Fanggruppe).
const WORT_MUSTER = /([^\s.,!?;:"«»()„“”…-]+)/g
const IST_WORT = /^[^\s.,!?;:"«»()„“”…-]+$/
const KURDISCH = new Set(['kur', 'kmr', 'ckb', 'zza'])

/** Kursvokabular + Grundwortschatz als Nachschlagewerk, das offline funktioniert. */
const WORTBUCH = new Map()
for (const w of [...ALLE_WOERTER, ...grundwortschatz]) {
  const k = (w.ku || '').toLowerCase()
  if (k && !WORTBUCH.has(k)) WORTBUCH.set(k, { de: w.de, ku: w.ku })
}

/** Text in gut lesbare Absätze zu je drei Sätzen teilen. */
function absaetze(text) {
  const saetze = text.match(/[^.!?]+[.!?]*/g) || [text]
  const gruppen = []
  for (let i = 0; i < saetze.length; i += 3) {
    const teil = saetze.slice(i, i + 3).join(' ').trim()
    if (teil) gruppen.push(teil)
  }
  return gruppen.length > 0 ? gruppen : [text]
}

function wortzahl(text) {
  return text.trim().split(/\s+/).length
}

/** Alle gemerkten Kurmancî-Wörter als Menge (der Kartenschlüssel ist "de|ku|skill"). */
function gemerkteWoerter() {
  const karten = holeFortschritt().karten || {}
  return new Set(Object.keys(karten).map((k) => (k.split('|')[1] || '').toLowerCase()))
}

/** Ein Wort nachschlagen: Server, statische Daten, sonst das lokale Wortbuch. */
async function nachschlagen(wort) {
  const s = wort.toLowerCase()
  const treffer = []
  const lokal = WORTBUCH.get(s)
  if (lokal) treffer.push({ de: lokal.de, quelle: 'Kurswortschatz' })

  let daten = null
  try {
    const r = await fetch('/api/suche?q=' + encodeURIComponent(wort))
    if (r.ok) {
      const d = await r.json()
      if (!d.fehler) daten = d
    }
  } catch {
    /* Lokaler Server laeuft nicht. */
  }
  if (!daten) {
    try {
      daten = await sucheStatisch(s)
    } catch {
      daten = null
    }
  }

  // Nur Einträge übernehmen, die wirklich auf das angetippte Wort passen —
  // die Suche findet auch Einträge, bei denen nur die Gegenseite passt.
  if (daten) {
    for (const w of daten.woerter || []) {
      const quellwort = (w.wort || '').toLowerCase()
      const ueb = (w.uebersetzung || '').toLowerCase()
      if (KURDISCH.has(w.lang) && w.uebersetzung && quellwort.startsWith(s)) {
        treffer.push({ de: w.uebersetzung, quelle: 'Wörterbuch' })
      } else if (w.lang === 'deu' && w.wort && ueb.startsWith(s)) {
        treffer.push({ de: w.wort, quelle: 'Wörterbuch' })
      }
    }
  }

  const gesehen = new Set()
  const einmalig = treffer.filter((t) => {
    const k = (t.de || '').toLowerCase()
    if (!k || gesehen.has(k)) return false
    gesehen.add(k)
    return true
  })

  const erklaerungen = ((daten && daten.wiki) || [])
    .slice(0, 2)
    .map((w) => w.bedeutungen)
    .filter(Boolean)

  return { treffer: einmalig.slice(0, 5), erklaerungen }
}

/** Kurmancî-Text, bei dem jedes Wort ein Knopf ist. */
function KlickText({ text, gemerkte, waehle, className = '' }) {
  return (
    <p className={`les-text ${className}`} lang="ku">
      {text.split(WORT_MUSTER).map((teil, i) => {
        if (!IST_WORT.test(teil)) return <span key={i}>{teil}</span>
        const gemerkt = gemerkte.has(teil.toLowerCase())
        return (
          <button
            key={i}
            type="button"
            lang="ku"
            className={'rk-lesewort' + (gemerkt ? ' gemerkt' : '')}
            title={gemerkt ? 'Schon gemerkt — antippen zum Nachschlagen' : 'Antippen zum Nachschlagen'}
            aria-label={gemerkt ? `${teil} nachschlagen — schon gemerkt` : `${teil} nachschlagen`}
            onClick={() => waehle(teil)}
          >
            {teil}
            {gemerkt && <span className="rk-lesewort-punkt" aria-hidden="true" />}
          </button>
        )
      })}
    </p>
  )
}

/** Panel unter dem Text: Übersetzung, Anhören und Merken. */
function WortPanel({ zustand, gemerkte, schliessen }) {
  const gemerkt = gemerkte.has(zustand.wort.toLowerCase())
  const bedeutung = zustand.treffer.length > 0 ? zustand.treffer[0].de : ''

  return (
    <div className="les-panel">
      <div className="les-panel-kopf">
        <strong className="les-panel-wort" lang="ku">
          {zustand.wort}
        </strong>
        <PrimaryButton
          art="still"
          groesse="klein"
          icon="lautsprecher"
          onClick={() => spieleWort(zustand.wort)}
        >
          Anhören
        </PrimaryButton>
        <span className="luecke" />
        <IconButton icon="kreuz" label="Wortfenster schließen" onClick={schliessen} />
      </div>

      {/* Bereich bleibt bestehen, damit die Übersetzung vorgelesen wird. */}
      <div aria-live="polite">
        {zustand.laedt && <LoadingState text="Wort wird nachgeschlagen …" />}
        {!zustand.laedt && (
          <>
            {zustand.treffer.length === 0 && zustand.erklaerungen.length === 0 && (
              <p className="gedaempft">
                Nichts gefunden — vermutlich eine gebeugte Form. Versuche die Grundform im
                Wörterbuch.
              </p>
            )}
            {zustand.treffer.length > 0 && (
              <ul className="les-treffer" role="list">
                {zustand.treffer.map((t, i) => (
                  <li key={i}>
                    <span lang="de">{t.de}</span>{' '}
                    <span className="gedaempft">({t.quelle})</span>
                  </li>
                ))}
              </ul>
            )}
            {zustand.erklaerungen.map((e, i) => (
              <p key={i} className="gedaempft les-erklaerung">
                {e}
              </p>
            ))}
          </>
        )}
      </div>

      {!zustand.laedt && (
        <PrimaryButton
          art={gemerkt ? 'still' : 'gruen'}
          groesse="klein"
          icon={gemerkt ? 'haken' : 'plus'}
          disabled={gemerkt || !bedeutung}
          onClick={() => merkeWort(bedeutung, zustand.wort)}
          className="les-panel-merken"
        >
          {gemerkt ? 'Gemerkt' : 'Zum Lernen merken'}
        </PrimaryButton>
      )}
    </div>
  )
}

/** Gemeinsame Logik: ein Wort auswählen und nachschlagen. */
function useWortwahl() {
  const [wort, setWort] = useState(null)

  async function waehle(w) {
    setWort({ wort: w, laedt: true, treffer: [], erklaerungen: [] })
    const d = await nachschlagen(w)
    setWort((v) => (v && v.wort === w ? { wort: w, laedt: false, ...d } : v))
  }

  return [wort, waehle, () => setWort(null)]
}

function LeseText({ text, gemerkte, zurueck }) {
  const [zeigeUeb, setZeigeUeb] = useState(false)
  const [antworten, setAntworten] = useState({})
  const [meldung, setMeldung] = useState('')
  const [wort, waehle, schliesse] = useWortwahl()

  function antworte(index, option, richtig) {
    if (antworten[index] !== undefined) return
    setAntworten((a) => ({ ...a, [index]: option }))
    if (richtig) gibXp(10)
  }

  function vorlesen() {
    if (!sprich(text.text)) setMeldung('Dieser Browser kann keinen Text vorlesen.')
    else setMeldung('Der Text wird vorgelesen.')
  }

  function alleMerken() {
    const gesehen = new Set()
    let neu = 0
    for (const teil of text.text.split(WORT_MUSTER)) {
      if (!IST_WORT.test(teil)) continue
      const s = teil.toLowerCase()
      if (gesehen.has(s)) continue
      gesehen.add(s)
      const eintrag = WORTBUCH.get(s)
      if (eintrag && merkeWort(eintrag.de, eintrag.ku)) neu += 1
    }
    setMeldung(
      neu === 0
        ? 'Keine neuen Wörter — sie sind schon gemerkt oder noch nicht im Wortschatz der App.'
        : `${neu} ${neu === 1 ? 'Wort' : 'Wörter'} zum Lernen hinzugefügt.`
    )
  }

  return (
    <>
      <Card className="les-textkarte">
        <h3 className="les-titel" lang="ku">
          {text.titel}
        </h3>
        <p className="les-meta">
          <Badge ton="blau">{text.niveau}</Badge>
          <Badge>{text.thema}</Badge>
          <Badge icon="buch">{wortzahl(text.text)} Wörter</Badge>
          <Badge icon="sprechblase">{text.fragen.length} Fragen</Badge>
        </p>

        <p className="gedaempft les-lesehilfe">
          Tippe ein Wort an, um es nachzuschlagen. Wörter mit Punkt hast du schon gemerkt.
        </p>

        {absaetze(text.text).map((absatz, i) => (
          <KlickText key={i} text={absatz} gemerkte={gemerkte} waehle={waehle} />
        ))}

        {wort && <WortPanel zustand={wort} gemerkte={gemerkte} schliessen={schliesse} />}

        <div className="reihe-umbruch les-knoepfe">
          <PrimaryButton art="still" groesse="klein" icon="lautsprecher" onClick={vorlesen}>
            Text vorlesen
          </PrimaryButton>
          <PrimaryButton
            art="still"
            groesse="klein"
            icon="auge"
            aria-expanded={zeigeUeb}
            onClick={() => setZeigeUeb((v) => !v)}
          >
            {zeigeUeb ? 'Übersetzung verbergen' : 'Ganze Übersetzung zeigen'}
          </PrimaryButton>
          <PrimaryButton art="gruen" groesse="klein" icon="plus" onClick={alleMerken}>
            Alle Wörter zum Lernen hinzufügen
          </PrimaryButton>
        </div>

        <p className="gedaempft les-meldung" role="status" aria-live="polite">
          {meldung}
        </p>

        {zeigeUeb && (
          <p className="les-uebersetzung" lang="de">
            {text.uebersetzung}
          </p>
        )}
      </Card>

      <Card titel="Hast du alles verstanden?" icon="gehirn">
        <ol className="les-fragen">
          {text.fragen.map((f, i) => {
            const beantwortet = antworten[i] !== undefined
            const warRichtig = antworten[i] === f.antwort
            return (
              <li key={i}>
                <p className="les-frage-text" lang="de">
                  {f.frage}
                </p>
                <div className="rk-optionen rk-optionen-liste">
                  {f.optionen.map((opt) => {
                    const istRichtig = opt === f.antwort
                    const gewaehlt = antworten[i] === opt
                    let klasse = 'rk-option'
                    if (beantwortet && istRichtig) klasse += ' richtig'
                    else if (beantwortet && gewaehlt) klasse += ' falsch'
                    else if (beantwortet) klasse += ' blass'
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={klasse}
                        disabled={beantwortet}
                        onClick={() => antworte(i, opt, istRichtig)}
                      >
                        <span className="rk-option-text">{opt}</span>
                        {beantwortet && istRichtig && (
                          <Icon
                            name="haken"
                            groesse={20}
                            className="rk-option-haken"
                            titel="Richtige Antwort"
                          />
                        )}
                        {beantwortet && gewaehlt && !istRichtig && (
                          <Icon
                            name="kreuz"
                            groesse={20}
                            className="rk-option-kreuz"
                            titel="Falsche Antwort"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* Bleibt immer im Baum, damit die Rückmeldung vorgelesen wird. */}
                <p className="les-rueckmeldung" role="status">
                  {beantwortet && (
                    <>
                      <Icon name={warRichtig ? 'haken' : 'info'} groesse={18} />
                      <span>
                        {warRichtig ? 'Richtig! +10 XP' : `Richtige Antwort: ${f.antwort}`}
                      </span>
                    </>
                  )}
                </p>
              </li>
            )
          })}
        </ol>
      </Card>

      <PrimaryButton art="still" icon="pfeilLinks" onClick={zurueck}>
        Zu den Texten
      </PrimaryButton>
    </>
  )
}

function SatzKarte({ paar, gemerkte }) {
  const [zeigeUeb, setZeigeUeb] = useState(false)
  const [wort, waehle, schliesse] = useWortwahl()

  return (
    <Card className="les-satzkarte">
      <KlickText text={paar.satz} gemerkte={gemerkte} waehle={waehle} className="les-satz" />

      {wort && <WortPanel zustand={wort} gemerkte={gemerkte} schliessen={schliesse} />}

      <div className="reihe-umbruch les-knoepfe">
        <PrimaryButton
          art="still"
          groesse="klein"
          icon="lautsprecher"
          onClick={() => spieleWort(paar.satz)}
        >
          Anhören
        </PrimaryButton>
        <PrimaryButton
          art="still"
          groesse="klein"
          icon="auge"
          aria-expanded={zeigeUeb}
          onClick={() => setZeigeUeb((v) => !v)}
        >
          {zeigeUeb ? 'Übersetzung verbergen' : 'Übersetzung zeigen'}
        </PrimaryButton>
      </div>

      {zeigeUeb && (
        <p className="les-uebersetzung" lang="de">
          {paar.uebersetzung}
        </p>
      )}
    </Card>
  )
}

function Satzliste({ gemerkte }) {
  const [paare, setPaare] = useState([])
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState(false)

  async function holen() {
    setLaedt(true)
    setFehler(false)
    try {
      const r = await fetch('/api/satzpaare?anzahl=15')
      if (r.ok) {
        const d = await r.json()
        if (d.paare && d.paare.length > 0) {
          setPaare(d.paare)
          setLaedt(false)
          return
        }
      }
    } catch {
      /* Lokaler Server laeuft nicht. */
    }
    try {
      const p = await zufallsPaare(15)
      if (p && p.length > 0) setPaare(p)
      else setFehler(true)
    } catch {
      setFehler(true)
    }
    setLaedt(false)
  }

  useEffect(() => {
    holen()
    // Nur einmal beim Öffnen laden; neue Sätze holt der Knopf.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (laedt) return <LoadingState text="Sätze werden geladen …" />
  if (fehler) {
    return (
      <ErrorState
        titel="Die Sätze sind gerade nicht erreichbar."
        text="Weder der lokale Server noch die Satzdaten haben geantwortet."
        nochmal={holen}
      />
    )
  }

  return (
    <>
      <p className="gedaempft les-lesehilfe">
        Echte Sätze aus Tatoeba. Tippe ein Wort an, um es nachzuschlagen und zu merken.
      </p>
      <ul className="les-satzliste" role="list">
        {paare.map((p, i) => (
          <li key={`${i}-${p.satz}`}>
            <SatzKarte paar={p} gemerkte={gemerkte} />
          </li>
        ))}
      </ul>
      <PrimaryButton icon="wiederholen" onClick={holen}>
        Neue Sätze laden
      </PrimaryButton>
    </>
  )
}

const BEREICHE = [
  { id: 'texte', name: 'Kurze Texte', icon: 'buch' },
  { id: 'saetze', name: 'Tatoeba-Sätze', icon: 'sprechblase' },
]

export default function ReadingView() {
  const stand = useLernstand()

  const [bereich, setBereich] = useState('texte')
  const [textId, setTextId] = useState(null)
  const gemerkte = useMemo(() => gemerkteWoerter(), [stand])

  const text = texte.find((t) => t.id === textId) || null

  return (
    <>
      {/* Der Tab nennt den Bereich schon — die Überschrift haelt die Gliederung sauber. */}
      <h2 className="nur-sr">Lesen</h2>

      <div className="rk-tabs les-tabs" role="tablist" aria-label="Lesebereiche">
        {BEREICHE.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            id={`les-tab-${b.id}`}
            className="rk-tab"
            aria-selected={bereich === b.id}
            aria-controls="les-panel"
            onClick={() => setBereich(b.id)}
          >
            <Icon name={b.icon} groesse={18} />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      <div id="les-panel" role="tabpanel" aria-labelledby={`les-tab-${bereich}`}>
        {bereich === 'texte' && text && (
          <LeseText text={text} gemerkte={gemerkte} zurueck={() => setTextId(null)} />
        )}

        {bereich === 'texte' && !text && (
          <>
            <p className="gedaempft les-lesehilfe">
              Kuratierte Texte nach Niveau. Wähle einen Text — beim Lesen kannst du jedes Wort
              antippen, nachschlagen und merken.
            </p>
            <ul className="rk-kachelraster les-kacheln" role="list">
              {texte.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="rk-trainingskachel les-kachel"
                    onClick={() => setTextId(t.id)}
                  >
                    <span className="rk-trainingskachel-icon rk-ton-teal">
                      <Icon name="buch" groesse={24} />
                    </span>
                    <span className="rk-trainingskachel-text">
                      <strong lang="ku">{t.titel}</strong>
                      <span className="les-kachel-thema">{t.thema}</span>
                      <span className="rk-trainingskachel-meta">
                        <Badge ton="blau">{t.niveau}</Badge>
                        <Badge>{wortzahl(t.text)} Wörter</Badge>
                        <Badge>{t.fragen.length} Fragen</Badge>
                      </span>
                    </span>
                    <Icon name="pfeilRechts" groesse={20} className="les-kachel-pfeil" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {bereich === 'saetze' && <Satzliste gemerkte={gemerkte} />}
      </div>
    </>
  )
}
