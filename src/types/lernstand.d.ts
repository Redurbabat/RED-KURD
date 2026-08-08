/**
 * Die persistenten Datenformen von RED-KURD als TypeScript-Typen.
 *
 * Sie sind die maschinenlesbare Fassung von STORAGE.md — dort steht zu jedem
 * Feld die Bedeutung und die Fundstelle im Code. Beide müssen zusammen
 * geändert werden.
 *
 * Vorerst eine reine Deklarationsdatei: der Bestand ist JS, `checkJs` ist aus.
 * Wenn ein Modul nach TypeScript wandert (Reihenfolge siehe ADR-006), zieht es
 * seine Form von hier — nicht jedes Modul definiert sie neu.
 *
 * Zwei Ebenen, die hier bewusst auseinandergehalten werden:
 *
 * 1. **Die Form nach dem Laden.** Jeder Store legt ein `STANDARD`- bzw.
 *    `LEER`-Objekt über den gelesenen Wert (`{ ...LEER, ...gelesen }`). Was
 *    dort steht, ist danach garantiert vorhanden — das beschreiben die
 *    Haupttypen (`Lernstand`, `Profil`, `Shopstand`, …).
 * 2. **Die Form auf der Platte.** Sie kann ärmer sein: ein älterer Stand, ein
 *    fremder Import, ein von Hand bearbeiteter Eintrag. Dafür gibt es
 *    `GespeicherterStand` und die ausdrücklichen Hinweise an den Stellen, an
 *    denen die Lücke wirklich durchschlägt (siehe `Tag`).
 *
 * Ein `version`-Feld beschreibt immer die Zahl, die das `STANDARD`-Objekt
 * setzt. Auf der Platte gewinnt der gespeicherte Wert, weil er im Spread nach
 * hinten kommt — wer eine Version *prüfen* will (wie `uiStore.js:25`), darf
 * sich deshalb nie auf das Literal verlassen.
 */

/** Fertigkeiten, in denen eine Vokabel getrennt geübt und bewertet wird. */
export type Fertigkeit = 'erkennen' | 'abrufen' | 'schreiben' | 'hoeren'

/** Aufgabenarten des Übungsspielers. */
export type Aufgabenart = 'wahl-ku' | 'wahl-de' | 'tippen' | 'bild' | 'hoeren'

/** Kalendertag in der Zeitzone des Geräts, Format `JJJJ-MM-TT`. */
export type Tagesschluessel = string

/** Kartenschlüssel im Format `de|ku|fertigkeit`. */
export type Kartenschluessel = string

/**
 * Die Fertigkeit, wie sie in einem Kartenschlüssel steht. `gemischt` heißt:
 * der Schlüssel nennt keine, die Karte gilt also für alle zusammen.
 */
export type Kartenfertigkeit = Fertigkeit | 'gemischt'

/**
 * Ein zerlegter Kartenschlüssel. Bewusst weit gefasst: `schluesselTeile`
 * trennt stur am `|` und prüft nicht, ob der dritte Teil wirklich eine
 * Fertigkeit ist — siehe die bekannte Grenze des Trennzeichens in STORAGE.md.
 */
export interface Kartenteile {
  de: string
  /** Fehlt, wenn der Schlüssel gar kein `|` enthält. */
  ku: string | undefined
  /** `gemischt`, wenn der Schlüssel keinen dritten Teil hat. */
  skill: string
}

/** Eine Wiederholkarte (vereinfachtes SM-2, siehe scheduler.ts). */
export interface Karte {
  /** 0–6; Abstände [1, 3, 7, 16, 35, 70] Tage. Richtig → +1, falsch → zurück auf 0. */
  stufe: number
  faellig: Tagesschluessel
  gesehen: number
  richtig: number
}

