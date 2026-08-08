// Audio: eigene/Muttersprachler-Aufnahmen (IndexedDB) mit TTS als Ersatz
import { sprich } from '../schrift/transliteration.ts'
import { tonAn } from '../ui/uiStore.ts'

// Zwei Objektspeicher, und das ist Absicht:
//
//   `aufnahmen` — der rohe Blob, Schluessel ist das Kurmanci-Wort. Genau die
//                 Form, die es seit jeher hat.
//   `angaben`   — Wort, Zeitpunkt und Groesse, derselbe Schluessel.
//
// Die Angaben koennten auch neben dem Blob in EINEM Objekt liegen. Sie tun es
// bewusst nicht: eine aeltere App-Version liest `aufnahmen` und erwartet dort
// einen Blob. Bekaeme sie ein Objekt, wuerde `URL.createObjectURL()` werfen und
// jede Aufnahme waere fuer sie verloren. So bleibt der Rueckschritt heil
// (CLAUDE.md Grundsatz 3) — sie sieht die Angaben einfach nicht.
const DB_NAME = 'red-kurd-audio'
const DB_VERSION = 2

function oeffne() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION)
    r.onupgradeneeded = () => {
      const db = r.result
      // Laeuft sowohl beim ersten Anlegen als auch beim Heben von Version 1.
      // Vorhandene Aufnahmen werden dabei NICHT angefasst.
      if (!db.objectStoreNames.contains('aufnahmen')) db.createObjectStore('aufnahmen')
      if (!db.objectStoreNames.contains('angaben')) db.createObjectStore('angaben')
    }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

/** Eine Anfrage auf einen Objektspeicher als Versprechen. */
function ausLesen(db, speicher, arbeit) {
  return new Promise((res) => {
    try {
      const anfrage = arbeit(db.transaction(speicher).objectStore(speicher))
      anfrage.onsuccess = () => res(anfrage.result)
      anfrage.onerror = () => res(null)
    } catch {
      // Ein Objektspeicher, den es nicht gibt (alte Datenbank, die gerade
      // nicht gehoben werden konnte) darf nichts umwerfen.
      res(null)
    }
  })
}

export async function speichereAufnahme(wort, blob) {
  const db = await oeffne()
  return new Promise((res, rej) => {
    const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
    t.objectStore('aufnahmen').put(blob, wort)
    // Blob.size ist die Groesse in Bytes; `type` hilft spaeter beim Ausgeben.
    t.objectStore('angaben').put(
      { wort, zeit: new Date().toISOString(), groesse: blob?.size || 0, typ: blob?.type || '' },
      wort
    )
    t.oncomplete = () => res(true)
    t.onerror = () => rej(t.error)
  })
}

export async function holeAufnahme(wort) {
  try {
    const db = await oeffne()
    const wert = await ausLesen(db, 'aufnahmen', (s) => s.get(wort))
    return wert || null
  } catch {
    return null
  }
}

/**
 * Eine Aufnahme loeschen — Blob und Angaben zusammen.
 *
 * Wartet jetzt wirklich, bis geloescht ist. Vorher wurde die Transaktion nur
 * angestossen und die Funktion kehrte sofort zurueck; wer danach die Liste neu
 * las, sah die Aufnahme unter Umstaenden noch.
 *
 * @returns {Promise<boolean>} ob es geklappt hat
 */
export async function loescheAufnahme(wort) {
  try {
    const db = await oeffne()
    return await new Promise((res) => {
      const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
      t.objectStore('aufnahmen').delete(wort)
      t.objectStore('angaben').delete(wort)
      t.oncomplete = () => res(true)
      t.onerror = () => res(false)
      t.onabort = () => res(false)
    })
  } catch {
    return false
  }
}

/** Alle Aufnahmen loeschen. Der Weg fuer „Aufnahmen entfernen" in den Daten. */
export async function loescheAlleAufnahmen() {
  try {
    const db = await oeffne()
    return await new Promise((res) => {
      const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
      t.objectStore('aufnahmen').clear()
      t.objectStore('angaben').clear()
      t.oncomplete = () => res(true)
      t.onerror = () => res(false)
      t.onabort = () => res(false)
    })
  } catch {
    return false
  }
}

/**
 * Alle Aufnahmen mit Wort, Zeitpunkt und Groesse — neueste zuerst.
 *
 * Die Wahrheit ist der Blob-Speicher, nicht die Angaben: Aufnahmen aus der
 * Zeit vor den Angaben (Datenbank-Version 1) haben keinen Eintrag dort. Sie
 * tauchen trotzdem auf, nur ohne Zeitpunkt — sonst waeren sie unsichtbar und
 * damit unloeschbar.
 */
export async function alleAufnahmen() {
  try {
    const db = await oeffne()
    const woerter = await ausLesen(db, 'aufnahmen', (s) => s.getAllKeys())
    if (!Array.isArray(woerter)) return []
    const blobs = await ausLesen(db, 'aufnahmen', (s) => s.getAll())
    const angaben = await ausLesen(db, 'angaben', (s) => s.getAll())
    const nachWort = new Map(
      (Array.isArray(angaben) ? angaben : []).map((a) => [a?.wort, a]).filter(([w]) => w)
    )

    const liste = woerter.map((wort, i) => {
      const a = nachWort.get(wort)
      const blob = Array.isArray(blobs) ? blobs[i] : null
      return {
        wort,
        // Die gespeicherte Groesse kann fehlen; der Blob selbst weiss sie immer.
        groesse: blob?.size ?? a?.groesse ?? 0,
        zeit: typeof a?.zeit === 'string' ? a.zeit : null,
      }
    })

    // Neueste zuerst; Aufnahmen ohne Zeitpunkt (aus Version 1) ans Ende,
    // dort alphabetisch, damit die Reihenfolge nicht von Zufall abhaengt.
    return liste.sort((a, b) => {
      if (a.zeit && b.zeit) return b.zeit.localeCompare(a.zeit)
      if (a.zeit) return -1
      if (b.zeit) return 1
      return a.wort.localeCompare(b.wort, 'ku')
    })
  } catch {
    return []
  }
}

