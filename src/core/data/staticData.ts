// Online-Modus ohne lokalen Server: durchsucht die statischen JSON-Daten
import { sucheNormal } from '../schrift/normalisierung.ts'

// Die JSON-Dateien speichern Zeilen als Felder, nicht als Objekte — das spart
// bei 456.000 Woertern erheblich Platz. Die Tupeltypen sagen, was an welcher
// Stelle steht, damit die Zerlegungen unten nicht geraten sind.

/** `[Sprache, Wort, Zielsprache, Uebersetzung]` aus woerter.json. */
type Wortzeile = readonly [string, string, string, string]
/** `[Sprache, Wort, Wortart, IPA, Bedeutungen, Formen]` aus wiki.json. */
type Wikizeile = readonly [string, string, string, string, string, string]
/** `[Sprache, Satz, Zielsprache, Uebersetzung]` aus beispiele.json. */
type Beispielzeile = readonly [string, string, string, string]

interface Statischerbestand {
  woerter: Wortzeile[]
  wiki: Wikizeile[]
  beispiele: Beispielzeile[]
}

/** Ein Treffer im Wortteil der Suche. */
export interface Wortfund {
  lang: string
  wort: string
  ziel_lang: string
  uebersetzung: string
  quelle: 'online'
}

/** Ein Treffer im Wiktionary-Teil — auch die Kurdish-Tech-Funde kommen so. */
export interface Wikifund {
  lang: string
  wort: string
  wortart: string
  ipa: string
  bedeutungen: string
  formen: string
}

/** Was `sucheStatisch()` zurueckgibt. */
export interface Suchergebnis {
  woerter: Wortfund[]
  wiki: Wikifund[]
  /** Bleibt leer; das Feld steht fuer die Aufrufer, die es lesen. */
  formen: never[]
}

/** Ein Satzpaar fuer den Satzbau. */
export interface Satzpaar {
  satz: string
  uebersetzung: string
}

let daten: Statischerbestand | null = null

async function holeJson<T>(pfad: string): Promise<T> {
  const r = await fetch(pfad)
  // Ohne diese Pruefung wuerde eine Fehlerseite als JSON geparst und der
  // kaputte Zustand dauerhaft im Modul-Cache landen.
  if (!r.ok) throw new Error(`${pfad}: ${r.status}`)
  // Ungeprueft: `json()` liefert `any`, die Tupeltypen oben sind eine
  // Erwartung an die Datei, keine Zusage. Sie stammt aus `public/daten/`
  // bzw. R2 — beides eigene Daten. Waere hier je eine fremde Quelle
  // angeschlossen, gehoerte an diese Stelle eine echte Pruefung.
  return r.json()
}

/** Unverzerrtes Mischen (Fisher-Yates) — sort(Math.random) bevorzugt Positionen. */
function mischen<T>(liste: readonly T[]): T[] {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Beide Stellen liegen im Bereich; der Pruefer kennt die Laenge nicht,
    // deshalb die Abfrage statt einer Typzusicherung.
    const x = a[i]
    const y = a[j]
    if (x !== undefined && y !== undefined) {
      a[i] = y
      a[j] = x
    }
  }
  return a
}

export async function ladeStatisch(): Promise<Statischerbestand> {
  if (daten) return daten
  const [woerter, wiki, beispiele] = await Promise.all([
    holeJson<Wortzeile[]>('/daten/woerter.json'),
    holeJson<Wikizeile[]>('/daten/wiki.json'),
    holeJson<Beispielzeile[]>('/daten/beispiele.json'),
  ])
  daten = { woerter, wiki, beispiele }
  return daten
}

export async function sucheStatisch(q: string): Promise<Suchergebnis> {
  const d = await ladeStatisch()
  // Tolerant suchen: „cawa" findet „çawa", „kase" findet „Käse".
  const s = sucheNormal(q)
  const woerter = d.woerter
    .filter(([, wort, , ueb]) => sucheNormal(wort).startsWith(s) || sucheNormal(ueb).startsWith(s))
    .slice(0, 60)
    .map(
      ([lang, wort, ziel_lang, uebersetzung]): Wortfund => ({
        lang,
        wort,
        ziel_lang,
        uebersetzung,
        quelle: 'online',
      })
    )
  const wiki = d.wiki
    .filter(([, wort]) => sucheNormal(wort).startsWith(s))
    .slice(0, 15)
    .map(([lang, wort, wortart, ipa, bedeutungen, formen]) => ({ lang, wort, wortart, ipa, bedeutungen, formen }))
  let kt: Wikifund[] = []
  try { kt = await sucheKurdishTech(q) } catch {}
  return { woerter, wiki: wiki.concat(kt), formen: [] }
}

