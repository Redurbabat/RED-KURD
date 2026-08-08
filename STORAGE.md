# Speicher-Referenz

Diese Datei beschreibt jeden Ort, an dem RED-KURD Daten über das Ende einer Sitzung hinaus behält — im Browser, auf dem Server und in der Cloud.

## 1 · Warum es diese Datei gibt

RED-KURD ist eine local-first App: Der Lernstand liegt auf dem Gerät, nicht auf einem Server. Die App läuft ohne Konto und ohne Netz vollständig. Das ist die Stärke des Projekts — und zugleich die Stelle mit dem größten Schadenspotenzial. Wer hier etwas falsch macht, löscht keine Kopie, sondern das Original.

Datenverlust ist der teuerste Fehler dieses Projekts. Ein defektes Layout fällt sofort auf und ist in zehn Minuten behoben. Ein Schlüssel, der beim Umbenennen nicht migriert wurde, kostet einer Nutzerin ihre Serie von 200 Tagen — und das merkt niemand, bis es zu spät ist.

Daraus folgt der Grundsatz dieser Datei: **jeder Speicherbereich braucht einen Eigentümer.** Genau ein Modul darf schreiben. Alle anderen lesen. Ohne benannten Eigentümer weiß beim nächsten Umbau niemand, wer für eine Migration zuständig ist, welche Felder wirklich benutzt werden und was ein Export enthalten muss.

Diese Datei ist die Antwort auf vier Fragen, die vor jeder Änderung an einem Speicher zu beantworten sind:

1. Wem gehört der Bereich, wer schreibt hinein?
2. Wie sieht der Inhalt genau aus, Feld für Feld?
3. Wandert er in die Sicherung, die Nutzer selbst herunterladen können?
4. Was passiert mit alten Daten, wenn sich das Format ändert?

Kontext: RED-KURD ist **eine** App — Deutsch nach Kurmancî. Sie hat drei Oberflächen-Modi (`modern`, `abenteuer`, `redlingo`) über **einem gemeinsamen Lernstand**. Daneben gibt es vier kleine Nebenkurse (Englisch, Französisch, Türkisch, Spanisch) mit **eigenem, getrenntem** Fortschritt. Diese Trennung ist die wichtigste Eigenschaft der ganzen Speicherlandschaft: ein Moduswechsel darf niemals Lernfortschritt kosten.

---

## 2 · Übersicht aller Bereiche

17 persistente Bereiche, davon zehn im `localStorage`, einer im `sessionStorage`, einer in IndexedDB, einer im Cache Storage, einer als Cookie und drei außerhalb des Browsers.

