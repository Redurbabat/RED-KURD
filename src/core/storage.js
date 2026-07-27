// Zentrale Speicherung im Browser (localStorage) + Migration der alten Schluessel.
// Alle Stores lesen und schreiben ausschliesslich ueber diese Datei.

export const KEYS = {
  profil: 'red-kurd-profile-v2',
  fortschritt: 'red-kurd-progress-v2',
  sitzung: 'red-kurd-session-v2',
  ui: 'red-kurd-ui-v1',
  shop: 'red-kurd-shop-v1',
  auszeichnungen: 'red-kurd-achievements-v1',
  aufgaben: 'red-kurd-tasks-v1',
}

// Alte Schluessel aus Version 1 — werden einmalig uebernommen, nie geloescht.
const ALT = {
  fortschritt: 'red-kurd-fortschritt-v1',
  profil: 'red-kurd-profil-v1',
  sitzung: 'red-kurd-session-v1',
  modus: 'red-kurd-modus',
}

function verfuegbar() {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function lies(key, ersatz = null) {
  if (!verfuegbar()) return ersatz
  try {
    const roh = localStorage.getItem(key)
    if (roh === null) return ersatz
    return JSON.parse(roh)
  } catch {
    return ersatz
  }
}

export function schreibe(key, wert) {
  if (!verfuegbar()) return false
  try {
    localStorage.setItem(key, JSON.stringify(wert))
    return true
  } catch {
    // Speicher voll oder privater Modus — die App laeuft weiter, nur ohne Sicherung.
    return false
  }
}

export function entferne(key) {
  if (!verfuegbar()) return
  try {
    localStorage.removeItem(key)
  } catch {
    /* egal */
  }
}

// ===== Migration =====
// Laeuft genau einmal beim Start. Alte Daten werden kopiert, nicht verschoben —
// so geht beim Wechsel zurueck auf eine aeltere Version nichts verloren.
let migriert = false

export function migriere() {
  if (migriert || !verfuegbar()) return
  migriert = true

  // 1. Lernfortschritt v1 -> v2
  if (lies(KEYS.fortschritt) === null) {
    const alt = lies(ALT.fortschritt)
    if (alt) {
      schreibe(KEYS.fortschritt, {
        version: 2,
        xp: alt.xp || 0,
        serie: alt.serie || 0,
        letzterTag: alt.letzterTag || null,
        einheiten: alt.lektionen || {},
        karten: alt.karten || {},
        tage: alt.tage || {},
        edelsteine: alt.edelsteine || 0,
        schluessel: 0,
        zielBelohnt: alt.zielBelohnt || null,
        truhe: alt.truhe || null,
        lernzeit: 0,
      })
    }
  }

  // 2. Profil v1 -> v2
  if (lies(KEYS.profil) === null) {
    const alt = lies(ALT.profil)
    if (alt) {
      schreibe(KEYS.profil, {
        version: 2,
        name: alt.name || '',
        kenntnis: alt.kenntnis || 'neu',
        ziel: alt.ziel || 'alltag',
        minuten: alt.minuten || '10',
        tagesziel: Number(alt.minuten) >= 20 ? 30 : Number(alt.minuten) === 5 ? 10 : 20,
        variante: 'kurmanci-standard',
        erstellt: alt.erstellt || new Date().toISOString(),
      })
    }
  }

  // 3. Laufende Sitzung v1 -> v2
  if (lies(KEYS.sitzung) === null) {
    const alt = lies(ALT.sitzung)
    if (alt && alt.uebungen) schreibe(KEYS.sitzung, alt)
  }

  // 4. Alter App-Modus ("modern" / "klassik") -> UI-Einstellungen
  if (lies(KEYS.ui) === null) {
    let alterModus = null
    try {
      alterModus = localStorage.getItem(ALT.modus)
    } catch {
      /* egal */
    }
    schreibe(KEYS.ui, {
      version: 1,
      mode: 'modern',
      theme: alterModus === 'klassik' ? 'dark' : 'light',
      soundEnabled: true,
      animationsEnabled: true,
      remindersEnabled: false,
      preferredVariant: 'kurmanci-standard',
    })
  }
}
