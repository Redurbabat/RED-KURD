// Aufgabenseite des Abenteuer-Modus: Tages- und Wochenziele mit Belohnung.
// Der Stand kommt direkt aus dem Lernstand — hier wird nichts zusätzlich gezählt.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { T } from '../../../core/texts.js'
import { holeAufgaben, holeBelohnung, offeneBelohnungen } from '../../../core/tasks/taskStore.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import './DailyTasksPage.css'

function edelsteinText(n) {
  return `${n} ${n === 1 ? 'Edelstein' : 'Edelsteine'}`
}

function schluesselText(n) {
  return `${n} ${n === 1 ? 'Schlüssel' : 'Schlüssel'}`
}

/** „a“, „a und b“, „a, b und c“ */
function verbinde(teile) {
  if (teile.length < 2) return teile.join('')
  return teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1]
}

function belohnungText(belohnung) {
  const teile = []
  if (belohnung.xp) teile.push(`+${belohnung.xp} XP`)
  if (belohnung.edelsteine) teile.push(`+${edelsteinText(belohnung.edelsteine)}`)
  if (belohnung.schluessel) teile.push(`+${schluesselText(belohnung.schluessel)}`)
  if (!teile.length) return 'Belohnung erhalten'
  return verbinde(teile) + ' erhalten'
}

function BelohnungsChips({ belohnung }) {
  if (!belohnung) return null
  return (
    <span className="adv-belohnungszeile">
      {belohnung.xp ? (
        <Badge ton="gold" icon="stern">
          +{belohnung.xp} XP
        </Badge>
      ) : null}
      {belohnung.edelsteine ? (
        <Badge ton="teal" icon="edelstein">
          +{edelsteinText(belohnung.edelsteine)}
        </Badge>
      ) : null}
      {belohnung.schluessel ? (
        <Badge ton="lila" icon="schluessel">
          +{schluesselText(belohnung.schluessel)}
        </Badge>
      ) : null}
    </span>
  )
}

function Aufgabenliste({ aufgaben, abholen }) {
  return (
    <ul className="dt-liste" role="list">
      {aufgaben.map((a) => (
        <li key={a.id} className={'adv-aufgabe dt-aufgabe' + (a.geschafft ? ' geschafft' : '')}>
          <Icon name={a.icon} groesse={24} />

          <div className="adv-aufgabe-text">
            <strong>{a.name}</strong>
            <ProgressBar
              wert={a.stand}
              max={a.ziel}
              label={`${a.name}: ${a.stand} von ${a.ziel}`}
              farbe={a.geschafft ? 'gold' : 'green'}
              klein
            />
            <BelohnungsChips belohnung={a.belohnung} />
          </div>

          <span className="adv-aufgabe-stand">
            {a.stand} / {a.ziel}
          </span>

          <div className="dt-aktion">
            {a.geschafft && !a.abgeholt && (
              <PrimaryButton
                art="gold"
                groesse="klein"
                icon="edelstein"
                onClick={() => abholen(a.id)}
                aria-label={`${T.abenteuer.belohnungHolen} für „${a.name}“`}
              >
                {T.abenteuer.belohnungHolen}
              </PrimaryButton>
            )}
            {a.abgeholt && (
              <Badge ton="gruen" icon="haken">
                {T.abenteuer.abgeholt}
              </Badge>
            )}
            {!a.geschafft && (
              <span className="dt-offen">
                <Icon name="uhr" groesse={16} />
                <span>Noch nicht geschafft</span>
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function DailyTasksPage() {
  useLernstand()
  const [gewinn, setGewinn] = useState(null)

  const { taeglich, woechentlich } = holeAufgaben()
  const heuteGeschafft = taeglich.filter((a) => a.geschafft).length
  const wocheGeschafft = woechentlich.filter((a) => a.geschafft).length
  const offen = offeneBelohnungen()

  function abholen(id) {
    const belohnung = holeBelohnung(id)
    if (belohnung) setGewinn(belohnungText(belohnung))
  }

  return (
    <div className="dt-seite">
      <PageHeader
        titel="Aufgaben"
        untertitel="Tägliche und wöchentliche Ziele."
        variante="buch"
      />

      <div className="adv-pergament dt-uebersicht">
        <h2>Dein Stand</h2>
        <ProgressBar
          wert={heuteGeschafft}
          max={Math.max(1, taeglich.length)}
          label={`Heutige Aufgaben: ${heuteGeschafft} von ${taeglich.length} geschafft`}
          farbe="gold"
        />
        <ul className="dt-zahlen" role="list">
          <li>
            <Icon name="haken" groesse={16} />
            <span>
              {heuteGeschafft} von {taeglich.length} Tagesaufgaben geschafft
            </span>
          </li>
          <li>
            <Icon name="kalender" groesse={16} />
            <span>
              {wocheGeschafft} von {woechentlich.length} Wochenaufgaben geschafft
            </span>
          </li>
          <li>
            <Icon name="edelstein" groesse={16} />
            <span>
              {offen === 0
                ? 'Keine offene Belohnung'
                : `${offen} ${offen === 1 ? 'Belohnung wartet' : 'Belohnungen warten'} auf dich`}
            </span>
          </li>
        </ul>
      </div>

      <div className="dt-meldung" aria-live="polite">
        {gewinn && (
          <p className="dt-gewinn">
            <Icon name="haken" groesse={18} />
            <span>{gewinn}</span>
          </p>
        )}
      </div>

      <section className="rk-abschnitt" aria-labelledby="dt-taeglich">
        <h2 className="rk-abschnitt-titel" id="dt-taeglich">
          {T.abenteuer.tagesaufgaben}
        </h2>
        {taeglich.length ? (
          <Aufgabenliste aufgaben={taeglich} abholen={abholen} />
        ) : (
          <EmptyState
            variante="denken"
            titel="Heute gibt es keine Aufgaben."
            text="Schau morgen wieder vorbei — dann wartet eine neue Reihe auf dich."
          />
        )}
      </section>

      <section className="rk-abschnitt" aria-labelledby="dt-woechentlich">
        <h2 className="rk-abschnitt-titel" id="dt-woechentlich">
          {T.abenteuer.wochenaufgaben}
        </h2>
        {woechentlich.length ? (
          <Aufgabenliste aufgaben={woechentlich} abholen={abholen} />
        ) : (
          <EmptyState
            variante="denken"
            titel="Diese Woche gibt es keine Aufgaben."
            text="Ab Montag wartet wieder eine neue Reihe auf dich."
          />
        )}
      </section>

      <p className="rk-hinweisstreifen dt-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          Tagesaufgaben werden jede Nacht zurückgesetzt, Wochenaufgaben jeden Montag. Hole deine
          Belohnung, bevor der Zeitraum endet.
        </span>
      </p>
    </div>
  )
}
