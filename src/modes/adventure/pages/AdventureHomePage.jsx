// Startseite des Abenteuer-Modus: Begrüssung, aktuelle Welt, Weg zur nächsten
// Einheit, Tagesaufgaben und Schatztruhe. Der Lernstand ist derselbe wie im
// Modern-Modus — hier wird er nur anders erzählt.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere, Link } from '../../../app/router.jsx'
import { T, grussText } from '../../../core/texts.js'
import { aktuelleEinheit, aktuelleWelt, einheitProzent } from '../../../core/courses/courseRepository.js'
import { level, truheBereit, truheOeffnen } from '../../../core/progress/progressStore.js'
import { holeAufgaben, holeBelohnung } from '../../../core/tasks/taskStore.js'
import Landscape from '../../../components/adventure/Landscape.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import HeloMessage from '../../../components/mascot/HeloMessage.jsx'
import './AdventureHomePage.css'

/** „1 Edelstein“ / „2 Edelsteine“ — Schlüssel bleibt in beiden Fällen gleich. */
function edelsteinText(n) {
  return `${n} ${n === 1 ? 'Edelstein' : 'Edelsteine'}`
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
          +{belohnung.schluessel} Schlüssel
        </Badge>
      ) : null}
    </span>
  )
}

export default function AdventureHomePage() {
  useLernstand()
  const [truhenGewinn, setTruhenGewinn] = useState(null)
  const [aufgabenGewinn, setAufgabenGewinn] = useState(null)

  const einheit = aktuelleEinheit()
  const welt = aktuelleWelt()

  if (!einheit || !welt) {
    return (
      <ErrorState
        titel="Dein Abenteuer liess sich nicht laden."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
      />
    )
  }

  const prozent = einheitProzent(einheit.id)
  const stufe = level()
  const aufgaben = holeAufgaben().taeglich.slice(0, 3)
  const truheOffen = truheBereit()

  function oeffneTruhe() {
    const gewinn = truheOeffnen()
    if (gewinn) setTruhenGewinn(gewinn)
  }

  function holeAufgabenBelohnung(id) {
    const gewinn = holeBelohnung(id)
    if (gewinn) setAufgabenGewinn(gewinn)
  }

  return (
    <div className="adv-start">
      <header className="adv-start-gruss">
        <h1 lang="ku">{grussText()}!</h1>
        <HeloMessage
          variante="winken"
          text="Kurmancî lernen macht jeden Tag ein Stück reicher."
        />
      </header>

      <div className="adv-landschaft">
        <Landscape
          art={welt.landschaft}
          farbe={welt.farbe}
          himmel={welt.himmel}
          className="adv-landschaft-svg"
        />
        <div className="adv-landschaft-inhalt">
          <div className="adv-dunkelkarte adv-start-weltschild">
            <span className="adv-held-etikett">Welt {welt.nr} von 7</span>
            <h2 lang="de">{welt.name}</h2>
            <p lang="ku">{welt.untertitel}</p>
          </div>
        </div>
      </div>

      <div className="adv-start-level">
        <Icon name="krone" groesse={22} />
        <div className="adv-start-level-text">
          <span>
            Level {stufe.stufe} · noch {stufe.bisNaechstes} XP bis Level {stufe.stufe + 1}
          </span>
          <ProgressBar
            wert={stufe.fortschritt}
            max={100}
            label={`Level ${stufe.stufe}: ${stufe.fortschritt} von 100 XP bis Level ${stufe.stufe + 1}`}
            farbe="gold"
            klein
          />
        </div>
      </div>

      <section className="rk-abschnitt" aria-labelledby="adv-start-abenteuer">
        <h2 className="rk-abschnitt-titel" id="adv-start-abenteuer">
          {T.abenteuer.titel}
        </h2>

        <div className="adv-held">
          <HeloMascot variante="rucksack" groesse={64} dekorativ />
          <div className="adv-held-text">
            <span className="adv-held-etikett">{T.abenteuer.fortsetzen}</span>
            <h3>{einheit.name}</h3>
            <ProgressBar
              wert={prozent}
              label={`Fortschritt in der Einheit ${einheit.name}: ${prozent} Prozent`}
              farbe="gold"
              klein
            />
            <p className="adv-start-held-stand">
              Einheit {einheit.nr} · {prozent} % geschafft
            </p>
          </div>
          <PrimaryButton
            art="gold"
            icon="play"
            onClick={() => navigiere('/adventure/lesson/' + einheit.id)}
            aria-label={`${T.abenteuer.weitergehen} in der Einheit ${einheit.name}`}
          >
            {T.abenteuer.weitergehen}
          </PrimaryButton>
        </div>
      </section>

      <Card titel={T.abenteuer.tagesaufgaben} icon="aufgaben">
        <ul className="adv-start-aufgaben" role="list">
          {aufgaben.map((a) => (
            <li key={a.id} className={'adv-aufgabe' + (a.geschafft ? ' geschafft' : '')}>
              <Icon name={a.icon} groesse={22} />
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
                {a.stand}/{a.ziel}
              </span>
              {a.geschafft && !a.abgeholt && (
                <PrimaryButton
                  art="gold"
                  groesse="klein"
                  icon="edelstein"
                  onClick={() => holeAufgabenBelohnung(a.id)}
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
            </li>
          ))}
        </ul>

        <div aria-live="polite">
          {aufgabenGewinn && (
            <p className="adv-start-gewinn">
              <Icon name="haken" groesse={18} />
              <span>
                Belohnung erhalten: +{aufgabenGewinn.xp || 0} XP
                {aufgabenGewinn.edelsteine ? ` · +${edelsteinText(aufgabenGewinn.edelsteine)}` : ''}
                {aufgabenGewinn.schluessel ? ` · +${aufgabenGewinn.schluessel} Schlüssel` : ''}
              </span>
            </p>
          )}
        </div>

        <p>
          <Link to="/adventure/tasks" className="adv-start-link">
            <span>Alle Aufgaben</span>
            <Icon name="pfeilRechts" groesse={18} />
          </Link>
        </p>
      </Card>

      <section className="rk-abschnitt" aria-labelledby="adv-start-truhe">
        <h2 className="rk-abschnitt-titel" id="adv-start-truhe">
          {T.abenteuer.truhe}
        </h2>

        <div className="adv-truhe">
          <HeloMascot variante="truhe" groesse={64} dekorativ />
          <div className="adv-truhe-text">
            {truheOffen ? (
              <>
                <strong>Eine Truhe wartet auf dich.</strong>
                <p>Jeden Tag steht eine neue Truhe am Weg — heute ist sie noch verschlossen.</p>
              </>
            ) : (
              <>
                <strong>Truhe geöffnet</strong>
                <p>Heute schon geöffnet — morgen wartet eine neue Truhe.</p>
              </>
            )}
            <div aria-live="polite">
              {truhenGewinn && (
                <p className="adv-start-gewinn">
                  <Icon name="stern" groesse={18} />
                  <span>
                    +{truhenGewinn.xp} XP · +{edelsteinText(truhenGewinn.edelsteine)}
                    {truhenGewinn.schluessel ? ` · +${truhenGewinn.schluessel} Schlüssel` : ''}
                  </span>
                </p>
              )}
            </div>
          </div>
          {truheOffen && (
            <PrimaryButton art="gold" icon="truhe" onClick={oeffneTruhe}>
              {T.abenteuer.truheOeffnen}
            </PrimaryButton>
          )}
        </div>
      </section>

      <PrimaryButton
        art="gold"
        groesse="gross"
        breit
        icon="welt"
        className="adv-start-haupt"
        onClick={() => navigiere('/adventure/world')}
      >
        {T.abenteuer.start}
      </PrimaryButton>
    </div>
  )
}
