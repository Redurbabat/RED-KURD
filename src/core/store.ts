// Kleiner Melder: Stores rufen `melden()`, React-Seiten hoeren mit `useLernstand()`.
// So zeichnet die Oberflaeche neu, sobald sich XP, Karten, Sitzung oder Shop aendern.
import { useSyncExternalStore } from 'react'

/**
 * Ein Hoerer bekommt nichts uebergeben — er soll nur wissen, *dass* sich etwas
 * geaendert hat, und liest den Stand danach selbst mit den Selektoren. React
 * verlangt fuer `useSyncExternalStore` genau diese Form.
 */
export type Hoerer = () => void

/**
 * Was `abonniere()` und `beiFremdaenderung()` zurueckgeben: einmal aufrufen,
 * dann ist der Hoerer wieder ausgetragen. Der `boolean` faellt aus
 * `Set.delete` heraus und wird nirgends ausgewertet; er steht hier nur, weil
 * die Signatur die heutige bleiben soll.
 */
export type Abmeldung = () => boolean

/**
 * Rueckruf fuer Fremdaenderungen. Er bekommt den localStorage-Schluessel, den
 * ein anderer Tab geschrieben hat, damit jeder Store selbst entscheiden kann,
 * ob ihn das betrifft.
 */
export type Cacheleerer = (schluessel: string) => void

let stand = 0
const hoerer = new Set<Hoerer>()

export function abonniere(fn: Hoerer): Abmeldung {
  hoerer.add(fn)
  return () => hoerer.delete(fn)
}

export function melden(): void {
  stand += 1
  hoerer.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ein defekter Hoerer darf die anderen nicht blockieren */
    }
  })
}

function lesenStand(): number {
  return stand
}

// ===== Mehrere Tabs =====
// Jeder Store haelt seine Daten im Modul-Cache. Schreibt ein zweiter Tab in den
// localStorage, wuerde dieser Tab weiter mit veralteten Daten arbeiten und sie
// beim naechsten Speichern ueberschreiben. Deshalb melden sich die Stores hier
// an und leeren ihren Cache, sobald ein anderer Tab etwas geaendert hat.
const leerer = new Set<Cacheleerer>()

export function beiFremdaenderung(leeren: Cacheleerer): Abmeldung {
  leerer.add(leeren)
  return () => leerer.delete(leeren)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    // Der Zwischenwert ist noetig, weil die Pruefung auf `null` sonst nicht bis
    // in den forEach-Rueckruf hinein gilt: der Pruefer traut einem Feld nicht
    // zu, dass es ueber eine Funktionsgrenze hinweg gleich bleibt.
    const geaendert = e.key
    if (!geaendert || !geaendert.startsWith('red-kurd-')) return
    leerer.forEach((leeren) => {
      try {
        leeren(geaendert)
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
export function useLernstand(): number {
  return useSyncExternalStore(abonniere, lesenStand, lesenStand)
}
