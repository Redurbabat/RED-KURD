// Lernstand fuer die neuen App-Bereiche (Code lernen, AI-Sprache).
// Ein kleiner Baukasten: jeder Bereich bekommt seinen eigenen Schluessel,
// aber dieselben Regeln — erledigte Lektionen, XP, Tagesserie.
//
// Der Status einer Lektion wird IMMER hieraus abgeleitet, nie aus den
// Datendateien: erledigt -> 'done', die erste offene -> 'current', die
// direkt folgende -> 'open', alles danach -> 'locked'.
import { lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'
import { heute } from '../progress/scheduler.ts'
import { aktualisiereSerie } from '../progress/gamification.ts'

import type {
  Bereichsbaukasten,
  Bereichslernstand,
  Lektionskennung,
  Lektionsstatus,
} from '../../types/lernstand'

export const XP_JE_LEKTION = 10
export const XP_JE_UEBUNG = 15
export const TAGESZIEL_XP = 30

const LEER: Bereichslernstand = {
  version: 1,
  erledigt: {}, // { lektionsId/uebungsId: 'JJJJ-MM-TT' }
  notizen: {}, // { uebungsId: 'eigene Loesung/Notiz' }
  xp: 0,
  serie: 0,
  letzterTag: null,
  tage: {}, // { 'JJJJ-MM-TT': xp } — fuer „XP heute"
}

/** Einen Bereichs-Lernstand an einen Speicherschluessel binden. */
export function erstelleBereichsLernstand(key: string): Bereichsbaukasten {
  let cache: Bereichslernstand | null = null

  function laden(): Bereichslernstand {
    if (cache) return cache
    // `Partial`, weil auf der Platte ein aelterer oder von Hand veraenderter
    // Stand liegen darf. Der Typ ist die Erwartung dieser Stelle, keine Zusage
    // von `lies()` — deshalb bleiben die drei Rueckfaelle darunter stehen: sie
    // fangen auch ein ausdrueckliches `null` in der Datei ab.
    const d: Partial<Bereichslernstand> = lies<Partial<Bereichslernstand>>(key) || {}
    cache = {
      ...LEER,
      ...d,
      erledigt: { ...(d.erledigt || {}) },
      notizen: { ...(d.notizen || {}) },
      tage: { ...(d.tage || {}) },
    }
    return cache
  }

  function sichern(d: Bereichslernstand): Bereichslernstand {
    cache = d
    schreibe(key, d)
    melden()
    return d
  }

  beiFremdaenderung((geaendert) => {
    if (geaendert === key) cache = null
  })

  return {
    stand(): Bereichslernstand {
      return laden()
    },

    istErledigt(lektionsId: string): boolean {
      return !!laden().erledigt[lektionsId]
    },

    /**
     * Lektion abschliessen. XP gibt es nur beim ersten Mal — ein zweiter
     * Abschluss derselben Lektion ist ein stilles Nichts.
     * @returns gutgeschriebene XP (0 wenn schon erledigt)
     */
    schliesseAb(lektionsId: string, xp: number = XP_JE_LEKTION): number {
      const d = laden()
      if (d.erledigt[lektionsId]) return 0
      const t = heute()
      const neu: Bereichslernstand = {
        ...d,
        erledigt: { ...d.erledigt, [lektionsId]: t },
        xp: (d.xp || 0) + xp,
        tage: { ...d.tage, [t]: (d.tage[t] || 0) + xp },
      }
      // Nur `serie` und `letzterTag` werden uebernommen: `aktualisiereSerie()`
      // liefert zusaetzlich `serienSchutz` und `schutzBenutzt`, doch der
      // Bereichs-Lernstand kennt beide nicht. Wer das zu einem `Object.assign`
      // zusammenzieht, schreibt in alle drei Apps Felder, die kein Leser kennt.
      const serie = aktualisiereSerie(neu, t)
      neu.serie = serie.serie
      neu.letzterTag = serie.letzterTag
      sichern(neu)
      return xp
    },

    xpHeute(): number {
      return laden().tage[heute()] || 0
    },

    /** Eigene Loesung/Notiz zu einer Uebung — bleibt lokal. */
    notiz(id: string): string {
      return laden().notizen[id] || ''
    },

    setzeNotiz(id: string, text: string): void {
      const d = laden()
      // Die Umwandlung bleibt, obwohl der Typ `string` verspricht: die
      // Aufrufer sind noch ungepruefte .jsx-Seiten, und was hier ankommt,
      // landet unveraendert auf der Platte.
      const wert = String(text || '')
      if ((d.notizen[id] || '') === wert) return
      sichern({ ...d, notizen: { ...d.notizen, [id]: wert } })
    },

    serie(): number {
      return laden().serie || 0
    },

    /** Status jeder Lektion einer geordneten Liste ableiten. */
    statusFuer(lektionen: readonly Lektionskennung[]): Record<string, Lektionsstatus> {
      const d = laden()
      const aus: Record<string, Lektionsstatus> = {}
      let aktuelleVergeben = false
      let offeneVergeben = false
      for (const l of lektionen) {
        if (d.erledigt[l.id]) {
          aus[l.id] = 'done'
        } else if (!aktuelleVergeben) {
          aus[l.id] = 'current'
          aktuelleVergeben = true
        } else if (!offeneVergeben) {
          aus[l.id] = 'open'
          offeneVergeben = true
        } else {
          aus[l.id] = 'locked'
        }
      }
      return aus
    },

    /** Fortschritt einer Lektionsliste in Prozent (0–100). */
    fortschrittProzent(lektionen: readonly Lektionskennung[]): number {
      if (!lektionen.length) return 0
      const d = laden()
      const fertig = lektionen.filter((l) => d.erledigt[l.id]).length
      return Math.round((fertig / lektionen.length) * 100)
    },
  }
}
