// Aussprache-Studio: anhören, nachsprechen, aufnehmen und vergleichen.
// Hier wird gesprochen, nicht übersetzt — deshalb steht das Kurmancî oben und
// die deutsche Bedeutung darunter.
// Bewusst ohne Bewertung durch die App — du hörst selbst, was noch anders klingt.
import { useEffect, useRef, useState } from 'react'
import { EINHEITEN } from '../../core/courses/courseRepository.ts'
import { spieleWort, speichereAufnahme, holeAufnahme } from '../../core/audio/audioService.js'
import { sprich } from '../../core/schrift/transliteration.ts'
import { gibXp } from '../../core/progress/progressStore.js'
import Card from '../../components/common/Card.jsx'
import Badge from '../../components/common/Badge.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { ErrorState } from '../../components/common/EmptyState.jsx'
import './PronunciationStudio.css'

const XP_JE_AUFNAHME = 5
const VERGLEICH_PAUSE = 1600

/**
 * Die sechs kurmancîschen Sonderzeichen mit deutschem Vergleich.
 * Dieselbe Tabelle nutzt auch die Rückmeldung in der Übung.
 */
const AUSSPRACHE = [
  { zeichen: 'ê', vergleich: 'ist ein langes, geschlossenes „e“ wie in „Beet“' },
  { zeichen: 'î', vergleich: 'ist ein langes „i“ wie in „Bier“' },
  { zeichen: 'û', vergleich: 'ist ein langes „u“ wie in „Buch“' },
  { zeichen: 'ş', vergleich: 'klingt wie „sch“ in „Schule“' },
  { zeichen: 'ç', vergleich: 'klingt wie „tsch“ in „Tschüss“' },
  { zeichen: 'x', vergleich: 'klingt wie das „ch“ in „Bach“' },
]

const FEHLERTEXTE = {
  'kein-mikrofon': {
    titel: 'Aufnehmen ist auf diesem Gerät nicht möglich.',
    text: 'Dein Browser bietet keinen Zugriff auf ein Mikrofon an. Anhören und Nachsprechen funktionieren trotzdem.',
  },
  'keine-erlaubnis': {
    titel: 'Das Mikrofon ist nicht freigegeben.',
    text: 'Erlaube den Zugriff auf das Mikrofon in den Einstellungen deines Browsers — meist über das Schloss-Symbol links in der Adresszeile.',
  },
  speichern: {
    titel: 'Die Aufnahme liess sich nicht speichern.',
    text: 'Der lokale Speicher deines Browsers hat die Aufnahme abgelehnt. Im privaten Modus ist das oft so.',
  },
}

