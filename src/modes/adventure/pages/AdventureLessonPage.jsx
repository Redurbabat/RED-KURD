// Eine Station im Abenteuer: Pergament-Einstieg, Übung und Ergebnis.
// Der Lernstand ist derselbe wie im Modern-Modus — nur die Erzählung ist anders.
import { useEffect, useRef, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  BESTANDEN_AB,
  einheitProzent,
  einheitSterne,
  holeEinheit,
  holeWelt,
} from '../../../core/courses/courseRepository.js'
import { planeLektion } from '../../../core/session/sessionPlanner.js'
import { baueUebungen } from '../../../core/session/exerciseFactory.js'
import {
  einheitAbgeschlossen,
  gibEdelsteine,
  setzeSterne,
} from '../../../core/progress/progressStore.js'
import { statistik } from '../../../core/progress/progressSelectors.js'
import ExercisePlayer from '../../../features/exercise/ExercisePlayer.jsx'
import ExerciseResult from '../../../features/exercise/ExerciseResult.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import EmptyState, { LoadingState, ErrorState } from '../../../components/common/EmptyState.jsx'
import './AdventureLessonPage.css'

/** Die drei Schritte einer Einheit, in genau dieser Reihenfolge. */
const SCHRITTE = ['lernen', 'hoeren', 'pruefung']

const XP_JE_AUFGABE = 10
const EDELSTEINE_JE_PRUEFUNG = 2
const WOERTER_VORSCHAU = 6

/** Rein bildlich — die Zahl steht immer als Text daneben. */
function Sterne({ anzahl }) {
  return (
    <span className="advl-sterne" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <Icon key={i} name="stern" groesse={16} className={i <= anzahl ? 'advl-stern-voll' : 'advl-stern-leer'} />
      ))}
    </span>
  )
}

/** ?schritt=pruefung springt direkt zur Abschlussprüfung. */
function startSchritt() {
  if (typeof window === 'undefined') return 'lernen'
  const wunsch = new URLSearchParams(window.location.search).get('schritt')
  return SCHRITTE.includes(wunsch) ? wunsch : 'lernen'
}

