// Oberflaechen-Einstellungen: Modus (modern/abenteuer/redlingo), Design, Ton, Animationen.
// WICHTIG: Hier liegt nur die Darstellung. Der Lernstand ist davon voellig getrennt.
import { KEYS, lies, schreibe } from '../storage.ts'
import { melden, beiFremdaenderung } from '../store.ts'

import type { UiEinstellungen } from '../../types/lernstand'

/** Die drei Ansichten der Sprach-App — Darstellung, kein eigener Lernstand. */
export type Ansichtsmodus = UiEinstellungen['mode']

const STANDARD: UiEinstellungen = {
  version: 2,
  mode: 'modern', // 'modern' | 'abenteuer' | 'redlingo'
  theme: 'dark', // 'light' | 'dark' | 'auto'
  soundEnabled: true,
  animationsEnabled: true,
  remindersEnabled: false,
  preferredVariant: 'kurmanci-standard',
}

/**
 * `undefined` heisst „noch nicht gelesen", `null` verwirft der Rueckruf ganz
 * unten nach einer Fremdaenderung. Beides ist falsy, `holeUi()` liest also in
 * beiden Faellen neu — der Unterschied steht nur im Typ.
 */
let cache: UiEinstellungen | null | undefined

/**
 * Was auf der Platte liegt, ist ungeprueft und kann aus einer aelteren Version
 * stammen; `Partial<UiEinstellungen>` sagt das. Der `STANDARD`-Spread macht
 * daraus wieder vollstaendige Einstellungen.
 */
export function holeUi(): UiEinstellungen {
  if (cache) return cache
  const gespeichert = lies<Partial<UiEinstellungen>>(KEYS.ui)
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

export function setzeUi(teil: Partial<UiEinstellungen>): UiEinstellungen {
  cache = { ...holeUi(), ...teil }
  schreibe(KEYS.ui, cache)
  anwenden()
  melden()
  return cache
}

export function appModus(): Ansichtsmodus {
  return holeUi().mode
}

/**
 * `mode` ist absichtlich `string`: der Aufrufer reicht hier auch Fremdes
 * durch — den alten Wert aus dem Speicher (`appModeStorage.js`) oder eine
 * Nutzereingabe. Genau dafuer gibt es die Liste.
 */
export function setzeAppModus(mode: string): UiEinstellungen {
  const erlaubt: readonly Ansichtsmodus[] = ['modern', 'abenteuer', 'redlingo']
  // `erlaubt.includes(mode)` verlangt `mode` bereits als `Ansichtsmodus` — also
  // genau das, was die Pruefung erst feststellen soll. `find` prueft dasselbe
  // (Gleichheit gegen dieselben drei Werte) und gibt den Treffer eng typisiert
  // zurueck. Kein Listeneintrag ist falsy, `|| 'modern'` greift daher nur bei
  // einem echten Fehltreffer.
  const gewaehlt = erlaubt.find((m) => m === mode)
  return setzeUi({ mode: gewaehlt || 'modern' })
}

export function tonAn(): boolean {
  return holeUi().soundEnabled !== false
}

/** Schreibt Design und Animationseinstellung an das <html>-Element. */
export function anwenden(): void {
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
  // Ohne das Meta-Tag (Tests, eingebettete Ansichten) gibt es hier nichts zu
  // faerben — die Pruefung stand deshalb schon vor der Typisierung hier.
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
