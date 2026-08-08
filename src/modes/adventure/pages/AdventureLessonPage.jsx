// Eine Station im Abenteuer: Einführung, Übung und Ergebnis in einer Seite.
// Der Lernstand ist derselbe wie im Modern-Modus — nur die Erzählung ist anders.
import { useEffect, useRef, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  BESTANDEN_AB,
  einheitProzent,
  holeEinheit,
} from '../../../core/courses/courseRepository.ts'
import { planeLektion } from '../../../core/session/sessionPlanner.ts'
import { baueUebungen } from '../../../core/session/exerciseFactory.ts'
import {
  einheitAbgeschlossen,
  gibEdelsteine,
  setzeSterne,
} from '../../../core/progress/progressStore.js'
import { statistik } from '../../../core/progress/progressSelectors.ts'
import { spieleWort } from '../../../core/audio/audioService.js'
import ExercisePlayer from '../../../features/exercise/ExercisePlayer.jsx'
import ExerciseResult from '../../../features/exercise/ExerciseResult.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import EmptyState, { LoadingState, ErrorState } from '../../../components/common/EmptyState.jsx'
import './AdventureLessonPage.css'

/** Die fünf Schritte einer Einheit, in genau dieser Reihenfolge. */
const SCHRITTE = ['lernen', 'festigen', 'schreiben', 'hoeren', 'pruefung']

