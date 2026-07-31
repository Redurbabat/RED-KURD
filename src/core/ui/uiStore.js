// Oberflaechen-Einstellungen: Modus (modern/abenteuer/redlingo), Design, Ton, Animationen.
// WICHTIG: Hier liegt nur die Darstellung. Der Lernstand ist davon voellig getrennt.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden, beiFremdaenderung } from '../store.js'

const STANDARD = {
  version: 2,
  mode: 'modern', // 'modern' | 'abenteuer' | 'redlingo'
  theme: 'dark', // 'light' | 'dark' | 'auto'
  soundEnabled: true,
  animationsEnabled: true,
  remindersEnabled: false,
  preferredVariant: 'kurmanci-standard',
}

let cache

export function holeUi() {
  if (cache) return cache
  const gespeichert = lies(KEYS.ui)
  cache = { ...STANDARD, ...(gespeichert || {}) }
  // Die neue, von der mobilen Referenz inspirierte Oberfläche startet im
  // Nachtmodus. Nach dieser einmaligen Migration bleibt jede spätere Auswahl
  // der Nutzerin oder des Nutzers unangetastet.
  if (gespeichert && (gespeichert.version || 1) < 2) {
    cache = { ...cache, version: 2, theme: 'dark' }
    schreibe(KEYS.ui, cache)
  }
  return cache
}

export function setzeUi(teil) {
  cache = { ...holeUi(), ...teil }
  schreibe(KEYS.ui, cache)
  anwenden()
  melden()
  return cache
}

export function appModus() {
  return holeUi().mode
}

export function setzeAppModus(mode) {
  const erlaubt = ['modern', 'abenteuer', 'redlingo']
  return setzeUi({ mode: erlaubt.includes(mode) ? mode : 'modern' })
}

export function tonAn() {
  return holeUi().soundEnabled !== false
}

/** Schreibt Design und Animationseinstellung an das <html>-Element. */
export function anwenden() {
  if (typeof document === 'undefined') return
  const ui = holeUi()
  const wurzel = document.documentElement
  let theme = ui.theme
  if (theme === 'auto') {
    theme =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  }
  wurzel.setAttribute('data-theme', theme)
  wurzel.setAttribute('data-mode', ui.mode)
  wurzel.setAttribute('data-animations', ui.animationsEnabled === false ? 'off' : 'on')
  const farbe = document.querySelector('meta[name="theme-color"]')
  if (farbe) {
    farbe.setAttribute(
      'content',
      ui.mode === 'redlingo' ? '#090c10' : theme === 'dark' ? '#102229' : '#0ea5a8'
    )
  }
}

// Aendert ein anderer Tab diese Daten, wird der Cache verworfen und beim
// naechsten Zugriff frisch gelesen.
beiFremdaenderung((key) => {
  if (key === KEYS.ui) cache = null
})
