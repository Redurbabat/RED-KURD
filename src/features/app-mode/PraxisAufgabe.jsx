// Eine Mitmach-Aufgabe: direkt in der App bauen, rechnen oder formulieren —
// mit Live-Vorschau und automatischer Pruefung. Erst wenn alle Punkte der
// Pruefliste gruen sind, laesst sich die Aufgabe abschliessen.
//
// Arten:
//   'html'  → Code-Editor + sichere Live-Vorschau (Sandbox-iframe ohne Skripte)
//   'text'  → Textfeld (z. B. einen Prompt formulieren) + Pruefliste
//   'zahl'  → Zahleneingabe (z. B. Ohm-Rechnung) + Sofort-Pruefung
import { useRef, useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'
import Modal from '../../components/common/Modal.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import CodeTastatur from './CodeTastatur.jsx'

export const XP_JE_MITMACH = 20

/**
 * @param {{aufgabe:Object|null, lernstand:Object, schliessen:Function}} props
 */
export default function PraxisAufgabe({ aufgabe, lernstand, schliessen }) {
  const [wert, setWert] = useState(() => {
    if (!aufgabe) return ''
    const gespeichert = lernstand.notiz(aufgabe.id)
    return gespeichert || aufgabe.startCode || ''
  })
  // Code-Aufgaben: eigene Bildschirm-Tastatur statt der Geraetetastatur —
  // auf dem Handy sind < > " = sonst muehsam zu erreichen.
  const feldRef = useRef(null)
  const [tastaturArt, setTastaturArt] = useState('code')
  const [tastaturOffen, setTastaturOffen] = useState(false)
  if (!aufgabe) return null

  const erledigt = lernstand.istErledigt(aufgabe.id)
  const checks = (aufgabe.checks || []).map((c) => ({ ...c, ok: !!c.pruefe(wert) }))
  const alleOk = checks.length > 0 && checks.every((c) => c.ok)

  function wertSichern() {
    lernstand.setzeNotiz(aufgabe.id, wert)
  }

  function abschliessen() {
    if (!alleOk) return
    wertSichern()
    lernstand.schliesseAb(aufgabe.id, XP_JE_MITMACH)
    schliessen()
  }

  function zu() {
    wertSichern()
    schliessen()
  }

  return (
    <Modal
      offen
      breit
      titel={aufgabe.title}
      schliessen={zu}
      fussleiste={
        erledigt ? (
          <>
            <Badge ton="gruen" icon="haken">
              Erledigt
            </Badge>
            <PrimaryButton art="still" onClick={zu}>
              Schließen
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton icon="haken" disabled={!alleOk} onClick={abschliessen}>
            {alleOk ? `Aufgabe abschließen · +${XP_JE_MITMACH} XP` : 'Erst alle Punkte erfüllen'}
          </PrimaryButton>
        )
      }
    >
      <div className="lektion-inhalt">
        <p>{aufgabe.auftrag}</p>

        {aufgabe.art === 'zahl' ? (
          <div className="praxis-zahl">
            <label className="rk-feld-label" htmlFor="praxis-eingabe">
              Dein Ergebnis{aufgabe.einheit ? ` (in ${aufgabe.einheit})` : ''}
            </label>
            <input
              id="praxis-eingabe"
              className="rk-feld praxis-zahl-feld"
              type="text"
              inputMode="decimal"
              value={wert}
              placeholder="z. B. 3"
              onChange={(e) => setWert(e.target.value)}
              onBlur={wertSichern}
            />
          </div>
        ) : (
          <>
            <label className="rk-feld-label" htmlFor="praxis-eingabe">
              {aufgabe.art === 'html' ? 'Dein Code' : 'Dein Text'}
            </label>
            <textarea
              id="praxis-eingabe"
              ref={feldRef}
              className={`rk-feld ${aufgabe.art === 'html' ? 'praxis-code' : ''}`}
              rows={aufgabe.art === 'html' ? 6 : 7}
              value={wert}
              spellCheck={aufgabe.art !== 'html'}
              autoCapitalize={aufgabe.art === 'html' ? 'off' : 'sentences'}
              autoCorrect={aufgabe.art === 'html' ? 'off' : 'on'}
              autoComplete="off"
              inputMode={aufgabe.art === 'html' && tastaturArt === 'code' ? 'none' : undefined}
              onFocus={() => aufgabe.art === 'html' && tastaturArt === 'code' && setTastaturOffen(true)}
              onClick={() => aufgabe.art === 'html' && tastaturArt === 'code' && setTastaturOffen(true)}
              onChange={(e) => setWert(e.target.value)}
              onBlur={wertSichern}
            />
            {aufgabe.art === 'html' && (
              <div>
                <p className="rk-feld-label">Live-Vorschau — dein Ergebnis</p>
                {/* Sandbox ohne Rechte: reines Anzeigen, keine Skripte, keine Links. */}
                <iframe
                  className="praxis-vorschau"
                  title="Live-Vorschau deines Codes"
                  sandbox=""
                  srcDoc={wert}
                />
              </div>
            )}
            {aufgabe.art === 'html' && !tastaturOffen && tastaturArt === 'code' && (
              <p className="praxis-hinweis">
                Tippe ins Feld — die Code-Tastatur öffnet sich direkt darunter.
              </p>
            )}
            {aufgabe.art === 'html' && tastaturArt === 'code' && tastaturOffen && (
              <CodeTastatur
                feldRef={feldRef}
                wert={wert}
                aendern={setWert}
                zurGeraetetastatur={() => {
                  setTastaturArt('system')
                  setTastaturOffen(false)
                  requestAnimationFrame(() => feldRef.current?.focus())
                }}
                ausblenden={() => setTastaturOffen(false)}
              />
            )}
            {aufgabe.art === 'html' && tastaturArt === 'system' && (
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
          </>
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

        {aufgabe.tipp && (
          <p className="lektion-merke">
            <Icon name="info" groesse={18} />
            <span>
              <strong>Tipp:</strong> {aufgabe.tipp}
            </span>
          </p>
        )}
      </div>
    </Modal>
  )
}
