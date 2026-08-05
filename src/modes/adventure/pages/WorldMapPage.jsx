// Weltenübersicht des Abenteuer-Modus (Designpaket Bild 2).
// Jede Kachel zeigt Landschaft, Fortschritt und Zustand — gesperrte Welten
// bleiben anklickbar, die Reihenfolge ist nur eine Empfehlung.
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import { WELTEN, weltFortschritt, weltStatus } from '../../../core/courses/courseRepository.js'
import Landscape from '../../../components/adventure/Landscape.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import './WorldMapPage.css'

// Jede Welt trägt einen eigenen Farbton — wie im Mockup Welt 1 grün, Welt 2
// blau, Welt 3 gold, Welt 4 lila. Ab Welt 6 wiederholt sich die Reihe.
const TOENE = ['green', 'blue', 'gold', 'purple', 'orange']

// Ehrlich zur echten Regel: Einheiten schalten sich der Reihe nach frei,
// eine Welt oeffnet sich also erst mit der letzten Einheit der vorigen Welt.
const SPERRGRUND = 'Öffnet sich, wenn die vorige Welt geschafft ist'

function statusText(status) {
  if (status === 'fertig') return T.abenteuer.abgeschlossen
  if (status === 'gesperrt') return T.abenteuer.gesperrt
  return T.abenteuer.aktuell
}

export default function WorldMapPage() {
  useLernstand()

  return (
    <div className="wm-seite">
      <PageHeader
        titel="Deine Welten"
        untertitel="Jede Welt enthält mehrere Einheiten, Geschichten und Belohnungen."
        ohneMaskottchen
      />

      <h2 className="nur-sr">Alle Welten</h2>

      <ul className="adv-weltraster wm-raster" role="list">
        {WELTEN.map((welt, i) => {
          const stand = weltFortschritt(welt.id)
          const status = weltStatus(welt.id)
          const ton = TOENE[i % TOENE.length]
          const beschriftung =
            `Welt ${welt.nr}, ${welt.name} öffnen. ${statusText(status)}. ` +
            `${stand.fertig} von ${stand.gesamt} Einheiten geschafft, ` +
            `${stand.sterne} von ${stand.maxSterne} Sternen.` +
            (status === 'gesperrt' ? ` ${SPERRGRUND}.` : '')

          return (
            <li key={welt.id}>
              <button
                type="button"
                className={
                  `adv-weltkachel wm-kachel wm-ton-${ton}` +
                  (status === 'gesperrt' ? ' gesperrt' : '')
                }
                aria-label={beschriftung}
                onClick={() => navigiere('/adventure/world/' + welt.id)}
              >
                <span className="adv-weltkachel-bild">
                  <Landscape art={welt.landschaft} farbe={welt.farbe} himmel={welt.himmel} />
                </span>

                <span className="adv-weltkachel-inhalt">
                  <span className="adv-weltkachel-nr">Welt {welt.nr}</span>
                  <h3>{welt.name}</h3>
                  <p lang="ku">{welt.untertitel}</p>

                  <ProgressBar
                    wert={stand.prozent}
                    label={`Welt ${welt.nr} ${welt.name}: Fortschritt`}
                    farbe={ton}
                    klein
                    zeigeWert
                  />

                  <span className="adv-weltkachel-fuss">
                    <span className="wm-zahl">
                      <Icon name="kurs" groesse={14} />
                      <span>
                        {stand.fertig}/{stand.gesamt} Einheiten
                      </span>
                    </span>
                    <span className="wm-zahl">
                      <Icon name="stern" groesse={14} />
                      <span>
                        {stand.sterne}/{stand.maxSterne} Sterne
                      </span>
                    </span>

                    {status === 'fertig' && (
                      <Badge ton="gruen" icon="haken">
                        {T.abenteuer.abgeschlossen}
                      </Badge>
                    )}
                    {status === 'aktuell' && (
                      <Badge ton="gold" icon="stern">
                        {T.abenteuer.aktuell}
                      </Badge>
                    )}
                    {status === 'gesperrt' && (
                      <span className="wm-sperrgrund">
                        <Icon name="schloss" groesse={14} />
                        <span>{SPERRGRUND}</span>
                      </span>
                    )}
                  </span>
                </span>

                <Icon name="pfeilRechts" groesse={20} className="wm-pfeil" />
              </button>
            </li>
          )
        })}
      </ul>

      <p className="wm-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          Gesperrte Welten kannst du trotzdem öffnen und ansehen — die Reihenfolge ist nur ein
          Vorschlag von Hêlo.
        </span>
      </p>
    </div>
  )
}
