# Speicher-Referenz

Diese Datei beschreibt jeden Ort, an dem RED-KURD Daten über das Ende einer Sitzung hinaus behält — im Browser, auf dem Server und in der Cloud.

## 1 · Warum es diese Datei gibt

RED-KURD ist eine local-first App: Der Lernstand liegt auf dem Gerät, nicht auf einem Server. Die App läuft ohne Konto und ohne Netz vollständig. Das ist die Stärke des Projekts — und zugleich die Stelle mit dem größten Schadenspotenzial. Wer hier etwas falsch macht, löscht keine Kopie, sondern das Original.

Datenverlust ist der teuerste Fehler dieses Projekts. Ein defektes Layout fällt sofort auf und ist in zehn Minuten behoben. Ein Schlüssel, der beim Umbenennen nicht migriert wurde, kostet einer Nutzerin ihre Serie von 200 Tagen — und das merkt niemand, bis es zu spät ist.

Daraus folgt der Grundsatz dieser Datei: **jeder Speicherbereich braucht einen Eigentümer.** Genau ein Modul darf schreiben. Alle anderen lesen. Ohne benannten Eigentümer weiß beim nächsten Umbau niemand, wer für eine Migration zuständig ist, welche Felder wirklich benutzt werden und was ein Export enthalten muss.

Diese Datei ist die Antwort auf fünf Fragen, die vor jeder Änderung an einem Speicher zu beantworten sind:

1. Zu welcher der vier Apps gehört der Bereich — oder gilt er für alle?
2. Wem gehört er, wer schreibt hinein?
3. Wie sieht der Inhalt genau aus, Feld für Feld?
4. Wandert er in die Sicherung, die Nutzer selbst herunterladen können?
5. Was passiert mit alten Daten, wenn sich das Format ändert?

### Kontext: vier Apps, drei Ansichten

RED-KURD ist seit den Pull Requests #5–#7 **kein einzelnes Lernprogramm mehr**. Unter einer Hülle liegen vier eigenständige Apps:

| App | `APP_MODES` | Einstiegskomponente | Eigener Lernstand |
|-----|-------------|---------------------|-------------------|
| Sprache lernen | `language` | `AppRouter` in `RouterProvider` | `red-kurd-progress-v2` |
| Code lernen | `code` | `CodeLearningHome.jsx` (lazy) | `red-kurd-code-progress-v1` |
| AI-Sprache | `prompting` | `PromptingApp.jsx` (lazy) | `red-kurd-prompting-progress-v1` |
| Elektro-Lehre | `electro` | `ElectroApp.jsx` (lazy) | `red-kurd-electro-progress-v1` |

Die Liste steht in `src/features/app-mode/appModes.js:5–35`. Umgeschaltet wird in `src/app/App.jsx:250–274`: **genau eine** App ist sichtbar, ausgewählt über den React-State `activeMode`, den `AppModeSwitcher` und `AppLauncher` setzen. Die Wahl liegt in `red-kurd-active-app-v1` und überlebt das Neuladen.

Wichtig für jede Speicherfrage: **die drei neuen Apps haben keine Routen.** `src/app/AppRouter.jsx` kennt ausschließlich Pfade der Sprach-App (`/today`, `/course/…`, `/adventure/…`, `/redlingo/…`). Code lernen, AI-Sprache und Elektro-Lehre werden in `App.jsx` **außerhalb** des `RouterProvider` gerendert; ihre Adresse ändert sich beim Bedienen nicht. Wer nach einem Speicher sucht, der zu einer Route gehört, findet für diese drei Apps nichts — ihr Zustand hängt ausschließlich am `localStorage`.

Innerhalb der Sprach-App gibt es drei **Ansichten** (`modern`, `abenteuer`, `redlingo`, umgeschaltet in `AnsichtSwitcher.jsx`) über **einem gemeinsamen Lernstand**. Ansichten sind keine Apps: sie teilen sich XP, Serie, Karten, Sterne und Einheiten vollständig. Die gewählte Ansicht liegt als `mode` im Bereich `red-kurd-ui-v1`, nicht in der App-Wahl.

Daraus folgt die Fortschrittslandschaft:

- **Ein** Lernstand für die Sprach-App über alle drei Ansichten (`red-kurd-progress-v2`).
- **Je ein eigener, getrennter** Lernstand für Code lernen, AI-Sprache und Elektro-Lehre — gleiche Struktur, verschiedene Schlüssel, gebaut aus derselben Fabrik `erstelleBereichsLernstand()` (`src/core/lernbereiche/bereichsLernstand.js:28`).
- **Getrennt** davon die vier kleinen Nebenkurse der Sprach-App (Englisch, Französisch, Türkisch, Spanisch) in `red-kurd-language-courses-v1`.

Nichts davon wird zusammengerechnet. Die Wochenübersicht (`src/core/lernbereiche/wochenUebersicht.js`) zeigt bewusst je App eine eigene Zahl mit eigener Einheit — die Sprach-App zählt gelöste Aufgaben, die anderen drei zählen XP. Ein App- oder Ansichtswechsel darf niemals Lernfortschritt kosten; das ist die wichtigste Eigenschaft der ganzen Speicherlandschaft.

---

## 2 · Übersicht aller Bereiche

26 persistente Bereiche: **18 im `localStorage`** (alle in `KEYS`, `src/core/storage.js:4–32`), einer im `sessionStorage`, einer in IndexedDB, zwei im Cache Storage, einer als Cookie und drei außerhalb des Browsers.

| # | Bereich | Technik | Schlüssel / Name | Eigentümer (schreibt) | Leser | `version`-Feld | Größenverhalten | Im Export? | Migration? |
|---|---------|---------|------------------|------------------------|-------|----------------|-----------------|------------|------------|
Spalte „App": zu welcher der vier Apps der Bereich gehört; „—" heißt appübergreifend.

