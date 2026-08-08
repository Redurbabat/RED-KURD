// Schule und Betrieb der Elektro-Lehre: Faecher, Noten, Pruefungen,
// Berichtsheft. Alles lokal ueber src/core/storage.js — kein Konto, kein
// Server. Die Oberflaeche liest hier und rechnet nie selbst.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden } from '../store.ts'
import { STANDARD_SKALA, durchschnitt, tageBis } from './notenRechnung.js'

/** Die Faecher der Ausbildung — Startbestand, aenderbar. */
export const STANDARD_FAECHER = [
  { id: 'elektrotechnik', name: 'Elektrotechnik', zielnote: 5 },
  { id: 'mathematik', name: 'Mathematik', zielnote: 4.5 },
  { id: 'deutsch', name: 'Deutsch', zielnote: 4.5 },
  { id: 'allgemeinbildung', name: 'Allgemeinbildung', zielnote: 5 },
  { id: 'berufskunde', name: 'Berufskunde', zielnote: 5 },
  { id: 'zeichnen', name: 'Zeichnen / Schema', zielnote: 5 },
  { id: 'werkstatt', name: 'Werkstatt / Praxis', zielnote: 5 },
  { id: 'sicherheit', name: 'Sicherheit', zielnote: 5.5 },
]

export const PRUEFUNG_STATUS = ['Nicht begonnen', 'Am Lernen', 'Wiederholen', 'Bereit', 'Erledigt']
export const BERICHT_STATUS = ['Offen', 'Geschrieben', 'Kontrolliert', 'Abgegeben']

const LEER = {
  version: 1,
  skala: STANDARD_SKALA,
  faecher: STANDARD_FAECHER,
  noten: [],
  pruefungen: [],
  berichtsheft: [],
}

let cache = null

function laden() {
  if (cache) return cache
  const gespeichert = lies(KEYS.electroSchule)
  cache = {
    ...LEER,
    ...(gespeichert || {}),
    // Fehlen Listen (alter oder kaputter Stand), starten sie leer — der
    // Rest des Standes bleibt erhalten.
    faecher: Array.isArray(gespeichert?.faecher) ? gespeichert.faecher : STANDARD_FAECHER,
    noten: Array.isArray(gespeichert?.noten) ? gespeichert.noten : [],
    pruefungen: Array.isArray(gespeichert?.pruefungen) ? gespeichert.pruefungen : [],
    berichtsheft: Array.isArray(gespeichert?.berichtsheft) ? gespeichert.berichtsheft : [],
  }
  return cache
}

function sichern(neu) {
  cache = neu
  schreibe(KEYS.electroSchule, cache)
  melden()
  return cache
}

/** Eindeutige Id ohne Zufall-Kollisionen. */
let zaehler = 0
function neueId(praefix) {
  zaehler += 1
  return `${praefix}-${Date.now().toString(36)}-${zaehler}`
}

export function holeSchule() {
  return laden()
}

export function skala() {
  return laden().skala || STANDARD_SKALA
}

export function setzeSkala(id) {
  return sichern({ ...laden(), skala: id })
}

// ===== Faecher =====

export function faecher() {
  return laden().faecher
}

export function fachHinzufuegen({ name, lehrer = '', raum = '', tag = '', zielnote = null }) {
  if (!name || !String(name).trim()) return null
  const fach = { id: neueId('fach'), name: String(name).trim(), lehrer, raum, tag, zielnote }
  sichern({ ...laden(), faecher: [...laden().faecher, fach] })
  return fach
}

export function fachAendern(id, teil) {
  const neu = laden().faecher.map((f) => (f.id === id ? { ...f, ...teil } : f))
  return sichern({ ...laden(), faecher: neu })
}

/** Ein Fach entfernen — seine Noten bleiben erhalten, nur ohne Fach. */
export function fachEntfernen(id) {
  return sichern({ ...laden(), faecher: laden().faecher.filter((f) => f.id !== id) })
}

export function holeFach(id) {
  return laden().faecher.find((f) => f.id === id) || null
}

// ===== Noten =====

export function noten() {
  return laden().noten
}