/**
 * Aktivität eines einzelnen Tages; auf 60 Einträge begrenzt
 * (`progressStore.js:219–221`).
 *
 * ACHTUNG, historisch krumm: Diese Form beschreibt, was `LEERER_TAG`
 * (`progressStore.ts:199`) anlegt. Auf der Platte kann ein Tag deutlich ärmer
 * sein — die v1-Migration übernimmt `alt.tage` unverändert
 * (`storage.ts`, Schritt 1).
 *
 * Wie arm, ist nicht eindeutig: `test/storage.test.js` und
 * `test/storage-basis.test.js` halten für v1 eine **blanke Zahl** je Tag fest
 * (`tage: { '2026-07-30': 20 }`), während der Kommentar an `LEER`
 * (`progressStore.ts:20`) eine Drei-Feld-Form `{ aufgaben, richtig, sekunden }`
 * zeigt. Beide dürften real existieren; sicher ist nur, dass ein migrierter
 * v1-Tag **kein vollständiger `Tag`** ist. Wer hier weiterbaut, darf sich auf
 * keine der beiden Formen verlassen.
 *
 * Zwei Folgen für jeden, der hier weiterbaut:
 * - `zaehleAufgabe()`/`zaehleLernzeit()` sind unbedenklich: sie legen
 *   `LEERER_TAG` zuerst und ergänzen fehlende Felder dabei.
 * - `tagesStatistik()` (`progressSelectors.ts:175`) reicht den rohen Tag
 *   durch. Deshalb schreibt `taskStore.js:71` die Standardwerte noch einmal
 *   davor. **Diese Absicherung darf beim Migrieren nicht wegfallen** — ohne
 *   sie wird aus `Math.min(tag.maxFolge, 3)` bei einem v1-Tag `NaN`, und die
 *   Tagesaufgabe „3 richtige Antworten hintereinander" ließe sich nie mehr
 *   abschließen.
 * Der Typ bleibt trotzdem vollständig: die Felder optional zu machen bricht
 * genau die Stelle, die sie korrekt behandelt (der Spread
 * `{ ...LEERER_TAG, ...(d.tage[t] || {}) }` verliert dann seine Garantie).
 */
export interface Tag {
  aufgaben: number
  richtig: number
  sekunden: number
  skills: Partial<Record<Fertigkeit, number>>
  folge: number
  maxFolge: number
}

/** `red-kurd-progress-v2` — der eine Lernstand aller drei Modi. */
export interface Lernstand {
  version: 2
  xp: number
  serie: number
  letzterTag: Tagesschluessel | null
  serienSchutz: number
  letzterSchutz: Tagesschluessel | null
  /** Einheit-ID → bestes Ergebnis in Prozent. */
  einheiten: Record<string, number>
  /** Einheit-ID → 0–3 Sterne. */
  sterne: Record<string, number>
  /** Einheit-ID → Anzahl bestandener Läufe (≥ 80 %). */
  bestanden: Record<string, number>
  karten: Record<Kartenschluessel, Karte>
  tage: Record<Tagesschluessel, Tag>
  edelsteine: number
  schluessel: number
  zielBelohnt: Tagesschluessel | null
  truhe: Tagesschluessel | null
  /** Welt-ID → Tag, an dem die Welttruhe geöffnet wurde. */
  weltTruhen: Record<string, Tagesschluessel>
  lernzeit: number
}

/**
 * `red-kurd-profile-v2` — Lernprofil.
 *
 * Die Werte von `kenntnis`, `ziel`, `minuten`, `tagesziel` und `variante`
 * stammen aus den Listen im selben Modul (`KENNTNISSE`, `ZIELE`, `VARIANTEN`,
 * `TAGESZIELE`, dazu `ZEITEN` im Onboarding). Sie stehen hier trotzdem als
 * `string`/`number` und nicht als Vereinigung: **der Store prüft nichts.**
 * `setzeProfil()` (`profileStore.js:64`) nimmt beim Import beliebiges JSON
 * entgegen, und `speichereProfil()` schreibt jedes Teilstück durch. Eine enge
 * Vereinigung wäre eine Zusage, die der Code nicht einlöst.
 */
export interface Profil {
  version: 2
  name: string
  /** `neu` | `etwas` | `gespraech` (KENNTNISSE). */
  kenntnis: string
  /** `familie` | `alltag` | `kultur` | `reise` (ZIELE); Standard `alltag`. */
  ziel: string
  /** Wunschdauer als **String**: `'5'` | `'10'` | `'20'`; steuert `standardDauer()`. */
  minuten: string
  /** Aufgaben pro Tag: 10 | 20 | 30 | 50 (TAGESZIELE); Standard 20. */
  tagesziel: number
  /** `kurmanci-standard` | `kurmanci-botan` | `kurmanci-serhed` (VARIANTEN). */
  variante: string
  /**
   * ISO-Zeitstempel — aber `null`, solange nie über `speichereProfil()`
   * geschrieben wurde. `STANDARD.erstellt` ist `null`
   * (`profileStore.js:39`), und `setzeProfil()` beim Import füllt es nicht
   * nach. Erst `speichereProfil()` setzt es (`:57`).
   */
  erstellt: string | null
}