| # | Bereich | App | Technik | Schlüssel / Name | Eigentümer (schreibt) | Leser | `version`-Feld | Größenverhalten | Im Export? | Migration? |
|---|---------|-----|---------|------------------|------------------------|-------|----------------|-----------------|------------|------------|
| 1 | Lernstand Sprache | Sprache | localStorage | `red-kurd-progress-v2` | `src/core/progress/progressStore.js` | progressSelectors, courseRepository, shopStore, taskStore, achievementsStore, Wochenübersicht, ~20 Seiten | ja, `version: 2` | größter Speicher; `karten` bis ~2 384 Einträge (596 Wörter × 4 Fertigkeiten) ≈ 200–250 KB; `tage` hart auf 60 Einträge begrenzt (`progressStore.js:219–221`) | ja, **einfach** (nur top-level `fortschritt`) | ja: v1→v2, dazu Kartenumbenennung |
| 2 | Lernprofil | Sprache | localStorage | `red-kurd-profile-v2` | `src/core/profile/profileStore.js` | App, SideColumn, Onboarding, TodayPage, SessionPage, PracticeRunPage, ProgressPage, SettingsPage, Adventure-/Redlingo-Profil | ja, `version: 2` | < 300 B, konstant | ja, doppelt (`profil` + `speicher.profil`) | ja: v1→v2 |
| 3 | Oberfläche + Ansicht | Sprache | localStorage | `red-kurd-ui-v1` | `src/core/ui/uiStore.js` | App, AppRouter, AnsichtSwitcher, appModeStorage, audioService, ProgressPage, SettingsPage | ja, `version: 2` — im **Wert**, während der Schlüsselname `v1` trägt | < 200 B, konstant | ja, doppelt (`ui` + `speicher.ui`) | ja: `red-kurd-modus` → UI; Wert-`version` < 2 → Theme `dark` |
| 4 | Laufende Sitzung | Sprache | localStorage | `red-kurd-session-v2` | `src/core/session/sessionStore.js`, aufgerufen aus `ExercisePlayer.jsx:122` | SessionPage, TodayPage, RedlingoHomePage, ExercisePlayer | **nein** | 8–24 Übungen × ~250 B ≈ 2–6 KB; wird am Sitzungsende gelöscht | **nein — bewusst ausgeschlossen** (`NUR_LOKAL`, `storage.js:169`) | ja: v1→v2 als 1:1-Kopie |
| 5 | Shop | Sprache | localStorage | `red-kurd-shop-v1` | `src/core/shop/shopStore.js` | HeloMascot, ShopPage, AdventureProfilePage, ProgressPage, SettingsPage | ja, `version: 1` | < 300 B; höchstens 6 Artikel-IDs | ja, doppelt (`shop` + `speicher.shop`) | keine |
| 6 | Auszeichnungen | Sprache | localStorage | `red-kurd-achievements-v1` | `src/core/achievements/achievementsStore.js` | AdventureProfilePage, RedlingoProfilePage | ja, `version: 1` | höchstens 9 Einträge ≈ 250 B | ja (`speicher.auszeichnungen`) | keine |
| 7 | Tages-/Wochenaufgaben | Sprache | localStorage | `red-kurd-tasks-v1` | `src/core/tasks/taskStore.js` | App (Abzeichen), DailyTasksPage | ja, `version: 1` | höchstens 7 Marken + 2 Basiswerte ≈ 300 B; räumt sich beim Tages-/Wochenwechsel selbst auf | ja (`speicher.aufgaben`) | keine |
| 8 | Herzen (Abenteuer) | Sprache | localStorage | `red-kurd-hearts-v1` | `src/core/hearts/heartsStore.js` | **niemand in `src/`** — nur `test/heartsStore.test.js` importiert den Store | ja, `version: 1` | ~60 B; der Schlüssel entsteht im Betrieb nie | ja (`speicher.herzen`) | keine |
| 9 | Nebenkurs-Fortschritt | Sprache | localStorage | `red-kurd-language-courses-v1` | `src/core/courses/languageCourseStore.js` | LanguagesPage, LanguageCoursePage, LanguageLessonPage | ja, `version: 1` | höchstens 40 Kapitel × ~90 B ≈ 4 KB | ja (`speicher.sprachkurse`) | keine |
| 10 | Aktive App | — | localStorage | `red-kurd-active-app-v1` | `src/features/app-mode/appModeStorage.js:56` | `App.jsx:155` (`loadAppMode`), `App.jsx:158` (`hatGespeicherteApp`) | **nein** (roher String: `language`/`code`/`prompting`/`electro`) | < 20 B | ja (`speicher.appAktiv`) | ja: aus `appBereich`; Altwert `adventure`/`abenteuer` → App `language` + Ansicht `abenteuer` |
| 11 | Aktive App (Alt-Schlüssel) | — | localStorage | `red-kurd-active-app-mode-v1` | `src/features/app-mode/appModeStorage.js:57` — wird **weiter mitgeschrieben** | `appModeStorage.js:28`, `:44` als Rückfallebene | **nein** (roher String) | < 20 B | ja (`speicher.appBereich`) | entfällt — er ist selbst die Rückfallebene |
| 12 | Lernstand Code lernen | Code | localStorage | `red-kurd-code-progress-v1` | `src/features/code-learning/codeProgressStore.js` → `erstelleBereichsLernstand()` | CodeLearningHome, CodeLearningPath, CodeLearningProgress, LektionPlayer, UebungModal, PraxisAufgabe, Wochenübersicht | ja, `version: 1` | `erledigt` höchstens 78 IDs (43 Lektionen + 6 Übungen + 29 Mitmach-Aufgaben) ≈ 3 KB; `notizen` **unbegrenzt** (freier Text, auch Code); `tage` **ohne Obergrenze** | ja (`speicher.codeFortschritt`) | keine |
| 13 | Fehlerbuch | Code | localStorage | `red-kurd-fehlerbuch-v1` | `src/features/code-learning/fehlerbuchStore.js` | `Fehlerbuch.jsx` | ja, `version: 1` | **unbegrenzt** — Einträge mit freiem Text, kein Limit, keine Aufräumung | ja (`speicher.fehlerbuch`) | keine |
| 14 | Lernstand AI-Sprache | AI-Sprache | localStorage | `red-kurd-prompting-progress-v1` | `src/features/prompting-learning/promptProgressStore.js` → `erstelleBereichsLernstand()` | PromptingApp, PromptingLearningHome, LektionPlayer, UebungModal, PraxisAufgabe, Wochenübersicht | ja, `version: 1` | `erledigt` höchstens 19 IDs (10 Lektionen + 6 Übungen + 3 Mitmach-Aufgaben); `notizen` unbegrenzt; `tage` ohne Obergrenze | ja (`speicher.promptingFortschritt`) | keine |
| 15 | Werkstatt | AI-Sprache | localStorage | `red-kurd-prompting-workshop-v1` | `src/core/prompting/werkstattStore.js` | PromptingApp, PrCheckliste | ja, `version: 1` | drei Objekte mit freiem Text (Auftrag, Bug-Report, PR-Haken); typisch < 5 KB, nach oben offen | ja (`speicher.promptingWerkstatt`) | keine |
| 16 | Lernstand Elektro-Lehre | Elektro | localStorage | `red-kurd-electro-progress-v1` | `src/features/electro-learning/electroProgressStore.js` → `erstelleBereichsLernstand()` | ElectroApp, ElectroLearningHome, ElektroHeute, LektionModal, UebungModal, PraxisAufgabe, Wochenübersicht | ja, `version: 1` | `erledigt` höchstens 27 IDs (11 Lektionen + 6 Übungen + 10 Rechenaufgaben); `notizen` unbegrenzt; `tage` ohne Obergrenze | ja (`speicher.electroFortschritt`) | keine |
| 17 | Schule und Betrieb | Elektro | localStorage | `red-kurd-electro-school-v1` | `src/core/elektro/schuleStore.js` | ElectroApp, ElektroHeute, NotenBereich, PruefungenBereich, BerichtsheftBereich | ja, `version: 1` | **unbegrenzt** — Fächer, Noten, Prüfungen und Berichtsheft wachsen mit der Ausbildung; nichts wird je gelöscht | ja (`speicher.electroSchule`) | keine |
| 18 | „Ohne Konto lernen" | — | localStorage | `red-kurd-ohne-konto-v1` | `src/app/App.jsx:199` | `App.jsx:189`, `SettingsPage.jsx:211` | **nein** (roher Boolean) | 4 B | **nein — bewusst ausgeschlossen** (`NUR_LOKAL`, `storage.js:169`) | keine |
| 19 | Sitzungsdauer-Wahl | Sprache | **sessionStorage** | `red-kurd-tab-dauer` (`TAB_KEYS.dauer`) | `TodayPage.jsx:33` über `schreibeTab()` | `SessionPage.jsx:19` über `liesTab()` | **nein** (roher String) | ~10 B, an den Tab gebunden | nein — `TAB_KEYS` steht bewusst nicht in `KEYS` | keine |
| 20 | Eigene Sprachaufnahmen | Sprache | **IndexedDB** | DB `red-kurd-audio` v1, Store `aufnahmen` | `src/core/audio/audioService.js`, aufgerufen aus `PronunciationStudio.jsx:137` | audioService (`spieleWort`), PronunciationStudio | **nein** — Version nur an der Datenbank, kein Feld im Datensatz | **unbegrenzt**: ein Audio-Blob je Wort, 20 KB bis 1 MB; kann alle anderen Bereiche zusammen um Größenordnungen übersteigen | **nein** | keine (`onupgradeneeded` legt nur den Store an) |
| 21 | App-Hülle offline | — | Cache Storage | `red-kurd-v3` | `public/sw.js` | Service Worker | Version steckt im Cachenamen (`VERSION = 'v3'`) | Build-Dateien plus alle besuchten Same-Origin-GETs; wächst mit der Nutzung | nein | ja: `activate` löscht jeden Cache außer `red-kurd-v3` und `red-kurd-medien-v3` |
| 22 | Medien offline | — | Cache Storage | `red-kurd-medien-v3` | `public/sw.js:101` | Service Worker | Version im Cachenamen | Fotos, Audio und Kursdaten unter `/bilder/`, `/audio/`, `/daten/`; hart auf 150 Einträge begrenzt (`MEDIEN_LIMIT`, älteste fliegen zuerst) | nein | wie 21 |
| 23 | Anmelde-Sitzung | — | Cookie | `rk_session` | `sites/auth.js:99` (Cloudflare Worker) | nur der Server | nein | Token, wenige Bytes, `Max-Age` 30 Tage | nein (HttpOnly, für JS unsichtbar) | keine |
| 24 | Konten serverseitig | — | D1 / SQLite | `users`, `auth_sessions`, `auth_events` (`db/schema.ts`) | `sites/auth.js` | `sites/auth.js` | Drizzle-Migrationen unter `drizzle/` | wächst mit der Nutzerzahl | nein | ja (Drizzle) |
| 25 | Wörterbuch-Datenbank | Sprache | SQLite-Datei | `local-data/private/red-kurd.db`, überschreibbar per `RED_KURD_DB` | extern (`audio-holen.py`, manuell) | `server.js` (`/api/suche` u. a.) | nein | statisch, ~840 k Einträge | nein | keine |
| 26 | Cloud-Daten | — | Cloudflare R2 | Binding `RED_KURD_DATA` | `sites/worker.js:128` (Upload mit Token) | `sites/worker.js:45–49` | nein | Uploads über `scripts/upload-cloud-data.mjs` | nein | keine |

