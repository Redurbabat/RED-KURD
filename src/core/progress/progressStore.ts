// Der eine Lernstand fuer die ganze App.
// Modern-Modus und Abenteuer-Modus schreiben und lesen genau hier — es gibt
// bewusst KEINEN zweiten Fortschritt fuer das Abenteuer.
import { KEYS, lies, schreibe, exportiereSpeicherstand } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'
import { heute, naechsteKarte, kartenSchluessel, SICHER_AB } from './scheduler.ts'
import { aktualisiereSerie } from './gamification.ts'

import type {
  Fertigkeit,
  GespeicherterStand,
  Kartenfertigkeit,
  Lernstand,
  Levelstand,
  Tag,
  Tagesschluessel,
  Tageszielbelohnung,
  Tageszielstand,
  Truhenbelohnung,
} from '../../types/lernstand'

/**
 * Der Stand, wie `laden()` ihn herausgibt: `LEER` fuellt jedes Feld auf, also
 * ist hier alles da — anders als bei `GespeicherterStand`, der beschreibt, was
 * roh auf der Platte liegen darf.
 *
 * Nur `version` ist keine Zusage: im Spread `{ ...LEER, ...d }` gewinnt die
 * gespeicherte Zahl, und die hat niemand geprueft (ein Import bringt mit, was
 * in der Datei stand). Deshalb `number` statt der `2` aus `Lernstand` — wer
 * spaeter gegen eine Version prueft, soll das duerfen.
 */
export interface GeladenerStand extends Omit<Lernstand, 'version'> {
  version: number
}

