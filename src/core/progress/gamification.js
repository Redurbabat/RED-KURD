// Reine Gamification-Regeln ohne Browser- oder Speicherzugriff.
// Dadurch bleiben Serie und Wochenliga nachvollziehbar und leicht testbar.

const TAG_MS = 24 * 60 * 60 * 1000

function tagAlsUtc(tag) {
  const teile = String(tag || '')
    .split('-')
    .map(Number)
  if (teile.length !== 3 || teile.some((teil) => !Number.isFinite(teil))) return null
  return Date.UTC(teile[0], teile[1] - 1, teile[2])
}

/** Anzahl Kalendertage zwischen zwei Schlüsseln im Format JJJJ-MM-TT. */
export function tageZwischen(von, bis) {
  const start = tagAlsUtc(von)
  const ende = tagAlsUtc(bis)
  if (start === null || ende === null) return 0
  return Math.round((ende - start) / TAG_MS)
}

/**
 * Berechnet den neuen Serienstand für den ersten Lernmoment eines Tages.
 * Schutz wird nur verbraucht, wenn er die komplette Lücke überbrücken kann.
 */
export function aktualisiereSerie(
  { serie = 0, letzterTag = null, serienSchutz = 0 },
  aktuellerTag
) {
  if (letzterTag === aktuellerTag) {
    return { serie, letzterTag, serienSchutz, schutzBenutzt: 0 }
  }

  if (!letzterTag) {
    return { serie: 1, letzterTag: aktuellerTag, serienSchutz, schutzBenutzt: 0 }
  }

  const abstand = tageZwischen(letzterTag, aktuellerTag)
  if (abstand <= 0) {
    return {
      serie: Math.max(1, serie),
      letzterTag: aktuellerTag,
      serienSchutz,
      schutzBenutzt: 0,
    }
  }

  if (abstand === 1) {
    return {
      serie: Math.max(1, serie + 1),
      letzterTag: aktuellerTag,
      serienSchutz,
      schutzBenutzt: 0,
    }
  }

  const fehlendeTage = abstand - 1
  if (serienSchutz >= fehlendeTage) {
    return {
      serie: Math.max(1, serie + 1),
      letzterTag: aktuellerTag,
      serienSchutz: serienSchutz - fehlendeTage,
      schutzBenutzt: fehlendeTage,
    }
  }

  return { serie: 1, letzterTag: aktuellerTag, serienSchutz, schutzBenutzt: 0 }
}

export const WOCHENLIGEN = [
  {
    id: 'tal',
    name: 'Tal-Liga',
    start: 0,
    ziel: 25,
    icon: 'fussspur',
    text: 'Jede Aufgabe bringt dich auf den Weg.',
  },
  {
    id: 'pfad',
    name: 'Pfad-Liga',
    start: 25,
    ziel: 60,
    icon: 'kompass',
    text: 'Deine Lernwoche nimmt Fahrt auf.',
  },
  {
    id: 'berg',
    name: 'Berg-Liga',
    start: 60,
    ziel: 120,
    icon: 'berg',
    text: 'Du übst regelmäßig und mit Ausdauer.',
  },
  {
    id: 'gipfel',
    name: 'Gipfel-Liga',
    start: 120,
    ziel: null,
    icon: 'krone',
    text: 'Das höchste Wochenziel ist erreicht.',
  },
]

/** Persönliche Wochenliga aus der Zahl lokal gelöster Aufgaben. */
export function ligaFuerAufgaben(aufgaben = 0) {
  const stand = Math.max(0, Number(aufgaben) || 0)
  const liga =
    [...WOCHENLIGEN].reverse().find((stufe) => stand >= stufe.start) || WOCHENLIGEN[0]
  const naechste = WOCHENLIGEN[WOCHENLIGEN.indexOf(liga) + 1] || null

  return {
    ...liga,
    aufgaben: stand,
    naechste,
    fortschritt: liga.ziel ? Math.max(0, stand - liga.start) : 1,
    spanne: liga.ziel ? liga.ziel - liga.start : 1,
    fehlen: liga.ziel ? Math.max(0, liga.ziel - stand) : 0,
  }
}