| # | Bereich | Technik | Schlüssel / Name | Eigentümer (schreibt) | Leser | `version`-Feld | Größenverhalten | Im Export? | Migration? |
|---|---------|---------|------------------|------------------------|-------|----------------|-----------------|------------|------------|
| 1 | Lernstand | localStorage | `red-kurd-progress-v2` | `src/core/progress/progressStore.js` | progressSelectors, courseRepository, shopStore, taskStore, achievementsStore, ~20 Seiten | ja, `version: 2` | größter Speicher; `karten` bis ~2 384 Einträge (596 Wörter × 4 Fertigkeiten) ≈ 200–250 KB; `tage` hart auf 60 Einträge begrenzt | ja, doppelt (`fortschritt` + `speicher.fortschritt`) | ja: v1→v2, dazu Kartenumbenennung |
| 2 | Lernprofil | localStorage | `red-kurd-profile-v2` | `src/core/profile/profileStore.js` — **plus Fremdzugriff**, siehe §4 | App, SideColumn, Onboarding, TodayPage, SessionPage, PracticeRunPage, ProgressPage, SettingsPage, Adventure-/Redlingo-Profil | ja, `version: 2` | < 300 B, konstant | ja, doppelt (`profil` + `speicher.profil`) | ja: v1→v2 |
| 3 | Oberfläche | localStorage | `red-kurd-ui-v1` | `src/core/ui/uiStore.js` | App, AppRouter, audioService, ProgressPage, SettingsPage | ja, `version: 2` — im **Wert**, während der Schlüsselname `v1` trägt | < 200 B, konstant | ja, doppelt (`ui` + `speicher.ui`) | ja: `red-kurd-modus` → UI; Wert-`version` < 2 → Theme `dark` |
| 4 | Laufende Sitzung | localStorage | `red-kurd-session-v2` | `src/core/session/sessionStore.js`, aufgerufen aus `ExercisePlayer.jsx:122` | SessionPage, TodayPage, RedlingoHomePage, ExercisePlayer | **nein** | 8–24 Übungen × ~250 B ≈ 2–6 KB; wird am Sitzungsende gelöscht | ja (nur `speicher.sitzung`) | ja: v1→v2 als 1:1-Kopie |
| 5 | Shop | localStorage | `red-kurd-shop-v1` | `src/core/shop/shopStore.js` | HeloMascot, ShopPage, AdventureProfilePage, ProgressPage, SettingsPage | ja, `version: 1` | < 300 B; höchstens 6 Artikel-IDs | ja, doppelt (`shop` + `speicher.shop`) | keine |
| 6 | Auszeichnungen | localStorage | `red-kurd-achievements-v1` | `src/core/achievements/achievementsStore.js` | AdventureProfilePage, RedlingoProfilePage | ja, `version: 1` | höchstens 9 Einträge ≈ 250 B | ja (`speicher.auszeichnungen`) | keine |
| 7 | Tages-/Wochenaufgaben | localStorage | `red-kurd-tasks-v1` | `src/core/tasks/taskStore.js` | App (Abzeichen), DailyTasksPage | ja, `version: 1` | höchstens 7 Marken + 2 Basiswerte ≈ 300 B; räumt sich beim Tages-/Wochenwechsel selbst auf | ja (`speicher.aufgaben`) | keine |
| 8 | Herzen (Abenteuer) | localStorage | `red-kurd-hearts-v1` | `src/core/hearts/heartsStore.js` | **niemand** — kein Modul importiert den Store | ja, `version: 1` | ~60 B; der Schlüssel entsteht derzeit nie | ja (`speicher.herzen`) | keine |
| 9 | Nebenkurs-Fortschritt | localStorage | `red-kurd-language-courses-v1` | `src/core/courses/languageCourseStore.js` | LanguagesPage, LanguageCoursePage, LanguageLessonPage | ja, `version: 1` | höchstens 40 Kapitel × ~90 B ≈ 4 KB | ja (`speicher.sprachkurse`) | keine |
| 10 | „Ohne Konto lernen" | localStorage | `red-kurd-ohne-konto-v1` | `src/app/App.jsx:148` | `App.jsx:138`, `SettingsPage.jsx:208` | **nein** (roher Boolean) | 4 B | **nein — bewusst ausgeschlossen** (`NUR_LOKAL`) | keine |
| 11 | Sitzungsdauer-Wahl | **sessionStorage** | `rk-dauer` | `src/modes/modern/pages/TodayPage.jsx:34` | `src/modes/modern/pages/SessionPage.jsx:20` | **nein** (roher String) | ~10 B, an den Tab gebunden | nein | keine |
| 12 | Eigene Sprachaufnahmen | **IndexedDB** | DB `red-kurd-audio` v1, Store `aufnahmen` | `src/core/audio/audioService.js`, aufgerufen aus `PronunciationStudio.jsx:137` | audioService (`spieleWort`), PronunciationStudio | **nein** — Version nur an der Datenbank, kein Feld im Datensatz | **unbegrenzt**: ein Audio-Blob je Wort, 20 KB bis 1 MB; kann alle anderen Bereiche zusammen um Größenordnungen übersteigen | **nein** | keine (`onupgradeneeded` legt nur den Store an) |
| 13 | App-Hülle offline | Cache Storage | `red-kurd-v2` | `public/sw.js` | Service Worker | Version steckt im Cachenamen | Build-Dateien plus alle besuchten Same-Origin-GETs; wächst mit der Nutzung | nein | ja: `activate` löscht jeden Cache ≠ `red-kurd-v2` |
| 14 | Anmelde-Sitzung | Cookie | `rk_session` | `sites/auth.js:99` (Cloudflare Worker) | nur der Server | nein | Token, wenige Bytes, `Max-Age` 30 Tage | nein (HttpOnly, für JS unsichtbar) | keine |
| 15 | Konten serverseitig | D1 / SQLite | `users`, `auth_sessions`, `auth_events` (`db/schema.ts`) | `sites/auth.js` | `sites/auth.js` | Drizzle-Migrationen unter `drizzle/` | wächst mit der Nutzerzahl | nein | ja (Drizzle) |
| 16 | Wörterbuch-Datenbank | SQLite-Datei | `local-data/private/red-kurd.db`, überschreibbar per `RED_KURD_DB` | extern (`audio-holen.py`, manuell) | `server.js` (`/api/suche` u. a.) | nein | statisch, ~840 k Einträge | nein | keine |
| 17 | Cloud-Daten | Cloudflare R2 | Binding `RED_KURD_DATA` | `sites/worker.js:128` (Upload mit Token) | `sites/worker.js:45–49` | nein | Uploads über `scripts/upload-cloud-data.mjs` | nein | keine |

### Alt-Schlüssel

Vier Schlüssel aus Version 1 werden nur noch **gelesen** (`ALT` in `src/core/storage.js:20`) und nach der Migration nie gelöscht:

`red-kurd-fortschritt-v1` · `red-kurd-profil-v1` · `red-kurd-session-v1` · `red-kurd-modus`

Sie stehen nicht in `KEYS` und sind damit auch nicht im Export. Dass sie liegen bleiben, ist Absicht (§6).

---

## 3 · Feldstrukturen

Die folgenden Abschnitte beschreiben jeden Bereich so genau, dass sich daraus TypeScript-Typen ableiten lassen. Alle Werte liegen JSON-kodiert im `localStorage`, gelesen und geschrieben über `lies()` / `schreibe()` in `src/core/storage.js`.

### 3.1 `red-kurd-progress-v2` — Lernstand

