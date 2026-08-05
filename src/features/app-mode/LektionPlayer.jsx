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
import CodeTastatur from './CodeTastatur.jsx'

/**
 * @param {{lektion:Object, schritte:Array, lernstand:Object, schliessen:Function}} props
 */
export default function LektionPlayer({ lektion, schritte, lernstand, schliessen }) {
  const [index, setIndex] = useState(0)
  const [antwort, setAntwort] = useState(null)
  const [gebaut, setGebaut] = useState([])
  const [text, setText] = useState(() => schritte[0].startText || '')
  const [ergebnis, setErgebnis] = useState(null) // null | 'richtig' | 'falsch'
  const wurzel = useRef(null)
  // Schreib-Schritte: eigenes Feld mit der Code-Tastatur (wie Mitmach-Aufgaben)
  const feldRef = useRef(null)
  const [tastaturArt, setTastaturArt] = useState('code')
  const [tastaturOffen, setTastaturOffen] = useState(false)

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

  const zusammengebaut =
    schritt.art === 'tippen' ? text : gebaut.map((i) => schritt.bausteine[i]).join('')
  const checks =
    schritt.art === 'tippen' ? schritt.checks.map((c) => ({ ...c, ok: !!c.pruefe(text) })) : []
  const alleChecksOk = checks.length > 0 && checks.every((c) => c.ok)

  function pruefen() {
    if (schritt.art === 'wahl') {
      setErgebnis(antwort === schritt.richtig ? 'richtig' : 'falsch')
    } else if (schritt.art === 'tippen') {
      setErgebnis(alleChecksOk ? 'richtig' : 'falsch')
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
    setText(schritte[index + 1].startText || '')
    setTastaturOffen(false)
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
    schritt.art === 'wahl'
      ? antwort !== null
      : schritt.art === 'tippen'
        ? text.trim().length > 0
        : gebaut.length === schritt.bausteine.length

  const vorschauInhalt = schritt.huelle
    ? schritt.huelle.replace('{{code}}', zusammengebaut)
    : zusammengebaut

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
        ) : schritt.art === 'tippen' ? (
          <>
            <p className="lp-frage">{schritt.auftrag}</p>
            <p className="lp-hinweis">
              <Icon name="info" groesse={16} /> Schreib den Code selbst — die Prüfliste hakt live
              ab
            </p>

            <label className="rk-feld-label" htmlFor="lp-eingabe">
              Dein Code
            </label>
            <textarea
              id="lp-eingabe"
              ref={feldRef}
              className="rk-feld praxis-code"
              rows={5}
              value={text}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              inputMode={tastaturArt === 'code' ? 'none' : undefined}
              onFocus={() => tastaturArt === 'code' && setTastaturOffen(true)}
              onClick={() => tastaturArt === 'code' && setTastaturOffen(true)}
              onChange={(e) => {
                setText(e.target.value)
                setErgebnis(null)
              }}
            />

            {schritt.vorschau !== false && (
              <>
                <p className="rk-feld-label">Live-Vorschau — dein Ergebnis</p>
                <iframe
                  className="praxis-vorschau lp-vorschau"
                  title="Live-Vorschau deines Codes"
                  sandbox={schritt.skript ? 'allow-scripts' : ''}
                  srcDoc={vorschauInhalt}
                />
              </>
            )}

            {!tastaturOffen && tastaturArt === 'code' && (
              <p className="praxis-hinweis">
                Tippe ins Feld — die Code-Tastatur öffnet sich direkt darunter.
              </p>
            )}
            {tastaturArt === 'code' && tastaturOffen && (
              <CodeTastatur
                feldRef={feldRef}
                wert={text}
                aendern={(neu) => {
                  setText(neu)
                  setErgebnis(null)
                }}
                zurGeraetetastatur={() => {
                  setTastaturArt('system')
                  setTastaturOffen(false)
                  requestAnimationFrame(() => feldRef.current?.focus())
                }}
                ausblenden={() => setTastaturOffen(false)}
              />
            )}
            {tastaturArt === 'system' && (
              <button
                type="button"
                className="praxis-tastatur-chip"
                onClick={() => {
                  setTastaturArt('code')
                  setTastaturOffen(true)
                }}
              >
                Code-Tastatur verwenden
              </button>
            )}

            <ul className="praxis-checks" aria-label="Prüfliste">
              {checks.map((c) => (
                <li key={c.id} className={c.ok ? 'ok' : 'offen'}>
                  <span className="praxis-check-zeichen" aria-hidden="true">
                    <Icon name={c.ok ? 'haken' : 'kreuz'} groesse={14} />
                  </span>
                  <span>
                    {c.text}
                    <span className="nur-sr">{c.ok ? ' — erfüllt' : ' — noch offen'}</span>
                  </span>
                </li>
              ))}
            </ul>
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
                    bei skript:true — dann laeuft der Lektions-Code (kuratierte
                    Bausteine bzw. der selbst geschriebene Code des Lernenden)
                    in einem Rahmen OHNE allow-same-origin: kein Zugriff auf
                    Speicher, Cookies oder die App selbst. */}
                <iframe
                  className="praxis-vorschau lp-vorschau"
                  title="Live-Vorschau deines Codes"
                  sandbox={schritt.skript ? 'allow-scripts' : ''}
                  srcDoc={vorschauInhalt}
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
