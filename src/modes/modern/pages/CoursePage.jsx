// Kursübersicht: Gesamtfortschritt, aktuelle Einheit und alle Einheiten.
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import {
  EINHEITEN,
  aktuelleEinheit,
  einheitProzent,
  einheitSterne,
  einheitStatus,
  kursFortschritt,
} from '../../../core/courses/courseRepository.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar, { ProgressRing } from '../../../components/common/ProgressBar.jsx'
import { T } from '../../../core/texts.js'
import './CoursePage.css'

/** Klasse je Status — „begonnen“ hat bewusst keine eigene Optik. */
const KLASSE_JE_STATUS = {
  fertig: 'fertig',
  aktuell: 'aktuell',
  begonnen: '',
  gesperrt: 'gesperrt',
}

function Sterne({ anzahl }) {
  return (
    <span className="kurs-sterne" role="img" aria-label={`${anzahl} von 3 Sternen`}>
      {[1, 2, 3].map((i) => (
        <Icon key={i} name="stern" groesse={15} className={i <= anzahl ? 'stern-voll' : 'stern-leer'} />
      ))}
    </span>
  )
}

function EinheitStatusText({ status, prozent, sterne }) {
  if (status === 'fertig') {
    return (
      <span className="rk-einheit-status kurs-status">
        <span className="kurs-status-zeile">
          <Icon name="haken" groesse={16} className="kurs-icon-fertig" />
          <span className="kurs-status-text">
            {T.kurs.status.fertig} · {prozent} %
          </span>
        </span>
        <Sterne anzahl={sterne} />
      </span>
    )
  }
  if (status === 'aktuell') {
    return (
      <span className="rk-einheit-status kurs-status">
        <Badge ton="teal">{T.kurs.status.aktuell}</Badge>
        <span className="kurs-status-text">{T.kurs.starten}</span>
      </span>
    )
  }
  if (status === 'begonnen') {
    return (
      <span className="rk-einheit-status kurs-status">
        <span className="kurs-status-text">{prozent} % — noch nicht bestanden</span>
      </span>
    )
  }
  return (
    <span className="rk-einheit-status kurs-status">
      <span className="kurs-status-zeile">
        <Icon name="schloss" groesse={16} className="kurs-icon-gesperrt" />
        <span className="kurs-status-text">{T.kurs.status.gesperrt}</span>
      </span>
    </span>
  )
}

export default function CoursePage() {
  useLernstand()

  const gesamt = kursFortschritt()
  const aktuell = aktuelleEinheit()
  const aktuellProzent = einheitProzent(aktuell.id)
  const allesFertig = gesamt.fertig >= gesamt.gesamt

  return (
    <>
      <PageHeader
        titel={T.kurs.titel}
        untertitel="Deutsch → Kurmancî — lerne Schritt für Schritt. Hêlo begleitet dich auf deinem Weg."
        variante="rucksack"
      />

      <div className="rk-hero">
        <ProgressRing
          wert={gesamt.prozent}
          label={`Kursfortschritt: ${gesamt.prozent} Prozent`}
          groesse={84}
          farbe="var(--rk-yellow)"
        />
        <div className="rk-hero-text">
          <span className="rk-hero-etikett">A1 Grundlagen</span>
          <h2>
            Einheit {aktuell.nr} von {gesamt.gesamt}
          </h2>
          <p>
            {gesamt.fertig} von {gesamt.gesamt} Einheiten abgeschlossen
          </p>
        </div>
      </div>

      <section className="rk-hero rk-hero-blau kurs-aktuell" aria-labelledby="kurs-aktuell-titel">
        <span className="kurs-hero-symbol" aria-hidden="true">
          {aktuell.symbol}
        </span>
        <div className="rk-hero-text">
          <span className="rk-hero-etikett">{T.kurs.aktuelleEinheit}</span>
          <h2 id="kurs-aktuell-titel">{aktuell.name}</h2>
          <p>
            {allesFertig
              ? 'Du hast alle Einheiten geschafft — wiederhole, worauf du Lust hast.'
              : `${aktuellProzent} % geschafft · ${aktuell.woerter.length} Wörter`}
          </p>
          <ProgressBar
            wert={aktuellProzent}
            label={`Fortschritt in der Einheit ${aktuell.name}: ${aktuellProzent} Prozent`}
            farbe="gold"
            klein
            className="kurs-hero-balken"
          />
        </div>
        <PrimaryButton
          art="gold"
          icon="play"
          onClick={() => navigiere('/course/' + aktuell.id)}
          aria-label={`Einheit ${aktuell.name} öffnen`}
        >
          {allesFertig ? T.kurs.wiederholen : T.kurs.weiter}
        </PrimaryButton>
      </section>

      <section className="rk-abschnitt" aria-labelledby="kurs-alle-titel">
        <h2 className="rk-abschnitt-titel" id="kurs-alle-titel">
          {T.kurs.alleEinheiten}
        </h2>

        <ul className="rk-einheitenliste" role="list">
          {EINHEITEN.map((einheit) => {
            const status = einheitStatus(einheit.id)
            const prozent = einheitProzent(einheit.id)
            return (
              <li key={einheit.id}>
                <button
                  type="button"
                  className={`rk-einheit ${KLASSE_JE_STATUS[status] || ''}`}
                  onClick={() => navigiere('/course/' + einheit.id)}
                >
                  <span className="rk-einheit-nr">{einheit.nr}</span>
                  <span className="rk-einheit-symbol" aria-hidden="true">
                    {einheit.symbol}
                  </span>
                  <span className="rk-einheit-text">
                    <strong>{einheit.name}</strong>
                    <small>
                      {einheit.lektionen.length} Lektionen · {einheit.woerter.length} Wörter
                    </small>
                  </span>
                  <EinheitStatusText
                    status={status}
                    prozent={prozent}
                    sterne={einheitSterne(einheit.id)}
                  />
                </button>
              </li>
            )
          })}
        </ul>

        <p className="rk-hinweisstreifen kurs-hinweis">
          <Icon name="info" groesse={18} />
          <span>
            „Später empfohlen“ ist nur ein Vorschlag: Du kannst jede Einheit jederzeit öffnen und
            ausprobieren — auch die, die noch gesperrt aussehen.
          </span>
        </p>
      </section>
    </>
  )
}
