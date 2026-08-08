// Der eine Lernstand fuer die ganze App.
// Modern-Modus und Abenteuer-Modus schreiben und lesen genau hier — es gibt
// bewusst KEINEN zweiten Fortschritt fuer das Abenteuer.
import { KEYS, lies, schreibe, exportiereSpeicherstand } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import { heute, naechsteKarte, kartenSchluessel, SICHER_AB } from './scheduler.js'
import { aktualisiereSerie } from './gamification.js'

const LEER = {
  version: 2,
  xp: 0,
  serie: 0,
  letzterTag: null,
  serienSchutz: 0,
  letzterSchutz: null,
  einheiten: {}, // { einheitId: besteProzent }
  sterne: {}, // { einheitId: 0..3 }
  bestanden: {}, // { einheitId: Anzahl bestandener Pruefungen }
  karten: {}, // { "de|ku|skill": { stufe, faellig, gesehen, richtig } }
  tage: {}, // { "2026-07-27": { aufgaben, richtig, sekunden } }
  edelsteine: 0,
  schluessel: 0,
  zielBelohnt: null,
  truhe: null,
  weltTruhen: {}, // { weltId: 'JJJJ-MM-TT' }
  lernzeit: 0, // Sekunden insgesamt
}

let cache = null

function laden() {
  if (cache) return cache
  const d = lies(KEYS.fortschritt) || {}
  cache = {
    ...LEER,
    ...d,
    einheiten: { ...(d.einheiten || {}) },
    sterne: { ...(d.sterne || {}) },
    bestanden: { ...(d.bestanden || {}) },
    karten: { ...(d.karten || {}) },
    tage: { ...(d.tage || {}) },
    weltTruhen: { ...(d.weltTruhen || {}) },
  }
  return cache
}

function sichern(d) {
  cache = d
  schreibe(KEYS.fortschritt, d)
  melden()
  return d
}

/** Rohdaten lesen (nur lesend verwenden!). */
export function holeFortschritt() {
  return laden()
}

/** Ganzen Lernstand ersetzen — nur fuer Import und Tests. */
export function setzeFortschritt(neu) {
  return sichern({ ...LEER, ...neu })
}

// ===== XP und Tagesserie =====

export function gibXp(punkte) {
  const d = { ...laden() }
  d.xp = (d.xp || 0) + punkte
  if (d.letzterTag !== heute()) {
    const neu = aktualisiereSerie(d, heute())
    d.serie = neu.serie
    d.letzterTag = neu.letzterTag
    d.serienSchutz = neu.serienSchutz
    if (neu.schutzBenutzt) d.letzterSchutz = heute()
  }
  return sichern(d)
}

/** Legt bis zu drei automatisch verwendete Schutz-Tage bereit. */
export function gibSerienSchutz(anzahl = 1) {
  const d = { ...laden() }
  d.serienSchutz = Math.min(3, Math.max(0, (d.serienSchutz || 0) + anzahl))
  sichern(d)
  return d.serienSchutz
}

export function level() {
  const xp = laden().xp || 0
  return { stufe: Math.floor(xp / 100) + 1, fortschritt: xp % 100, bisNaechstes: 100 - (xp % 100) }
}

// ===== Edelsteine und Schluessel (Abenteuer-Waehrung, gemeinsamer Speicher) =====

export function gibEdelsteine(n) {
  const d = { ...laden() }
  d.edelsteine = Math.max(0, (d.edelsteine || 0) + n)
  return sichern(d)
}

export function gibSchluessel(n) {
  const d = { ...laden() }
  d.schluessel = Math.max(0, (d.schluessel || 0) + n)
  return sichern(d)
}

/** Gibt true zurueck, wenn genug Edelsteine da waren und abgebucht wurde. */
export function zahleEdelsteine(preis) {
  const d = { ...laden() }
  if ((d.edelsteine || 0) < preis) return false
  d.edelsteine -= preis
  sichern(d)
  return true
}

export function zahleSchluessel(anzahl) {
  const d = { ...laden() }
  if ((d.schluessel || 0) < anzahl) return false
  d.schluessel -= anzahl
  sichern(d)
  return true
}

// ===== Einheiten =====

