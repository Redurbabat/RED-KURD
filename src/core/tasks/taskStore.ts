// Tages- und Wochenaufgaben. Der Fortschritt wird direkt aus dem Lernstand
// abgeleitet — es gibt keine zweite Zaehlung, die auseinanderlaufen koennte.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'
import { heute } from '../progress/scheduler.ts'
import { gibXp, gibEdelsteine, gibSchluessel, holeFortschritt } from '../progress/progressStore.ts'
import {
  tagesStatistik,
  wochenMinutenSeitMontag,
  wochenStartTag,
  wochenSummeSeitMontag,
} from '../progress/progressSelectors.ts'
import { kursFortschritt } from '../courses/courseRepository.ts'

import type {
  Aufgabe,
  Aufgabenbasis,
  Aufgabenbelohnung,
  Aufgabenliste,
  Aufgabenstand,
  Tag,
} from '../../types/lernstand'

/**
 * Aufgaben-IDs tragen ihre Laufzeit im Namen: `pruefeTag()` loescht beim
 * Tageswechsel alle Marken mit `t-`, beim Wochenwechsel alle mit `w-`. Eine
 * dritte Sorte gaebe es damit fuer immer nur einmal — deshalb laesst der Typ
 * genau diese beiden zu.
 */
export type Aufgabenid = `t-${string}` | `w-${string}`

/**
 * Eine Aufgabe, bevor `markiere()` sie an den gespeicherten Marken misst.
 * Aus `Aufgabe` abgeleitet, damit ein neues Feld dort nicht hier vergessen wird.
 */
type Aufgabenvorlage = Omit<Aufgabe, 'id' | 'geschafft' | 'abgeholt'> & { id: Aufgabenid }

/**
 * Der Stand, wie `laden()` ihn herausgibt: STANDARD fuellt jedes Feld auf.
 * Nur `version` ist keine Zusage — im Spread gewinnt die gespeicherte Zahl, und
 * die hat niemand geprueft. Deshalb `number` statt der `1` aus `Aufgabenstand`
 * (dieselbe Unterscheidung wie `GeladenerStand` im progressStore).
 */
interface GeladenerAufgabenstand extends Omit<Aufgabenstand, 'version'> {
  version: number
}

const STANDARD: Aufgabenstand = { version: 1, abgeholt: {}, tag: null, wochenStart: null, basis: {} }

let cache: GeladenerAufgabenstand | null = null

function laden(): GeladenerAufgabenstand {
  if (cache) return cache
  // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
  // Eintrag liegen darf, dem Felder fehlen — genau dagegen stehen die beiden
  // Rueckfaelle darunter.
  cache = { ...STANDARD, ...(lies<Partial<Aufgabenstand>>(KEYS.aufgaben) || {}) }
  cache.abgeholt = cache.abgeholt || {}
  cache.basis = cache.basis || {}
  return cache
}

function sichern(d: GeladenerAufgabenstand, still = false): GeladenerAufgabenstand {
  cache = d
  schreibe(KEYS.aufgaben, d)
  // holeAufgaben() laeuft waehrend des Renderns. Ein melden() daraus wuerde
  // React mitten im Zeichnen zum Neuzeichnen zwingen — deshalb still speichern.
  if (!still) melden()
  return d
}

/** Beim Tageswechsel werden die Belohnungsmarken zurueckgesetzt. */
function pruefeTag(d: GeladenerAufgabenstand): GeladenerAufgabenstand {
  const t = heute()
  const w = wochenStartTag()
  let neu = d
  if (d.tag !== t) {
    neu = { ...neu, tag: t, abgeholt: { ...neu.abgeholt } }
    Object.keys(neu.abgeholt)
      .filter((k) => k.startsWith('t-'))
      .forEach((k) => delete neu.abgeholt[k])
    // Basiswerte fuer Aufgaben, die auf Gesamtzahlen aufbauen
    neu.basis = { ...neu.basis, tagEinheiten: kursFortschritt().fertig }
  }
  if (d.wochenStart !== w) {
    neu = { ...neu, wochenStart: w, abgeholt: { ...neu.abgeholt } }
    Object.keys(neu.abgeholt)
      .filter((k) => k.startsWith('w-'))
      .forEach((k) => delete neu.abgeholt[k])
    neu.basis = { ...neu.basis, wocheEinheiten: kursFortschritt().fertig }
  }
  if (neu !== d) sichern(neu, true)
  return neu
}

// `??` und nicht `||`: 0 ist ein gueltiger Basiswert. Wer den Tag mit null
// abgeschlossenen Einheiten beginnt, soll die erste von heute auch zaehlen
// sehen — mit `||` faenge die Rechnung bei der Gesamtzahl an und der Stand
// bliebe fuer immer 0.
function heutigeEinheiten(basis: Aufgabenbasis): number {
  return Math.max(0, kursFortschritt().fertig - (basis.tagEinheiten ?? kursFortschritt().fertig))
}

