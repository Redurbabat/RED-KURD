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
  herzen: 'red-kurd-hearts-v1',
  sprachkurse: 'red-kurd-language-courses-v1',
  // Bewusste Entscheidung „ohne Konto lernen“ — ueberlebt das Neuladen,
  // bleibt aber geraete-lokal (siehe NUR_LOKAL) und wandert nie in Sicherungen.
  ohneKonto: 'red-kurd-ohne-konto-v1',
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

/**
 * Kurzlebige Werte, die nur fuer diesen Tab gelten und den Lernstand nicht
 * beruehren — z. B. die auf der Startseite gewaehlte Sitzungsdauer. Sie
 * gehoeren bewusst NICHT in KEYS: sie ueberleben den Tab nicht und wandern
 * nie in eine Sicherung.
 */
export const TAB_KEYS = {
  dauer: 'red-kurd-tab-dauer',
}

export function liesTab(key, ersatz = null) {
  try {
    const roh = sessionStorage.getItem(key)
    return roh === null ? ersatz : roh
  } catch {
    return ersatz
  }
}

export function schreibeTab(key, wert) {
  try {
    sessionStorage.setItem(key, String(wert))
    return true
  } catch {
    // Privater Modus — die App laeuft weiter, nur ohne Merken.
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

/**
 * Vollständige, lokale Sicherung aller bekannten App-Speicher.
 * Es werden nur RED-KURD-Schlüssel gelesen; fremde Browserdaten bleiben unberührt.
 */
// Geraete-lokale Entscheidungen (z. B. „ohne Konto lernen") sind kein
// Lernstand und wandern nicht in Sicherungen — sonst wuerde ein Import die
// Anmelde-Entscheidung eines anderen Geraets uebernehmen.
const NUR_LOKAL = new Set(['ohneKonto'])

export function exportiereSpeicherstand() {
  return Object.fromEntries(
    Object.entries(KEYS)
      .filter(([name]) => !NUR_LOKAL.has(name))
      .map(([name, key]) => [name, lies(key)])
      .filter(([, wert]) => wert !== null)
  )
}

/**
 * Lokale Sicherung einspielen. Unbekannte Schlüssel werden bewusst ignoriert.
 * @returns {number} Anzahl geschriebener Bereiche
 */
export function importiereSpeicherstand(speicher) {
  if (!speicher || typeof speicher !== 'object' || Array.isArray(speicher)) return 0
  let anzahl = 0
  for (const [name, key] of Object.entries(KEYS)) {
    if (!(name in speicher) || NUR_LOKAL.has(name)) continue
    if (schreibe(key, speicher[name])) anzahl += 1
  }
  return anzahl
}

/**
 * Umbenannte Lernpaare: alte Kartenschluessel muessen mitwandern, sonst
 * uebt ein bestehender Lernstand fuer immer eine Schreibweise, die der Kurs
 * nicht mehr kennt — und beide Formen koennen zugleich als Antwort erscheinen.
 * Schluessel ist `de|ku` ohne den Skill-Teil.
 */
const UMBENANNT = {
  'Pilz|kundir': 'Pilz|kivark',
  'Möchtest du Tee?|Tu çay dixwazî?': 'Möchtest du Tee?|Tu çayê dixwazî?',
}

/** Stufe einer Karte robust lesen — auch bei fehlenden oder kaputten Werten. */
function stufeVon(karte) {
  if (!karte || typeof karte !== 'object') return 0
  const stufe = Number(karte.stufe)
  return Number.isFinite(stufe) ? stufe : 0
}

/** Karten auf die aktuellen Schreibweisen umschreiben, Stufe und Faelligkeit behalten. */
export function migriereKarten(karten) {
  if (!karten || typeof karten !== 'object') return { karten, geaendert: 0 }
  const neu = {}
  let geaendert = 0
  for (const [schluessel, wert] of Object.entries(karten)) {
    const teile = schluessel.split('|')
    const paar = teile.slice(0, 2).join('|')
    const ziel = UMBENANNT[paar]
    const neuerSchluessel = ziel ? [ziel, ...teile.slice(2)].join('|') : schluessel
    if (ziel) geaendert += 1
    // Treffen beide Schreibweisen aufeinander, gewinnt der weiter fortgeschrittene
    // Stand — unabhaengig davon, welche Schreibweise zuerst gespeichert wurde.
    const vorhanden = neu[neuerSchluessel]
    neu[neuerSchluessel] =
      vorhanden !== undefined && stufeVon(vorhanden) >= stufeVon(wert) ? vorhanden : wert
  }
  return { karten: neu, geaendert }
}

// ===== Migration =====
// Laeuft genau einmal beim Start. Alte Daten werden kopiert, nicht verschoben —
// so geht beim Wechsel zurueck auf eine aeltere Version nichts verloren.
let migriert = false

export function migriere() {
  if (migriert || !verfuegbar()) return
  migriert = true

  // 0. Umbenannte Lernpaare: Karten auf die aktuelle Schreibweise heben.
  const stand = lies(KEYS.fortschritt)
  if (stand && stand.karten) {
    const { karten, geaendert } = migriereKarten(stand.karten)
    if (geaendert) schreibe(KEYS.fortschritt, { ...stand, karten })
  }

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
