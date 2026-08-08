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
 * hinten kommt — wer eine Version *prüfen* will (wie `uiStore.ts:25`), darf
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
 * (`progressStore.ts:219–221`).
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
 *   durch. Deshalb schreibt `taskStore.ts:71` die Standardwerte noch einmal
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
 * `setzeProfil()` (`profileStore.ts:64`) nimmt beim Import beliebiges JSON
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
   * (`profileStore.ts:39`), und `setzeProfil()` beim Import füllt es nicht
   * nach. Erst `speichereProfil()` setzt es (`:57`).
   */
  erstellt: string | null
}

/**
 * `red-kurd-ui-v1` — Oberflächeneinstellungen.
 *
 * Zwei Wahrheiten beim Namen: Der Schlüssel heißt `-v1`, `STANDARD` trägt
 * aber `version: 2` (`uiStore.ts:7`). Und `migriere()` legt den Schlüssel bei
 * der Erstmigration mit `version: 1` an (`storage.ts:300–308`) — genau darauf
 * reagiert die einmalige Dunkel-Migration in `uiStore.ts:25`. Der Typ bleibt
 * deshalb `number`, nicht `2`.
 */
export interface UiEinstellungen {
  version: number
  mode: 'modern' | 'abenteuer' | 'redlingo'
  /**
   * `auto` bedeutet: der Gerätewunsch entscheidet. Erst `anwenden()`
   * (`uiStore.ts:59–66`) löst ihn über `prefers-color-scheme` in `light` oder
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
   Was progressStore.ts zurückgibt, ohne dass es je gespeichert wird. Steht
   hier, damit die Rückgabetypen beim Migrieren nicht neu erfunden werden. */

/** Was `level()` liefert (`progressStore.ts:87`). Level = `floor(xp / 100) + 1`. */
export interface Levelstand {
  stufe: number
  /** XP innerhalb der Stufe, 0–99. */
  fortschritt: number
  bisNaechstes: number
}

/** Was `tagesZiel()` liefert (`progressStore.ts:239`). */
export interface Tageszielstand {
  /** Auf `ziel` gedeckelt — für Fortschrittsbalken. */
  erledigt: number
  /** Ungedeckelt, also auch über dem Ziel. */
  roh: number
  ziel: number
  geschafft: boolean
  belohnt: boolean
}

/** Was `holeTageszielBelohnung()` gutschreibt (`progressStore.ts:251`). */
export interface Tageszielbelohnung {
  xp: number
  edelsteine: number
}

/**
 * Was `truheOeffnen()` gutschreibt (`progressStore.ts:285`). `schluessel` ist
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
   * (`sessionStore.ts:7`). Grundlage der 48-Stunden-Frist in `sitzungLaden()`
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
 * `aktiv` (`shopStore.ts:137`).
 */
export type Artikelart = 'mascot' | 'thema' | 'klang' | 'rahmen' | 'verbrauch'

/** Womit bezahlt wird. Beides liegt im Lernstand, nicht im Shopstand. */
export type Waehrung = 'edelsteine' | 'schluessel'

/** Ein Artikel aus `ARTIKEL` (`shopStore.ts:17`). Kursdaten, nichts Gespeichertes. */
export interface Shopartikel {
  id: string
  name: string
  beschreibung: string
  /** Gruppe im Laden, siehe `KATEGORIEN` (`shopStore.ts:11`). */
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

/** Was `kaufe()` zurückmeldet (`shopStore.ts:127`). */
export type Kaufergebnis = 'ok' | 'zu-teuer' | 'schon-da' | 'unbekannt'

/**
 * `red-kurd-shop-v1` — gekaufte und aktive Kosmetik.
 *
 * `aktiv` ist bewusst kein vollständiger `Record` über alle Artikelarten:
 * `STANDARD.aktiv` ist `{}` (`shopStore.ts:80`), ein Schlüssel entsteht erst
 * beim ersten Ausrüsten. Und der Wert kann `null` werden — `setzeAktiv()`
 * legt den Artikel wieder ab, indem es `null` schreibt statt den Schlüssel zu
 * entfernen (`shopStore.ts:149`). `aktiverArtikel()` fängt beides mit
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
 * Tages- bzw. Wochenwechsel (`taskStore.ts:47`, `:54`), und `heutigeEinheiten()`
 * fängt das Fehlen mit `??` ab (`:61`).
 */
export interface Aufgabenbasis {
  tagEinheiten?: number
  wocheEinheiten?: number
}

/**
 * `red-kurd-tasks-v1` — Tages- und Wochenaufgaben (`taskStore.ts:15`).
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
 * einigen — deshalb wahlfrei (`taskStore.ts:73–133`).
 */
export interface Aufgabenbelohnung {
  xp: number
  edelsteine?: number
  schluessel?: number
}

/**
 * Eine Aufgabe mit aktuellem Stand, wie `holeAufgaben()` sie liefert
 * (`taskStore.ts:69`). Nichts davon wird gespeichert außer `abgeholt`.
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

/** Die Farbtöne, in denen Auszeichnungen erscheinen (`achievementsStore.ts:9`). */
export type Auszeichnungsfarbe = 'green' | 'orange' | 'blue' | 'purple' | 'teal' | 'gold'

/**
 * Der Kursausschnitt, den eine Auszeichnungsprüfung als zweites Argument
 * bekommt: `kursFortschritt()` plus die Zahl der fertigen Welten
 * (`achievementsStore.ts:99–106`). Bewusst hier ausgeschrieben statt aus
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
 * Was `holeAuszeichnungen()` liefert (`achievementsStore.ts:97`): die Regel
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
 * (`achievementsStore.ts:88`).
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
 * `red-kurd-hearts-v1` — Herzen des Abenteuer-Modus (`heartsStore.ts:16`).
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
 * Stand eines Nebenkurs-Kapitels (`languageCourseStore.ts:41–47`).
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
 * (`languageCourseStore.ts:6`). Bewusst getrennt vom Kurmancî-Lernstand:
 * Englisch, Französisch, Türkisch und Spanisch sind Nebenkurse und erzeugen
 * keine Wiederholkarten.
 */
export interface Sprachkursstand {
  version: 1
  /** Schlüssel `kursId/kapitelId` (`languageCourseStore.ts:23`). */
  kapitel: Record<string, Kapitelstand>
  /** Zuletzt bearbeiteter Kurs; Rückgabe von `letzterSprachkurs()`. */
  letzterKurs: string | null
}

/** Was `kursStand()` über einen ganzen Nebenkurs sagt (`languageCourseStore.ts:51`). */
export interface Nebenkursstand {
  /** Kapitel mit `abgeschlossen: true`. */
  fertig: number
  gesamt: number
  /** Mittel über alle Kapitel, 0 bei einem Kurs ohne Kapitel — nicht `NaN`. */
  prozent: number
}

/* ===== App-Wahl ===== */

/**
 * Welche der vier Apps offen ist (`appModes.ts:5–10`). Liegt als **roher
 * String** in `red-kurd-active-app-v1` und — weiter mitgeschrieben — in
 * `red-kurd-active-app-mode-v1`; kein Objekt, kein `version`-Feld.
 * Unbekannte Werte fallen auf `language` zurück, ein kaputter Eintrag kann
 * die App also nie unbenutzbar machen.
 */
export type Appbereich = 'language' | 'code' | 'prompting' | 'electro'

/* ===== Sicherung ===== */

/**
 * Was `exportiereSpeicherstand()` liefert (`storage.ts:171–178`): je Eintrag
 * aus `KEYS` der gelesene Wert. Alle Felder wahlfrei — ein Schlüssel, der auf
 * dem Gerät nicht existiert, fehlt hier ganz (`null`-Werte werden gefiltert).
 *
 * Nicht enthalten, weil in `NUR_LOKAL` (`storage.ts:169`):
 * - `ohneKonto` — eine Anmelde-Entscheidung dieses Geräts.
 * - `sitzung` — die laufende Übungsrunde ist flüchtig; ein Import würde auf
 *   dem neuen Gerät eine halb fertige, veraltete Sitzung wiederbeleben.
 * Beide sind auch in `importiereSpeicherstand()` ausgenommen: eine alte
 * Sicherungsdatei, die `sitzung` noch enthält, wird still übergangen.
 *
 * Die Sprachaufnahmen aus der IndexedDB fehlen ebenfalls — sie gehen an
 * `storage.ts` vorbei (STORAGE.md §4.3).
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
   * Unbekanntes erst beim Lesen ab (`appModeStorage.ts:25–39`).
   */
  appAktiv?: string
  appBereich?: string
  codeFortschritt?: Bereichslernstand
  promptingFortschritt?: Bereichslernstand
  electroFortschritt?: Bereichslernstand
  electroSchule?: Elektroschulstand
  promptingWerkstatt?: Werkstattstand
  fehlerbuch?: Fehlerbuchstand
}

/**
 * Die heruntergeladene Datei `red-kurd-lernstand.json`
 * (`progressStore.ts:318–335`).
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
   (core/lernbereiche/bereichsLernstand.ts), aber je einen eigenen Schlüssel.
   Geteilt werden die Regeln, nicht die Zahlen — siehe ADR-008. */

/** Zustand einer Lektion, immer aus dem Lernstand abgeleitet, nie aus den Daten. */
export type Lektionsstatus = 'done' | 'current' | 'open' | 'locked'

/**
 * Lernstand eines App-Bereichs (`bereichsLernstand.ts:17–25`, Konstante
 * `LEER`). Gilt für codeFortschritt, promptingFortschritt und
 * electroFortschritt gleichermaßen.
 *
 * Kein `serienSchutz`, obwohl die Serie hier mit derselben Funktion gerechnet
 * wird wie in der Sprach-App: `aktualisiereSerie()` liefert ihn mit, aber
 * `schliesseAb()` übernimmt ausdrücklich nur `serie` und `letzterTag`
 * (`:79–81`). Wer das zu `Object.assign(neu, serie)` zusammenzieht, legt ein
 * Feld an, das kein Leser kennt — und schreibt es in jeden Lernstand.
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

/**
 * So viel einer Lektion, wie der Baukasten wirklich liest. Die Aufrufer
 * reichen die vollen Datensätze aus `codeLessons.js`, `promptLessons.js` und
 * `electroLessons.js` durch — die tragen Titel, Dauer und Inhalt mit, aber
 * `statusFuer()` und `fortschrittProzent()` sehen davon nur die `id`.
 */
export interface Lektionskennung {
  id: string
}

/**
 * Was `erstelleBereichsLernstand(key)` zurückgibt
 * (`bereichsLernstand.ts:55–139`). Die drei dünnen Hüllen
 * `codeProgressStore.ts`, `electroProgressStore.ts` und
 * `promptProgressStore.ts` binden nur je einen Schlüssel daran und
 * exportieren nichts anderes — wer diese Form ändert, ändert alle drei Apps
 * zugleich.
 *
 * `stand()` reicht den Modul-Zwischenspeicher **selbst** heraus, keine Kopie
 * (`:31–42`). Wer das Ergebnis verändert, verändert stillschweigend den Stand
 * aller Leser, ohne dass etwas geschrieben oder gemeldet wird. Unter `src/`
 * ruft `stand()` heute niemand; nur `test/bereichsLernstand.test.js:50` liest
 * darüber `letzterTag`.
 */
export interface Bereichsbaukasten {
  stand(): Bereichslernstand
  istErledigt(lektionsId: string): boolean
  /**
   * XP gibt es nur beim ersten Mal; ein zweiter Abschluss derselben ID gibt
   * `0` zurück und schreibt nichts (`:69–84`). Ohne zweites Argument gilt
   * `XP_JE_LEKTION`; Übungen reichen `XP_JE_UEBUNG` mit
   * (`UebungModal.jsx:24`), Mitmach-Aufgaben `XP_JE_MITMACH`
   * (`PraxisAufgabe.jsx:45`).
   */
  schliesseAb(lektionsId: string, xp?: number): number
  xpHeute(): number
  /** `''`, wenn nichts notiert wurde — nie `undefined` (`:91`). */
  notiz(id: string): string
  /** Schreibt nur bei echter Änderung und gibt bewusst nichts zurück (`:95–100`). */
  setzeNotiz(id: string, text: string): void
  serie(): number
  /**
   * Der Rückgabewert enthält jede übergebene ID. Beim Nachschlagen liefert
   * `noUncheckedIndexedAccess` trotzdem `Lektionsstatus | undefined` —
   * `ElektroHeute.jsx:38` vergleicht deshalb direkt mit `'current'`, statt den
   * Wert weiterzureichen.
   */
  statusFuer(lektionen: readonly Lektionskennung[]): Record<string, Lektionsstatus>
  /** 0–100, gerundet. Eine leere Liste ergibt 0 statt `NaN` (`:133–138`). */
  fortschrittProzent(lektionen: readonly Lektionskennung[]): number
}

/* ===== Elektro-Lehre: Schule und Betrieb ===== */

/** Die Stände einer Prüfung (`PRUEFUNG_STATUS`, `schuleStore.ts:20`). */
export type Pruefungsstatus =
  | 'Nicht begonnen'
  | 'Am Lernen'
  | 'Wiederholen'
  | 'Bereit'
  | 'Erledigt'

/** Die Stände einer Berichtsheft-Woche (`BERICHT_STATUS`, `schuleStore.ts:21`). */
export type Berichtsstatus = 'Offen' | 'Geschrieben' | 'Kontrolliert' | 'Abgegeben'

/**
 * Ein Fach der Ausbildung.
 *
 * ACHTUNG, `lehrer`, `raum` und `tag` sind wahlfrei — und das ist kein
 * Randfall: **keines** der acht Startfächer aus `STANDARD_FAECHER`
 * (`schuleStore.ts:9–18`) trägt sie. Sie entstehen nur über
 * `fachHinzufuegen()`, das sie mit `''` vorbelegt (`:82–84`). Wer sie als
 * gesetzt annimmt, stolpert über genau die Fächer, die jeder Nutzer hat.
 */
export interface Schulfach {
  id: string
  name: string
  lehrer?: string
  raum?: string
  /** Wochentag als freier Text; kein Datum. */
  tag?: string
  /**
   * Wunschnote; `null`, wenn beim Anlegen keine genannt wurde. Die Oberfläche
   * hat kein Feld dafür — `NotenBereich.jsx:240` legt Fächer immer ohne an,
   * gesetzt ist sie also nur bei den acht Startfächern.
   */
  zielnote: number | null
}

/**
 * Eine Note. Liegt flach über allen Fächern; die Zuordnung steckt in `fachId`,
 * und `fachEntfernen()` lässt die Noten bewusst stehen (`schuleStore.ts:94–97`).
 *
 * ACHTUNG, zwei Felder sind **kein `number`**:
 * - `note` kommt roh aus dem Eingabefeld — `NotenBereich.jsx:46` reicht den
 *   Formularstand durch, dessen `note` mit `''` startet (`:33`). Auf der
 *   Platte liegt dort meist `'5'` oder `'4,5'`. Zahlen kommen ebenfalls vor
 *   (`sicherungRundlauf.test.js:73`, `elektroSchule.test.js:203`).
 * - `gewicht` ebenso: das Formular hält `'1'` als **String** (`:33`), und
 *   `gewicht || 1` lässt ihn durch (`schuleStore.ts:120`).
 * Gerechnet wird deshalb nie direkt, sondern über `zahl()`
 * (`notenRechnung.js:35`), das Komma und Punkt gleich behandelt. Wer hier
 * `number` verspricht, bringt die erste Zeile zum Absturz, die sich darauf
 * verlässt — und `durchschnitt()` würde eine Note nach der Migration wortlos
 * überspringen.
 *
 * `art` und `kommentar` legt der Store bei jedem Eintrag an, aber nichts füllt
 * sie: die Oberfläche kennt keine Eingabe dafür. Sie stehen als leere Strings
 * in jedem gespeicherten Eintrag.
 */
export interface Noteneintrag {
  id: string
  fachId: string
  note: string | number
  thema: string
  gewicht: string | number
  /** `JJJJ-MM-TT` aus `<input type="date">` oder `''`. */
  datum: string
  art: string
  kommentar: string
}

/**
 * Eine Prüfung.
 *
 * `status` steht als `string` und nicht als `Pruefungsstatus`: nur
 * `pruefungHinzufuegen()` prüft gegen die Liste (`schuleStore.ts:161`),
 * `pruefungAendern()` schreibt jedes Teilstück ungeprüft durch (`:168–171`),
 * und eine eingespielte Sicherungsdatei geht an beidem vorbei. Genau darauf
 * antwortet `TON[p.status] || 'neutral'` (`PruefungenBereich.jsx:66`) — diese
 * Absicherung darf beim Migrieren nicht wegfallen.
 */
export interface Pruefungseintrag {
  id: string
  titel: string
  /** `''`, wenn „— kein Fach —" gewählt wurde (`PruefungenBereich.jsx:122`). */
  fachId: string
  /** `JJJJ-MM-TT` oder `''`; ohne Datum fällt die Prüfung aus `naechstePruefung()`. */
  datum: string
  themen: string
  status: string
  /**
   * Wird bei jedem Anlegen geschrieben, aber **nirgends gelesen**: kein
   * Formular setzt sie, keine Anzeige zeigt sie. Sie bleibt in der Form, weil
   * sie in jedem gespeicherten Eintrag steht.
   */
  zielnote: number | null
}

/**
 * Eine Woche im Berichtsheft. Die neueste steht oben — `wocheHinzufuegen()`
 * legt vorne an (`schuleStore.ts:204`).
 *
 * `status` ist aus demselben Grund `string` wie bei der Prüfung:
 * `wocheAendern()` schreibt ungeprüft (`:208–211`), und
 * `BerichtsheftBereich.jsx:46` fängt das mit `TON[w.status] || 'neutral'` ab.
 */
export interface Berichtswoche {
  id: string
  /** Freier Text wie `KW 32`; `''`, wenn nur ein Zeitraum genannt wurde (`:197`). */
  woche: string
  von: string
  bis: string
  taetigkeiten: string
  gelernt: string
  status: string
}

/**
 * `red-kurd-electro-school-v1` — Schule und Betrieb der Elektro-Lehre
 * (`schuleStore.ts:23–30`). Der inhaltsreichste Speicher der drei neuen Apps:
 * echte Noten, echte Prüfungen, ein echtes Berichtsheft. Nichts davon lässt
 * sich aus Kursdaten wiederherstellen, deshalb ist er vollständig im Export.
 *
 * Die vier Listen sind auch dann Listen, wenn auf der Platte etwas anderes
 * steht: `laden()` prüft jede einzeln mit `Array.isArray` und ersetzt sie
 * sonst, ohne den Rest des Standes zu verwerfen (`:40–45`). `faecher` fällt
 * dabei auf `STANDARD_FAECHER` zurück und nicht auf `[]` — ohne Fächer gäbe es
 * keinen Ort für eine Note.
 *
 * Der Store hört nicht auf `beiFremdaenderung()` (STORAGE.md §6): ein zweiter
 * Tab arbeitet mit seinem alten Zwischenspeicher weiter. Das ist eine bekannte
 * Lücke, keine Aufgabe der Typ-Migration.
 */
export interface Elektroschulstand {
  version: 1
  /**
   * Id einer Notenskala (`SKALEN`, `notenRechnung.js:8`): `schweiz` oder
   * `deutschland`. Als `string` und nicht als Vereinigung, weil nichts sie
   * prüft — `setzeSkala()` schreibt jeden Wert durch (`:72–74`). Unbekanntes
   * fängt erst `holeSkala()` beim Rechnen mit dem Rückfall auf die Schweizer
   * Skala ab, und `skala()` deckt zusätzlich den leeren Wert ab (`:68–70`).
   */
  skala: string
  faecher: Schulfach[]
  /** Flach über alle Fächer, nicht je Fach gruppiert. */
  noten: Noteneintrag[]
  pruefungen: Pruefungseintrag[]
  /** Neueste Woche zuerst. */
  berichtsheft: Berichtswoche[]
}

/* ===== AI-Sprache: Werkstatt ===== */

/**
 * `red-kurd-prompting-workshop-v1` — was in der Werkstatt angefangen wurde
 * (`werkstattStore.ts:7`), damit ein Neuladen keine halbe Arbeit verwirft.
 *
 * Alle drei Teile sind **unvollständige** Karten, keine vollen Records: ein
 * Schlüssel entsteht erst beim ersten Tastendruck bzw. beim ersten Haken.
 * Deshalb steht überall `werte[feld.id] || ''` (`WerkstattFormular.jsx:58`,
 * `:66`) und `!!haken[punkt.id]` (`PrCheckliste.jsx:28`) — mit
 * `noUncheckedIndexedAccess` verlangt der Prüfer genau diese Absicherungen.
 *
 * Kaputt gespeicherte Teile ersetzt `laden()` einzeln durch `{}` (`:17–19`):
 * ein defekter Stand ergibt leere Formulare, keinen Absturz. Wie `schuleStore`
 * hört auch dieser Store nicht auf `beiFremdaenderung()` (STORAGE.md §6).
 */
export interface Werkstattstand {
  version: 1
  /** Feld-Id aus `AUFTRAG_FELDER` (`promptBaukasten.js:28`) → eingegebener Text. */
  auftrag: Record<string, string>
  /** Feld-Id aus `BUG_FELDER` (`promptBaukasten.js:114`) → eingegebener Text. */
  bug: Record<string, string>
  /**
   * Id aus `PR_CHECKLISTE` (`promptBaukasten.js:183`) → Haken. `schaltePr()`
   * schreibt `!alt[id]` und damit immer einen echten Boolean (`:59–62`);
   * abgewählte Haken bleiben als `false` stehen, statt zu verschwinden.
   */
  pr: Record<string, boolean>
}

/* ===== Code lernen: Fehlerbuch ===== */

/** Ein Eintrag im Fehlerbuch (`fehlerbuchStore.ts:38–44`). */
export interface Fehlereintrag {
  /** `f-<naechsteId>`. Der Zähler wird nie zurückgesetzt, Ids also nie wiederverwendet. */
  id: string
  /** Pflichtfeld, getrimmt — leere Einträge entstehen nicht (`:34–36`). */
  titel: string
  /** Pflichtfeld, getrimmt. */
  fehler: string
  /** In der Eingabe wahlfrei, im Eintrag immer vorhanden: `''`, wenn nichts kam. */
  loesung: string
  datum: Tagesschluessel
}

/**
 * `red-kurd-fehlerbuch-v1` — das Fehlerbuch von „Code lernen"
 * (`fehlerbuchStore.ts:7`). Neueste Einträge stehen oben; nichts wird je
 * aufgeräumt, es gibt keine Obergrenze.
 *
 * Anders als `schuleStore` prüft `laden()` die Liste nicht mit
 * `Array.isArray`, sondern spreizt sie: `[...(d.eintraege || [])]` (`:14`).
 * Ein fehlendes Feld ist damit abgedeckt, ein falsch geformtes nicht — steht
 * dort nach einem Import von Hand ein Objekt, wirft der Spread. Das ist eine
 * bestehende Abweichung, kein Auftrag dieser Migration: Sie gehört in einen
 * eigenen Schritt mit Test.
 */
export interface Fehlerbuchstand {
  version: 1
  /** Zähler für die nächste Id; wächst monoton, auch über gelöschte Einträge hinweg. */
  naechsteId: number
  eintraege: Fehlereintrag[]
}

/* ===== Wochenübersicht über alle vier Apps =====
   `core/lernbereiche/wochenUebersicht.ts` — reine Funktionen, kein Speicher.
   Die Formen stehen hier, weil die Übersicht die Tageswerte aller vier
   Lernstände liest und sie sonst an vier Stellen neu erfunden würden. */

/** Ein Tag des Siebenerbands, wie `wochenTage()` ihn liefert (`:23–34`). */
export interface Wochenbandtag {
  datum: Tagesschluessel
  /** Kurzform des Wochentags, z. B. `Mo`. */
  kurz: string
  heute: boolean
}

/**
 * Eine App, wie die Übersicht sie entgegennimmt (`Wochenuebersicht.jsx:11–40`).
 *
 * `tage` trägt bewusst `unknown` je Tag: die Sprach-App legt dort einen `Tag`
 * ab und nennt mit `feld` die Zahl darin, die drei neuen Apps legen die
 * Tages-XP direkt als Zahl ab. Ein migrierter v1-Tag der Sprach-App kann sogar
 * eine blanke Zahl sein (siehe `Tag`) — genau deshalb prüft `wertVon()`
 * `typeof === 'number'` **vor** dem Feldzugriff (`wochenUebersicht.ts:37–45`),
 * und `test/wochenUebersicht.test.js:66` reicht sogar `null` und `'viel'`
 * hinein. Ein engerer Typ wäre eine Zusage, die keiner der vier Lernstände
 * hält.
 *
 * Wer die Datei migriert, braucht für `eintrag[feld]` eine eigene
 * Objektprüfung im Stil von `istObjekt()` (`storage.ts:70`) — aus `unknown`
 * allein lässt sich nicht indizieren.
 */
export interface Wochenquelle {
  id: string
  name: string
  /** Einheit der Zahl, z. B. `Aufgaben` oder `XP`. Wird bewusst nie verrechnet. */
  einheit: string
  tage: Record<Tagesschluessel, unknown>
  /** Feld im Tageseintrag; fehlt es, gilt der Eintrag selbst als Zahl. */
  feld?: string
}

/** Eine App über die Woche, wie `appWoche()` sie liefert (`:52–63`). */
export interface Wochenappstand {
  id: string
  name: string
  einheit: string
  /** Sieben Werte, ältester zuerst — gleiche Reihenfolge wie `Wochenbild.tage`. */
  werte: number[]
  summe: number
  /** Tage mit einem Wert > 0. Ein Tag mit 0 Aufgaben zählt nicht als aktiv. */
  aktiveTage: number
  hoechster: number
}

/**
 * Was `wochenUebersicht()` zurückgibt (`:69–80`). Bewusst **ohne** Gesamtzahl:
 * Aufgaben und XP dürfen nie addiert werden, und
 * `test/wochenUebersicht.test.js:85` nagelt das fest.
 *
 * Alle drei Listen sind leer, wenn `heute` sich nicht als Datum lesen lässt —
 * `wochenTage()` gibt dann `[]` zurück (`:25`).
 */
export interface Wochenbild {
  tage: Wochenbandtag[]
  apps: Wochenappstand[]
  /** Je Tag: war in irgendeiner App etwas los? Gleiche Länge wie `tage`. */
  tageAktiv: boolean[]
  aktiveTage: number
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
