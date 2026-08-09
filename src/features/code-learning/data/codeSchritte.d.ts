// Form von `codeSchritte.js`. Die Datei selbst ist JavaScript; ohne diese Zusage
// leitet TypeScript aus ihrem Inhalt einen Riesentyp ab, in dem einzelne
// Eintraege Felder verlieren, sobald ein anderer sie nicht hat.
//
// Geprueft wird die Form in `test/lernbereichsdaten-form.test.js` — eine
// Deklaration waechst nicht mit den Daten mit und kann sonst luegen.

import type { Lektionsschritt } from '../../../types/lernbereich'

/**
 * Die Schritte einer Lektion — `undefined`, wenn die Lektion keine hat.
 * Dann zeigen die Seiten das Lese-Modal statt des Players.
 */
export function holeSchritte(lektionId: string): readonly Lektionsschritt[] | undefined

/** Lektions-Id → Schritte. Nicht jede Lektion kommt vor. */
export const alleSchritte: Readonly<Record<string, readonly Lektionsschritt[] | undefined>>
