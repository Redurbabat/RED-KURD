// Speichert die aktive App. Laeuft ueber die zentrale Storage-Schicht
// (src/core/storage.js) — sie faengt fehlenden oder vollen localStorage
// bereits ab, die App kann daran nie zerbrechen.
//
// Schluessel: red-kurd-active-app-v1 (neu). Der alte Schluessel
// red-kurd-active-app-mode-v1 wird beim Lesen uebernommen und beim
// Speichern weiter mitgeschrieben — ein Ruecksprung auf eine aeltere
// App-Version verliert so nichts (Regel: alte Schluessel nie loeschen).
import { KEYS, lies, schreibe } from '../../core/storage.js'
import { APP_MODES, APP_MODE_LISTE } from './appModes.js'

export function isValidAppMode(mode) {
  return APP_MODE_LISTE.includes(mode)
}

/** Gespeicherte App lesen — ungueltige Werte fallen auf Sprache zurueck. */
export function loadAppMode() {
  const neu = lies(KEYS.appAktiv)
  if (isValidAppMode(neu)) return neu
  const alt = lies(KEYS.appBereich)
  if (isValidAppMode(alt)) {
    schreibe(KEYS.appAktiv, alt)
    return alt
  }
  return APP_MODES.LANGUAGE
}

/** Wurde schon einmal eine App gewaehlt? (Sonst zeigt der Start die Auswahl.) */
export function hatGespeicherteApp() {
  return isValidAppMode(lies(KEYS.appAktiv)) || isValidAppMode(lies(KEYS.appBereich))
}

/** @returns {boolean} ob gespeichert wurde (false z. B. im privaten Modus) */
export function saveAppMode(mode) {
  if (!isValidAppMode(mode)) return false
  const ok = schreibe(KEYS.appAktiv, mode)
  schreibe(KEYS.appBereich, mode)
  return ok
}