export default function PronunciationStudio() {
  const [einheitId, setEinheitId] = useState(EINHEITEN[0].id)
  const [aufnahmeWort, setAufnahmeWort] = useState(null)
  const [hatAufnahme, setHatAufnahme] = useState({})
  const [fehler, setFehler] = useState(null)
  const rekorder = useRef(null)
  const stuecke = useRef([])
  const timer = useRef(null)
  const lebt = useRef(true)
  /** Der aktive Mikrofon-Strom — nur so laesst er sich zuverlaessig schliessen. */
  const strom = useRef(null)

  const einheit = EINHEITEN.find((e) => e.id === einheitId) || EINHEITEN[0]

  // Beim Verlassen laufende Aufnahme und Vergleich beenden.
  useEffect(() => {
    lebt.current = true
    return () => {
      lebt.current = false
      if (timer.current) clearTimeout(timer.current)
      if (rekorder.current && rekorder.current.state === 'recording') rekorder.current.stop()
      if (strom.current) {
        strom.current.getTracks().forEach((t) => t.stop())
        strom.current = null
      }
    }
  }, [])

  // Welche Wörter dieser Einheit sind schon eingesprochen?
  useEffect(() => {
    let abgebrochen = false
    setHatAufnahme({})
    ;(async () => {
      const gefunden = {}
      for (const w of einheit.woerter) {
        if (abgebrochen) return
        try {
          if (await holeAufnahme(w.ku)) gefunden[w.ku] = true
        } catch {
          /* Kein lokaler Speicher — dann gibt es eben noch keine Aufnahmen. */
        }
      }
      if (!abgebrochen) setHatAufnahme(gefunden)
    })()
    return () => {
      abgebrochen = true
    }
  }, [einheitId])

  /** Mikrofon wirklich freigeben — sonst bleibt die Aufnahmeanzeige an. */
  function schliesseMikrofon() {
    if (rekorder.current && rekorder.current.state === 'recording') {
      try {
        rekorder.current.stop()
      } catch {
        /* Recorder war schon beendet. */
      }
    }
    if (strom.current) {
      strom.current.getTracks().forEach((t) => t.stop())
      strom.current = null
    }
  }

  async function starteAufnahme(wort) {
    setFehler(null)
    // Eine noch laufende Aufnahme zuerst sauber beenden — sonst bleibt ihr
    // Mikrofon-Zugriff für immer offen.
    schliesseMikrofon()
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setFehler('kein-mikrofon')
      return
    }
    try {
      const spur = await navigator.mediaDevices.getUserMedia({ audio: true })
      strom.current = spur
      const r = new MediaRecorder(spur)
      stuecke.current = []
      r.ondataavailable = (e) => {
        if (e.data && e.data.size) stuecke.current.push(e.data)
      }
      r.onstop = async () => {
        spur.getTracks().forEach((t) => t.stop())
        if (strom.current === spur) strom.current = null
        const blob = new Blob(stuecke.current, { type: r.mimeType || 'audio/webm' })
        try {
          await speichereAufnahme(wort, blob)
          if (!lebt.current) return
          setHatAufnahme((h) => ({ ...h, [wort]: true }))
          setAufnahmeWort(null)
          gibXp(XP_JE_AUFNAHME)
        } catch {
          if (!lebt.current) return
          setAufnahmeWort(null)
          setFehler('speichern')
        }
      }
      r.start()
      rekorder.current = r
      setAufnahmeWort(wort)
    } catch {
      setFehler('keine-erlaubnis')
    }
  }

  function stoppeAufnahme() {
    if (rekorder.current && rekorder.current.state === 'recording') rekorder.current.stop()
  }

  async function spieleMeine(wort) {
    let blob = null
    try {
      blob = await holeAufnahme(wort)
    } catch {
      /* ohne Aufnahme passiert einfach nichts */
    }
    if (!blob) return
    const adresse = URL.createObjectURL(blob)
    const ton = new Audio(adresse)
    ton.onended = () => URL.revokeObjectURL(adresse)
    const lauf = ton.play()
    if (lauf && lauf.catch) lauf.catch(() => URL.revokeObjectURL(adresse))
  }

  /** Erst die Vorlage, kurz danach die eigene Aufnahme. */
  function vergleiche(wort) {
    sprich(wort)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => spieleMeine(wort), VERGLEICH_PAUSE)
  }

  return (
    <>
      <Card titel="So funktioniert das Studio" icon="info">
        <ol className="ps-schritte">
          <li>Wort anhören.</li>
          <li>Laut nachsprechen und dabei aufnehmen.</li>
          <li>Vergleichen — zuerst die Vorlage, dann deine eigene Aufnahme.</li>
        </ol>
        <p className="gedaempft ps-datenschutz">
          Deine Aufnahmen bleiben auf deinem Gerät. Sie werden nirgendwohin gesendet und du kannst
          sie jederzeit überschreiben.
        </p>
      </Card>

      {fehler && (
        <ErrorState
          titel={FEHLERTEXTE[fehler].titel}
          text={FEHLERTEXTE[fehler].text}
          nochmal={() => setFehler(null)}
        />
      )}

      <div aria-live="polite" className="nur-sr">
        {aufnahmeWort ? `Aufnahme von ${aufnahmeWort} läuft.` : ''}
      </div>

      <section className="rk-abschnitt" aria-labelledby="ps-einheit-titel">
        <h2 className="rk-abschnitt-titel" id="ps-einheit-titel">
          Einheit wählen
        </h2>
        <ul className="rk-tabs ps-chips">
          {EINHEITEN.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="rk-tab"
                aria-pressed={e.id === einheitId}
                onClick={() => setEinheitId(e.id)}
              >
                <span aria-hidden="true">{e.symbol}</span>
                <span>
                  {e.nr}. {e.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rk-abschnitt" aria-labelledby="ps-woerter-titel">
        <h2 className="rk-abschnitt-titel" id="ps-woerter-titel">
          {einheit.name} · {einheit.woerter.length} Wörter
        </h2>

        {/* Aussprachehilfe: die sechs Sonderzeichen mit deutschem Vergleich. */}
        <Card titel="Aussprachehilfe" icon="sprache">
          <p className="gedaempft ps-datenschutz">
            Diese sechs Buchstaben gibt es im Deutschen so nicht:
          </p>
          <ul className="ps-liste">
            {AUSSPRACHE.map((a) => (
              <li key={a.zeichen} className="reihe">
                <strong className="ps-bild" lang="ku">
                  {a.zeichen}
                </strong>
                <span lang="de">{a.vergleich}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="stapel-eng">
          <p className="gedaempft">Sprich nach:</p>
          <ul className="ps-liste">
            {einheit.woerter.map((w) => {
              const laeuft = aufnahmeWort === w.ku
              return (
                <li key={w.ku} className="ps-zeile">
                  {w.bild && (
                    <span className="ps-bild" aria-hidden="true">
                      {w.bild}
                    </span>
                  )}
                  <div className="ps-text">
                    <strong lang="ku" className="ps-ku">
                      {w.ku}
                    </strong>
                    <span lang="de" className="ps-de">
                      {w.de}
                    </span>
                    <span className="ps-marken">
                      {hatAufnahme[w.ku] && (
                        <Badge ton="gruen" icon="haken">
                          Aufnahme vorhanden
                        </Badge>
                      )}
                      {laeuft && (
                        <Badge ton="rot" icon="mikrofon">
                          Aufnahme läuft
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="ps-knoepfe">
                    <PrimaryButton
                      groesse="klein"
                      art="still"
                      icon="lautsprecher"
                      aria-label={`${w.ku} anhören`}
                      onClick={() => spieleWort(w.ku)}
                    >
                      Anhören
                    </PrimaryButton>

                    {laeuft ? (
                      <PrimaryButton
                        groesse="klein"
                        art="gefahr"
                        icon="pause"
                        aria-label={`Aufnahme von ${w.ku} stoppen`}
                        onClick={stoppeAufnahme}
                      >
                        Stopp
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton
                        groesse="klein"
                        icon="mikrofon"
                        aria-label={`${w.ku} aufnehmen`}
                        onClick={() => starteAufnahme(w.ku)}
                      >
                        Aufnehmen
                      </PrimaryButton>
                    )}

                    {hatAufnahme[w.ku] && (
                      <>
                        <PrimaryButton
                          groesse="klein"
                          art="still"
                          icon="play"
                          aria-label={`Meine Aufnahme von ${w.ku} abspielen`}
                          onClick={() => spieleMeine(w.ku)}
                        >
                          Meine Aufnahme
                        </PrimaryButton>
                        <PrimaryButton
                          groesse="klein"
                          art="still"
                          icon="wiederholen"
                          aria-label={`Vorlage und meine Aufnahme von ${w.ku} vergleichen`}
                          onClick={() => vergleiche(w.ku)}
                        >
                          Vergleichen
                        </PrimaryButton>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
