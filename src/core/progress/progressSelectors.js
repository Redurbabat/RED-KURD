// Auswertungen des Lernstands: faellige Karten, Fertigkeiten, Wochenaktivitaet.
// Reine Lesefunktionen — sie aendern nichts.
import { holeFortschritt, level } from './progressStore.js'
import { heute, tagVon, schluesselTeile, SICHER_AB, SKILLS } from './scheduler.js'

/** Alle heute faelligen Karten. */
export function faelligeKarten() {
  const d = holeFortschritt()
  const h = heute()
  return Object.entries(d.karten || {})
    .filter(([, k]) => !k.faellig || k.faellig <= h)
    .map(([key, k]) => ({ ...schluesselTeile(key), stufe: k.stufe || 0, karte: k }))
}

/** Karten, die immer wieder falsch beantwortet werden. */
export function schwierigeKarten(limit = 10) {
  return faelligeKarten()
    .filter((k) => k.stufe === 0)
    .sort((a, b) => (b.karte.gesehen || 0) - (a.karte.gesehen || 0))
    .slice(0, limit)
}

/** Fertigkeitsprofil in Prozent + Anzahl je Fertigkeit. */
export function fertigkeiten() {
  const d = holeFortschritt()
  const zaehler = {}
  SKILLS.forEach((s) => (zaehler[s] = { gut: 0, gesamt: 0 }))
  for (const [key, k] of Object.entries(d.karten || {})) {
    const { skill } = schluesselTeile(key)
    const ziel = zaehler[skill]
    if (!ziel) continue
    ziel.gesamt += 1
    if ((k.stufe || 0) >= SICHER_AB) ziel.gut += 1
  }
  const aus = {}
  for (const s of SKILLS) {
    const { gut, gesamt } = zaehler[s]
    aus[s] = gesamt ? Math.round((gut / gesamt) * 100) : 0
    aus[s + 'Anzahl'] = gesamt
  }
  return aus
}

export function fertigkeitStufe(prozent) {
  if (prozent >= 70) return 'Stark'
  if (prozent >= 50) return 'Fortgeschritten'
  if (prozent >= 25) return 'Auf dem Weg'
  return 'Am Anfang'
}

/** Schwaechste Fertigkeit mit mindestens einer Karte. */
export function schwaechsteFertigkeit() {
  const f = fertigkeiten()
  const mitDaten = SKILLS.filter((s) => f[s + 'Anzahl'] > 0)
  if (!mitDaten.length) return null
  return mitDaten.sort((a, b) => f[a] - f[b])[0]
}

export function staerksteFertigkeit() {
  const f = fertigkeiten()
  const mitDaten = SKILLS.filter((s) => f[s + 'Anzahl'] > 0)
  if (!mitDaten.length) return null
  return mitDaten.sort((a, b) => f[b] - f[a])[0]
}

/** Kernzahlen fuer Kopfleisten und Fortschrittsseite. */
export function statistik() {
  const d = holeFortschritt()
  const karten = Object.values(d.karten || {})
  const woerter = new Set(Object.keys(d.karten || {}).map((k) => k.split('|').slice(0, 2).join('|')))
  return {
    xp: d.xp || 0,
    serie: d.serie || 0,
    edelsteine: d.edelsteine || 0,
    schluessel: d.schluessel || 0,
    level: level().stufe,
    gelernt: woerter.size,
    karten: karten.length,
    sicher: karten.filter((k) => (k.stufe || 0) >= SICHER_AB).length,
    faellig: faelligeKarten().length,
    lernzeit: d.lernzeit || 0,
    einheiten: d.einheiten || {},
  }
}

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function wochenAktivitaet() {
  const d = holeFortschritt()
  const aus = []
  for (let i = 6; i >= 0; i--) {
    const t = new Date()
    t.setDate(t.getDate() - i)
    const key = tagVon(t)
    const e = (d.tage || {})[key] || { aufgaben: 0, richtig: 0, sekunden: 0 }
    aus.push({
      tag: WOCHENTAGE[t.getDay()],
      datum: key,
      anzahl: e.aufgaben || 0,
      richtig: e.richtig || 0,
      sekunden: e.sekunden || 0,
      heute: i === 0,
    })
  }
  return aus
}

export function tagesStatistik(datum = heute()) {
  const d = holeFortschritt()
  return (d.tage || {})[datum] || null
}

export function gesternStatistik() {
  const t = new Date()
  t.setDate(t.getDate() - 1)
  return tagesStatistik(tagVon(t))
}

/** Wieviele Aufgaben wurden diese Woche geloest? (fuer Wochenaufgaben) */
export function wochenSumme() {
  return wochenAktivitaet().reduce((s, t) => s + t.anzahl, 0)
}

/** Lernminuten der letzten sieben Tage. */
export function wochenMinuten() {
  return Math.round(wochenAktivitaet().reduce((s, t) => s + t.sekunden, 0) / 60)
}

export function lernzeitText(sekunden) {
  const min = Math.round((sekunden || 0) / 60)
  if (min < 60) return `${min} Min`
  const std = Math.floor(min / 60)
  return `${std} Std ${min % 60} Min`
}
