// Laufende Sitzung: wird nach jeder Aufgabe gesichert, damit ein Reload
// oder ein Moduswechsel die Sitzung nicht verliert.
import { KEYS, lies, schreibe, entferne } from '../storage.js'
import { melden } from '../store.js'

export function sitzungSpeichern(daten) {
  schreibe(KEYS.sitzung, { ...daten, gespeichert: new Date().toISOString() })
  melden()
}

// Nach zwei Tagen ist eine liegengebliebene Sitzung veraltet — sie wuerde
// sonst auf der Heute-Seite dauerhaft den aktuellen Tagesplan verdraengen.
const VERFALL_MS = 48 * 60 * 60 * 1000

export function sitzungLaden() {
  const s = lies(KEYS.sitzung)
  if (!s || !Array.isArray(s.uebungen) || !s.uebungen.length) return null
  // Korrupter Zeiger (fehlt, NaN, negativ) wuerde sonst als Sitzung mit
  // NaN-Prozent fortgesetzt.
  if (!Number.isInteger(s.index) || s.index < 0 || s.index >= s.uebungen.length) return null
  if (s.gespeichert) {
    const alter = Date.now() - Date.parse(s.gespeichert)
    if (!Number.isFinite(alter) || alter > VERFALL_MS) return null
  }
  return s
}

export function sitzungLoeschen() {
  entferne(KEYS.sitzung)
  melden()
}

export function sitzungProzent(s) {
  if (!s || !s.uebungen || !s.uebungen.length) return 0
  return Math.round((s.index / s.uebungen.length) * 100)
}
