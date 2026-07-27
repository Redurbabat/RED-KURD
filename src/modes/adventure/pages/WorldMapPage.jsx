// Übersicht aller sieben Welten. Jede Kachel zeigt ihre Landschaft, den
// Fortschritt und ihren Zustand — gesperrte Welten bleiben anklickbar.
import { useLernstand } from '../../../core/store.js'
import { Link } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  WELTEN,
  kursFortschritt,
  weltFortschritt,
  weltStatus,
} from '../../../core/courses/courseRepository.js'
import Landscape from '../../../components/adventure/Landscape.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import './WorldMapPage.css'

const STATUS_TEXT = {
  fertig: T.abenteuer.abgeschlossen,
  aktuell: T.abenteuer.aktuell,
  gesperrt: T.abenteuer.gesperrt,
}

const BALKEN_FARBE = {
  fertig: 'green',
  aktuell: 'gold',
  gesperrt: 'primary',
}

function StatusMarke({ status }) {
  if (status === 'fertig') {
    return (
      <Badge ton="gruen" icon="haken">
        {T.abenteuer.abgeschlossen}
      </Badge>
    )
  }
  if (status === 'aktuell') {
    return (
      <Badge ton="gold" icon="stern">
        {T.abenteuer.aktuell}
      </Badge>
    )
  }
  return null
}

export default function WorldMapPage() {
  useLernstand()
  const gesamt = kursFortschritt()

  return (
    <div className="adv-welten">
      <PageHeader
        titel="Deine Welten"
        untertitel="Sieben Landschaften, ein Weg."
        variante="rucksack"
        zurueck="/adventure"
        zurueckText="Zum Abenteuer"
      />

      <div className="adv-pergament adv-welten-gesamt">
        <h2>Dein Weg durch alle Welten</h2>
        <ProgressBar
          wert={gesamt.prozent}
          label={`Gesamtfortschritt: ${gesamt.fertig} von ${gesamt.gesamt} Einheiten geschafft`}
          farbe="gold"
          zeigeWert
        />
        <p>
          {gesamt.fertig} von {gesamt.gesamt} Einheiten geschafft.
        </p>
      </div>

      <ul className="adv-weltraster" role="list">
        {WELTEN.map((welt) => {
          const stand = weltFortschritt(welt.id)
          const status = weltStatus(welt.id)
          const statusText = STATUS_TEXT[status] || T.abenteuer.aktuell
          return (
            <li key={welt.id}>
              <div className={'adv-weltkachel' + (status === 'gesperrt' ? ' gesperrt' : '')}>
                <div className="adv-weltkachel-bild">
                  <Landscape
                    art={welt.landschaft}
                    farbe={welt.farbe}
                    himmel={welt.himmel}
                    className="adv-landschaft-svg"
                  />
                </div>

                <div className="adv-weltkachel-inhalt">
                  <div className="adv-welten-kopf">
                    <h3 lang="de">
                      Welt {welt.nr} · {welt.name}
                    </h3>
                    <StatusMarke status={status} />
                  </div>

                  <p lang="ku">{welt.untertitel}</p>

                  <ProgressBar
                    wert={stand.prozent}
                    label={`Welt ${welt.nr} ${welt.name}: ${stand.prozent} Prozent geschafft`}
                    farbe={BALKEN_FARBE[status] || 'primary'}
                    klein
                  />

                  <ul className="adv-welten-zahlen" role="list">
                    <li>
                      <Icon name="kurs" groesse={16} />
                      <span>
                        {stand.fertig}/{stand.gesamt} Einheiten
                      </span>
                    </li>
                    <li>
                      <Icon name="stern" groesse={16} />
                      <span>
                        {stand.sterne} von {stand.maxSterne} Sternen
                      </span>
                    </li>
                  </ul>

                  {status === 'gesperrt' && (
                    <p className="adv-welten-sperre">
                      <Icon name="schloss" groesse={16} />
                      <span>Öffnet sich, wenn die Hälfte der vorigen Welt geschafft ist</span>
                    </p>
                  )}
                </div>

                <Link to={'/adventure/world/' + welt.id} className="adv-welten-flaeche">
                  <span className="nur-sr">
                    {`Welt ${welt.nr}, ${welt.name} öffnen — ${statusText}, ${stand.fertig} von ${stand.gesamt} Einheiten geschafft, ${stand.sterne} von ${stand.maxSterne} Sternen`}
                  </span>
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="rk-hinweisstreifen adv-welten-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          Gesperrte Welten kannst du trotzdem öffnen und ansehen — die Reihenfolge ist nur ein
          Vorschlag von Hêlo.
        </span>
      </p>
    </div>
  )
}
