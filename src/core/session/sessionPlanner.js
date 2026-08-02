// Der Sitzungsplaner stellt die taegliche Mischung zusammen:
// faellige Wiederholungen zuerst, dann neue Wörter aus der aktuellen Einheit.
import { faelligeKarten, schwierigeKarten } from '../progress/progressSelectors.js'
import { EINHEITEN, aktuelleEinheit, bildVon, fotoVon, holeEinheit } from '../courses/courseRepository.js'
import { baueUebungen, mische } from './exerciseFactory.js'

export const DAUERN = [
  { id: 'kurz', name: 'Kurz', dauer: 'ca. 5 Min', minuten: 5, aufgaben: 8 },
  { id: 'standard', name: 'Standard', dauer: 'ca. 10 Min', minuten: 10, aufgaben: 14 },
  { id: 'intensiv', name: 'Intensiv', dauer: 'ca. 20 Min', minuten: 20, aufgaben: 24 },
]

export function dauerVon(id) {
  return DAUERN.find((d) => d.id === id) || DAUERN[1]
}

/**
 * Eine fällige Karte in ein Übungswort übersetzen.
 * Die Fertigkeit muss mitgehen: Eine Karte „Silav|erkennen" wird sonst als
 * Tippaufgabe gestellt, bewertet dann die Karte „…|schreiben" und bleibt
 * selbst für immer fällig.
 */
function alsWort(karte) {
  return { de: karte.de, ku: karte.ku, bild: bildVon(karte.ku), skill: karte.skill }
}

/** Karten, die dasselbe Wortpaar in mehreren Fertigkeiten haben, nur einmal nehmen. */
function ohneDoppelte(karten) {
  const gesehen = new Set()
  return karten.filter((k) => {
    const key = `${k.de}|${k.ku}|${k.skill || ''}`
    if (gesehen.has(key)) return false
    gesehen.add(key)
    return true
  })
}

/**
 * Plant eine gemischte Sitzung.
 * @param {string} dauerId 'kurz' | 'standard' | 'intensiv'
 */
export function planeSitzung(dauerId = 'standard') {
  const dauer = dauerVon(dauerId)
  const anzahl = dauer.aufgaben
  const faellig = faelligeKarten()
  const einheit = aktuelleEinheit()

  // Bei grossem Rueckstand haben Wiederholungen Vorrang.
  const rueckstand = faellig.length > anzahl * 2
  const anteil = rueckstand ? 0.8 : 0.6
  const nWdh = Math.min(faellig.length, Math.ceil(anzahl * anteil))

  const wdhWoerter = ohneDoppelte(mische(faellig).slice(0, nWdh).map(alsWort))
  const nNeu = Math.max(anzahl - wdhWoerter.length, rueckstand ? 2 : 3)
  const neueWoerter = mische(einheit.woerter).slice(0, nNeu)

  const uebungen = mische([...baueUebungen(wdhWoerter), ...baueUebungen(neueWoerter)]).slice(0, anzahl)

  const hoerAufgaben = uebungen.filter((u) => u.art === 'hoeren').length
  const schreibAufgaben = uebungen.filter((u) => u.art === 'tippen').length

  return {
    uebungen,
    titel: 'Heutige Mischung',
    dauer,
    einheit,
    wiederholungen: wdhWoerter.length,
    neueWoerter: neueWoerter.length,
    hoerAufgaben,
    schreibAufgaben,
    rueckstand,
    faelligGesamt: faellig.length,
  }
}

/** Sitzung nur aus faelligen Karten. */
export function planeWiederholung(anzahl = 15) {
  const woerter = ohneDoppelte(mische(faelligeKarten()).map(alsWort)).slice(0, anzahl)
  return { uebungen: baueUebungen(woerter), titel: 'Wiederholen', anzahl: woerter.length }
}

/** Sitzung aus den Wörtern, die immer wieder schwerfallen. */
export function planeSchwierige(anzahl = 10) {
  const woerter = ohneDoppelte(schwierigeKarten(anzahl * 2).map(alsWort)).slice(0, anzahl)
  return { uebungen: baueUebungen(woerter), titel: 'Schwierige Wörter', anzahl: woerter.length }
}

/** Sitzung fuer eine Lektion einer Einheit. */
export function planeLektion(einheitId, lektionId) {
  const einheit = holeEinheit(einheitId)
  if (!einheit) return null
  const lektion =
    einheit.lektionen.find((l) => l.id === lektionId || l.id === `${einheitId}-${lektionId}`) ||
    einheit.lektionen[0]
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
function erreichterWortschatz() {
  const jetzt = aktuelleEinheit()
  const bis = EINHEITEN.findIndex((e) => e.id === jetzt.id)
  return EINHEITEN.slice(0, bis >= 0 ? bis + 1 : EINHEITEN.length).flatMap((e) => e.woerter)
}

export function planeTraining(art, anzahl = 12) {
  const faellig = faelligeKarten().map(alsWort)
  const aus = mische(faellig.length >= anzahl ? faellig : [...faellig, ...mische(aktuelleEinheit().woerter)])
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
