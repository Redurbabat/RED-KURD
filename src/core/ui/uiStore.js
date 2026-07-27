// Oberflaechen-Einstellungen: Modus (modern/abenteuer), Design, Ton, Animationen.
// WICHTIG: Hier liegt nur die Darstellung. Der Lernstand ist davon voellig getrennt.
import { KEYS, lies, schreibe } from '../storage.js'
import { melden } from '../store.js'

const STANDARD = {
  version: 1,
  mode: 'modern', // 'modern' | 'abenteuer'
  theme: 'light', // 'light' | 'dark' | 'auto'
  soundEnabled: true,
  animationsEnabled: true,
  remindersEnabled: false,
  preferredVariant: 'kurmanci-standard',
}

let cache

export function holeUi() {
  if (cache) return cache
  cache = { ...STANDARD, ...(lies(KEYS.ui) || {}) }
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
  return setzeUi({ mode: mode === 'abenteuer' ? 'abenteuer' : 'modern' })
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
  if (farbe) farbe.setAttribute('content', theme === 'dark' ? '#0d1720' : '#0ea5a8')
}
