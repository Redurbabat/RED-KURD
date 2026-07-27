// Kleiner Melder: Stores rufen `melden()`, React-Seiten hoeren mit `useLernstand()`.
// So zeichnet die Oberflaeche neu, sobald sich XP, Karten, Sitzung oder Shop aendern.
import { useSyncExternalStore } from 'react'

let stand = 0
const hoerer = new Set()

export function abonniere(fn) {
  hoerer.add(fn)
  return () => hoerer.delete(fn)
}

export function melden() {
  stand += 1
  hoerer.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ein defekter Hoerer darf die anderen nicht blockieren */
    }
  })
}

function lesenStand() {
  return stand
}

/**
 * Liefert eine Zahl, die sich bei jeder Aenderung am Lernstand erhoeht.
 * Eine Seite ruft `useLernstand()` auf und liest die Daten danach ganz normal
 * mit den Selektoren — dadurch bleibt der Snapshot stabil (kein Render-Loop).
 */
export function useLernstand() {
  return useSyncExternalStore(abonniere, lesenStand, lesenStand)
}
