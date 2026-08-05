// Reine Texthilfen fuer die Code-Tastatur: Einfuegen und Loeschen an der
// Cursorposition. Ohne DOM, damit sich alles einfach testen laesst.

/**
 * Fuegt `vor` (und optional `nach`) an der Cursorposition ein.
 * Ist Text markiert (start != ende), wird er von vor/nach umschlossen —
 * so kann man z. B. ein Wort markieren und mit <h1>…</h1> einfassen.
 * @returns {{wert:string, cursor:number}} neuer Text + neue Cursorposition
 */
export function fuegeEin(wert, start, ende, vor, nach = '') {
  const von = Math.max(0, Math.min(start, ende))
  const bis = Math.min(wert.length, Math.max(start, ende))
  const auswahl = wert.slice(von, bis)
  const neu = wert.slice(0, von) + vor + auswahl + nach + wert.slice(bis)
  // Ohne Auswahl landet der Cursor zwischen vor und nach (mitten im Baustein),
  // mit Auswahl direkt hinter dem umschlossenen Text.
  return { wert: neu, cursor: von + vor.length + auswahl.length }
}

/**
 * Loescht die Auswahl — oder ohne Auswahl das Zeichen vor dem Cursor.
 * @returns {{wert:string, cursor:number}}
 */
export function loescheZurueck(wert, start, ende) {
  const von = Math.max(0, Math.min(start, ende))
  const bis = Math.min(wert.length, Math.max(start, ende))
  if (von !== bis) {
    return { wert: wert.slice(0, von) + wert.slice(bis), cursor: von }
  }
  if (von === 0) return { wert, cursor: 0 }
  return { wert: wert.slice(0, von - 1) + wert.slice(von), cursor: von - 1 }
}