function wochenEinheiten(basis: Aufgabenbasis): number {
  return Math.max(0, kursFortschritt().fertig - (basis.wocheEinheiten ?? kursFortschritt().fertig))
}

/** Alle Aufgaben mit aktuellem Stand. */
export function holeAufgaben(): Aufgabenliste {
  const d = pruefeTag(laden())
  // tagesStatistik() reicht den rohen Tag durch, und ein aus v1 uebernommener
  // Tag kennt nur `aufgaben`, `richtig` und `sekunden`. Ohne diese Standardwerte
  // wuerde aus Math.min(tag.maxFolge, 3) ein NaN und „3 richtige Antworten
  // hintereinander" liesse sich nie mehr abschliessen. `folge` fehlt hier, weil
  // es keine Aufgabe liest.
  const leererTag: Omit<Tag, 'folge'> = {
    aufgaben: 0,
    richtig: 0,
    sekunden: 0,
    skills: {},
    maxFolge: 0,
  }
  const tag = { ...leererTag, ...(tagesStatistik() || {}) }

  const taeglich: Aufgabenvorlage[] = [
    {
      id: 't-wdh',
      name: '10 Wörter wiederholen',
      icon: 'wiederholen',
      stand: Math.min(tag.aufgaben, 10),
      ziel: 10,
      belohnung: { xp: 20, edelsteine: 1 },
    },
    {
      id: 't-hoeren',
      name: '5 Hörfragen lösen',
      icon: 'kopfhoerer',
      stand: Math.min(tag.skills.hoeren || 0, 5),
      ziel: 5,
      belohnung: { xp: 15, edelsteine: 1 },
    },
    {
      id: 't-einheit',
      name: 'Eine Lektion abschließen',
      icon: 'buch',
      stand: Math.min(heutigeEinheiten(d.basis), 1),
      ziel: 1,
      belohnung: { xp: 30, edelsteine: 2 },
    },
    {
      id: 't-serie',
      name: '3 richtige Antworten hintereinander',
      icon: 'blitz',
      stand: Math.min(tag.maxFolge, 3),
      ziel: 3,
      belohnung: { xp: 10, edelsteine: 1 },
    },
  ]

  const woechentlich: Aufgabenvorlage[] = [
    {
      id: 'w-100',
      name: '100 Wörter wiederholen',
      icon: 'wiederholen',
      stand: Math.min(wochenSummeSeitMontag(), 100),
      ziel: 100,
      belohnung: { xp: 100, edelsteine: 5 },
    },
    {
      id: 'w-zeit',
      name: '60 Minuten lernen',
      icon: 'uhr',
      stand: Math.min(wochenMinutenSeitMontag(), 60),
      ziel: 60,
      belohnung: { xp: 120, edelsteine: 5 },
    },
    {
      id: 'w-einheiten',
      name: '3 Kapitel abschließen',
      icon: 'stern',
      stand: Math.min(wochenEinheiten(d.basis), 3),
      ziel: 3,
      belohnung: { xp: 150, schluessel: 1 },
    },
  ]

  const markiere = (a: Aufgabenvorlage): Aufgabe => ({
    ...a,
    geschafft: a.stand >= a.ziel,
    abgeholt: !!d.abgeholt[a.id],
  })

  return { taeglich: taeglich.map(markiere), woechentlich: woechentlich.map(markiere) }
}

/**
 * Belohnung einer geschafften Aufgabe abholen.
 *
 * `id` bleibt `string` und nicht `Aufgabenid`: die Funktion sucht nach und
 * antwortet mit `null`, wenn nichts passt — sie darf mit jedem Text gerufen
 * werden, den eine Oberflaeche gerade in der Hand hat.
 */
export function holeBelohnung(id: string): Aufgabenbelohnung | null {
  const alle = holeAufgaben()
  const aufgabe = [...alle.taeglich, ...alle.woechentlich].find((a) => a.id === id)
  if (!aufgabe || !aufgabe.geschafft || aufgabe.abgeholt) return null
  const d = { ...laden() }
  d.abgeholt = { ...d.abgeholt, [id]: heute() }
  sichern(d)
  if (aufgabe.belohnung.xp) gibXp(aufgabe.belohnung.xp)
  if (aufgabe.belohnung.edelsteine) gibEdelsteine(aufgabe.belohnung.edelsteine)
  if (aufgabe.belohnung.schluessel) gibSchluessel(aufgabe.belohnung.schluessel)
  return aufgabe.belohnung
}

export function offeneBelohnungen(): number {
  const alle = holeAufgaben()
  return [...alle.taeglich, ...alle.woechentlich].filter((a) => a.geschafft && !a.abgeholt).length
}

export { holeFortschritt }

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.aufgaben) cache = null
})
