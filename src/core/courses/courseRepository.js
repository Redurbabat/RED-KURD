// Kursdaten: Einheiten, Lektionen und Welten — die gemeinsame Quelle fuer
// Modern-Modus (Einheitenliste) und Abenteuer-Modus (Weltkarte).
import { kurse } from '../../data/kurse.js'
import { holeFortschritt, sterneVon } from '../progress/progressStore.js'

/** Jede Einheit besteht aus drei Abschnitten. */
export const LEKTIONS_ARTEN = [
  {
    id: 'lernen',
    nr: 1,
    name: 'Lernen',
    beschreibung: 'Neue Wörter und Sätze',
    dauer: 'ca. 5 Min',
    icon: 'buch',
    arten: ['wahl-ku', 'wahl-de', 'bild'],
    anzahl: 10,
  },
  {
    id: 'hoeren',
    nr: 2,
    name: 'Hören und Sprechen',
    beschreibung: 'Wörter anhören und laut nachsprechen',
    dauer: 'ca. 7 Min',
    icon: 'kopfhoerer',
    arten: ['hoeren', 'wahl-de'],
    anzahl: 8,
  },
  {
    id: 'pruefung',
    nr: 3,
    name: 'Mini-Prüfung',
    beschreibung: 'Wissen testen — ab 80 % geschafft',
    dauer: 'ca. 3 Min',
    icon: 'haken',
    arten: ['wahl-ku', 'tippen', 'hoeren'],
    anzahl: 5,
    pruefung: true,
  },
]

export const WELTEN = [
  {
    id: 'w1',
    nr: 1,
    name: 'Erste Gespräche',
    untertitel: 'Silav, nav û malbat',
    landschaft: 'dorf',
    farbe: '#55b85a',
    himmel: '#a8e4b6',
    einheiten: ['begruessung', 'vorstellen', 'familie', 'zahlen'],
  },
  {
    id: 'w2',
    nr: 2,
    name: 'Mein Alltag',
    untertitel: 'Mal, dem û xwarin',
    landschaft: 'felder',
    farbe: '#f4b942',
    himmel: '#ffe6a8',
    einheiten: ['zuhause', 'zeit', 'essen', 'einkaufen'],
  },
  {
    id: 'w3',
    nr: 3,
    name: 'Unterwegs',
    untertitel: 'Bajar, rê û rêwîtî',
    landschaft: 'stadt',
    farbe: '#2596f3',
    himmel: '#bfe0fb',
    einheiten: ['stadt', 'verkehr', 'reisen', 'orientierung'],
  },
  {
    id: 'w4',
    nr: 4,
    name: 'Menschen und Gefühle',
    untertitel: 'Laş, hest û hevaltî',
    landschaft: 'see',
    farbe: '#8b5cf6',
    himmel: '#d9cdfb',
    einheiten: ['koerper', 'gefuehle', 'gesundheit', 'freundschaft'],
  },
  {
    id: 'w5',
    nr: 5,
    name: 'Kultur und Sprache',
    untertitel: 'Muzîk, çîrok û Newroz',
    landschaft: 'berge',
    farbe: '#f28c28',
    himmel: '#ffd6ae',
    einheiten: ['musik', 'redewendungen', 'geschichten', 'newroz'],
  },
  {
    id: 'w6',
    nr: 6,
    name: 'Natur und Farben',
    untertitel: 'Xweza, ajal û reng',
    landschaft: 'wald',
    farbe: '#0ea5a8',
    himmel: '#b6ebec',
    einheiten: ['natur', 'tiere', 'farben', 'kleidung'],
  },
  {
    id: 'w7',
    nr: 7,
    name: 'Sprache im Einsatz',
    untertitel: 'Kar, pirs û hevok',
    landschaft: 'hochland',
    farbe: '#087f8c',
    himmel: '#9fd8e0',
    einheiten: ['verben', 'fragen', 'arbeit', 'schule', 'saetze'],
  },
]

/** Reihenfolge der Einheiten = Reihenfolge in den Welten. */
const REIHENFOLGE = WELTEN.flatMap((w) => w.einheiten)

function sortiereEinheiten() {
  const nachId = new Map(kurse.map((k) => [k.id, k]))
  const sortiert = []
  for (const id of REIHENFOLGE) {
    const k = nachId.get(id)
    if (k) {
      sortiert.push(k)
      nachId.delete(id)
    }
  }
  // Einheiten ohne Welt haengen wir hinten an, damit nie etwas verloren geht.
  for (const rest of nachId.values()) sortiert.push(rest)
  return sortiert
}

const WELT_VON_EINHEIT = new Map()
WELTEN.forEach((w) => w.einheiten.forEach((id) => WELT_VON_EINHEIT.set(id, w.id)))

