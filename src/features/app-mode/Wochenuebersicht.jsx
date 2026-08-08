// Die gemeinsame Woche über alle vier Apps — steht auf der App-Auswahl.
// Zeigt je Tag, in welchen Apps etwas los war, und je App ihre eigene
// Zahl mit eigener Einheit (Sprache zählt Aufgaben, die anderen XP).
import Icon from '../../components/icons/Icon.jsx'
import { KEYS, lies } from '../../core/storage.js'
import { heute } from '../../core/progress/scheduler.js'
import { reiheGesamt, wochenUebersicht } from '../../core/lernbereiche/wochenUebersicht.js'
import { APP_MODES, APP_MODE_LABELS } from './appModes.js'

/** Liest die Tageswerte aller Apps direkt aus dem Speicher. */
function sammleApps() {
  const sprache = lies(KEYS.fortschritt) || {}
  return [
    {
      id: APP_MODES.LANGUAGE,
      name: APP_MODE_LABELS[APP_MODES.LANGUAGE],
      einheit: 'Aufgaben',
      tage: sprache.tage || {},
      feld: 'aufgaben',
    },
    {
      id: APP_MODES.CODE,
      name: APP_MODE_LABELS[APP_MODES.CODE],
      einheit: 'XP',
      tage: (lies(KEYS.codeFortschritt) || {}).tage || {},
    },
    {
      id: APP_MODES.PROMPTING,
      name: APP_MODE_LABELS[APP_MODES.PROMPTING],
      einheit: 'XP',
      tage: (lies(KEYS.promptingFortschritt) || {}).tage || {},
    },
    {
      id: APP_MODES.ELECTRO,
      name: APP_MODE_LABELS[APP_MODES.ELECTRO],
      einheit: 'XP',
      tage: (lies(KEYS.electroFortschritt) || {}).tage || {},
    },
  ]
}

export default function Wochenuebersicht() {
  const woche = wochenUebersicht(sammleApps(), heute())
  const reihe = reiheGesamt(woche.tageAktiv)
  const genutzt = woche.apps.filter((a) => a.summe > 0)

  return (
    <section className="woche-uebersicht" aria-labelledby="woche-titel">
      <h2 id="woche-titel">Deine Woche</h2>

      <ol className="woche-tage">
        {woche.tage.map((tag, i) => (
          <li key={tag.datum} className={`woche-tag${woche.tageAktiv[i] ? ' aktiv' : ''}${tag.heute ? ' heute' : ''}`}>
            <span className="woche-tag-punkt" aria-hidden="true">
              {woche.tageAktiv[i] && <Icon name="haken" groesse={14} />}
            </span>
            <span className="woche-tag-name">{tag.kurz}</span>
            <span className="nur-sr">
              {tag.datum}: {woche.tageAktiv[i] ? 'gelernt' : 'nichts gelernt'}
            </span>
          </li>
        ))}
      </ol>

      <p className="woche-zusammenfassung">
        {woche.aktiveTage === 0 ? (
          'Diese Woche war noch nichts los — such dir unten eine App aus.'
        ) : (
          <>
            <strong>
              {woche.aktiveTage} von 7 Tagen
            </strong>{' '}
            gelernt
            {reihe >= 2 ? ` · ${reihe} Tage am Stück` : ''}
          </>
        )}
      </p>

      {genutzt.length > 0 && (
        <ul className="woche-apps">
          {genutzt.map((app) => (
            <li key={app.id} className={`woche-app bereich-${app.id}`}>
              <span className="woche-app-name">{app.name}</span>
              <span className="woche-app-wert">
                {app.summe} {app.einheit}
                <span className="woche-app-tage">
                  {' '}
                  · {app.aktiveTage} {app.aktiveTage === 1 ? 'Tag' : 'Tage'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
