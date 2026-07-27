// Lernpfad einer Welt (Designpaket Bild 3): Abschnittskarte, Zickzack-Pfad aus
// Stationen, Hêlo als Wegbegleiter und darunter der Stand dieser Welt.
// Die Lernlogik liegt in courseRepository — hier wird nur dargestellt.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  aktuellerKnoten,
  holeEinheit,
  holeWelt,
  weltFortschritt,
  weltPfad,
} from '../../../core/courses/courseRepository.js'
import { oeffneWeltTruhe, weltTruheDatum } from '../../../core/progress/progressStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './WorldDetailPage.css'

const TRUHE_EDELSTEINE = 5
const TRUHE_AB_EINHEITEN = 2

const KLASSE_JE_STATUS = {
  fertig: 'fertig',
  aktuell: 'aktuell',
  begonnen: '',
  gesperrt: 'gesperrt',
}

const STATUS_TEXT = {
  fertig: T.abenteuer.abgeschlossen,
  aktuell: T.abenteuer.aktuell,
  gesperrt: T.abenteuer.gesperrt,
}

// Nur Lektionen und Prüfungen tragen Sterne; Truhe, Spiel und Abschluss nicht.
const MIT_STERNEN = ['lektion', 'pruefung']
// Truhe und Bonusspiel sind keine Lektionen — sie bekommen die eckige Plakette.
const ECKIG = ['truhe', 'spiel']

const PLAKETTENTEXT = { truhe: 'TRUHE', spiel: 'SPIEL' }

function datumText(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function Sterne({ anzahl }) {
  return (
    <span className="adv-station-sterne" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <Icon key={i} name="stern" groesse={14} className={i <= anzahl ? '' : 'adv-stern-leer'} />
      ))}
    </span>
  )
}

