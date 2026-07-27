// Laufende Sitzung: wird nach jeder Aufgabe gesichert, damit ein Reload
// oder ein Moduswechsel die Sitzung nicht verliert.
import { KEYS, lies, schreibe, entferne } from '../storage.js'
import { melden } from '../store.js'

export function sitzungSpeichern(daten) {
  schreibe(KEYS.sitzung, { ...daten, gespeichert: new Date().toISOString() })
  melden()
}

export function sitzungLaden() {
  const s = lies(KEYS.sitzung)
  if (!s || !Array.isArray(s.uebungen) || !s.uebungen.length) return null
  if (s.index >= s.uebungen.length) return null
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
