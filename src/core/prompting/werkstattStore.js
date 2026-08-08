// Die Werkstatt der AI-Sprache: angefangene Auftraege, Bug-Reports und
// die Haken der PR-Checkliste bleiben erhalten — auch nach dem Neuladen.
// Alles lokal ueber src/core/storage.js.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden } from '../store.ts'

const LEER = { version: 1, auftrag: {}, bug: {}, pr: {} }

let cache = null

function laden() {
  if (cache) return cache
  const gespeichert = lies(KEYS.promptingWerkstatt)
  cache = {
    ...LEER,
    ...(gespeichert || {}),
    auftrag: gespeichert?.auftrag && typeof gespeichert.auftrag === 'object' ? gespeichert.auftrag : {},
    bug: gespeichert?.bug && typeof gespeichert.bug === 'object' ? gespeichert.bug : {},
    pr: gespeichert?.pr && typeof gespeichert.pr === 'object' ? gespeichert.pr : {},
  }
  return cache
}

function sichern(neu) {
  cache = neu
  schreibe(KEYS.promptingWerkstatt, cache)
  melden()
  return cache
}

export function holeAuftrag() {
  return laden().auftrag
}

export function setzeAuftragsFeld(feld, wert) {
  return sichern({ ...laden(), auftrag: { ...laden().auftrag, [feld]: wert } })
}

export function leereAuftrag() {
  return sichern({ ...laden(), auftrag: {} })
}

export function holeBug() {
  return laden().bug
}

export function setzeBugFeld(feld, wert) {
  return sichern({ ...laden(), bug: { ...laden().bug, [feld]: wert } })
}

export function leereBug() {
  return sichern({ ...laden(), bug: {} })
}

export function holePr() {
  return laden().pr
}

export function schaltePr(id) {
  const alt = laden().pr
  return sichern({ ...laden(), pr: { ...alt, [id]: !alt[id] } })
}

export function leerePr() {
  return sichern({ ...laden(), pr: {} })
}

/** Nur fuer Tests: Zwischenspeicher leeren. */
export function _cacheLeeren() {
  cache = null
}
