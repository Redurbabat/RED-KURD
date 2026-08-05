// Baut aus Wortlisten die einzelnen Aufgaben. Reine Logik, keine Oberflaeche.
import {
  ALLE_WOERTER,
  alleDeutschVon,
  alleKurmanciVon,
  bildVon,
  fotoVon,
} from '../courses/courseRepository.js'

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

/** Welche Aufgabenarten trainieren eine bestimmte Fertigkeit? */
const ARTEN_JE_SKILL = {
  erkennen: ['wahl-de', 'bild'],
  abrufen: ['wahl-ku'],
  schreiben: ['tippen'],
  hoeren: ['hoeren'],
}

/**
 * Baut die falschen Antwortmöglichkeiten.
 * Zwei Fallen bei Homonymen und Synonymen:
 * 1. „roj" heisst Tag UND Sonne — fragt die Aufgabe „roj" mit Antwort „Tag",
 *    darf „Sonne" nicht als falsche Option erscheinen, sonst wird eine
 *    objektiv richtige Wahl als Fehler gewertet. Deshalb sind ALLE
 *    Übersetzungen des Frageworts tabu (`ausgeschlossen`).
 * 2. „Ez fêm nakim" und „Ez fêm nakim." unterscheiden sich nur im Punkt —
 *    Optionen, die nach Tipp-Normalisierung mit der Antwort übereinstimmen,
 *    fliegen ebenfalls raus.
 */
function falscheOptionen(alle, richtig, feld, ausgeschlossen = [], anzahl = 3) {
  const tabu = new Set([richtig, ...ausgeschlossen])
  const aus = []
  for (const x of mische(alle)) {
    const wert = x[feld]
    if (!wert || tabu.has(wert)) continue
    // Auch untereinander duerfen Optionen nicht praktisch gleich sein —
    // „Baran dibare" und „Baran dibare." saehen sonst wie ein Duplikat aus.
    if ([richtig, ...aus].some((r) => istRichtigGetippt(wert, r))) continue
    tabu.add(wert)
    aus.push(wert)
    if (aus.length === anzahl) break
  }
  return aus
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
    // Kommt das Wort aus einer fälligen Karte, wird genau deren Fertigkeit
    // trainiert — sonst bleibt die Karte für immer fällig.
    if (w.skill && ARTEN_JE_SKILL[w.skill]) {
      const passend = auswahl.filter((a) => ARTEN_JE_SKILL[w.skill].includes(a))
      if (passend.length) auswahl = passend
    }
    if (!w.bild) auswahl = auswahl.filter((a) => a !== 'bild')
    if (!auswahl.length) auswahl = ['wahl-ku']
    if (gleicheFolge >= 2 && auswahl.length > 1) auswahl = auswahl.filter((a) => a !== letzteArt)
    const art = mische(auswahl)[0]
    gleicheFolge = art === letzteArt ? gleicheFolge + 1 : 0
    letzteArt = art

    if (art === 'bild') {
      // Hat das Zielwort ein echtes Foto, sollen auch die falschen Kacheln
      // Fotos zeigen — sonst verrät schon die Darstellung die Lösung.
      const zielHatFoto = !!fotoVon(w.ku)
      const falsche = []
      const gesehen = new Set([w.bild])
      const passt = (x) =>
        x.bild && !gesehen.has(x.bild) && x.ku !== w.ku && (!zielHatFoto || !!fotoVon(x.ku))
      for (const x of mische(alle)) {
        if (passt(x)) {
          falsche.push(x)
          gesehen.add(x.bild)
          if (falsche.length === 3) break
        }
      }
      // Zu wenig Foto-Wörter? Dann mit Emoji-Wörtern auffüllen.
      if (zielHatFoto && falsche.length < 3) {
        for (const x of mische(alle)) {
          if (x.bild && !gesehen.has(x.bild) && x.ku !== w.ku) {
            falsche.push(x)
            gesehen.add(x.bild)
            if (falsche.length === 3) break
          }
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
      const falsche = falscheOptionen(alle, w.de, 'de', alleDeutschVon(w.ku))
      if (falsche.length < 3) continue
      uebungen.push({
        art,
        frage: w.ku,
        antwort: w.de,
        optionen: mische([w.de, ...falsche]),
        w,
      })
    } else if (art === 'tippen') {
      uebungen.push({ art, frage: w.de, antwort: w.ku, w })
    } else {
      const falsche = falscheOptionen(alle, w.ku, 'ku', alleKurmanciVon(w.de))
      if (falsche.length < 3) continue
      uebungen.push({
        art,
        frage: w.de,
        antwort: w.ku,
        optionen: mische([w.ku, ...falsche]),
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
