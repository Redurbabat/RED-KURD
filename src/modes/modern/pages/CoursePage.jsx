// Kursübersicht: Gesamtfortschritt, aktuelle Einheit und alle Einheiten.
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import {
  WELTEN,
  aktuelleEinheit,
  einheitenDerWelt,
  einheitProzent,
  einheitSterne,
  einheitStatus,
  kursFortschritt,
  weltFortschritt,
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

function EinheitKarte({ einheit }) {
  const status = einheitStatus(einheit.id)
  const prozent = einheitProzent(einheit.id)
  return (
    <li>
      <button
        type="button"
        className={`rk-einheit ${KLASSE_JE_STATUS[status] || ''}`}
        onClick={() => navigiere('/course/' + einheit.id)}
      >
        <span className="rk-einheit-nr">{einheit.nr}</span>
        {einheit.foto ? (
          <span className="kurs-einheit-foto">
            <img src={einheit.foto.src} alt="" loading="lazy" />
            <span aria-hidden="true">{einheit.symbol}</span>
          </span>
        ) : (
          <span className="rk-einheit-symbol" aria-hidden="true">
            {einheit.symbol}
          </span>
        )}
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
}

export default function CoursePage() {
  useLernstand()

  const gesamt = kursFortschritt()
  const aktuell = aktuelleEinheit()
  const aktuellProzent = einheitProzent(aktuell.id)
  const allesFertig = gesamt.fertig >= gesamt.gesamt

  return (
    <>
      <button type="button" className="rk-zurueck" onClick={() => navigiere('/languages')}>
        <Icon name="pfeilLinks" groesse={18} />
        <span>Alle Sprachkurse</span>
      </button>

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
          <span className="rk-hero-etikett">A1–A2 Lernweg</span>
          <h2>
            Kapitel {aktuell.nr} von {gesamt.gesamt}
          </h2>
          <p>
            {gesamt.fertig} von {gesamt.gesamt} Kapiteln abgeschlossen
          </p>
        </div>
      </div>

      <section className="rk-hero rk-hero-blau kurs-aktuell" aria-labelledby="kurs-aktuell-titel">
        {aktuell.foto ? (
          <span className="kurs-hero-foto" aria-hidden="true">
            <img src={aktuell.foto.src} alt="" />
            <span>{aktuell.symbol}</span>
          </span>
        ) : (
          <span className="kurs-hero-symbol" aria-hidden="true">
            {aktuell.symbol}
          </span>
        )}
        <div className="rk-hero-text">
          <span className="rk-hero-etikett">{T.kurs.aktuelleEinheit}</span>
          <h2 id="kurs-aktuell-titel">{aktuell.name}</h2>
          <p>
            {allesFertig
              ? 'Du hast alle Kapitel geschafft — wiederhole, worauf du Lust hast.'
              : `${aktuellProzent} % geschafft · ${aktuell.woerter.length} Wörter`}
          </p>
          <ProgressBar
            wert={aktuellProzent}
            label={`Fortschritt im Kapitel ${aktuell.name}: ${aktuellProzent} Prozent`}
            farbe="gold"
            klein
            className="kurs-hero-balken"
          />
        </div>
        <PrimaryButton
          art="gold"
          icon="play"
          onClick={() => navigiere('/course/' + aktuell.id)}
          aria-label={`Kapitel ${aktuell.name} öffnen`}
        >
          {allesFertig ? T.kurs.wiederholen : T.kurs.weiter}
        </PrimaryButton>
      </section>

      <section className="rk-abschnitt" aria-labelledby="kurs-alle-titel">
        <h2 className="rk-abschnitt-titel" id="kurs-alle-titel">
          {T.kurs.alleEinheiten}
        </h2>

        <div className="kurs-welten">
          {WELTEN.map((welt) => {
            const weltStand = weltFortschritt(welt.id)
            return (
              <section className="kurs-welt" key={welt.id} aria-labelledby={`kurs-${welt.id}`}>
                <header className="kurs-welt-kopf">
                  <span className="kurs-welt-nr">{welt.nr}</span>
                  <span className="kurs-welt-text">
                    <strong id={`kurs-${welt.id}`}>{welt.name}</strong>
                    <small lang="ku">{welt.untertitel}</small>
                  </span>
                  <Badge ton={weltStand.prozent === 100 ? 'gruen' : 'blau'}>
                    {weltStand.fertig}/{weltStand.gesamt}
                  </Badge>
                </header>
                <ul className="rk-einheitenliste" role="list">
                  {einheitenDerWelt(welt.id).map((einheit) => (
                    <EinheitKarte key={einheit.id} einheit={einheit} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <p className="rk-hinweisstreifen kurs-hinweis">
          <Icon name="info" groesse={18} />
          <span>
            „Später empfohlen“ ist nur ein Vorschlag: Du kannst jedes Kapitel jederzeit öffnen und
            ausprobieren — auch die, die noch gesperrt aussehen.
          </span>
        </p>
      </section>
    </>
  )
}