export function einheitAbgeschlossen(id, prozent) {
  const d = { ...laden() }
  d.einheiten = { ...d.einheiten }
  if (!d.einheiten[id] || prozent > d.einheiten[id]) d.einheiten[id] = prozent
  return sichern(d)
}

/**
 * Sterne einer Einheit. Der dritte Stern wird erst bei einer spaeteren
 * erfolgreichen Wiederholung vergeben — beim ersten Durchgang gibt es hoechstens zwei.
 */
export const BESTEHENSGRENZE = 80

export function setzeSterne(id, prozent) {
  const d = { ...laden() }
  d.sterne = { ...d.sterne }
  d.bestanden = { ...(d.bestanden || {}) }

  // Nur bestandene Durchgaenge zaehlen. Sonst wuerde ein Versuch mit 50 %
  // bereits als "erster Durchgang" gelten und der dritte Stern kaeme zu frueh.
  if (prozent >= BESTEHENSGRENZE) d.bestanden[id] = (d.bestanden[id] || 0) + 1
  const bestandeneLaeufe = d.bestanden[id] || 0

  let neu = 0
  if (prozent >= 50) neu = 1
  if (prozent >= BESTEHENSGRENZE) neu = 2
  // Der dritte Stern erst bei einer spaeteren erfolgreichen Wiederholung.
  if (prozent >= BESTEHENSGRENZE && bestandeneLaeufe >= 2) neu = 3

  d.sterne[id] = Math.max(d.sterne[id] || 0, neu)
  sichern(d)
  return d.sterne[id]
}

export function sterneVon(id) {
  return laden().sterne[id] || 0
}

// ===== Karten (Wiederholsystem) =====

export function karteBewerten(de, ku, skill, richtig) {
  const d = { ...laden() }
  d.karten = { ...d.karten }
  const key = kartenSchluessel(de, ku, skill)
  d.karten[key] = naechsteKarte(d.karten[key], richtig)
  return sichern(d)
}

/** Wort ins Wiederholsystem aufnehmen (aus Woerterbuch oder Lesetext). */
export function merkeWort(de, ku, skill = 'erkennen') {
  const d = { ...laden() }
  const key = kartenSchluessel(de, ku, skill)
  if (d.karten[key]) return false
  d.karten = { ...d.karten, [key]: { stufe: 0, faellig: heute(), gesehen: 0, richtig: 0 } }
  sichern(d)
  return true
}

export function vergissWort(de, ku, skill = 'erkennen') {
  const d = { ...laden() }
  const key = kartenSchluessel(de, ku, skill)
  if (!d.karten[key]) return false
  d.karten = { ...d.karten }
  delete d.karten[key]
  sichern(d)
  return true
}

export function kennstWort(de, ku, skill = 'erkennen') {
  return !!laden().karten[kartenSchluessel(de, ku, skill)]
}

// ===== Tagesaktivitaet =====

const LEERER_TAG = { aufgaben: 0, richtig: 0, sekunden: 0, skills: {}, folge: 0, maxFolge: 0 }

export function zaehleAufgabe(richtig, sekunden = 0, skill = null) {
  const d = { ...laden() }
  const t = heute()
  d.tage = { ...d.tage }
  const e = { ...LEERER_TAG, ...(d.tage[t] || {}) }
  e.skills = { ...e.skills }
  e.aufgaben += 1
  if (richtig) {
    e.richtig += 1
    e.folge += 1
    e.maxFolge = Math.max(e.maxFolge, e.folge)
  } else {
    e.folge = 0
  }
  if (skill) e.skills[skill] = (e.skills[skill] || 0) + 1
  e.sekunden += sekunden
  d.tage[t] = e
  d.lernzeit = (d.lernzeit || 0) + sekunden
  // Nur die letzten 60 Tage aufheben
  const alle = Object.keys(d.tage).sort()
  while (alle.length > 60) delete d.tage[alle.shift()]
  return sichern(d)
}

export function zaehleLernzeit(sekunden) {
  if (!sekunden) return
  const d = { ...laden() }
  const t = heute()
  d.tage = { ...d.tage }
  const e = { ...LEERER_TAG, ...(d.tage[t] || {}) }
  e.sekunden += sekunden
  d.tage[t] = e
  d.lernzeit = (d.lernzeit || 0) + sekunden
  return sichern(d)
}

