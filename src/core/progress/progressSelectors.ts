// Auswertungen des Lernstands: faellige Karten, Fertigkeiten, Wochenaktivitaet.
// Reine Lesefunktionen — sie aendern nichts.
import { holeFortschritt, level } from './progressStore.js'
import { heute, tagVon, schluesselTeile, SICHER_AB, SKILLS } from './scheduler.ts'
import { ligaFuerAufgaben } from './gamification.ts'

import type {
  Faelligkarte,
  Fertigkeit,
  Fertigkeitsprofil,
  Fertigkeitsstufe,
  GespeicherterStand,
  Karte,
  Kennzahlen,
  Tag,
  Tagesschluessel,
  Wochentagswert,
} from '../../types/lernstand'
import type { Wochenligastand } from '../../types/lernstand'

export type {
  Faelligkarte,
  Fertigkeitsprofil,
  Fertigkeitsstufe,
  Kennzahlen,
  Wochentagswert,
} from '../../types/lernstand'

/**
 * progressStore ist noch JavaScript und liefert `any` — die Form entsteht dort
 * aus `JSON.parse`. Der Zugriff laeuft deshalb ueber diese eine Stelle. Der Typ
 * ist bewusst `Partial`: auf dem Geraet kann ein aelterer oder beschaedigter
 * Stand liegen, dem Felder fehlen. Genau darum steht unten ueberall `|| 0`
 * und `|| {}` — der Pruefer verlangt diese Absicherungen jetzt, statt sie
 * ueberfluessig aussehen zu lassen.
 */
function standLesen(): GespeicherterStand {
  return holeFortschritt()
}

/** Alle heute faelligen Karten. */
export function faelligeKarten(): Faelligkarte[] {
  const d = standLesen()
  const h = heute()
  return Object.entries(d.karten || {})
    .filter(([, k]) => !k.faellig || k.faellig <= h)
    .map(([key, k]) => ({ ...schluesselTeile(key), stufe: k.stufe || 0, karte: k }))
}

/** Karten, die immer wieder falsch beantwortet werden. */
export function schwierigeKarten(limit = 10): Faelligkarte[] {
  return faelligeKarten()
    .filter((k) => k.stufe === 0)
    .sort((a, b) => (b.karte.gesehen || 0) - (a.karte.gesehen || 0))
    .slice(0, limit)
}

/** Sichere und gesehene Karten einer einzelnen Fertigkeit. */
interface Zaehler {
  gut: number
  gesamt: number
}

/**
 * `skill` aus einem Kartenschluessel ist roher Text: `gemischt` oder etwas
 * Unbekanntes sind moeglich. Nur echte Fertigkeiten zaehlen mit.
 */
function istFertigkeit(text: string): text is Fertigkeit {
  return SKILLS.some((s) => s === text)
}

function anteil({ gut, gesamt }: Zaehler): number {
  return gesamt ? Math.round((gut / gesamt) * 100) : 0
}

/** Fertigkeitsprofil in Prozent + Anzahl je Fertigkeit. */
export function fertigkeiten(): Fertigkeitsprofil {
  const d = standLesen()
  // Alle vier Faecher ausgeschrieben statt aus SKILLS gebaut: so weiss der
  // Pruefer, dass wirklich jedes da ist, und eine fuenfte Fertigkeit faellt
  // hier auf, statt still im Profil zu fehlen.
  const zaehler: Record<Fertigkeit, Zaehler> = {
    erkennen: { gut: 0, gesamt: 0 },
    abrufen: { gut: 0, gesamt: 0 },
    schreiben: { gut: 0, gesamt: 0 },
    hoeren: { gut: 0, gesamt: 0 },
  }
  for (const [key, k] of Object.entries(d.karten || {})) {
    const { skill } = schluesselTeile(key)
    if (!istFertigkeit(skill)) continue
    const ziel = zaehler[skill]
    ziel.gesamt += 1
    if ((k.stufe || 0) >= SICHER_AB) ziel.gut += 1
  }
  return {
    erkennen: anteil(zaehler.erkennen),
    erkennenAnzahl: zaehler.erkennen.gesamt,
    abrufen: anteil(zaehler.abrufen),
    abrufenAnzahl: zaehler.abrufen.gesamt,
    schreiben: anteil(zaehler.schreiben),
    schreibenAnzahl: zaehler.schreiben.gesamt,
    hoeren: anteil(zaehler.hoeren),
    hoerenAnzahl: zaehler.hoeren.gesamt,
  }
}

export function fertigkeitStufe(prozent: number): Fertigkeitsstufe {
  if (prozent >= 70) return 'Stark'
  if (prozent >= 50) return 'Fortgeschritten'
  if (prozent >= 25) return 'Auf dem Weg'
  return 'Am Anfang'
}

