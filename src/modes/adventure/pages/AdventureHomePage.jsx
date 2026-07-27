// Startseite des Abenteuer-Modus: Kursauswahl, Kursstand, kurze Trainings und
// eine Vorschau des aktuellen Lernpfads. Der Lernstand ist derselbe wie im
// Modern-Modus — hier wird er nur anders erzählt.
// Die Kopfstatistik (Serie, XP, Edelsteine, Energie) kommt aus der Shell.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  aktuelleWelt,
  aktuellerKnoten,
  kursFortschritt,
  weltFortschritt,
  weltPfad,
} from '../../../core/courses/courseRepository.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import './AdventureHomePage.css'

// Kurmancî ist der einzige fertige Kurs — die anderen sind ehrlich als „bald"
// gekennzeichnet und führen nirgendwohin.
const KURSE = [
  { id: 'ku', kuerzel: 'KU', name: 'Kurmancî', aktiv: true },
  { id: 'so', kuerzel: 'SO', name: 'Soranî' },
  { id: 'zz', kuerzel: 'ZZ', name: 'Zazakî' },
  { id: 'en', kuerzel: 'EN', name: 'Englisch' },
]

const TRAININGS = [
  { id: 'lesen', name: 'Lesen', icon: 'buch', ton: 'lila', ziel: '/explore/reading' },
  { id: 'aussprache', name: 'Aussprache', icon: 'mikrofon', ton: 'blau', ziel: '/practice/speaking' },
  { id: 'satzbau', name: 'Satzbau', icon: 'puzzle', ton: 'teal', ziel: '/practice/sentence-builder' },
]

const STATUS_TEXT = {
  fertig: 'abgeschlossen',
  aktuell: 'aktuelle Station',
  begonnen: 'begonnen',
  gesperrt: 'noch gesperrt — vorherige Station zuerst abschliessen',
}

/** Statuszeichen der Vorschau — Farbe allein sagt nie etwas aus. */
function markeVon(status) {
  if (status === 'fertig') return 'haken'
  if (status === 'gesperrt') return 'schloss'
  return 'fussspur'
}

export default function AdventureHomePage() {
  useLernstand()
  const [hinweis, setHinweis] = useState('')

  const welt = aktuelleWelt()
  const kurs = kursFortschritt()

  if (!welt) {
    return (
      <ErrorState
        titel="Dein Abenteuer liess sich nicht laden."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
      />
    )
  }

  const stand = weltFortschritt(welt.id)
  const vorschau = weltPfad(welt.id).slice(0, 4)
  const naechste = aktuellerKnoten(welt.id)
  const offen = Math.max(0, stand.gesamt - stand.fertig)

  const rangText =
    offen === 0
      ? 'Höchster Rang erreicht — alle Einheiten dieser Welt sind geschafft.'
      : `Noch ${offen} ${offen === 1 ? 'Einheit' : 'Einheiten'} bis zum nächsten Rang.`

  function waehleKurs(kursEintrag) {
    if (kursEintrag.aktiv) {
      navigiere('/adventure/worlds')
      return
    }
    setHinweis(`${kursEintrag.name} kommt später — bleib bei Kurmancî.`)
  }

  return (
    <div className="ah-seite">
      <header className="ah-kopf">
        <h1>Deine Kurse</h1>
        <p className="ah-kopf-unter">
          Wähle eine Sprache oder setze deinen aktuellen Kurs fort.
        </p>
      </header>

      <ul className="ah-kursreihe scroll-x" role="list">
        {KURSE.map((k) => (
          <li key={k.id} className="ah-kurs-zelle">
            <button
              type="button"
              className={'ah-kurs' + (k.aktiv ? ' ah-kurs-aktiv' : '')}
              aria-current={k.aktiv ? 'true' : undefined}
              onClick={() => waehleKurs(k)}
            >
              <span className="ah-kurs-kachel" aria-hidden="true">
                {k.kuerzel}
              </span>
              <span className="ah-kurs-name" lang={k.id === 'en' ? 'de' : 'ku'}>
                {k.name}
              </span>
              {k.aktiv ? (
                <span className="ah-kurs-stand">
                  <Icon name="haken" groesse={14} />
                  Aktiv
                </span>
              ) : (
                <Badge ton="neutral">
                  bald
                  <span className="nur-sr"> — noch nicht verfügbar</span>
                </Badge>
              )}
            </button>
          </li>
        ))}
      </ul>

      <p className="ah-hinweis" role="status" aria-live="polite">
        {hinweis}
      </p>

      <Card className="ah-score">
        <div className="ah-score-kopf">
          <h2 className="ah-score-titel">
            <span lang="ku">Kurmancî</span>-Score
          </h2>
          <span className="ah-score-zahl">
            {kurs.fertig} / {kurs.gesamt}
          </span>
        </div>
        <ProgressBar
          wert={kurs.fertig}
          max={kurs.gesamt}
          label={`Kurmancî-Kurs: ${kurs.fertig} von ${kurs.gesamt} Einheiten geschafft`}
          farbe="green"
        />
        <p className="ah-score-hinweis">{rangText}</p>
      </Card>

      <section className="rk-abschnitt" aria-labelledby="ah-neu-titel">
        <h2 className="rk-abschnitt-titel" id="ah-neu-titel">
          Neue Kurse
        </h2>
        <ul className="ah-neu-raster" role="list">
          {TRAININGS.map((t) => (
            <li key={t.id}>
              <button type="button" className="ah-neu-kachel" onClick={() => navigiere(t.ziel)}>
                <span className={'ah-neu-icon ah-neu-icon-' + t.ton}>
                  <Icon name={t.icon} groesse={26} />
                </span>
                <span className="ah-neu-name">{t.name}</span>
                <span className="ah-neu-unter">Neues Training</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Card className="ah-pfadkarte">
        <h2 className="ah-pfad-titel">Aktueller Lernpfad</h2>
        <p className="ah-pfad-welt">
          Welt {welt.nr} · {welt.name}
        </p>

        <ul className="ah-pfad-vorschau" role="list">
          {vorschau.map((k, i) => (
            <li key={k.id} className={'ah-pfad-punkt ah-pfad-' + k.status}>
              <span className="ah-pfad-kreis" aria-hidden="true">
                {i + 1}
              </span>
              <Icon name={markeVon(k.status)} groesse={14} className="ah-pfad-marke" />
              <span className="nur-sr">
                Station {i + 1}: {k.name} — {STATUS_TEXT[k.status] || k.status}
              </span>
            </li>
          ))}
        </ul>

        <p className="ah-pfad-naechste">
          Nächste Station: {naechste ? naechste.name : 'Alle Stationen geschafft'}
        </p>

        <PrimaryButton
          art="blau"
          breit
          icon="welt"
          onClick={() => navigiere('/adventure/world/' + welt.id)}
        >
          Welt {welt.nr} öffnen
        </PrimaryButton>
      </Card>

      <PrimaryButton
        art="gruen"
        groesse="gross"
        breit
        className="ah-haupt"
        onClick={() => navigiere('/adventure/worlds')}
      >
        {T.abenteuer.start}
      </PrimaryButton>
    </div>
  )
}