export async function beispieleStatisch(wort: string): Promise<Satzpaar[]> {
  const d = await ladeStatisch()
  const s = sucheNormal(wort)
  return d.beispiele
    .filter(([, satz]) => sucheNormal(satz).includes(s))
    .slice(0, 15)
    .map(([, satz, , uebersetzung]) => ({ satz, uebersetzung }))
}

export async function statischeAnzahl(): Promise<{ woerter: number; beispiele: number }> {
  const d = await ladeStatisch()
  return { woerter: d.woerter.length, beispiele: d.beispiele.length }
}

// Kurdish-Tech-Woerterbuch (456.000+ Woerter, mit Erlaubnis): pro Buchstabe nachladen
const KT_SPRACHEN: Readonly<Record<string, string>> = { ku: 'kmr', sor: 'ckb', zza: 'zza' }

/** Ein Abschnitt einer Buchstaben-Datei: welche Woerter darin stehen. */
interface Ktabschnitt {
  file: string
  first: string
  last: string
}

/** Der Index einer Sprache: je Anfangsbuchstabe die zustaendigen Dateien. */
interface Ktindex {
  letters: Readonly<Record<string, readonly Ktabschnitt[] | undefined>>
}

/** Ein Eintrag aus einer Kurdish-Tech-Datei. */
interface Kteintrag {
  word?: string
  pos_title?: string
  pos?: string
  glosses?: readonly string[]
}

const ktIndex: Record<string, Ktindex | undefined> = {}
const ktChunks: Record<string, Kteintrag[] | undefined> = {}

export async function sucheKurdishTech(q: string): Promise<Wikifund[]> {
  const s = q.toLowerCase()
  const ende = s + '￿'
  const ergebnisse: Wikifund[] = []
  for (const ordner of Object.keys(KT_SPRACHEN)) {
    try {
      let index = ktIndex[ordner]
      if (!index) {
        index = await holeJson<Ktindex>(`/daten/kt/${ordner}/index.json`)
        ktIndex[ordner] = index
      }
      const buchstabe = s[0] ?? ''
      const dateien = (index.letters[buchstabe] || [])
        .filter((e) => e.first <= ende && e.last >= s)
      for (const e of dateien) {
        const pfad = `${ordner}/${e.file}`
        let brocken = ktChunks[pfad]
        if (!brocken) {
          brocken = await holeJson<Kteintrag[]>(`/daten/kt/${pfad}`)
          ktChunks[pfad] = brocken
        }
        for (const w of brocken) {
          if (w.word && w.word.toLowerCase().startsWith(s)) {
            ergebnisse.push({
              lang: KT_SPRACHEN[ordner] ?? ordner, wort: w.word,
              wortart: w.pos_title || w.pos || '', ipa: '',
              bedeutungen: (w.glosses || []).slice(0, 5).join(' | '), formen: '',
            })
            if (ergebnisse.length >= 20) return ergebnisse
          }
        }
      }
    } catch { /* Sprache nicht verfuegbar */ }
  }
  return ergebnisse
}

/** Die geprüften Beispielsätze der Kapitel — offline immer verfügbar. */
async function lokalePaare(): Promise<Satzpaar[]> {
  // Spät geladen, damit staticData keine harte Abhängigkeit zum Kursbaum hat.
  const { EINHEITEN } = await import('../courses/courseRepository.ts')
  return EINHEITEN.flatMap((e) => e.saetze || []).map((s) => ({
    satz: s.ku,
    uebersetzung: s.de,
  }))
}

export async function zufallsPaare(anzahl: number): Promise<Satzpaar[]> {
  // Etwa die Hälfte kommt aus den eigenen Kapiteln — so lassen sich die
  // gelernten Sätze wirklich üben. Der Rest kommt aus dem großen Satzpaket;
  // fehlt es (offline, kein R2), tragen die Kapitelsätze allein.
  const lokal = mischen(await lokalePaare())
  let fern: Satzpaar[] = []
  try {
    const d = await ladeStatisch()
    // Nur echte deutsche Uebersetzungen: Der fruehere Englisch-Fallback
    // zeigte englische Tatoeba-Saetze als vermeintlich deutschen Text an.
    // Fehlen deutsche Paare, tragen unten die Kapitelsaetze allein.
    const deu = d.beispiele.filter(([sl, , tl]) => sl === 'kmr' && tl === 'deu')
    fern = mischen(deu).map(([, satz, , uebersetzung]) => ({ satz, uebersetzung }))
  } catch {
    /* ohne Satzpaket üben wir mit den Kapitelsätzen */
  }
  const halb = Math.min(lokal.length, Math.ceil(anzahl / 2))
  const auswahl = lokal.slice(0, halb).concat(fern.slice(0, anzahl - halb))
  if (auswahl.length < anzahl) auswahl.push(...lokal.slice(halb, halb + (anzahl - auswahl.length)))
  return mischen(auswahl).slice(0, anzahl)
}
