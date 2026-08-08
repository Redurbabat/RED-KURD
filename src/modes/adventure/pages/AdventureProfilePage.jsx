// Profil des Abenteuer-Modus (Designpaket Bild 11): Profilkopf mit Level,
// vier Kennzahlen, Auszeichnungen und Wochenaktivität. Alle Werte kommen aus
// dem einen gemeinsamen Lernstand.
import { useLernstand } from '../../../core/store.ts'
import { Link } from '../../../app/router.jsx'
import { statistik, wochenAktivitaet } from '../../../core/progress/progressSelectors.ts'
import { level } from '../../../core/progress/progressStore.ts'
import { WELTEN, weltFortschritt } from '../../../core/courses/courseRepository.ts'
import { holeProfil } from '../../../core/profile/profileStore.ts'
import { holeAuszeichnungen } from '../../../core/achievements/achievementsStore.ts'
import { aktiverArtikel } from '../../../core/shop/shopStore.ts'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import './AdventureProfilePage.css'

/** Erster Buchstabe des Namens für die Plakette. */
function initialeVon(name) {
  const sauber = (name || '').trim()
  return sauber ? sauber.charAt(0).toUpperCase() : 'H'
}

/** „2026-07-27" → „27.07.2026" */
function datumText(iso) {
  if (!iso) return null
  const teile = iso.split('-')
  if (teile.length !== 3) return iso
  return `${teile[2]}.${teile[1]}.${teile[0]}`
}

