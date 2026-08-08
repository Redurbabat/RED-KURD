// Die Werkstatt der AI-Sprache: angefangene Auftraege, Bug-Reports und
// die Haken der PR-Checkliste bleiben erhalten — auch nach dem Neuladen.
// Alles lokal ueber src/core/storage.ts.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden } from '../store.ts'

import type { Werkstattstand } from '../../types/lernstand'

export type { Werkstattstand } from '../../types/lernstand'

/**
 * Der Stand, wie `laden()` ihn herausgibt. Nur `version` ist keine Zusage: im
 * Spread gewinnt die gespeicherte Zahl, und die hat niemand geprueft — deshalb
 * `number` statt der `1` aus `Werkstattstand` (dieselbe Unterscheidung wie
 * `GeladenerSchulstand` im schuleStore).
 */
export interface GeladenerWerkstattstand extends Omit<Werkstattstand, 'version'> {
  version: number
}

const LEER: Werkstattstand = { version: 1, auftrag: {}, bug: {}, pr: {} }

let cache: GeladenerWerkstattstand | null = null

function laden(): GeladenerWerkstattstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Stand liegen darf, dem Felder fehlen. Der Typ ist die Erwartung dieses
  // Aufrufers, keine Zusage von `lies()` — genau deshalb bleiben die drei
  // Pruefungen darunter stehen: sie fangen auch einen Wert ab, der zwar da,
  // aber kein Objekt ist (etwa ein Text aus einem Import von Hand).
  const gespeichert = lies<Partial<Werkstattstand>>(KEYS.promptingWerkstatt)
  cache = {
    ...LEER,
    ...(gespeichert || {}),
    auftrag: gespeichert?.auftrag && typeof gespeichert.auftrag === 'object' ? gespeichert.auftrag : {},
    bug: gespeichert?.bug && typeof gespeichert.bug === 'object' ? gespeichert.bug : {},
    pr: gespeichert?.pr && typeof gespeichert.pr === 'object' ? gespeichert.pr : {},
  }
  return cache
}

function sichern(neu: GeladenerWerkstattstand): GeladenerWerkstattstand {
  cache = neu
  schreibe(KEYS.promptingWerkstatt, cache)
  melden()
  return cache
}

export function holeAuftrag(): Record<string, string> {
  return laden().auftrag
}

/**
 * `feld` ist eine Id aus `AUFTRAG_FELDER` (`promptBaukasten.js`), bleibt aber
 * bewusst `string`: die Liste ist noch JavaScript und der Store schreibt jeden
 * Schluessel durch, den das Formular ihm reicht.
 */
export function setzeAuftragsFeld(feld: string, wert: string): GeladenerWerkstattstand {
  return sichern({ ...laden(), auftrag: { ...laden().auftrag, [feld]: wert } })
}

export function leereAuftrag(): GeladenerWerkstattstand {
  return sichern({ ...laden(), auftrag: {} })
}

export function holeBug(): Record<string, string> {
  return laden().bug
}

/** `feld` ist eine Id aus `BUG_FELDER` — siehe `setzeAuftragsFeld()`. */
export function setzeBugFeld(feld: string, wert: string): GeladenerWerkstattstand {
  return sichern({ ...laden(), bug: { ...laden().bug, [feld]: wert } })
}

export function leereBug(): GeladenerWerkstattstand {
  return sichern({ ...laden(), bug: {} })
}

export function holePr(): Record<string, boolean> {
  return laden().pr
}

/**
 * Haken umschalten. Ein Punkt, der noch nie angefasst wurde, fehlt in der
 * Karte; `!alt[id]` macht daraus `true` — genau das soll der erste Klick tun.
 * Unter `noUncheckedIndexedAccess` ist `alt[id]` deshalb `boolean | undefined`,
 * und die Verneinung deckt beide Faelle ohne Zusicherung ab.
 */
export function schaltePr(id: string): GeladenerWerkstattstand {
  const alt = laden().pr
  return sichern({ ...laden(), pr: { ...alt, [id]: !alt[id] } })
}

export function leerePr(): GeladenerWerkstattstand {
  return sichern({ ...laden(), pr: {} })
}

/** Nur fuer Tests: Zwischenspeicher leeren. */
export function _cacheLeeren(): void {
  cache = null
}
