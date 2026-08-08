// Schule und Betrieb der Elektro-Lehre: Faecher, Noten, Pruefungen,
// Berichtsheft. Alles lokal ueber src/core/storage.ts — kein Konto, kein
// Server. Die Oberflaeche liest hier und rechnet nie selbst.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden } from '../store.ts'
import { STANDARD_SKALA, durchschnitt, tageBis } from './notenRechnung.js'

import type {
  Berichtsstatus,
  Berichtswoche,
  Elektroschulstand,
  Noteneintrag,
  Pruefungseintrag,
  Pruefungsstatus,
  Schulfach,
  Tagesschluessel,
} from '../../types/lernstand'

export type {
  Berichtswoche,
  Elektroschulstand,
  Noteneintrag,
  Pruefungseintrag,
  Schulfach,
} from '../../types/lernstand'

/**
 * notenRechnung ist noch JavaScript und liefert seine Parameter als `any`. Der
 * Zugriff laeuft deshalb ueber diese drei Stellen, die die Form einmal
 * benennen — dann prueft TypeScript den Rest der Datei wirklich (Vorbild
 * `standLesen()` in `courseRepository.ts`). Wandert die Rechnung selbst nach
 * TypeScript, fallen sie ersatzlos weg.
 */
const STANDARD_SKALA_ID: string = STANDARD_SKALA

/** Gewichteter Schnitt einer Notenliste; `null`, wenn nichts Gueltiges dabei ist. */
function schnittVon(noten: readonly Noteneintrag[]): number | null {
  return durchschnitt(noten)
}

/**
 * Tage bis zum Termin — beide Seiten sind Tagesschluessel (`JJJJ-MM-TT`), kein
 * ISO-Zeitstempel: `tageBis()` haengt `T00:00:00` an und bekaeme sonst ein
 * ungueltiges Datum, also stillschweigend `null`.
 */
function tageBisTag(datum: string, tag: Tagesschluessel): number | null {
  return tageBis(datum, tag)
}

/**
 * Die Faecher der Ausbildung — Startbestand, aenderbar.
 *
 * Bewusst nicht `readonly`: die Liste wandert unveraendert in den Stand
 * (`LEER` und der Rueckfall in `laden()`), und dort ist sie schreibbar. Kopiert
 * wird sie nicht — geaendert aber auch nie, jede Aenderung legt eine neue Liste an.
 */
export const STANDARD_FAECHER: Schulfach[] = [
  { id: 'elektrotechnik', name: 'Elektrotechnik', zielnote: 5 },
  { id: 'mathematik', name: 'Mathematik', zielnote: 4.5 },
  { id: 'deutsch', name: 'Deutsch', zielnote: 4.5 },
  { id: 'allgemeinbildung', name: 'Allgemeinbildung', zielnote: 5 },
  { id: 'berufskunde', name: 'Berufskunde', zielnote: 5 },
  { id: 'zeichnen', name: 'Zeichnen / Schema', zielnote: 5 },
  { id: 'werkstatt', name: 'Werkstatt / Praxis', zielnote: 5 },
  { id: 'sicherheit', name: 'Sicherheit', zielnote: 5.5 },
]

/**
 * Beide Listen sind Tupel mit mindestens einem Element: sie sind nie leer,
 * deshalb darf `[0]` unten ohne Zusicherung als Rueckfall dienen — sonst gaebe
 * `noUncheckedIndexedAccess` dort `undefined` dazu (Vorbild `WOCHENLIGEN` in
 * `gamification.ts`).
 */
export const PRUEFUNG_STATUS: readonly [Pruefungsstatus, ...Pruefungsstatus[]] = [
  'Nicht begonnen',
  'Am Lernen',
  'Wiederholen',
  'Bereit',
  'Erledigt',
]
export const BERICHT_STATUS: readonly [Berichtsstatus, ...Berichtsstatus[]] = [
  'Offen',
  'Geschrieben',
  'Kontrolliert',
  'Abgegeben',
]

/**
 * Steht `PRUEFUNG_STATUS.includes(wert)` an: auf der getypten Liste nimmt
 * `includes()` keinen beliebigen String mehr an. Der Wachposten prueft
 * dasselbe und sagt zugleich, was danach feststeht.
 */
function istPruefungsstatus(wert: string): wert is Pruefungsstatus {
  return PRUEFUNG_STATUS.some((s) => s === wert)
}

function istBerichtsstatus(wert: string): wert is Berichtsstatus {
  return BERICHT_STATUS.some((s) => s === wert)
}

/**
 * Der Stand, wie `laden()` ihn herausgibt. Nur `version` ist keine Zusage: im
 * Spread gewinnt die gespeicherte Zahl, und die hat niemand geprueft — deshalb
 * `number` statt der `1` aus `Elektroschulstand` (dieselbe Unterscheidung wie
 * `GeladenerAufgabenstand` im taskStore).
 */
