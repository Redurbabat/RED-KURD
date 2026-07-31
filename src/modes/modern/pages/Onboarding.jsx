// Onboarding beim allerersten Start: drei Fragen, dann steht der Lernplan.
// Die Seite läuft ausserhalb der App-Hülle — sie bringt ihren eigenen
// zentrierten Container mit und nutzt weder Router noch Navigation.
import { useEffect, useRef, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { speichereProfil, ZIELE, KENNTNISSE, TAGESZIELE } from '../../../core/profile/profileStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './Onboarding.css'

/** Zeit pro Tag — jede Antwort schlägt ein passendes Tagesziel vor. */
const ZEITEN = [
  { id: '5', name: '5 Minuten', beschreibung: 'Kurz, aber jeden Tag', icon: 'uhr', tagesziel: 10 },
  { id: '10', name: '10 Minuten', beschreibung: 'Der ruhige, sichere Weg', icon: 'uhr', tagesziel: 20 },
  {
    id: '20',
    name: '20 Minuten oder mehr',
    beschreibung: 'Du möchtest schnell vorankommen',
    icon: 'blitz',
    tagesziel: 30,
  },
]

const SCHRITTE = [
  {
    id: 'kenntnis',
    frage: 'Wie gut kannst du schon Kurmancî?',
    optionen: KENNTNISSE,
    icon: 'gehirn',
  },
  { id: 'ziel', frage: 'Warum lernst du Kurmancî?', optionen: ZIELE, icon: 'kompass' },
  { id: 'minuten', frage: 'Wie viel Zeit hast du pro Tag?', optionen: ZEITEN, icon: 'uhr' },
]

function zeitVon(id) {
  return ZEITEN.find((z) => z.id === id) || ZEITEN[1]
}

function nameVon(liste, id, ersatz) {
  const treffer = liste.find((o) => o.id === id)
  return treffer ? treffer.name : ersatz
}

export default function Onboarding({ fertig }) {
  useLernstand()

  const [schritt, setSchritt] = useState(0)
  const [antworten, setAntworten] = useState({})
  const amEnde = schritt >= SCHRITTE.length
  const nummer = Math.min(schritt + 1, SCHRITTE.length)

  // Nach jedem Schritt wandert der Fokus auf den neuen Inhalt — sonst landet er
  // beim Weiterklicken im Nichts und Screenreader lesen die neue Frage nicht vor.
  const inhaltRef = useRef(null)
  const ersterLauf = useRef(true)
  useEffect(() => {
    if (ersterLauf.current) {
      ersterLauf.current = false
      return
    }
    inhaltRef.current?.focus()
  }, [schritt])

  return (
    <div className="onb-huelle">
      <main className="onb-kasten">
        <div className="onb-helo">
          <HeloMascot variante={amEnde ? 'feiern' : 'winken'} groesse={104} dekorativ />
        </div>

        <div className="onb-fortschritt">
          <span className="onb-schrittzahl">
            {amEnde ? `Fertig · Schritt ${SCHRITTE.length} von ${SCHRITTE.length}` : `Schritt ${nummer} von ${SCHRITTE.length}`}
          </span>
          <ProgressBar
            wert={nummer}
            max={SCHRITTE.length}
            label={`Einrichtung: Schritt ${nummer} von ${SCHRITTE.length}`}
            farbe="green"
          />
        </div>

        {schritt > 0 && (
          <button type="button" className="rk-zurueck" onClick={() => setSchritt((s) => s - 1)}>
            <Icon name="pfeilLinks" groesse={18} />
            <span>Zurück</span>
          </button>
        )}

        <div className="onb-inhalt" ref={inhaltRef} tabIndex={-1}>
          {amEnde ? (
            <Zusammenfassung antworten={antworten} fertig={fertig} />
          ) : (
            <Frage
              schritt={SCHRITTE[schritt]}
              erster={schritt === 0}
              gewaehlt={antworten[SCHRITTE[schritt].id]}
              waehlen={(wert) => {
                setAntworten((a) => ({ ...a, [SCHRITTE[schritt].id]: wert }))
                setSchritt((s) => s + 1)
              }}
            />
          )}
        </div>

        <p className="gedaempft onb-fussnote">
          Alles lässt sich später in den Einstellungen ändern.
        </p>
      </main>
    </div>
  )
}

/** Eine Frage mit grossen Antwortknöpfen. */
function Frage({ schritt, erster, gewaehlt, waehlen }) {
  return (
    <div className="onb-block">
      {erster ? (
        <>
          <h1 className="onb-gruss">
            <span lang="ku">Silav!</span> <span lang="de">Ich bin Hêlo.</span>
          </h1>
          <p className="onb-frage" id="onb-frage">
            {schritt.frage}
          </p>
        </>
      ) : (
        <h1 className="onb-frage" id="onb-frage">
          {schritt.frage}
        </h1>
      )}

      <ul className="onb-antworten" aria-labelledby="onb-frage">
        {schritt.optionen.map((o) => {
          const aktiv = o.id === gewaehlt
          return (
            <li key={o.id}>
              <button
                type="button"
                className={'onb-antwort' + (aktiv ? ' gewaehlt' : '')}
                aria-pressed={aktiv}
                onClick={() => waehlen(o.id)}
              >
                <Icon name={o.icon || schritt.icon} groesse={24} className="onb-antwort-icon" />
                <span className="onb-antwort-text">
                  <strong>{o.name}</strong>
                  {o.beschreibung && <small>{o.beschreibung}</small>}
                </span>
                <Icon
                  name={aktiv ? 'haken' : 'pfeilRechts'}
                  groesse={20}
                  className="onb-antwort-zeichen"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Der fertige Plan mit Tagesziel-Vorschlag. */
function Zusammenfassung({ antworten, fertig }) {
  const zeit = zeitVon(antworten.minuten)
  const ziel = TAGESZIELE.find((t) => t.id === zeit.tagesziel) || TAGESZIELE[1]

  function starten() {
    speichereProfil({ ...antworten, tagesziel: ziel.id })
    fertig()
  }

  return (
    <div className="onb-block">
      <h1 className="onb-titel">Dein Plan steht!</h1>

      <ul className="onb-plan">
        <li>
          <Icon name="sprache" groesse={22} />
          <span className="onb-plan-text">
            <strong>
              <span lang="ku">Kurmancî</span> <span lang="de">· Grundlagen</span>
            </strong>
            <small>Von Deutsch nach Kurmancî, Schritt für Schritt</small>
          </span>
        </li>
        <li>
          <Icon name="uhr" groesse={22} />
          <span className="onb-plan-text">
            <strong>{zeit.name} täglich</strong>
            <small>{zeit.beschreibung}</small>
          </span>
        </li>
        <li>
          <Icon name="kalender" groesse={22} />
          <span className="onb-plan-text">
            <strong>Tagesziel: {ziel.name}</strong>
            <small>{ziel.beschreibung}</small>
          </span>
        </li>
        <li>
          <Icon name="gehirn" groesse={22} />
          <span className="onb-plan-text">
            <strong>{nameVon(KENNTNISSE, antworten.kenntnis, 'Ich beginne ganz neu')}</strong>
            <small>Dein Startpunkt</small>
          </span>
        </li>
        <li>
          <Icon name="kompass" groesse={22} />
          <span className="onb-plan-text">
            <strong>{nameVon(ZIELE, antworten.ziel, 'Alltag & Gespräche')}</strong>
            <small>Dein Lernziel</small>
          </span>
        </li>
        <li>
          <Icon name="schild" groesse={22} />
          <span className="onb-plan-text">
            <strong>Kostenlos und sicher</strong>
            <small>Nur dein Konto liegt in der Cloud; dein Lernstand bleibt lokal</small>
          </span>
        </li>
      </ul>

      <p className="onb-hinweis">
        Hêlo stellt dir jeden Tag die passende Sitzung zusammen — Wiederholungen, neue Wörter,
        Hören und Schreiben gemischt.
      </p>

      <PrimaryButton groesse="gross" breit icon="play" onClick={starten}>
        Erste Lektion starten
      </PrimaryButton>
    </div>
  )
}
