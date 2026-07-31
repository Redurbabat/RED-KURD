// Lokaler Fortschritt der zusätzlichen Sprachkurse. Es gibt kein Konto und
// keine Übertragung: jedes Gerät behält seinen eigenen Stand.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'

const STANDARD = { version: 1, kapitel: {}, letzterKurs: null }
let cache

function laden() {
  if (cache) return cache
  cache = { ...STANDARD, ...(lies(KEYS.sprachkurse) || {}) }
  cache.kapitel = { ...(cache.kapitel || {}) }
  return cache
}

function sichern(neu) {
  cache = neu
  schreibe(KEYS.sprachkurse, neu)
  melden()
  return neu
}

function schluessel(kursId, kapitelId) {
  return `${kursId}/${kapitelId}`
}

export function kapitelStand(kursId, kapitelId) {
  return laden().kapitel[schluessel(kursId, kapitelId)] || null
}

export function kapitelAbschliessen(kursId, kapitelId, prozent) {
  const alt = laden()
  const key = schluessel(kursId, kapitelId)
  const vorher = alt.kapitel[key] || {}
  const wert = Math.max(0, Math.min(100, Math.round(prozent || 0)))
  return sichern({
    ...alt,
    letzterKurs: kursId,
    kapitel: {
      ...alt.kapitel,
      [key]: {
        prozent: Math.max(vorher.prozent || 0, wert),
        versuche: (vorher.versuche || 0) + 1,
        abgeschlossen: wert >= 75 || vorher.abgeschlossen === true,
        zuletzt: new Date().toISOString(),
      },
    },
  })
}

export function kursStand(kurs) {
  const staende = kurs.kapitel.map((kapitel) => kapitelStand(kurs.id, kapitel.id))
  const fertig = staende.filter((stand) => stand?.abgeschlossen).length
  const punkte = staende.reduce((summe, stand) => summe + (stand?.prozent || 0), 0)
  return {
    fertig,
    gesamt: kurs.kapitel.length,
    prozent: kurs.kapitel.length ? Math.round(punkte / kurs.kapitel.length) : 0,
  }
}

export function letzterSprachkurs() {
  return laden().letzterKurs
}

beiFremdaenderung((key) => {
  if (key === KEYS.sprachkurse) cache = null
})
