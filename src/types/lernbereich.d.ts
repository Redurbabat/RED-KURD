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
