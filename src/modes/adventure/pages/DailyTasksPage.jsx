// Aufgabenseite des Abenteuer-Modus (Designpaket Bild 9): Tagesfortschritt,
// Tages- und Wochenaufgaben, Tagestruhe. Hier wird nichts zusätzlich gezählt —
// alle Stände kommen aus dem einen gemeinsamen Lernstand.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { T } from '../../../core/texts.js'
import { statistik } from '../../../core/progress/progressSelectors.ts'
import { truheBereit, truheOeffnen } from '../../../core/progress/progressStore.js'
import { holeAufgaben, holeBelohnung } from '../../../core/tasks/taskStore.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import './DailyTasksPage.css'

// Kurzer Titel und eine Erklärung je Aufgabe. Die Aufgaben selbst kommen aus
// dem Lernstand — fehlt ein Eintrag, wird einfach der Name von dort gezeigt.
const AUFGABEN_TEXT = {
  't-wdh': { titel: 'Wiederholungen', text: 'Übe 10 Wörter erneut.' },
  't-hoeren': { titel: 'Hörübung', text: 'Beantworte 5 Hörfragen.' },
  't-einheit': { titel: 'Lektion abschließen', text: 'Beende eine Lektion.' },
  't-serie': { titel: 'Antwortfolge', text: 'Gib 3 richtige Antworten hintereinander.' },
  'w-100': { titel: 'Wochenpensum', text: 'Wiederhole 100 Wörter in dieser Woche.' },
  'w-zeit': { titel: 'Lernzeit', text: 'Sammle 60 Minuten Lernzeit.' },
  'w-einheiten': { titel: 'Drei Einheiten', text: 'Schließe 3 Einheiten ab.' },
}

// Farbtabelle der runden Plaketten — grün, orange, lila im Wechsel.
const MARKEN_TOENE = ['gruen', 'orange', 'lila']

// Feste Reihe der Tagestruhe (siehe truheOeffnen im Lernstand). Sie dient hier
// nur der Vorschau — ausgezahlt wird ausschliesslich vom Lernstand.
const TRUHEN_STUFEN = [
  { xp: 10, edelsteine: 1, schluessel: 0 },
  { xp: 15, edelsteine: 1, schluessel: 0 },
  { xp: 20, edelsteine: 1, schluessel: 0 },
  { xp: 25, edelsteine: 2, schluessel: 0 },
  { xp: 30, edelsteine: 2, schluessel: 1 },
]

function edelsteinText(n) {
  return `${n} ${n === 1 ? 'Edelstein' : 'Edelsteine'}`
}

/** „+20 XP · +1 Edelstein" */
function belohnungText(belohnung) {
  if (!belohnung) return ''
  const teile = []
  if (belohnung.xp) teile.push(`+${belohnung.xp} XP`)
  if (belohnung.edelsteine) teile.push(`+${edelsteinText(belohnung.edelsteine)}`)
  if (belohnung.schluessel) teile.push(`+${belohnung.schluessel} Schlüssel`)
  return teile.join(' · ')
}

function textVon(aufgabe) {
  return (
    AUFGABEN_TEXT[aufgabe.id] || {
      titel: aufgabe.name,
      text: `Ziel: ${aufgabe.ziel}`,
    }
  )
}

