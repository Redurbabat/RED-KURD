// Die App-Bereiche von RED-KURD. Jeder Bereich fuehlt sich wie eine
// eigene App an — sichtbar ist immer genau einer. Ein neuer Bereich ist
// ein Eintrag hier plus ein Feature-Ordner (siehe electro-learning).

export const APP_MODES = {
  LANGUAGE: 'language',
  CODE: 'code',
  PROMPTING: 'prompting',
  ELECTRO: 'electro',
}

export const APP_MODE_LABELS = {
  language: 'Sprache lernen',
  code: 'Code lernen',
  prompting: 'AI-Sprache',
  electro: 'Elektro-Lehre',
}

/** Kurzform fuer schmale Bildschirme: „Sprache | Code | AI". */
export const APP_MODE_KURZ = {
  language: 'Sprache',
  code: 'Code',
  prompting: 'AI',
  electro: 'Elektro',
}

export const APP_MODE_BESCHREIBUNGEN = {
  language: 'Kurdisch, Englisch, Französisch …',
  code: 'HTML, CSS, JavaScript, TypeScript …',
  prompting: 'Prompts, Claude, Aufträge …',
  electro: 'Strom, Sicherheit, Messen …',
}

/** Reihenfolge der Bereiche im Umschalter. */
export const APP_MODE_LISTE = [APP_MODES.LANGUAGE, APP_MODES.CODE, APP_MODES.PROMPTING, APP_MODES.ELECTRO]
