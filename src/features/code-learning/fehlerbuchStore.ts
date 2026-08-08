// Das Fehlerbuch: eigene Fehler, Loesungen und Gelerntes — bleibt lokal
// auf dem Geraet. Neueste Eintraege stehen oben.
import { KEYS, lies, schreibe } from '../../core/storage.ts'
import { melden, beiFremdaenderung } from '../../core/store.ts'
import { heute } from '../../core/progress/scheduler.ts'

import type { Fehlerbuchstand, Fehlereintrag } from '../../types/lernstand'

export type { Fehlerbuchstand, Fehlereintrag } from '../../types/lernstand'

/**
 * Der Stand, wie `laden()` ihn herausgibt. Nur `version` ist keine Zusage: im
 * Spread gewinnt die gespeicherte Zahl, und die hat niemand geprueft — deshalb
 * `number` statt der `1` aus `Fehlerbuchstand` (dieselbe Unterscheidung wie
 * `GeladenerSchulstand` im schuleStore).
 */
export interface GeladenerFehlerbuchstand extends Omit<Fehlerbuchstand, 'version'> {
  version: number
}

const LEER: Fehlerbuchstand = { version: 1, naechsteId: 1, eintraege: [] }

let cache: GeladenerFehlerbuchstand | null = null

function laden(): GeladenerFehlerbuchstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Stand liegen darf, dem Felder fehlen. Der Typ ist die Erwartung dieses
  // Aufrufers, keine Zusage von `lies()`.
  const d = lies<Partial<Fehlerbuchstand>>(KEYS.fehlerbuch) || {}
  cache = { ...LEER, ...d, eintraege: [...(d.eintraege || [])] }
  return cache
}

function sichern(d: GeladenerFehlerbuchstand): GeladenerFehlerbuchstand {
  cache = d
  schreibe(KEYS.fehlerbuch, d)
  melden()
  return d
}

/** Neueste zuerst — die Reihenfolge der Liste ist die Anzeigereihenfolge. */
export function fehlerbuchEintraege(): Fehlereintrag[] {
  return laden().eintraege
}

/** Angaben beim Notieren eines Fehlers; die Loesung darf spaeter kommen. */
export interface Fehlerangaben {
  titel: string
  fehler: string
  loesung?: string
}

/**
 * Eintrag anlegen. Titel und Fehlerbeschreibung sind Pflicht.
 *
 * Die Id kommt aus dem mitgespeicherten Zaehler `naechsteId`, nicht aus
 * `Date.now()`: zwei Eintraege in derselben Millisekunde bekommen dadurch
 * trotzdem verschiedene Ids, und ein geloeschter Eintrag gibt seine Id nie
 * wieder her. Dafuer haengt die Eindeutigkeit am Speicher — wer den Zaehler von
 * Hand zuruecksetzt, erzeugt doppelte Ids.
 *
 * Der neue Eintrag kommt vorne in die Liste; sortiert wird nirgends, weder hier
 * noch beim Anzeigen.
 *
 * @returns der neue Eintrag oder null bei leerer Eingabe
 */
export function fehlerNotieren({ titel, fehler, loesung = '' }: Fehlerangaben): Fehlereintrag | null {
  const t = String(titel || '').trim()
  const f = String(fehler || '').trim()
  if (!t || !f) return null
  const d = laden()
  const eintrag: Fehlereintrag = {
    id: `f-${d.naechsteId}`,
    titel: t,
    fehler: f,
    loesung: String(loesung || '').trim(),
    datum: heute(),
  }
  sichern({ ...d, naechsteId: d.naechsteId + 1, eintraege: [eintrag, ...d.eintraege] })
  return eintrag
}

/** @returns ob ein Eintrag entfernt wurde */
export function fehlerEntfernen(id: string): boolean {
  const d = laden()
  const rest = d.eintraege.filter((e) => e.id !== id)
  if (rest.length === d.eintraege.length) return false
  sichern({ ...d, eintraege: rest })
  return true
}

beiFremdaenderung((key) => {
  if (key === KEYS.fehlerbuch) cache = null
})
