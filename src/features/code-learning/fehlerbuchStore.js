// Das Fehlerbuch: eigene Fehler, Loesungen und Gelerntes — bleibt lokal
// auf dem Geraet. Neueste Eintraege stehen oben.
import { KEYS, lies, schreibe } from '../../core/storage.js'
import { melden, beiFremdaenderung } from '../../core/store.js'
import { heute } from '../../core/progress/scheduler.ts'

const LEER = { version: 1, naechsteId: 1, eintraege: [] }

let cache = null

function laden() {
  if (cache) return cache
  const d = lies(KEYS.fehlerbuch) || {}
  cache = { ...LEER, ...d, eintraege: [...(d.eintraege || [])] }
  return cache
}

function sichern(d) {
  cache = d
  schreibe(KEYS.fehlerbuch, d)
  melden()
  return d
}

export function fehlerbuchEintraege() {
  return laden().eintraege
}

/**
 * Eintrag anlegen. Titel und Fehlerbeschreibung sind Pflicht.
 * @returns {Object|null} der neue Eintrag oder null bei leerer Eingabe
 */
export function fehlerNotieren({ titel, fehler, loesung = '' }) {
  const t = String(titel || '').trim()
  const f = String(fehler || '').trim()
  if (!t || !f) return null
  const d = laden()
  const eintrag = {
    id: `f-${d.naechsteId}`,
    titel: t,
    fehler: f,
    loesung: String(loesung || '').trim(),
    datum: heute(),
  }
  sichern({ ...d, naechsteId: d.naechsteId + 1, eintraege: [eintrag, ...d.eintraege] })
  return eintrag
}

/** @returns {boolean} ob ein Eintrag entfernt wurde */
export function fehlerEntfernen(id) {
  const d = laden()
  const rest = d.eintraege.filter((e) => e.id !== id)
  if (rest.length === d.eintraege.length) return false
  sichern({ ...d, eintraege: rest })
  return true
}

beiFremdaenderung((key) => {
  if (key === KEYS.fehlerbuch) cache = null
})
