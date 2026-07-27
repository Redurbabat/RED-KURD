// Die Weltkarte einer einzelnen Welt: ein Pfad aus Stationen über der
// Landschaft, dazu Abschlussprüfung und Welt-Truhe.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  einheitProzent,
  einheitSterne,
  einheitStatus,
  einheitenDerWelt,
  holeWelt,
  weltFortschritt,
} from '../../../core/courses/courseRepository.js'
import { gibEdelsteine } from '../../../core/progress/progressStore.js'
import Landscape from '../../../components/adventure/Landscape.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './WorldDetailPage.css'

const TRUHEN_SCHLUESSEL = 'red-kurd-welt-truhe'
const TRUHEN_EDELSTEINE = 5

const KLASSE_JE_STATUS = {
  fertig: 'fertig',
  aktuell: 'aktuell',
  begonnen: '',
  gesperrt: 'gesperrt',
}

const STATUS_TEXT = {
  fertig: T.abenteuer.abgeschlossen,
  aktuell: T.abenteuer.aktuell,
  begonnen: 'Begonnen',
  gesperrt: T.abenteuer.gesperrt,
}

// ===== Welt-Truhen (eigener kleiner Speicher, eine Truhe je Welt) =====

/** @returns {Object} { weltId: 'JJJJ-MM-TT' } */
function leseWeltTruhen() {
  if (typeof window === 'undefined') return {}
  try {
    const roh = window.localStorage.getItem(TRUHEN_SCHLUESSEL)
    const daten = roh ? JSON.parse(roh) : null
    return daten && typeof daten === 'object' ? daten : {}
  } catch {
    return {}
  }
}

function truheGeoeffnetAm(weltId) {
  return leseWeltTruhen()[weltId] || null
}

function merkeWeltTruhe(weltId) {
  const daten = { ...leseWeltTruhen(), [weltId]: new Date().toISOString().slice(0, 10) }
  try {
    window.localStorage.setItem(TRUHEN_SCHLUESSEL, JSON.stringify(daten))
  } catch {
    // Privater Modus: die Edelsteine sind trotzdem gutgeschrieben.
  }
  return daten
}