// ===== Tagesziel und Truhe =====

export function tagesZiel(ziel = 20) {
  const d = laden()
  const e = d.tage[heute()] || { aufgaben: 0 }
  return {
    erledigt: Math.min(e.aufgaben, ziel),
    roh: e.aufgaben,
    ziel,
    geschafft: e.aufgaben >= ziel,
    belohnt: d.zielBelohnt === heute(),
  }
}

export function holeTageszielBelohnung(ziel = 20) {
  const d = { ...laden() }
  const e = d.tage[heute()] || { aufgaben: 0 }
  if (e.aufgaben < ziel || d.zielBelohnt === heute()) return null
  d.zielBelohnt = heute()
  d.xp = (d.xp || 0) + 20
  d.edelsteine = (d.edelsteine || 0) + 1
  sichern(d)
  return { xp: 20, edelsteine: 1 }
}

export function truheBereit() {
  return laden().truhe !== heute()
}

// ===== Truhe je Welt =====
// Liegt bewusst im Lernstand und nicht in einem eigenen Schluessel, damit
// Export und Import sie mitnehmen.

export function weltTruheDatum(weltId) {
  return (laden().weltTruhen || {})[weltId] || null
}

/** @returns {number|null} gutgeschriebene Edelsteine oder null, wenn schon offen */
export function oeffneWeltTruhe(weltId, edelsteine = 5) {
  const d = { ...laden() }
  d.weltTruhen = { ...(d.weltTruhen || {}) }
  if (d.weltTruhen[weltId]) return null
  d.weltTruhen[weltId] = heute()
  d.edelsteine = (d.edelsteine || 0) + edelsteine
  sichern(d)
  return edelsteine
}

export function truheOeffnen() {
  const d = { ...laden() }
  if (d.truhe === heute()) return null
  d.truhe = heute()
  // Feste Reihe statt Zufall: gleiche Belohnung bei gleichem Serientag, gut planbar.
  const stufe = (d.serie || 0) % 5
  const xp = [10, 15, 20, 25, 30][stufe]
  const edelsteine = stufe >= 3 ? 2 : 1
  d.xp = (d.xp || 0) + xp
  d.edelsteine = (d.edelsteine || 0) + edelsteine
  if (stufe === 4) d.schluessel = (d.schluessel || 0) + 1
  sichern(d)
  return { xp, edelsteine, schluessel: stufe === 4 ? 1 : 0 }
}

// ===== Export / Import =====

/**
 * Sieht dieser Wert wie ein RED-KURD-Lernstand aus? Schuetzt den Import:
 * setzeFortschritt wuerde sonst auch einen String oder eine Liste zu
 * Muell-Eigenschaften spreaden und den echten Stand ueberschreiben.
 */
export function istLernstand(wert) {
  if (!wert || typeof wert !== 'object' || Array.isArray(wert)) return false
  const kennt = ['xp', 'karten', 'einheiten', 'serie', 'tage'].some((k) => k in wert)
  if (!kennt) return false
  for (const feld of ['karten', 'einheiten', 'tage', 'sterne']) {
    const w = wert[feld]
    if (w !== undefined && (typeof w !== 'object' || w === null || Array.isArray(w))) return false
  }
  return true
}

export function exportiereAlles(extra = {}) {
  // Der Fortschritt steht nur einmal in der Datei (top-level) — die Kopie in
  // `speicher` verdoppelte den groessten Teil und konnte vom Cache abweichen.
  // Alte Exportdateien MIT der Kopie bleiben trotzdem importierbar.
  const { fortschritt: _doppelt, ...speicher } = exportiereSpeicherstand()
  return JSON.stringify(
    {
      version: 2,
      app: 'RED-KURD',
      exportiert: new Date().toISOString(),
      fortschritt: laden(),
      speicher,
      ...extra,
    },
    null,
    2
  )
}

export function ankiZeilen() {
  const d = laden()
  const paare = new Set()
  for (const key of Object.keys(d.karten || {})) {
    const [de, ku] = key.split('|')
    if (de && ku) paare.add(`${de}\t${ku}`)
  }
  return [...paare].join('\n')
}

export { SICHER_AB }

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.fortschritt) cache = null
})