export function notenFuerFach(fachId) {
  return laden().noten.filter((n) => n.fachId === fachId)
}

export function noteHinzufuegen({ fachId, note, thema = '', gewicht = 1, datum = '', art = '', kommentar = '' }) {
  if (!fachId || note === '' || note === null || note === undefined) return null
  const eintrag = {
    id: neueId('note'),
    fachId,
    note,
    thema,
    gewicht: gewicht || 1,
    datum,
    art,
    kommentar,
  }
  sichern({ ...laden(), noten: [...laden().noten, eintrag] })
  return eintrag
}

export function noteEntfernen(id) {
  return sichern({ ...laden(), noten: laden().noten.filter((n) => n.id !== id) })
}

/** Schnitt eines Fachs (gewichtet) — null, wenn es keine Noten gibt. */
export function schnittFuerFach(fachId) {
  return durchschnitt(notenFuerFach(fachId))
}

/** Gesamtschnitt ueber alle Faecher: jedes Fach zaehlt einmal. */
export function gesamtschnitt() {
  const schnitte = laden()
    .faecher.map((f) => schnittFuerFach(f.id))
    .filter((s) => s !== null)
  if (!schnitte.length) return null
  return schnitte.reduce((a, b) => a + b, 0) / schnitte.length
}

// ===== Pruefungen =====

export function pruefungen() {
  return laden().pruefungen
}

export function pruefungHinzufuegen({ titel, fachId = '', datum = '', themen = '', status = PRUEFUNG_STATUS[0], zielnote = null }) {
  if (!titel || !String(titel).trim()) return null
  const eintrag = {
    id: neueId('pruefung'),
    titel: String(titel).trim(),
    fachId,
    datum,
    themen,
    status: PRUEFUNG_STATUS.includes(status) ? status : PRUEFUNG_STATUS[0],
    zielnote,
  }
  sichern({ ...laden(), pruefungen: [...laden().pruefungen, eintrag] })
  return eintrag
}

export function pruefungAendern(id, teil) {
  const neu = laden().pruefungen.map((p) => (p.id === id ? { ...p, ...teil } : p))
  return sichern({ ...laden(), pruefungen: neu })
}

export function pruefungEntfernen(id) {
  return sichern({ ...laden(), pruefungen: laden().pruefungen.filter((p) => p.id !== id) })
}

/** Die naechste Pruefung ab heute — Erledigtes zaehlt nicht mehr. */
export function naechstePruefung(heute) {
  const offen = laden()
    .pruefungen.filter((p) => p.status !== 'Erledigt' && p.datum)
    .map((p) => ({ pruefung: p, tage: tageBis(p.datum, heute) }))
    .filter((p) => p.tage !== null && p.tage >= 0)
    .sort((a, b) => a.tage - b.tage)
  return offen.length ? offen[0] : null
}

// ===== Berichtsheft =====

export function berichtsheft() {
  return laden().berichtsheft
}

export function wocheHinzufuegen({ woche, von = '', bis = '', taetigkeiten = '', gelernt = '', status = BERICHT_STATUS[0] }) {
  if (!woche && !von) return null
  const eintrag = {
    id: neueId('woche'),
    woche: woche || '',
    von,
    bis,
    taetigkeiten,
    gelernt,
    status: BERICHT_STATUS.includes(status) ? status : BERICHT_STATUS[0],
  }
  sichern({ ...laden(), berichtsheft: [eintrag, ...laden().berichtsheft] })
  return eintrag
}

export function wocheAendern(id, teil) {
  const neu = laden().berichtsheft.map((w) => (w.id === id ? { ...w, ...teil } : w))
  return sichern({ ...laden(), berichtsheft: neu })
}

export function wocheEntfernen(id) {
  return sichern({ ...laden(), berichtsheft: laden().berichtsheft.filter((w) => w.id !== id) })
}

/** Wie viele Wochen sind noch nicht abgegeben? */
export function offeneWochen() {
  return laden().berichtsheft.filter((w) => w.status !== 'Abgegeben').length
}

/** Nur fuer Tests: Zwischenspeicher leeren. */
export function _cacheLeeren() {
  cache = null
}