/** Schwaechste Fertigkeit mit mindestens einer Karte. */
export function schwaechsteFertigkeit(): Fertigkeit | null {
  const f = fertigkeiten()
  const mitDaten = SKILLS.filter((s) => f[`${s}Anzahl`] > 0)
  if (!mitDaten.length) return null
  return mitDaten.sort((a, b) => f[a] - f[b])[0] ?? null
}

export function staerksteFertigkeit(): Fertigkeit | null {
  const f = fertigkeiten()
  const mitDaten = SKILLS.filter((s) => f[`${s}Anzahl`] > 0)
  if (!mitDaten.length) return null
  return mitDaten.sort((a, b) => f[b] - f[a])[0] ?? null
}

/** Kernzahlen fuer Kopfleisten und Fortschrittsseite. */
export function statistik(): Kennzahlen {
  const d = standLesen()
  const karten: Karte[] = Object.values(d.karten || {})
  const woerter = new Set(Object.keys(d.karten || {}).map((k) => k.split('|').slice(0, 2).join('|')))
  return {
    xp: d.xp || 0,
    serie: d.serie || 0,
    serienSchutz: d.serienSchutz || 0,
    letzterSchutz: d.letzterSchutz || null,
    edelsteine: d.edelsteine || 0,
    schluessel: d.schluessel || 0,
    level: level().stufe,
    gelernt: woerter.size,
    karten: karten.length,
    sicher: karten.filter((k) => (k.stufe || 0) >= SICHER_AB).length,
    faellig: faelligeKarten().length,
    lernzeit: d.lernzeit || 0,
    einheiten: d.einheiten || {},
  }
}

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const

export function wochenAktivitaet(): Wochentagswert[] {
  const d = standLesen()
  const aus: Wochentagswert[] = []
  for (let i = 6; i >= 0; i--) {
    const t = new Date()
    t.setDate(t.getDate() - i)
    const key = tagVon(t)
    const e = (d.tage || {})[key] || { aufgaben: 0, richtig: 0, sekunden: 0 }
    aus.push({
      // getDay() liefert 0–6, die Liste hat sieben Eintraege — der Rueckfall
      // ist unerreichbar und steht nur da, weil der Pruefer das nicht sieht.
      tag: WOCHENTAGE[t.getDay()] ?? '',
      datum: key,
      anzahl: e.aufgaben || 0,
      richtig: e.richtig || 0,
      sekunden: e.sekunden || 0,
      heute: i === 0,
    })
  }
  return aus
}

export function tagesStatistik(datum: Tagesschluessel = heute()): Tag | null {
  const d = standLesen()
  return (d.tage || {})[datum] || null
}

export function gesternStatistik(): Tag | null {
  const t = new Date()
  t.setDate(t.getDate() - 1)
  return tagesStatistik(tagVon(t))
}

/** Wieviele Aufgaben wurden diese Woche geloest? (fuer Wochenaufgaben) */
export function wochenSumme(): number {
  return wochenAktivitaet().reduce((s, t) => s + t.anzahl, 0)
}

/** Der Montag der laufenden Kalenderwoche als 'JJJJ-MM-TT'. */
export function wochenStartTag(): Tagesschluessel {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return tagVon(d)
}

// Die Wochenaufgaben beginnen montags bei null. Das rollierende 7-Tage-
// Fenster von wochenSumme() enthielte Montag frueh noch die ganze Vorwoche —
// die Belohnung waere sofort wieder „geschafft" und doppelt abholbar.
function summeSeitMontag(feld: 'aufgaben' | 'sekunden'): number {
  const start = wochenStartTag()
  const d = standLesen()
  return Object.entries(d.tage || {})
    .filter(([datum]) => datum >= start)
    .reduce((summe, [, eintrag]) => summe + (eintrag[feld] || 0), 0)
}

/** Geloeste Aufgaben seit Montag — Grundlage der Wochenaufgaben. */
export function wochenSummeSeitMontag(): number {
  return summeSeitMontag('aufgaben')
}

/** Lernminuten seit Montag — Grundlage der Wochenaufgaben. */
export function wochenMinutenSeitMontag(): number {
  return Math.round(summeSeitMontag('sekunden') / 60)
}

/** Persönliche Liga ohne Server, Konto oder andere Lernende. */
export function wochenLiga(): Wochenligastand {
  return ligaFuerAufgaben(wochenSumme())
}

/** Lernminuten der letzten sieben Tage. */
export function wochenMinuten(): number {
  return Math.round(wochenAktivitaet().reduce((s, t) => s + t.sekunden, 0) / 60)
}

export function lernzeitText(sekunden: number): string {
  const min = Math.round((sekunden || 0) / 60)
  if (min < 60) return `${min} Min`
  const std = Math.floor(min / 60)
  return `${std} Std ${min % 60} Min`
}
