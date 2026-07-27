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

// Spielt echte Aufnahme, falls vorhanden — sonst Computerstimme
export async function spieleWort(wort) {
  const b = await holeAufnahme(wort)
  if (b) {
    new Audio(URL.createObjectURL(b)).play()
    return 'aufnahme'
  }
  sprich(wort)
  return 'tts'
}
