// Baut aus Wortlisten die einzelnen Aufgaben. Reine Logik, keine Oberflaeche.
import {
  ALLE_WOERTER,
  alleDeutschVon,
  alleKurmanciVon,
  bildVon,
  fotoVon,
} from '../courses/courseRepository.js'

import type {
  Aufgabenart,
  Bildoption,
  Fertigkeit,
  Uebung,
  Uebungswort,
  Wort,
} from '../../types/lernstand'

export function mische<T>(liste: readonly T[]): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // noUncheckedIndexedAccess haelt jeden Index-Zugriff fuer unsicher. Hier
    // liegen beide Indizes nachweislich im Feld: i laeuft von length-1
    // abwaerts, j ist hoechstens i. Greifen kann die Pruefung nur, wenn die
    // Liste selbst `undefined` als Wert enthaelt — dann bliebe dieses eine
    // Paar stehen. Keine der Aufrufstellen uebergibt solche Listen.
    const links = a[i]
    const rechts = a[j]
    if (links === undefined || rechts === undefined) continue
    a[i] = rechts
    a[j] = links
  }
  return a
}

export const ARTEN: readonly Aufgabenart[] = ['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren']

/**
 * Die erlaubten Arten kommen aus den Kursdaten und sind dort blosser Text.
 * Geprueft wird deshalb, nicht vorausgesetzt — genau wie bisher zur Laufzeit.
 */
function istAufgabenart(wert: string): wert is Aufgabenart {
  return ARTEN.some((art) => art === wert)
}

/** Welche Fertigkeit trainiert eine Aufgabenart? */
export const SKILL_JE_ART: Readonly<Record<Aufgabenart, Fertigkeit>> = {
  'wahl-de': 'erkennen',
  bild: 'erkennen',
  'wahl-ku': 'abrufen',
  tippen: 'schreiben',
  hoeren: 'hoeren',
}

export const ART_NAMEN: Readonly<Record<Aufgabenart, string>> = {
  'wahl-ku': 'Wortwahl',
  'wahl-de': 'Bedeutung',
  tippen: 'Schreiben',
  bild: 'Bildwahl',
  hoeren: 'Hören',
}

function ergaenzeBild(w: Uebungswort): Uebungswort {
  return w.bild ? w : { ...w, bild: bildVon(w.ku) }
}

/** Ein Uebungswort, dessen Bild feststeht — nur solche taugen als Bildkachel. */
type WortMitBild = Uebungswort & { bild: string }

function hatBild(w: Uebungswort): w is WortMitBild {
  return !!w.bild
}

/** Welche Aufgabenarten trainieren eine bestimmte Fertigkeit? */
const ARTEN_JE_SKILL: Readonly<Record<Fertigkeit, readonly Aufgabenart[]>> = {
  erkennen: ['wahl-de', 'bild'],
  abrufen: ['wahl-ku'],
  schreiben: ['tippen'],
  hoeren: ['hoeren'],
}

/**
 * Die Fertigkeit eines Uebungsworts ist roher Text aus einem Kartenschluessel:
 * `gemischt` und Unbekanntes kommen vor. Die Tabelle entscheidet, was zaehlt.
 */
function istFertigkeit(wert: string): wert is Fertigkeit {
  return Object.hasOwn(ARTEN_JE_SKILL, wert)
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
function falscheOptionen(
  alle: readonly Wort[],
  richtig: string,
  feld: 'de' | 'ku',
  ausgeschlossen: readonly string[] = [],
  anzahl: number = 3
): string[] {
  const tabu = new Set<string>([richtig, ...ausgeschlossen])
  const aus: string[] = []
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
 * Baut die Aufgabenliste fuer die Uebungs-Oberflaeche.
 * @param woerter Woerter, die geuebt werden sollen
 * @param arten erlaubte Aufgabenarten; unbekannte Namen werden verworfen
 */
export function baueUebungen(woerter: readonly Uebungswort[], arten?: readonly string[]): Uebung[] {
  const erlaubt: readonly string[] = arten && arten.length ? arten : ARTEN
  const alle: readonly Wort[] = ALLE_WOERTER
  const uebungen: Uebung[] = []
  let letzteArt: Aufgabenart | null = null
  let gleicheFolge = 0

  for (const roh of mische(woerter)) {
    const w = ergaenzeBild(roh)
    let auswahl = erlaubt.filter(istAufgabenart)
    // Kommt das Wort aus einer fälligen Karte, wird genau deren Fertigkeit
    // trainiert — sonst bleibt die Karte für immer fällig.
    const skill = w.skill
    if (skill !== undefined && istFertigkeit(skill)) {
      const passend = auswahl.filter((a) => ARTEN_JE_SKILL[skill].includes(a))
      if (passend.length) auswahl = passend
    }
    if (!w.bild) auswahl = auswahl.filter((a) => a !== 'bild')
    if (!auswahl.length) auswahl = ['wahl-ku']
    if (gleicheFolge >= 2 && auswahl.length > 1) auswahl = auswahl.filter((a) => a !== letzteArt)
    // Der Rueckfall ist derselbe wie zwei Zeilen darueber: eine leere Auswahl
    // wird zu 'wahl-ku'. Leer werden kann sie hier nur, wenn ein Aufrufer
    // dieselbe Art mehrfach uebergibt — keine Aufrufstelle tut das.
    const art: Aufgabenart = mische(auswahl)[0] ?? 'wahl-ku'
    gleicheFolge = art === letzteArt ? gleicheFolge + 1 : 0
    letzteArt = art

    if (art === 'bild') {
      // Ohne Bild kann `art` gar nicht 'bild' sein — 'bild' faellt oben aus
      // der Auswahl. Der Wert wird hier nur festgehalten, damit auch der Typ
      // weiss, dass er steht.
      const zielBild = w.bild
      if (!zielBild) continue
      // Hat das Zielwort ein echtes Foto, sollen auch die falschen Kacheln
      // Fotos zeigen — sonst verrät schon die Darstellung die Lösung.
      const zielHatFoto = !!fotoVon(w.ku)
      const falsche: WortMitBild[] = []
      const gesehen = new Set<string>([zielBild])
      const passt = (x: Wort): x is WortMitBild =>
        hatBild(x) && !gesehen.has(x.bild) && x.ku !== w.ku && (!zielHatFoto || !!fotoVon(x.ku))
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
          if (hatBild(x) && !gesehen.has(x.bild) && x.ku !== w.ku) {
            falsche.push(x)
            gesehen.add(x.bild)
            if (falsche.length === 3) break
          }
        }
      }
      if (falsche.length < 3) continue
      // Dasselbe Wort, nur mit festgehaltenem Bild: Sonst wuesste der Typ der
      // Kacheln nicht, dass jede eines hat. Gelesen werden ohnehin nur `bild`
      // und `ku`, die Kachel ist also Zeichen fuer Zeichen dieselbe.
      const zielWort: WortMitBild = { ...w, bild: zielBild }
      const optionen: Bildoption[] = mische([zielWort, ...falsche]).map((x) => ({
        bild: x.bild,
        ku: x.ku,
      }))
      uebungen.push({ art, frage: w.ku, antwort: zielBild, optionen, w })
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

/**
 * Prueft eine getippte Antwort grosszuegig (Sonderzeichen und Satzzeichen egal).
 * Beide Seiten sind bewusst `unknown`: Die Funktion wird auch mit null und mit
 * Werten aus gespeicherten Sitzungen aufgerufen, `String(s || '')` faengt das ab.
 */
export function istRichtigGetippt(eingabe: unknown, richtig: unknown): boolean {
  const norm = (s: unknown) =>
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