Quelle: `src/core/progress/progressStore.js:9–27` (Konstante `LEER`). Dies ist der eine, geteilte Lernstand aller drei Modi.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `2` | Schemaversion |
| `xp` | `number` | Gesamt-Erfahrungspunkte; Level = `floor(xp / 100) + 1` |
| `serie` | `number` | Lerntage in Folge |
| `letzterTag` | `string \| null` | `"JJJJ-MM-TT"`, letzter Lerntag in der Zeitzone des Geräts |
| `serienSchutz` | `number` (0–3) | Gekaufte automatische Schutztage für die Serie |
| `letzterSchutz` | `string \| null` | `"JJJJ-MM-TT"`, Tag des letzten verbrauchten Schutzes |
| `einheiten` | `Record<string, number>` | Bestes Ergebnis je Einheit in Prozent (0–100) |
| `sterne` | `Record<string, 0\|1\|2\|3>` | Sterne je Einheit; der dritte Stern erst ab dem zweiten bestandenen Lauf |
| `bestanden` | `Record<string, number>` | Anzahl Läufe ≥ 80 % je Einheit |
| `karten` | `Record<string, Karte>` | Wiederholsystem; Schlüssel `"de\|ku\|fertigkeit"` |
| `tage` | `Record<string, Tag>` | Tagesaktivität, Schlüssel `"JJJJ-MM-TT"`, hart auf 60 Einträge begrenzt (`progressStore.js:219–221`) |
| `edelsteine` | `number` | Weiche Währung; Belohnung aus Aufgaben und Truhen |
| `schluessel` | `number` | Harte Währung; öffnet Welttruhen |
| `zielBelohnt` | `string \| null` | Tag, an dem die Tagesziel-Belohnung abgeholt wurde |
| `truhe` | `string \| null` | Tag der zuletzt geöffneten Tagestruhe |
| `weltTruhen` | `Record<string, string>` | Welt-ID → `"JJJJ-MM-TT"`; liegt bewusst hier und nicht in einem eigenen Schlüssel, damit der Export sie mitnimmt |
| `lernzeit` | `number` | Lernsekunden insgesamt |

**`Karte`** (`src/core/progress/scheduler.js:50–66`) — vereinfachtes SM-2:

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `stufe` | `number` 0–6 | Wiederholstufe; Abstände `[1, 3, 7, 16, 35, 70]` Tage. Richtig → eine Stufe hoch, falsch → zurück auf 0. Ab Stufe 3 (`SICHER_AB`) gilt ein Wort als sicher. |
| `faellig` | `string` | `"JJJJ-MM-TT"`, nächster Fälligkeitstag |
| `gesehen` | `number` | Antwortversuche insgesamt |
| `richtig` | `number` | Davon richtig |

Der Schlüssel enthält die Fertigkeit, weil dieselbe Vokabel je Fertigkeit unterschiedlich sicher sitzt. Gültige Fertigkeiten: `erkennen`, `abrufen`, `schreiben`, `hoeren` (`scheduler.js:7`).

**`Tag`** (`progressStore.js:199`, Konstante `LEERER_TAG`):

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `aufgaben` | `number` | Gelöste Aufgaben an diesem Tag |
| `richtig` | `number` | Davon richtig |
| `sekunden` | `number` | Lernzeit des Tages |
| `skills` | `Record<string, number>` | Aufgaben je Fertigkeit |
| `folge` | `number` | Laufende Richtig-Serie |
| `maxFolge` | `number` | Beste Richtig-Serie des Tages |

### 3.2 `red-kurd-profile-v2` — Lernprofil

Quelle: `src/core/profile/profileStore.js:31–40` (Konstante `STANDARD`).

| Feld | Typ | Werte |
|------|-----|-------|
| `version` | `2` | Schemaversion |
| `name` | `string` | Frei wählbar, darf leer sein |
| `kenntnis` | `'neu' \| 'etwas' \| 'gespraech'` | Vorkenntnisse |
| `ziel` | `'familie' \| 'alltag' \| 'kultur' \| 'reise'` | Lernziel; Standard `'alltag'` |
| `minuten` | `'5' \| '10' \| '20'` | Wunschdauer als **String**; steuert `standardDauer()` |
| `tagesziel` | `10 \| 20 \| 30 \| 50` | Aufgaben pro Tag; Standard `20` |
| `variante` | `'kurmanci-standard' \| 'kurmanci-botan' \| 'kurmanci-serhed'` | Sprachvariante |
| `erstellt` | `string \| null` | ISO-Zeitstempel |

Besonderheit: Die **Existenz** dieses Schlüssels ist zugleich das Onboarding-Flag. `istEingerichtet()` prüft nichts weiter, als ob `holeProfil()` einen Wert liefert. Wer den Schlüssel löscht, startet das Onboarding neu.

### 3.3 `red-kurd-ui-v1` — Oberfläche

Quelle: `src/core/ui/uiStore.js:6–14`. Hier liegt ausschließlich die Darstellung, kein Lernstand.

