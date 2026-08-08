// Speichert die aktive App. Laeuft ueber die zentrale Storage-Schicht
// (src/core/storage.ts) — sie faengt fehlenden oder vollen localStorage
// bereits ab, die App kann daran nie zerbrechen.
//
// Schluessel: red-kurd-active-app-v1 (neu). Der alte Schluessel
// red-kurd-active-app-mode-v1 wird beim Lesen uebernommen und beim
// Speichern weiter mitgeschrieben — ein Ruecksprung auf eine aeltere
// App-Version verliert so nichts (Regel: alte Schluessel nie loeschen).
import { KEYS, lies, schreibe } from '../../core/storage.ts'
import { setzeAppModus } from '../../core/ui/uiStore.ts'
import { APP_MODES, APP_MODE_LISTE } from './appModes.ts'

import type { Appbereich } from '../../types/lernstand'

/**
 * Der Waechter zwischen Platte und App: was hier hereinkommt, hat niemand
 * geprueft — `lies()` gibt zurueck, was im JSON stand, und die Seiten reichen
 * auch Nutzereingaben durch. Deshalb `unknown` und ein Typwaechter statt einer
 * Zusage.
 *
 * `APP_MODE_LISTE.includes(mode)` verlangte `mode` bereits als `Appbereich` —
 * also genau das, was die Pruefung erst feststellen soll. `some` prueft
 * dasselbe (Gleichheit gegen dieselben vier Werte) und laesst `unknown` zu.
 */
export function isValidAppMode(mode: unknown): mode is Appbereich {
  return APP_MODE_LISTE.some((bereich) => bereich === mode)
}

// „Abenteuer" ist KEINE eigene App, sondern eine Ansicht der Sprach-App.
// Sollte je ein solcher Wert als App gespeichert worden sein, wird er zu
// „Sprache lernen + Abenteuer-Ansicht" migriert.
function istAbenteuerAltwert(wert: unknown): boolean {
  return wert === 'adventure' || wert === 'abenteuer'
}

/** Gespeicherte App lesen — ungueltige Werte fallen auf Sprache zurueck. */
export function loadAppMode(): Appbereich {
  // Ohne Typargument bleibt der gelesene Wert `unknown` — ehrlicher als eine
  // Erwartung, die erst `isValidAppMode()` einloest.
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
export function hatGespeicherteApp(): boolean {
  const neu = lies(KEYS.appAktiv)
  const alt = lies(KEYS.appBereich)
  return (
    isValidAppMode(neu) ||
    isValidAppMode(alt) ||
    istAbenteuerAltwert(neu) ||
    istAbenteuerAltwert(alt)
  )
}

/**
 * `mode` ist `unknown`, weil die Seiten hier auch Ungeprueftes durchreichen
 * duerfen — der Waechter oben ist die einzige Stelle, die entscheidet.
 *
 * @returns ob gespeichert wurde (false z. B. im privaten Modus)
 */
export function saveAppMode(mode: unknown): boolean {
  if (!isValidAppMode(mode)) return false
  const ok = schreibe(KEYS.appAktiv, mode)
  // Diese Zeile darf nicht verschwinden: der alte Schluessel wird weiter
  // mitgeschrieben, damit ein Ruecksprung auf eine aeltere App-Version die
  // App-Wahl noch findet (CLAUDE.md Grundsatz 3).
  schreibe(KEYS.appBereich, mode)
  return ok
}