### Hat jede App einen eigenen Fortschritt — und ist er gesichert?

| App | Eigener Fortschritt? | Welche Bereiche | In der Sicherungsdatei? |
|-----|----------------------|-----------------|--------------------------|
| Sprache lernen | ja — **einer** für alle drei Ansichten (Modern, Abenteuer, Redlingo) | 1, plus 2, 4–9 als Beiwerk | ja, bis auf die laufende Sitzung (4) |
| Code lernen | ja, eigener Schlüssel, unabhängig von der Sprach-App | 12 (Lernstand) + 13 (Fehlerbuch) | ja, beide vollständig |
| AI-Sprache | ja, eigener Schlüssel | 14 (Lernstand) + 15 (Werkstatt) | ja, beide vollständig |
| Elektro-Lehre | ja, eigener Schlüssel | 16 (Lernstand) + 17 (Noten, Prüfungen, Berichtsheft) | ja, beide vollständig |

Der Rundlauf über alle vier Apps — füllen, exportieren, Gerät leeren, importieren — ist in `test/sicherungRundlauf.test.js` als Test festgehalten.

### Alt-Schlüssel

Vier Schlüssel aus Version 1 werden nur noch **gelesen** (`ALT` in `src/core/storage.js:35–40`) und nach der Migration nie gelöscht:

`red-kurd-fortschritt-v1` · `red-kurd-profil-v1` · `red-kurd-session-v1` · `red-kurd-modus`

Sie stehen nicht in `KEYS` und sind damit auch nicht im Export. Dass sie liegen bleiben, ist Absicht (§6).

Ein Sonderfall ist `red-kurd-active-app-mode-v1` (Bereich 11): Er ist ebenfalls ein Alt-Schlüssel, steht aber in `KEYS` und wird bei jedem Speichern **weiter mitgeschrieben** — damit ein Rücksprung auf eine ältere App-Version die zuletzt geöffnete App noch findet.

Daneben kann `lies()` unter `<schlüssel>-defekt` einen Rohtext ablegen, wenn ein gespeicherter Wert sich nicht mehr als JSON lesen lässt (`storage.js:69–78`). Diese Rettungskopien stehen nicht in `KEYS`, sind nicht im Export und werden nie aufgeräumt. Sie entstehen nur im Schadensfall.

---

## 3 · Feldstrukturen

Die folgenden Abschnitte beschreiben jeden Bereich so genau, dass sich daraus TypeScript-Typen ableiten lassen. Die Abschnitte 3.1 bis 3.15 beschreiben `localStorage`-Bereiche: Alle Werte liegen dort JSON-kodiert, gelesen und geschrieben über `lies()` / `schreibe()` in `src/core/storage.js`. Danach folgen der `sessionStorage` (3.16), IndexedDB (3.17) und die Sicherungsdatei (3.18); die Bereiche außerhalb des Browsers stehen nur in der Übersicht in §2.

Reihenfolge und Nummern der Abschnitte folgen der Tabelle in §2.

### 3.1 `red-kurd-progress-v2` — Lernstand der Sprach-App

Quelle: `src/core/progress/progressStore.js:9–27` (Konstante `LEER`). Dies ist der eine, geteilte Lernstand aller drei **Ansichten** der Sprach-App. Die Lernstände der drei anderen Apps liegen getrennt davon (§3.11).

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

Das betrifft alle vier Apps: `App.jsx:237–239` zeigt das Onboarding **vor** der App-Auswahl. Der Inhalt des Profils ist rein sprachbezogen (Lernziel, Sprachvariante, Wunschdauer), aber ohne Profil kommt niemand in Code lernen, AI-Sprache oder Elektro-Lehre. Das ist heute so gewollt; wer die drei neuen Apps je ohne Sprachprofil zugänglich machen will, muss diese Reihenfolge ändern, nicht den Speicher.

### 3.3 `red-kurd-ui-v1` — Oberfläche und Ansicht der Sprach-App

Quelle: `src/core/ui/uiStore.js:6–14`. Hier liegt ausschließlich die Darstellung, kein Lernstand.

