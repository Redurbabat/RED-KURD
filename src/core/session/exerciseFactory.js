// Baut aus Wortlisten die einzelnen Aufgaben. Reine Logik, keine Oberflaeche.
import { ALLE_WOERTER, bildVon } from '../courses/courseRepository.js'

export function mische(liste) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const ARTEN = ['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren']

/** Welche Fertigkeit trainiert eine Aufgabenart? */
export const SKILL_JE_ART = {
  'wahl-de': 'erkennen',
  bild: 'erkennen',
  'wahl-ku': 'abrufen',
  tippen: 'schreiben',
  hoeren: 'hoeren',
}

export const ART_NAMEN = {
  'wahl-ku': 'Wortwahl',
  'wahl-de': 'Bedeutung',
  tippen: 'Schreiben',
  bild: 'Bildwahl',
  hoeren: 'Hören',
}

function ergaenzeBild(w) {
  return w.bild ? w : { ...w, bild: bildVon(w.ku) }
}

/**
 * @param {Array<{de:string, ku:string, bild?:string}>} woerter
 * @param {string[]} [arten] erlaubte Aufgabenarten
 * @returns Aufgabenliste fuer die Uebungs-Oberflaeche
 */
export function baueUebungen(woerter, arten) {
  const erlaubt = arten && arten.length ? arten : ARTEN
  const alle = ALLE_WOERTER
  const uebungen = []
  let letzteArt = null
  let gleicheFolge = 0

  for (const roh of mische(woerter)) {
    const w = ergaenzeBild(roh)
    let auswahl = erlaubt.filter((a) => ARTEN.includes(a))
    if (!w.bild) auswahl = auswahl.filter((a) => a !== 'bild')
    if (!auswahl.length) auswahl = ['wahl-ku']
    if (gleicheFolge >= 2 && auswahl.length > 1) auswahl = auswahl.filter((a) => a !== letzteArt)
    const art = mische(auswahl)[0]
    gleicheFolge = art === letzteArt ? gleicheFolge + 1 : 0
    letzteArt = art

    if (art === 'bild') {
      const falsche = []
      const gesehen = new Set([w.bild])
      for (const x of mische(alle)) {
        if (x.bild && !gesehen.has(x.bild) && x.ku !== w.ku) {
          falsche.push(x)
          gesehen.add(x.bild)
          if (falsche.length === 3) break
        }
      }
      if (falsche.length < 3) continue
      uebungen.push({
        art,
        frage: w.ku,
        antwort: w.bild,
        optionen: mische([w, ...falsche]).map((x) => ({ bild: x.bild, ku: x.ku })),
        w,
      })
    } else if (art === 'hoeren' || art === 'wahl-de') {
      const falsche = mische(alle.filter((x) => x.de !== w.de)).slice(0, 3)
      if (falsche.length < 3) continue
      uebungen.push({
        art,
        frage: w.ku,
        antwort: w.de,
        optionen: mische([w.de, ...falsche.map((x) => x.de)]),
        w,
      })
    } else if (art === 'tippen') {
      uebungen.push({ art, frage: w.de, antwort: w.ku, w })
    } else {
      const falsche = mische(alle.filter((x) => x.ku !== w.ku)).slice(0, 3)
      if (falsche.length < 3) continue
      uebungen.push({
        art,
        frage: w.de,
        antwort: w.ku,
        optionen: mische([w.ku, ...falsche.map((x) => x.ku)]),
        w,
      })
    }
  }
  return uebungen
}

/** Prueft eine getippte Antwort grosszuegig (Sonderzeichen und Satzzeichen egal). */
export function istRichtigGetippt(eingabe, richtig) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .trim()
      .replace(/ê/g, 'e')
      .replace(/î/g, 'i')
      .replace(/û/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/[.,!?'’"]/g, '')
      .replace(/\s+/g, ' ')
  return norm(eingabe) === norm(richtig)
}
