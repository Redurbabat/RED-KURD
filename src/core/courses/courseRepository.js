// Kursdaten: Einheiten, Lektionen und Welten — die gemeinsame Quelle fuer
// Modern-Modus (Einheitenliste) und Abenteuer-Modus (Weltkarte).
import { kurse } from '../../data/kurse.js'
import { kapitelFotos } from '../../data/kapitelFotos.js'
import { kapitelExtras } from '../../data/kapitelExtras.js'
import { wortFotos } from '../../data/wortFotos.js'
import { holeFortschritt, sterneVon } from '../progress/progressStore.js'

/** Jede Einheit besteht aus fünf abwechslungsreichen Abschnitten. */
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
    id: 'festigen',
    nr: 2,
    name: 'Festigen',
    beschreibung: 'Bedeutungen sicher erkennen und aktiv abrufen',
    dauer: 'ca. 6 Min',
    icon: 'gehirn',
    arten: ['wahl-ku', 'wahl-de'],
    anzahl: 10,
  },
  {
    id: 'schreiben',
    nr: 3,
    name: 'Schreiben',
    beschreibung: 'Kurmancî selbst eintippen und Sonderzeichen üben',
    dauer: 'ca. 7 Min',
    icon: 'stift',
    arten: ['tippen'],
    anzahl: 8,
  },
  {
    id: 'hoeren',
    nr: 4,
    name: 'Hören und Sprechen',
    beschreibung: 'Wörter anhören und laut nachsprechen',
    dauer: 'ca. 7 Min',
    icon: 'kopfhoerer',
    arten: ['hoeren', 'wahl-de'],
    anzahl: 8,
  },
  {
    id: 'pruefung',
    nr: 5,
    name: 'Kapitelprüfung',
    beschreibung: 'Wissen testen — ab 80 % geschafft',
    dauer: 'ca. 8 Min',
    icon: 'haken',
    arten: ['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren'],
    anzahl: 10,
    pruefung: true,
  },
]

/**
 * Der Weg führt durch eine zusammenhängende kurdische Landschaft:
 * Bergdorf → Familienhaus → Basar → Steinbrücke → Stadt → Kela → Newroz-Platz.
 * Die ersten fünf Welten folgen genau der vorgegebenen Gliederung; die beiden
 * späteren Welten vertiefen Wortschatz und Alltagssprache, ohne vorhandenen
 * Fortschritt oder alte Einheiten umzubenennen.
 */