/**
 * `red-kurd-ui-v1` — Oberflächeneinstellungen.
 *
 * Zwei Wahrheiten beim Namen: Der Schlüssel heißt `-v1`, `STANDARD` trägt
 * aber `version: 2` (`uiStore.js:7`). Und `migriere()` legt den Schlüssel bei
 * der Erstmigration mit `version: 1` an (`storage.js:300–308`) — genau darauf
 * reagiert die einmalige Dunkel-Migration in `uiStore.js:25`. Der Typ bleibt
 * deshalb `number`, nicht `2`.
 */
export interface UiEinstellungen {
  version: number
  mode: 'modern' | 'abenteuer' | 'redlingo'
  /**
   * `auto` bedeutet: der Gerätewunsch entscheidet. Erst `anwenden()`
   * (`uiStore.js:59–66`) löst ihn über `prefers-color-scheme` in `light` oder
   * `dark` auf — an `<html data-theme>` steht nie `auto`. Die Auswahl steht in
   * `SettingsPage.jsx:33–42` und wird über `setzeUi({ theme })` gespeichert.
   */
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  animationsEnabled: boolean
  remindersEnabled: boolean
  preferredVariant: string
}

/**
 * Der Lernstand, wie er wirklich aus dem Speicher kommt. `holeFortschritt()`
 * liefert heute `any` — progressStore ist noch JavaScript und die Form
 * entsteht aus `JSON.parse`.
 *
 * Bewusst `Partial`: auf dem Gerät kann ein älterer oder beschädigter Stand
 * liegen, dem einzelne Felder fehlen. Genau deshalb steht im Auswertungscode
 * überall `|| 0` und `|| {}` — mit diesem Typ verlangt der Prüfer diese
 * Absicherungen, statt sie überflüssig erscheinen zu lassen.
 *
 * `version` ist hier `number` und nicht `2`: Was auf der Platte liegt, hat
 * niemand geprüft, und ein Import bringt mit, was in der Datei stand. Wer
 * gegen eine Version prüft, soll das tun dürfen, ohne dass der Prüfer den
 * Vergleich für unmöglich hält.
 */
export type GespeicherterStand = Omit<Partial<Lernstand>, 'version'> & { version?: number }

/**
 * Eine fällige Karte, wie `faelligeKarten()` sie liefert: der zerlegte
 * Schlüssel, die Stufe und der Kartenstand selbst.
 */
export interface Faelligkarte extends Kartenteile {
  /** Aus `karte.stufe`, aber nie `undefined` — fehlt sie, ist es 0. */
  stufe: number
  karte: Karte
}

/**
 * Das Fertigkeitsprofil: je Fertigkeit ein Prozentwert und daneben die Zahl
 * der Karten, aus denen er stammt (`erkennen` und `erkennenAnzahl`).
 */
export type Fertigkeitsprofil = Record<Fertigkeit, number> &
  Record<`${Fertigkeit}Anzahl`, number>

/** Die Einordnung eines Prozentwerts in Worte. */
export type Fertigkeitsstufe = 'Stark' | 'Fortgeschritten' | 'Auf dem Weg' | 'Am Anfang'

/** Kernzahlen für Kopfleiste und Fortschrittsseite. */
export interface Kennzahlen {
  xp: number
  serie: number
  serienSchutz: number
  letzterSchutz: Tagesschluessel | null
  edelsteine: number
  schluessel: number
  level: number
  /** Zahl der gelernten Wortpaare — Karten derselben Vokabel zählen einmal. */
  gelernt: number
  /** Zahl aller Karten, also Wortpaar × Fertigkeit. */
  karten: number
  sicher: number
  faellig: number
  lernzeit: number
  einheiten: Record<string, number>
}

/** Ein Tag im Wochenband. */
export interface Wochentagswert {
  /** Kurzform des Wochentags, z. B. `Mo`. */
  tag: string
  datum: Tagesschluessel
  anzahl: number
  richtig: number
  sekunden: number
  heute: boolean
}

