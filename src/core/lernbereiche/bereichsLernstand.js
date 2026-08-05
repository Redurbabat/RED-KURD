// Lernstand fuer die neuen App-Bereiche (Code lernen, AI-Sprache).
// Ein kleiner Baukasten: jeder Bereich bekommt seinen eigenen Schluessel,
// aber dieselben Regeln — erledigte Lektionen, XP, Tagesserie.
//
// Der Status einer Lektion wird IMMER hieraus abgeleitet, nie aus den
// Datendateien: erledigt -> 'done', die erste offene -> 'current', die
// direkt folgende -> 'open', alles danach -> 'locked'.
import { lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import { heute } from '../progress/scheduler.js'
import { aktualisiereSerie } from '../progress/gamification.js'

export const XP_JE_LEKTION = 10
export const XP_JE_UEBUNG = 15
export const TAGESZIEL_XP = 30

const LEER = {
  version: 1,
  erledigt: {}, // { lektionsId/uebungsId: 'JJJJ-MM-TT' }
  notizen: {}, // { uebungsId: 'eigene Loesung/Notiz' }
  xp: 0,
  serie: 0,
  letzterTag: null,
  tage: {}, // { 'JJJJ-MM-TT': xp } — fuer „XP heute"
}

/** Einen Bereichs-Lernstand an einen Speicherschluessel binden. */
export function erstelleBereichsLernstand(key) {
  let cache = null

  function laden() {
    if (cache) return cache
    const d = lies(key) || {}
    cache = {
      ...LEER,
      ...d,
      erledigt: { ...(d.erledigt || {}) },
      notizen: { ...(d.notizen || {}) },
      tage: { ...(d.tage || {}) },
    }
    return cache
  }

  function sichern(d) {
    cache = d
    schreibe(key, d)
    melden()
    return d
  }

  beiFremdaenderung((geaendert) => {
    if (geaendert === key) cache = null
  })

  return {
    stand() {
      return laden()
    },

    istErledigt(lektionsId) {
      return !!laden().erledigt[lektionsId]
    },

    /**
     * Lektion abschliessen. XP gibt es nur beim ersten Mal — ein zweiter
     * Abschluss derselben Lektion ist ein stilles Nichts.
     * @returns {number} gutgeschriebene XP (0 wenn schon erledigt)
     */
    schliesseAb(lektionsId, xp = XP_JE_LEKTION) {
      const d = laden()
      if (d.erledigt[lektionsId]) return 0
      const t = heute()
      const neu = {
        ...d,
        erledigt: { ...d.erledigt, [lektionsId]: t },
        xp: (d.xp || 0) + xp,
        tage: { ...d.tage, [t]: (d.tage[t] || 0) + xp },
      }
      const serie = aktualisiereSerie(neu, t)
      neu.serie = serie.serie
      neu.letzterTag = serie.letzterTag
      sichern(neu)
      return xp
    },

    xpHeute() {
      return laden().tage[heute()] || 0
    },

    /** Eigene Loesung/Notiz zu einer Uebung — bleibt lokal. */
    notiz(id) {
      return laden().notizen[id] || ''
    },

    setzeNotiz(id, text) {
      const d = laden()
      const wert = String(text || '')
      if ((d.notizen[id] || '') === wert) return
      sichern({ ...d, notizen: { ...d.notizen, [id]: wert } })
    },

    serie() {
      return laden().serie || 0
    },

    /**
     * Status jeder Lektion einer geordneten Liste ableiten.
     * @param {Array<{id:string}>} lektionen
     * @returns {Object} { lektionsId: 'done'|'current'|'open'|'locked' }
     */
    statusFuer(lektionen) {
      const d = laden()
      const aus = {}
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
    fortschrittProzent(lektionen) {
      if (!lektionen.length) return 0
      const d = laden()
      const fertig = lektionen.filter((l) => d.erledigt[l.id]).length
      return Math.round((fertig / lektionen.length) * 100)
    },
  }
}