export const WELTEN = [
  {
    id: 'w1',
    nr: 1,
    name: 'Erste Gespräche',
    untertitel: 'Silav û nasîn',
    ort: 'Bergdorf',
    landschaft: 'dorf',
    farbe: 'var(--rk-kurd-green)',
    himmel: '#7fc4de',
    einheiten: ['begruessung', 'vorstellen', 'namefragen', 'herkunft', 'verabschieden'],
  },
  {
    id: 'w2',
    nr: 2,
    name: 'Familie und Zuhause',
    untertitel: 'Malbat û mal',
    ort: 'Familienhaus',
    landschaft: 'familienhaus',
    farbe: 'var(--rk-earth)',
    himmel: '#e0b98a',
    einheiten: ['familie', 'verwandtschaft', 'zuhause', 'stadt', 'gaeste'],
  },
  {
    id: 'w3',
    nr: 3,
    name: 'Alltag',
    untertitel: 'Rojane',
    ort: 'Basar',
    landschaft: 'basar',
    farbe: 'var(--rk-gold)',
    himmel: '#f2d79a',
    einheiten: ['essen', 'zeit', 'einkaufen', 'arbeit', 'taetigkeiten'],
  },
  {
    id: 'w4',
    nr: 4,
    name: 'Unterwegs',
    untertitel: 'Li rê',
    ort: 'Steinbrücke und Stadt',
    landschaft: 'bruecke',
    farbe: 'var(--rk-turquoise)',
    himmel: '#9fd6dd',
    einheiten: ['verkehr', 'wegbeschreibung', 'reisen', 'hotel', 'orientierung'],
  },
  {
    id: 'w5',
    nr: 5,
    name: 'Kultur und Wurzeln',
    untertitel: 'Çand û rehên me',
    ort: 'Newroz-Platz',
    landschaft: 'newroz',
    farbe: 'var(--rk-kelim-red)',
    himmel: '#e8a08a',
    einheiten: ['newroz', 'musik', 'dengbej', 'redewendungen', 'geschichten'],
  },
  {
    id: 'w6',
    nr: 6,
    name: 'Mensch und Natur',
    untertitel: 'Laş, hest û xweza',
    ort: 'Hochweide',
    landschaft: 'berge',
    farbe: 'var(--rk-kurd-green)',
    himmel: '#a8cfdd',
    einheiten: ['zahlen', 'koerper', 'gefuehle', 'gesundheit', 'freundschaft', 'natur', 'tiere'],
  },
  {
    id: 'w7',
    nr: 7,
    name: 'Wörter und Sätze',
    untertitel: 'Peyv û hevok',
    ort: 'Kela',
    landschaft: 'kela',
    farbe: 'var(--rk-earth)',
    himmel: '#e2c9a2',
    einheiten: ['farben', 'kleidung', 'verben', 'fragen', 'schule', 'saetze'],
  },
  {
    id: 'w8',
    nr: 8,
    name: 'Alltag vertiefen',
    untertitel: 'Rojane bi hûrgulî',
    ort: 'Wohnviertel',
    landschaft: 'dorf',
    farbe: 'var(--rk-blue)',
    himmel: '#65bde2',
    einheiten: ['wochentage', 'wetter', 'wohnung', 'kueche', 'obst', 'gemuese', 'sport'],
  },
  {
    id: 'w9',
    nr: 9,
    name: 'Sicher sprechen',
    untertitel: 'Bi ewlehî biaxive',
    ort: 'Stadtzentrum',
    landschaft: 'kela',
    farbe: 'var(--rk-purple)',
    himmel: '#9a91dc',
    einheiten: ['digital', 'restaurant', 'gespraech', 'zahlen-gross', 'notfall'],
  },
  {
    id: 'w10',
    nr: 10,
    name: 'Berge und Feste',
    untertitel: 'Çiya û cejn',
    ort: 'Zozan (Hochweide)',
    landschaft: 'hochland',
    farbe: 'var(--rk-kurd-green)',
    himmel: '#bcd7e4',
    einheiten: ['jahreszeiten', 'gebirge', 'hochzeit', 'handwerk', 'meinung', 'alltagssaetze'],
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
  // Jedes Kapitel bekommt sein echtes, lokal gespeichertes Lernfoto samt
  // Quellenangabe — ein in der Einheit gesetztes Foto hat Vorrang.
  foto: k.foto || kapitelFotos[k.id] || null,
  // Beispielsätze und Grammatik-Notiz: direkt am Kapitel oder aus den Extras.
  saetze: k.saetze || kapitelExtras[k.id]?.saetze || null,
  grammatik: k.grammatik || kapitelExtras[k.id]?.grammatik || null,
  lektionen: LEKTIONS_ARTEN.map((l) => ({ ...l, einheitId: k.id, id: `${k.id}-${l.id}` })),
}))

export const ALLE_WOERTER = EINHEITEN.flatMap((e) => e.woerter)

// Manche Wörter kommen mehrfach vor: „roj" heisst Tag UND Sonne. Eine einfache
// Map würde die erste Bedeutung überschreiben und im Untertitel die falsche
// zeigen — deshalb sammeln wir alle und nennen sie gemeinsam.
function sammle(schluessel, wert) {
  const map = new Map()
  for (const w of ALLE_WOERTER) {
    const k = w[schluessel]
    const v = w[wert]
    if (!k || !v) continue
    const bisher = map.get(k)
    if (!bisher) map.set(k, [v])
    else if (!bisher.includes(v)) bisher.push(v)
  }
  return map
}

const BILD_VON_KU = new Map(ALLE_WOERTER.filter((w) => w.bild).map((w) => [w.ku, w.bild]))
const DE_VON_KU = sammle('ku', 'de')
const KU_VON_DE = sammle('de', 'ku')

export function bildVon(ku) {
  return BILD_VON_KU.get(ku)
}

/** Echtes Foto zu einem Kurswort — oder null, wenn nur das Emoji da ist. */
export function fotoVon(ku) {
  return wortFotos[ku] || null
}

/** Alle deutschen Bedeutungen eines Kurmancî-Worts, z. B. „Tag / Sonne". */
export function deutschVon(ku) {
  const treffer = DE_VON_KU.get(ku)
  return treffer ? treffer.join(' / ') : undefined
}

/**
 * Rohlisten fuer die Aufgaben-Fabrik: Bei Homonymen („roj" = Tag UND Sonne)
 * darf keine der weiteren richtigen Bedeutungen als falsche Option erscheinen.
 */
export function alleDeutschVon(ku) {
  return DE_VON_KU.get(ku) || []
}

export function alleKurmanciVon(de) {
  return KU_VON_DE.get(de) || []
}

