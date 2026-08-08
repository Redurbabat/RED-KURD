// Die Inhalte der drei Bereichs-Apps: Code lernen, AI-Sprache, Elektro-Lehre.
//
// Bewusst getrennt von `lernstand.d.ts`: dort steht, was gespeichert wird
// (Bereichslernstand, erledigte IDs, Notizen), hier steht, was gelesen wird
// (Lektionstexte, Uebungsaufgaben, Lernpfade). Dasselbe Verhaeltnis wie
// zwischen `lernstand.d.ts` und `kurs.d.ts` in der Sprach-App.
//
// Die Daten selbst sind JavaScript (`features/*/data/*.js`). Eine Deklaration
// waechst nicht mit ihnen mit — sie kann luegen, ohne dass der Typpruefer
// etwas merkt. `test/lernbereichsdaten-form.test.js` haelt die echten Daten
// deshalb gegen genau diese Zusagen.

/**
 * Eine Lektion in Code lernen, AI-Sprache oder Elektro-Lehre. Alle drei
 * Datendateien halten dieselbe Form, weil `LektionModal` und `LernpfadKarte`
 * von allen dreien benutzt werden.
 */
export interface Bereichslektion {
  id: string
  title: string
  /** Kurze Zeile unter dem Titel. Fehlt in den Lektionen von `codeLessons`. */
  description?: string
  durationMinutes: number
  /** Der Fliesstext, ein Eintrag je Absatz. */
  inhalt: readonly string[]
  /**
   * Codeblock oder Schema; enthaelt Zeilenumbrueche.
   *
   * Wahlfrei, obwohl heute alle 64 Lektionen eines tragen (gezaehlt, nicht
   * geschaetzt). `LektionModal` laesst den Block weg, wenn keiner da ist —
   * eine kurze Lektion ohne Beispiel soll moeglich bleiben, ohne dass dafuer
   * erst der Typ geaendert werden muss.
   */
  beispiel?: string
  /** Der Merksatz am Ende. Wahlfrei aus demselben Grund wie `beispiel`. */
  merke?: string
  /** Nur Elektro-Lehre gliedert ihre Lektionen zusaetzlich in Gruppen. */
  gruppe?: string
}

/**
 * Eine Uebung. Anders als eine Lektion wird sie nicht gelesen, sondern
 * bearbeitet: der Text steht in `task`, die eigene Loesung landet als Notiz
 * im Bereichslernstand.
 */
export interface Bereichsuebung {
  id: string
  title: string
  topic: string
  /** Freitext („Anfänger", „Mittel", „Fortgeschritten") — keine feste Menge. */
  difficulty: string
  estimatedMinutes: number
  description: string
  task: string
}

/* ===== Mitmach-Aufgaben ===== */

/**
 * Wie eine Mitmach-Aufgabe bedient wird. Bestimmt, welches Eingabefeld
 * `PraxisAufgabe` zeigt — und ob es die Live-Vorschau und die Code-Tastatur
 * dazu gibt (nur bei `'html'`).
 */
export type Praxisart = 'html' | 'text' | 'zahl'

/**
 * Ein Punkt der Pruefliste. `pruefe` bekommt den aktuellen Feldinhalt und
 * sagt, ob der Punkt erfuellt ist; erst wenn alle erfuellt sind, laesst sich
 * die Aufgabe abschliessen.
 */
export interface Praxischeck {
  id: string
  text: string
  pruefe: (wert: string) => boolean
}

/**
 * Eine Mitmach-Aufgabe aus `codePraxis.js`, `promptPraxis.js` oder
 * `electroPraxis.js`.
 *
 * Welche der wahlfreien Felder gesetzt sind, haengt an `art` — heute
 * ausnahmslos (nachgezaehlt ueber alle 54 Aufgaben): `einheit` nur bei
 * `'zahl'`, `skript` und `huelle` nur bei `'html'`, `startCode` bei `'html'`
 * und `'text'`. Als abhaengige Union geschrieben waere das strenger, aber
 * auch sproeder — die Datendateien sind JavaScript, und `PraxisAufgabe`
 * fragt ohnehin jedes Feld einzeln ab.
 */
export interface Praxisaufgabe {
  id: string
  art: Praxisart
  title: string
  topic: string
  estimatedMinutes: number
  description: string
  /** Der Aufgabentext ueber dem Eingabefeld. */
  auftrag: string
  tipp: string
  checks: readonly Praxischeck[]
  /** Besteht alle `checks` — das sichern die Tests ab. */
  musterloesung: string
  /** Vorbelegung des Feldes. Bei `'zahl'`-Aufgaben nicht gesetzt. */
  startCode?: string
  /** Nur `'zahl'`: die Einheit hinter dem Ergebnis (A, Ω, W …). */
  einheit?: string
  /** Nur `'html'`: erlaubt JavaScript in der Vorschau (`sandbox`-Rechte). */
  skript?: boolean
  /** Nur `'html'`: Rahmen-HTML, `{{code}}` wird durch die Eingabe ersetzt. */
  huelle?: string
  /** `'grund'` sortiert die Grunduebungen in der Oberflaeche nach vorn. */
  stufe?: string
}

/* ===== Interaktive Lektionsschritte (codeSchritte.js) ===== */

/**
 * Ein Schritt zum Ankreuzen. `richtig` ist der Index in `optionen`.
 */
export interface Wahlschritt {
  art: 'wahl'
  frage: string
  optionen: readonly string[]
  richtig: number
  /**
   * Warum die Antwort richtig ist. Steht in allen 90 Wahlschritten
   * (nachgezaehlt) — `LektionPlayer` zeigt sie heute nirgends an.
   */
  erklaerung: string
  /** Optionen in Nichtproportionalschrift setzen (`<code>`). */
  code?: boolean
}

/** Was sich Tipp- und Bauschritte teilen: Auftrag, Vorschau, Tipp. */
interface Vorschaufaehig {
  auftrag: string
  /** `false` blendet die Live-Vorschau aus; sonst ist sie da. */
  vorschau?: boolean
  /** Erlaubt JavaScript in der Vorschau (`sandbox="allow-scripts"`). */
  skript?: boolean
  /** Rahmen-HTML, `{{code}}` wird durch das Ergebnis ersetzt. */
  huelle?: string
  /** Wird bei falscher Antwort in der Fussleiste gezeigt. */
  tipp?: string
}

/** Selber schreiben, mit Pruefliste und Code-Tastatur. */
export interface Tippenschritt extends Vorschaufaehig {
  art: 'tippen'
  checks: readonly Praxischeck[]
  /** Besteht alle `checks`. Von `LektionPlayer` nicht gelesen. */
  musterloesung: string
  /** Vorbelegung des Feldes. */
  startText?: string
}

/** Code aus vorgegebenen Bausteinen zusammensetzen. */
export interface Bauenschritt extends Vorschaufaehig {
  art: 'bauen'
  /** Absichtlich in falscher Reihenfolge. */
  bausteine: readonly string[]
  /** Der fertige Code — damit wird das Zusammengebaute verglichen. */
  loesung: string
}

/**
 * Ein Schritt einer interaktiven Lektion. Unterschieden wird ueber `art`;
 * `LektionPlayer` verzweigt genau daran.
 */
export type Lektionsschritt = Wahlschritt | Tippenschritt | Bauenschritt

/** Ein Lernpfad buendelt Lektionen zu einem Thema (`codeLearningPaths`). */
export interface Lernpfad {
  id: string
  title: string
  /** Emoji — in Datendateien erlaubt, siehe `codeLessons.js`. */
  icon: string
  description: string
  level: string
  lessons: readonly Bereichslektion[]
}
