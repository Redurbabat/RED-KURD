// Audio: eigene/Muttersprachler-Aufnahmen (IndexedDB) mit TTS als Ersatz
import { sprich } from '../schrift/transliteration.js'
import { tonAn } from '../ui/uiStore.js'

function oeffne() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('red-kurd-audio', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('aufnahmen')
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

export async function speichereAufnahme(wort, blob) {
  const db = await oeffne()
  return new Promise((res, rej) => {
    const t = db.transaction('aufnahmen', 'readwrite')
    t.objectStore('aufnahmen').put(blob, wort)
    t.oncomplete = () => res(true)
    t.onerror = () => rej(t.error)
  })
}

export async function holeAufnahme(wort) {
  try {
    const db = await oeffne()
    return await new Promise((res) => {
      const r = db.transaction('aufnahmen').objectStore('aufnahmen').get(wort)
      r.onsuccess = () => res(r.result || null)
      r.onerror = () => res(null)
    })
  } catch { return null }
}

export async function loescheAufnahme(wort) {
  const db = await oeffne()
  db.transaction('aufnahmen', 'readwrite').objectStore('aufnahmen').delete(wort)
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
