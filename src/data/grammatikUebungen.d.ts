// Form von `grammatikUebungen.js`. Die Datei selbst ist JavaScript; ohne
// diese Zusage leitet TypeScript aus ihr einen Objekttyp mit 55 festen
// Kapitelnamen ab — und dann laesst sich mit einer beliebigen Kapitel-ID gar
// nicht mehr nachschlagen.
//
// Geprueft wird die Form in `test/grammatikfragen.test.js`.

/** Eine Kontrollfrage zu einer Grammatik-Notiz: vier Optionen, eine richtig. */
export interface Grammatikfrage {
  frage: string
  optionen: readonly string[]
  /** Index der richtigen Option in `optionen`. */
  richtig: number
  /** Begruendung auf Deutsch, wird nach dem Antworten gezeigt. */
  erklaerung: string
}

/**
 * Kapitel-ID → Fragen. Nicht jedes Kapitel kommt vor, deshalb die
 * Index-Signatur mit `| undefined` statt fester Schluessel.
 */
export const grammatikUebungen: Readonly<Record<string, readonly Grammatikfrage[] | undefined>>