export function kurmanciVon(de) {
  const treffer = KU_VON_DE.get(de)
  return treffer ? treffer.join(' / ') : undefined
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

/**
 * Knotentypen des Lernpfads (Designpaket, Bild 3).
 * Nur `lektion` und `pruefung` sind echte Lerninhalte; Truhe und Bonusspiel
 * sind Beiwerk und sperren nie etwas.
 */
export const KNOTEN_ARTEN = {
  lektion: { name: 'Lektion', icon: 'stern' },
  wiederholen: { name: 'Wiederholen', icon: 'wiederholen' },
  hoeren: { name: 'Hören', icon: 'kopfhoerer' },
  truhe: { name: 'Schatz', icon: 'truhe' },
  spiel: { name: 'Bonusspiel', icon: 'puzzle' },
  pruefung: { name: 'Prüfung', icon: 'schild' },
  abschluss: { name: 'Abschluss', icon: 'krone' },
}

/**
 * Baut den Lernpfad einer Welt: die Einheiten als Stationen, dazwischen
 * eine Truhe und ein Bonusspiel, am Ende Prüfung und Abschluss.
 * @returns {Array<{id, art, name, untertitel, einheitId, status, prozent, sterne, icon, symbol}>}
 */
export function weltPfad(weltId) {
  const einheiten = einheitenDerWelt(weltId)
  if (!einheiten.length) return []

  const stand = holeFortschritt()
  const knoten = []

  einheiten.forEach((e, i) => {
    const letzte = i === einheiten.length - 1
    const status = einheitStatus(e.id)
    knoten.push({
      id: `${weltId}-${e.id}`,
      art: letzte ? 'pruefung' : 'lektion',
      name: e.name,
      untertitel: letzte ? 'Prüfung dieser Welt' : `Einheit ${e.nr}`,
      einheitId: e.id,
      status,
      prozent: stand.einheiten[e.id] || 0,
      sterne: stand.sterne[e.id] || 0,
      symbol: e.symbol,
      icon: letzte ? KNOTEN_ARTEN.pruefung.icon : KNOTEN_ARTEN.lektion.icon,
    })

    // Nach jeder zweiten Einheit eine Truhe, dazwischen ein Bonusspiel.
    if (!letzte && i % 2 === 1) {
      knoten.push({
        id: `${weltId}-truhe-${i}`,
        art: 'truhe',
        name: KNOTEN_ARTEN.truhe.name,
        untertitel: 'Belohnung unterwegs',
        status: status === 'fertig' ? 'aktuell' : 'gesperrt',
        icon: KNOTEN_ARTEN.truhe.icon,
      })
    } else if (!letzte && i % 2 === 0 && i > 0) {
      knoten.push({
        id: `${weltId}-spiel-${i}`,
        art: 'spiel',
        name: KNOTEN_ARTEN.spiel.name,
        untertitel: 'Satzbau zum Aufwärmen',
        status: status === 'gesperrt' ? 'gesperrt' : 'aktuell',
        icon: KNOTEN_ARTEN.spiel.icon,
      })
    }
  })

  const alleFertig = einheiten.every((e) => (stand.einheiten[e.id] || 0) >= BESTANDEN_AB)
  knoten.push({
    id: `${weltId}-abschluss`,
    art: 'abschluss',
    name: KNOTEN_ARTEN.abschluss.name,
    untertitel: alleFertig ? 'Welt geschafft' : 'Schliesse alle Stationen ab',
    status: alleFertig ? 'fertig' : 'gesperrt',
    icon: KNOTEN_ARTEN.abschluss.icon,
  })

  return knoten
}

/**
 * Die Station, an der Hêlo gerade steht.
 * Truhe und Bonusspiel zaehlen nicht — Hêlo wartet dort, wo wirklich gelernt
 * wird, sonst steht er neben einer Belohnung statt neben der naechsten Lektion.
 */
const LERN_ARTEN = ['lektion', 'pruefung']

export function aktuellerKnoten(weltId) {
  const pfad = weltPfad(weltId)
  const lernen = pfad.filter((k) => LERN_ARTEN.includes(k.art))
  return (
    lernen.find((k) => k.status === 'aktuell') ||
    lernen.find((k) => k.status === 'begonnen') ||
    lernen.find((k) => k.status !== 'fertig') ||
    lernen[lernen.length - 1] ||
    null
  )
}

/**
 * Eine Welt ist offen, sobald die vorige zur Hälfte geschafft ist — aber nur,
 * wenn wenigstens eine ihrer Einheiten wirklich erreichbar ist. Sonst stünde
 * „Aktuell" über einer Welt, deren Stationen alle ein Schloss tragen.
 */
export function weltStatus(weltId) {
  const index = WELTEN.findIndex((w) => w.id === weltId)
  const eigen = weltFortschritt(weltId)
  if (!eigen.offen) return 'fertig'

  const hatOffeneStation = einheitenDerWelt(weltId).some((e) => einheitStatus(e.id) !== 'gesperrt')
  if (index <= 0) return 'aktuell'
  if (eigen.fertig > 0 || hatOffeneStation) return 'aktuell'

  const vorher = weltFortschritt(WELTEN[index - 1].id)
  return vorher.fertig >= Math.ceil(vorher.gesamt / 2) && hatOffeneStation ? 'aktuell' : 'gesperrt'
}
