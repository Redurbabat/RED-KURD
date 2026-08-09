// Form von `codeLessons.js`. Die Datei selbst ist JavaScript; ohne diese Zusage
// leitet TypeScript aus ihrem Inhalt einen Riesentyp ab, in dem einzelne
// Eintraege Felder verlieren, sobald ein anderer sie nicht hat.
//
// Geprueft wird die Form in `test/lernbereichsdaten-form.test.js` — eine
// Deklaration waechst nicht mit den Daten mit und kann sonst luegen.

import type { Lernpfad } from '../../../types/lernbereich'

export const codeLearningPaths: readonly Lernpfad[]

/** Ein Lernpfad zu seiner Id — `undefined`, wenn es ihn nicht gibt. */
export function holeCodePfad(id: string): Lernpfad | undefined