function datumText(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function Sterne({ anzahl }) {
  return (
    <span className="adv-station-sterne" role="img" aria-label={`${anzahl} von 3 Sternen`}>
      {[1, 2, 3].map((i) => (
        <Icon
          key={i}
          name="stern"
          groesse={16}
          className={i <= anzahl ? 'wd-stern-voll' : 'wd-stern-leer'}
        />
      ))}
    </span>
  )
}

export default function WorldDetailPage({ worldId }) {
  useLernstand()
  // Merkt sich, für welche Welt gerade eine Truhe geöffnet wurde — beim Wechsel
  // auf eine andere Welt verschwindet die Meldung dadurch von selbst.
  const [gewinnWelt, setGewinnWelt] = useState(null)

  const welt = holeWelt(worldId)

  if (!welt) {
    return (
      <EmptyState
        variante="denken"
        titel="Diese Welt kennt Hêlo nicht."
        text="Vielleicht hat sich die Adresse verlaufen. Wähle eine Welt aus der Übersicht."
        aktion={() => navigiere('/adventure/world')}
        aktionText="Zur Weltübersicht"
      />
    )
  }

  const einheiten = einheitenDerWelt(welt.id)
  const stand = weltFortschritt(welt.id)
  const letzte = einheiten[einheiten.length - 1] || null
  const alleFertig = stand.gesamt > 0 && stand.fertig >= stand.gesamt
  const offeneEinheiten = Math.max(0, stand.gesamt - stand.fertig)
  const truheDatum = truheGeoeffnetAm(welt.id)

  function oeffneWeltTruhe() {
    if (truheDatum || !alleFertig) return
    merkeWeltTruhe(welt.id)
    setGewinnWelt(welt.id)
    gibEdelsteine(TRUHEN_EDELSTEINE) // meldet den neuen Stand an die ganze App
  }

  return (
    <div className="adv-weltkarte">
      <PageHeader
        titel={`Welt ${welt.nr} · ${welt.name}`}
        untertitel={<span lang="ku">{welt.untertitel}</span>}
        variante="rucksack"
        zurueck="/adventure/world"
        zurueckText="Zu den Welten"
      />

      <div className="adv-pergament wd-uebersicht">
        <h2>Dein Stand in dieser Welt</h2>
        <ProgressBar
          wert={stand.prozent}
          label={`Welt ${welt.nr} ${welt.name}: ${stand.prozent} Prozent geschafft`}
          farbe="gold"
          zeigeWert
        />
        <ul className="wd-uebersicht-zahlen" role="list">
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
        </ul>
      </div>

      <p className="rk-hinweisstreifen wd-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          „{T.abenteuer.gesperrt}“ ist nur eine Empfehlung: Du kannst jede Station antippen und
          ausprobieren — der Weg gehört dir.
        </span>
      </p>

      <div className="adv-karte wd-karte">
        <Landscape
          art={welt.landschaft}
          farbe={welt.farbe}
          himmel={welt.himmel}
          className="adv-karte-hintergrund"
        />

        <ol className="adv-pfad">
          {einheiten.map((einheit) => {
            const status = einheitStatus(einheit.id)
            const prozent = einheitProzent(einheit.id)
            const sterne = einheitSterne(einheit.id)
            const statusText = STATUS_TEXT[status] || STATUS_TEXT.begonnen
            return (
              <li key={einheit.id} className="wd-station">
                {status === 'aktuell' && (
                  <span className="adv-helo-position">
                    <HeloMascot variante="rucksack" groesse={54} dekorativ />
                  </span>
                )}
                <button
                  type="button"
                  className={`adv-station ${KLASSE_JE_STATUS[status] || ''}`}
                  onClick={() => navigiere('/adventure/lesson/' + einheit.id)}
                  aria-label={`Einheit ${einheit.nr}: ${einheit.name} — ${statusText}, ${prozent} Prozent, ${sterne} von 3 Sternen`}
                >
                  <span className="adv-knoten" aria-hidden="true">
                    {status === 'gesperrt' ? (
                      <Icon name="schloss" groesse={26} />
                    ) : status === 'fertig' ? (
                      <Icon name="haken" groesse={28} />
                    ) : (
                      einheit.symbol
                    )}
                  </span>
                  <span className="adv-station-text">
                    <strong>
                      {einheit.nr}. {einheit.name}
                    </strong>
                    <small>
                      {statusText} · {prozent} %
                    </small>
                  </span>
                  <Sterne anzahl={sterne} />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <Card titel="Abschlussprüfung" icon="schild">
        {alleFertig && letzte ? (
          <>
            <p>
              Alle Einheiten dieser Welt sind bestanden. Die Abschlussprüfung nimmt dich noch einmal
              durch „{letzte.name}“ — hier holst du dir den dritten Stern.
            </p>
            <PrimaryButton
              art="gold"
              icon="play"
              className="wd-knopf"
              onClick={() => navigiere('/adventure/lesson/' + letzte.id)}
            >
              Prüfung starten
            </PrimaryButton>
          </>
        ) : (
          <>
            <p>
              Die Abschlussprüfung öffnet sich, wenn alle Einheiten dieser Welt bestanden sind.
            </p>
            <ProgressBar
              wert={stand.fertig}
              max={Math.max(1, stand.gesamt)}
              label={`Abschlussprüfung: ${stand.fertig} von ${stand.gesamt} Einheiten bestanden`}
              farbe="blue"
            />
            <p className="gedaempft">
              Noch {offeneEinheiten} {offeneEinheiten === 1 ? 'Einheit' : 'Einheiten'} bis zur
              Prüfung.
            </p>
            <PrimaryButton art="still" icon="schloss" className="wd-knopf" disabled>
              Prüfung starten
            </PrimaryButton>
          </>
        )}
      </Card>

      <Card titel="Schatztruhe der Welt" icon="truhe">
        <div className="wd-truhe">
          <HeloMascot variante="truhe" groesse={72} dekorativ />
          <div className="wd-truhe-text">
            {truheDatum ? (
              <p>
                Du hast diese Truhe am {datumText(truheDatum)} geöffnet. Die{' '}
                {TRUHEN_EDELSTEINE} Edelsteine liegen längst in deinem Beutel.
              </p>
            ) : alleFertig ? (
              <p>
                Die Welt ist zu 100 % geschafft — die Truhe gehört dir. In ihr warten{' '}
                {TRUHEN_EDELSTEINE} Edelsteine.
              </p>
            ) : (
              <p>
                Die Truhe öffnet sich, wenn diese Welt zu 100 % geschafft ist. Du bist bei{' '}
                {stand.prozent} %.
              </p>
            )}
          </div>
        </div>

        {!truheDatum && (
          <PrimaryButton
            art="gold"
            icon="truhe"
            className="wd-knopf"
            disabled={!alleFertig}
            onClick={oeffneWeltTruhe}
          >
            Truhe öffnen (+{TRUHEN_EDELSTEINE} Edelsteine)
          </PrimaryButton>
        )}

        <div aria-live="polite">
          {gewinnWelt === welt.id && (
            <p className="wd-gewinn">
              <Icon name="edelstein" groesse={18} />
              <span>Truhe geöffnet: +{TRUHEN_EDELSTEINE} Edelsteine</span>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
