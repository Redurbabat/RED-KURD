// Der echte Lernstand des Bereichs „Elektro-Lehre" — eigener Schluessel,
// gleiche Regeln wie alle Bereiche (erledigt, XP, Serie).
import { KEYS } from '../../core/storage.js'
import { erstelleBereichsLernstand } from '../../core/lernbereiche/bereichsLernstand.js'

export const electroLernstand = erstelleBereichsLernstand(KEYS.electroFortschritt)
