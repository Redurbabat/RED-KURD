// Form von `texte.js`. Die Datei selbst ist JavaScript; ohne diese Zusage
// leitet TypeScript aus ihrem Inhalt einen Riesentyp ab.
//
// Geprueft wird die Form in `test/lesetexte.test.js`.

/** Eine Verstaendnisfrage zu einem Lesetext. */
export interface Lesefrage {
  frage: string
  optionen: readonly string[]
  /** Der Text der richtigen Option — kein Index. */
  antwort: string
}

/** Ein kuratierter kurzer Lesetext auf Kurmancî. */
export interface Lesetext {
  id: string
  titel: string
  /** „Anfänger“, „Leicht“, „Mittel“ … — Freitext, keine feste Menge. */
  niveau: string
  thema: string
  /** Der kurmancîsche Text. */
  text: string
  uebersetzung: string
  fragen: readonly Lesefrage[]
}

export const texte: readonly Lesetext[]
