// Einheitendetail: Lernziel, wichtige Wörter und die drei Lernschritte.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import {
  BESTANDEN_AB,
  einheitProzent,
  einheitSterne,
  einheitStatus,
  holeEinheit,
} from '../../../core/courses/courseRepository.js'
import { kennstWort, merkeWort } from '../../../core/progress/progressStore.js'
import { spieleWort } from '../../../core/audio/audioService.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Card from '../../../components/common/Card.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import { T } from '../../../core/texts.js'
import './UnitPage.css'

const STATUS_TEXT = {
  fertig: `Abgeschlossen — du hast mindestens ${BESTANDEN_AB} % erreicht.`,
  aktuell: 'Empfohlen — hier geht es für dich weiter.',
  begonnen: `Begonnen — ab ${BESTANDEN_AB} % gilt die Einheit als bestanden.`,
  gesperrt: 'Später empfohlen — du kannst sie aber jetzt schon lernen.',
}

const SCHRITT_TOENE = ['rk-ton-teal', 'rk-ton-blau', 'rk-ton-gold']

function Sterne({ anzahl }) {
  return (
    <span className="unit-sterne" role="img" aria-label={`${anzahl} von 3 Sternen`}>
      {[1, 2, 3].map((i) => (
        <Icon key={i} name="stern" groesse={18} className={i <= anzahl ? 'stern-voll' : 'stern-leer'} />
      ))}
    </span>
  )
}

export default function UnitPage({ unitId }) {
  useLernstand()
  // Merkt sich, fuer welche Einheit gerade gemerkt wurde — so steht der Hinweis
  // nach einem Wechsel der Einheit nicht faelschlich noch da.
  const [gemerktFuer, setGemerktFuer] = useState(null)

  const einheit = holeEinheit(unitId)

  if (!einheit) {
    return (
      <>
        <PageHeader
          titel="Einheit nicht gefunden"
          untertitel="Diese Adresse gehört zu keiner Einheit."
          variante="denken"
          zurueck="/course"
        />
        <EmptyState
          titel="Diese Einheit kennen wir nicht."
          text={`Zur Kennung „${unitId}“ gibt es keine Einheit. Vielleicht hat sich ein Tippfehler in die Adresse geschlichen.`}
          variante="denken"
          aktion={() => navigiere('/course')}
          aktionText="Zurück zum Kurs"
        />
      </>
    )
  }

  const prozent = einheitProzent(einheit.id)
  const sterne = einheitSterne(einheit.id)
  const status = einheitStatus(einheit.id)
  const ersteLektion = einheit.lektionen[0]
  const alleGemerkt = einheit.woerter.every((w) => kennstWort(w.de, w.ku))
  const zeigeGemerkt = gemerktFuer === einheit.id || alleGemerkt

  function merkeEinheit() {
    einheit.woerter.forEach((w) => merkeWort(w.de, w.ku))
    setGemerktFuer(einheit.id)
  }

  return (
    <>
      <PageHeader
        titel={
          <>
            <span aria-hidden="true">{einheit.symbol}</span> {einheit.name}
          </>
        }
        untertitel={einheit.ziel}
        variante="buch"
        zurueck="/course"
        zurueckText="Zum Kurs"
      />

      <section className="rk-abschnitt" aria-labelledby="unit-ueberblick-titel">
        <h2 className="rk-abschnitt-titel" id="unit-ueberblick-titel">
          Überblick
        </h2>

        <Card titel="Dein Stand" icon="blitz" aktion={<Sterne anzahl={sterne} />}>
          <div className="stapel-eng">
            <ProgressBar
              wert={prozent}
              label={`Fortschritt in der Einheit ${einheit.name}: ${prozent} Prozent`}
              farbe={prozent >= BESTANDEN_AB ? 'green' : 'primary'}
              zeigeWert
            />
            <p className="gedaempft">{STATUS_TEXT[status]}</p>
          </div>
        </Card>

        <Card titel={T.kurs.lernziel} icon="kompass">
          <p>{einheit.ziel}</p>
        </Card>

        <Card titel={T.kurs.wichtigeWoerter} icon="buch">
          <ul className="rk-wortliste" role="list">
            {einheit.woerter.slice(0, 6).map((w) => (
              <li key={w.ku + '|' + w.de} className="unit-wortzeile">
                <button
                  type="button"
                  className="rk-wortchip"
                  onClick={() => spieleWort(w.ku)}
                  aria-label={`${w.ku} anhören`}
                >
                  <span lang="ku">{w.ku}</span>
                  <Icon name="lautsprecher" groesse={16} />
                </button>
                <span lang="de" className="unit-wort-de">
                  {w.de}
                </span>
              </li>
            ))}
          </ul>
          <p className="gedaempft unit-wort-hinweis">
            {einheit.woerter.length} Wörter gehören zu dieser Einheit. Tippe ein Wort an, um es zu
            hören.
          </p>
        </Card>
      </section>

      <section className="rk-abschnitt" aria-labelledby="unit-schritte-titel">
        <h2 className="rk-abschnitt-titel" id="unit-schritte-titel">
          Die drei Schritte
        </h2>

        <button
          type="button"
          className="rk-startkarte rk-startkarte-teal"
          onClick={() => navigiere(`/course/${einheit.id}/lesson/${ersteLektion.id}`)}
        >
          <Icon name="play" groesse={28} />
          <span className="rk-startkarte-text">
            <strong>{T.kurs.losGehts}</strong>
            <small>{T.kurs.ersterSchritt}</small>
          </span>
          <Icon name="pfeilRechts" groesse={22} />
        </button>

        <ul className="unit-schritte" role="list">
          {einheit.lektionen.map((lektion, i) => (
            <li key={lektion.id} className="unit-schritt">
              <span className={`unit-schritt-icon ${SCHRITT_TOENE[i % SCHRITT_TOENE.length]}`}>
                <Icon name={lektion.icon} groesse={22} />
              </span>
              <div className="unit-schritt-text">
                <h3 className="unit-schritt-name">
                  Schritt {lektion.nr}: {lektion.name}
                </h3>
                <p className="unit-schritt-beschreibung">{lektion.beschreibung}</p>
                <div className="unit-schritt-meta">
                  <Badge icon="uhr">{lektion.dauer}</Badge>
                  <Badge ton="blau">{lektion.anzahl} Aufgaben</Badge>
                  {lektion.pruefung && (
                    <Badge ton="gold" icon="haken">
                      ab {BESTANDEN_AB} % geschafft
                    </Badge>
                  )}
                </div>
                <PrimaryButton
                  groesse="klein"
                  art={lektion.pruefung ? 'gold' : 'primaer'}
                  icon="play"
                  aria-label={`Schritt ${lektion.nr}, ${lektion.name}, starten`}
                  onClick={() => navigiere(`/course/${einheit.id}/lesson/${lektion.id}`)}
                >
                  {T.kurs.starten}
                </PrimaryButton>
              </div>
            </li>
          ))}
        </ul>

        <div className="unit-merken">
          {zeigeGemerkt ? (
            <p className="unit-gemerkt" role="status">
              <Icon name="haken" groesse={18} />
              <span>
                {T.kurs.gemerkt} — alle {einheit.woerter.length} Wörter liegen im Wiederholsystem.
              </span>
            </p>
          ) : (
            <PrimaryButton art="still" icon="plus" onClick={merkeEinheit}>
              {T.kurs.merken}
            </PrimaryButton>
          )}
          <p className="gedaempft">
            Gemerkte Wörter kommen in die täglichen Wiederholungen unter „Üben“.
          </p>
        </div>
      </section>
    </>
  )
}
