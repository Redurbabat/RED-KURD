// Schrift-Umwandlung: Kurmancî zwischen lateinischer (Hawar) und arabischer
// Schrift umwandeln, vorlesen und kopieren.
import { useState } from 'react'
import { useLernstand } from '../../core/store.js'
import {
  lateinNachArabisch,
  arabischNachLatein,
  sprich,
} from '../../core/schrift/transliteration.js'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import SegmentedControl from '../../components/common/SegmentedControl.jsx'
import SpecialChars from '../../components/common/SpecialChars.jsx'
import './ScriptConverter.css'

const RICHTUNGEN = [
  { id: 'lat-arab', name: 'Latein → Arabisch' },
  { id: 'arab-lat', name: 'Arabisch → Latein' },
]

export default function ScriptConverter() {
  useLernstand()

  const [richtung, setRichtung] = useState('lat-arab')
  const [eingabe, setEingabe] = useState('')
  const [ergebnis, setErgebnis] = useState('')
  const [meldung, setMeldung] = useState('')

  const nachArabisch = richtung === 'lat-arab'

  function wechsle(id) {
    setRichtung(id)
    setErgebnis('')
    setMeldung('')
  }

  function umwandeln() {
    const t = eingabe.trim()
    if (!t) {
      setErgebnis('')
      setMeldung('Bitte zuerst einen Text eingeben.')
      return
    }
    setErgebnis(nachArabisch ? lateinNachArabisch(t) : arabischNachLatein(t))
    setMeldung('Text umgewandelt.')
  }

  function vorlesen() {
    // Vorgelesen wird immer die lateinische Fassung — dafuer gibt es Stimmen.
    const t = (nachArabisch ? eingabe : ergebnis || arabischNachLatein(eingabe)).trim()
    if (!t) {
      setMeldung('Es gibt noch nichts zum Vorlesen.')
      return
    }
    setMeldung(sprich(t) ? 'Der Text wird vorgelesen.' : 'Dieser Browser kann nicht vorlesen.')
  }

  async function kopieren() {
    if (!ergebnis) return
    try {
      await navigator.clipboard.writeText(ergebnis)
      setMeldung('Kopiert.')
    } catch {
      setMeldung('Kopieren hat nicht geklappt — bitte den Text markieren und selbst kopieren.')
    }
  }

  return (
    <section className="rk-abschnitt" aria-labelledby="sc-titel">
      <h2 className="rk-abschnitt-titel sc-kopf" id="sc-titel">
        <Icon name="sprache" groesse={20} />
        <span>Schrift-Umwandlung</span>
      </h2>

      <Card>
        <p className="sc-erklaerung">
          Kurmancî wird in zwei Schriften geschrieben: in der lateinischen Hawar-Schrift
          (Bakur, Rojava und die Diaspora) und in der arabischen Schrift (Başûr und
          Rojhilat). Hier wandelst du Texte zwischen beiden um.
        </p>

        <p className="rk-hinweisstreifen sc-hinweis">
          <Icon name="warnung" groesse={18} />
          <span>
            Beta: Die Umwandlung folgt vereinfachten Regeln. Bei Eigennamen und seltenen
            Wörtern kann das Ergebnis abweichen — prüfe es lieber nach.
          </span>
        </p>

        <SegmentedControl
          name="sc-richtung"
          label="Richtung der Umwandlung"
          wert={richtung}
          optionen={RICHTUNGEN}
          aendern={wechsle}
          className="sc-richtung"
        />

        <label className="rk-feld-label" htmlFor="sc-eingabe">
          {nachArabisch ? 'Text in lateinischer Schrift' : 'Text in arabischer Schrift'}
        </label>
        <textarea
          id="sc-eingabe"
          className="rk-feld rk-feld-gross"
          lang="ku"
          dir={nachArabisch ? undefined : 'rtl'}
          rows={4}
          value={eingabe}
          placeholder={nachArabisch ? 'Silav, tu çawa yî?' : 'سلاڤ'}
          onChange={(e) => setEingabe(e.target.value)}
        />

        {nachArabisch && <SpecialChars einfuegen={(z) => setEingabe((t) => t + z)} />}

        <div className="reihe-umbruch sc-knoepfe">
          <PrimaryButton icon="wiederholen" onClick={umwandeln}>
            Umwandeln
          </PrimaryButton>
          <PrimaryButton art="still" icon="lautsprecher" onClick={vorlesen}>
            Vorlesen
          </PrimaryButton>
          <PrimaryButton art="still" onClick={kopieren} disabled={!ergebnis}>
            Kopieren
          </PrimaryButton>
        </div>

        <h3 className="sc-ergebnis-titel">Ergebnis</h3>
        {ergebnis ? (
          <p
            className={'sc-ergebnis' + (nachArabisch ? ' sc-arabisch' : '')}
            lang="ku"
            dir={nachArabisch ? 'rtl' : undefined}
          >
            {ergebnis}
          </p>
        ) : (
          <p className="sc-ergebnis sc-leer">Hier erscheint der umgewandelte Text.</p>
        )}

        <p className="gedaempft sc-meldung" role="status" aria-live="polite">
          {meldung}
        </p>
      </Card>
    </section>
  )
}