| Feld | Typ | Wirkung |
|------|-----|---------|
| `version` | `2` | Werte < 2 lösen die einmalige Dark-Migration aus |
| `mode` | `'modern' \| 'abenteuer' \| 'redlingo'` | Oberflächen-Modus → `<html data-mode>`; unbekannte Werte fallen auf `'modern'` zurück |
| `theme` | `'light' \| 'dark' \| 'auto'` | → `<html data-theme>` und `meta[theme-color]`; Standard `'dark'` |
| `soundEnabled` | `boolean` | Gelesen von `audioService.tonAn()` |
| `animationsEnabled` | `boolean` | → `<html data-animations>`; steuert auch `document.startViewTransition` im Router |
| `remindersEnabled` | `boolean` | Erinnerungen |
| `preferredVariant` | `string` | Sprachvariante der Oberfläche |

### 3.4 `red-kurd-session-v2` — laufende Sitzung

Geschrieben von `src/core/session/sessionStore.js:6–9`, befüllt aus `src/features/exercise/ExercisePlayer.jsx:122`. **Ohne `version`-Feld** (§6).

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `titel` | `string` | Anzeigename, z. B. `"Heutige Mischung"` |
| `index` | `number` | Position in `uebungen`; eine beantwortete Aufgabe wird sofort als erledigt gesichert, damit ein Neuladen sie nicht doppelt wertet |
| `punkte` | `number` | Richtige Antworten bisher |
| `uebungen` | `Uebung[]` | 8, 14 oder 24 Einträge je nach gewählter Dauer |
| `gespeichert` | `string` | ISO-Zeitstempel, vom Store ergänzt |

**`Uebung`** — abgespeckt durch `schlank()` (`ExercisePlayer.jsx:70–78`), gesichert wird nur, was zum Fortsetzen nötig ist:

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `art` | `'wahl-ku' \| 'wahl-de' \| 'tippen' \| 'bild' \| 'hoeren'` | Aufgabenart; bestimmt die trainierte Fertigkeit |
| `frage` | `string` | Fragetext |
| `antwort` | `string` | Richtige Antwort |
| `optionen` | `string[]` | Auswahlmöglichkeiten (bei `tippen` leer) |
| `w` | `{ de: string, ku: string, bild?: string }` | Das Lernpaar; `bild` ist ein Emoji oder ein Fotopfad |

`sitzungLaden()` verwirft den Stand, wenn `uebungen` fehlt oder leer ist oder wenn `index >= uebungen.length`.

### 3.5 `red-kurd-shop-v1` — Shop

Quelle: `src/core/shop/shopStore.js:80`.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `gekauft` | `string[]` | Artikel-IDs; höchstens 6 |
| `aktiv` | `Record<'mascot'\|'thema'\|'klang'\|'rahmen', string \| null>` | Ausgerüsteter Artikel je Kategorie |

Verbrauchsartikel (`streak-schutz`, `schatzschluessel`) landen **nicht** in `gekauft`; ihre Wirkung wird direkt in den Lernstand gebucht. Der Shop verkauft ausschließlich Aussehen — Lerninhalte sind nie gesperrt.

### 3.6 `red-kurd-achievements-v1` — Auszeichnungen

Quelle: `src/core/achievements/achievementsStore.js`.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `erhalten` | `Record<string, string>` | Auszeichnungs-ID → `"JJJJ-MM-TT"` des Freischaltens |

Neun mögliche IDs: `erste-schritte`, `serie-3`, `wortsammler`, `wochen-lerner`, `buecherwurm`, `meisterschueler`, `hoerprofi`, `edelsteinjaeger`, `weltenbummler`. Ob eine Auszeichnung freigeschaltet ist, wird bei jedem Lesen **aus dem Lernstand berechnet**; gespeichert wird nur das Datum. Der Bereich ist damit vollständig aus Bereich 1 rekonstruierbar — bis auf die historischen Daten.

### 3.7 `red-kurd-tasks-v1` — Tages- und Wochenaufgaben

Quelle: `src/core/tasks/taskStore.js:10`.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `abgeholt` | `Record<string, string>` | Aufgaben-ID → Tag der abgeholten Belohnung. Präfix `t-` = täglich (`t-wdh`, `t-hoeren`, `t-einheit`, `t-serie`), `w-` = wöchentlich (`w-100`, `w-zeit`, `w-einheiten`) |
| `tag` | `string \| null` | Zuletzt gesehener Tag; ein Wechsel löscht alle `t-*` |
| `wochenStart` | `string \| null` | Montag der laufenden Woche; ein Wechsel löscht alle `w-*` |
| `basis` | `{ tagEinheiten?: number, wocheEinheiten?: number }` | Referenzwerte, um „heute abgeschlossene Einheiten" aus der Gesamtzahl abzuleiten |

Der Aufgabenfortschritt selbst wird nicht gespeichert, sondern aus dem Lernstand abgeleitet. So kann keine zweite Zählung auseinanderlaufen.

### 3.8 `red-kurd-hearts-v1` — Herzen