/* ===== Abgeleitete Formen des Lernstands =====
   Was progressStore.js zurückgibt, ohne dass es je gespeichert wird. Steht
   hier, damit die Rückgabetypen beim Migrieren nicht neu erfunden werden. */

/** Was `level()` liefert (`progressStore.js:87`). Level = `floor(xp / 100) + 1`. */
export interface Levelstand {
  stufe: number
  /** XP innerhalb der Stufe, 0–99. */
  fortschritt: number
  bisNaechstes: number
}

/** Was `tagesZiel()` liefert (`progressStore.js:239`). */
export interface Tageszielstand {
  /** Auf `ziel` gedeckelt — für Fortschrittsbalken. */
  erledigt: number
  /** Ungedeckelt, also auch über dem Ziel. */
  roh: number
  ziel: number
  geschafft: boolean
  belohnt: boolean
}

/** Was `holeTageszielBelohnung()` gutschreibt (`progressStore.js:251`). */
export interface Tageszielbelohnung {
  xp: number
  edelsteine: number
}

/**
 * Was `truheOeffnen()` gutschreibt (`progressStore.js:285`). `schluessel` ist
 * bewusst immer da und meist 0 — nur auf Serienstufe 4 gibt es einen.
 */
export interface Truhenbelohnung {
  xp: number
  edelsteine: number
  schluessel: number
}

/** Ein Wortpaar des Kurses. `bild` ist meist ein Emoji, manchmal ein Foto. */
export interface Wort {
  de: string
  ku: string
  bild?: string
}

/**
 * Ein Wort auf dem Weg in eine Aufgabe. Stammt es aus einer fälligen Karte,
 * bringt es deren Fertigkeit mit — dann wird genau diese trainiert.
 * `skill` ist roher Text aus dem Kartenschlüssel: `gemischt` oder etwas
 * Unbekanntes sind möglich, deshalb `string` und nicht `Fertigkeit`.
 */
export interface Uebungswort extends Wort {
  skill?: string
}

/** Eine Kachel einer Bildaufgabe. */
export interface Bildoption {
  bild: string
  ku: string
}

/** Was jede Aufgabe hat, unabhängig von ihrer Art. */
interface Aufgabenkern {
  frage: string
  antwort: string
  w: Uebungswort
}

/** Bildaufgabe: vier Kacheln, gesucht ist das Bild zum Kurmancî-Wort. */
export interface Bildaufgabe extends Aufgabenkern {
  art: 'bild'
  optionen: Bildoption[]
}

/** Wahlaufgabe: vier Wörter zur Auswahl. */
export interface Wahlaufgabe extends Aufgabenkern {
  art: 'wahl-ku' | 'wahl-de' | 'hoeren'
  optionen: string[]
}

/** Tippaufgabe: die Antwort wird geschrieben — sie hat gar keine Optionen. */
export interface Tippaufgabe extends Aufgabenkern {
  art: 'tippen'
}

/**
 * Eine Aufgabe im Übungsspieler. Die Optionen hängen an der Art: Bildaufgaben
 * tragen Kacheln, Wahlaufgaben Wörter, die Tippaufgabe hat keine. Das eine
 * `optionen: unknown[]` von früher hat genau das verdeckt — siehe
 * exerciseFactory.ts, wo die drei Formen entstehen.
 */
export type Uebung = Bildaufgabe | Wahlaufgabe | Tippaufgabe

/**
 * `red-kurd-session-v2` — laufende Sitzung. Hat bisher kein version-Feld
 * (bekannte Lücke, STORAGE.md §6).
 *
 * Was gespeichert wird, geht vorher durch `schlank()`
 * (`ExercisePlayer.jsx:70–78`): dort fällt `w.skill` weg, und `optionen` wird
 * bei einer Tippaufgabe als `undefined` gesetzt — `JSON.stringify` lässt das
 * Feld dann ganz weg, die gespeicherte Form entspricht also weiter `Uebung`.
 */
export interface Sitzung {
  titel: string
  index: number
  punkte: number
  uebungen: Uebung[]
  /**
   * ISO-Zeitstempel, den `sitzungSpeichern()` selbst ergänzt
   * (`sessionStore.js:7`). Grundlage der 48-Stunden-Frist in `sitzungLaden()`
   * (`:21–24`) — ohne sie verdrängt eine liegengebliebene Sitzung dauerhaft
   * den Tagesplan.
   *
   * Wahlfrei, weil Altbestand ihn nicht hat: `sitzungLaden()` lässt eine
   * Sitzung ohne Zeitstempel ausdrücklich durch, und
   * `test/sessionStore.test.js` („Altbestand ohne Zeitstempel bleibt
   * nutzbar") nagelt das fest.
   */
  gespeichert?: string
}