| Feld | Typ | Wirkung |
|------|-----|---------|
| `version` | `2` | Werte < 2 lösen die einmalige Dark-Migration aus |
| `mode` | `'modern' \| 'abenteuer' \| 'redlingo'` | **Ansicht der Sprach-App** → `<html data-mode>`; unbekannte Werte fallen auf `'modern'` zurück |
| `theme` | `'light' \| 'dark' \| 'auto'` | → `<html data-theme>` und `meta[theme-color]`; Standard `'dark'` |
| `soundEnabled` | `boolean` | Gelesen von `audioService.tonAn()` |
| `animationsEnabled` | `boolean` | → `<html data-animations>`; steuert auch `document.startViewTransition` im Router |
| `remindersEnabled` | `boolean` | Erinnerungen |
| `preferredVariant` | `string` | Sprachvariante der Oberfläche |

`mode` und die App-Wahl (§3.10) sind zwei verschiedene Dinge und dürfen nicht verwechselt werden: `mode` entscheidet, **wie** die Sprach-App aussieht (Modern, Abenteuer, Redlingo — alle auf demselben Lernstand); `red-kurd-active-app-v1` entscheidet, **welche der vier Apps** überhaupt sichtbar ist. Solange eine andere App als „Sprache lernen" offen ist, hat `mode` keine Wirkung. Geschrieben wird `mode` von `AnsichtSwitcher.jsx:34`, dem Ansichtswechsel in `App.jsx:86` und — als Migration eines Altwerts — von `appModeStorage.js:30`.

### 3.4 `red-kurd-session-v2` — laufende Sitzung

Geschrieben von `src/core/session/sessionStore.js:6–9`, befüllt aus `src/features/exercise/ExercisePlayer.jsx:122`. **Ohne `version`-Feld** (§6). Steht seit der Aufnahme in `NUR_LOKAL` **nicht mehr in der Sicherungsdatei** (§3.18).

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

Quelle: `src/core/courses/languageCourseStore.js:6`. Dieser Fortschritt gehört zur Sprach-App, ist aber bewusst von Bereich 1 getrennt: Englisch, Französisch, Türkisch und Spanisch sind Nebenkurse, kein Teil des Kurmancî-Lernwegs. Sie speisen nur XP zurück und erzeugen keine Wiederholkarten. (Die drei anderen Apps haben ihren eigenen Fortschritt, §3.11 — mit einem anderen Aufbau als hier.)

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

### 3.10 `red-kurd-active-app-v1` und `red-kurd-active-app-mode-v1` — welche App offen ist

Eigentümer: `src/features/app-mode/appModeStorage.js`. Beide Werte sind **rohe Strings**, kein Objekt, kein `version`-Feld:

`'language'` · `'code'` · `'prompting'` · `'electro'` (`APP_MODES` in `appModes.js:5–10`)

`saveAppMode()` schreibt **beide** Schlüssel (`appModeStorage.js:56–57`); der Rückgabewert stammt vom neuen. `loadAppMode()` liest den neuen zuerst, fällt auf den alten zurück und schreibt den alten Wert dabei in den neuen Schlüssel um. Unbekannte Werte fallen auf `'language'` zurück — ein kaputter Eintrag kann die App also nie unbenutzbar machen.

Ein Sonderfall ist in `istAbenteuerAltwert()` (`appModeStorage.js:20–22`) festgehalten: Die Werte `'adventure'` und `'abenteuer'` stammen aus der Zeit, als Abenteuer noch als eigener Bereich galt. Sie werden zu „App `language` + Ansicht `abenteuer`" umgeschrieben, indem `setzeAppModus('abenteuer')` in den UI-Bereich (§3.3) schreibt und die App auf `language` gesetzt wird.

`hatGespeicherteApp()` entscheidet, ob beim Start die App-Auswahl (`AppLauncher`) erscheint oder direkt die zuletzt genutzte App. Wer beide Schlüssel löscht, bekommt die Auswahl wieder — Lernstand geht dabei keiner verloren.

Beide Schlüssel stehen **im Export**. Eine eingespielte Sicherung bestimmt damit auch, welche App sich nach dem Neuladen öffnet. Das ist keine gerätelokale Entscheidung wie „ohne Konto lernen", sondern eine Vorliebe, die mitwandern soll.

### 3.11 Lernstand der Bereiche — Code lernen, AI-Sprache, Elektro-Lehre

Drei Schlüssel, **eine** Struktur. Quelle: `src/core/lernbereiche/bereichsLernstand.js:17–25` (Konstante `LEER`); `erstelleBereichsLernstand(key)` bindet sie an einen Schlüssel.

| App | Schlüssel | Bindende Datei |
|-----|-----------|----------------|
| Code lernen | `red-kurd-code-progress-v1` | `src/features/code-learning/codeProgressStore.js` |
| AI-Sprache | `red-kurd-prompting-progress-v1` | `src/features/prompting-learning/promptProgressStore.js` |
| Elektro-Lehre | `red-kurd-electro-progress-v1` | `src/features/electro-learning/electroProgressStore.js` |

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `erledigt` | `Record<string, string>` | Lektions-/Übungs-ID → `"JJJJ-MM-TT"` des Abschlusses. Der Status jeder Lektion wird **immer** hieraus abgeleitet, nie aus den Datendateien |
| `notizen` | `Record<string, string>` | Eigene Lösung oder Notiz je Übung — **selbstgeschriebener Nutzerinhalt**, freier Text bis hin zu ganzem HTML/CSS-Code |
| `xp` | `number` | Erfahrungspunkte dieser App; wird **nicht** mit der Sprach-App verrechnet |
| `serie` | `number` | Lerntage in Folge — je App eine eigene Serie |
| `letzterTag` | `string \| null` | `"JJJJ-MM-TT"`, letzter aktiver Tag |
| `tage` | `Record<string, number>` | Tag → an diesem Tag verdiente XP; Grundlage für „XP heute" und für die Wochenübersicht |

XP-Sätze (`bereichsLernstand.js:13–14`, `PraxisAufgabe.jsx:16`): 10 XP je Lektion, 15 XP je Übung, 20 XP je Mitmach-Aufgabe. XP gibt es **nur beim ersten Abschluss**; ein zweiter Abschluss derselben ID ist ein stilles Nichts (`schliesseAb()` gibt dann `0` zurück).

Zwei Eigenschaften unterscheiden diese Bereiche vom Sprach-Lernstand und sind beim nächsten Umbau zu beachten:

- `tage` hat **keine Obergrenze**. Der Sprach-Lernstand kappt hart bei 60 Einträgen (`progressStore.js:219–221`), hier wächst die Liste um einen Eintrag je aktivem Tag und wird nie aufgeräumt. Bei ~20 B je Eintrag ist das über Jahre unkritisch, aber es ist unbegrenzt.
- `notizen` ist der einzige Nutzerinhalt der neuen Apps, der nicht aus den Kursdaten rekonstruierbar ist. Er ist im Export enthalten — anders als die Sprachaufnahmen (§3.17).

Wie viele IDs in `erledigt` höchstens landen können, ergibt sich aus dem heutigen Inhalt: Code lernen 78 (43 Lektionen in 7 Pfaden, 6 Übungen, 29 Mitmach-Aufgaben, davon 12 Grundübungen), AI-Sprache 19 (10 + 6 + 3), Elektro-Lehre 27 (11 + 6 + 10).

### 3.12 `red-kurd-fehlerbuch-v1` — Fehlerbuch (Code lernen)

