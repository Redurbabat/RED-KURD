// Audio: eigene/Muttersprachler-Aufnahmen (IndexedDB) mit TTS als Ersatz
import { sprich } from './schrift.js'

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

// Verzeichnis echter Muttersprachler-Aufnahmen (Lingua Libre, CC BY-SA)
let audioIndex = null
async function ladeAudioIndex() {
  if (audioIndex) return audioIndex
  try {
    audioIndex = await fetch('/audio/index.json').then(r => r.json())
  } catch { audioIndex = {} }
  return audioIndex
}

// Prioritaet: 1. eigene Aufnahme, 2. echte Muttersprachler-Datei, 3. Computerstimme
export async function spieleWort(wort) {
  const b = await holeAufnahme(wort)
  if (b) {
    new Audio(URL.createObjectURL(b)).play()
    return 'aufnahme'
  }
  const idx = await ladeAudioIndex()
  const datei = idx[wort.toLowerCase()]
  if (datei) {
    new Audio('/audio/kmr/' + datei).play()
    return 'muttersprachler'
  }
  sprich(wort)
  return 'tts'
}

export async function hatEchteStimme(wort) {
  const idx = await ladeAudioIndex()
  return !!idx[wort.toLowerCase()]
}
