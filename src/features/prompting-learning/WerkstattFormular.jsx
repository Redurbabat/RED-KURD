// Baukasten-Formular der AI-Sprache: Felder ausfüllen → fertiger Text
// erscheint live darunter, die Prüfliste hakt ab, was schon stimmt.
// Wird für den Claude-Code-Auftrag und den Bug-Report benutzt.
import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'

/**
 * @param {{felder:Array, werte:Object, setzeFeld:Function, leeren:Function,
 *          bauen:Function, pruefen:Function, titel:string, hinweis:string}} props
 */
export default function WerkstattFormular({
  felder,
  werte,
  setzeFeld,
  leeren,
  bauen,
  pruefen,
  titel,
  hinweis,
}) {
  const [kopiert, setKopiert] = useState(false)

  const text = bauen(werte)
  const checks = pruefen(werte)
  const erfuellt = checks.filter((c) => c.ok).length

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text)
      setKopiert(true)
      window.setTimeout(() => setKopiert(false), 2000)
    } catch {
      // Ohne Zwischenablage-Recht bleibt der Text im Feld — von dort
      // laesst er sich immer noch von Hand markieren und kopieren.
      setKopiert(false)
    }
  }

  return (
    <div className="pl-werkstatt">
      <Card titel={titel} icon="stift">
        <p className="pl-text">{hinweis}</p>
      </Card>

      {felder.map((feld) => (
        <Card key={feld.id} className="pl-feld-karte">
          <label className="rk-feld-label" htmlFor={`wf-${feld.id}`}>
            {feld.label}
          </label>
          <p className="pl-meta">{feld.frage}</p>
          {feld.mehrzeilig ? (
            <textarea
              id={`wf-${feld.id}`}
              className="rk-feld"
              rows={3}
              value={werte[feld.id] || ''}
              placeholder={feld.platzhalter}
              onChange={(e) => setzeFeld(feld.id, e.target.value)}
            />
          ) : (
            <input
              id={`wf-${feld.id}`}
              className="rk-feld"
              value={werte[feld.id] || ''}
              placeholder={feld.platzhalter}
              onChange={(e) => setzeFeld(feld.id, e.target.value)}
            />
          )}
        </Card>
      ))}

      <Card titel="Dein fertiger Text" icon="haken" ton={erfuellt === checks.length ? 'gruen' : 'normal'}>
        <pre className="pl-ergebnis" aria-live="polite">
          {text || 'Fülle die Felder aus — hier entsteht dein Text Zeile für Zeile.'}
        </pre>

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
        <p className="pl-meta">
          {erfuellt}/{checks.length} Punkten erfüllt
          {erfuellt === checks.length ? ' — der Text ist bereit.' : ''}
        </p>

        <div className="pl-werkstatt-knoepfe">
          <PrimaryButton icon="teilen" disabled={!text} onClick={kopieren}>
            {kopiert ? 'Kopiert!' : 'Text kopieren'}
          </PrimaryButton>
          <PrimaryButton art="still" icon="muell" onClick={leeren}>
            Felder leeren
          </PrimaryButton>
        </div>
      </Card>
    </div>
  )
}