Quelle: `src/features/code-learning/fehlerbuchStore.js:7`. Eigene Fehler, ihre Lösung und das Gelernte — neueste Einträge stehen oben.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `naechsteId` | `number` | Zähler für die nächste ID; IDs haben die Form `f-<n>` |
| `eintraege` | `Eintrag[]` | Absteigend nach Anlagezeit |

**`Eintrag`**:

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `id` | `string` | `"f-1"`, `"f-2"`, … |
| `titel` | `string` | Pflichtfeld, getrimmt |
| `fehler` | `string` | Pflichtfeld — was schiefging |
| `loesung` | `string` | Optional |
| `datum` | `string` | `"JJJJ-MM-TT"` aus `heute()` |

`fehlerNotieren()` gibt `null` zurück, wenn Titel oder Fehlerbeschreibung leer sind — leere Einträge entstehen nicht. Der Bereich hat keine Obergrenze und räumt sich nicht auf; er ist reiner, selbst geschriebener Nutzerinhalt und deshalb vollständig im Export.

### 3.13 `red-kurd-prompting-workshop-v1` — Werkstatt (AI-Sprache)

Quelle: `src/core/prompting/werkstattStore.js:7`. Hält fest, was in der Werkstatt angefangen wurde, damit ein Neuladen keine halbe Arbeit verwirft.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `auftrag` | `Record<string, string>` | Felder des Auftrag-Baukastens; Feldname → eingegebener Text |
| `bug` | `Record<string, string>` | Felder des Bug-Reports |
| `pr` | `Record<string, boolean>` | Haken der PR-Checkliste; ID → gesetzt ja/nein |

Alle drei Teilobjekte werden beim Laden auf ein echtes Objekt normalisiert (`werkstattStore.js:17–19`) — ein kaputter Stand ergibt leere Formulare, keinen Absturz. `leereAuftrag()`, `leereBug()` und `leerePr()` setzen je einen Teil zurück; ein gemeinsames Zurücksetzen gibt es nicht.

### 3.14 `red-kurd-electro-school-v1` — Schule und Betrieb (Elektro-Lehre)

Quelle: `src/core/elektro/schuleStore.js:23–30`. Der inhaltsreichste der neuen Bereiche: Fächer, Noten, Prüfungen und Berichtsheft einer laufenden Ausbildung.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `version` | `1` | Schemaversion |
| `skala` | `string` | Notenskala, Standard `STANDARD_SKALA` aus `notenRechnung.js` |
| `faecher` | `Fach[]` | Startbestand sind 8 Fächer (`STANDARD_FAECHER`), änderbar und erweiterbar |
| `noten` | `Note[]` | Flache Liste über alle Fächer |
| `pruefungen` | `Pruefung[]` | Anstehende und erledigte Prüfungen |
| `berichtsheft` | `Woche[]` | Wocheneinträge, neueste oben |

**`Fach`**: `id`, `name`, `lehrer`, `raum`, `tag`, `zielnote`.
**`Note`**: `id`, `fachId`, `note`, `thema`, `gewicht` (Standard 1), `datum`, `art`, `kommentar`.
**`Pruefung`**: `id`, `titel`, `fachId`, `datum`, `themen`, `status` aus `PRUEFUNG_STATUS` (`Nicht begonnen`, `Am Lernen`, `Wiederholen`, `Bereit`, `Erledigt`), `zielnote`.
**`Woche`**: `id`, `woche`, `von`, `bis`, `taetigkeiten`, `gelernt`, `status` aus `BERICHT_STATUS` (`Offen`, `Geschrieben`, `Kontrolliert`, `Abgegeben`).

IDs entstehen in `neueId()` (`schuleStore.js:59–62`) aus Präfix, Zeitstempel und einem Modulzähler — ohne Zufall, damit zwei Einträge in derselben Millisekunde nicht kollidieren.

Zwei bewusste Entscheidungen: `fachEntfernen()` löscht **nur das Fach**, seine Noten bleiben in der Liste stehen (`schuleStore.js:94–97`); und fehlende oder kaputte Listen starten leer, während der Rest des Standes erhalten bleibt (`:40–45`). Berechnungen — Fachschnitt, Gesamtschnitt, nächste Prüfung, offene Wochen — liegen im Store, nicht in der Oberfläche.

Dieser Bereich ist Nutzerinhalt, der nirgendwo sonst existiert: echte Noten und ein echtes Berichtsheft. Er ist vollständig im Export.

### 3.15 `red-kurd-ohne-konto-v1` — Entscheidung „ohne Konto lernen"

Roher Wert `true` (JSON, kein Objekt, kein `version`-Feld). Gesetzt in `src/app/App.jsx:199`, entfernt bei erfolgreicher Anmeldung (`App.jsx:194`, `:229`) und in `SettingsPage.jsx:187`, `:234`.

Über `NUR_LOKAL` (`storage.js:169`) **ausdrücklich aus Export und Import ausgenommen**. Grund: Das ist eine gerätelokale Entscheidung, kein Lernstand. Ein Import würde sonst die Anmeldeentscheidung eines fremden Geräts übernehmen.

### 3.16 `red-kurd-tab-dauer` (sessionStorage)

Roher String `'kurz' | 'standard' | 'intensiv'` — kein JSON, kein Wrapper, keine Version. Fehlt der Wert oder ist er unbekannt, greift `standardDauer()` aus dem Profil (`SessionPage.jsx:18–22`).

Der Schlüssel steht in `TAB_KEYS` (`storage.js:128–130`) und wird über `liesTab()` / `schreibeTab()` gelesen und geschrieben — er geht also **nicht mehr** am zentralen `storage.js` vorbei. `TAB_KEYS` ist bewusst von `KEYS` getrennt: Der Wert überlebt den Tab nicht und gehört in keine Sicherung.

### 3.17 IndexedDB `red-kurd-audio` / Store `aufnahmen`

Quelle: `src/core/audio/audioService.js:5–38`.

| Merkmal | Wert |
|---------|------|
| Datenbank | `red-kurd-audio`, Version `1` |
| Object Store | `aufnahmen`, **ohne `keyPath` und ohne `autoIncrement`** → Out-of-line Keys |
| Schlüssel | Das kurmancî Wort als String (`u.ku`), gesetzt in `PronunciationStudio.jsx:137` |
| Wert | `Blob` — die rohe MediaRecorder-Ausgabe |
| Metadaten | **keine** — kein Zeitstempel, kein Format, keine Version, keine Zuordnung zur Einheit |
| `onupgradeneeded` | Legt nur den Store an; es gibt keine Migrationslogik |

Dieser Bereich ist der einzige Nutzerinhalt, der in keiner Sicherung landet — die eigene Stimme. Die selbst geschriebenen Inhalte der neuen Apps (Notizen, Fehlerbuch, Werkstatt, Noten und Berichtsheft) sind im Export enthalten; die Aufnahmen sind es nicht (§4, §6).

### 3.18 Sicherungsdatei `red-kurd-lernstand.json`

Erzeugt von `progressStore.exportiereAlles()` (`progressStore.js:318–335`), aufgerufen aus `ProgressPage.jsx:422` und `SettingsPage.jsx:729`.

