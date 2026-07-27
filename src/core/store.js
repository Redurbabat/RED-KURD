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

// ===== Mehrere Tabs =====
// Jeder Store haelt seine Daten im Modul-Cache. Schreibt ein zweiter Tab in den
// localStorage, wuerde dieser Tab weiter mit veralteten Daten arbeiten und sie
// beim naechsten Speichern ueberschreiben. Deshalb melden sich die Stores hier
// an und leeren ihren Cache, sobald ein anderer Tab etwas geaendert hat.
const leerer = new Set()

export function beiFremdaenderung(leeren) {
  leerer.add(leeren)
  return () => leerer.delete(leeren)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith('red-kurd-')) return
    leerer.forEach((leeren) => {
      try {
        leeren(e.key)
      } catch {
        /* ein defekter Hoerer darf die anderen nicht blockieren */
      }
    })
    melden()
  })
}

/**
 * Liefert eine Zahl, die sich bei jeder Aenderung am Lernstand erhoeht.
 * Eine Seite ruft `useLernstand()` auf und liest die Daten danach ganz normal
 * mit den Selektoren — dadurch bleibt der Snapshot stabil (kein Render-Loop).
 */
export function useLernstand() {
  return useSyncExternalStore(abonniere, lesenStand, lesenStand)
}
