// Tages- und Wochenaufgaben. Der Fortschritt wird direkt aus dem Lernstand
// abgeleitet — es gibt keine zweite Zaehlung, die auseinanderlaufen koennte.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import { heute, tagVon } from '../progress/scheduler.js'
import { gibXp, gibEdelsteine, gibSchluessel, holeFortschritt } from '../progress/progressStore.js'
import { tagesStatistik, wochenSumme, wochenMinuten } from '../progress/progressSelectors.js'
import { kursFortschritt } from '../courses/courseRepository.js'

const STANDARD = { version: 1, abgeholt: {}, tag: null, wochenStart: null, basis: {} }

let cache

function wochenStart() {
  const d = new Date()
  const tag = (d.getDay() + 6) % 7 // Montag = 0
  d.setDate(d.getDate() - tag)
  return tagVon(d)
}

function laden() {
  if (cache) return cache
  cache = { ...STANDARD, ...(lies(KEYS.aufgaben) || {}) }
  cache.abgeholt = cache.abgeholt || {}
  cache.basis = cache.basis || {}
  return cache
}

function sichern(d, still = false) {
  cache = d
  schreibe(KEYS.aufgaben, d)
  // holeAufgaben() laeuft waehrend des Renderns. Ein melden() daraus wuerde
  // React mitten im Zeichnen zum Neuzeichnen zwingen — deshalb still speichern.
  if (!still) melden()
  return d
}

/** Beim Tageswechsel werden die Belohnungsmarken zurueckgesetzt. */
function pruefeTag(d) {
  const t = heute()
  const w = wochenStart()
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

function heutigeEinheiten(basis) {
  return Math.max(0, kursFortschritt().fertig - (basis.tagEinheiten ?? kursFortschritt().fertig))
}

function wochenEinheiten(basis) {
  return Math.max(0, kursFortschritt().fertig - (basis.wocheEinheiten ?? kursFortschritt().fertig))
}

/** Alle Aufgaben mit aktuellem Stand. */
export function holeAufgaben() {
  const d = pruefeTag(laden())
  const tag = { aufgaben: 0, richtig: 0, sekunden: 0, skills: {}, maxFolge: 0, ...(tagesStatistik() || {}) }

  const taeglich = [
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

  const woechentlich = [
    {
      id: 'w-100',
      name: '100 Wörter wiederholen',
      icon: 'wiederholen',
      stand: Math.min(wochenSumme(), 100),
      ziel: 100,
      belohnung: { xp: 100, edelsteine: 5 },
    },
    {
      id: 'w-zeit',
      name: '60 Minuten lernen',
      icon: 'uhr',
      stand: Math.min(wochenMinuten(), 60),
      ziel: 60,
      belohnung: { xp: 120, edelsteine: 5 },
    },
    {
      id: 'w-einheiten',
      name: '3 Einheiten abschließen',
      icon: 'stern',
      stand: Math.min(wochenEinheiten(d.basis), 3),
      ziel: 3,
      belohnung: { xp: 150, schluessel: 1 },
    },
  ]

  const markiere = (a) => ({
    ...a,
    geschafft: a.stand >= a.ziel,
    abgeholt: !!d.abgeholt[a.id],
  })

  return { taeglich: taeglich.map(markiere), woechentlich: woechentlich.map(markiere) }
}

/** Belohnung einer geschafften Aufgabe abholen. */
export function holeBelohnung(id) {
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

export function offeneBelohnungen() {
  const alle = holeAufgaben()
  return [...alle.taeglich, ...alle.woechentlich].filter((a) => a.geschafft && !a.abgeholt).length
}

export { holeFortschritt }

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.aufgaben) cache = null
})
