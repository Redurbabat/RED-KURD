// Shop: nur Aussehen und Komfort. Lerninhalte sind hier niemals gesperrt.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import {
  zahleEdelsteine,
  zahleSchluessel,
  holeFortschritt,
  gibSerienSchutz,
} from '../progress/progressStore.js'

export const KATEGORIEN = [
  { id: 'edelsteine', name: 'Edelsteine', icon: 'edelstein' },
  { id: 'schluessel', name: 'Schlüssel', icon: 'schluessel' },
  { id: 'taeglich', name: 'Tägliche Belohnung', icon: 'truhe' },
]

export const ARTIKEL = [
  {
    id: 'helo-schal',
    name: 'Hêlo-Schal',
    beschreibung: 'Ein türkiser Schal für deinen Begleiter.',
    kategorie: 'edelsteine',
    preis: 120,
    waehrung: 'edelsteine',
    art: 'mascot',
    icon: 'schal',
  },
  {
    id: 'bergpfad-thema',
    name: 'Bergpfad-Thema',
    beschreibung: 'Warme Berg-Farben für die Weltkarte.',
    kategorie: 'edelsteine',
    preis: 200,
    waehrung: 'edelsteine',
    art: 'thema',
    icon: 'berg',
  },
  {
    id: 'klangpaket',
    name: 'Klangpaket',
    beschreibung: 'Weiche Töne bei richtigen Antworten.',
    kategorie: 'edelsteine',
    preis: 150,
    waehrung: 'edelsteine',
    art: 'klang',
    icon: 'note',
  },
  {
    id: 'streak-schutz',
    name: 'Serien-Schutz',
    beschreibung: 'Rettet deine Serie automatisch, wenn ein Lerntag fehlt.',
    kategorie: 'edelsteine',
    preis: 100,
    waehrung: 'edelsteine',
    art: 'verbrauch',
    icon: 'schild',
  },
  {
    id: 'profilrahmen',
    name: 'Profilrahmen',
    beschreibung: 'Goldener Rahmen für dein Profilbild.',
    kategorie: 'edelsteine',
    preis: 80,
    waehrung: 'edelsteine',
    art: 'rahmen',
    icon: 'rahmen',
  },
  {
    id: 'schatzschluessel',
    name: 'Schatzschlüssel',
    beschreibung: 'Öffnet eine zusätzliche Schatztruhe.',
    kategorie: 'schluessel',
    preis: 1,
    waehrung: 'schluessel',
    art: 'verbrauch',
    icon: 'schluessel',
  },
]

const STANDARD = { version: 1, gekauft: [], aktiv: {} }

let cache

export function holeShop() {
  if (cache) return cache
  cache = { ...STANDARD, ...(lies(KEYS.shop) || {}) }
  cache.gekauft = cache.gekauft || []
  cache.aktiv = cache.aktiv || {}
  return cache
}

function sichern(d) {
  cache = d
  schreibe(KEYS.shop, d)
  melden()
  return d
}

/** Ganzen Shop-Stand ersetzen — nur fuer den Import. */
export function setzeShop(ganz) {
  return sichern({
    ...STANDARD,
    ...(ganz || {}),
    gekauft: (ganz && ganz.gekauft) || [],
    aktiv: (ganz && ganz.aktiv) || {},
  })
}

export function istGekauft(id) {
  return holeShop().gekauft.includes(id)
}

export function istAktiv(id) {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel) return false
  return holeShop().aktiv[artikel.art] === id
}

export function kannKaufen(id) {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel) return false
  const stand = holeFortschritt()
  const vorrat = artikel.waehrung === 'schluessel' ? stand.schluessel || 0 : stand.edelsteine || 0
  return vorrat >= artikel.preis
}

/** @returns {'ok'|'zu-teuer'|'schon-da'|'unbekannt'} */
export function kaufe(id) {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel) return 'unbekannt'
  if (artikel.art !== 'verbrauch' && istGekauft(id)) return 'schon-da'
  const bezahlt =
    artikel.waehrung === 'schluessel' ? zahleSchluessel(artikel.preis) : zahleEdelsteine(artikel.preis)
  if (!bezahlt) return 'zu-teuer'
  if (artikel.id === 'streak-schutz') gibSerienSchutz(1)
  const d = { ...holeShop() }
  if (artikel.art !== 'verbrauch') {
    d.gekauft = [...d.gekauft, id]
    d.aktiv = { ...d.aktiv, [artikel.art]: id }
  }
  sichern(d)
  return 'ok'
}

export function setzeAktiv(id) {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel || !istGekauft(id)) return false
  const d = { ...holeShop() }
  d.aktiv = { ...d.aktiv, [artikel.art]: d.aktiv[artikel.art] === id ? null : id }
  sichern(d)
  return true
}

export function aktiverArtikel(art) {
  const id = holeShop().aktiv[art]
  return id ? ARTIKEL.find((a) => a.id === id) || null : null
}

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.shop) cache = null
})
