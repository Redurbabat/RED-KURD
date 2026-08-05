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
  // Aktiver App-Bereich (Sprache lernen / Code lernen / AI-Sprache).
  // appBereich ist der alte Schluessel — er wird weiter beschrieben, damit
  // ein Ruecksprung auf eine aeltere App-Version nichts verliert.
  appBereich: 'red-kurd-active-app-mode-v1',
  appAktiv: 'red-kurd-active-app-v1',
  // Lernstand der neuen Bereiche — getrennt vom Sprach-Lernstand.
  codeFortschritt: 'red-kurd-code-progress-v1',
  promptingFortschritt: 'red-kurd-prompting-progress-v1',
  electroFortschritt: 'red-kurd-electro-progress-v1',
  // Schule und Betrieb der Elektro-Lehre: Faecher, Noten, Pruefungen,
  // Berichtsheft. Bleibt lokal, wandert aber in Sicherungen mit.
  electroSchule: 'red-kurd-electro-school-v1',
  // Werkstatt der AI-Sprache: begonnene Auftraege, Bug-Reports, PR-Haken.
  promptingWerkstatt: 'red-kurd-prompting-workshop-v1',
  fehlerbuch: 'red-kurd-fehlerbuch-v1',
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
  let roh = null
  try {
    roh = localStorage.getItem(key)
    if (roh === null) return ersatz
    return JSON.parse(roh)
  } catch {
    sichereDefekt(key, roh)
    return ersatz
  }
}

/**
 * Kaputte Rohdaten nicht dem naechsten schreibe() opfern: Der erste
 * Lesefehler legt den Rohtext unter `<key>-defekt` ab. So bleibt ein evtl.
 * noch rettbarer Lernstand fuer eine Handrettung erhalten, statt still von
 * einem frischen Leerzustand ueberschrieben zu werden.
 */
function sichereDefekt(key, roh) {
  if (typeof roh !== 'string' || !roh) return
  try {
    const backupKey = `${key}-defekt`
    // Ein bestehendes Backup gewinnt — es ist naeher am letzten guten Stand.
    if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, roh)
  } catch {
    /* voller Speicher — mehr ist hier nicht zu retten */
  }
}

// ===== Sichtbares Speicherversagen =====
// Scheitert das Schreiben (Speicher voll, privater Modus), zeigt die UI
// sonst Fortschritt, der beim naechsten Neuladen weg ist. Deshalb wird der
// erste Fehlschlag genau einmal gemeldet, damit die App warnen kann.
let problemGemeldet = false
let problemHoerer = null

/** Einen Melder fuer Speicherprobleme anmelden; liefert die Abmeldung. */
export function beiSpeicherproblem(fn) {
  problemHoerer = fn
  // War das Problem schon vor der Anmeldung da, sofort nachreichen.
  if (problemGemeldet && fn) fn()
  return () => {
    if (problemHoerer === fn) problemHoerer = null
  }
}

function meldeProblem() {
  if (problemGemeldet) return
  problemGemeldet = true
  try {
    problemHoerer?.()
  } catch {
    /* ein defekter Hoerer aendert nichts am Speicherproblem */
  }
}

export function schreibe(key, wert) {
  if (!verfuegbar()) {
    meldeProblem()
    return false
  }
  try {
    localStorage.setItem(key, JSON.stringify(wert))
    return true
  } catch {
    // Speicher voll oder privater Modus — die App laeuft weiter, nur ohne Sicherung.
    meldeProblem()
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
// Geraete-lokale Zustaende wandern nicht in Sicherungen:
// - „ohne Konto lernen" ist eine Anmelde-Entscheidung dieses Geraets — ein
//   Import darf sie nicht von einem anderen Geraet uebernehmen.
// - Die laufende Sitzung ist fluechtig — ein Import wuerde sonst auf dem
//   neuen Geraet eine halb fertige, veraltete Sitzung wiederbeleben.
const NUR_LOKAL = new Set(['ohneKonto', 'sitzung'])

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

/** Karten auf die aktuellen Schreibweisen umschreiben, Stufe und Faelligkeit behalten. */
export function migriereKarten(karten) {
  if (!karten || typeof karten !== 'object') return { karten, geaendert: 0 }
  const neu = {}
  let geaendert = 0
  for (const [schluessel, wert] of Object.entries(karten)) {
    const teile = schluessel.split('|')
    const paar = teile.slice(0, 2).join('|')
    const ziel = UMBENANNT[paar]
    if (!ziel) {
      neu[schluessel] = wert
      continue
    }
    const neuerSchluessel = [ziel, ...teile.slice(2)].join('|')
    // Gibt es die neue Karte schon, gewinnt der weiter fortgeschrittene Stand.
    const vorhanden = neu[neuerSchluessel]
    neu[neuerSchluessel] =
      vorhanden && (vorhanden.stufe || 0) >= (wert.stufe || 0) ? vorhanden : wert
    geaendert += 1
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
