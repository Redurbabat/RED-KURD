// Startseite des Modern-Modus: Begrüssung, Einstieg in die Sitzung, Tagesplan,
// Überblick und Tagesziel. Die Seite rechnet nichts selbst — sie liest Selektoren
// und den Sitzungsplaner.
import { useMemo, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T, grussText } from '../../../core/texts.js'
import {
  statistik,
  schwierigeKarten,
  gesternStatistik,
  lernzeitText,
} from '../../../core/progress/progressSelectors.js'
import { tagesZiel, holeTageszielBelohnung } from '../../../core/progress/progressStore.js'
import { standardDauer, tageszielWert } from '../../../core/profile/profileStore.js'
import { DAUERN, planeSitzung } from '../../../core/session/sessionPlanner.js'
import { sitzungLaden, sitzungLoeschen, sitzungProzent } from '../../../core/session/sessionStore.js'
import { einheitProzent } from '../../../core/courses/courseRepository.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar, { ProgressRing } from '../../../components/common/ProgressBar.jsx'
import SegmentedControl from '../../../components/common/SegmentedControl.jsx'
import { StatTile } from '../../../components/common/StatChip.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import HeloMessage from '../../../components/mascot/HeloMessage.jsx'
import './TodayPage.css'

const SCHLUESSEL_DAUER = 'rk-dauer'

/** Die gewählte Dauer für die Sitzungsseite hinterlegen. */
function merkeDauer(id) {
  try {
    window.sessionStorage.setItem(SCHLUESSEL_DAUER, id)
  } catch {
    /* Im privaten Modus kann das fehlschlagen — dann gilt der Wert aus dem Profil. */
  }
}

/** Ein Wort je Bedeutung, auch wenn es zu mehreren Fertigkeiten fällig ist. */
function ohneDoppelte(karten) {
  const gesehen = new Set()
  const aus = []
  for (const k of karten) {
    if (gesehen.has(k.ku)) continue
    gesehen.add(k.ku)
    aus.push(k)
  }
  return aus
}

export default function TodayPage() {
  const stand = useLernstand()
  const [dauerId, setDauerId] = useState(() => standardDauer())
  const [versuch, setVersuch] = useState(0)

  const plan = useMemo(() => {
    try {
      const p = planeSitzung(dauerId)
      return p && p.einheit ? p : null
    } catch {
      return null
    }
  }, [dauerId, stand, versuch])

  if (!plan) {
    return (
      <ErrorState
        titel="Dein Tagesplan liess sich nicht erstellen."
        text="Die Kursdaten konnten gerade nicht gelesen werden."
        nochmal={() => setVersuch((v) => v + 1)}
      />
    )
  }

  const sitzung = sitzungLaden()
  const s = statistik()
  const schwierige = ohneDoppelte(schwierigeKarten(12))
  const gestern = gesternStatistik()
  const einheit = plan.einheit

  function starteNeueSitzung() {
    merkeDauer(dauerId)
    sitzungLoeschen()
    navigiere('/session?neu=1')
  }

  return (
    <div className="tp-seite">
      <header className="tp-gruss">
        <h1 lang="ku">{grussText()}!</h1>
        <HeloMessage
          variante="winken"
          text={`${T.app.sprache} · ${einheit.name} · heute ${plan.dauer.dauer}`}
        />
      </header>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Jetzt lernen</h2>

        {sitzung && (
          <button type="button" className="rk-startkarte" onClick={() => navigiere('/session')}>
            <Icon name="play" groesse={26} />
            <span className="rk-startkarte-text">
              <strong>{T.heute.fortsetzen}</strong>
              <small>
                {sitzung.titel} · Aufgabe {sitzung.index + 1} von {sitzung.uebungen.length}
              </small>
            </span>
            <span className="rk-startkarte-wert">{sitzungProzent(sitzung)} %</span>
          </button>
        )}

        <button
          type="button"
          className="rk-startkarte rk-startkarte-gruen"
          onClick={starteNeueSitzung}
        >
          <Icon name="blitz" groesse={26} />
          <span className="rk-startkarte-text">
            <strong>{T.heute.weiterlernen}</strong>
            <small>{T.heute.weiterlernenText}</small>
          </span>
          <span className="rk-startkarte-wert">{plan.dauer.dauer}</span>
        </button>

        <Card titel={T.heute.tagesplan} icon="kalender">
          <ul className="rk-plan tp-planliste">
            <PlanFeld icon="wiederholen" wert={plan.wiederholungen} name={T.heute.wiederholungen} />
            <PlanFeld icon="buch" wert={plan.neueWoerter} name={T.heute.neueWoerter} />
            <PlanFeld icon="kopfhoerer" wert={plan.hoerAufgaben} name={T.heute.hoeren} />
            <PlanFeld icon="stift" wert={plan.schreibAufgaben} name={T.heute.schreiben} />
          </ul>

          <div className="tp-dauer">
            <span className="rk-feld-label">{T.heute.dauer}</span>
            <SegmentedControl
              name="tp-dauer"
              label={T.heute.dauer}
              wert={dauerId}
              optionen={DAUERN.map((d) => ({ id: d.id, name: d.name, zusatz: d.dauer }))}
              aendern={setDauerId}
            />
          </div>
        </Card>

        {plan.rueckstand && (
          <p className="rk-hinweisstreifen tp-hinweis">
            <Icon name="warnung" groesse={20} />
            <span>
              Du hast {plan.faelligGesamt} Wiederholungen offen. Neue Wörter werden deshalb
              vorübergehend reduziert, damit du zuerst festigst, was du schon kennst.
            </span>
          </p>
        )}
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Dein Überblick</h2>

        <div className="rk-kachelraster tp-raster">
          <Card titel={T.heute.deinKurs} icon="kurs">
            <div className="tp-kurs">
              <div className="tp-kurs-text">
                <p className="gedaempft">{T.app.kurs}</p>
                <p className="tp-kurs-einheit">
                  Einheit {einheit.nr}: <strong>{einheit.name}</strong>
                </p>
              </div>
              <ProgressRing
                wert={einheitProzent(einheit.id)}
                label={`Fortschritt der Einheit ${einheit.name}`}
                groesse={72}
              />
            </div>
            <PrimaryButton breit iconRechts="pfeilRechts" onClick={() => navigiere('/course')}>
              Zum Kurs
            </PrimaryButton>
          </Card>

          <Card titel={T.heute.deinStand} icon="berg">
            <ul className="tp-standraster">
              <li>
                <StatTile icon="flamme" wert={s.serie} label={T.stats.serie} />
              </li>
              <li>
                <StatTile icon="stern" wert={s.xp} label={T.stats.xp} />
              </li>
              <li>
                <StatTile icon="wiederholen" wert={s.faellig} label="Wiederholungen" />
              </li>
            </ul>
          </Card>
        </div>

        {schwierige.length > 0 && (
          <Card titel={T.heute.schwierig} icon="gehirn" ton="warm">
            <p>
              {schwierige.length === 1
                ? 'Ein Wort macht dir gerade Mühe.'
                : `${schwierige.length} Wörter machen dir gerade Mühe.`}{' '}
              Ein kurzes Training bringt sie zurück.
            </p>
            <ul className="rk-wortliste tp-wortliste">
              {schwierige.slice(0, 3).map((k) => (
                <li key={k.ku + '|' + k.de} className="rk-wortchip">
                  <strong lang="ku">{k.ku}</strong>
                  <span lang="de" className="gedaempft">
                    {k.de}
                  </span>
                </li>
              ))}
            </ul>
            <PrimaryButton art="gold" icon="blitz" onClick={() => navigiere('/practice/hard')}>
              3 Minuten üben
            </PrimaryButton>
          </Card>
        )}

        {gestern && (
          <Card titel={T.heute.rueckblick} icon="uhr">
            <ul className="tp-standraster">
              <li>
                <StatTile icon="haken" wert={gestern.aufgaben || 0} label="Aufgaben" />
              </li>
              <li>
                <StatTile icon="stern" wert={gestern.richtig || 0} label="davon richtig" />
              </li>
              <li>
                <StatTile icon="uhr" wert={lernzeitText(gestern.sekunden)} label="Lernzeit" />
              </li>
            </ul>
          </Card>
        )}
      </section>

      <Tagesziel />
    </div>
  )
}

