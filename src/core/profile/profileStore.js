// Lernprofil: Name, Ziel, Vorkenntnisse, Tagesziel, Sprachvariante.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden } from '../store.js'

export const ZIELE = [
  { id: 'familie', name: 'Familie & Wurzeln', icon: 'familie' },
  { id: 'alltag', name: 'Alltag & Gespräche', icon: 'sprechblase' },
  { id: 'kultur', name: 'Kultur, Musik & Lesen', icon: 'musik' },
  { id: 'reise', name: 'Reisen', icon: 'kompass' },
]

export const KENNTNISSE = [
  { id: 'neu', name: 'Ich beginne ganz neu' },
  { id: 'etwas', name: 'Ich kenne einige Wörter' },
  { id: 'gespraech', name: 'Ich kann einfache Gespräche führen' },
]

export const VARIANTEN = [
  { id: 'kurmanci-standard', name: 'Kurmancî (Standard)', beschreibung: 'Hawar-Schrift, wie in Lehrbüchern' },
  { id: 'kurmanci-botan', name: 'Kurmancî · Botan', beschreibung: 'Regionale Aussprache aus Botan' },
  { id: 'kurmanci-serhed', name: 'Kurmancî · Serhed', beschreibung: 'Regionale Aussprache aus Serhed' },
]

export const TAGESZIELE = [
  { id: 10, name: 'Locker', beschreibung: '10 Aufgaben · ca. 5 Min' },
  { id: 20, name: 'Normal', beschreibung: '20 Aufgaben · ca. 10 Min' },
  { id: 30, name: 'Ernsthaft', beschreibung: '30 Aufgaben · ca. 15 Min' },
  { id: 50, name: 'Intensiv', beschreibung: '50 Aufgaben · ca. 25 Min' },
]

const STANDARD = {
  version: 2,
  name: '',
  kenntnis: 'neu',
  ziel: 'alltag',
  minuten: '10',
  tagesziel: 20,
  variante: 'kurmanci-standard',
  erstellt: null,
}

let cache

export function holeProfil() {
  if (cache) return cache
  const d = lies(KEYS.profil)
  cache = d ? { ...STANDARD, ...d } : null
  return cache
}

export function istEingerichtet() {
  return !!holeProfil()
}

export function speichereProfil(teil) {
  const neu = { ...STANDARD, ...(holeProfil() || {}), ...teil }
  if (!neu.erstellt) neu.erstellt = new Date().toISOString()
  cache = neu
  schreibe(KEYS.profil, neu)
  melden()
  return neu
}

export function setzeProfil(ganz) {
  cache = { ...STANDARD, ...ganz }
  schreibe(KEYS.profil, cache)
  melden()
  return cache
}

/** Tagesziel in Aufgaben (Standard 20). */
export function tageszielWert() {
  const p = holeProfil()
  return (p && p.tagesziel) || 20
}

/** Vorschlag fuer die Sitzungslaenge aus dem Profil. */
export function standardDauer() {
  const p = holeProfil()
  if (!p) return 'standard'
  if (p.minuten === '5') return 'kurz'
  if (p.minuten === '20') return 'intensiv'
  return 'standard'
}
