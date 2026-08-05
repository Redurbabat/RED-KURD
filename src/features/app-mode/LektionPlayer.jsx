// Interaktiver Lektions-Player: ein Schritt pro Bildschirm, wie bei Mimo —
// aber mit Live-Vorschau. Oben Fortschrittsbalken und Schließen, unten die
// Rückmeldung („Das ist richtig!") und der Weiter-Knopf.
//
// Schritt-Arten (siehe codeSchritte.js):
//   'wahl'  → Antwortkarten antippen, Einsenden, Feedback
//   'bauen' → Code aus Bausteinen zusammentippen; das Ergebnis erscheint
//             sofort in der Live-Vorschau darunter
import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { XP_JE_LEKTION } from '../../core/lernbereiche/bereichsLernstand.js'

/**
 * @param {{lektion:Object, schritte:Array, lernstand:Object, schliessen:Function}} props
 */
export default function LektionPlayer({ lektion, schritte, lernstand, schliessen }) {
  const [index, setIndex] = useState(0)
  const [antwort, setAntwort] = useState(null)
  const [gebaut, setGebaut] = useState([])
  const [ergebnis, setErgebnis] = useState(null) // null | 'richtig' | 'falsch'
  const wurzel = useRef(null)

  const schritt = schritte[index]
  const letzter = index === schritte.length - 1
  const erledigt = lernstand.istErledigt(lektion.id)

  // Fokus und Escape nur EINMAL beim Oeffnen einrichten — laeuft der Effekt
  // bei jedem Render, reisst er den Fokus aus der Bedienung (siehe Modal.jsx).
  const schliessenRef = useRef(schliessen)
  schliessenRef.current = schliessen
  useEffect(() => {
    wurzel.current?.focus()
    function taste(e) {
      if (e.key === 'Escape') schliessenRef.current()
    }
    document.addEventListener('keydown', taste)
    const alt = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', taste)
      document.body.style.overflow = alt
    }
  }, [])

  const zusammengebaut = gebaut.map((i) => schritt.bausteine[i]).join('')

  function pruefen() {
    if (schritt.art === 'wahl') {
      setErgebnis(antwort === schritt.richtig ? 'richtig' : 'falsch')
    } else {
      setErgebnis(zusammengebaut === schritt.loesung ? 'richtig' : 'falsch')
    }
  }

  function weiter() {
    if (letzter) {
      lernstand.schliesseAb(lektion.id)
      schliessen()
      return
    }
    setIndex(index + 1)
    setAntwort(null)
    setGebaut([])
    setErgebnis(null)
  }

  function bausteinTippen(i) {
    if (gebaut.includes(i)) return
    setGebaut([...gebaut, i])
    setErgebnis(null)
  }

  function zurueck() {
    setGebaut(gebaut.slice(0, -1))
    setErgebnis(null)
  }

  function neuStarten() {
    setGebaut([])
    setErgebnis(null)
  }

  const pruefbar =
    schritt.art === 'wahl' ? antwort !== null : gebaut.length === schritt.bausteine.length

  return (
    <div
      className="lektion-player"
      role="dialog"
      aria-modal="true"
      aria-label={lektion.title}
      ref={wurzel}
      tabIndex={-1}
    >
      <header className="lp-kopf">
        <button type="button" className="lp-zu" onClick={schliessen} aria-label="Lektion schließen">
          <Icon name="kreuz" groesse={22} />
        </button>
        <div
          className="lp-fortschritt"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={schritte.length}
          aria-valuenow={index}
          aria-label="Fortschritt der Lektion"
        >
          <div
            className="lp-fortschritt-balken"
            style={{ width: `${Math.round((index / schritte.length) * 100)}%` }}
          />
        </div>
      </header>

      <div className="lp-inhalt">
        {schritt.art === 'wahl' ? (
          <>
            <p className="lp-frage">{schritt.frage}</p>
            <p className="lp-hinweis">
              <Icon name="info" groesse={16} /> Tippe auf die richtige Antwort
            </p>
            <div className="lp-optionen">
              {schritt.optionen.map((option, i) => (
                <button
                  key={option}
                  type="button"
                  className={
                    'lp-option' +
                    (antwort === i ? ' gewaehlt' : '') +
                    (ergebnis && i === schritt.richtig ? ' richtig' : '') +
                    (ergebnis === 'falsch' && antwort === i ? ' falsch' : '')
                  }
                  onClick={() => {
                    setAntwort(i)
                    setErgebnis(null)
                  }}
                >
                  {schritt.code ? <code>{option}</code> : option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="lp-frage">{schritt.auftrag}</p>
            <p className="lp-hinweis">
              <Icon name="info" groesse={16} /> Tippe unten auf die Bausteine — in der richtigen
              Reihenfolge
            </p>

            <div className="lp-datei">index.html</div>
            <div className="lp-editor" aria-label="Dein zusammengebauter Code">
              {gebaut.length === 0 && <span className="lp-cursor" aria-hidden="true" />}
              {gebaut.map((i, pos) => (
                <span key={`${i}-${pos}`} className="lp-chip-fest">
                  {schritt.bausteine[i]}
                </span>
              ))}
            </div>

            {schritt.vorschau !== false && (
              <>
                <p className="rk-feld-label">Live-Vorschau — dein Ergebnis</p>
                {/* Sandbox: normal ohne jede Rechte. allow-scripts gibt es NUR
                    fuer Bau-Schritte mit skript:true — dort besteht der Code
                    ausschliesslich aus unseren eigenen, kuratierten Bausteinen
                    (nie freie Eingabe), und ohne allow-same-origin bleibt der
                    Rahmen ohne Zugriff auf Speicher und Cookies. */}
                <iframe
                  className="praxis-vorschau lp-vorschau"
                  title="Live-Vorschau deines Codes"
                  sandbox={schritt.skript ? 'allow-scripts' : ''}
                  srcDoc={
                    schritt.huelle
                      ? schritt.huelle.replace('{{code}}', zusammengebaut)
                      : zusammengebaut
                  }
                />
              </>
            )}

            <div className="lp-werkzeuge">
              <button
                type="button"
                className="lp-werkzeug"
                onClick={neuStarten}
                disabled={gebaut.length === 0}
                aria-label="Von vorn beginnen"
              >
                ↺
              </button>
              <button
                type="button"
                className="lp-werkzeug"
                onClick={zurueck}
                disabled={gebaut.length === 0}
                aria-label="Letzten Baustein entfernen"
              >
                ⌫
              </button>
            </div>
            <div className="lp-bausteine">
              {schritt.bausteine.map((baustein, i) => (
                <button
                  key={baustein}
                  type="button"
                  className="lp-chip"
                  disabled={gebaut.includes(i)}
                  onClick={() => bausteinTippen(i)}
                >
                  {baustein.trim()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className={'lp-fuss' + (ergebnis ? ` ${ergebnis}` : '')}>
        {ergebnis === 'richtig' && (
          <p className="lp-feedback richtig">
            <Icon name="haken" groesse={18} /> Das ist richtig! Lass uns so weitermachen.
          </p>
        )}
        {ergebnis === 'falsch' && (
          <p className="lp-feedback falsch">
            <Icon name="kreuz" groesse={18} /> Nicht ganz — versuch es noch einmal.
            {schritt.tipp ? ` Tipp: ${schritt.tipp}` : ''}
          </p>
        )}
        {ergebnis === 'richtig' ? (
          <PrimaryButton icon={letzter ? 'haken' : 'pfeilRechts'} onClick={weiter}>
            {letzter
              ? erledigt
                ? 'Fertig'
                : `Lektion abschließen · +${XP_JE_LEKTION} XP`
              : 'Weiter'}
          </PrimaryButton>
        ) : (
          <PrimaryButton icon="haken" disabled={!pruefbar} onClick={pruefen}>
            {schritt.art === 'wahl' ? 'Einsenden' : 'Prüfen'}
          </PrimaryButton>
        )}
      </footer>
    </div>
  )
}