export const EINHEITEN = sortiereEinheiten().map((k, i) => ({
  ...k,
  nr: i + 1,
  weltId: WELT_VON_EINHEIT.get(k.id) || null,
  lektionen: LEKTIONS_ARTEN.map((l) => ({ ...l, einheitId: k.id, id: `${k.id}-${l.id}` })),
}))

export const ALLE_WOERTER = EINHEITEN.flatMap((e) => e.woerter)

const BILD_VON_KU = new Map(ALLE_WOERTER.filter((w) => w.bild).map((w) => [w.ku, w.bild]))
const DE_VON_KU = new Map(ALLE_WOERTER.map((w) => [w.ku, w.de]))
const KU_VON_DE = new Map(ALLE_WOERTER.map((w) => [w.de, w.ku]))

export function bildVon(ku) {
  return BILD_VON_KU.get(ku)
}
export function deutschVon(ku) {
  return DE_VON_KU.get(ku)
}
export function kurmanciVon(de) {
  return KU_VON_DE.get(de)
}

export function holeEinheit(id) {
  return EINHEITEN.find((e) => e.id === id) || null
}

export function holeLektion(einheitId, lektionId) {
  const e = holeEinheit(einheitId)
  if (!e) return null
  return e.lektionen.find((l) => l.id === lektionId || l.id === `${einheitId}-${lektionId}`) || null
}

export function holeWelt(id) {
  return WELTEN.find((w) => w.id === id) || null
}

export function einheitenDerWelt(weltId) {
  const w = holeWelt(weltId)
  if (!w) return []
  return w.einheiten.map(holeEinheit).filter(Boolean)
}

export const BESTANDEN_AB = 80

/**
 * Status einer Einheit: 'fertig' | 'aktuell' | 'begonnen' | 'gesperrt'.
 * Gesperrt ist nur eine Empfehlung — die Oberflaeche laesst das Oeffnen zu.
 */
export function einheitStatus(einheitId) {
  const stand = holeFortschritt()
  const index = EINHEITEN.findIndex((e) => e.id === einheitId)
  if (index < 0) return 'gesperrt'
  const wert = stand.einheiten[einheitId] || 0
  if (wert >= BESTANDEN_AB) return 'fertig'
  const vorherFertig = EINHEITEN.slice(0, index).every(
    (e) => (stand.einheiten[e.id] || 0) >= BESTANDEN_AB
  )
  if (wert > 0) return vorherFertig ? 'aktuell' : 'begonnen'
  return vorherFertig ? 'aktuell' : 'gesperrt'
}

export function einheitProzent(einheitId) {
  return holeFortschritt().einheiten[einheitId] || 0
}

export function einheitSterne(einheitId) {
  return sterneVon(einheitId)
}

/** Die Einheit, an der weitergelernt werden soll. */
export function aktuelleEinheit() {
  const stand = holeFortschritt()
  return EINHEITEN.find((e) => (stand.einheiten[e.id] || 0) < BESTANDEN_AB) || EINHEITEN[EINHEITEN.length - 1]
}

export function aktuelleWelt() {
  const e = aktuelleEinheit()
  return holeWelt(e.weltId) || WELTEN[0]
}

/** Gesamtfortschritt des Kurses in Prozent. */
export function kursFortschritt() {
  const stand = holeFortschritt()
  const fertig = EINHEITEN.filter((e) => (stand.einheiten[e.id] || 0) >= BESTANDEN_AB).length
  return {
    fertig,
    gesamt: EINHEITEN.length,
    prozent: Math.round((fertig / EINHEITEN.length) * 100),
  }
}

export function weltFortschritt(weltId) {
  const einheiten = einheitenDerWelt(weltId)
  const stand = holeFortschritt()
  const fertig = einheiten.filter((e) => (stand.einheiten[e.id] || 0) >= BESTANDEN_AB).length
  const sterne = einheiten.reduce((s, e) => s + (stand.sterne[e.id] || 0), 0)
  return {
    fertig,
    gesamt: einheiten.length,
    sterne,
    maxSterne: einheiten.length * 3,
    prozent: einheiten.length ? Math.round((fertig / einheiten.length) * 100) : 0,
    offen: fertig < einheiten.length,
  }
}

/** Eine Welt ist offen, sobald die vorige zur Haelfte geschafft ist. */
export function weltStatus(weltId) {
  const index = WELTEN.findIndex((w) => w.id === weltId)
  if (index <= 0) return weltFortschritt(weltId).offen ? 'aktuell' : 'fertig'
  const vorher = weltFortschritt(WELTEN[index - 1].id)
  const eigen = weltFortschritt(weltId)
  if (!eigen.offen) return 'fertig'
  if (eigen.fertig > 0) return 'aktuell'
  return vorher.fertig >= Math.ceil(vorher.gesamt / 2) ? 'aktuell' : 'gesperrt'
}
