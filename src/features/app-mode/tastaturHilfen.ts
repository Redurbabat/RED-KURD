// Reine Texthilfen fuer die Code-Tastatur: Einfuegen und Loeschen an der
// Cursorposition. Ohne DOM, damit sich alles einfach testen laesst.

/** Ergebnis einer Textaenderung: der neue Text und wohin der Cursor gehoert. */
export interface Textaenderung {
  wert: string
  cursor: number
}

/**
 * Fuegt `vor` (und optional `nach`) an der Cursorposition ein.
 * Ist Text markiert (start != ende), wird er von vor/nach umschlossen —
 * so kann man z. B. ein Wort markieren und mit <h1>…</h1> einfassen.
 */
export function fuegeEin(
  wert: string,
  start: number,
  ende: number,
  vor: string,
  nach = ''
): Textaenderung {
  const von = Math.max(0, Math.min(start, ende))
  const bis = Math.min(wert.length, Math.max(start, ende))
  const auswahl = wert.slice(von, bis)
  const neu = wert.slice(0, von) + vor + auswahl + nach + wert.slice(bis)
  // Ohne Auswahl landet der Cursor zwischen vor und nach (mitten im Baustein),
  // mit Auswahl direkt hinter dem umschlossenen Text.
  return { wert: neu, cursor: von + vor.length + auswahl.length }
}

/** Loescht die Auswahl — oder ohne Auswahl das Zeichen vor dem Cursor. */
export function loescheZurueck(wert: string, start: number, ende: number): Textaenderung {
  const von = Math.max(0, Math.min(start, ende))
  const bis = Math.min(wert.length, Math.max(start, ende))
  if (von !== bis) {
    return { wert: wert.slice(0, von) + wert.slice(bis), cursor: von }
  }
  if (von === 0) return { wert, cursor: 0 }
  return { wert: wert.slice(0, von - 1) + wert.slice(von), cursor: von - 1 }
}