```jsonc
{
  "version": 2,
  "app": "RED-KURD",
  "exportiert": "<ISO-Zeitstempel>",
  "fortschritt": { /* Bereich 1, vollständig — steht NUR hier */ },
  "speicher": {
    // exportiereSpeicherstand() minus fortschritt; null-Werte entfallen.
    // Sprache:
    "profil": {}, "ui": {}, "shop": {}, "auszeichnungen": {},
    "aufgaben": {}, "herzen": {}, "sprachkurse": {},
    // App-Wahl:
    "appAktiv": "code", "appBereich": "code",
    // Code lernen:
    "codeFortschritt": {}, "fehlerbuch": {},
    // AI-Sprache:
    "promptingFortschritt": {}, "promptingWerkstatt": {},
    // Elektro-Lehre:
    "electroFortschritt": {}, "electroSchule": {}
  },
  "profil": {}, "ui": {}, "shop": {}   // zusätzlich, redundant zu speicher.*
}
```

**Der Lernstand steht nur noch einmal in der Datei.** `exportiereAlles()` schneidet `fortschritt` aus dem `speicher`-Block heraus (`progressStore.js:322`), weil die Kopie den größten Teil der Datei verdoppelte und vom Modul-Cache abweichen konnte. Ältere Sicherungsdateien *mit* der Kopie bleiben importierbar.

Doppelt stehen weiterhin `profil`, `ui` und `shop` — sie werden von den beiden Aufrufern als `extra` auf oberster Ebene ergänzt. Beim Import gewinnen die Felder auf oberster Ebene, weil sie **nach** `importiereSpeicherstand()` geschrieben werden (`ProgressPage.jsx:481–488`). Danach folgt zwingend ein `window.location.reload()`, weil `importiereSpeicherstand()` die Modul-Caches der übrigen Stores nicht leert.

**`NUR_LOKAL` enthält jetzt zwei Bereiche** (`storage.js:169`):

```js
const NUR_LOKAL = new Set(['ohneKonto', 'sitzung'])
```

- `ohneKonto` — eine Anmelde-Entscheidung *dieses* Geräts. Ein Import darf sie nicht von einem fremden Gerät übernehmen.
- `sitzung` — **neu ausgeschlossen.** Die laufende Übungsrunde ist flüchtig. Wanderte sie mit, würde ein Import auf dem neuen Gerät eine halb fertige, veraltete Sitzung wiederbeleben. Das ist der bewusst gewählte Preis: Wer mitten in einer Runde exportiert und die Datei auf einem anderen Gerät einspielt, beginnt dort mit einer frischen Runde. Der Lernstand selbst ist davon nicht betroffen — beantwortete Aufgaben sind längst in Bereich 1 gebucht.

Beide Namen sind in `exportiereSpeicherstand()` und in `importiereSpeicherstand()` ausgenommen: ein alter Export, der `sitzung` noch enthält, wird beim Einspielen **still übergangen**, nicht geschrieben.

Nicht in der Datei: IndexedDB-Aufnahmen (§3.17), `red-kurd-tab-dauer`, `ohneKonto` und `sitzung` (beide absichtlich), alle Alt-Schlüssel außer `appBereich`, Cache Storage und Cookie.

Daneben gibt es einen bewusst verlustbehafteten Zweitexport: `ankiZeilen()` (`progressStore.js:337`) erzeugt `red-kurd-anki.txt` mit eindeutigen `de⇥ku`-Paaren aus den Kartenschlüsseln — ohne Stufe und Fälligkeit, ohne Reimport.

---

## 4 · Speicher, die am zentralen `storage.js` vorbeigehen

`src/core/storage.js:1–2` formuliert die Regel: „Alle Stores lesen und schreiben ausschliesslich ueber diese Datei."

Stand heute gilt sie **an genau einer Stelle nicht**: dem `audioService`, der über IndexedDB einen eigenen Persistenzkanal aufmacht. Ein `grep` nach `localStorage` und `sessionStorage` über `src/` findet außerhalb von `storage.js` selbst keinen einzigen Zugriff mehr — die verbleibenden Treffer sind Kommentare und der Lektionstext in `codeLessons.js`, der `localStorage` erklärt.

Zwei der ursprünglich hier beschriebenen vier Abweichungen sind inzwischen behoben. Sie bleiben mit dem Vermerk „behoben" stehen, weil sonst beim nächsten Umbau dieselbe Abkürzung wieder genommen wird.

### 4.1 Behoben: Profil-Schlüssel als Literal in der Einstellungsseite

`SettingsPage.jsx` löschte das Profil früher mit `localStorage.removeItem('red-kurd-profile-v2')` — der Schlüsselname stand ein zweites Mal im Code. `onboardingNeu()` benutzt jetzt `entferne(KEYS.profil)` (`SettingsPage.jsx:742`).

**Was übrig bleibt:** Direkt darunter steht `entferne(ALT_PROFIL_SCHLUESSEL)` (`:746`) mit der Konstante `const ALT_PROFIL_SCHLUESSEL = 'red-kurd-profil-v1'` (`:32`). Der Zugriff läuft korrekt über `storage.js`, aber der Name des Alt-Schlüssels steht doppelt: hier und in `ALT` in `storage.js:37`. Der Grund für das Löschen ist gut und im Code begründet — bliebe das v1-Profil liegen, stellte `migriere()` es beim Neustart sofort wieder her und das Onboarding erschiene nie. Sauberer wäre, `ALT` aus `storage.js` zu exportieren oder eine Funktion `loescheProfil()` in `profileStore` anzubieten, die Schlüssel, Alt-Schlüssel und Modul-Cache gemeinsam räumt.

### 4.2 Behoben: Sitzungsdauer im sessionStorage

Der Wert lag früher als `rk-dauer` unter einem eigenen Namensschema und wurde von zwei Seiten direkt über `window.sessionStorage` gelesen und geschrieben. Er heißt jetzt `red-kurd-tab-dauer`, steht in `TAB_KEYS` (`storage.js:128–130`) und wird ausschließlich über `liesTab()` / `schreibeTab()` benutzt (`TodayPage.jsx:33`, `SessionPage.jsx:19`).

`TAB_KEYS` ist bewusst von `KEYS` getrennt und im Code begründet (`storage.js:122–127`): tabgebundene Werte überleben den Tab nicht und wandern nie in eine Sicherung. Damit ist die frühere Kritik beantwortet — die Wahl `sessionStorage` ist jetzt eine dokumentierte Entscheidung an einer Stelle statt eine unerklärte Abweichung an zweien.

Was offen bleibt: Die erlaubten Werte kennt weiterhin nur `SessionPage` (Prüfung gegen `DAUERN`), `TodayPage` schreibt ungeprüft. Das ist harmlos, weil ein unbekannter Wert beim Lesen auf `standardDauer()` fällt, aber die Validierung gehört auf eine Seite.

### 4.3 Bestehend: IndexedDB im audioService

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

### 4.4 Bringen die neuen Apps neue Umgehungen mit?

**Keine echte.** Alle vier neuen Bereichsspeicher gehen über `storage.js`, alle stehen in `KEYS`, alle sind im Export. `appModeStorage.js:1–3` begründet das sogar ausdrücklich im Kopfkommentar. Drei Punkte sind trotzdem festzuhalten, weil sie die Regeln aus §5 dehnen:

