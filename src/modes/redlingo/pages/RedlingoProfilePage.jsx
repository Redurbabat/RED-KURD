import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { statistik, wochenAktivitaet, lernzeitText } from '../../../core/progress/progressSelectors.ts'
import { level } from '../../../core/progress/progressStore.js'
import { holeProfil } from '../../../core/profile/profileStore.js'
import { kursFortschritt } from '../../../core/courses/courseRepository.ts'
import { holeAuszeichnungen } from '../../../core/achievements/achievementsStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'

function initiale(name) {
  const sauber = String(name || '').trim()
  return sauber ? sauber.slice(0, 1).toUpperCase() : 'R'
}

export default function RedlingoProfilePage() {
  useLernstand()

  const profil = holeProfil() || {}
  const name = profil.name?.trim() || 'Redlingo-Lernende/r'
  const s = statistik()
  const stufe = level()
  const kurs = kursFortschritt()
  const woche = wochenAktivitaet()
  const auszeichnungen = holeAuszeichnungen()
  const frei = auszeichnungen.filter((a) => a.frei)
  const maxTag = Math.max(1, ...woche.map((tag) => tag.anzahl))

  return (
    <div className="rl-seite rl-profilseite">
      <section className="rl-profilkopf">
        <div className="rl-avatar" aria-hidden="true">{initiale(name)}</div>
        <div className="rl-profiltext">
          <span className="rl-kicker">MEIN PROFIL</span>
          <h1>{name}</h1>
          <p>Kurmancî · Level {stufe.stufe}</p>
        </div>
        <button type="button" className="rl-rundknopf rk-taktil" onClick={() => navigiere('/settings')} aria-label="Einstellungen öffnen">
          <Icon name="einstellungen" groesse={22} />
        </button>
      </section>

      <section className="rl-levelkarte" aria-labelledby="rl-level-titel">
        <div className="rl-abschnittskopf">
          <div>
            <span className="rl-kicker">LEVEL</span>
            <h2 id="rl-level-titel">Stufe {stufe.stufe}</h2>
          </div>
          <strong>{s.xp} XP</strong>
        </div>
        <ProgressBar
          wert={stufe.fortschritt}
          label={`Fortschritt in Level ${stufe.stufe}`}
          zeigeWert
        />
        <p>Noch {stufe.bisNaechstes} XP bis zur nächsten Stufe.</p>
      </section>

      <ul className="rl-profilzahlen" aria-label="Profilzahlen">
        <li><Icon name="flamme" groesse={20} /><strong>{s.serie}</strong><span>Tage Serie</span></li>
        <li><Icon name="buch" groesse={20} /><strong>{s.gelernt}</strong><span>Wörter</span></li>
        <li><Icon name="kurs" groesse={20} /><strong>{kurs.prozent}%</strong><span>Kurs</span></li>
        <li><Icon name="uhr" groesse={20} /><strong>{lernzeitText(s.lernzeit)}</strong><span>Lernzeit</span></li>
      </ul>

      <section className="rl-bereich" aria-labelledby="rl-woche-titel">
        <div className="rl-abschnittskopf">
          <div>
            <span className="rl-kicker">AKTIVITÄT</span>
            <h2 id="rl-woche-titel">Diese Woche</h2>
          </div>
        </div>
        <ul className="rl-balkendiagramm">
          {woche.map((tag) => (
            <li key={tag.datum} className={tag.heute ? 'heute' : ''}>
              <strong>{tag.anzahl}</strong>
              <span className="rl-balken-aussen" aria-hidden="true">
                <span style={{ height: `${Math.max(tag.anzahl ? 12 : 3, (tag.anzahl / maxTag) * 100)}%` }} />
              </span>
              <small>{tag.tag}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="rl-bereich" aria-labelledby="rl-abzeichen-titel">
        <div className="rl-abschnittskopf">
          <div>
            <span className="rl-kicker">ERFOLGE</span>
            <h2 id="rl-abzeichen-titel">Auszeichnungen</h2>
          </div>
          <strong>{frei.length}/{auszeichnungen.length}</strong>
        </div>
        <ul className="rl-abzeichenraster">
          {auszeichnungen.slice(0, 6).map((auszeichnung) => (
            <li key={auszeichnung.id} className={auszeichnung.frei ? 'frei' : 'gesperrt'}>
              <span><Icon name={auszeichnung.frei ? 'stern' : 'schloss'} groesse={24} /></span>
              <strong>{auszeichnung.name}</strong>
              <small>{auszeichnung.frei ? 'Erreicht' : 'Noch gesperrt'}</small>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="rl-einstellungszeile rk-taktil" onClick={() => navigiere('/settings')}>
        <Icon name="einstellungen" groesse={21} />
        <span><strong>Einstellungen</strong><small>Modus, Profil, Ton und lokale Daten</small></span>
        <Icon name="pfeilRechts" groesse={18} />
      </button>
    </div>
  )
}
