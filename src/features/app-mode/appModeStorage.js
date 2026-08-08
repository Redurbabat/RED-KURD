// Speichert die aktive App. Laeuft ueber die zentrale Storage-Schicht
// (src/core/storage.js) — sie faengt fehlenden oder vollen localStorage
// bereits ab, die App kann daran nie zerbrechen.
//
// Schluessel: red-kurd-active-app-v1 (neu). Der alte Schluessel
// red-kurd-active-app-mode-v1 wird beim Lesen uebernommen und beim
// Speichern weiter mitgeschrieben — ein Ruecksprung auf eine aeltere
// App-Version verliert so nichts (Regel: alte Schluessel nie loeschen).
import { KEYS, lies, schreibe } from '../../core/storage.ts'
import { setzeAppModus } from '../../core/ui/uiStore.ts'
import { APP_MODES, APP_MODE_LISTE } from './appModes.js'

export function isValidAppMode(mode) {
  return APP_MODE_LISTE.includes(mode)
}

// „Abenteuer" ist KEINE eigene App, sondern eine Ansicht der Sprach-App.
// Sollte je ein solcher Wert als App gespeichert worden sein, wird er zu
// „Sprache lernen + Abenteuer-Ansicht" migriert.
function istAbenteuerAltwert(wert) {
  return wert === 'adventure' || wert === 'abenteuer'
}

/** Gespeicherte App lesen — ungueltige Werte fallen auf Sprache zurueck. */
export function loadAppMode() {
  const neu = lies(KEYS.appAktiv)
  if (isValidAppMode(neu)) return neu
  const alt = lies(KEYS.appBereich)
  if (istAbenteuerAltwert(neu) || istAbenteuerAltwert(alt)) {
    setzeAppModus('abenteuer')
    saveAppMode(APP_MODES.LANGUAGE)
    return APP_MODES.LANGUAGE
  }
  if (isValidAppMode(alt)) {
    schreibe(KEYS.appAktiv, alt)
    return alt
  }
  return APP_MODES.LANGUAGE
}

/** Wurde schon einmal eine App gewaehlt? (Sonst zeigt der Start die Auswahl.) */
export function hatGespeicherteApp() {
  const neu = lies(KEYS.appAktiv)
  const alt = lies(KEYS.appBereich)
  return (
    isValidAppMode(neu) ||
    isValidAppMode(alt) ||
    istAbenteuerAltwert(neu) ||
    istAbenteuerAltwert(alt)
  )
}

/** @returns {boolean} ob gespeichert wurde (false z. B. im privaten Modus) */
export function saveAppMode(mode) {
  if (!isValidAppMode(mode)) return false
  const ok = schreibe(KEYS.appAktiv, mode)
  schreibe(KEYS.appBereich, mode)
  return ok
}