/** Anzahl und Gesamtgroesse aller Aufnahmen. */
export async function aufnahmenBilanz() {
  const liste = await alleAufnahmen()
  return {
    anzahl: liste.length,
    bytes: liste.reduce((summe, a) => summe + (a.groesse || 0), 0),
  }
}

/**
 * Bytes als lesbaren Text. Rein, ohne Speicherzugriff — deshalb testbar ohne
 * IndexedDB, die es in Node gar nicht gibt.
 */
export function groesseText(bytes) {
  const zahl = Number(bytes)
  if (!Number.isFinite(zahl) || zahl <= 0) return '0 KB'
  if (zahl < 1024) return '1 KB'
  if (zahl < 1024 * 1024) return `${Math.round(zahl / 1024)} KB`
  return `${(zahl / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/**
 * Einen Blob abspielen und die Object-URL danach wieder freigeben —
 * sonst haelt jede abgespielte Aufnahme Speicher fest, bis die Seite neu laedt.
 */
export function spieleBlob(blob) {
  const adresse = URL.createObjectURL(blob)
  const ton = new Audio(adresse)
  const aufraeumen = () => URL.revokeObjectURL(adresse)
  ton.addEventListener('ended', aufraeumen, { once: true })
  ton.addEventListener('error', aufraeumen, { once: true })
  ton.play().catch(aufraeumen)
  return ton
}

// Verzeichnis echter Muttersprachler-Aufnahmen (Lingua Libre, CC BY-SA)
let audioIndex = null
async function ladeAudioIndex() {
  if (audioIndex) return audioIndex
  try {
    const r = await fetch('/audio/index.json')
    // Fehlversuch nicht dauerhaft merken — nach kurzem Netzaussetzer soll der
    // naechste Aufruf wieder echte Stimmen finden.
    if (!r.ok) return {}
    audioIndex = await r.json()
  } catch {
    return {}
  }
  return audioIndex
}

// Prioritaet: 1. eigene Aufnahme, 2. echte Muttersprachler-Datei, 3. Computerstimme
export async function spieleWort(wort) {
  if (!tonAn()) return 'aus'
  const b = await holeAufnahme(wort)
  if (b) {
    spieleBlob(b)
    return 'aufnahme'
  }
  const idx = await ladeAudioIndex()
  const datei = idx[wort.toLowerCase()]
  if (datei) {
    try {
      await new Audio('/audio/kmr/' + datei).play()
      return 'muttersprachler'
    } catch {
      // iOS kann Wiedergabe ohne Nutzergeste blockieren oder die Datei fehlt —
      // dann wenigstens die Computerstimme statt kommentarloser Stille.
    }
  }
  sprich(wort)
  return 'tts'
}

export async function hatEchteStimme(wort) {
  const idx = await ladeAudioIndex()
  return !!idx[wort.toLowerCase()]
}

/** Text mit einer zum Kurs passenden, lokal verfügbaren Systemstimme sprechen. */
export function spieleText(text, locale = 'de-DE') {
  if (!tonAn() || typeof speechSynthesis === 'undefined' || !text) return 'aus'
  speechSynthesis.cancel()
  const ausgabe = new SpeechSynthesisUtterance(String(text))
  ausgabe.lang = locale
  ausgabe.rate = 0.86
  ausgabe.pitch = 1
  const kurz = locale.toLowerCase().split('-')[0]
  const stimmen = speechSynthesis.getVoices()
  const stimme =
    stimmen.find((eintrag) => eintrag.lang?.toLowerCase() === locale.toLowerCase()) ||
    stimmen.find((eintrag) => eintrag.lang?.toLowerCase().startsWith(kurz))
  if (stimme) ausgabe.voice = stimme
  speechSynthesis.speak(ausgabe)
  return stimme ? 'systemstimme' : 'standardstimme'
}

/** Ein kurzer lokaler Tastenton plus Gerätevibration für spürbares Feedback. */
export function klickGefuehl(art = 'normal') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(art === 'richtig' ? [12, 28, 18] : art === 'falsch' ? [30, 25, 30] : 8)
  }
  if (!tonAn()) return
  const AudioKontext = window.AudioContext || window.webkitAudioContext
  if (!AudioKontext) return
  try {
    const kontext = new AudioKontext()
    const oscillator = kontext.createOscillator()
    const lautstaerke = kontext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = art === 'richtig' ? 720 : art === 'falsch' ? 180 : 330
    lautstaerke.gain.setValueAtTime(0.0001, kontext.currentTime)
    lautstaerke.gain.exponentialRampToValueAtTime(0.035, kontext.currentTime + 0.006)
    lautstaerke.gain.exponentialRampToValueAtTime(0.0001, kontext.currentTime + 0.07)
    oscillator.connect(lautstaerke)
    lautstaerke.connect(kontext.destination)
    oscillator.start()
    oscillator.stop(kontext.currentTime + 0.075)
    oscillator.addEventListener('ended', () => kontext.close(), { once: true })
  } catch {
    /* Manche Browser sperren AudioContext trotz Nutzeraktion – dann bleibt die Vibration. */
  }
}