export default function AdventureProfilePage() {
  useLernstand()

  const s = statistik()
  const stufe = level()
  const profil = holeProfil()
  const name = (profil && profil.name && profil.name.trim()) || 'Hêlo'
  const rahmen = aktiverArtikel('rahmen')
  const auszeichnungen = holeAuszeichnungen()
  const frei = auszeichnungen.filter((a) => a.frei).length
  const weltenFertig = WELTEN.filter((w) => !weltFortschritt(w.id).offen).length

  const woche = wochenAktivitaet()
  const wochenMax = Math.max(1, ...woche.map((t) => t.anzahl))
  const wochenSumme = woche.reduce((summe, t) => summe + t.anzahl, 0)

  return (
    <div className="ap-seite">
      <PageHeader titel="Profil" untertitel="Dein Abenteuer und deine Erfolge." ohneMaskottchen />

      <div className="ap-kopf">
        <span
          className={'ap-plakette' + (rahmen ? ' ap-plakette-rahmen' : '')}
          aria-hidden="true"
        >
          {initialeVon(name)}
        </span>

        <div className="ap-kopf-text">
          <h2 className="ap-name">{name}</h2>
          <p className="ap-rolle">
            Level {stufe.stufe} · <span lang="ku">Kurmancî</span>-Lernender
          </p>
          <ProgressBar
            wert={stufe.fortschritt}
            max={100}
            label={`Level ${stufe.stufe}: noch ${stufe.bisNaechstes} XP bis Level ${stufe.stufe + 1}`}
            farbe="blue"
            zeigeWert
          />
          {rahmen && (
            <p className="ap-rahmen-hinweis">
              <Icon name="rahmen" groesse={16} />
              <span>{rahmen.name} angelegt</span>
            </p>
          )}
        </div>
      </div>

      <h2 className="nur-sr">Deine Zahlen</h2>
      <ul className="ap-kennzahlen" role="list">
        <li className="ap-kachel ap-kachel-gruen">
          <strong>
            {weltenFertig}/{WELTEN.length}
          </strong>
          <span>Welten</span>
        </li>
        <li className="ap-kachel ap-kachel-blau">
          <strong>{s.gelernt}</strong>
          <span>Wörter</span>
        </li>
        <li className="ap-kachel ap-kachel-orange">
          <strong>{s.serie}</strong>
          <span>Serie</span>
        </li>
        <li className="ap-kachel ap-kachel-gold">
          <strong>{s.xp}</strong>
          <span>XP</span>
        </li>
      </ul>

      <section className="rk-abschnitt" aria-labelledby="ap-abzeichen-titel">
        <div className="ap-abschnittskopf">
          <h2 className="rk-abschnitt-titel" id="ap-abzeichen-titel">
            Auszeichnungen
          </h2>
          <Badge ton="gold" icon="stern">
            {frei} von {auszeichnungen.length}
          </Badge>
        </div>

        <ul className="adv-abzeichenraster ap-abzeichenraster" role="list">
          {auszeichnungen.map((a, i) => (
            <li
              key={a.id}
              className={
                'adv-abzeichen ap-abzeichen' + (a.frei ? ` ap-ton-${a.farbe}` : ' gesperrt')
              }
            >
              <span className="adv-abzeichen-icon ap-abzeichen-icon">
                {a.frei ? (
                  <span className="ap-abzeichen-nr" aria-hidden="true">
                    {i + 1}
                  </span>
                ) : (
                  <Icon name="schloss" groesse={22} />
                )}
              </span>
              <strong>{a.name}</strong>
              <small className={'ap-abzeichen-status' + (a.frei ? ' frei' : '')}>
                {a.frei ? 'Freigeschaltet' : 'Gesperrt'}
              </small>
              <span className="nur-sr">
                {a.beschreibung}
                {a.frei && a.seit ? ` Erreicht am ${datumText(a.seit)}.` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rk-abschnitt" aria-labelledby="ap-woche-titel">
        <h2 className="rk-abschnitt-titel" id="ap-woche-titel">
          Wochenaktivität
        </h2>
        <Card className="ap-wochenkarte">
          <ul className="ap-woche" role="list">
            {woche.map((t) => (
              <li key={t.datum} className={'ap-woche-tag' + (t.heute ? ' heute' : '')}>
                <span className="ap-woche-saeule" aria-hidden="true">
                  <span
                    className="ap-woche-fuellung"
                    style={{ height: t.anzahl ? Math.max(8, (t.anzahl / wochenMax) * 100) + '%' : 0 }}
                  />
                </span>
                <span className="ap-woche-name" aria-hidden="true">
                  {t.tag}
                </span>
                <span className="nur-sr">
                  {t.tag}, {datumText(t.datum)}: {t.anzahl}{' '}
                  {t.anzahl === 1 ? 'Aufgabe' : 'Aufgaben'}
                  {t.heute ? ' (heute)' : ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="ap-woche-summe">
            {wochenSumme} {wochenSumme === 1 ? 'Aufgabe' : 'Aufgaben'} in den letzten sieben Tagen.
          </p>
        </Card>
      </section>

      {/* Der Basar ist bewusst kein Hauptbereich mehr — Lernen und Kultur
          stehen in der Navigation vorne. Hier im Profil bleibt er erreichbar. */}
      <section className="rk-abschnitt" aria-labelledby="ap-basar-titel">
        <h2 className="rk-abschnitt-titel" id="ap-basar-titel">
          Basar
        </h2>
        <Card className="ap-basarkarte">
          <p className="ap-basar-zahl">
            <Icon name="edelstein" groesse={20} />
            <strong>{s.edelsteine}</strong>
            <span>{s.edelsteine === 1 ? 'Edelstein' : 'Edelsteine'}</span>
          </p>
          <p className="ap-basar-text">
            Edelsteine sammelst du beim Lernen. Im Basar tauschst du sie gegen Schal, Weste
            und Kelim-Tasche für Hêlo — nichts davon schaltet Lerninhalte frei.
          </p>
          <Link to="/adventure/shop" className="ap-basar-link">
            <Icon name="shop" groesse={18} />
            <span>Basar öffnen</span>
            <Icon name="pfeilRechts" groesse={18} />
          </Link>
        </Card>
      </section>

      <Link to="/settings" className="ap-einstellungen">
        <Icon name="einstellungen" groesse={18} />
        <span>Zu den Einstellungen</span>
        <Icon name="pfeilRechts" groesse={18} />
      </Link>
    </div>
  )
}
