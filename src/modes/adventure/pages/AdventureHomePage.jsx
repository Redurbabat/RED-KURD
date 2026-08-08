// Startseite des Abenteuer-Modus.
// RED-KURD ist eine spezialisierte App: Deutsch als Ausgangssprache, Kurmancî
// als Zielsprache — deshalb gibt es hier keine Sprachauswahl mehr, sondern
// einen klaren Tagesablauf: Gruss, Tagesplan, ein Knopf zum Loslegen, der
// Lernpfad, eine Kulturkarte und das Newroz-Feuer der Serie.
// Gelesener Text steht immer auf Pergament — Card ist im Abenteuer-Modus
// bereits eine Pergamentfläche. Kopfstatistik und Navigation kommen aus der
// Shell und werden hier nicht wiederholt.
import { useMemo } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { grussText } from '../../../core/texts.js'
import { statistik } from '../../../core/progress/progressSelectors.js'
import { heute } from '../../../core/progress/scheduler.ts'
import {
  aktuelleEinheit,
  aktuelleWelt,
  aktuellerKnoten,
  weltPfad,
} from '../../../core/courses/courseRepository.js'
import { planeSitzung } from '../../../core/session/sessionPlanner.ts'
import { standardDauer } from '../../../core/profile/profileStore.js'
import { kulturkarten } from '../../../data/kultur.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import Landscape from '../../../components/adventure/Landscape.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './AdventureHomePage.css'

// Statuszeichen der Pfadvorschau — der Zustand steht nie nur in der Farbe,
// sondern zusätzlich als Zeichen und als Text für Screenreader.
const STATUS_MARKE = {
  fertig: 'haken',
  aktuell: 'fussspur',
  begonnen: 'fussspur',
  gesperrt: 'schloss',
}

const STATUS_TEXT = {
  fertig: 'abgeschlossen',
  aktuell: 'aktuelle Station',
  begonnen: 'begonnen',
  gesperrt: 'noch gesperrt',
}

/** Ein Satz reicht auf der Startseite — der Rest steht auf der Kulturseite. */
function ersterSatz(text) {
  const roh = String(text || '').trim()
  const ende = roh.indexOf('. ')
  return ende > 0 ? roh.slice(0, ende + 1) : roh
}

/**
 * Die Kulturkarte des Tages wechselt mit dem Kalendertag und ist dabei für
 * alle Aufrufe desselben Tages dieselbe — kein Zufall, der bei jedem Rendern
 * springt.
 */
function kulturDesTages() {
  // Fehlen die Kulturkarten noch, entfällt die Karte einfach.
  if (!kulturkarten?.length) return null
  const zahl = heute()
    .split('-')
    .reduce((summe, teil) => summe + Number(teil), 0)
  return kulturkarten[zahl % kulturkarten.length]
}

/** Einzahl und Mehrzahl sauber trennen. */
function zaehlText(zahl, einzahl, mehrzahl) {
  return zahl === 1 ? einzahl : mehrzahl
}

