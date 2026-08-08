// Laufende Sitzung: wird nach jeder Aufgabe gesichert, damit ein Reload
// oder ein Moduswechsel die Sitzung nicht verliert.
import { KEYS, lies, schreibe, entferne } from '../storage.ts'
import { melden } from '../store.ts'

import type { Sitzung } from '../../types/lernstand'

/**
 * Was der Uebungsspieler uebergibt — die Sitzung ohne `gespeichert`. Den
 * Zeitstempel setzt `sitzungSpeichern()` selbst: er traegt die 48-Stunden-Frist
 * und waere von aussen gesetzt sofort wertlos, weil der Spread ihn ohnehin
 * ueberschreibt.
 */
export type Sitzungsdaten = Omit<Sitzung, 'gespeichert'>

export function sitzungSpeichern(daten: Sitzungsdaten): void {
  schreibe(KEYS.sitzung, { ...daten, gespeichert: new Date().toISOString() })
  melden()
}

// Nach zwei Tagen ist eine liegengebliebene Sitzung veraltet — sie wuerde
// sonst auf der Heute-Seite dauerhaft den aktuellen Tagesplan verdraengen.
const VERFALL_MS = 48 * 60 * 60 * 1000

/**
 * Hier liegt die Grenze zwischen „irgendwas von der Platte" und „fortsetzbar".
 *
 * Das Typargument an `lies` ist die Erwartung des Aufrufers, keine Zusage des
 * Speichers (so beschrieben in storage.ts) — deshalb pruefen die Zeilen
 * darunter selbst nach. Und zwar genau die zwei Felder, an denen ein Fehler
 * wirklich weh tut: `uebungen` und `index`. `titel`, `punkte` und die Form der
 * einzelnen Uebungen bleiben ungeprueft; sie koennen die Anzeige hoechstens
 * haesslich machen, waehrend ein kaputter `index` als NaN-Prozent
 * weiterliefe. Wer sich spaeter auf `titel` oder `punkte` verlaesst, muss sie
 * hier ergaenzen — der Typ allein garantiert sie nicht.
 */
export function sitzungLaden(): Sitzung | null {
  const s = lies<Sitzung>(KEYS.sitzung)
  if (!s || !Array.isArray(s.uebungen) || !s.uebungen.length) return null
  // Korrupter Zeiger (fehlt, NaN, negativ) wuerde sonst als Sitzung mit
  // NaN-Prozent fortgesetzt.
  if (!Number.isInteger(s.index) || s.index < 0 || s.index >= s.uebungen.length) return null
  if (s.gespeichert) {
    const alter = Date.now() - Date.parse(s.gespeichert)
    if (!Number.isFinite(alter) || alter > VERFALL_MS) return null
  }
  return s
}

export function sitzungLoeschen(): void {
  entferne(KEYS.sitzung)
  melden()
}

/**
 * `null` ist ein regulaeres Argument: die Seiten reichen das Ergebnis von
 * `sitzungLaden()` direkt durch (`TodayPage.jsx:106`), ohne es vorher zu
 * pruefen. Die beiden Waechter auf `uebungen` sehen fuer den Pruefer nach
 * totem Code aus, sind es aber nicht — die Aufrufer sind noch JSX und
 * ungeprueft, und `test/sessionStore.test.js` ruft die Funktion ausdruecklich
 * mit einer Sitzung ohne Uebungen auf.
 */
export function sitzungProzent(s: Sitzung | null): number {
  if (!s || !s.uebungen || !s.uebungen.length) return 0
  return Math.round((s.index / s.uebungen.length) * 100)
}
