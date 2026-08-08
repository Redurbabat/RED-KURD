// Das Fehlerbuch: Fehler festhalten, Loesung dazu, daraus lernen.
// Alles bleibt lokal auf dem Geraet.
import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton, { IconButton } from '../../components/common/PrimaryButton.jsx'
import { fehlerbuchEintraege, fehlerEntfernen, fehlerNotieren } from './fehlerbuchStore.ts'

export default function Fehlerbuch() {
  const [titel, setTitel] = useState('')
  const [fehler, setFehler] = useState('')
  const [loesung, setLoesung] = useState('')
  const [hinweis, setHinweis] = useState('')
  const eintraege = fehlerbuchEintraege()

  function speichern(e) {
    e.preventDefault()
    const neu = fehlerNotieren({ titel, fehler, loesung })
    if (!neu) {
      setHinweis('Titel und Fehlerbeschreibung dürfen nicht leer sein.')
      return
    }
    setTitel('')
    setFehler('')
    setLoesung('')
    setHinweis('Gespeichert — bleibt lokal auf deinem Gerät.')
  }

  return (
    <div className="cl-fehlerbuch">
      <Card titel="Neuen Fehler festhalten" icon="stift">
        <form className="cl-fehlerbuch-form" onSubmit={speichern}>
          <label className="rk-feld-label" htmlFor="fb-titel">
            Titel
          </label>
          <input
            id="fb-titel"
            className="rk-feld"
            value={titel}
            maxLength={120}
            placeholder="z. B. Button reagierte nicht auf Klick"
            onChange={(e) => setTitel(e.target.value)}
          />

          <label className="rk-feld-label" htmlFor="fb-fehler">
            Was ist passiert?
          </label>
          <textarea
            id="fb-fehler"
            className="rk-feld"
            rows={3}
            value={fehler}
            placeholder="Fehlermeldung, was du erwartet hast, was stattdessen passiert ist …"
            onChange={(e) => setFehler(e.target.value)}
          />

          <label className="rk-feld-label" htmlFor="fb-loesung">
            Lösung / Was habe ich gelernt? (optional)
          </label>
          <textarea
            id="fb-loesung"
            className="rk-feld"
            rows={2}
            value={loesung}
            placeholder="Wie hast du es gelöst? Was merkst du dir?"
            onChange={(e) => setLoesung(e.target.value)}
          />

          {hinweis && (
            <p className="cl-fehlerbuch-hinweis" role="status">
              {hinweis}
            </p>
          )}

          <PrimaryButton type="submit" icon="haken">
            Eintrag speichern
          </PrimaryButton>
        </form>
      </Card>

      {eintraege.length > 0 && (
        <ul className="cl-fehlerbuch-liste">
          {eintraege.map((eintrag) => (
            <li key={eintrag.id} className="rk-karte cl-fehlerbuch-eintrag">
              <header className="cl-fehlerbuch-kopf">
                <h3>{eintrag.titel}</h3>
                <IconButton
                  icon="muell"
                  label={`Eintrag „${eintrag.titel}“ löschen`}
                  onClick={() => fehlerEntfernen(eintrag.id)}
                />
              </header>
              <p className="cl-pfad-text">{eintrag.fehler}</p>
              {eintrag.loesung && (
                <p className="cl-fehlerbuch-loesung">
                  <Icon name="haken" groesse={14} /> {eintrag.loesung}
                </p>
              )}
              <p className="cl-uebung-meta">
                <Icon name="kalender" groesse={14} /> {eintrag.datum}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
