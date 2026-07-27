// Auszeichnungen. Sie werden aus dem Lernstand berechnet — gesperrte
// Auszeichnungen bleiben sichtbar, damit klar ist, was als Naechstes kommt.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'
import { statistik } from '../progress/progressSelectors.js'
import { heute } from '../progress/scheduler.js'
import { kursFortschritt, WELTEN, weltFortschritt } from '../courses/courseRepository.js'

export const AUSZEICHNUNGEN = [
  {
    id: 'erste-schritte',
    name: 'Erste Schritte',
    beschreibung: 'Die erste Aufgabe gelöst.',
    icon: 'fussspur',
    farbe: 'green',
    pruefe: (s) => s.karten >= 1,
  },
  {
    id: 'serie-3',
    name: '3 Tage Serie',
    beschreibung: 'An drei Tagen hintereinander gelernt.',
    icon: 'flamme',
    farbe: 'orange',
    pruefe: (s) => s.serie >= 3,
  },
  {
    id: 'wortsammler',
    name: 'Wortsammler',
    beschreibung: '50 Wörter im Wiederholsystem.',
    icon: 'buch',
    farbe: 'blue',
    pruefe: (s) => s.gelernt >= 50,
  },
  {
    id: 'wochen-lerner',
    name: 'Wochen-Lerner',
    beschreibung: '7 Tage Serie erreicht.',
    icon: 'kalender',
    farbe: 'purple',
    pruefe: (s) => s.serie >= 7,
  },
  {
    id: 'buecherwurm',
    name: 'Bücherwurm',
    beschreibung: 'Eine ganze Welt abgeschlossen.',
    icon: 'welt',
    farbe: 'teal',
    pruefe: (s, k) => k.weltenFertig >= 1,
  },
  {
    id: 'meisterschueler',
    name: 'Meisterschüler',
    beschreibung: '100 Wörter sicher gelernt.',
    icon: 'krone',
    farbe: 'gold',
    pruefe: (s) => s.sicher >= 100,
  },
  {
    id: 'hoerprofi',
    name: 'Hörprofi',
    beschreibung: '250 Aufgaben insgesamt gelöst.',
    icon: 'kopfhoerer',
    farbe: 'purple',
    pruefe: (s) => s.karten >= 250,
  },
  {
    id: 'edelsteinjaeger',
    name: 'Edelsteinjäger',
    beschreibung: '100 Edelsteine gesammelt.',
    icon: 'edelstein',
    farbe: 'teal',
    pruefe: (s) => s.edelsteine >= 100,
  },
  {
    id: 'weltenbummler',
    name: 'Weltenbummler',
    beschreibung: 'Alle Einheiten abgeschlossen.',
    icon: 'kompass',
    farbe: 'gold',
    pruefe: (s, k) => k.prozent >= 100,
  },
]

let cache

function laden() {
  if (cache) return cache
  cache = { version: 1, erhalten: {}, ...(lies(KEYS.auszeichnungen) || {}) }
  cache.erhalten = cache.erhalten || {}
  return cache
}

/**
 * Liefert alle Auszeichnungen mit Status und merkt sich neu erreichte
 * (fuer den kleinen Hinweis „Neu!").
 */
export function holeAuszeichnungen() {
  const s = statistik()
  const k = kursFortschritt()
  const weltenFertig = WELTEN.filter((w) => !weltFortschritt(w.id).offen).length
  const daten = laden()
  let geaendert = false
  const erhalten = { ...daten.erhalten }

  const liste = AUSZEICHNUNGEN.map((a) => {
    const frei = !!a.pruefe(s, { ...k, weltenFertig })
    if (frei && !erhalten[a.id]) {
      erhalten[a.id] = heute()
      geaendert = true
    }
    return { ...a, frei, seit: erhalten[a.id] || null }
  })

  if (geaendert) {
    cache = { ...daten, erhalten }
    schreibe(KEYS.auszeichnungen, cache)
    // Kein melden() hier — sonst entsteht beim Rendern eine Schleife.
  }
  return liste
}

export function anzahlFrei() {
  return holeAuszeichnungen().filter((a) => a.frei).length
}

export function zuruecksetzen() {
  cache = { version: 1, erhalten: {} }
  schreibe(KEYS.auszeichnungen, cache)
  melden()
}

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.auszeichnungen) cache = null
})
