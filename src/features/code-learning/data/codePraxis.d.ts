// Form von `codePraxis.js`. Die Datei selbst ist JavaScript; ohne diese Zusage
// leitet TypeScript aus ihrem Inhalt einen Riesentyp ab, in dem einzelne
// Eintraege Felder verlieren, sobald ein anderer sie nicht hat.
//
// Geprueft wird die Form in `test/lernbereichsdaten-form.test.js` — eine
// Deklaration waechst nicht mit den Daten mit und kann sonst luegen.

import type { Praxisaufgabe } from '../../../types/lernbereich'

/** Die kleinen Erstschritte — `stufe: 'grund'` sortiert sie nach vorn. */
export const codeGrunduebungen: readonly Praxisaufgabe[]

export const codePraxisAufgaben: readonly Praxisaufgabe[]