/* ===== Shop ===== */

/**
 * Wohin ein Artikel ausgerüstet wird. `verbrauch` ist die Ausnahme: solche
 * Artikel wirken sofort im Lernstand und landen weder in `gekauft` noch in
 * `aktiv` (`shopStore.js:137`).
 */
export type Artikelart = 'mascot' | 'thema' | 'klang' | 'rahmen' | 'verbrauch'

/** Womit bezahlt wird. Beides liegt im Lernstand, nicht im Shopstand. */
export type Waehrung = 'edelsteine' | 'schluessel'

/** Ein Artikel aus `ARTIKEL` (`shopStore.js:17`). Kursdaten, nichts Gespeichertes. */
export interface Shopartikel {
  id: string
  name: string
  beschreibung: string
  /** Gruppe im Laden, siehe `KATEGORIEN` (`shopStore.js:11`). */
  kategorie: 'edelsteine' | 'schluessel' | 'taeglich'
  preis: number
  waehrung: Waehrung
  art: Artikelart
  icon: string
}

/** Eine Gruppe im Laden (`KATEGORIEN`). */
export interface Shopkategorie {
  id: string
  name: string
  icon: string
}

/** Was `kaufe()` zurückmeldet (`shopStore.js:127`). */
export type Kaufergebnis = 'ok' | 'zu-teuer' | 'schon-da' | 'unbekannt'

/**
 * `red-kurd-shop-v1` — gekaufte und aktive Kosmetik.
 *
 * `aktiv` ist bewusst kein vollständiger `Record` über alle Artikelarten:
 * `STANDARD.aktiv` ist `{}` (`shopStore.js:80`), ein Schlüssel entsteht erst
 * beim ersten Ausrüsten. Und der Wert kann `null` werden — `setzeAktiv()`
 * legt den Artikel wieder ab, indem es `null` schreibt statt den Schlüssel zu
 * entfernen (`shopStore.js:149`). `aktiverArtikel()` fängt beides mit
 * `id ? … : null` ab (`:155`).
 */
export interface Shopstand {
  version: 1
  /** Artikel-IDs; Verbrauchsartikel stehen hier nie. */
  gekauft: string[]
  /** Artikelart → ausgerüstete Artikel-ID, oder `null` nach dem Ablegen. */
  aktiv: Record<string, string | null>
}

/* ===== Tages- und Wochenaufgaben ===== */

/**
 * Referenzwerte, um „heute/diese Woche abgeschlossene Einheiten" aus der
 * Gesamtzahl abzuleiten. Beide wahlfrei: sie entstehen erst beim ersten
 * Tages- bzw. Wochenwechsel (`taskStore.js:47`, `:54`), und `heutigeEinheiten()`
 * fängt das Fehlen mit `??` ab (`:61`).
 */
export interface Aufgabenbasis {
  tagEinheiten?: number
  wocheEinheiten?: number
}

/**
 * `red-kurd-tasks-v1` — Tages- und Wochenaufgaben (`taskStore.js:15`).
 *
 * Gespeichert wird nur, was sich nicht ableiten lässt: die abgeholten
 * Belohnungen und die beiden Zeitmarken. Der Aufgabenfortschritt selbst kommt
 * bei jedem Lesen frisch aus dem Lernstand, damit keine zweite Zählung
 * auseinanderlaufen kann.
 */
export interface Aufgabenstand {
  version: 1
  /** Aufgaben-ID → Tag der abgeholten Belohnung. Präfix `t-` täglich, `w-` wöchentlich. */
  abgeholt: Record<string, Tagesschluessel>
  /** Zuletzt gesehener Tag; ein Wechsel löscht alle `t-*`. */
  tag: Tagesschluessel | null
  /** Montag der laufenden Woche; ein Wechsel löscht alle `w-*`. */
  wochenStart: Tagesschluessel | null
  basis: Aufgabenbasis
}

/**
 * Belohnung einer Aufgabe. `xp` gibt es bei jeder, die beiden anderen nur bei
 * einigen — deshalb wahlfrei (`taskStore.js:73–133`).
 */
