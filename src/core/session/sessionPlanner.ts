// Der Sitzungsplaner stellt die taegliche Mischung zusammen:
// faellige Wiederholungen zuerst, dann neue Wörter aus der aktuellen Einheit.
import { faelligeKarten, schwierigeKarten } from '../progress/progressSelectors.ts'
import { EINHEITEN, aktuelleEinheit, bildVon, fotoVon, holeEinheit } from '../courses/courseRepository.ts'
import { SKILL_JE_ART, baueUebungen, mische } from './exerciseFactory.ts'

import type { Aufgabenart, Faelligkarte, Uebung, Uebungswort, Wort } from '../../types/lernstand'
import type { Einheit, Lektion } from '../../types/kurs'

// Einheit und Lektion standen bis zur dritten Welle als eigene Notloesung
// hier, weil courseRepository noch JavaScript war. Jetzt kommen sie aus der
// gemeinsamen Quelle — der Planer beschreibt die Kursdaten nicht mehr selbst.
export type { Einheit, Lektion } from '../../types/kurs'

/** Eine der drei Sitzungslaengen. */
export interface Dauerstufe {
  id: string
  name: string
  dauer: string
  minuten: number
  aufgaben: number
}

/** Ergebnis von `planeSitzung`: die Aufgaben und die Zahlen fuer die Oberflaeche. */
export interface Sitzungsplan {
  uebungen: Uebung[]
  titel: string
  dauer: Dauerstufe
  einheit: Einheit
  wiederholungen: number
  neueWoerter: number
  hoerAufgaben: number
  schreibAufgaben: number
  rueckstand: boolean
  faelligGesamt: number
}

/** Eine Sitzung, die nur aus einer Aufgabenliste besteht. */
export interface Uebungsplan {
  uebungen: Uebung[]
  titel: string
  anzahl: number
}

/** Ergebnis von `planeLektion`. */
export interface Lektionsplan {
  uebungen: Uebung[]
  titel: string
  einheit: Einheit
  lektion: Lektion
}

/**
 * Werte, die es nach den Kursdaten immer gibt. courseRepository greift am Ende
 * auf `EINHEITEN[…]` zu, fuer tsc ist das Ergebnis deshalb „vielleicht
 * undefined" — leer ist der Kursbaum aber nie. Waere er es doch, lief der
 * Planer schon bisher in einen TypeError; er kommt jetzt eine Zeile frueher
 * und sagt, was fehlt.
 */
function muss<T>(wert: T | null | undefined, was: string): T {
  if (wert === null || wert === undefined) throw new Error(`${was} fehlt in den Kursdaten.`)
  return wert
}

export const DAUERN: readonly [Dauerstufe, Dauerstufe, Dauerstufe] = [
  { id: 'kurz', name: 'Kurz', dauer: 'ca. 5 Min', minuten: 5, aufgaben: 8 },
  { id: 'standard', name: 'Standard', dauer: 'ca. 10 Min', minuten: 10, aufgaben: 14 },
  { id: 'intensiv', name: 'Intensiv', dauer: 'ca. 20 Min', minuten: 20, aufgaben: 24 },
]

export function dauerVon(id: string): Dauerstufe {
  return DAUERN.find((d) => d.id === id) || DAUERN[1]
}

/**
 * Eine fällige Karte in ein Übungswort übersetzen.
 * Die Fertigkeit muss mitgehen: Eine Karte „Silav|erkennen" wird sonst als
 * Tippaufgabe gestellt, bewertet dann die Karte „…|schreiben" und bleibt
 * selbst für immer fällig.
 */
function alsWort(karte: Faelligkarte): Uebungswort {
  // `ku` kann laut schluesselTeile() fehlen: ein Schluessel ohne `|` hat
  // keinen kurmancî-Teil. Geschrieben werden Schluessel nur ueber
  // kartenSchluessel(), solche Karten entstehen also allein aus beschaedigten
  // Daten. Bisher wanderte das `undefined` unbemerkt bis in Frage und Antwort
  // einer Aufgabe, jetzt steht dort ein leerer Text — fuer die Lernende
  // dasselbe leere Feld. Die Luecke selbst bleibt und ist gemeldet.
  // Auch die Bildsuche laeuft ueber denselben Wert: kein Kurswort heisst ""
  // und kein Kurswort heisst `undefined`, beide Wege finden also nichts.
  const ku = karte.ku ?? ''
  return { de: karte.de, ku, bild: bildVon(ku), skill: karte.skill }
}