function PlanFeld({ icon, wert, name }) {
  return (
    <li className="rk-plan-feld">
      <Icon name={icon} groesse={22} />
      <span>
        <strong>{wert}</strong>
        <small>{name}</small>
      </span>
    </li>
  )
}

/** Tagesziel mit Fortschritt und einmaliger Belohnung je Tag. */
function Tagesziel() {
  const [belohnung, setBelohnung] = useState(null)
  const ziel = tageszielWert()
  const z = tagesZiel(ziel)
  const offen = Math.max(0, z.ziel - z.erledigt)

  function holen() {
    const b = holeTageszielBelohnung(ziel)
    if (b) setBelohnung(b)
  }

  return (
    <section className="rk-abschnitt">
      <h2 className="rk-abschnitt-titel">{T.heute.tagesziel}</h2>

      <div className={'rk-zielkarte' + (z.geschafft ? ' geschafft' : '')}>
        <Icon name={z.geschafft ? 'haken' : 'schild'} groesse={26} />
        <div className="rk-zielkarte-text">
          <ProgressBar
            wert={z.erledigt}
            max={z.ziel}
            label={`Tagesziel: ${z.erledigt} von ${z.ziel} Aufgaben geschafft`}
            farbe={z.geschafft ? 'gold' : 'green'}
          />
          <p className="gedaempft">
            {z.geschafft
              ? 'Tagesziel geschafft. Jede weitere Aufgabe ist ein Bonus.'
              : `Noch ${offen} ${offen === 1 ? 'Aufgabe' : 'Aufgaben'} bis zum Tagesziel.`}
          </p>
        </div>
        <span className="rk-zielkarte-stand">
          {z.erledigt} / {z.ziel}
        </span>
      </div>

      {z.geschafft && !z.belohnt && (
        <PrimaryButton art="gold" icon="edelstein" onClick={holen}>
          Belohnung holen
        </PrimaryButton>
      )}

      <div aria-live="polite">
        {belohnung && (
          <p className="tp-belohnung">
            <Icon name="stern" groesse={18} />
            <span>+{belohnung.xp} XP</span>
            <Icon name="edelstein" groesse={18} />
            <span>
              +{belohnung.edelsteine} {belohnung.edelsteine === 1 ? 'Edelstein' : 'Edelsteine'}
            </span>
          </p>
        )}
      </div>
    </section>
  )
}