**Zwei Eigentümer liegen nicht unter `src/core/`.** `codeProgressStore.js`, `promptProgressStore.js` und `electroProgressStore.js` liegen unter `src/features/…/` — sie sind allerdings nur zweizeilige Bindungen an die Fabrik in `src/core/lernbereiche/bereichsLernstand.js`, die Logik steht im Kern. `fehlerbuchStore.js` ist der echte Ausreißer: ein vollständiger Store mit eigenem Cache und eigener Schreiblogik unter `src/features/code-learning/`. Regel 1 in §5 verlangt `src/core/`, weil Feature-Ordner umgebaut und umbenannt werden, Speicher aber bleiben. Ein Verschieben nach `src/core/` wäre die naheliegende Aufräumarbeit; die Eigentümerschaft selbst ist eindeutig, es liest niemand sonst den Schlüssel.

**Die Wochenübersicht liest vier fremde Speicher direkt.** `src/features/app-mode/Wochenuebersicht.jsx:12–37` holt sich die Tageswerte aller vier Apps mit `lies(KEYS.fortschritt)`, `lies(KEYS.codeFortschritt)`, `lies(KEYS.promptingFortschritt)` und `lies(KEYS.electroFortschritt)` — statt über die vier Eigentümer-Module. Das läuft über `storage.js` und ist damit keine Umgehung im technischen Sinn, aber es überspringt die Normalisierung der Stores: Fehlende oder kaputte Werte werden hier mit `|| {}` selbst abgefangen. Ändert je ein Store den Ort seiner Tageswerte, muss diese Datei mitgezogen werden, ohne dass ein Import es erzwingt. Sauberer wäre eine Funktion `tageswerte()` je Lernstand, die die Übersicht aufruft.

**`saveAppMode()` schreibt zwei Schlüssel.** `appModeStorage.js:56–57` beschreibt bei jedem App-Wechsel `appAktiv` *und* `appBereich`. Das ist Absicht und kommentiert (Rücksprung auf ältere Versionen), aber es ist die einzige Stelle im Projekt, an der ein Vorgang zwei `KEYS`-Einträge gleichzeitig pflegt. Der Rückgabewert stammt nur vom ersten Schreibvorgang.

### 4.5 Grenzfälle: formal korrekt, Eigentümer-Regel aufgeweicht

Diese Stellen laufen über `storage.js`, brechen aber die Erwartung, dass Lesen nicht schreibt. Sie sind bekannt, kommentiert und derzeit gewollt — aber sie sind Fallen für den nächsten Umbau:

- `src/core/ui/uiStore.js:25–28` — `holeUi()` ist ein Getter, der beim ersten Aufruf die Dark-Migration schreibt.
- `src/core/achievements/achievementsStore.js:114–118` — `holeAuszeichnungen()` schreibt während des React-Renderns; bewusst ohne `melden()`, sonst entsteht eine Renderschleife.
- `src/core/tasks/taskStore.js:39–60` — `pruefeTag()` schreibt während des Renderns, ebenfalls „still" (`sichern(neu, true)`).
- `src/features/app-mode/appModeStorage.js:25–39` — `loadAppMode()` heißt wie ein Getter, schreibt aber: Es hebt den Altwert in `appAktiv` und schreibt bei einem Abenteuer-Altwert zusätzlich in den UI-Bereich. Das ist eine Migration im Lesepfad und läuft bei jedem App-Start.
- `src/core/storage.js:296` — `migriere()` liest `red-kurd-modus` mit rohem `localStorage.getItem`, weil der Altwert ein Klartext-String und kein JSON ist. Legitim, aber die einzige Stelle im Modul selbst, die an `lies()` vorbeigeht.

---

## 5 · Regeln für neue Speicher

Wer einen neuen persistenten Bereich anlegt, arbeitet diese fünf Punkte ab. Sie sind aus den Problemen in §4 und §6 abgeleitet.

**1. Eigentümer benennen.** Genau ein Modul unter `src/core/` schreibt. Alle anderen lesen über exportierte Funktionen dieses Moduls, nie über `lies()` mit einem Schlüssel. Eine Seite in `src/modes/` ist niemals Eigentümer eines Speichers — Seiten kommen und gehen, Speicher bleiben. Für die vier Apps gilt dasselbe: Ein Feature-Ordner unter `src/features/` darf einen Speicher benutzen und an einen Schlüssel binden, aber die Schreiblogik gehört in den Kern (siehe `bereichsLernstand.js` als Vorbild und `fehlerbuchStore.js` als Gegenbeispiel, §4.4). Der Eigentümer gehört in die Tabelle in §2, bevor der Code gemergt wird.

**2. `version`-Feld von Anfang an.** Der Wert ist immer ein Objekt, nie ein roher Boolean oder String, und das erste Feld ist `version: 1`. Auch wenn es heute nichts zu migrieren gibt: Ohne Feld hat die erste Migration keinen Anknüpfungspunkt und muss am Inhalt raten. Die Version gehört in den **Wert**, nicht in den Schlüsselnamen — den Namen mitzuversionieren erzeugt beim Heben zwei Wahrheiten (siehe `red-kurd-ui-v1` mit `version: 2`).

**3. Über `storage.js`.** Schlüssel in `KEYS` eintragen, Zugriff ausschließlich über `lies()`, `schreibe()` und `entferne()`. Das gibt drei Dinge geschenkt: den Schutz vor privatem Modus und vollem Speicher (`schreibe()` gibt `false` zurück statt zu werfen), die Aufnahme in Export und Import, und die Cross-Tab-Synchronisation über den `red-kurd-`-Präfixfilter in `store.js:42`. Wer daran vorbeigeht, verliert alle drei — der `audioService` in §4.3 belegt das. Für tabgebundene Werte gibt es `TAB_KEYS` mit `liesTab()` / `schreibeTab()`; sie stehen bewusst außerhalb von `KEYS`.

Den dritten Punkt muss ein neuer Store zusätzlich selbst abholen: `beiFremdaenderung()` aus `store.js` abonnieren und dabei den eigenen Cache leeren. Sonst arbeitet ein zweiter Tab weiter mit alten Daten und überschreibt beim nächsten Speichern, was der erste geschrieben hat (siehe §6).

**4. Export und Import mitdenken.** Die Entscheidung fällt beim Anlegen, nicht später:
- Enthält der Bereich Lernstand oder Nutzerinhalt, gehört er in den Export. Das gilt für jede App gleich — ein neuer Bereich in einer der vier Apps ist keine Ausnahme.
- Ist er eine gerätelokale oder flüchtige Größe (Anmeldung, laufende Sitzung, Fensterzustand), gehört er in `NUR_LOKAL` (`storage.js:169`) — **mit Kommentar, warum**. Dort stehen heute `ohneKonto` und `sitzung`.
- Ist er ein Cache, der sich neu berechnen lässt, gehört er weder in den Export noch nötigenfalls in den `localStorage`.

Beim Import ist zusätzlich der Modul-Cache zu leeren, sonst zeigt die App bis zum nächsten Neuladen alte Daten. Bis das gelöst ist, ist der `reload()` in `ProgressPage.jsx:488` Pflicht. Wer einen Bereich hinzufügt, erweitert `test/sicherungRundlauf.test.js` mit — dieser Test ist die einzige Stelle, die einen vergessenen Bereich im Export tatsächlich bemerkt.

