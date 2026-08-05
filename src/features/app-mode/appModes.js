// Die drei App-Bereiche von RED-KURD. Jeder Bereich fuehlt sich wie eine
// eigene App an — sichtbar ist immer genau einer.

export const APP_MODES = {
  LANGUAGE: 'language',
  CODE: 'code',
  PROMPTING: 'prompting',
}

export const APP_MODE_LABELS = {
  language: 'Sprache lernen',
  code: 'Code lernen',
  prompting: 'AI-Sprache',
}

/** Kurzform fuer schmale Bildschirme: „Sprache | Code | AI". */
export const APP_MODE_KURZ = {
  language: 'Sprache',
  code: 'Code',
  prompting: 'AI',
}

export const APP_MODE_BESCHREIBUNGEN = {
  language: 'Kurdisch, Englisch, Französisch …',
  code: 'HTML, CSS, JavaScript, TypeScript …',
  prompting: 'Prompts, Claude, Aufträge …',
}

/** Reihenfolge der Bereiche im Umschalter. */
export const APP_MODE_LISTE = [APP_MODES.LANGUAGE, APP_MODES.CODE, APP_MODES.PROMPTING]
