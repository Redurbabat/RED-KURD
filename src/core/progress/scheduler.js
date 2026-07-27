// Wiederholsystem (SM-2-Idee, stark vereinfacht und gut nachvollziehbar).
// Jede Karte hat eine Stufe; je hoeher die Stufe, desto spaeter kommt sie wieder.

export const ABSTAENDE = [1, 3, 7, 16, 35, 70]

/** Fertigkeiten, die eine Karte trainieren kann. */
export const SKILLS = ['erkennen', 'abrufen', 'schreiben', 'hoeren']

export function heute() {
  return new Date().toISOString().slice(0, 10)
}

export function tagPlus(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function gestern() {
  return tagPlus(-1)
}

/** Schluessel einer Karte: deutsch|kurmancî|fertigkeit */
export function kartenSchluessel(de, ku, skill) {
  return skill ? `${de}|${ku}|${skill}` : `${de}|${ku}`
}

export function schluesselTeile(key) {
  const t = key.split('|')
  return { de: t[0], ku: t[1], skill: t[2] || 'gemischt' }
}

/**
 * Neue Kartendaten nach einer Antwort.
 * Richtig -> eine Stufe hoch und spaeter faellig. Falsch -> zurueck auf Stufe 0.
 */
export function naechsteKarte(karte, richtig) {
  const k = karte || { stufe: 0, faellig: heute(), gesehen: 0, richtig: 0 }
  const gesehen = (k.gesehen || 0) + 1
  const richtigZahl = (k.richtig || 0) + (richtig ? 1 : 0)
  if (richtig) {
    const stufe = Math.min((k.stufe || 0) + 1, ABSTAENDE.length)
    return {
      stufe,
      faellig: tagPlus(ABSTAENDE[Math.min(stufe - 1, ABSTAENDE.length - 1)]),
      gesehen,
      richtig: richtigZahl,
    }
  }
  return { stufe: 0, faellig: heute(), gesehen, richtig: richtigZahl }
}

/** Ab Stufe 3 gilt ein Wort als „sicher". */
export const SICHER_AB = 3

export function istFaellig(karte, tag = heute()) {
  return !karte.faellig || karte.faellig <= tag
}