export interface GeladenerSchulstand extends Omit<Elektroschulstand, 'version'> {
  version: number
}

const LEER: Elektroschulstand = {
  version: 1,
  skala: STANDARD_SKALA_ID,
  faecher: STANDARD_FAECHER,
  noten: [],
  pruefungen: [],
  berichtsheft: [],
}

let cache: GeladenerSchulstand | null = null

function laden(): GeladenerSchulstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Eintrag liegen darf, dem Felder fehlen — genau dagegen stehen die vier
  // Rueckfaelle darunter.
  const gespeichert = lies<Partial<Elektroschulstand>>(KEYS.electroSchule)
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

function sichern(neu: GeladenerSchulstand): GeladenerSchulstand {
  cache = neu
  schreibe(KEYS.electroSchule, cache)
  melden()
  return cache
}

/** Eindeutige Id ohne Zufall-Kollisionen. */
let zaehler = 0
function neueId(praefix: string): string {
  zaehler += 1
  return `${praefix}-${Date.now().toString(36)}-${zaehler}`
}

export function holeSchule(): GeladenerSchulstand {
  return laden()
}

export function skala(): string {
  return laden().skala || STANDARD_SKALA_ID
}

export function setzeSkala(id: string): GeladenerSchulstand {
  return sichern({ ...laden(), skala: id })
}

// ===== Faecher =====

export function faecher(): Schulfach[] {
  return laden().faecher
}

/** Angaben beim Anlegen eines Fachs; alles ausser dem Namen ist freiwillig. */
export interface Fachangaben {
  name: string
  lehrer?: string
  raum?: string
  tag?: string
  zielnote?: number | null
}

export function fachHinzufuegen({
  name,
  lehrer = '',
  raum = '',
  tag = '',
  zielnote = null,
}: Fachangaben): Schulfach | null {
  if (!name || !String(name).trim()) return null
  const fach: Schulfach = { id: neueId('fach'), name: String(name).trim(), lehrer, raum, tag, zielnote }
  sichern({ ...laden(), faecher: [...laden().faecher, fach] })
  return fach
}

export function fachAendern(id: string, teil: Partial<Schulfach>): GeladenerSchulstand {
  const neu = laden().faecher.map((f) => (f.id === id ? { ...f, ...teil } : f))
  return sichern({ ...laden(), faecher: neu })
}

/** Ein Fach entfernen — seine Noten bleiben erhalten, nur ohne Fach. */
export function fachEntfernen(id: string): GeladenerSchulstand {
  return sichern({ ...laden(), faecher: laden().faecher.filter((f) => f.id !== id) })
}

export function holeFach(id: string): Schulfach | null {
  return laden().faecher.find((f) => f.id === id) || null
}

// ===== Noten =====

export function noten(): Noteneintrag[] {
  return laden().noten
}

export function notenFuerFach(fachId: string): Noteneintrag[] {
  return laden().noten.filter((n) => n.fachId === fachId)
}

/**
 * Angaben beim Eintragen einer Note.
 *
 * `note` und `gewicht` kommen roh aus dem Eingabefeld — dort steht `'4,5'` und
 * `'1'` als Text, waehrend Tests Zahlen reichen. Deshalb `string | number`
 * statt `number`; gerechnet wird ohnehin erst in `notenRechnung.zahl()`.
 * `note` darf zusaetzlich fehlen oder leer sein, das faengt der Wachposten
 * unten ab.
 */
export interface Notenangaben {
  fachId: string
  note?: string | number | null
  thema?: string
  gewicht?: string | number
  /** `JJJJ-MM-TT` aus `<input type="date">` oder `''` — kein ISO-Zeitstempel. */
  datum?: string
  art?: string
  kommentar?: string
}

