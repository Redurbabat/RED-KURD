// Der echte Lernstand des Bereichs „Code lernen" — eigener Schluessel,
// gleiche Regeln wie alle Bereiche (erledigt, XP, Serie).
import { KEYS } from '../../core/storage.ts'
import { erstelleBereichsLernstand } from '../../core/lernbereiche/bereichsLernstand.ts'

export const codeLernstand = erstelleBereichsLernstand(KEYS.codeFortschritt)
export { XP_JE_LEKTION } from '../../core/lernbereiche/bereichsLernstand.ts'
