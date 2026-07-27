// Profil des Abenteuer-Modus: Level, Zahlen, Welten, Auszeichnungen und
// das gewählte Aussehen. Alle Werte kommen aus dem einen gemeinsamen Lernstand.
import { useLernstand } from '../../../core/store.js'
import { Link } from '../../../app/router.jsx'
import { statistik } from '../../../core/progress/progressSelectors.js'
import { level } from '../../../core/progress/progressStore.js'
import { WELTEN, weltFortschritt } from '../../../core/courses/courseRepository.js'
import { holeProfil } from '../../../core/profile/profileStore.js'
import { holeAuszeichnungen } from '../../../core/achievements/achievementsStore.js'
import { aktiverArtikel } from '../../../core/shop/shopStore.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { StatTile } from '../../../components/common/StatChip.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './AdventureProfilePage.css'

/** Aussehen und Komfort aus dem Shop — die Reihenfolge bestimmt die Anzeige. */
const AUSSEHEN = [
  { art: 'mascot', name: 'Begleiter', icon: 'schal' },
  { art: 'thema', name: 'Thema der Weltkarte', icon: 'berg' },
  { art: 'rahmen', name: 'Profilrahmen', icon: 'rahmen' },
  { art: 'klang', name: 'Klang', icon: 'note' },
]

/** „2026-07-27“ → „27.07.2026“ */
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
  const name = (profil && profil.name) || 'Dein Profil'
  const rahmen = aktiverArtikel('rahmen')
  const auszeichnungen = holeAuszeichnungen()
  const frei = auszeichnungen.filter((a) => a.frei).length
  const weltenFertig = WELTEN.filter((w) => !weltFortschritt(w.id).offen).length

  return (
    <div className="ap-seite">
      <PageHeader
        titel="Profil"
        untertitel="Dein Stand, deine Welten und deine Auszeichnungen."
        ohneMaskottchen
      />

      <div className="adv-held ap-kopf">
        <span className={'ap-rahmen' + (rahmen ? ' ap-rahmen-gold' : '')}>
          <HeloMascot variante="daumen" groesse={92} dekorativ />
        </span>
        <div className="adv-held-text">
          <span className="adv-held-etikett">Dein Abenteuer</span>
          <h2>{name}</h2>
          <p className="ap-level">
            Level {stufe.stufe} · noch {stufe.bisNaechstes} XP bis Level {stufe.stufe + 1}
          </p>
          <ProgressBar
            wert={stufe.fortschritt}
            max={100}
            label={`Level ${stufe.stufe}: ${stufe.fortschritt} von 100 XP bis Level ${stufe.stufe + 1}`}
            farbe="gold"
            klein
          />
          {rahmen && (
            <p className="ap-rahmen-hinweis">
              <Icon name="rahmen" groesse={16} />
              <span>{rahmen.name} angelegt</span>
            </p>
          )}
        </div>
      </div>

      <section className="rk-abschnitt" aria-labelledby="ap-zahlen-titel">
        <h2 className="rk-abschnitt-titel" id="ap-zahlen-titel">
          Deine Zahlen
        </h2>
        <ul className="ap-zahlen" role="list">
          <li>
            <StatTile icon="edelstein" wert={s.edelsteine} label="Edelsteine" />
          </li>
          <li>
            <StatTile icon="schluessel" wert={s.schluessel} label="Schlüssel" />
          </li>
          <li>
            <StatTile icon="flamme" wert={s.serie} label="Tage Serie" />
          </li>
          <li>
            <StatTile icon="buch" wert={s.gelernt} label="Wörter gelernt" />
          </li>
          <li>
            <StatTile icon="schild" wert={s.sicher} label="Wörter sicher" />
          </li>
          <li>
            <StatTile
              icon="welt"
              wert={`${weltenFertig}/${WELTEN.length}`}
              label="Welten abgeschlossen"
            />
          </li>
        </ul>
      </section>

      <Card titel="Welten" icon="welt">
        <ul className="ap-welten" role="list">
          {WELTEN.map((w) => {
            const f = weltFortschritt(w.id)
            return (
              <li key={w.id} className="ap-welt">
                <div className="ap-welt-kopf">
                  <strong lang="de">
                    {w.nr}. {w.name}
                  </strong>
                  <span className="ap-welt-sterne">
                    <Icon name="stern" groesse={16} />
                    <span>
                      {f.sterne} von {f.maxSterne} Sternen
                    </span>
                  </span>
                </div>
                <p className="ap-welt-unter" lang="ku">
                  {w.untertitel}
                </p>
                <ProgressBar
                  wert={f.prozent}
                  label={`Welt ${w.name}: ${f.prozent} Prozent abgeschlossen`}
                  farbe={f.offen ? 'gold' : 'green'}
                  klein
                />
                <p className="ap-welt-stand">
                  {f.fertig} von {f.gesamt} Einheiten · {f.prozent} %
                  {f.offen ? '' : ' · abgeschlossen'}
                </p>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card
        titel="Auszeichnungen"
        icon="krone"
        aktion={
          <Badge ton="gold" icon="stern">
            {frei} von {auszeichnungen.length}
          </Badge>
        }
      >
        <ul className="adv-abzeichenraster ap-abzeichen" role="list">
          {auszeichnungen.map((a) => (
            <li key={a.id} className={'adv-abzeichen' + (a.frei ? '' : ' gesperrt')}>
              <span className={`adv-abzeichen-icon ap-ton-${a.farbe}`}>
                <Icon name={a.icon} groesse={26} />
              </span>
              <strong>{a.name}</strong>
              <small>{a.beschreibung}</small>
              {a.frei ? (
                <span className="ap-abzeichen-status">
                  <Icon name="haken" groesse={14} />
                  <span>{a.seit ? `seit ${datumText(a.seit)}` : 'freigeschaltet'}</span>
                </span>
              ) : (
                <span className="ap-abzeichen-status">
                  <Icon name="schloss" groesse={14} />
                  <span>Noch nicht freigeschaltet</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card
        titel="Aussehen"
        icon="shop"
        aktion={
          <Link to="/adventure/shop" className="ap-shoplink">
            <span>Zum Shop</span>
            <Icon name="pfeilRechts" groesse={16} />
          </Link>
        }
      >
        <ul className="ap-aussehen" role="list">
          {AUSSEHEN.map((eintrag) => {
            const artikel = aktiverArtikel(eintrag.art)
            return (
              <li key={eintrag.art}>
                <Icon name={eintrag.icon} groesse={22} />
                <div className="ap-aussehen-text">
                  <strong>{eintrag.name}</strong>
                  <small>{artikel ? artikel.name : 'Nichts angelegt'}</small>
                </div>
                {artikel ? (
                  <Badge ton="gruen" icon="haken">
                    Aktiv
                  </Badge>
                ) : (
                  <Badge ton="neutral" icon="minus">
                    Frei
                  </Badge>
                )}
              </li>
            )
          })}
        </ul>
        <p className="ap-fussnote">
          Aussehen und Komfort ändern nichts am Kurs. Alle Lerninhalte bleiben frei zugänglich.
        </p>
      </Card>
    </div>
  )
}