export interface Aufgabenbelohnung {
  xp: number
  edelsteine?: number
  schluessel?: number
}

/**
 * Eine Aufgabe mit aktuellem Stand, wie `holeAufgaben()` sie liefert
 * (`taskStore.js:69`). Nichts davon wird gespeichert außer `abgeholt`.
 */
export interface Aufgabe {
  id: string
  name: string
  icon: string
  /** Auf `ziel` gedeckelt. */
  stand: number
  ziel: number
  belohnung: Aufgabenbelohnung
  geschafft: boolean
  abgeholt: boolean
}

/** Was `holeAufgaben()` zurückgibt: beide Listen, je Aufgabe schon markiert. */
export interface Aufgabenliste {
  taeglich: Aufgabe[]
  woechentlich: Aufgabe[]
}

/* ===== Auszeichnungen ===== */

/** Die Farbtöne, in denen Auszeichnungen erscheinen (`achievementsStore.js:9`). */
export type Auszeichnungsfarbe = 'green' | 'orange' | 'blue' | 'purple' | 'teal' | 'gold'

/**
 * Der Kursausschnitt, den eine Auszeichnungsprüfung als zweites Argument
 * bekommt: `kursFortschritt()` plus die Zahl der fertigen Welten
 * (`achievementsStore.js:99–106`). Bewusst hier ausgeschrieben statt aus
 * `kurs.d.ts` importiert — dort steht, was der Kurs *ist*, hier, was die
 * Prüfung *liest*.
 */
export interface Auszeichnungslage {
  fertig: number
  gesamt: number
  prozent: number
  weltenFertig: number
}

/** Eine Auszeichnung, wie sie in `AUSZEICHNUNGEN` steht — Regel, kein Stand. */
export interface Auszeichnung {
  id: string
  name: string
  beschreibung: string
  icon: string
  farbe: Auszeichnungsfarbe
  /** Freigeschaltet? Wird bei jedem Lesen neu aus dem Lernstand berechnet. */
  pruefe: (kennzahlen: Kennzahlen, kurs: Auszeichnungslage) => boolean
}

/**
 * Was `holeAuszeichnungen()` liefert (`achievementsStore.js:97`): die Regel
 * samt Ergebnis. `pruefe` bleibt am Objekt hängen, weil der Store die ganze
 * Vorlage durchspreizt (`{ ...a, frei, seit }`).
 */
export interface Auszeichnungsstatus extends Auszeichnung {
  frei: boolean
  /** Tag des Freischaltens; `null`, solange sie gesperrt ist. */
  seit: Tagesschluessel | null
}

/**
 * `red-kurd-achievements-v1` — der Auszeichnungsstand
 * (`achievementsStore.js:88`).
 *
 * Gespeichert wird nur das **Datum**: ob eine Auszeichnung freigeschaltet
 * ist, ergibt sich immer neu aus dem Lernstand. Der Bereich ist damit bis auf
 * die historischen Daten aus dem Lernstand rekonstruierbar.
 */
export interface Auszeichnungsstand {
  version: 1
  /** Auszeichnungs-ID → Tag des Freischaltens. */
  erhalten: Record<string, Tagesschluessel>
}

/* ===== Herzen ===== */

/**
 * `red-kurd-hearts-v1` — Herzen des Abenteuer-Modus (`heartsStore.js:16`).
 *
 * Zwei Eigenheiten, die beim Migrieren zählen:
 * - `zuletzt` sind **Epoch-Millisekunden**, kein ISO-Text und kein
 *   `Tagesschluessel`. `0` heißt „voll, keine Uhr läuft" — genau darauf
 *   prüfen `naechstesHerzIn()` und `mitRegeneration()` mit `!d.zuletzt`.
 * - Der Store hat heute keinen Aufrufer unter `src/` (STORAGE.md §6), der
 *   Schlüssel entsteht im Betrieb also nie. Er steht trotzdem in `KEYS`,
 *   im Export und im Import — wer ihn dort entfernt, bricht das Einspielen
 *   älterer Sicherungen still ab.
 */
export interface Herzenstand {
  version: 1
  /** 0–5 (`MAX_HERZEN`). */
  herzen: number
  /** Epoch-Millisekunden des Nachwachs-Ankers; `0` bedeutet „voll". */
  zuletzt: number
}

