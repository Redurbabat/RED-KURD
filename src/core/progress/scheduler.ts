// Wiederholsystem (SM-2-Idee, stark vereinfacht und gut nachvollziehbar).
// Jede Karte hat eine Stufe; je hoeher die Stufe, desto spaeter kommt sie wieder.

import type {
  Fertigkeit,
  Karte,
  Kartenfertigkeit,
  Kartenschluessel,
  Kartenteile,
  Tagesschluessel,
} from '../../types/lernstand'

export const ABSTAENDE: readonly number[] = [1, 3, 7, 16, 35, 70]

/** Fertigkeiten, die eine Karte trainieren kann. */
export const SKILLS: readonly Fertigkeit[] = ['erkennen', 'abrufen', 'schreiben', 'hoeren']

/**
 * Kalendertag in der Zeitzone des Geräts.
 * toISOString() würde den UTC-Tag liefern — westlich von UTC wechselt der Tag
 * dadurch mitten am Nachmittag und die Tagesserie reisst grundlos ab.
 */
export function tagVon(datum: Date | number | string): Tagesschluessel {
  const d = datum instanceof Date ? datum : new Date(datum)
  const jahr = d.getFullYear()
  const monat = String(d.getMonth() + 1).padStart(2, '0')
  const tag = String(d.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

export function heute(): Tagesschluessel {
  return tagVon(new Date())
}

export function tagPlus(n: number): Tagesschluessel {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return tagVon(d)
}

export function gestern(): Tagesschluessel {
  return tagPlus(-1)
}

/** Schluessel einer Karte: deutsch|kurmancî|fertigkeit */
export function kartenSchluessel(
  de: string,
  ku: string,
  skill?: Kartenfertigkeit | '' | null
): Kartenschluessel {
  return skill ? `${de}|${ku}|${skill}` : `${de}|${ku}`
}

export function schluesselTeile(key: Kartenschluessel): Kartenteile {
  const t = key.split('|')
  // split() liefert immer mindestens einen Teil — der deutsche steht also
  // fest, der Rueckfall auf '' beruhigt nur noUncheckedIndexedAccess. Beim
  // kurmancî-Teil ist die Unsicherheit dagegen echt: ein Schluessel ohne '|'
  // hat ihn nicht, und das bleibt wie bisher sichtbar.
  return { de: t[0] ?? '', ku: t[1], skill: t[2] || 'gemischt' }
}

/**
 * Neue Kartendaten nach einer Antwort.
 * Richtig -> eine Stufe hoch und spaeter faellig. Falsch -> zurueck auf Stufe 0.
 */
export function naechsteKarte(karte: Partial<Karte> | null | undefined, richtig: boolean): Karte {
  const k = karte || { stufe: 0, faellig: heute(), gesehen: 0, richtig: 0 }
  const gesehen = (k.gesehen || 0) + 1
  const richtigZahl = (k.richtig || 0) + (richtig ? 1 : 0)
  if (richtig) {
    const stufe = Math.min((k.stufe || 0) + 1, ABSTAENDE.length)
    // Math.min deckelt den Index nach oben auf die Tabelle; unter
    // noUncheckedIndexedAccess bleibt der Zugriff trotzdem `number |
    // undefined`. Danebengreifen kann er nur bei einer negativen Stufe, die
    // ausser aus kaputten Altdaten nirgends herkommt — dann entsteht wie
    // bisher eine ungueltige Faelligkeit, statt still einen falschen Abstand
    // zu nehmen.
    // Der Index wird nach BEIDEN Seiten gedeckelt. Ohne die untere Grenze
    // ergibt eine negative Stufe (nur aus beschaedigten Daten denkbar) einen
    // Zugriff ins Leere -> tagPlus(undefined) -> faellig "NaN-NaN-NaN". Eine
    // solche Karte waere nie wieder faellig und verschwaende still aus dem
    // Wiederholstapel.
    const index = Math.min(Math.max(stufe - 1, 0), ABSTAENDE.length - 1)
    const abstand = ABSTAENDE[index] ?? ABSTAENDE[0] ?? 1
    return {
      stufe,
      faellig: tagPlus(abstand),
      gesehen,
      richtig: richtigZahl,
    }
  }
  return { stufe: 0, faellig: heute(), gesehen, richtig: richtigZahl }
}

/** Ab Stufe 3 gilt ein Wort als „sicher". */
export const SICHER_AB: number = 3

/**
 * Der Parameter ist absichtlich weiter als `Karte`: gelesen wird nur die
 * Faelligkeit, und Kartenstaende aus aelteren Fassungen haben sie womoeglich
 * gar nicht — die sind dann sofort wieder dran.
 */
export function istFaellig(
  karte: { faellig?: Tagesschluessel | null },
  tag: Tagesschluessel = heute()
): boolean {
  return !karte.faellig || karte.faellig <= tag
}