const XP_JE_AUFGABE = 10
const EDELSTEINE_JE_PRUEFUNG = 2
const WOERTER_VORSCHAU = 5

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
  const [belohnung, setBelohnung] = useState(null)

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
    setBelohnung(null)
    gewertet.current = false
  }, [unitId])

  // Nur die Kapitelprüfung zählt für den Lernstand — und das genau einmal je Durchgang.
  // Edelsteine gibt es ausschliesslich für eine BESTANDENE Prüfung und nur einmal
  // je Einheit; sonst liessen sie sich durch Wiederholen beliebig oft abholen.
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
      xp: ergebnis.richtig * XP_JE_AUFGABE,
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

  const weltAdresse = einheit.weltId ? '/adventure/world/' + einheit.weltId : '/adventure/world'
  const platz = SCHRITTE.indexOf(lektionId)
  const naechsterSchritt = platz >= 0 ? SCHRITTE[platz + 1] || null : null
  const istPruefung = lektionId === 'pruefung'
  const fehlerlauf = !!(lauf && lauf.fehlerlauf)

  function zurWeltkarte() {
    navigiere(weltAdresse)
  }

  function lektionVon(id) {
    return einheit.lektionen.find((l) => l.id === `${einheit.id}-${id}`) || null
  }

  const aktuelleLektion = lektionVon(lektionId)
  const schrittNr = aktuelleLektion ? aktuelleLektion.nr : 1

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
    setBelohnung(null)
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
    setBelohnung(null)
    setPhase('uebung')
  }

  function weiter() {
    if (naechsterSchritt) starte(naechsterSchritt)
    else zurWeltkarte()
  }

  const zurueckKnopf = (
    <button type="button" className="rk-zurueck al-zurueck" onClick={zurWeltkarte}>
      <Icon name="pfeilLinks" groesse={18} />
      <span>Zurück zur Welt</span>
    </button>
  )

  // ===== 1. Einführung (Bild 4) =====

  if (phase === 'intro') {
    const vorschau = einheit.woerter.slice(0, WOERTER_VORSCHAU)

    return (
      <div className="al-seite">
        <header className="al-kopf">
          {zurueckKnopf}
          <h1 className="al-titel">
            {einheit.name} · Lektion {schrittNr}
          </h1>
          <div className="al-kopf-reihe">
            <p className="al-lead">
              {einheit.woerter.length} Wörter in fünf Schritten — Hêlo begleitet dich.
            </p>
            <HeloMascot variante="winken" groesse={120} className="al-helo" />
          </div>
        </header>

        {/* Das echte Kapitelfoto stimmt aufs Thema ein — Nachweis liegt in
            kapitelFotos.js, angezeigt wird er auf der Kapitelseite. */}
        {einheit.foto && (
          <figure className="al-echtfoto">
            <img src={einheit.foto.src} alt={einheit.foto.alt} loading="lazy" />
          </figure>
        )}

        <section className="al-lernziel" aria-labelledby="al-lernziel-titel">
          <div className="al-lernziel-kopf">
            <span className="al-lernziel-marke" aria-hidden="true">
              <Icon name="kompass" groesse={24} />
            </span>
            <div className="al-lernziel-inhalt">
              <h2 className="al-lernziel-titel" id="al-lernziel-titel">
                {T.kurs.lernziel}
              </h2>
              <p className="al-lernziel-text">{einheit.ziel}</p>
            </div>
          </div>

          <h3 className="al-woerter-titel" id="al-woerter-titel">
            {T.kurs.wichtigeWoerter}
          </h3>
          <ul className="al-wortchips" role="list" aria-labelledby="al-woerter-titel">
            {vorschau.map((w) => (
              <li key={w.ku}>
                <button
                  type="button"
                  className="al-wortchip"
                  aria-label={`${w.ku} anhören`}
                  onClick={() => spieleWort(w.ku)}
                >
                  <span lang="ku">{w.ku}</span>
                  <Icon name="note" groesse={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <h2 className="al-abschnitt-titel" id="al-inhalt-titel">
          Lektionsinhalt
        </h2>
        <ul className="al-schritte" role="list" aria-labelledby="al-inhalt-titel">
          {SCHRITTE.map((id) => {
            const l = lektionVon(id)
            if (!l) return null
            const aktiv = id === lektionId
            return (
              <li key={id}>
                <button
                  type="button"
                  className={'al-schritt' + (aktiv ? ' aktiv' : '')}
                  aria-current={aktiv ? 'step' : undefined}
                  onClick={() => starte(id)}
                >
                  <span className={`al-schritt-nr al-nr-${id}`} aria-hidden="true">
                    {l.nr}
                  </span>
                  <span className="al-schritt-text">
                    <strong className="al-schritt-name">{l.name}</strong>
                    <small className="al-schritt-meta">
                      Schritt {l.nr} · {l.dauer}
                    </small>
                  </span>
                  {aktiv && <Badge ton="teal">Jetzt dran</Badge>}
                  <Icon name="pfeilRechts" groesse={20} className="al-schritt-pfeil" />
                </button>
              </li>
            )
          })}
        </ul>

        <PrimaryButton
          art="gruen"
          groesse="gross"
          breit
          className="al-start"
          onClick={() => starte(lektionId)}
        >
          Lektion starten
        </PrimaryButton>
      </div>
    )
  }

  // ===== 2. Übung (Bild 5–7) =====

  if (phase === 'uebung') {
    if (!lauf) return <LoadingState text="Station wird vorbereitet …" />

    if (!lauf.uebungen.length) {
      return (
        <div className="al-seite">
          <header className="al-kopf">
            {zurueckKnopf}
            <h1 className="al-titel">{einheit.name}</h1>
          </header>
          <ErrorState
            titel="Diese Aufgaben liessen sich nicht bauen."
            text="Für diesen Schritt kamen keine Übungen zusammen. Versuche es noch einmal."
            nochmal={() => starte(lektionId)}
          />
          <div className="al-fuss">
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

  // ===== 3. Ergebnis (Bild 8) =====

  if (!ergebnis) return <LoadingState text="Ergebnis wird berechnet …" />

  const bestanden = ergebnis.prozent >= BESTANDEN_AB
  const truheVerdient = istPruefung && !fehlerlauf && bestanden

  let ergebnisTitel = 'Gute Arbeit!'
  if (fehlerlauf) ergebnisTitel = 'Fehler geübt!'
  else if (istPruefung && !bestanden) ergebnisTitel = 'Noch nicht bestanden'

  const kopfTitel = istPruefung && !fehlerlauf && !bestanden ? 'Schritt beendet' : 'Lektion abgeschlossen!'
  const kopfText = fehlerlauf
    ? `Du hast deine Fehler aus ${einheit.name} wiederholt.`
    : `Du hast ${einheit.name} · Lektion ${schrittNr} gemeistert.`

  const zahlen = belohnung || { xp: ergebnis.richtig * XP_JE_AUFGABE, edelsteine: 0, serie: 0 }
  const naechsteLektion = naechsterSchritt ? lektionVon(naechsterSchritt) : null

  return (
    <div className="al-seite">
      <header className="al-ergebnis-kopf">
        <h1 className="al-titel">{kopfTitel}</h1>
        <p className="al-ergebnis-unter">{kopfText}</p>
      </header>

      <ul className="al-ergebnis-zahlen" role="list">
        <li>
          <strong className="al-zahl-wert al-zahl-blau">{ergebnis.prozent} %</strong>
          <span className="al-zahl-label">Genauigkeit</span>
        </li>
        <li>
          <strong className="al-zahl-wert al-zahl-gold">+{zahlen.xp}</strong>
          <span className="al-zahl-label">XP</span>
        </li>
        <li>
          <strong className="al-zahl-wert al-zahl-teal">+{zahlen.edelsteine}</strong>
          <span className="al-zahl-label">Edelsteine</span>
        </li>
      </ul>

      {truheVerdient && (
        <div className="adv-truhe al-truhe">
          <span className="al-truhe-marke" aria-hidden="true">
            <Icon name="truhe" groesse={26} />
          </span>
          <div className="adv-truhe-text">
            <strong>Schatztruhe erhalten</strong>
            <span>Öffne sie auf der Weltkarte.</span>
          </div>
        </div>
      )}

      {naechsteLektion && (
        <p className="al-naechster">
          <Icon name="fussspur" groesse={18} />
          <span>
            Als Nächstes wartet{' '}
            <strong>
              Schritt {naechsteLektion.nr}: {naechsteLektion.name}
            </strong>{' '}
            — mit „Weiter“ gehst du direkt dorthin.
          </span>
        </p>
      )}

      <ExerciseResult
        stil="abenteuer"
        titel={ergebnisTitel}
        ergebnis={ergebnis}
        sterne={istPruefung && !fehlerlauf ? sterne : null}
        belohnung={zahlen}
        weiter={weiter}
        wiederholen={() => starte(lektionId)}
        fehlerUeben={fehlerUeben}
      />

      {istPruefung && !fehlerlauf && !bestanden && (
        <p className="al-hinweis gedaempft zentriert">
          Ab {BESTANDEN_AB} % gilt die Einheit als bestanden — wiederhole die Prüfung, wenn du magst.
        </p>
      )}

      {naechsteLektion && (
        <div className="al-fuss">
          <PrimaryButton art="still" icon="welt" onClick={zurWeltkarte}>
            Zur Weltkarte
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
