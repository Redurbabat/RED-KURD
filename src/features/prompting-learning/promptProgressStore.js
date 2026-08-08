// Der echte Lernstand des Bereichs „AI-Sprache" — eigener Schluessel,
// gleiche Regeln wie alle Bereiche (erledigt, XP, Serie).
import { KEYS } from '../../core/storage.ts'
import { erstelleBereichsLernstand } from '../../core/lernbereiche/bereichsLernstand.js'

export const promptLernstand = erstelleBereichsLernstand(KEYS.promptingFortschritt)
export { XP_JE_LEKTION } from '../../core/lernbereiche/bereichsLernstand.js'
