// Satzbau: echte Beispielsätze aus Wortblöcken zusammensetzen.
// Vorgegeben wird der deutsche Satz, gebaut wird der kurmancîsche.
// Die Sätze kommen aus den statischen Beispieldaten, nicht aus dem Wiederholsystem.
import { useEffect, useMemo, useState } from 'react'
import { zufallsPaare } from '../../core/data/staticData.js'
import { mische } from '../../core/session/exerciseFactory.js'
import { gibXp } from '../../core/progress/progressStore.js'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import EmptyState, { LoadingState, ErrorState } from '../../components/common/EmptyState.jsx'
import HeloMascot from '../../components/mascot/HeloMascot.jsx'
import './SentenceBuilder.css'

const RUNDEN = 8
const XP_JE_SATZ = 15

/** Nur Sätze mit 3 bis 8 Wörtern lassen sich sinnvoll als Blöcke bauen. */
function passendeLaenge(paar) {
  if (!paar || typeof paar.satz !== 'string' || !paar.uebersetzung) return false
  const anzahl = paar.satz.trim().split(/\s+/).length
  return anzahl >= 3 && anzahl <= 8
}

export default function SentenceBuilder() {
  const [zustand, setZustand] = useState('laden')
  const [saetze, setSaetze] = useState([])
  const [runde, setRunde] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [gewaehlt, setGewaehlt] = useState([])
  const [ergebnis, setErgebnis] = useState(null)
  const [versuch, setVersuch] = useState(0)

  useEffect(() => {
    let abgebrochen = false
    setZustand('laden')
    setSaetze([])
    setRunde(0)
    setPunkte(0)
    setGewaehlt([])
    setErgebnis(null)
    ;(async () => {
      try {
        const paare = await zufallsPaare(30)
        if (abgebrochen) return
        setSaetze((paare || []).filter(passendeLaenge).slice(0, RUNDEN))
        setZustand('bereit')
      } catch {
        if (!abgebrochen) setZustand('fehler')
      }
    })()
    return () => {
      abgebrochen = true
    }
  }, [versuch])

  const paar = saetze[runde] || null
  const zielWoerter = useMemo(() => (paar ? paar.satz.trim().split(/\s+/) : []), [paar])
  const bloecke = useMemo(() => mische(zielWoerter.map((w, i) => ({ w, i }))), [zielWoerter])

  function anfuegen(block) {
    if (ergebnis !== null) return
    setGewaehlt((g) => (g.some((x) => x.i === block.i) ? g : [...g, block]))
  }

  function entfernen(pos) {
    if (ergebnis !== null) return
    setGewaehlt((g) => g.filter((_, j) => j !== pos))
  }

  function pruefen() {
    const richtig = gewaehlt.map((b) => b.w).join(' ') === zielWoerter.join(' ')
    setErgebnis(richtig)
    if (richtig) {
      setPunkte((p) => p + 1)
      gibXp(XP_JE_SATZ)
    }
  }

  function weiter() {
    setGewaehlt([])
    setErgebnis(null)
    setRunde((r) => r + 1)
  }

  function nochmal() {
    setVersuch((v) => v + 1)
  }

  if (zustand === 'laden') return <LoadingState text="Sätze werden geladen …" />

  if (zustand === 'fehler') {
    return (
      <ErrorState
        titel="Die Sätze liessen sich nicht laden."
        text="Die Beispielsätze konnten gerade nicht gelesen werden. Prüfe deine Verbindung und versuche es noch einmal."
        nochmal={nochmal}
      />
    )
  }

  if (!saetze.length) {
    return (
      <EmptyState
        variante="denken"
        titel="Keine passenden Sätze gefunden."
        text="Für den Satzbau braucht es Sätze mit drei bis acht Wörtern. Gerade war keiner dabei."
        aktion={nochmal}
        aktionText="Neue Sätze holen"
      />
    )
  }

  // Alle Runden gespielt: kurze Auswertung.
  if (!paar) {
    return (
      <div className="sb-ende" role="status">
        <HeloMascot variante="feiern" groesse={120} dekorativ />
        <h2>Satzbau geschafft!</h2>
        <p className="sb-ende-zahl">
          {punkte} von {saetze.length} Sätzen richtig
        </p>
        <p className="gedaempft">+{punkte * XP_JE_SATZ} XP gesammelt</p>
        <PrimaryButton groesse="gross" icon="wiederholen" onClick={nochmal}>
          Nochmal
        </PrimaryButton>
      </div>
    )
  }

  const vollstaendig = gewaehlt.length === zielWoerter.length
  const letzterSatz = runde + 1 >= saetze.length

  return (
    <div className="sb-spiel">
      <ProgressBar
        wert={runde}
        max={saetze.length}
        label={`Satzbau: Satz ${runde + 1} von ${saetze.length}`}
      />
      <p className="gedaempft sb-zeile">
        Satz {runde + 1} von {saetze.length} · {punkte} richtig
      </p>

      <Card titel="Bilde den kurmancîschen Satz:" icon="puzzle">
        {/* Vorgabe ist immer der deutsche Satz. */}
        <p className="sb-vorgabe" lang="de">
          „{paar.uebersetzung}“
        </p>

        <h4 className="sb-titel">Dein Satz</h4>
        {gewaehlt.length === 0 ? (
          <p className="gedaempft sb-leerhinweis">
            Tippe die Wortblöcke unten in der richtigen Reihenfolge an.
          </p>
        ) : (
          <ul className="sb-ziel">
            {gewaehlt.map((b, i) => (
              <li key={b.i}>
                <button
                  type="button"
                  className="sb-block sb-block-gewaehlt"
                  lang="ku"
                  disabled={ergebnis !== null}
                  onClick={() => entfernen(i)}
                  aria-label={`Wort ${b.w} entfernen`}
                >
                  {b.w}
                </button>
              </li>
            ))}
          </ul>
        )}

        <h4 className="sb-titel">Wortblöcke</h4>
        <ul className="sb-pool">
          {bloecke.map((b) => (
            <li key={b.i}>
              <button
                type="button"
                className="sb-block"
                lang="ku"
                disabled={ergebnis !== null || gewaehlt.some((g) => g.i === b.i)}
                onClick={() => anfuegen(b)}
                aria-label={`Wort ${b.w} anfügen`}
              >
                {b.w}
              </button>
            </li>
          ))}
        </ul>

        {/* Nach dem Prüfen immer erst der Kurmancî-Satz, darunter die Übersetzung. */}
        <div aria-live="polite">
          {ergebnis === true && (
            <div className="sb-rueckmeldung sb-gut">
              <Icon name="haken" groesse={20} />
              <div className="stapel-eng">
                <strong>Richtig! · +{XP_JE_SATZ} XP</strong>
                <span lang="ku">{paar.satz}</span>
                <span lang="de">{paar.uebersetzung}</span>
              </div>
            </div>
          )}
          {ergebnis === false && (
            <div className="sb-rueckmeldung sb-schlecht">
              <Icon name="kreuz" groesse={20} />
              <div className="stapel-eng">
                <strong>Richtig wäre:</strong>
                <span lang="ku">{paar.satz}</span>
                <span lang="de">{paar.uebersetzung}</span>
              </div>
            </div>
          )}
        </div>

        {ergebnis === null && vollstaendig && (
          <PrimaryButton breit groesse="gross" onClick={pruefen}>
            Prüfen
          </PrimaryButton>
        )}
        {ergebnis !== null && (
          <PrimaryButton
            breit
            groesse="gross"
            art={ergebnis ? 'gruen' : 'primaer'}
            onClick={weiter}
            autoFocus
          >
            {letzterSatz ? 'Zur Auswertung' : 'Weiter zum nächsten Satz'}
          </PrimaryButton>
        )}
      </Card>
    </div>
  )
}