/**
 * Dasselbe Wortpaar nur einmal je Sitzung — egal mit welcher Fertigkeit.
 * (Der Schluessel darf den Skill NICHT enthalten: faellige Karten sind pro
 * de|ku|skill ohnehin einmalig, mit Skill im Schluessel waere das ein No-op
 * und „Silav" koennte viermal in derselben Wiederholung stehen.)
 */
function ohneDoppelte<T extends { de: string; ku: string }>(woerter: readonly T[]): T[] {
  const gesehen = new Set<string>()
  return woerter.filter((w) => {
    const key = `${w.de}|${w.ku}`
    if (gesehen.has(key)) return false
    gesehen.add(key)
    return true
  })
}

/**
 * Plant eine gemischte Sitzung.
 * @param dauerId 'kurz' | 'standard' | 'intensiv'
 */
export function planeSitzung(dauerId: string = 'standard'): Sitzungsplan {
  const dauer = dauerVon(dauerId)
  const anzahl = dauer.aufgaben
  const faellig: readonly Faelligkarte[] = faelligeKarten()
  const einheit = muss<Einheit>(aktuelleEinheit(), 'Die aktuelle Einheit')

  // Bei grossem Rueckstand haben Wiederholungen Vorrang.
  const rueckstand = faellig.length > anzahl * 2
  const anteil = rueckstand ? 0.8 : 0.6
  const nWdh = Math.min(faellig.length, Math.ceil(anzahl * anteil))

  const wdhWoerter = ohneDoppelte(mische(faellig).map(alsWort)).slice(0, nWdh)

  // Neue Woerter fuellen den Rest — ein Mindestmass neuen Stoffs ist auch bei
  // Rueckstand garantiert. Was schon als Wiederholung drin ist, kommt nicht
  // noch einmal als „neu" dazu.
  const schonDrin = new Set(wdhWoerter.map((w) => `${w.de}|${w.ku}`))
  const nNeu = Math.max(anzahl - wdhWoerter.length, rueckstand ? 2 : 3)
  const neueWoerter = mische(einheit.woerter)
    .filter((w) => !schonDrin.has(`${w.de}|${w.ku}`))
    .slice(0, nNeu)

  // Erst begrenzen, dann bauen: Ein Zuschnitt NACH dem Mischen wuerde
  // zufaellig auch faellige Wiederholungen wegwerfen, waehrend die
  // gemeldeten Zahlen noch vom vollen Plan erzaehlen.
  const wdhFinal = wdhWoerter.slice(0, Math.max(0, anzahl - neueWoerter.length))
  const wdhUebungen = baueUebungen(wdhFinal)
  const neuUebungen = baueUebungen(neueWoerter)
  const uebungen = mische([...wdhUebungen, ...neuUebungen])

  const hoerAufgaben = uebungen.filter((u) => u.art === 'hoeren').length
  const schreibAufgaben = uebungen.filter((u) => u.art === 'tippen').length

  return {
    uebungen,
    titel: 'Heutige Mischung',
    dauer,
    einheit,
    wiederholungen: wdhUebungen.length,
    neueWoerter: neuUebungen.length,
    hoerAufgaben,
    schreibAufgaben,
    rueckstand,
    faelligGesamt: faellig.length,
  }
}

/** Sitzung nur aus faelligen Karten. */
export function planeWiederholung(anzahl: number = 15): Uebungsplan {
  const karten: readonly Faelligkarte[] = faelligeKarten()
  const woerter = ohneDoppelte(mische(karten).map(alsWort)).slice(0, anzahl)
  return { uebungen: baueUebungen(woerter), titel: 'Wiederholen', anzahl: woerter.length }
}

