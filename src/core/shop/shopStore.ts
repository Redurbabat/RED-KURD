// Shop: nur Aussehen und Komfort. Lerninhalte sind hier niemals gesperrt.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'
import {
  zahleEdelsteine,
  zahleSchluessel,
  holeFortschritt,
  gibSerienSchutz,
} from '../progress/progressStore.ts'

import type {
  Artikelart,
  Kaufergebnis,
  Shopartikel,
  Shopkategorie,
  Shopstand,
} from '../../types/lernstand'

export const KATEGORIEN: readonly Shopkategorie[] = [
  { id: 'edelsteine', name: 'Edelsteine', icon: 'edelstein' },
  { id: 'schluessel', name: 'Schlüssel', icon: 'schluessel' },
  { id: 'taeglich', name: 'Tägliche Belohnung', icon: 'truhe' },
]

export const ARTIKEL: readonly Shopartikel[] = [
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

const STANDARD: Shopstand = { version: 1, gekauft: [], aktiv: {} }

// Anfangs `undefined`, nach einer Fremdaenderung `null` — beides faellt in
// `holeShop()` durch dieselbe Pruefung.
let cache: Shopstand | null | undefined

export function holeShop(): Shopstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Stand liegen darf. Der Typ ist die Erwartung des Aufrufers, keine Zusage
  // von `lies()` — genau deshalb bleiben die beiden Rueckfaelle darunter
  // stehen: sie fangen auch ein ausdrueckliches `null` in der Datei ab, das
  // kein Typ beschreibt.
  cache = { ...STANDARD, ...(lies<Partial<Shopstand>>(KEYS.shop) || {}) }
  cache.gekauft = cache.gekauft || []
  cache.aktiv = cache.aktiv || {}
  return cache
}

function sichern(d: Shopstand): Shopstand {
  cache = d
  schreibe(KEYS.shop, d)
  melden()
  return d
}

/**
 * Ganzen Shop-Stand ersetzen — nur fuer den Import.
 *
 * `ganz` kommt aus einer fremden Datei und ist ungeprueft; `Partial` ist auch
 * hier nur die Erwartung. `null` steht ausdruecklich im Typ, sonst saehen die
 * drei Rueckfaelle wie toter Code aus: der heutige Aufrufer prueft zwar vorher
 * (`ProgressPage.jsx:487`), aber die Absicherung gehoert dem Store.
 */
export function setzeShop(ganz: Partial<Shopstand> | null | undefined): Shopstand {
  return sichern({
    ...STANDARD,
    ...(ganz || {}),
    gekauft: (ganz && ganz.gekauft) || [],
    aktiv: (ganz && ganz.aktiv) || {},
  })
}

export function istGekauft(id: string): boolean {
  return holeShop().gekauft.includes(id)
}

export function istAktiv(id: string): boolean {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel) return false
  return holeShop().aktiv[artikel.art] === id
}

export function kannKaufen(id: string): boolean {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel) return false
  const stand = holeFortschritt()
  const vorrat = artikel.waehrung === 'schluessel' ? stand.schluessel || 0 : stand.edelsteine || 0
  return vorrat >= artikel.preis
}

/**
 * Kauft einen Artikel und meldet, was daraus geworden ist.
 *
 * Verbrauchsartikel (`art === 'verbrauch'`) sind die Ausnahme: sie wirken
 * sofort im Lernstand und landen weder in `gekauft` noch in `aktiv` — nur
 * deshalb sind sie mehrfach kaufbar.
 */
export function kaufe(id: string): Kaufergebnis {
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

export function setzeAktiv(id: string): boolean {
  const artikel = ARTIKEL.find((a) => a.id === id)
  if (!artikel || !istGekauft(id)) return false
  const d = { ...holeShop() }
  d.aktiv = { ...d.aktiv, [artikel.art]: d.aktiv[artikel.art] === id ? null : id }
  sichern(d)
  return true
}

/**
 * Der Artikel, der gerade in diesem Slot steckt. `art` ist bewusst eng
 * getypt: `aktiv` bildet Slot -> Artikel-ID ab, und einen fuenften Slot gibt
 * es nicht. Unbelegte Slots und das abgewaehlte `null` liefern beide `null`.
 */
export function aktiverArtikel(art: Artikelart): Shopartikel | null {
  const id = holeShop().aktiv[art]
  return id ? ARTIKEL.find((a) => a.id === id) || null : null
}

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.shop) cache = null
})