export default function AdventureHomePage() {
  const stand = useLernstand()

  const welt = aktuelleWelt()
  const einheit = aktuelleEinheit()

  // Tagesplan und Pfadvorschau nur neu berechnen, wenn sich der Lernstand ändert.
  const plan = useMemo(() => (einheit ? planeSitzung(standardDauer()) : null), [einheit, stand])
  const pfad = useMemo(() => (welt ? weltPfad(welt.id).slice(0, 4) : []), [welt, stand])

  if (!welt || !einheit) {
    return (
      <ErrorState
        titel="Dein Abenteuer liess sich nicht laden."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
      />
    )
  }

  const serie = statistik().serie
  const naechste = aktuellerKnoten(welt.id)
  const kultur = kulturDesTages()

  // Nur die Zeilen zeigen, die heute wirklich anstehen.
  const tagesplan = [
    {
      id: 'wiederholen',
      icon: 'wiederholen',
      zahl: plan.wiederholungen,
      text: zaehlText(plan.wiederholungen, 'Wiederholung', 'Wiederholungen'),
    },
    {
      id: 'neu',
      icon: 'buch',
      zahl: plan.neueWoerter,
      text: zaehlText(plan.neueWoerter, 'neues Wort', 'neue Wörter'),
    },
    {
      id: 'hoeren',
      icon: 'kopfhoerer',
      zahl: plan.hoerAufgaben,
      text: zaehlText(plan.hoerAufgaben, 'Hörübung', 'Hörübungen'),
    },
  ].filter((zeile) => zeile.zahl > 0)

  const serieText =
    serie > 0
      ? `${serie} ${zaehlText(serie, 'Tag', 'Tage')} Serie — halte das Feuer am Brennen.`
      : 'Noch keine Serie — heute entzündest du das Feuer zum ersten Mal.'

  return (
    <div className="ah-seite">
      {/* Lernrichtung statt Sprachauswahl: Deutsch zuerst, Kurmancî danach. */}
      <p className="ah-richtung">
        <span lang="de">Deutsch</span>
        <Icon name="pfeilRechts" groesse={22} className="ah-richtung-pfeil" />
        <span lang="ku" className="ah-richtung-ziel">
          Kurmancî
        </span>
      </p>

      {/* Landschaftsband der aktuellen Welt, darauf die Begrüssung auf Pergament */}
      <div className="adv-landschaft ah-band">
        <Landscape
          art={welt.landschaft}
          farbe={welt.farbe}
          himmel={welt.himmel}
          className="adv-landschaft-svg"
        />
        <div className="adv-landschaft-inhalt">
          <Card className="ah-gruss">
            <div className="ah-gruss-text">
              <h1 className="ah-gruss-titel" lang="ku">
                {grussText()}!
              </h1>
              <p className="ah-marke">Heute lernst du:</p>
              <p className="ah-gruss-einheit">{einheit.name}</p>
            </div>
            <HeloMascot variante="winken" groesse={96} className="ah-helo" />
          </Card>
        </div>
      </div>

      {/* Tagesplan */}
      <Card className="ah-plan" aria-labelledby="ah-plan-titel">
        <h2 className="ah-titel" id="ah-plan-titel">
          Dein Tagesplan
        </h2>
        <span className="ah-kelim-linie" aria-hidden="true" />
        <ul className="ah-plan-liste" role="list">
          {tagesplan.map((zeile) => (
            <li key={zeile.id} className="ah-plan-zeile">
              <span className="ah-plan-icon" aria-hidden="true">
                <Icon name={zeile.icon} groesse={20} />
              </span>
              <span className="ah-plan-zahl">{zeile.zahl}</span>
              <span className="ah-plan-text">{zeile.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <PrimaryButton
        art="gruen"
        groesse="gross"
        breit
        icon="flamme"
        className="ah-start"
        onClick={() => navigiere('/adventure/lesson/' + einheit.id)}
      >
        Lernen beginnen
      </PrimaryButton>

      {/* Lernpfad-Vorschau */}
      <Card className="ah-weg" aria-labelledby="ah-weg-titel">
        <h2 className="ah-titel" id="ah-weg-titel">
          Dein Weg
        </h2>
        <p className="ah-weg-ort">
          <Icon name="berg" groesse={16} />
          <span>
            Welt {welt.nr} · {welt.ort}
          </span>
        </p>

        <ul className="ah-punkte" role="list">
          {pfad.map((knoten, i) => (
            <li key={knoten.id} className={'ah-punkt ah-punkt-' + knoten.status}>
              <span className="ah-punkt-raute" aria-hidden="true" />
              <Icon
                name={STATUS_MARKE[knoten.status] || 'fussspur'}
                groesse={16}
                className="ah-punkt-marke"
              />
              <span className="nur-sr">
                Station {i + 1}: {knoten.name} — {STATUS_TEXT[knoten.status] || knoten.status}
              </span>
            </li>
          ))}
        </ul>

        <p className="ah-weg-naechste">
          Nächste Station: {naechste ? naechste.name : 'Alle Stationen dieser Welt sind geschafft'}
        </p>

        <PrimaryButton art="gold" breit icon="welt" onClick={() => navigiere('/adventure/worlds')}>
          Zum Lernpfad
        </PrimaryButton>
      </Card>

      {/* Kultur des Tages — entfällt, solange es keine Kulturkarten gibt. */}
      {kultur && (
        <Card className="ah-kultur" aria-labelledby="ah-kultur-titel">
          <p className="ah-marke">Kultur des Tages</p>
          <h2 className="ah-titel" id="ah-kultur-titel">
            {kultur.titel}
          </h2>
          <p className="ah-kultur-text" lang="de">
            {ersterSatz(kultur.erklaerung)}
          </p>

          <span className="ah-kelim-linie" aria-hidden="true" />

          {/* Deutsch zuerst, Kurmancî darunter */}
          <p className="ah-kultur-de" lang="de">
            {kultur.ausdruck?.de}
          </p>
          <p className="ah-kultur-ku" lang="ku">
            {kultur.ausdruck?.ku}
          </p>

          <PrimaryButton
            art="still"
            breit
            icon="herz"
            onClick={() => navigiere('/adventure/culture')}
          >
            Mehr Kultur
          </PrimaryButton>
        </Card>
      )}

      {/* Serie als Newroz-Feuer */}
      <Card className="ah-serie" aria-label="Deine Serie">
        <HeloMascot variante="fackel" groesse={48} dekorativ className="ah-serie-helo" />
        <p className="ah-serie-text">{serieText}</p>
      </Card>
    </div>
  )
}