/** Sitzung aus den Wörtern, die immer wieder schwerfallen. */
export function planeSchwierige(anzahl: number = 10): Uebungsplan {
  const karten: readonly Faelligkarte[] = schwierigeKarten(anzahl * 2)
  const woerter = ohneDoppelte(karten.map(alsWort)).slice(0, anzahl)
  return { uebungen: baueUebungen(woerter), titel: 'Schwierige Wörter', anzahl: woerter.length }
}

/** Sitzung fuer eine Lektion einer Einheit. */
export function planeLektion(einheitId: string, lektionId: string): Lektionsplan | null {
  const einheit: Einheit | null = holeEinheit(einheitId)
  if (!einheit) return null
  const lektion = muss<Lektion>(
    einheit.lektionen.find((l) => l.id === lektionId || l.id === `${einheitId}-${lektionId}`) ||
      einheit.lektionen[0],
    'Eine Lektion der Einheit'
  )
  const woerter = mische(einheit.woerter).slice(0, lektion.anzahl)
  return {
    uebungen: baueUebungen(woerter, lektion.arten),
    titel: `${einheit.name} · ${lektion.name}`,
    einheit,
    lektion,
  }
}

/** Gezieltes Training einer einzelnen Fertigkeit. */
/**
 * Alle Wörter bis einschließlich der aktuellen Einheit — der Stoff, den die
 * Lernende schon gesehen hat oder gerade sieht.
 */
function erreichterWortschatz(): Wort[] {
  const jetzt = muss<Einheit>(aktuelleEinheit(), 'Die aktuelle Einheit')
  const alle: readonly Einheit[] = EINHEITEN
  const bis = alle.findIndex((e) => e.id === jetzt.id)
  return alle.slice(0, bis >= 0 ? bis + 1 : alle.length).flatMap((e) => e.woerter)
}

export function planeTraining(art: Aufgabenart, anzahl: number = 12): Uebungsplan {
  // Nur faellige Karten, deren Fertigkeit zur Trainingsart passt: Eine
  // „erkennen"-Karte in einem Tipp-Training wuerde die Karte „…|schreiben"
  // bewerten — die faellige Karte selbst bliebe fuer immer faellig.
  const passenderSkill = SKILL_JE_ART[art]
  const karten: readonly Faelligkarte[] = faelligeKarten()
  const faellig = karten
    .filter((k) => !k.skill || k.skill === 'gemischt' || k.skill === passenderSkill)
    .map(alsWort)
  // aktuelleEinheit() wird wie bisher nur dann gelesen, wenn die faelligen
  // Karten nicht reichen.
  const aus: Uebungswort[] = mische(
    faellig.length >= anzahl
      ? faellig
      : [
          ...faellig,
          ...mische(muss<Einheit>(aktuelleEinheit(), 'Die aktuelle Einheit').woerter),
        ]
  )
  let woerter = aus.slice(0, anzahl)

  // Beim Bildertraining bevorzugen wir Wörter mit echtem Foto — aber nur aus
  // dem Stoff, den die Lernende schon erreicht hat. Sonst entstünden
  // Wiederholkarten für nie gelernte Wörter, die danach die Tagessitzung füllen.
  if (art === 'bild') {
    const erreicht = erreichterWortschatz()
    const erlaubt = new Set(erreicht.map((w) => w.ku))
    const mitFoto = aus.filter((w) => fotoVon(w.ku) && erlaubt.has(w.ku))
    if (mitFoto.length < anzahl) {
      const gesehen = new Set(mitFoto.map((w) => w.ku))
      for (const w of mische(erreicht)) {
        if (mitFoto.length >= anzahl) break
        if (w.bild && fotoVon(w.ku) && !gesehen.has(w.ku)) {
          mitFoto.push(w)
          gesehen.add(w.ku)
        }
      }
    }
    // Zu wenige Foto-Wörter im erreichten Bereich? Dann bleibt es bei der
    // ursprünglichen Auswahl — Emoji-Kacheln sind besser als fremder Stoff.
    if (mitFoto.length >= 4) woerter = mitFoto.slice(0, anzahl)
  }

  return { uebungen: baueUebungen(woerter, [art]), titel: 'Training', anzahl: woerter.length }
}