export default function AdventureLessonPage({ unitId }) {
  useLernstand()

  const [phase, setPhase] = useState('intro')
  const [lektionId, setLektionId] = useState(startSchritt)
  const [lauf, setLauf] = useState(null)
  const [ergebnis, setErgebnis] = useState(null)
  const [sterne, setSterne] = useState(null)

  const gewertet = useRef(false)
  const laufNr = useRef(0)

  const einheit = holeEinheit(unitId)

  // Neue Einheit in der Adresse -> alles auf Anfang.
  useEffect(() => {
    setPhase('intro')
    setLektionId(startSchritt())
    setLauf(null)
    setErgebnis(null)
    setSterne(null)
    gewertet.current = false
  }, [unitId])

  // Nur die Mini-Prüfung zählt für den Lernstand — und das genau einmal je Durchgang.
  // Edelsteine gibt es ausschliesslich für eine BESTANDENE Prüfung und nur einmal
  // je Einheit; sonst liessen sie sich durch Wiederholen beliebig oft abholen.
  const [belohnung, setBelohnung] = useState(null)

  useEffect(() => {
    if (phase !== 'ergebnis' || !ergebnis || !einheit) return
    if (lektionId !== 'pruefung') return
    if (lauf && lauf.fehlerlauf) return
    if (gewertet.current) return
    gewertet.current = true

    const vorherBestanden = einheitProzent(unitId) >= BESTANDEN_AB
    const bestanden = ergebnis.prozent >= BESTANDEN_AB
    const vorherSerie = statistik().serie

    einheitAbgeschlossen(unitId, ergebnis.prozent)
    setSterne(setzeSterne(unitId, ergebnis.prozent))

    let edelsteine = 0
    if (bestanden && !vorherBestanden) {
      gibEdelsteine(EDELSTEINE_JE_PRUEFUNG)
      edelsteine = EDELSTEINE_JE_PRUEFUNG
    }
    setBelohnung({
      xp: ergebnis.richtig * 10,
      edelsteine,
      // Der Serienpunkt kommt aus gibXp() in der Übung — hier nur melden, wenn
      // die Serie dadurch tatsächlich gewachsen ist.
      serie: statistik().serie > vorherSerie ? 1 : 0,
    })
  }, [phase, ergebnis, lektionId, lauf, unitId, einheit])

  if (!einheit) {
    return (
      <EmptyState
        variante="denken"
        titel="Diese Station kennt Hêlo nicht."
        text="Vielleicht hat sich die Adresse verlaufen. Wähle eine Station auf der Weltkarte."
        aktion={() => navigiere('/adventure/world')}
        aktionText="Zur Weltübersicht"
      />
    )
  }

  const welt = einheit.weltId ? holeWelt(einheit.weltId) : null
  const weltPfad = einheit.weltId ? '/adventure/world/' + einheit.weltId : '/adventure/world'
  const platz = SCHRITTE.indexOf(lektionId)
  const naechsterSchritt = platz >= 0 ? SCHRITTE[platz + 1] || null : null
  const istPruefung = lektionId === 'pruefung'
  const fehlerlauf = !!(lauf && lauf.fehlerlauf)

  function zurWeltkarte() {
    navigiere(weltPfad)
  }

  function lektionVon(id) {
    return einheit.lektionen.find((l) => l.id === `${einheit.id}-${id}`) || null
  }

  /** Baut einen neuen Durchgang; der Zähler hält die Aufgaben beim Neuzeichnen stabil. */
  function starte(id) {
    const plan = planeLektion(unitId, id)
    laufNr.current += 1
    setLektionId(id)
    setLauf({
      nr: laufNr.current,
      schluessel: unitId + '/' + id,
      uebungen: plan ? plan.uebungen : [],
      titel: plan ? plan.titel : einheit.name,
      fehlerlauf: false,
    })
    setErgebnis(null)
    setSterne(null)
    gewertet.current = false
    setPhase('uebung')
  }

  function fehlerUeben() {
    if (!ergebnis) return
    const uebungen = baueUebungen(ergebnis.fehler)
    if (!uebungen.length) return
    laufNr.current += 1
    setLauf({
      nr: laufNr.current,
      schluessel: unitId + '/' + lektionId + '/fehler',
      uebungen,
      titel: `Fehler üben · ${einheit.name}`,
      fehlerlauf: true,
    })
    setErgebnis(null)
    setSterne(null)
    setPhase('uebung')
  }

  function weiter() {
    if (naechsterSchritt) starte(naechsterSchritt)
    else zurWeltkarte()
  }

  // ===== 1. Einstieg =====

  if (phase === 'intro') {
    const prozent = einheitProzent(einheit.id)
    const gesammelteSterne = einheitSterne(einheit.id)
    const vorschau = einheit.woerter.slice(0, WOERTER_VORSCHAU)
    const weitere = Math.max(0, einheit.woerter.length - vorschau.length)

    return (
      <div className="advl-seite">
        <PageHeader
          titel={einheit.name}
          untertitel={welt ? `Einheit ${einheit.nr} · Welt ${welt.nr}: ${welt.name}` : `Einheit ${einheit.nr}`}
          variante="rucksack"
          zurueck={weltPfad}
          zurueckText="Zurück zur Weltkarte"
        />

        <div className="adv-pergament advl-intro">
          <p className="advl-symbol" aria-hidden="true">
            {einheit.symbol}
          </p>
          <h2>{einheit.name}</h2>
          <p className="advl-ziel">{einheit.ziel}</p>

          <ul className="advl-zahlen" role="list">
            <li>
              <Icon name="buch" groesse={16} />
              <span>{einheit.woerter.length} Wörter</span>
            </li>
            <li>
              <Icon name="fussspur" groesse={16} />
              <span>{prozent} % geschafft</span>
            </li>
            <li>
              <Sterne anzahl={gesammelteSterne} />
              <span>{gesammelteSterne} von 3 Sternen</span>
            </li>
          </ul>

          <h3 className="advl-titel" id="advl-woerter-titel">
            {T.kurs.wichtigeWoerter}
          </h3>
          <ul className="rk-wortliste advl-woerter" role="list" aria-labelledby="advl-woerter-titel">
            {vorschau.map((w) => (
              <li key={w.ku} className="rk-wortchip">
                {w.bild && (
                  <span className="advl-wort-bild" aria-hidden="true">
                    {w.bild}
                  </span>
                )}
                <strong lang="ku">{w.ku}</strong>
                <span className="advl-wort-de" lang="de">
                  {w.de}
                </span>
              </li>
            ))}
            {weitere > 0 && (
              <li className="rk-wortchip advl-wort-rest">
                <Icon name="plus" groesse={16} />
                <span>{weitere} weitere</span>
              </li>
            )}
          </ul>

          <h3 className="advl-titel" id="advl-schritte-titel">
            Dein Weg durch diese Station
          </h3>
          <ol className="advl-schritte" role="list" aria-labelledby="advl-schritte-titel">
            {SCHRITTE.map((id) => {
              const l = lektionVon(id)
              if (!l) return null
              return (
                <li key={id} className={'advl-schritt' + (id === 'lernen' ? ' aktiv' : '')}>
                  <span className="advl-schritt-nr" aria-hidden="true">
                    {l.nr}
                  </span>
                  <Icon name={l.icon} groesse={20} />
                  <span className="advl-schritt-text">
                    <strong>
                      Schritt {l.nr}: {l.name}
                    </strong>
                    <small>
                      {l.beschreibung} · {l.dauer}
                    </small>
                  </span>
                  {id === 'lernen' && <Badge ton="gold">Start</Badge>}
                </li>
              )
            })}
          </ol>

          <PrimaryButton art="gold" groesse="gross" breit icon="play" onClick={() => starte('lernen')}>
            {T.kurs.losGehts}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ===== 2. Übung =====

  if (phase === 'uebung') {
    if (!lauf) return <LoadingState text="Station wird vorbereitet …" />

    if (!lauf.uebungen.length) {
      return (
        <div className="advl-seite">
          <PageHeader
            titel={einheit.name}
            untertitel="Hier liess sich gerade nichts vorbereiten."
            variante="denken"
            zurueck={weltPfad}
            zurueckText="Zurück zur Weltkarte"
          />
          <ErrorState
            titel="Diese Aufgaben liessen sich nicht bauen."
            text="Für diesen Schritt kamen keine Übungen zusammen. Versuche es noch einmal."
            nochmal={() => starte(lektionId)}
          />
          <div className="advl-fuss">
            <PrimaryButton art="still" icon="welt" onClick={zurWeltkarte}>
              Zur Weltkarte
            </PrimaryButton>
          </div>
        </div>
      )
    }

    return (
      <ExercisePlayer
        speichern={false}
        key={lauf.schluessel + '#' + lauf.nr}
        stil="abenteuer"
        mitLeben
        uebungen={lauf.uebungen}
        titel={lauf.titel}
        abbrechen={zurWeltkarte}
        fertig={(erg) => {
          setErgebnis(erg)
          setPhase('ergebnis')
        }}
      />
    )
  }

  // ===== 3. Ergebnis =====

  if (!ergebnis) return <LoadingState text="Ergebnis wird berechnet …" />

  const bestanden = ergebnis.prozent >= BESTANDEN_AB
  let ergebnisTitel = 'Gute Arbeit!'
  if (fehlerlauf) ergebnisTitel = 'Fehler geübt!'
  else if (istPruefung && !bestanden) ergebnisTitel = 'Noch nicht bestanden'

  const naechsteLektion = naechsterSchritt ? lektionVon(naechsterSchritt) : null

  return (
    <div className="advl-seite">
      {naechsteLektion && (
        <p className="adv-pergament advl-naechster">
          <Icon name="fussspur" groesse={18} />
          <span>
            Als Nächstes wartet <strong>Schritt {naechsteLektion.nr}: {naechsteLektion.name}</strong> — mit
            „Weiter“ gehst du direkt dorthin.
          </span>
        </p>
      )}

      <ExerciseResult
        stil="abenteuer"
        titel={ergebnisTitel}
        ergebnis={ergebnis}
        sterne={istPruefung && !fehlerlauf ? sterne : null}
        belohnung={
          belohnung || { xp: ergebnis.richtig * XP_JE_AUFGABE, edelsteine: 0, serie: 0 }
        }
        weiter={weiter}
        wiederholen={() => starte(lektionId)}
        fehlerUeben={fehlerUeben}
      />

      {istPruefung && !fehlerlauf && !bestanden && (
        <p className="advl-hinweis gedaempft zentriert">
          Ab {BESTANDEN_AB} % gilt die Einheit als bestanden — wiederhole die Prüfung, wenn du magst.
        </p>
      )}

      {naechsteLektion && (
        <div className="advl-fuss">
          <PrimaryButton art="still" icon="welt" onClick={zurWeltkarte}>
            Zur Weltkarte
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
