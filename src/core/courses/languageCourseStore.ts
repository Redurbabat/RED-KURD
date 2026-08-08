// Lokaler Fortschritt der zusätzlichen Sprachkurse. Es gibt kein Konto und
// keine Übertragung: jedes Gerät behält seinen eigenen Stand.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'

import type { Kapitelstand, Nebenkursstand, Sprachkursstand } from '../../types/lernstand'

/**
 * Der Ausschnitt eines Kapitels, den dieser Store wirklich liest — nur die ID.
 * Die Kursdaten liegen in `src/data/sprachkurse.js` und sind noch JavaScript;
 * wandern sie nach TypeScript, kommt die Form von dort und diese hier faellt weg.
 */
export interface Nebenkapitel {
  id: string
}

/** Dasselbe fuer den ganzen Kurs: `kursStand()` braucht ID und Kapitelliste. */
export interface Nebenkurs {
  id: string
  kapitel: readonly Nebenkapitel[]
}

const STANDARD: Sprachkursstand = { version: 1, kapitel: {}, letzterKurs: null }

// Anfangs `undefined`, nach einer Fremdaenderung `null` — beides faellt in
// `laden()` durch dieselbe Pruefung.
let cache: Sprachkursstand | null | undefined

function laden(): Sprachkursstand {
  if (cache) return cache
  cache = { ...STANDARD, ...(lies<Sprachkursstand>(KEYS.sprachkurse) || {}) }
  // Eigene Kopie der Kapitel: ohne sie zeigt `cache.kapitel` bei leerem
  // Speicher auf dasselbe Objekt wie `STANDARD.kapitel`, und ein spaeterer
  // Schreibzugriff wuerde den Standard mitveraendern.
  cache.kapitel = { ...(cache.kapitel || {}) }
  return cache
}

function sichern(neu: Sprachkursstand): Sprachkursstand {
  cache = neu
  schreibe(KEYS.sprachkurse, neu)
  melden()
  return neu
}

function schluessel(kursId: string, kapitelId: string): string {
  return `${kursId}/${kapitelId}`
}

export function kapitelStand(kursId: string, kapitelId: string): Kapitelstand | null {
  return laden().kapitel[schluessel(kursId, kapitelId)] || null
}

export function kapitelAbschliessen(
  kursId: string,
  kapitelId: string,
  prozent: number
): Sprachkursstand {
  const alt = laden()
  const key = schluessel(kursId, kapitelId)
  // `Partial`, weil ein alter oder von Hand veraenderter Eintrag Felder
  // vermissen lassen kann — genau dafuer stehen die `|| 0` unten.
  const vorher: Partial<Kapitelstand> = alt.kapitel[key] || {}
  const wert = Math.max(0, Math.min(100, Math.round(prozent || 0)))
  return sichern({
    ...alt,
    letzterKurs: kursId,
    kapitel: {
      ...alt.kapitel,
      [key]: {
        prozent: Math.max(vorher.prozent || 0, wert),
        versuche: (vorher.versuche || 0) + 1,
        abgeschlossen: wert >= 75 || vorher.abgeschlossen === true,
        zuletzt: new Date().toISOString(),
      },
    },
  })
}

export function kursStand(kurs: Nebenkurs): Nebenkursstand {
  const staende = kurs.kapitel.map((kapitel) => kapitelStand(kurs.id, kapitel.id))
  const fertig = staende.filter((stand) => stand?.abgeschlossen).length
  const punkte = staende.reduce((summe, stand) => summe + (stand?.prozent || 0), 0)
  return {
    fertig,
    gesamt: kurs.kapitel.length,
    prozent: kurs.kapitel.length ? Math.round(punkte / kurs.kapitel.length) : 0,
  }
}

export function letzterSprachkurs(): string | null {
  return laden().letzterKurs
}

beiFremdaenderung((key) => {
  if (key === KEYS.sprachkurse) cache = null
})
