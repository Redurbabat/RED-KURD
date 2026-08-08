// Lernprofil: Name, Ziel, Vorkenntnisse, Tagesziel, Sprachvariante.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'

import type { Profil } from '../../types/lernstand'

/* ===== Auswahllisten der Oberflaeche =====
   Sie stehen bewusst hier und nicht in `types/lernstand.d.ts`: gespeichert wird
   vom Profil immer nur die `id`, nie ein ganzer Listeneintrag. Die Listen sind
   Vorlagen fuer die Onboarding- und die Einstellungsseite. */

/** Grundform eines Listeneintrags: die gespeicherte `id` und ihr Anzeigename. */
export interface Auswahl {
  id: string
  name: string
}

/** Ein Eintrag aus `ZIELE` — mit Symbol fuer die Kachel. */
export interface Lernziel extends Auswahl {
  icon: string
}

/** Ein Eintrag aus `VARIANTEN` — mit erklaerendem Zusatz. */
export interface Sprachvariante extends Auswahl {
  beschreibung: string
}

/**
 * Ein Eintrag aus `TAGESZIELE`. Die `id` ist hier eine **Zahl** und keine
 * Zeichenkette: sie *ist* die Zahl der Aufgaben pro Tag und wandert genau so
 * nach `Profil.tagesziel`. Deshalb erbt dieser Typ nicht von `Auswahl`.
 */
export interface Tageszieloption {
  id: number
  name: string
  beschreibung: string
}

export const ZIELE: readonly Lernziel[] = [
  { id: 'familie', name: 'Familie & Wurzeln', icon: 'familie' },
  { id: 'alltag', name: 'Alltag & Gespräche', icon: 'sprechblase' },
  { id: 'kultur', name: 'Kultur, Musik & Lesen', icon: 'musik' },
  { id: 'reise', name: 'Reisen', icon: 'kompass' },
]

export const KENNTNISSE: readonly Auswahl[] = [
  { id: 'neu', name: 'Ich beginne ganz neu' },
  { id: 'etwas', name: 'Ich kenne einige Wörter' },
  { id: 'gespraech', name: 'Ich kann einfache Gespräche führen' },
]

export const VARIANTEN: readonly Sprachvariante[] = [
  { id: 'kurmanci-standard', name: 'Kurmancî (Standard)', beschreibung: 'Hawar-Schrift, wie in Lehrbüchern' },
  { id: 'kurmanci-botan', name: 'Kurmancî · Botan', beschreibung: 'Regionale Aussprache aus Botan' },
  { id: 'kurmanci-serhed', name: 'Kurmancî · Serhed', beschreibung: 'Regionale Aussprache aus Serhed' },
]

export const TAGESZIELE: readonly Tageszieloption[] = [
  { id: 10, name: 'Locker', beschreibung: '10 Aufgaben · ca. 5 Min' },
  { id: 20, name: 'Normal', beschreibung: '20 Aufgaben · ca. 10 Min' },
  { id: 30, name: 'Ernsthaft', beschreibung: '30 Aufgaben · ca. 15 Min' },
  { id: 50, name: 'Intensiv', beschreibung: '50 Aufgaben · ca. 25 Min' },
]

const STANDARD: Profil = {
  version: 2,
  name: '',
  kenntnis: 'neu',
  ziel: 'alltag',
  minuten: '10',
  tagesziel: 20,
  variante: 'kurmanci-standard',
  erstellt: null,
}

/**
 * `undefined` heisst „noch nicht gelesen", `null` heisst „gelesen, es gibt kein
 * Profil". Im Ablauf gibt es den Unterschied nicht: beides ist falsy, also
 * liest `holeProfil()` in beiden Faellen erneut. Der Typ nennt trotzdem beide
 * Werte, weil der Rueckruf ganz unten den Cache mit `null` verwirft.
 */
let cache: Profil | null | undefined

/**
 * `null` heisst „noch nicht eingerichtet" — das ist etwas anderes als ein
 * leeres Profil und entscheidet, ob die App das Onboarding zeigt.
 *
 * Was auf der Platte liegt, ist ungeprueft und kann aelter oder von Hand
 * veraendert sein; `Partial<Profil>` sagt genau das. Erst der `STANDARD`-Spread
 * macht daraus ein vollstaendiges Profil.
 */
export function holeProfil(): Profil | null {
  if (cache) return cache
  const d = lies<Partial<Profil>>(KEYS.profil)
  cache = d ? { ...STANDARD, ...d } : null
  return cache
}

export function istEingerichtet(): boolean {
  return !!holeProfil()
}

export function speichereProfil(teil: Partial<Profil>): Profil {
  const neu: Profil = { ...STANDARD, ...(holeProfil() || {}), ...teil }
  if (!neu.erstellt) neu.erstellt = new Date().toISOString()
  cache = neu
  schreibe(KEYS.profil, neu)
  melden()
  return neu
}

/**
 * Setzt das ganze Profil — der Weg, den das Einspielen einer Sicherung nimmt.
 * `ganz` stammt dann aus einer fremden Datei und ist ungeprueft; `Partial<Profil>`
 * ist die Erwartung des Aufrufers, keine Zusage (dieselbe Lesart wie bei
 * `lies<T>()`). Fehlende Felder faengt der `STANDARD`-Spread ab — `erstellt`
 * bleibt dabei bewusst `null`, anders als in `speichereProfil()`.
 */
export function setzeProfil(ganz: Partial<Profil>): Profil {
  cache = { ...STANDARD, ...ganz }
  schreibe(KEYS.profil, cache)
  melden()
  return cache
}

/** Tagesziel in Aufgaben (Standard 20). */
export function tageszielWert(): number {
  const p = holeProfil()
  return (p && p.tagesziel) || 20
}

/**
 * Die drei Sitzungslaengen des Planers. `Dauerstufe.id` in sessionPlanner.ts ist
 * nur `string`, deshalb steht die enge Form hier — sie passt dort ohne Weiteres
 * hinein.
 */
export type Sitzungsdauer = 'kurz' | 'standard' | 'intensiv'

/** Vorschlag fuer die Sitzungslaenge aus dem Profil. */
export function standardDauer(): Sitzungsdauer {
  const p = holeProfil()
  if (!p) return 'standard'
  if (p.minuten === '5') return 'kurz'
  if (p.minuten === '20') return 'intensiv'
  return 'standard'
}

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.profil) cache = null
})
