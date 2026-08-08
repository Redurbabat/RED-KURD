// Herzen des Abenteuer-Modus: 5 Herzen, eine falsche Antwort kostet eines,
// alle 4 Stunden waechst eines nach, mit Edelsteinen laesst sich auffuellen.
// WICHTIG (RED-KURD-Grundsatz): Herzen sperren NIE Lerninhalte — bei 0 Herzen
// laeuft die Lektion als Uebungslauf weiter, es gibt nur keine Edelstein-
// belohnung mehr fuer diese Runde. Der Modern-Modus benutzt Herzen nicht.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'
import { zahleEdelsteine } from '../progress/progressStore.ts'

import type { Herzenstand } from '../../types/lernstand'

export const MAX_HERZEN = 5
export const NACHFUELL_PREIS = 10 // Edelsteine fuer volle Herzen
const REGEN_MS = 4 * 60 * 60 * 1000 // 1 Herz je 4 Stunden

const KEY = KEYS.herzen

const LEER: Herzenstand = { version: 1, herzen: MAX_HERZEN, zuletzt: 0 }

let cache: Herzenstand | null = null

function laden(): Herzenstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Stand liegen darf — der Typ ist die Erwartung des Aufrufers, keine Zusage
  // von `lies()`. Der `LEER`-Spread macht daraus wieder einen vollstaendigen
  // Stand; das `|| {}` faengt zusaetzlich ein ausdrueckliches `null` ab, das
  // kein Typ beschreibt.
  cache = { ...LEER, ...(lies<Partial<Herzenstand>>(KEY) || {}) }
  return cache
}

function sichern(d: Herzenstand): Herzenstand {
  cache = d
  schreibe(KEY, d)
  melden()
  return d
}

/** Nachgewachsene Herzen gutschreiben (wird bei jedem Lesen angewendet). */
function mitRegeneration(d: Herzenstand): Herzenstand {
  // `zuletzt` sind Epoch-Millisekunden, kein Tagesschluessel: `0` heisst
  // „keine Uhr laeuft" und faellt hier durch das `!`.
  if (d.herzen >= MAX_HERZEN || !d.zuletzt) return d
  const vergangen = Date.now() - d.zuletzt
  const neue = Math.floor(vergangen / REGEN_MS)
  if (neue <= 0) return d
  return {
    ...d,
    herzen: Math.min(MAX_HERZEN, d.herzen + neue),
    zuletzt: d.herzen + neue >= MAX_HERZEN ? 0 : d.zuletzt + neue * REGEN_MS,
  }
}

export function herzen(): number {
  const d = mitRegeneration(laden())
  // `mitRegeneration()` gibt denselben Stand zurueck, solange nichts
  // nachgewachsen ist — die Ungleichheit ist also die Frage „gab es etwas
  // gutzuschreiben?" und kein zufaelliger Objektvergleich.
  if (d !== cache) sichern(d)
  return d.herzen
}

/** @returns verbleibende Herzen */
export function verliereHerz(): number {
  const d = { ...mitRegeneration(laden()) }
  if (d.herzen <= 0) return 0
  if (d.herzen === MAX_HERZEN) d.zuletzt = Date.now()
  d.herzen -= 1
  sichern(d)
  return d.herzen
}

/** Volle Herzen gegen Edelsteine. @returns ob es geklappt hat */
export function fuelleHerzenAuf(): boolean {
  const d = mitRegeneration(laden())
  if (d.herzen >= MAX_HERZEN) return false
  if (!zahleEdelsteine(NACHFUELL_PREIS)) return false
  sichern({ ...d, herzen: MAX_HERZEN, zuletzt: 0 })
  return true
}

/** Ein einzelnes Herz gutschreiben (z. B. Belohnung). */
export function gibHerz(n: number = 1): void {
  const d = mitRegeneration(laden())
  sichern({ ...d, herzen: Math.min(MAX_HERZEN, d.herzen + n) })
}

/** Minuten bis zum naechsten Herz, oder null bei vollen Herzen. */
export function naechstesHerzIn(): number | null {
  const d = mitRegeneration(laden())
  if (d.herzen >= MAX_HERZEN || !d.zuletzt) return null
  const rest = REGEN_MS - (Date.now() - d.zuletzt)
  return Math.max(1, Math.ceil(rest / 60000))
}

beiFremdaenderung((key) => {
  if (key === KEY) cache = null
})