Quelle: `src/core/hearts/heartsStore.js:17`. Der Store hat derzeit keinen Aufrufer (§6).

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `herzen` | `number` 0–5 | Verbleibende Herzen |
| `zuletzt` | `number` | **Epoch-Millisekunden** (nicht ISO) als Anker der Regeneration; `0` bedeutet „voll" |

Ein Herz wächst je 4 Stunden nach. Die Regeneration wird bei jedem Lesen nachgerechnet und gegebenenfalls zurückgeschrieben. Herzen sperren keine Lerninhalte: bei 0 Herzen läuft eine Lektion als Übungslauf weiter, nur ohne Edelsteinbelohnung.

### 3.9 `red-kurd-language-courses-v1` — Nebenkurse

Quelle: `src/core/courses/languageCourseStore.js:6`. Dies ist der **einzige Fortschritt außerhalb von Bereich 1** und bewusst davon getrennt: Englisch, Französisch, Türkisch und Spanisch sind Nebenkurse, kein Teil des Kurmancî-Lernwegs. Sie speisen nur XP zurück und erzeugen keine Wiederholkarten.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `kapitel` | `Record<string, Kapitelstand>` | Schlüssel `"kursId/kapitelId"`; höchstens 40 Einträge (4 Kurse × 10 Kapitel) |
| `letzterKurs` | `string \| null` | Zuletzt bearbeiteter Kurs |

**`Kapitelstand`**:

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `prozent` | `number` 0–100 | Bestes Ergebnis; wird nur nach oben korrigiert |
| `versuche` | `number` | Anzahl Durchläufe |
| `abgeschlossen` | `boolean` | Ab 75 %; bleibt einmal gesetzt dauerhaft `true` |
| `zuletzt` | `string` | ISO-Zeitstempel des letzten Durchlaufs |

### 3.10 `red-kurd-ohne-konto-v1` — Entscheidung „ohne Konto lernen"

Roher Wert `true` (JSON, kein Objekt, kein `version`-Feld). Gesetzt in `src/app/App.jsx:148`, entfernt bei erfolgreicher Anmeldung (`App.jsx:143`, `:178`) und in `SettingsPage.jsx:184`, `:231`.

Über `NUR_LOKAL` (`storage.js:73`) **ausdrücklich aus Export und Import ausgenommen**. Grund: Das ist eine gerätelokale Entscheidung, kein Lernstand. Ein Import würde sonst die Anmeldeentscheidung eines fremden Geräts übernehmen.

### 3.11 `rk-dauer` (sessionStorage)

Roher String `'kurz' | 'standard' | 'intensiv'` — kein JSON, kein Wrapper, keine Version. Fehlt der Wert oder ist er unbekannt, greift `standardDauer()` aus dem Profil. Der Bereich verlässt den Tab nie und überlebt das Schließen nicht. Er geht am zentralen `storage.js` vorbei (§4).

### 3.12 IndexedDB `red-kurd-audio` / Store `aufnahmen`

Quelle: `src/core/audio/audioService.js:5–38`.

| Merkmal | Wert |
|---------|------|
| Datenbank | `red-kurd-audio`, Version `1` |
| Object Store | `aufnahmen`, **ohne `keyPath` und ohne `autoIncrement`** → Out-of-line Keys |
| Schlüssel | Das kurmancî Wort als String (`u.ku`), gesetzt in `PronunciationStudio.jsx:137` |
| Wert | `Blob` — die rohe MediaRecorder-Ausgabe |
| Metadaten | **keine** — kein Zeitstempel, kein Format, keine Version, keine Zuordnung zur Einheit |
| `onupgradeneeded` | Legt nur den Store an; es gibt keine Migrationslogik |

Dieser Bereich ist der einzige, der Inhalte enthält, die die Nutzerin selbst erzeugt hat und die nirgendwo sonst existieren — ihre eigene Stimme. Er ist zugleich der einzige ohne Export (§4, §6).

### 3.13 Sicherungsdatei `red-kurd-lernstand.json`

Erzeugt von `progressStore.exportiereAlles()` (`progressStore.js:302–315`), aufgerufen aus `ProgressPage.jsx:421` und `SettingsPage.jsx:726`.

```jsonc
{
  "version": 2,
  "app": "RED-KURD",
  "exportiert": "<ISO-Zeitstempel>",
  "fortschritt": { /* Bereich 1, vollständig */ },
  "speicher": {
    // exportiereSpeicherstand(): alle KEYS außer ohneKonto; null-Werte entfallen
    "profil": {}, "fortschritt": {}, "sitzung": {}, "ui": {}, "shop": {},
    "auszeichnungen": {}, "aufgaben": {}, "herzen": {}, "sprachkurse": {}
  },
  "profil": {}, "ui": {}, "shop": {}   // zusätzlich, redundant zu speicher.*
}
```

`fortschritt`, `profil`, `ui` und `shop` stehen doppelt in der Datei. Beim Import gewinnen die Felder auf oberster Ebene, weil sie **nach** `importiereSpeicherstand()` geschrieben werden (`ProgressPage.jsx:478–485`). Danach folgt zwingend ein `window.location.reload()`, weil `importiereSpeicherstand()` die Modul-Caches der übrigen Stores nicht leert.

