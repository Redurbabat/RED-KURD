// Herzen des Abenteuer-Modus: 5 Herzen, eine falsche Antwort kostet eines,
// alle 4 Stunden waechst eines nach, mit Edelsteinen laesst sich auffuellen.
// WICHTIG (RED-KURD-Grundsatz): Herzen sperren NIE Lerninhalte — bei 0 Herzen
// laeuft die Lektion als Uebungslauf weiter, es gibt nur keine Edelstein-
// belohnung mehr fuer diese Runde. Der Modern-Modus benutzt Herzen nicht.
import { lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import { zahleEdelsteine } from '../progress/progressStore.js'

export const MAX_HERZEN = 5
export const NACHFUELL_PREIS = 10 // Edelsteine fuer volle Herzen
const REGEN_MS = 4 * 60 * 60 * 1000 // 1 Herz je 4 Stunden

const KEY = 'red-kurd-hearts-v1'

const LEER = { version: 1, herzen: MAX_HERZEN, zuletzt: 0 }

let cache = null

function laden() {
  if (cache) return cache
  cache = { ...LEER, ...(lies(KEY) || {}) }
  return cache
}

function sichern(d) {
  cache = d
  schreibe(KEY, d)
  melden()
  return d
}

/** Nachgewachsene Herzen gutschreiben (wird bei jedem Lesen angewendet). */
function mitRegeneration(d) {
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

export function herzen() {
  const d = mitRegeneration(laden())
  if (d !== cache) sichern(d)
  return d.herzen
}

/** @returns {number} verbleibende Herzen */
export function verliereHerz() {
  const d = { ...mitRegeneration(laden()) }
  if (d.herzen <= 0) return 0
  if (d.herzen === MAX_HERZEN) d.zuletzt = Date.now()
  d.herzen -= 1
  sichern(d)
  return d.herzen
}

/** Volle Herzen gegen Edelsteine. @returns {boolean} ob es geklappt hat */
export function fuelleHerzenAuf() {
  const d = mitRegeneration(laden())
  if (d.herzen >= MAX_HERZEN) return false
  if (!zahleEdelsteine(NACHFUELL_PREIS)) return false
  sichern({ ...d, herzen: MAX_HERZEN, zuletzt: 0 })
  return true
}

/** Ein einzelnes Herz gutschreiben (z. B. Belohnung). */
export function gibHerz(n = 1) {
  const d = mitRegeneration(laden())
  sichern({ ...d, herzen: Math.min(MAX_HERZEN, d.herzen + n) })
}

/** Minuten bis zum naechsten Herz, oder null bei vollen Herzen. */
export function naechstesHerzIn() {
  const d = mitRegeneration(laden())
  if (d.herzen >= MAX_HERZEN || !d.zuletzt) return null
  const rest = REGEN_MS - (Date.now() - d.zuletzt)
  return Math.max(1, Math.ceil(rest / 60000))
}

beiFremdaenderung((key) => {
  if (key === KEY) cache = null
})