const LEER: Lernstand = {
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

let cache: GeladenerStand | null = null

function laden(): GeladenerStand {
  if (cache) return cache
  const d = lies<GespeicherterStand>(KEYS.fortschritt) || {}
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

function sichern(d: GeladenerStand): GeladenerStand {
  cache = d
  schreibe(KEYS.fortschritt, d)
  melden()
  return d
}

/** Rohdaten lesen (nur lesend verwenden!). */
export function holeFortschritt(): GeladenerStand {
  return laden()
}

/** Ganzen Lernstand ersetzen — nur fuer Import und Tests. */
export function setzeFortschritt(neu: GespeicherterStand): GeladenerStand {
  return sichern({ ...LEER, ...neu })
}

// ===== XP und Tagesserie =====

export function gibXp(punkte: number): GeladenerStand {
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
export function gibSerienSchutz(anzahl: number = 1): number {
  const d = { ...laden() }
  d.serienSchutz = Math.min(3, Math.max(0, (d.serienSchutz || 0) + anzahl))
  sichern(d)
  return d.serienSchutz
}

export function level(): Levelstand {
  const xp = laden().xp || 0
  return { stufe: Math.floor(xp / 100) + 1, fortschritt: xp % 100, bisNaechstes: 100 - (xp % 100) }
}

// ===== Edelsteine und Schluessel (Abenteuer-Waehrung, gemeinsamer Speicher) =====

export function gibEdelsteine(n: number): GeladenerStand {
  const d = { ...laden() }
  d.edelsteine = Math.max(0, (d.edelsteine || 0) + n)
  return sichern(d)
}

export function gibSchluessel(n: number): GeladenerStand {
  const d = { ...laden() }
  d.schluessel = Math.max(0, (d.schluessel || 0) + n)
  return sichern(d)
}

/** Gibt true zurueck, wenn genug Edelsteine da waren und abgebucht wurde. */
export function zahleEdelsteine(preis: number): boolean {
  const d = { ...laden() }
  if ((d.edelsteine || 0) < preis) return false
  d.edelsteine -= preis
  sichern(d)
  return true
}

export function zahleSchluessel(anzahl: number): boolean {
  const d = { ...laden() }
  if ((d.schluessel || 0) < anzahl) return false
  d.schluessel -= anzahl
  sichern(d)
  return true
}

// ===== Einheiten =====

export function einheitAbgeschlossen(id: string, prozent: number): GeladenerStand {
  const d = { ...laden() }
  d.einheiten = { ...d.einheiten }
  if (!d.einheiten[id] || prozent > d.einheiten[id]) d.einheiten[id] = prozent
  return sichern(d)
}

/**
 * Sterne einer Einheit. Der dritte Stern wird erst bei einer spaeteren
 * erfolgreichen Wiederholung vergeben — beim ersten Durchgang gibt es hoechstens zwei.
 */
export const BESTEHENSGRENZE: number = 80

export function setzeSterne(id: string, prozent: number): number {
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

export function sterneVon(id: string): number {
  return laden().sterne[id] || 0
}

// ===== Karten (Wiederholsystem) =====

export function karteBewerten(
  de: string,
  ku: string,
  skill: Kartenfertigkeit,
  richtig: boolean
): GeladenerStand {
  const d = { ...laden() }
  d.karten = { ...d.karten }
  const key = kartenSchluessel(de, ku, skill)
  d.karten[key] = naechsteKarte(d.karten[key], richtig)
  return sichern(d)
}

/** Wort ins Wiederholsystem aufnehmen (aus Woerterbuch oder Lesetext). */
export function merkeWort(de: string, ku: string, skill: Kartenfertigkeit = 'erkennen'): boolean {
  const d = { ...laden() }
  const key = kartenSchluessel(de, ku, skill)
  if (d.karten[key]) return false
  d.karten = { ...d.karten, [key]: { stufe: 0, faellig: heute(), gesehen: 0, richtig: 0 } }
  sichern(d)
  return true
}

export function vergissWort(de: string, ku: string, skill: Kartenfertigkeit = 'erkennen'): boolean {
  const d = { ...laden() }
  const key = kartenSchluessel(de, ku, skill)
  if (!d.karten[key]) return false
  d.karten = { ...d.karten }
  delete d.karten[key]
  sichern(d)
  return true
}

export function kennstWort(de: string, ku: string, skill: Kartenfertigkeit = 'erkennen'): boolean {
  return !!laden().karten[kartenSchluessel(de, ku, skill)]
}

// ===== Tagesaktivitaet =====

const LEERER_TAG: Tag = { aufgaben: 0, richtig: 0, sekunden: 0, skills: {}, folge: 0, maxFolge: 0 }

export function zaehleAufgabe(
  richtig: boolean,
  sekunden: number = 0,
  skill: Fertigkeit | null = null
): GeladenerStand {
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
  while (alle.length > 60) {
    const aeltester = alle.shift()
    // Unerreichbar: die Schleife laeuft nur bei mehr als 60 Eintraegen, dann
    // liefert shift() immer einen. Der Zweig steht nur, weil shift() fuer den
    // Pruefer grundsaetzlich auch `undefined` liefern kann.
    if (aeltester === undefined) break
    delete d.tage[aeltester]
  }
  return sichern(d)
}

export function zaehleLernzeit(sekunden: number): GeladenerStand | undefined {
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

export function tagesZiel(ziel: number = 20): Tageszielstand {
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

export function holeTageszielBelohnung(ziel: number = 20): Tageszielbelohnung | null {
  const d = { ...laden() }
  const e = d.tage[heute()] || { aufgaben: 0 }
  if (e.aufgaben < ziel || d.zielBelohnt === heute()) return null
  d.zielBelohnt = heute()
  d.xp = (d.xp || 0) + 20
  d.edelsteine = (d.edelsteine || 0) + 1
  sichern(d)
  return { xp: 20, edelsteine: 1 }
}

export function truheBereit(): boolean {
  return laden().truhe !== heute()
}

// ===== Truhe je Welt =====
// Liegt bewusst im Lernstand und nicht in einem eigenen Schluessel, damit
// Export und Import sie mitnehmen.

export function weltTruheDatum(weltId: string): Tagesschluessel | null {
  return (laden().weltTruhen || {})[weltId] || null
}

/** Gutgeschriebene Edelsteine — oder null, wenn die Truhe schon offen war. */
export function oeffneWeltTruhe(weltId: string, edelsteine: number = 5): number | null {
  const d = { ...laden() }
  d.weltTruhen = { ...(d.weltTruhen || {}) }
  if (d.weltTruhen[weltId]) return null
  d.weltTruhen[weltId] = heute()
  d.edelsteine = (d.edelsteine || 0) + edelsteine
  sichern(d)
  return edelsteine
}

export function truheOeffnen(): Truhenbelohnung | null {
  const d = { ...laden() }
  if (d.truhe === heute()) return null
  d.truhe = heute()
  // Feste Reihe statt Zufall: gleiche Belohnung bei gleichem Serientag, gut planbar.
  const stufe = (d.serie || 0) % 5
  // `stufe` trifft die Reihe nur, wenn `serie` eine nicht negative ganze Zahl
  // ist. Das ist bei heilem Lernstand immer so (aktualisiereSerie gibt nie
  // weniger als 1 zurueck), aber `istLernstand()` laesst beim Import auch
  // 2.5, -1, 'x' oder {} durch — dann ist `stufe` 2.5, -1 oder NaN und der
  // Zugriff geht ins Leere.
  //
  // Was sich dabei geaendert hat, und warum es sich aendern musste: bisher
  // wanderte `undefined` weiter, jetzt NaN. TypeScript kann `zahl + undefined`
  // nicht ausdruecken, ohne zu luegen — die Alternative waere ein `?? 0`
  // gewesen, das den Fehler still zugedeckt haette. Fuer einen zahligen
  // `d.xp` ist das Ergebnis dasselbe (beides NaN). Nur zwei Dinge sehen
  // anders aus: die zurueckgegebene Belohnung zeigt `NaN` statt gar nichts,
  // und bei einem `d.xp`, das faelschlich eine Zeichenkette ist, steht
  // hinterher `"100NaN"` statt `"100undefined"` — beides gleich kaputt.
  // Bewusst nicht repariert: das waere eine Verhaltensaenderung und gehoert
  // in eine eigene Aenderung, nicht in eine Typ-Welle (ROADMAP, Phase 3).
  const xp = [10, 15, 20, 25, 30][stufe] ?? NaN
  const edelsteine = stufe >= 3 ? 2 : 1
  d.xp = (d.xp || 0) + xp
  d.edelsteine = (d.edelsteine || 0) + edelsteine
  if (stufe === 4) d.schluessel = (d.schluessel || 0) + 1
  sichern(d)
  return { xp, edelsteine, schluessel: stufe === 4 ? 1 : 0 }
}

// ===== Export / Import =====

/**
 * Ein Objekt und keine Liste — mehr will diese Pruefung nicht wissen. Sie
 * steht hier und nicht in storage.ts, weil sie dort bewusst modul-intern ist.
 */
function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return !!wert && typeof wert === 'object'
}

/**
 * Sieht dieser Wert wie ein RED-KURD-Lernstand aus? Schuetzt den Import:
 * setzeFortschritt wuerde sonst auch einen String oder eine Liste zu
 * Muell-Eigenschaften spreaden und den echten Stand ueberschreiben.
 *
 * Der Waechter behauptet `GespeicherterStand` und nicht `Lernstand`: geprueft
 * wird nur der Umriss — ein Objekt, keine Liste, mindestens ein bekanntes
 * Lernfeld, und die vier Unterobjekte sind, wenn vorhanden, wirklich Objekte.
 * Ob `xp` eine Zahl ist und in `karten` echte Karten stehen, sieht sich
 * niemand an. Genau deshalb faengt der Lesecode alles mit `|| 0` und `|| {}` ab.
 */
export function istLernstand(wert: unknown): wert is GespeicherterStand {
  if (!istObjekt(wert) || Array.isArray(wert)) return false
  // Der Zwischenwert ist noetig, weil die Pruefung oben sonst nicht bis in den
  // some()-Rueckruf hinein gilt: der Pruefer traut einem Parameter nicht zu,
  // dass er ueber eine Funktionsgrenze hinweg gleich bleibt.
  const daten = wert
  const kennt = ['xp', 'karten', 'einheiten', 'serie', 'tage'].some((k) => k in daten)
  if (!kennt) return false
  for (const feld of ['karten', 'einheiten', 'tage', 'sterne']) {
    const w = daten[feld]
    if (w !== undefined && (typeof w !== 'object' || w === null || Array.isArray(w))) return false
  }
  return true
}

/**
 * `extra` sind die Bloecke, die die Aufrufer zusaetzlich auf die oberste Ebene
 * legen — heute Profil, UI und Shop (ProgressPage.jsx:422,
 * SettingsPage.jsx:729), siehe `Sicherungsdatei`. Bewusst offen gehalten: die
 * Funktion schaut nicht hinein, sie schreibt nur mit.
 */
export function exportiereAlles(extra: Record<string, unknown> = {}): string {
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

export function ankiZeilen(): string {
  const d = laden()
  const paare = new Set<string>()
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