Nicht in der Datei: IndexedDB-Aufnahmen, `rk-dauer`, `ohneKonto` (absichtlich), alle Alt-Schlüssel, Cache Storage und Cookie.

Daneben gibt es einen bewusst verlustbehafteten Zweitexport: `ankiZeilen()` (`progressStore.js:317`) erzeugt `red-kurd-anki.txt` mit eindeutigen `de⇥ku`-Paaren aus den Kartenschlüsseln — ohne Stufe und Fälligkeit, ohne Reimport.

---

## 4 · Speicher, die am zentralen `storage.js` vorbeigehen

`src/core/storage.js:2` formuliert die Regel: „Alle Stores lesen und schreiben ausschliesslich ueber diese Datei." An vier Stellen gilt sie nicht. Diese Stellen sind hier vollständig aufgeführt, damit niemand sie für Absicht hält.

### 4.1 Profil-Schlüssel als Literal in der Einstellungsseite

**Datei:** `src/modes/modern/pages/SettingsPage.jsx:32` und `:743`

```js
// Zeile 32
const PROFIL_SCHLUESSEL = 'red-kurd-profile-v2'

// Zeile 743, in onboardingNeu()
localStorage.removeItem(PROFIL_SCHLUESSEL)
```

**Warum das ein Problem ist:** Der Schlüsselname steht ein zweites Mal im Code, neben `KEYS.profil` in `storage.js:5`. Wird der Schlüssel je auf `-v3` gehoben, löscht „Onboarding neu durchlaufen" stillschweigend den falschen Schlüssel — der Nutzer klickt, nichts passiert, das Onboarding startet nicht. Es gibt keinen Test und keine Typprüfung, die das bemerkt. Erschwerend kommt hinzu, dass der Modul-Cache in `profileStore` nicht geleert wird; das fällt heute nur deshalb nicht auf, weil direkt danach `window.location.assign('/')` läuft.

**Was zu tun wäre:** `entferne(KEYS.profil)` benutzen. Die Datei importiert `KEYS` und `entferne` bereits in Zeile 21 — die Konstante in Zeile 32 kann ersatzlos entfallen. Zusätzlich sollte `profileStore` eine Funktion `loescheProfil()` anbieten, die Schlüssel und Cache gemeinsam räumt, damit der Aufrufer sich nicht auf das anschließende Neuladen verlassen muss.

### 4.2 und 4.3 Sitzungsdauer im sessionStorage

**Dateien:** `src/modes/modern/pages/TodayPage.jsx:29` (Konstante) und `:34` (Schreiben), `src/modes/modern/pages/SessionPage.jsx:14` (Konstante) und `:20` (Lesen)

```js
// TodayPage.jsx:29 und SessionPage.jsx:14 — zweimal dasselbe Literal
const SCHLUESSEL_DAUER = 'rk-dauer'

// TodayPage.jsx:34
window.sessionStorage.setItem(SCHLUESSEL_DAUER, id)

// SessionPage.jsx:20
const id = window.sessionStorage.getItem(SCHLUESSEL_DAUER)
```

**Warum das ein Problem ist:** Vier Abweichungen auf einmal. Erstens eine eigene Technik (`sessionStorage` statt `localStorage`) ohne dokumentierten Grund. Zweitens ein eigenes Namensschema (`rk-` statt `red-kurd-`), wodurch der Schlüssel durch den Filter in `src/core/store.js:42` fällt — die Cross-Tab-Synchronisation sieht ihn nie. Drittens steht das Literal in zwei Dateien, ohne gemeinsame Quelle. Viertens gibt es keinen Eigentümer: Zwei Seiten teilen sich einen Speicher direkt, ohne Modul dazwischen, das die erlaubten Werte kennt. Dass `SessionPage` gegen `DAUERN` validiert und `TodayPage` nicht, ist nur zufällig ungefährlich.

**Was zu tun wäre:** Ein winziger Store, etwa `src/core/session/dauerStore.js`, mit `merkeDauer(id)` und `gewaehlteDauer()`. Er kennt `DAUERN`, validiert an einer Stelle und fällt auf `standardDauer()` zurück. Ob er `sessionStorage` oder `localStorage` benutzt, ist dann eine Entscheidung an einem Ort statt an zweien. Wenn der Wert im `sessionStorage` bleibt, gehört das als Kommentar in den Store — tabgebunden ist hier vermutlich gewollt, damit zwei parallele Lernfenster sich nicht gegenseitig die Dauer umstellen.

### 4.4 IndexedDB im audioService

**Datei:** `src/core/audio/audioService.js:5–38`

```js
// Zeile 7
const r = indexedDB.open('red-kurd-audio', 1)
// Zeile 8
r.onupgradeneeded = () => r.result.createObjectStore('aufnahmen')
```