**5. Migration als reine Funktion.** Die Umformung von altem auf neues Format ist eine Funktion `(alt) => neu` ohne Zugriff auf `localStorage`, ohne `Date.now()` in der Kernlogik und ohne Seiteneffekte. Nur so ist sie mit `node:test` prüfbar — die Testumgebung hat kein DOM und keinen `localStorage`. `migriereKarten()` (`storage.js:213`) ist das Vorbild: sie nimmt ein Objekt, gibt ein Objekt zurück und meldet, wie viel sie geändert hat. `migriere()` ruft sie auf und kümmert sich allein um das Lesen und Schreiben.

Zusätzlich gilt: Migrationen **kopieren, sie verschieben nicht**. Der alte Schlüssel bleibt liegen, damit ein Rückschritt auf eine ältere App-Version nichts verliert. `appModeStorage.js` geht noch einen Schritt weiter und schreibt den alten Schlüssel dauerhaft mit — das ist die strengere Auslegung derselben Regel. Und Migrationen sind idempotent: `migriere()` sichert das über das Modulflag `migriert` (`storage.js:235`) und darüber, dass jeder Schritt nur läuft, wenn das Ziel `null` ist.

---

## 6 · Bekannte Lücken

Diese Punkte sind bekannt und stehen hier, damit sie nicht als Neuentdeckung wieder aufschlagen. Keiner davon ist heute ein akuter Fehler.

**Zwei neue Stores hören nicht auf Änderungen aus anderen Tabs.** `src/core/elektro/schuleStore.js` und `src/core/prompting/werkstattStore.js` importieren nur `melden` aus `store.js`, nicht `beiFremdaenderung`. Beide halten aber einen Modul-Cache. Wer die Elektro-Lehre in zwei Tabs offen hat und in Tab A eine Note einträgt, arbeitet Tab B weiter mit dem alten Stand — und überschreibt die neue Note beim nächsten Speichern. Alle anderen Stores, einschließlich `bereichsLernstand` (`:51–53`) und `fehlerbuchStore` (`:58–60`), melden sich korrekt an. Das ist die konkreteste Datenverlustlücke der neuen Apps und mit drei Zeilen je Datei behoben.

**Kein `version`-Feld bei `sitzung`, `ohneKonto` und der App-Wahl.** `red-kurd-session-v2` trägt die Version nur im Schlüsselnamen; der Inhalt hat kein Feld. Ändert sich der Aufbau von `Uebung`, gibt es keinen Weg, alte von neuen Ständen zu unterscheiden. `red-kurd-ohne-konto-v1` ist ein roher Boolean, `red-kurd-active-app-v1` und `red-kurd-active-app-mode-v1` sind rohe Strings — alle drei sind nicht erweiterbar. Heute verkraftbar: Eine laufende Sitzung darf notfalls verworfen werden, und die anderen tragen eine einzige Entscheidung, die im Zweifel auf einen Standard zurückfällt. Bei der nächsten Änderung an einem dieser Bereiche gehört das Feld nachgezogen.

**`tage` wächst in den neuen Apps unbegrenzt.** Der Sprach-Lernstand kappt hart bei 60 Einträgen; `bereichsLernstand` tut das nicht (§3.11). Kein akutes Problem — ein Eintrag ist etwa 20 B —, aber es ist die einzige Stelle in der Speicherlandschaft, an der eine Struktur ohne Obergrenze mit der Zeit wächst, ohne dass jemand sie je ansieht.

**IndexedDB nicht im Export.** Die eigenen Sprachaufnahmen (Bereich 20) sind der einzige Nutzerinhalt, der in keiner Sicherung landet — und der einzige, der nicht rekonstruierbar ist. Wer „Browserdaten löschen" wählt oder das Gerät wechselt, verliert ihn ersatzlos. Das ist die größte offene Lücke der Speicherlandschaft; siehe §4.3 für den Weg dorthin.

**Alt-Schlüssel bleiben liegen — bewusst.** `red-kurd-fortschritt-v1`, `red-kurd-profil-v1`, `red-kurd-session-v1` und `red-kurd-modus` werden von `migriere()` kopiert, nie gelöscht (Kommentar in `storage.js:233–234`). Der Preis ist ein paar hundert Kilobyte, die nie aufgeräumt werden und nicht im Export stehen. Der Gegenwert: Wer auf eine ältere App-Version zurückgeht, findet seinen Lernstand vor. Diese Abwägung ist bewusst so getroffen. Sie sollte erst kippen, wenn die Rückschrittmöglichkeit praktisch keine Rolle mehr spielt — und dann in einem eigenen, sichtbaren Schritt, nicht nebenbei. Einzige Ausnahme: `red-kurd-profil-v1` wird bei „Onboarding neu durchlaufen" gelöscht, weil die Migration es sonst sofort wiederherstellte (§4.1).

**`heartsStore` ist tot.** `src/core/hearts/heartsStore.js` wird von keiner Datei unter `src/` importiert — nur `test/heartsStore.test.js` benutzt ihn. `red-kurd-hearts-v1` entsteht im Betrieb dadurch nie, der Schlüssel steht aber in `KEYS`, im Export und im Import. Solange das so bleibt, führt die Datei ein Konzept mit, das die App nicht benutzt. Zwei saubere Auswege: den Store an die Abenteuer-Ansicht anbinden, wie ursprünglich gedacht, oder ihn samt `KEYS.herzen` entfernen. Was nicht geht: den Schlüssel aus `KEYS` nehmen und die Datei liegen lassen — dann bricht der Import älterer Sicherungen still an dieser Stelle ab, ohne dass es jemand merkt.

**Weitere kleinere Auffälligkeiten**, ohne Handlungsdruck:
- `red-kurd-ui-v1` trägt intern `version: 2`. Schlüsselname und Inhaltsversion sind entkoppelt (siehe Regel 2 in §5).
- Zwei Namensschemata nebeneinander: `red-kurd-*` (localStorage, sessionStorage, Cache Storage) und `rk_session` (Cookie). Das frühere `rk-*` im sessionStorage ist verschwunden.
- Es gibt keine Funktion, die alle `KEYS` löscht — kein globales Zurücksetzen. `achievementsStore.zuruecksetzen()` existiert ohne Aufrufer, `audioService.loescheAufnahme()` ebenfalls. Auch die neuen Bereichs-Lernstände kennen kein Zurücksetzen: Wer in einer der drei neuen Apps von vorn anfangen will, kann das in der App nicht.
- Die Rettungskopien `<schlüssel>-defekt` (`storage.js:69–78`) werden nie wieder gelesen, nie gelöscht und stehen in keinem Export. Sie sind für eine Handrettung gedacht, aber es gibt keinen Weg in der App, an sie heranzukommen.
- `red-kurd-active-app-mode-v1` steht als einziger Alt-Schlüssel in `KEYS` und damit im Export. Das ist begründet, aber es weicht vom Umgang mit den vier anderen Alt-Schlüsseln ab.

---

*Stand: 375 Tests grün (`npm test`), darunter `storage.test.js`, `storage-basis.test.js`, `sicherungRundlauf.test.js`, `bereichsLernstand.test.js`, `elektroSchule.test.js`, `fehlerbuch.test.js`, `appMode.test.js` und `wochenUebersicht.test.js`. Prüfbar mit `npm run typecheck`, `npm run lint`, `npm run check`.*
