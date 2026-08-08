import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { statistik, wochenAktivitaet, wochenLiga } from '../../../core/progress/progressSelectors.ts'
import { tagesZiel } from '../../../core/progress/progressStore.js'
import { tageszielWert } from '../../../core/profile/profileStore.js'
import {
  aktuelleEinheit,
  einheitProzent,
  kursFortschritt,
} from '../../../core/courses/courseRepository.ts'
import { sitzungLaden } from '../../../core/session/sessionStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'

const SCHNELLZIELE = [
  { name: 'Alle Kurse', text: 'Kurmancî und weitere Sprachen', icon: 'sprache', pfad: '/languages' },
  { name: 'Wörter', text: 'Wortschatz sicher festigen', icon: 'buch', pfad: '/practice/meaning' },
  { name: 'Hören', text: 'Echte Aussprache trainieren', icon: 'kopfhoerer', pfad: '/practice/listening' },
  { name: 'Sprechen', text: 'Laut nachsprechen und üben', icon: 'mikrofon', pfad: '/practice/speaking' },
  { name: 'Geschichten', text: 'Texte und Kultur entdecken', icon: 'entdecken', pfad: '/explore/reading' },
  { name: 'Fortschritt', text: 'Statistik und Wochenliga', icon: 'fortschritt', pfad: '/progress' },
]

export default function RedlingoHomePage() {
  useLernstand()

  const s = statistik()
  const einheit = aktuelleEinheit()
  const kurs = kursFortschritt()
  const ziel = tagesZiel(tageszielWert())
  const woche = wochenAktivitaet()
  const liga = wochenLiga()
  const sitzung = sitzungLaden()
  const kapitelProzent = einheitProzent(einheit.id)

  return (
    <div className="rl-seite rl-startseite">
      <section className="rl-hero" aria-labelledby="rl-hero-titel">
        <div className="rl-hero-kopf">
          <span className="rl-hero-label">DEIN LERNWEG</span>
          <span className="rl-serie">
            <Icon name="flamme" groesse={18} /> {s.serie} Tage
          </span>
        </div>
        <h1 id="rl-hero-titel">Heute ein Stück weiter</h1>
        <p>
          Kapitel {einheit.nr}: <strong>{einheit.name}</strong>
        </p>
        <ProgressBar
          wert={kapitelProzent}
          label={`Fortschritt in Kapitel ${einheit.name}`}
          zeigeWert
        />
        <button
          type="button"
          className="rl-hauptaktion rk-taktil"
          onClick={() =>
            navigiere(sitzung ? '/session' : `/course/${einheit.id}/lesson/${einheit.lektionen[0].id}`)
          }
        >
          <Icon name={sitzung ? 'play' : 'blitz'} groesse={22} />
          <span>{sitzung ? 'Sitzung fortsetzen' : 'Lektion starten'}</span>
          <Icon name="pfeilRechts" groesse={20} />
        </button>
      </section>

      <section className="rl-tagesziel" aria-labelledby="rl-ziel-titel">
        <div className="rl-abschnittskopf">
          <div>
            <span className="rl-kicker">HEUTE</span>
            <h2 id="rl-ziel-titel">Tagesziel</h2>
          </div>
          <strong>{ziel.erledigt}/{ziel.ziel}</strong>
        </div>
        <ProgressBar wert={ziel.erledigt} max={ziel.ziel} label="Heutiges Tagesziel" />
        <ul className="rl-wochentage" aria-label="Aktivität der letzten sieben Tage">
          {woche.map((tag) => (
            <li key={tag.datum} className={`${tag.anzahl > 0 ? 'aktiv' : ''}${tag.heute ? ' heute' : ''}`}>
              <span aria-hidden="true">{tag.anzahl > 0 ? '✓' : tag.tag.slice(0, 1)}</span>
              <small>{tag.tag}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="rl-bereich" aria-labelledby="rl-schnell-titel">
        <div className="rl-abschnittskopf">
          <div>
            <span className="rl-kicker">TRAINIEREN</span>
            <h2 id="rl-schnell-titel">Was möchtest du lernen?</h2>
          </div>
        </div>
        <div className="rl-schnellraster">
          {SCHNELLZIELE.map((zielEintrag) => (
            <button
              type="button"
              className="rl-schnellkarte rk-taktil"
              key={zielEintrag.name}
              onClick={() => navigiere(zielEintrag.pfad)}
            >
              <span className="rl-schnell-icon"><Icon name={zielEintrag.icon} groesse={25} /></span>
              <span>
                <strong>{zielEintrag.name}</strong>
                <small>{zielEintrag.text}</small>
              </span>
              <Icon name="pfeilRechts" groesse={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="rl-statusraster" aria-label="Dein Fortschritt">
        <button type="button" className="rl-statuskarte rk-taktil" onClick={() => navigiere('/course')}>
          <Icon name="kurs" groesse={22} />
          <strong>{kurs.prozent}%</strong>
          <span>{kurs.fertig} von {kurs.gesamt} Kapiteln</span>
        </button>
        <button type="button" className="rl-statuskarte rk-taktil" onClick={() => navigiere('/progress')}>
          <Icon name={liga.icon} groesse={22} />
          <strong>{liga.name}</strong>
          <span>{liga.aufgaben} Aufgaben diese Woche</span>
        </button>
      </section>
    </div>
  )
}
