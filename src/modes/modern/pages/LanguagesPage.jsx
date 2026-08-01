// Zentrale Kurswahl: Kurmancî bleibt der größte Kurs, zusätzliche Sprachen
// besitzen eigene Inhalte, Stimmen, Fotos und lokalen Fortschritt.
import { useEffect, useState } from 'react'
import { navigiere } from '../../../app/router.jsx'
import { useLernstand } from '../../../core/store.js'
import { SPRACHKURSE } from '../../../data/sprachkurse.js'
import { kursStand } from '../../../core/courses/languageCourseStore.js'
import { kursFortschritt } from '../../../core/courses/courseRepository.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import FlagIcon from '../../../components/common/FlagIcon.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import './LanguagesPage.css'

const KURMANCÎ = {
  id: 'kurmanci',
  name: 'Kurmancî',
  eigenname: 'Kurmancî',
  flagge: '☀️',
  locale: 'kmr',
  farbe: '#19cfa6',
  beschreibung: 'Der vollständige RED-KURD-Kurs mit Kultur und Aussprache',
  foto: '/bilder/lernwelt/landschaft.jpg',
  fotoAlt: 'Akrê mit Häusern und Bergen in Kurdistan',
  woerter: 524,
  lektionen: 250,
}

const KURS_FOTOS = [
  '/bilder/lernwelt/schule.jpg',
  '/bilder/lernwelt/restaurant.jpg',
  '/bilder/lernwelt/zug.jpg',
  '/bilder/lernwelt/haus.jpg',
]

function kursOeffnen(id) {
  navigiere(id === 'kurmanci' ? '/course' : `/languages/${id}`)
}

function FotoNachweise() {
  const [fotos, setFotos] = useState([])

  useEffect(() => {
    // Kapitel- und Wortfotos zusammen ausweisen — beide Quellen sind Wikimedia.
    Promise.all(
      ['/bilder/lernwelt/credits.json', '/bilder/woerter/credits.json'].map((pfad) =>
        fetch(pfad)
          .then((antwort) => (antwort.ok ? antwort.json() : null))
          .catch(() => null)
      )
    ).then((listen) => setFotos(listen.flatMap((daten) => daten?.fotos || [])))
  }, [])

  return (
    <details className="sprachen-nachweise">
      <summary>
        <Icon name="bild" groesse={18} />
        Quellen der echten Fotos
      </summary>
      {fotos.length ? (
        <ul>
          {fotos.map((foto) => (
            <li key={foto.id}>
              <a href={foto.quelle} target="_blank" rel="noreferrer">
                {foto.titel}
              </a>
              <span>
                {foto.urheber} · {foto.lizenz}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Fotos aus{' '}
          <a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">
            Wikimedia Commons
          </a>
          .
        </p>
      )}
    </details>
  )
}

export default function LanguagesPage() {
  useLernstand()
  const kurdischStand = kursFortschritt()

  return (
    <>
      <PageHeader
        titel="Sprachkurse"
        untertitel="Wähle eine Sprache und lerne mit echten Fotos, hörbaren Beispielen und kurzen interaktiven Lektionen."
        variante="rucksack"
      />

      <section className="sprachen-fotoheld" aria-labelledby="sprachen-held-titel">
        <div className="sprachen-fotoheld-bilder" aria-hidden="true">
          <img src="/bilder/lernwelt/obst.jpg" alt="" />
          <img src="/bilder/lernwelt/haus.jpg" alt="" />
          <img src="/bilder/lernwelt/kueche.jpg" alt="" />
        </div>
        <div className="sprachen-fotoheld-verlauf" />
        <div className="sprachen-fotoheld-inhalt">
          <span className="sprachen-3d-kugel sprachen-3d-kugel-eins">A</span>
          <span className="sprachen-3d-kugel sprachen-3d-kugel-zwei">Ç</span>
          <p className="rk-hero-etikett">Eine App · fünf Sprachen</p>
          <h2 id="sprachen-held-titel">Sieh es. Höre es. Sprich es.</h2>
          <p>
            Alle Bilder sind echte Fotos aus dem Internet und werden für den Offline-Einsatz
            lokal mitgeliefert. Die Aussprache kommt aus vorhandenen Audiodateien oder der
            Stimme deines Geräts.
          </p>
          <div className="sprachen-held-badges">
            <Badge icon="bild" ton="blau">Echte Fotos</Badge>
            <Badge icon="lautsprecher" ton="gruen">Audio</Badge>
            <Badge icon="schild" ton="lila">Lokal & kostenlos</Badge>
          </div>
        </div>
      </section>

      <section className="rk-abschnitt" aria-labelledby="sprachen-kurse-titel">
        <h2 className="rk-abschnitt-titel" id="sprachen-kurse-titel">
          Deine Kurse
        </h2>
        <div className="sprachen-kursgitter">
          <button
            type="button"
            className="sprachen-kurskarte sprachen-kurskarte-gross rk-taktil"
            style={{ '--kurs-farbe': KURMANCÎ.farbe }}
            onClick={() => kursOeffnen(KURMANCÎ.id)}
          >
            <img src={KURMANCÎ.foto} alt={KURMANCÎ.fotoAlt} />
            <span className="sprachen-kurs-verlauf" />
            <span className="sprachen-kurs-inhalt">
              <span className="sprachen-kurs-flagge" aria-hidden="true"><FlagIcon sprache="kurmanci" breite={34} /></span>
              <span className="sprachen-kurs-text">
                <strong>{KURMANCÎ.name}</strong>
                <small>{KURMANCÎ.beschreibung}</small>
                <span>{KURMANCÎ.woerter} Wörter · {KURMANCÎ.lektionen} Lektionen</span>
                <ProgressBar
                  wert={kurdischStand.prozent}
                  label={`Kurmancî-Kurs: ${kurdischStand.prozent} Prozent`}
                  farbe="green"
                  klein
                />
              </span>
              <Icon name="pfeilRechts" groesse={24} />
            </span>
          </button>

          {SPRACHKURSE.map((kurs, index) => {
            const stand = kursStand(kurs)
            return (
              <button
                type="button"
                className="sprachen-kurskarte rk-taktil"
                style={{ '--kurs-farbe': kurs.farbe }}
                onClick={() => kursOeffnen(kurs.id)}
                key={kurs.id}
              >
                <img src={KURS_FOTOS[index]} alt="" />
                <span className="sprachen-kurs-verlauf" />
                <span className="sprachen-kurs-inhalt">
                  <span className="sprachen-kurs-flagge" aria-hidden="true"><FlagIcon sprache={kurs.id} breite={34} /></span>
                  <span className="sprachen-kurs-text">
                    <strong>{kurs.name}</strong>
                    <small lang={kurs.locale}>{kurs.eigenname}</small>
                    <span>{kurs.woerter} Wörter · {kurs.lektionen} Übungen</span>
                    <ProgressBar
                      wert={stand.prozent}
                      label={`${kurs.name}: ${stand.prozent} Prozent`}
                      farbe="blue"
                      klein
                    />
                  </span>
                  <Icon name="pfeilRechts" groesse={24} />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <FotoNachweise />
    </>
  )
}
