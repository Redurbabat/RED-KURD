// Form von `electroLessons.js`. Die Datei selbst ist JavaScript; ohne diese Zusage
// leitet TypeScript aus ihrem Inhalt einen Riesentyp ab, in dem einzelne
// Eintraege Felder verlieren, sobald ein anderer sie nicht hat.
//
// Geprueft wird die Form in `test/lernbereichsdaten-form.test.js` — eine
// Deklaration waechst nicht mit den Daten mit und kann sonst luegen.

import type { Bereichslektion } from '../../../types/lernbereich'

export const electroLessons: readonly Bereichslektion[]

/** Die Gliederung der Elektro-Lektionen, in dieser Reihenfolge. */
export const electroGruppen: readonly string[]