**Warum das ein Problem ist:** Dies ist kein Detail, sondern ein vollständiger zweiter Persistenzkanal neben `storage.js`. Er steht nicht in `KEYS`, ist nicht im Export, nicht im Import, kennt kein Zurücksetzen und keine Größenbegrenzung. Gleichzeitig ist es der einzige Bereich mit unersetzlichem Inhalt: Kursdaten lassen sich neu laden, XP wachsen nach, eine eigene Sprachaufnahme ist weg. Die Einstellungsseite verspricht „Sichere ihn deshalb ab und zu mit dem Export" — Aufnahmen sind davon nicht erfasst, was die Zusage stiller unterläuft, als es ein offener Fehler täte. Hinzu kommt: `loescheAufnahme()` existiert (`audioService.js:35`), hat aber keinen Aufrufer. Es gibt in der App keinen Weg, eine misslungene Aufnahme wieder loszuwerden.

**Was zu tun wäre:** Drei Schritte, in dieser Reihenfolge nach Dringlichkeit.
1. Den Text in der Einstellungsseite ehrlich machen: benennen, dass Aufnahmen nicht Teil des Exports sind.
2. `loescheAufnahme()` in der Oberfläche anbinden, damit Aufnahmen löschbar sind.
3. Die Aufnahmen in Export und Import aufnehmen — technisch als Base64 in einem eigenen Abschnitt der Sicherungsdatei, mit Warnung vor der Dateigröße, oder als getrennter Zweitexport. Weil `exportiereSpeicherstand()` synchron und IndexedDB asynchron ist, braucht das einen eigenen `async`-Pfad; das ist die eigentliche Arbeit daran.

### 4.5 Grenzfälle: formal korrekt, Eigentümer-Regel aufgeweicht

Diese Stellen laufen über `storage.js`, brechen aber die Erwartung, dass Lesen nicht schreibt. Sie sind bekannt, kommentiert und derzeit gewollt — aber sie sind Fallen für den nächsten Umbau:

- `src/core/ui/uiStore.js:25–28` — `holeUi()` ist ein Getter, der beim ersten Aufruf die Dark-Migration schreibt.
- `src/core/achievements/achievementsStore.js:114–118` — `holeAuszeichnungen()` schreibt während des React-Renderns; bewusst ohne `melden()`, sonst entsteht eine Renderschleife.
- `src/core/tasks/taskStore.js:39–60` — `pruefeTag()` schreibt während des Renderns, ebenfalls „still" (`sichern(neu, true)`).
- `src/core/storage.js:196` — `migriere()` liest `red-kurd-modus` mit rohem `localStorage.getItem`, weil der Altwert ein Klartext-String und kein JSON ist. Legitim, aber die einzige Stelle im Modul selbst, die an `lies()` vorbeigeht.

---

## 5 · Regeln für neue Speicher

Wer einen neuen persistenten Bereich anlegt, arbeitet diese fünf Punkte ab. Sie sind aus den Problemen in §4 und §6 abgeleitet.

**1. Eigentümer benennen.** Genau ein Modul unter `src/core/` schreibt. Alle anderen lesen über exportierte Funktionen dieses Moduls, nie über `lies()` mit einem Schlüssel-Literal. Eine Seite in `src/modes/` ist niemals Eigentümer eines Speichers — Seiten kommen und gehen, Speicher bleiben. Der Eigentümer gehört in die Tabelle in §2, bevor der Code gemergt wird.

**2. `version`-Feld von Anfang an.** Der Wert ist immer ein Objekt, nie ein roher Boolean oder String, und das erste Feld ist `version: 1`. Auch wenn es heute nichts zu migrieren gibt: Ohne Feld hat die erste Migration keinen Anknüpfungspunkt und muss am Inhalt raten. Die Version gehört in den **Wert**, nicht in den Schlüsselnamen — den Namen mitzuversionieren erzeugt beim Heben zwei Wahrheiten (siehe `red-kurd-ui-v1` mit `version: 2`).

**3. Über `storage.js`.** Schlüssel in `KEYS` eintragen, Zugriff ausschließlich über `lies()`, `schreibe()` und `entferne()`. Das gibt drei Dinge geschenkt: den Schutz vor privatem Modus und vollem Speicher (`schreibe()` gibt `false` zurück statt zu werfen), die Aufnahme in Export und Import, und die Cross-Tab-Synchronisation über den `red-kurd-`-Präfixfilter in `store.js:42`. Wer daran vorbeigeht, verliert alle drei — jede der vier Stellen in §4 belegt das.

**4. Export und Import mitdenken.** Die Entscheidung fällt beim Anlegen, nicht später:
- Enthält der Bereich Lernstand oder Nutzerinhalt, gehört er in den Export.
- Ist er eine gerätelokale Entscheidung (Anmeldung, Fensterzustand, gewählte Dauer), gehört er in `NUR_LOKAL` (`storage.js:73`) — **mit Kommentar, warum**.
- Ist er ein Cache, der sich neu berechnen lässt, gehört er weder in den Export noch nötigenfalls in den `localStorage`.

Beim Import ist zusätzlich der Modul-Cache zu leeren, sonst zeigt die App bis zum nächsten Neuladen alte Daten. Bis das gelöst ist, ist der `reload()` in `ProgressPage.jsx:485` Pflicht.

