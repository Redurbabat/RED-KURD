// Zentrale Sprachliste der App. Deutsch ist immer die Ausgangssprache der
// Oberflaeche und der Erklaerungen; gelernt werden die Zielsprachen.
//
// Kurmancî ist und bleibt der Hauptkurs. Weitere Sprachen sind Daten, keine
// Sonderfaelle: Wer eine Sprache ergaenzt, traegt sie hier ein und legt die
// Kursinhalte unter src/data/ an — der uebrige Code fragt nur diese Liste.
//
// `kursId` verbindet einen Eintrag mit dem bestehenden Kurssystem:
// 'kurmanci' ist der grosse Hauptkurs (courseRepository), alle anderen Ids
// zeigen auf die Zusatzkurse in src/data/sprachkurse.js.

/** Wie eine Sprache geschrieben wird. */
export type Schriftart = 'latin' | 'arabic'

/**
 * Eine Lernsprache. Deutsch ist immer `ausgang`; gelernt wird `ziel`.
 *
 * `kursId` verbindet den Eintrag mit dem Kurssystem und ist `null`, solange
 * es keine Inhalte gibt — dann steht auch `geplant: true` daneben.
 */
export interface Sprache {
  id: string
  /** Der Name in der Sprache selbst („Français"). */
  name: string
  nameDeutsch: string
  /** Sprachcode der Ausgangssprache — heute immer `'de'`. */
  ausgang: string
  /** Sprachcode fuer `lang="…"` im Markup. */
  ziel: string
  schrift: Schriftart
  rtl: boolean
  /** Wunschstimme der Sprachausgabe. */
  locale: string
  kursId: string | null
  /** Nur bei Kurmancî gesetzt. */
  hauptkurs?: boolean
  /** Vorbereitet, aber noch nicht lernbar. */
  geplant?: boolean
}

export const SPRACHEN: readonly Sprache[] = [
  {
    id: 'ku-kurmanci',
    name: 'Kurmancî',
    nameDeutsch: 'Kurdisch (Kurmancî)',
    ausgang: 'de',
    ziel: 'ku', // Sprachcode fuer lang="ku" im Markup
    schrift: 'latin',
    rtl: false,
    locale: 'ku', // Wunschstimme der Sprachausgabe
    kursId: 'kurmanci',
    hauptkurs: true,
  },
  {
    id: 'en',
    name: 'English',
    nameDeutsch: 'Englisch',
    ausgang: 'de',
    ziel: 'en',
    schrift: 'latin',
    rtl: false,
    locale: 'en-GB',
    kursId: 'englisch',
  },
  {
    id: 'fr',
    name: 'Français',
    nameDeutsch: 'Französisch',
    ausgang: 'de',
    ziel: 'fr',
    schrift: 'latin',
    rtl: false,
    locale: 'fr-FR',
    kursId: 'franzoesisch',
  },
  {
    id: 'tr',
    name: 'Türkçe',
    nameDeutsch: 'Türkisch',
    ausgang: 'de',
    ziel: 'tr',
    schrift: 'latin',
    rtl: false,
    locale: 'tr-TR',
    kursId: 'tuerkisch',
  },
  {
    id: 'es',
    name: 'Español',
    nameDeutsch: 'Spanisch',
    ausgang: 'de',
    ziel: 'es',
    schrift: 'latin',
    rtl: false,
    locale: 'es-ES',
    kursId: 'spanisch',
  },
  // ===== Geplant — Struktur steht, Inhalte folgen bewusst spaeter. =====
  {
    id: 'ku-sorani',
    name: 'Soranî',
    nameDeutsch: 'Kurdisch (Soranî)',
    ausgang: 'de',
    ziel: 'ckb',
    schrift: 'arabic',
    rtl: true,
    locale: 'ckb',
    kursId: null,
    geplant: true,
  },
  {
    id: 'ku-zazaki',
    name: 'Zazakî',
    nameDeutsch: 'Kurdisch (Zazakî)',
    ausgang: 'de',
    ziel: 'zza',
    schrift: 'latin',
    rtl: false,
    locale: 'zza',
    kursId: null,
    geplant: true,
  },
]

/**
 * Der Hauptkurs der App — Kurmancî.
 *
 * Kann nicht fehlen: `test/languages.test.js` prueft, dass genau ein Eintrag
 * `hauptkurs` traegt. Der Rueckfall steht trotzdem da, weil der Pruefer den
 * Inhalt der Liste nicht kennt — und weil ein `undefined` hier jede
 * aufrufende Seite umwerfen wuerde.
 */
export function hauptSprache(): Sprache {
  const haupt = SPRACHEN.find((s) => s.hauptkurs) ?? SPRACHEN[0]
  if (!haupt) throw new Error('SPRACHEN ist leer — es gibt keinen Hauptkurs.')
  return haupt
}

/** Alle Sprachen, die heute schon lernbar sind. */
export function verfuegbareSprachen(): Sprache[] {
  return SPRACHEN.filter((s) => !s.geplant)
}

/** Sprachen, die vorbereitet, aber noch nicht lernbar sind. */
export function geplanteSprachen(): Sprache[] {
  return SPRACHEN.filter((s) => s.geplant)
}

export function spracheVon(id: string | null | undefined): Sprache | null {
  return SPRACHEN.find((s) => s.id === id) || null
}

/** Sprache zu einer Kurs-Id des bestehenden Kurssystems. */
export function spracheZuKurs(kursId: string | null | undefined): Sprache | null {
  return SPRACHEN.find((s) => s.kursId === kursId) || null
}

/** Was an ein Element gehaengt wird, das Text in der Zielsprache zeigt. */
export interface Sprachattribute {
  lang?: string
  dir?: 'rtl'
}

/**
 * HTML-Attribute fuer Text in einer Zielsprache: `lang` immer, `dir` nur bei
 * Rechts-nach-links-Schrift. Anwendung: <span {...sprachAttribute(sprache)}>…
 */
export function sprachAttribute(sprache: Sprache | null | undefined): Sprachattribute {
  if (!sprache) return {}
  const attribute: Sprachattribute = { lang: sprache.ziel }
  if (sprache.rtl) attribute.dir = 'rtl'
  return attribute
}