export default function WorldDetailPage({ worldId }) {
  useLernstand()
  // Rückmeldung für Truhe, Abschluss und gesperrte Stationen.
  const [meldung, setMeldung] = useState('')

  const welt = holeWelt(worldId)

  if (!welt) {
    return (
      <EmptyState
        variante="denken"
        titel="Diese Welt kennt Hêlo nicht."
        text="Vielleicht hat sich die Adresse verlaufen. Wähle eine Welt aus der Übersicht."
        aktion={() => navigiere('/adventure/worlds')}
        aktionText="Zu den Welten"
      />
    )
  }

  const pfad = weltPfad(welt.id)
  const stand = weltFortschritt(welt.id)
  const jetzt = aktuellerKnoten(welt.id)

  // Lernziel der Station, an der Hêlo gerade steht — sonst das der ersten Einheit.
  const zielKnoten = jetzt?.einheitId ? jetzt : pfad.find((k) => k.einheitId)
  const einheit = zielKnoten ? holeEinheit(zielKnoten.einheitId) : null
  const lernziel = einheit?.ziel || 'Lerne die Wörter dieser Welt Schritt für Schritt.'

  const truheDatum = weltTruheDatum(welt.id)
  const truheBereit = stand.fertig >= TRUHE_AB_EINHEITEN
  const nochOffen = Math.max(0, stand.gesamt - stand.fertig)

  const truhenStand = truheDatum
    ? `Welt-Truhe am ${datumText(truheDatum)} geöffnet`
    : truheBereit
      ? 'Welt-Truhe ist bereit — tippe im Pfad auf die Truhe'
      : `Welt-Truhe öffnet sich nach ${TRUHE_AB_EINHEITEN} abgeschlossenen Einheiten`

  function knotenGeklickt(knoten) {
    switch (knoten.art) {
      case 'lektion':
      case 'pruefung':
        navigiere('/adventure/lesson/' + knoten.einheitId)
        return
      case 'spiel':
        navigiere('/practice/sentence-builder')
        return
      case 'wiederholen':
        navigiere('/practice/review')
        return
      case 'hoeren':
        navigiere('/practice/listening')
        return
      case 'truhe': {
        if (!truheBereit) {
          setMeldung('Schliesse zwei Einheiten ab, dann öffnet sich die Truhe.')
          return
        }
        const gewinn = oeffneWeltTruhe(welt.id, TRUHE_EDELSTEINE)
        setMeldung(
          gewinn === null
            ? `Diese Truhe ist schon geöffnet — die ${TRUHE_EDELSTEINE} Edelsteine liegen in deinem Beutel.`
            : `Truhe geöffnet: +${gewinn} Edelsteine für deinen Beutel.`
        )
        return
      }
      case 'abschluss':
        setMeldung(
          stand.offen
            ? `Noch ${nochOffen} von ${stand.gesamt} Einheiten bis zum Abschluss dieser Welt.`
            : `Geschafft! Alle ${stand.gesamt} Einheiten dieser Welt sind bestanden.`
        )
        return
      default:
        setMeldung(knoten.untertitel || knoten.name)
    }
  }

  return (
    <div className="wd-seite">
      <h1 className="nur-sr">
        Lernpfad der Welt {welt.nr}: {welt.name}
      </h1>

      <button type="button" className="rk-zurueck" onClick={() => navigiere('/adventure/worlds')}>
        <Icon name="pfeilLinks" groesse={18} />
        <span>Zu den Welten</span>
      </button>

      <section className="adv-abschnitt wd-abschnitt" aria-labelledby="wd-welttitel">
        <span className="adv-abschnitt-marke">
          Welt {welt.nr} · <span lang="ku">{welt.untertitel}</span>
        </span>
        <h2 id="wd-welttitel">{welt.name}</h2>
        <p>Lernziel: {lernziel}</p>
      </section>

      <p className="wd-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          „{T.abenteuer.gesperrt}“ ist nur eine Empfehlung von Hêlo — antippen und ausprobieren
          kannst du jede Station.
        </span>
      </p>

      <div className="wd-pfadflaeche">
        <ol className="adv-pfad wd-pfad">
          {pfad.map((knoten) => {
            const statusText = STATUS_TEXT[knoten.status] || knoten.untertitel
            const zeigtSterne = MIT_STERNEN.includes(knoten.art)
            const sterne = knoten.sterne || 0
            const eckig = ECKIG.includes(knoten.art)
            const beschriftung = zeigtSterne
              ? `${knoten.name} — ${statusText}, ${sterne} von 3 Sternen`
              : `${knoten.name} — ${statusText}`

            return (
              <li key={knoten.id}>
                <button
                  type="button"
                  className={`adv-station ${KLASSE_JE_STATUS[knoten.status] || ''}`}
                  aria-label={beschriftung}
                  onClick={() => knotenGeklickt(knoten)}
                >
                  <span className={eckig ? 'adv-knoten-truhe' : 'adv-knoten'} aria-hidden="true">
                    {knoten.status === 'gesperrt' ? (
                      <Icon name="schloss" groesse={26} />
                    ) : knoten.status === 'fertig' ? (
                      <Icon name="haken" groesse={28} />
                    ) : (
                      <Icon name={knoten.icon} groesse={28} />
                    )}
                    {PLAKETTENTEXT[knoten.art] && (
                      <span className="wd-plakettentext">{PLAKETTENTEXT[knoten.art]}</span>
                    )}
                  </span>

                  <span className="adv-station-name">{knoten.name}</span>
                  <span className="adv-station-status">{statusText}</span>
                  {zeigtSterne && <Sterne anzahl={sterne} />}
                </button>

                {jetzt?.id === knoten.id && (
                  <span className="adv-helo-position">
                    <HeloMascot variante="rucksack" groesse={72} dekorativ />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="wd-meldungbereich" aria-live="polite">
        {meldung && (
          <p className="wd-meldung">
            <Icon name="info" groesse={18} />
            <span>{meldung}</span>
          </p>
        )}
      </div>

      <Card titel="Dein Stand in dieser Welt" icon="berg" className="wd-stand">
        <ProgressBar
          wert={stand.prozent}
          label={`Welt ${welt.nr} ${welt.name}: Fortschritt`}
          farbe="gold"
          zeigeWert
        />
        <ul className="wd-standliste" role="list">
          <li>
            <Icon name="kurs" groesse={16} />
            <span>
              {stand.fertig} von {stand.gesamt} Einheiten
            </span>
          </li>
          <li>
            <Icon name="stern" groesse={16} />
            <span>
              {stand.sterne} von {stand.maxSterne} Sternen
            </span>
          </li>
          <li>
            <Icon name="truhe" groesse={16} />
            <span>{truhenStand}</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