/* ===== Nebenkurse ===== */

/**
 * Stand eines Nebenkurs-Kapitels (`languageCourseStore.js:41–47`).
 * `zuletzt` ist ein ISO-Zeitstempel, kein Tagesschlüssel.
 */
export interface Kapitelstand {
  /** 0–100; wird nur nach oben korrigiert. */
  prozent: number
  versuche: number
  /** Ab 75 %; einmal `true`, bleibt `true`. */
  abgeschlossen: boolean
  zuletzt: string
}

/**
 * `red-kurd-language-courses-v1` — getrennter Fortschritt der Nebensprachen
 * (`languageCourseStore.js:6`). Bewusst getrennt vom Kurmancî-Lernstand:
 * Englisch, Französisch, Türkisch und Spanisch sind Nebenkurse und erzeugen
 * keine Wiederholkarten.
 */
export interface Sprachkursstand {
  version: 1
  /** Schlüssel `kursId/kapitelId` (`languageCourseStore.js:23`). */
  kapitel: Record<string, Kapitelstand>
  /** Zuletzt bearbeiteter Kurs; Rückgabe von `letzterSprachkurs()`. */
  letzterKurs: string | null
}

/** Was `kursStand()` über einen ganzen Nebenkurs sagt (`languageCourseStore.js:51`). */
export interface Nebenkursstand {
  /** Kapitel mit `abgeschlossen: true`. */
  fertig: number
  gesamt: number
  /** Mittel über alle Kapitel, 0 bei einem Kurs ohne Kapitel — nicht `NaN`. */
  prozent: number
}

/* ===== App-Wahl ===== */

/**
 * Welche der vier Apps offen ist (`appModes.js:5–10`). Liegt als **roher
 * String** in `red-kurd-active-app-v1` und — weiter mitgeschrieben — in
 * `red-kurd-active-app-mode-v1`; kein Objekt, kein `version`-Feld.
 * Unbekannte Werte fallen auf `language` zurück, ein kaputter Eintrag kann
 * die App also nie unbenutzbar machen.
 */
export type Appbereich = 'language' | 'code' | 'prompting' | 'electro'

/* ===== Sicherung ===== */

/**
 * Was `exportiereSpeicherstand()` liefert (`storage.js:171–178`): je Eintrag
 * aus `KEYS` der gelesene Wert. Alle Felder wahlfrei — ein Schlüssel, der auf
 * dem Gerät nicht existiert, fehlt hier ganz (`null`-Werte werden gefiltert).
 *
 * Nicht enthalten, weil in `NUR_LOKAL` (`storage.js:169`):
 * - `ohneKonto` — eine Anmelde-Entscheidung dieses Geräts.
 * - `sitzung` — die laufende Übungsrunde ist flüchtig; ein Import würde auf
 *   dem neuen Gerät eine halb fertige, veraltete Sitzung wiederbeleben.
 * Beide sind auch in `importiereSpeicherstand()` ausgenommen: eine alte
 * Sicherungsdatei, die `sitzung` noch enthält, wird still übergangen.
 *
 * Die Sprachaufnahmen aus der IndexedDB fehlen ebenfalls — sie gehen an
 * `storage.js` vorbei (STORAGE.md §4.3).
 */
export interface Speicherstand {
  fortschritt?: Lernstand
  profil?: Profil
  ui?: UiEinstellungen
  shop?: Shopstand
  auszeichnungen?: Auszeichnungsstand
  aufgaben?: Aufgabenstand
  herzen?: Herzenstand
  sprachkurse?: Sprachkursstand
  /**
   * Rohe Strings. `string` und nicht `Appbereich`, weil nichts sie beim
   * Schreiben in eine Datei oder beim Import prüft — `loadAppMode()` fängt
   * Unbekanntes erst beim Lesen ab (`appModeStorage.js:25–39`).
   */
  appAktiv?: string
  appBereich?: string
  codeFortschritt?: Bereichslernstand
  promptingFortschritt?: Bereichslernstand
  electroFortschritt?: Bereichslernstand
  /** Noch ohne Typ: Schule/Betrieb der Elektro-Lehre (`core/elektro/schuleStore.js`). */
  electroSchule?: unknown
  /** Noch ohne Typ: Werkstatt der AI-Sprache (`core/prompting/werkstattStore.js`). */
  promptingWerkstatt?: unknown
  /** Noch ohne Typ: Fehlerbuch von „Code lernen" (`features/code-learning/fehlerbuchStore.js`). */
  fehlerbuch?: unknown
}

