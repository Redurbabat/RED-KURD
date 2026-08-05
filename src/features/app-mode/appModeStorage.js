// Speichert den aktiven App-Bereich. Laeuft ueber die zentrale
// Storage-Schicht (src/core/storage.js) — sie faengt fehlenden oder vollen
// localStorage bereits ab, die App kann daran nie zerbrechen.
import { KEYS, lies, schreibe } from '../../core/storage.js'
import { APP_MODES, APP_MODE_LISTE } from './appModes.js'

export function isValidAppMode(mode) {
  return APP_MODE_LISTE.includes(mode)
}

/** Gespeicherten Bereich lesen — ungueltige Werte fallen auf Sprache zurueck. */
export function loadAppMode() {
  const wert = lies(KEYS.appBereich)
  return isValidAppMode(wert) ? wert : APP_MODES.LANGUAGE
}

/** @returns {boolean} ob gespeichert wurde (false z. B. im privaten Modus) */
export function saveAppMode(mode) {
  if (!isValidAppMode(mode)) return false
  return schreibe(KEYS.appBereich, mode)
}