export function noteHinzufuegen({
  fachId,
  note,
  thema = '',
  gewicht = 1,
  datum = '',
  art = '',
  kommentar = '',
}: Notenangaben): Noteneintrag | null {
  if (!fachId || note === '' || note === null || note === undefined) return null
  const eintrag: Noteneintrag = {
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

export function noteEntfernen(id: string): GeladenerSchulstand {
  return sichern({ ...laden(), noten: laden().noten.filter((n) => n.id !== id) })
}

/** Schnitt eines Fachs (gewichtet) — null, wenn es keine Noten gibt. */
export function schnittFuerFach(fachId: string): number | null {
  return schnittVon(notenFuerFach(fachId))
}

/** Gesamtschnitt ueber alle Faecher: jedes Fach zaehlt einmal. */
export function gesamtschnitt(): number | null {
  const schnitte = laden()
    .faecher.map((f) => schnittFuerFach(f.id))
    .filter((s) => s !== null)
  if (!schnitte.length) return null
  return schnitte.reduce((a, b) => a + b, 0) / schnitte.length
}

// ===== Pruefungen =====

export function pruefungen(): Pruefungseintrag[] {
  return laden().pruefungen
}

/**
 * Angaben beim Anlegen einer Pruefung. `status` steht als `string`, weil die
 * Oberflaeche jeden Wert eines Auswahlfeldes durchreicht — was nicht in
 * `PRUEFUNG_STATUS` steht, faellt unten auf den ersten Stand zurueck.
 */
export interface Pruefungsangaben {
  titel: string
  fachId?: string
  /** `JJJJ-MM-TT` oder `''` — kein ISO-Zeitstempel. */
  datum?: string
  themen?: string
  status?: string
  zielnote?: number | null
}

export function pruefungHinzufuegen({
  titel,
  fachId = '',
  datum = '',
  themen = '',
  status = PRUEFUNG_STATUS[0],
  zielnote = null,
}: Pruefungsangaben): Pruefungseintrag | null {
  if (!titel || !String(titel).trim()) return null
  const eintrag: Pruefungseintrag = {
    id: neueId('pruefung'),
    titel: String(titel).trim(),
    fachId,
    datum,
    themen,
    status: istPruefungsstatus(status) ? status : PRUEFUNG_STATUS[0],
    zielnote,
  }
  sichern({ ...laden(), pruefungen: [...laden().pruefungen, eintrag] })
  return eintrag
}

export function pruefungAendern(id: string, teil: Partial<Pruefungseintrag>): GeladenerSchulstand {
  const neu = laden().pruefungen.map((p) => (p.id === id ? { ...p, ...teil } : p))
  return sichern({ ...laden(), pruefungen: neu })
}

export function pruefungEntfernen(id: string): GeladenerSchulstand {
  return sichern({ ...laden(), pruefungen: laden().pruefungen.filter((p) => p.id !== id) })
}

/** Die naechste Pruefung und wie viele Tage bis dahin bleiben. */
export interface NaechstePruefung {
  pruefung: Pruefungseintrag
  tage: number
}

/**
 * Die naechste Pruefung ab heute — Erledigtes zaehlt nicht mehr.
 * `heute` ist ein Tagesschluessel (`JJJJ-MM-TT`), wie ihn `scheduler.heute()`
 * liefert.
 */
export function naechstePruefung(heute: Tagesschluessel): NaechstePruefung | null {
  const offen = laden()
    .pruefungen.filter((p) => p.status !== 'Erledigt' && p.datum)
    // `flatMap` statt `map` + `filter`: nur so bleibt `tage` danach eine Zahl,
    // ohne dass der Typ nachtraeglich zugesichert werden muesste.
    .flatMap((p) => {
      const tage = tageBisTag(p.datum, heute)
      return tage !== null && tage >= 0 ? [{ pruefung: p, tage }] : []
    })
    .sort((a, b) => a.tage - b.tage)
  const erste = offen[0]
  // Ist die Liste nicht leer, gibt es `offen[0]` — `noUncheckedIndexedAccess`
  // sieht das nicht, deshalb der ausgeschriebene Zweig statt einer Zusicherung.
  return erste === undefined ? null : erste
}

// ===== Berichtsheft =====

export function berichtsheft(): Berichtswoche[] {
  return laden().berichtsheft
}

/**
 * Angaben fuer eine Woche im Berichtsheft. Entweder eine Wochenbezeichnung
 * (`KW 32`) oder ein Beginn muss dabei sein; `status` ist aus demselben Grund
 * `string` wie bei der Pruefung.
 */
export interface Wochenangaben {
  woche?: string
  /** `JJJJ-MM-TT` oder `''` — kein ISO-Zeitstempel. */
  von?: string
  bis?: string
  taetigkeiten?: string
  gelernt?: string
  status?: string
}

export function wocheHinzufuegen({
  woche,
  von = '',
  bis = '',
  taetigkeiten = '',
  gelernt = '',
  status = BERICHT_STATUS[0],
}: Wochenangaben): Berichtswoche | null {
  if (!woche && !von) return null
  const eintrag: Berichtswoche = {
    id: neueId('woche'),
    woche: woche || '',
    von,
    bis,
    taetigkeiten,
    gelernt,
    status: istBerichtsstatus(status) ? status : BERICHT_STATUS[0],
  }
  sichern({ ...laden(), berichtsheft: [eintrag, ...laden().berichtsheft] })
  return eintrag
}

export function wocheAendern(id: string, teil: Partial<Berichtswoche>): GeladenerSchulstand {
  const neu = laden().berichtsheft.map((w) => (w.id === id ? { ...w, ...teil } : w))
  return sichern({ ...laden(), berichtsheft: neu })
}

export function wocheEntfernen(id: string): GeladenerSchulstand {
  return sichern({ ...laden(), berichtsheft: laden().berichtsheft.filter((w) => w.id !== id) })
}

/** Wie viele Wochen sind noch nicht abgegeben? */
export function offeneWochen(): number {
  return laden().berichtsheft.filter((w) => w.status !== 'Abgegeben').length
}

/** Nur fuer Tests: Zwischenspeicher leeren. */
export function _cacheLeeren(): void {
  cache = null
}
