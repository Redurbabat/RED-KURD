// Die App-Bereiche von RED-KURD. Jeder Bereich fuehlt sich wie eine
// eigene App an — sichtbar ist immer genau einer. Ein neuer Bereich ist
// ein Eintrag hier plus ein Feature-Ordner (siehe electro-learning).

import type { Appbereich } from '../../types/lernstand'

/**
 * Die Code-Namen der vier Bereiche. Der Typ ist ausgeschrieben, damit ein
 * Tippfehler im Wert hier auffaellt und nicht erst, wenn `loadAppMode()` ihn
 * als Bereich zurueckgibt — ohne Annotation waere jeder Wert nur `string`.
 */
export const APP_MODES: Record<'LANGUAGE' | 'CODE' | 'PROMPTING' | 'ELECTRO', Appbereich> = {
  LANGUAGE: 'language',
  CODE: 'code',
  PROMPTING: 'prompting',
  ELECTRO: 'electro',
}

// `Record<Appbereich, string>` statt einer Index-Signatur: so fehlt beim
// naechsten Bereich keines der drei Verzeichnisse still, und der Zugriff
// bleibt trotz `noUncheckedIndexedAccess` ein `string` statt `string | undefined`.
export const APP_MODE_LABELS: Record<Appbereich, string> = {
  language: 'Sprache lernen',
  code: 'Code lernen',
  prompting: 'AI-Sprache',
  electro: 'Elektro-Lehre',
}

/** Kurzform fuer schmale Bildschirme: „Sprache | Code | AI". */
export const APP_MODE_KURZ: Record<Appbereich, string> = {
  language: 'Sprache',
  code: 'Code',
  prompting: 'AI',
  electro: 'Elektro',
}

export const APP_MODE_BESCHREIBUNGEN: Record<Appbereich, string> = {
  language: 'Kurdisch, Englisch, Französisch …',
  code: 'HTML, CSS, JavaScript, TypeScript …',
  prompting: 'Prompts, Claude, Aufträge …',
  electro: 'Strom, Sicherheit, Messen …',
}

/** Reihenfolge der Bereiche im Umschalter. */
export const APP_MODE_LISTE: readonly Appbereich[] = [
  APP_MODES.LANGUAGE,
  APP_MODES.CODE,
  APP_MODES.PROMPTING,
  APP_MODES.ELECTRO,
]