**5. Migration als reine Funktion.** Die Umformung von altem auf neues Format ist eine Funktion `(alt) => neu` ohne Zugriff auf `localStorage`, ohne `Date.now()` in der Kernlogik und ohne Seiteneffekte. Nur so ist sie mit `node:test` prüfbar — die Testumgebung hat kein DOM und keinen `localStorage`. `migriereKarten()` (`storage.js:110`) ist das Vorbild: sie nimmt ein Objekt, gibt ein Objekt zurück und meldet, wie viel sie geändert hat. `migriere()` ruft sie auf und kümmert sich allein um das Lesen und Schreiben.

Zusätzlich gilt: Migrationen **kopieren, sie verschieben nicht**. Der alte Schlüssel bleibt liegen, damit ein Rückschritt auf eine ältere App-Version nichts verliert. Und sie sind idempotent — `migriere()` sichert das über das Modulflag `migriert` (`storage.js:135`) und darüber, dass jeder Schritt nur läuft, wenn das Ziel `null` ist.

---

## 6 · Bekannte Lücken

Diese Punkte sind bekannt und stehen hier, damit sie nicht als Neuentdeckung wieder aufschlagen. Keiner davon ist heute ein akuter Fehler.

**Kein `version`-Feld bei `sitzung` und `ohneKonto`.** `red-kurd-session-v2` trägt die Version nur im Schlüsselnamen; der Inhalt hat kein Feld. Ändert sich der Aufbau von `Uebung`, gibt es keinen Weg, alte von neuen Ständen zu unterscheiden — die Migration müsste an der Feldform raten. `red-kurd-ohne-konto-v1` ist ein roher Boolean und damit gar nicht erweiterbar. Beides ist heute verkraftbar, weil eine laufende Sitzung notfalls verworfen werden kann und der Boolean nur eine Ja/Nein-Entscheidung trägt. Bei der nächsten Änderung an einem der beiden Bereiche gehört das Feld nachgezogen.

**IndexedDB nicht im Export.** Die eigenen Sprachaufnahmen (Bereich 12) sind der einzige Nutzerinhalt, der in keiner Sicherung landet — und der einzige, der nicht rekonstruierbar ist. Wer „Browserdaten löschen" wählt oder das Gerät wechselt, verliert ihn ersatzlos. Das ist die größte offene Lücke der Speicherlandschaft; siehe §4.4 für den Weg dorthin.

**Alt-Schlüssel bleiben liegen — bewusst.** `red-kurd-fortschritt-v1`, `red-kurd-profil-v1`, `red-kurd-session-v1` und `red-kurd-modus` werden von `migriere()` kopiert, nie gelöscht (Kommentar in `storage.js:133–134`). Der Preis ist ein paar hundert Kilobyte, die nie aufgeräumt werden und nicht im Export stehen. Der Gegenwert: Wer auf eine ältere App-Version zurückgeht, findet seinen Lernstand vor. Diese Abwägung ist bewusst so getroffen. Sie sollte erst kippen, wenn die Rückschrittmöglichkeit praktisch keine Rolle mehr spielt — und dann in einem eigenen, sichtbaren Schritt, nicht nebenbei.

**`heartsStore` ist tot.** `src/core/hearts/heartsStore.js` wird von keinem Modul importiert. `red-kurd-hearts-v1` entsteht dadurch nie, der Schlüssel steht aber in `KEYS`, im Export und im Import. Solange das so bleibt, führt die Datei ein Konzept mit, das die App nicht benutzt. Zwei saubere Auswege: den Store an den Abenteuer-Modus anbinden, wie ursprünglich gedacht, oder ihn samt `KEYS.herzen` entfernen. Was nicht geht: den Schlüssel aus `KEYS` nehmen und die Datei liegen lassen — dann bricht der Import älterer Sicherungen still an dieser Stelle ab, ohne dass es jemand merkt.

**Weitere kleinere Auffälligkeiten**, ohne Handlungsdruck:
- `red-kurd-ui-v1` trägt intern `version: 2`. Schlüsselname und Inhaltsversion sind entkoppelt (siehe Regel 2 in §5).
- Drei Namensschemata nebeneinander: `red-kurd-*` (localStorage), `rk-*` (sessionStorage), `rk_session` (Cookie).
- Es gibt keine Funktion, die alle `KEYS` löscht — kein globales Zurücksetzen. `achievementsStore.zuruecksetzen()` existiert ohne Aufrufer, `audioService.loescheAufnahme()` ebenfalls.
- Die laufende Sitzung ist im Export enthalten. Ein Import spielt damit eine halbfertige Übungsrunde eines anderen Geräts ein. Harmlos, weil `sitzungLaden()` unbrauchbare Stände verwirft, aber überraschend.
- `storage.js` selbst hat keine Tests, obwohl es der datenverlustkritischste Code des Projekts ist. `migriereKarten()` ist als reine Funktion exportiert und damit sofort testbar — das ist der naheliegende erste Test.

---

*Stand: 46 Tests grün (`npm test`), Build grün. Prüfbar mit `npm run typecheck`, `npm run lint`, `npm run check`.*