/**
 * Die heruntergeladene Datei `red-kurd-lernstand.json`
 * (`progressStore.js:318–335`).
 *
 * Der Lernstand steht **nur einmal** darin: `exportiereAlles()` schneidet
 * `fortschritt` aus dem `speicher`-Block heraus. Ältere Dateien *mit* der
 * Kopie bleiben importierbar.
 *
 * `profil`, `ui` und `shop` stehen zusätzlich auf oberster Ebene — beide
 * Aufrufer reichen sie als `extra` mit (`ProgressPage.jsx:422`,
 * `SettingsPage.jsx:729`). Beim Import gewinnen sie, weil sie nach
 * `importiereSpeicherstand()` geschrieben werden.
 */
export interface Sicherungsdatei {
  version: 2
  app: 'RED-KURD'
  /** ISO-Zeitstempel des Exports. */
  exportiert: string
  fortschritt: Lernstand
  speicher: Omit<Speicherstand, 'fortschritt'>
  profil?: Profil
  ui?: UiEinstellungen
  shop?: Shopstand
}

/* ===== Die anderen drei Apps =====
   Code lernen, AI-Sprache und Elektro-Lehre teilen sich EINE Implementierung
   (core/lernbereiche/bereichsLernstand.js), aber je einen eigenen Schlüssel.
   Geteilt werden die Regeln, nicht die Zahlen — siehe ADR-008. */

/** Zustand einer Lektion, immer aus dem Lernstand abgeleitet, nie aus den Daten. */
export type Lektionsstatus = 'done' | 'current' | 'open' | 'locked'

/**
 * Lernstand eines App-Bereichs. Gilt für codeFortschritt,
 * promptingFortschritt und electroFortschritt gleichermaßen.
 */
export interface Bereichslernstand {
  version: 1
  /** Lektions- oder Übungs-ID → Tag der Erledigung. */
  erledigt: Record<string, Tagesschluessel>
  /** Übungs-ID → eigene Lösung oder Notiz. */
  notizen: Record<string, string>
  xp: number
  serie: number
  letzterTag: Tagesschluessel | null
  /** Tag → an diesem Tag gesammelte XP. Wächst bisher ohne Obergrenze. */
  tage: Record<Tagesschluessel, number>
}

/* ===== Gamification =====
   Serie und Wochenliga werden nicht als eigene Form gespeichert, sondern aus
   einem Lernstand berechnet (core/progress/gamification.ts). Die Regeln sind
   für alle vier Apps dieselben, die Zahlen nicht — siehe ADR-008. */

/**
 * Der Ausschnitt eines Lernstands, den die Serienberechnung liest. Alle Felder
 * sind wahlfrei: der Bereichs-Lernstand der drei neuen Apps kennt keinen
 * `serienSchutz`, der Lernstand der Sprach-App schon.
 */
export interface Serienstand {
  serie?: number
  letzterTag?: Tagesschluessel | null
  serienSchutz?: number
}

/** Ergebnis der Serienberechnung für den ersten Lernmoment eines Tages. */
export interface Serienergebnis {
  serie: number
  letzterTag: Tagesschluessel
  serienSchutz: number
  /** Zahl der Schutz-Tage, die diese Berechnung verbraucht hat; sonst 0. */
  schutzBenutzt: number
}

/** Eine Stufe der persönlichen Wochenliga. */
export interface Wochenliga {
  id: string
  name: string
  /** Untere Schwelle in gelösten Aufgaben, einschließlich. */
  start: number
  /** Obere Schwelle; `null` in der höchsten Liga. */
  ziel: number | null
  icon: string
  text: string
}

/** Eine Ligastufe samt Einordnung des aktuellen Wochenstands. */
export interface Wochenligastand extends Wochenliga {
  /** Gelöste Aufgaben dieser Woche, nie negativ. */
  aufgaben: number
  naechste: Wochenliga | null
  /** Fortschritt innerhalb der Stufe; in der höchsten Liga fest 1. */
  fortschritt: number
  /** Breite der Stufe; in der höchsten Liga fest 1. */
  spanne: number
  /** Aufgaben bis zur nächsten Stufe; in der höchsten Liga 0. */
  fehlen: number
}