function Aufgabenliste({ aufgaben, abholen }) {
  return (
    <ul className="dq-liste" role="list">
      {aufgaben.map((a, i) => {
        const ton = MARKEN_TOENE[i % MARKEN_TOENE.length]
        const { titel, text } = textVon(a)
        const lohn = belohnungText(a.belohnung)

        return (
          <li
            key={a.id}
            className={`adv-aufgabe dq-aufgabe dq-ton-${ton}` + (a.geschafft ? ' geschafft' : '')}
          >
            <span className="adv-aufgabe-marke dq-marke">
              <Icon name={a.icon} groesse={22} />
            </span>

            <div className="adv-aufgabe-text dq-text">
              <strong>{titel}</strong>
              <p className="dq-erklaerung">{text}</p>
              {lohn && <p className="dq-lohn">Belohnung: {lohn}</p>}
            </div>

            <span className="adv-aufgabe-stand">
              {a.stand} / {a.ziel}
            </span>

            <div className="dq-balken">
              <ProgressBar
                wert={a.stand}
                max={a.ziel}
                label={`${titel}: ${a.stand} von ${a.ziel} geschafft`}
                farbe={a.geschafft ? 'green' : 'gold'}
                klein
              />
            </div>

            {a.geschafft && (
              <div className="dq-aktion">
                {a.abgeholt ? (
                  <Badge ton="gruen" icon="haken">
                    {T.abenteuer.abgeholt}
                  </Badge>
                ) : (
                  <PrimaryButton
                    art="gold"
                    groesse="klein"
                    icon="edelstein"
                    onClick={() => abholen(a.id)}
                    aria-label={`${T.abenteuer.belohnungHolen} für „${titel}“: ${lohn}`}
                  >
                    {T.abenteuer.belohnungHolen}
                  </PrimaryButton>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default function DailyTasksPage() {
  useLernstand()
  const [meldung, setMeldung] = useState('')

  const s = statistik()
  const { taeglich, woechentlich } = holeAufgaben()
  const heuteGeschafft = taeglich.filter((a) => a.geschafft).length
  const wocheGeschafft = woechentlich.filter((a) => a.geschafft).length
  const offenHeute = Math.max(0, taeglich.length - heuteGeschafft)

  const truheOffen = truheBereit()
  const vorschau = TRUHEN_STUFEN[s.serie % TRUHEN_STUFEN.length]

  function abholen(id) {
    const belohnung = holeBelohnung(id)
    setMeldung(
      belohnung
        ? `Belohnung geholt: ${belohnungText(belohnung)}.`
        : 'Diese Belohnung ist schon abgeholt.'
    )
  }

  function oeffneTruhe() {
    const gewinn = truheOeffnen()
    setMeldung(
      gewinn
        ? `Tagestruhe geöffnet: ${belohnungText(gewinn)}.`
        : 'Die Tagestruhe ist heute schon geöffnet.'
    )
  }

  return (
    <div className="dq-seite">
      <PageHeader
        titel="Heutige Aufgaben"
        untertitel="Erledige deine Missionen und öffne die Tagestruhe."
        ohneMaskottchen
      />

      <Card className="dq-fortschritt">
        <h2 className="dq-fortschritt-titel">Tagesfortschritt</h2>
        <ProgressBar
          wert={heuteGeschafft}
          max={Math.max(1, taeglich.length)}
          label={`Tagesfortschritt: ${heuteGeschafft} von ${taeglich.length} Aufgaben geschafft`}
          zeigeWert
        />
      </Card>

      <div className="dq-meldung" aria-live="polite">
        {meldung && (
          <p className="dq-meldung-text">
            <Icon name="haken" groesse={18} />
            <span>{meldung}</span>
          </p>
        )}
      </div>

      <section className="rk-abschnitt" aria-labelledby="dq-taeglich-titel">
        <h2 className="rk-abschnitt-titel" id="dq-taeglich-titel">
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

      <section className="rk-abschnitt" aria-labelledby="dq-woche-titel">
        <h2 className="rk-abschnitt-titel" id="dq-woche-titel">
          {T.abenteuer.wochenaufgaben}
        </h2>
        <p className="dq-wochenstand">
          {wocheGeschafft} von {woechentlich.length} Wochenaufgaben geschafft.
        </p>
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

      <section className="rk-abschnitt" aria-labelledby="dq-truhe-titel">
        <div className="adv-truhe dq-truhe">
          <span className="dq-truhe-marke">
            <Icon name="truhe" groesse={30} />
          </span>

          <div className="adv-truhe-text">
            <h2 className="dq-truhe-titel" id="dq-truhe-titel">
              Tagestruhe
            </h2>
            <p className="dq-truhe-lohn">{belohnungText(vorschau)}</p>
            <p className="dq-truhe-hinweis">
              {!truheOffen
                ? 'Heute schon geöffnet. Morgen liegt die nächste Truhe für dich bereit.'
                : offenHeute > 0
                  ? `Noch ${offenHeute} ${offenHeute === 1 ? 'Aufgabe' : 'Aufgaben'} bis zur Belohnung.`
                  : 'Alle Tagesaufgaben geschafft — die Truhe wartet auf dich.'}
            </p>
          </div>

          {truheOffen && (
            <PrimaryButton
              art="gold"
              icon="truhe"
              disabled={offenHeute > 0}
              onClick={oeffneTruhe}
              aria-label={
                offenHeute > 0
                  ? `${T.abenteuer.truheOeffnen} — erst nach ${offenHeute} weiteren Aufgaben möglich`
                  : `${T.abenteuer.truheOeffnen}: ${belohnungText(vorschau)}`
              }
            >
              {T.abenteuer.truheOeffnen}
            </PrimaryButton>
          )}
        </div>
      </section>

      <p className="dq-fussnote">
        Tagesaufgaben werden jede Nacht zurückgesetzt, Wochenaufgaben jeden Montag. Hole deine
        Belohnung, bevor der Zeitraum endet.
      </p>
    </div>
  )
}
