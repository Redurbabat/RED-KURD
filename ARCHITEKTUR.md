# RED-KURD – Architektur

RED-KURD ist **eine Website mit vier eigenständigen Apps**:

| App | Kennung | Beschriftung im Umschalter | Code | Fortschritt |
|---|---|---|---|---|
| Sprache lernen | `language` | Sprache | `src/modes/`, `src/features/`, `src/app/AppRouter.jsx` | `red-kurd-progress-v2` |
| Code lernen | `code` | Code | `src/features/code-learning/` | `red-kurd-code-progress-v1` |
| AI-Sprache | `prompting` | AI | `src/features/prompting-learning/` | `red-kurd-prompting-progress-v1` |
| Elektro-Lehre | `electro` | Elektro | `src/features/electro-learning/` | `red-kurd-electro-progress-v1` |

Die Liste steht in `src/features/app-mode/appModes.js` (`APP_MODES`, `APP_MODE_LISTE`,
`APP_MODE_LABELS`, `APP_MODE_KURZ`). **Sichtbar ist immer genau eine App.** `App.jsx`
rendert nach `activeMode` entweder die Sprach-App (mit Router und Hülle) oder genau
eine der drei anderen; die drei anderen liegen hinter `React.lazy` und werden im
Leerlauf nachgeladen, damit der Service Worker sie für den Offline-Betrieb einsammelt.

Die Sprach-App hat darin **drei Ansichten** (Modern, Abenteuer, Redlingo) über
**einem** Lernstand. **Abenteuer ist eine Ansicht, kein eigener App-Bereich.** Ein
Ansichtswechsel ändert nur die Darstellung — XP, Serie, Wiederholkarten, Einheiten,
Sterne, Sitzungen und Fertigkeiten bleiben dieselben (DECISIONS.md, ADR-002).

Grundsatz über allem ist local-first: alle vier Apps laufen ohne Konto und ohne Netz
vollständig (ADR-001).

```
src/
  app/          App.jsx (App-Auswahl + aktive App) · AppRouter.jsx · router.jsx
  core/         Lernlogik ohne Oberfläche
                lernbereiche/ · elektro/ · prompting/ · progress/ · session/ …
  components/   adventure/ · common/ · icons/ · layout/ · mascot/
  data/         Kurs-, Foto-, Kultur- und Grammatikdaten der Sprach-App (im Bündel)
  features/     app-mode/          — App-Auswahl, Umschalter, geteilte Lernbausteine
                code-learning/     — App „Code lernen"
                prompting-learning/— App „AI-Sprache"
                electro-learning/  — App „Elektro-Lehre"
                auth · culture · dictionary · exercise · grammar · reading ·
                script-converter · sentence-builder · speaking
  modes/        modern/ · adventure/ · redlingo/ — die drei Ansichten der Sprach-App
  styles/       tokens.css · global.css · components.css ·
                modern.css · adventure.css · redlingo.css
public/         bilder/ · audio/ · sw.js · manifest.webmanifest
sites/          Cloudflare Worker (worker.js, auth.js)
db/ · drizzle/  D1-Schema und Migrationen
test/           node:test
```

## Wie umgeschaltet wird

Zwei Ebenen, die nicht verwechselt werden dürfen:

1. **Zwischen Apps** — `AppModeSwitcher.jsx`, immer am oberen Rand sichtbar. Er zeigt
   die vier Apps plus einen Knopf „Apps", der zur Vollbild-Auswahl `AppLauncher.jsx`
   zurückführt. Beim allerersten Start erscheint die Auswahl von selbst; danach öffnet
   sich direkt die zuletzt genutzte App.
2. **Zwischen Ansichten der Sprach-App** — `AnsichtSwitcher.jsx`, nur sichtbar, wenn
   die Sprach-App offen ist, und ausgeblendet auf Übungs- und Lektionsseiten.

Reihenfolge beim Start (`App.jsx`): Migration → Design anwenden → Kontostatus →
Onboarding → App-Auswahl → aktive App.

### Speicherung der App-Wahl

`src/features/app-mode/appModeStorage.js`, ausschließlich über `core/storage.js`:

- `KEYS.appAktiv` = `red-kurd-active-app-v1` — der aktuelle Schlüssel.
- `KEYS.appBereich` = `red-kurd-active-app-mode-v1` — der ältere Schlüssel. Er wird
  beim Lesen als Rückfall benutzt und beim Speichern **weiter mitgeschrieben**, damit
  ein Rücksprung auf eine ältere App-Version nichts verliert (ADR-005).
- Ein alter Wert `adventure`/`abenteuer` war nie eine eigene App. `loadAppMode()`
  erkennt ihn und migriert ihn zu „Sprache lernen + Abenteuer-Ansicht": `setzeAppModus('abenteuer')`
  plus `saveAppMode('language')`.
- Unbekannte Werte fallen auf `language` zurück.

Die Ansicht der Sprach-App steht dagegen in `red-kurd-ui-v1` (`uiStore.js`, Feld `mode`)
und landet als `data-mode` auf dem `<html>`-Element.

## App 1 — Sprache lernen

Die Sprach-App ist die einzige App mit eigenem Router und eigener Hülle
(`AppShell`, Navigation, Zusatzspalte). Inhalt: Deutsch → Kurmancî als Hauptkurs
(10 Welten, 56 Einheiten, 596 Lernpaare, 5 Lektionsarten) plus vier kleine
Nebensprachkurse mit **eigenem, getrenntem** Fortschritt (ADR-007).

### Die drei Ansichten

`Rahmen()` in `App.jsx` leitet die Ansicht **primär aus dem Pfad** ab
(`istAbenteuerPfad`, `istRedlingoPfad`), sonst aus `appModus()`. Umschalten geht über
den `AnsichtSwitcher`, über Einstellungen → App-Modus oder über die Seitenleiste; die
beiden letzten fragen vorher nach.

| Ansicht | Eigene Seiten | Umfang | Navigation |
|---|---|---|---|
| **modern** | 15 in `src/modes/modern/pages/` | vollständig; stellt zusätzlich `Onboarding`, `SettingsPage`, `ProgressPage` und `NotFoundPage` für alle drei Ansichten | `MODERN_NAV`, 6 Einträge |
| **abenteuer** | 8 in `src/modes/adventure/pages/` | eigener Lernfluss, Weltkarte, Truhen, Shop, Tages-/Wochenaufgaben, Kultur | `ABENTEUER_NAV`, 5 Einträge |
| **redlingo** | 2 (`RedlingoHomePage`, `RedlingoProfilePage`) | Alternativ-Startseite und Profil; alles Übrige sind Modern-Seiten mit `redlingo.css` | `REDLINGO_NAV`, 5 Einträge |

Gemeinsam benutzt werden `AppShell`, `StatsHeader`, `DesktopSidebar`/`BottomNavigation`
(Ansicht nur als CSS-Klasse) sowie `ExercisePlayer`, `ExerciseResult`, `sessionPlanner`,
`exerciseFactory` und `courseRepository`. Die Unterschiede sind rein darstellerisch.

## App 2 — Code lernen

`src/features/code-learning/`, Einstieg `CodeLearningHome.jsx`. Web-Grundlagen von
ganz vorn.

- **7 Lernpfade** (`data/codeLessons.js`): HTML Grundlagen (9), CSS Design (9),
  JavaScript Basics (9), TypeScript verstehen (4), GitHub verstehen (4),
  VS Code beherrschen (4), Mini-Projekte (4) — **43 Lektionen**.
- **141 interaktive Schritte** (`data/codeSchritte.js`, 90 × `wahl`, 40 × `bauen`,
  11 × `tippen`), abgespielt im `LektionPlayer` mit Live-Vorschau.
- **29 Mitmach-Aufgaben** (`data/codePraxis.js`), alle mit Live-Vorschau und
  automatischer Prüfliste: 12 Grundübungen (`stufe: 'grund'`) und 17 Aufbau-Aufgaben.
- **6 Projekt-Übungen** (`data/codeExercises.js`) ohne Autoprüfung — Aufgabe lesen,
  eigene Lösung notieren, als erledigt markieren.
- **Fehlerbuch** (`fehlerbuchStore.js`, Schlüssel `red-kurd-fehlerbuch-v1`): eigene
  Fehler mit Lösung, neueste oben.

## App 3 — AI-Sprache

`src/features/prompting-learning/`, Einstieg `PromptingApp.jsx`. Eigene Navigation mit
fünf Bereichen: Heute · Auftrag · Bug-Report · PR prüfen · Lernen.

- **10 Lektionen** (`data/promptLessons.js`) vom „Was ist ein Prompt?" bis zum
  Claude-Code-Auftrag, plus **6 Übungen** und **3 Mitmach-Aufgaben** (`art: 'text'`).
- **Werkstatt**: `core/prompting/promptBaukasten.js` liefert die Feldlisten und die
  reinen Prüffunktionen (`AUFTRAG_FELDER`, `BUG_FELDER`, `PR_CHECKLISTE`,
  `baueAuftrag`, `pruefeAuftrag`, `baueBugReport`, `pruefeBugReport`, `pruefeMerge`).
- Angefangene Aufträge, Bug-Reports und PR-Haken liegen in
  `core/prompting/werkstattStore.js` unter `red-kurd-prompting-workshop-v1`.

## App 4 — Elektro-Lehre

`src/features/electro-learning/`, Einstieg `ElectroApp.jsx`. Eigene Navigation mit
sechs Bereichen: Heute · Noten · Prüfung · Bericht · Formeln · Lernen.

- **11 Lektionen** (`data/electroLessons.js`) in drei Gruppen (Grundlagen, Sicherheit,
  Praxis), **6 Übungen** und **10 Rechenaufgaben** (`data/electroPraxis.js`, `art: 'zahl'`
  mit Sofortprüfung).
- **Formeln** (`core/elektro/formeln.js`): `strom`, `spannung`, `widerstand`,
  `leistung`, `energieKwh`, `kosten`, `spannungsfall`, `mindestQuerschnitt`, dazu
  `LEITWERT`, `FORMELN` und `SICHERHEITSREGELN` — reine Funktionen.
- **Notenrechnung** (`core/elektro/notenRechnung.js`): Skalen, Durchschnitt, Rundung,
  `benoetigteNote`, `trend`, `tageBis` — ebenfalls rein.
- **Schule und Betrieb** (`core/elektro/schuleStore.js`): 8 Standardfächer, Noten,
  Prüfungen und Berichtsheft unter `red-kurd-electro-school-v1`. Die Oberfläche liest
  hier und rechnet nie selbst.

## Gemeinsame Bausteine der drei neuen Apps

`src/core/lernbereiche/bereichsLernstand.js` ist ein Baukasten: `erstelleBereichsLernstand(key)`
bindet dieselben Regeln an einen eigenen Schlüssel — erledigte Lektionen mit Datum,
eigene Notizen, XP, Tagesserie, Tageswerte. Der Status einer Lektion wird **immer**
daraus abgeleitet, nie aus den Datendateien: erledigt → `done`, die erste offene →
`current`, die direkt folgende → `open`, alles danach → `locked`.

Feste XP-Werte: `XP_JE_LEKTION` 10, `XP_JE_UEBUNG` 15, `XP_JE_MITMACH` 20,
`TAGESZIEL_XP` 30.

Geteilte Oberflächenteile in `src/features/app-mode/`:

| Datei | Aufgabe |
|---|---|
| `AppLauncher.jsx` | Vollbild-App-Auswahl mit Wochenübersicht |
| `AppModeSwitcher.jsx` | Umschalter zwischen den vier Apps |
| `AnsichtSwitcher.jsx` | Umschalter der drei Ansichten **innerhalb** der Sprach-App |
| `LernpfadKarte.jsx` | Wegkarte: Lektionen als Knoten auf einem Pfad — in allen vier Apps im Einsatz (auch in `CoursePage`) |
| `LektionPlayer.jsx` | Schritt-für-Schritt-Lektion mit Live-Vorschau |
| `LektionModal.jsx` | Lesetext-Lektion (AI-Sprache, Elektro-Lehre) |
| `UebungModal.jsx` | Übung mit eigener Notiz, ohne Autoprüfung |
| `PraxisAufgabe.jsx` | Mitmach-Aufgabe `html` / `text` / `zahl` mit Prüfliste; HTML-Vorschau im Sandbox-iframe. `allow-scripts` gibt es nur, wenn die Aufgabe es mit `skript: true` verlangt — heute 6 der 29 Aufgaben |
| `CodeTastatur.jsx` + `tastaturHilfen.js` | Bildschirmtastatur für Code-Zeichen und Bausteine |
| `Wochenuebersicht.jsx` | die gemeinsame Woche über alle vier Apps |

`src/core/lernbereiche/wochenUebersicht.js` rechnet dazu rein: `wochenTage`, `appWoche`,
`wochenUebersicht`, `reiheGesamt`. Bewusst wird **nicht** zu einer Zahl addiert — die
Sprach-App zählt gelöste Aufgaben, die anderen drei zählen XP. Gezeigt wird je App der
eigene Wert mit eigener Einheit, gemeinsames Maß sind die aktiven Tage.

## Lern-Engine (`src/core`)

### Reine Logik — ohne DOM, testbar

| Datei | Aufgabe |
|---|---|
| `progress/gamification.ts` | `tageZwischen`, `aktualisiereSerie`, `WOCHENLIGEN`, `ligaFuerAufgaben` — nach TypeScript migriert (erste Welle, zusammen mit scheduler.ts) (ADR-006) |
| `progress/scheduler.ts` | Wiederholsystem (SM-2-vereinfacht): `ABSTAENDE`, `naechsteKarte`, `kartenSchluessel`, `tagVon`, `heute` — nach TypeScript migriert (ADR-006) |
| `session/exerciseFactory.ts` | `baueUebungen()`, `mische()`, `istRichtigGetippt()`, `SKILL_JE_ART` |
| `session/sessionPlanner.ts` | `planeSitzung/Lektion/Wiederholung/Schwierige/Training`, `DAUERN` |
| `courses/courseRepository.js` | `WELTEN` (10), `EINHEITEN` (56), `ALLE_WOERTER` (596), `LEKTIONS_ARTEN` (5), `einheitStatus`, `weltPfad`, `aktuellerKnoten` |
| `lernbereiche/wochenUebersicht.js` | die Woche über alle vier Apps, ohne Speicherzugriff |
| `elektro/formeln.js` | Ohm, Leistung, Energie, Spannungsfall, Mindestquerschnitt |
| `elektro/notenRechnung.js` | Skalen, Durchschnitt, `benoetigteNote`, `trend`, `tageBis` |
| `prompting/promptBaukasten.js` | Feldlisten und Prüffunktionen für Auftrag, Bug-Report, PR |
| `schrift/transliteration.ts` | `lateinNachArabisch` / `arabischNachLatein` (rein); `sprich`, `hatKurdischeStimme` brauchen `speechSynthesis` |
| `texts.js` | alle wiederkehrenden Oberflächentexte (`T`) |

### Browser-gebunden

| Datei | Aufgabe | Bindung |
|---|---|---|
| `storage.js` | `KEYS`, `TAB_KEYS`, `lies/schreibe/entferne`, `liesTab/schreibeTab`, Export/Import, `beiSpeicherproblem()`, `migriere()`, `migriereKarten()` | localStorage, sessionStorage |
| `store.js` | `melden()`, `useLernstand()`, `beiFremdaenderung()` (Cache-Invalidierung über Tabs) | `window`, React |
| `progress/progressStore.js` | **der Lernstand der Sprach-App**: XP, Serie + Schutz, Einheiten, Sterne, Karten, Tage (max. 60), Edelsteine, Schlüssel, Truhen, Lernzeit, `exportiereAlles`, `ankiZeilen` | localStorage |
| `progress/progressSelectors.js` | `statistik()`, `faelligeKarten()`, `fertigkeiten()`, `wochenAktivitaet()`, `wochenLiga()` | indirekt |
| `lernbereiche/bereichsLernstand.js` | Lernstand-Baukasten für Code, AI-Sprache und Elektro | localStorage |
| `session/sessionStore.js` | laufende Sitzung sichern / laden / löschen | localStorage |
| `profile/profileStore.js` | Name, Ziel, Vorkenntnisse, Tagesziel, Variante, `standardDauer()` | localStorage |
| `ui/uiStore.js` | Ansicht der Sprach-App, Design, Ton, Animationen, Erinnerungen; `anwenden()` setzt die `data-*`-Attribute | localStorage + `document` |
| `tasks/taskStore.js` | 4 Tages- und 3 Wochenaufgaben, aus dem Lernstand abgeleitet | localStorage |
| `shop/shopStore.js` | 6 Artikel in 3 Kategorien, `kaufe()`, `setzeAktiv()` — nur Kosmetik und Komfort | localStorage |
| `achievements/achievementsStore.js` | 9 Auszeichnungen, aus `statistik()` berechnet | localStorage |
| `courses/languageCourseStore.js` | getrennter Fortschritt der vier Nebensprachkurse | localStorage |
| `elektro/schuleStore.js` | Fächer, Noten, Prüfungen, Berichtsheft der Elektro-Lehre | localStorage |
| `prompting/werkstattStore.js` | angefangener Auftrag, Bug-Report, PR-Haken | localStorage |
| `hearts/heartsStore.js` | 5 Herzen mit 4-Stunden-Regeneration — **derzeit von keinem Modul importiert** | localStorage |
| `audio/audioService.js` | eigene Aufnahmen (IndexedDB), `spieleWort()` (Aufnahme → `/audio/kmr/*.mp3` → Computerstimme), `klickGefuehl()` | IndexedDB, Audio, WebAudio, `navigator.vibrate` |
| `data/staticData.js` | Netzsuche gegen `/daten/*.json` und die Kurdish-Tech-Blöcke, `zufallsPaare()` | `fetch` |
| `auth/authApi.js` | `kontoStatus`, `registrieren`, `anmelden`, `abmelden` gegen `/api/auth/*` | `fetch`, Cookie |

Drei Lesepfade schreiben bewusst zurück in den localStorage: `uiStore.holeUi()`
(einmalige Design-Migration), `achievementsStore.holeAuszeichnungen()` und
`taskStore.pruefeTag()`. Alle drei verzichten dabei absichtlich auf `melden()`, um
Render-Schleifen zu vermeiden.

## Speicher

Alle Zugriffe laufen über `src/core/storage.js`. Jeder Speicherort im Detail — Felder,
Eigentümer, Größe, Export- und Migrationslage — steht in **[STORAGE.md](STORAGE.md)**;
hier nur, was zur Architektur gehört.

**Jede App hat ihren eigenen Fortschritt.** Es gibt keinen gemeinsamen Lernstand über
die vier Apps hinweg; geteilt wird nur die Wochenübersicht, und die liest die vier
Stände getrennt und rechnet sie nicht zusammen. Innerhalb der Sprach-App teilen sich
die drei Ansichten dagegen genau einen Lernstand.

Die Schlüssel aus `KEYS`:

| Schlüssel | Inhalt |
|---|---|
| `red-kurd-progress-v2` | Lernstand der Sprach-App (XP, Serie, Karten, Einheiten, Sterne, Tage, Währungen) |
| `red-kurd-profile-v2` | Profil (Name, Ziel, Kenntnis, Tagesziel, Variante) |
| `red-kurd-ui-v1` | Ansicht der Sprach-App, Design, Ton, Animationen |
| `red-kurd-session-v2` | laufende Sitzung |
| `red-kurd-shop-v1` · `red-kurd-achievements-v1` · `red-kurd-tasks-v1` · `red-kurd-hearts-v1` | Shop, Auszeichnungen, Aufgaben, Herzen (Sprach-App) |
| `red-kurd-language-courses-v1` | Fortschritt der vier Nebensprachkurse |
| `red-kurd-active-app-v1` | aktive App |
| `red-kurd-active-app-mode-v1` | aktive App, alter Schlüssel — wird mitgeschrieben |
| `red-kurd-code-progress-v1` | Lernstand „Code lernen" |
| `red-kurd-prompting-progress-v1` | Lernstand „AI-Sprache" |
| `red-kurd-electro-progress-v1` | Lernstand „Elektro-Lehre" |
| `red-kurd-electro-school-v1` | Fächer, Noten, Prüfungen, Berichtsheft |
| `red-kurd-prompting-workshop-v1` | angefangener Auftrag, Bug-Report, PR-Haken |
| `red-kurd-fehlerbuch-v1` | Fehlerbuch der Code-App |
| `red-kurd-ohne-konto-v1` | Entscheidung „ohne Konto lernen" |

Außerhalb von `KEYS`: `red-kurd-tab-dauer` im sessionStorage (`TAB_KEYS`,
`liesTab`/`schreibeTab`) für die gewählte Sitzungsdauer, die eigenen Sprachaufnahmen in
IndexedDB, die Caches des Service Workers, das Cookie `rk_session` und die D1-Tabellen.

**Nicht im Export** (`NUR_LOKAL` in `storage.js`): `ohneKonto` und `sitzung`. Die
Anmelde-Entscheidung gehört dem Gerät, und eine halb fertige Sitzung darf auf einem
anderen Gerät nicht wiederbelebt werden. Alles Übrige wandert in Sicherungen mit.

Zwei Sicherungen gegen stillen Datenverlust: Ein Lesefehler legt den kaputten Rohtext
einmalig unter `<key>-defekt` ab, statt ihn beim nächsten Schreiben zu überschreiben.
Und schlägt das Schreiben fehl (Speicher voll, privater Modus), meldet
`beiSpeicherproblem()` das genau einmal — die App zeigt dann einen Hinweis, statt
Fortschritt zu versprechen, der beim Neuladen weg ist.

Alte Schlüssel (`red-kurd-fortschritt-v1`, `red-kurd-profil-v1`, `red-kurd-session-v1`,
`red-kurd-modus`) werden beim Start **kopiert**, nicht gelöscht — ein Rückschritt auf
eine ältere Version verliert also nichts (ADR-005).

## Adressen

Eigener Mini-Router (`src/app/router.jsx`, ADR-003): History-API, bei `file://`
Hash-Fallback, `document.startViewTransition` wenn Animationen an sind. Das erste
passende Muster gewinnt, die Segmentanzahl muss exakt stimmen.

**Nur die Sprach-App hat Adressen.** Code lernen, AI-Sprache und Elektro-Lehre stehen
nicht im `AppRouter` — sie werden in `App.jsx` nach `activeMode` gerendert und führen
ihre Unterbereiche in eigenem Komponentenzustand. Sie sind damit heute nicht
verlinkbar; die Rückkehr in sie läuft über die gespeicherte App-Wahl.

| Adresse | Seite |
|---|---|
| `/today` | Tagesplan, fortsetzbare Sitzung, Tagesziel |
| `/session` | gemischte Tagessitzung |
| `/course` | Kurmancî-Kursübersicht, 10 Welten |
| `/course/:unitId` | Kapitel mit Wortliste, fünf Lektionen, Sternen |
| `/course/:unitId/lesson/:lessonId` | eine Lektion |
| `/languages` | zentrale Kurswahl (Kurmancî → `/course`) |
| `/languages/:languageId` | zehn Kapitel eines Nebensprachkurses |
| `/languages/:languageId/:chapterId` | Lernlauf eines Nebenkapitels |
| `/practice` | Übersicht der Trainings mit Empfehlung |
| `/practice/:trainingId` | ein einzelnes Training |
| `/explore` | Entdecken-Übersicht |
| `/explore/dictionary` | Wörterbuchsuche |
| `/explore/reading` | Lesetexte und Beispielsätze |
| `/explore/script` | Latein ↔ arabische Schrift |
| `/explore/culture` | Redewendungen und Kulturkarten |
| `/progress` | Fertigkeiten, Woche, Export/Import, Anki-Export |
| `/settings` | Profil, Ansicht, Design, Ton, Konto, Datenexport |
| `/redlingo` | Redlingo-Startseite |
| `/redlingo/profile` | Redlingo-Profil |
| `/adventure` | Abenteuer-Start |
| `/adventure/worlds` | Weltkarte (10 Welten) |
| `/adventure/world` | dieselbe Weltkarte (Zweitadresse) |
| `/adventure/world/:worldId` | Lernpfad einer Welt mit Welttruhe |
| `/adventure/lesson/:lessonId` | Station mit fünf Schritten |
| `/adventure/tasks` | Tages- und Wochenaufgaben, Tagestruhe |
| `/adventure/quests` | dieselbe Seite (Zweitadresse, nirgends verlinkt) |
| `/adventure/culture` | Kulturkarten im Abenteuer-Stil |
| `/adventure/shop` | Shop (nur Kosmetik) |
| `/adventure/profile` | Profil, Auszeichnungen, Shop-Zugang |
| *sonst* | `NotFoundPage` |

**Die elf `trainingId`-Werte** unter `/practice/:trainingId`: acht führen über den
gemeinsamen Übungsspieler — `mix` (heutige Mischung), `review` (Wiederholen),
`hard` (schwierige Wörter), `images` (Bilder), `listening` (Hören), `writing`
(Schreiben), `recall` (Schnellwahl), `meaning` (Bedeutungen). Drei haben eine eigene
Komponente: `speaking` (Aussprachestudio), `grammar` (Grammatik-Training),
`sentence-builder` (Satzbau). Unbekannte Kennungen zeigen einen eigenen Leerzustand.

**Ohne Navigationsleisten** laufen `/session`, `/course/*/lesson/*`, `/languages/*/*`,
`/adventure/lesson/*` und `/practice/*`. Auf denselben Pfaden blendet sich auch der
`AnsichtSwitcher` aus.

Alte interne Adressen (`/heute`, `/kurs`, `/kurse`, `/sprachen`, `/ueben`,
`/entdecken`, `/woerterbuch`, `/lesen`, `/schrift`, `/werkzeuge`, `/fortschritt`,
`/einstellungen`, `/abenteuer`) leiten automatisch weiter. Die Wurzel `/` geht
je nach Ansicht auf `/today`, `/adventure` oder `/redlingo`.

## Netz, Server und Offline-Vertrag

Keine der vier Apps braucht einen Server. Was ein Server hinzufügt, steht hier.

### Cloudflare Worker (`sites/worker.js`)

Der öffentliche Betrieb läuft als Worker mit statischen Assets. Reihenfolge einer
Anfrage: Auth (`/api/auth/*`) → R2-Upload (`/__admin/r2/*`) → `/daten/*` aus R2 →
statisches `ASSETS`-Binding → bei HTML-404 die App-Hülle `index.html` (damit Tiefenlinks
funktionieren) → R2-Kopie unter `app/`. Ausgeliefertes HTML bekommt eine CSP
(`default-src 'self'`, Skripte nur vom eigenen Ursprung), dazu
`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` und
`Referrer-Policy: strict-origin-when-cross-origin`; der Platzhalter
`__SITE_ORIGIN__` wird durch die öffentliche Adresse ersetzt.

Uploads gehen nur per `PUT /__admin/r2/…` mit Bearer-Token (Konstantzeitvergleich),
höchstens 95 MiB je Datei und nur unter den Präfixen `daten/` und `app/`.

### R2 und der `/daten`-Vertrag

`public/daten/` liegt **nicht** im Repository. Die Dateien kommen ausschließlich aus
dem R2-Bucket über den Worker:

- `/daten/woerter.json`, `/daten/wiki.json`, `/daten/beispiele.json`
- `/daten/kt/{ku,sor,zza}/index.json` und die zugehörigen Blöcke

Fehlen sie (lokale Entwicklung, statisches Hosting), schlagen die `fetch`-Aufrufe fehl.
Jeder Aufrufer fängt das ab: die App bleibt lauffähig, Wörterbuchsuche und
Beispielsätze bleiben leer, `zufallsPaare()` fällt sauber auf die Kapitelsätze zurück.
Der Aufrufvertrag ist damit: **`/daten` ist optional, nie Voraussetzung.** Betroffen ist
ohnehin nur die Sprach-App; die anderen drei tragen ihre Inhalte vollständig im Bündel.

### Konto (`sites/auth.js` + D1)

Anmeldung ist optional und gilt für die ganze Website, nicht je App. PBKDF2-SHA256 mit
160 000 Runden, Sitzungs-Cookie `rk_session` (HttpOnly, Secure, SameSite=Lax, 30 Tage);
gespeichert wird serverseitig nur der SHA-256 des Tokens. POST-Anfragen verlangen
denselben Ursprung. Tabellen `users`, `auth_sessions`, `auth_events` in D1, Schema in
`db/schema.ts`, Migrationen unter `drizzle/`.

Ohne Backend unterscheidet `authApi.kontoStatus()` sauber: 404/405 = kein Backend
vorhanden, 401 = Backend da und nicht angemeldet, kein JSON = reiner Statik-Server.
In allen Fällen läuft die App weiter. Die Entscheidung „ohne Konto lernen" wird
geräte-lokal festgehalten und nie exportiert.

### Service Worker (`public/sw.js`)

Zwei Caches, Version `v3`: `red-kurd-v3` für App-Hülle und Bundle, `red-kurd-medien-v3`
für Fotos, Audio und `/daten` (auf 150 Einträge begrenzt, älteste fliegen zuerst — ein
übervoller Cache wird von iOS sonst komplett abgeräumt). Beim `install` werden `/` und
`/index.html` vorgeladen, beim `activate` jeder Cache mit anderem Namen gelöscht; ein
neuer Cachename ist damit der Migrationsmechanismus.

Behandelt werden nur GET-Anfragen an denselben Ursprung; `/api/*` nie. Vier Strategien:

| Anfrage | Strategie |
|---|---|
| Seitenaufrufe (`mode: navigate`) | Netz mit 4-Sekunden-Limit, offline die App-Hülle; nur eine `ok`-Antwort darf die Hülle ersetzen |
| `/assets/*` (gehasht) | Cache zuerst, Netz nur einmal |
| `/bilder/*`, `/audio/*`, `/daten/*` | stale-while-revalidate im Medien-Cache |
| alles Übrige | Netz zuerst, sonst Cache, sonst ehrliches 504 |

Registriert wird der Worker in `src/main.jsx` **nur im Produktions-Build**
(`import.meta.env.PROD`) — die frühere localhost-Heuristik registrierte ihn auch beim
Entwickeln über eine LAN-IP und vergiftete den Cache mit Dev-Antworten. Dieselbe Datei
bittet über `navigator.storage.persist()` um dauerhaften Speicher, damit Safari den
Lernstand nicht nach sieben Tagen ohne Besuch abräumt.

### Lokaler Wörterbuch-Server (`server.js`)

Optionales Entwicklerwerkzeug, kein Bestandteil der App: Node 22 mit `node:sqlite`
gegen eine lokale `red-kurd.db`. Einstellungen über `RED_KURD_DB` (Standard
`local-data/private/red-kurd.db`), `RED_KURD_HOST` (Standard `127.0.0.1`),
`RED_KURD_PORT` (Standard 3001) und `RED_KURD_ORIGINS`. Vite leitet `/api` dorthin
weiter. Keine Datei unter `src/` ruft ihn zwingend auf.

### Offline-Bilanz

**Vollständig offline:** alle vier Apps mit ihren Inhalten — der Kurmancî-Kurs
(56 Kapitel, 596 Lernpaare), die vier Nebensprachkurse, alle Bilder und Aufnahmen,
Grammatik, Kultur, Lesetexte, Schrift-Umwandlung, die 43 Code-Lektionen mit ihren
Schritten und Mitmach-Aufgaben, die 10 AI-Sprache-Lektionen samt Werkstatt, die
11 Elektro-Lektionen samt Rechnern, Noten und Berichtsheft, dazu sämtliche Lernstände,
Shop, Aufgaben und Auszeichnungen.

**Nur online:** das große Wörterbuch, Wiktionary-Daten, Kurdish-Tech und die
Tatoeba-Beispielsätze (alle aus R2 über `/daten`).

**Nur mit Worker:** Konto und Anmeldung.

## Daten im Bündel (`src/data`)

Die Sprach-App:

| Datei | Inhalt |
|---|---|
| `kurse.js` + `kurseErweitert.js` + `kurseVertiefung.js` | 56 Einheiten in 10 Welten, 596 Lernpaare |
| `kapitelExtras.js` | Beispielsätze und Grammatiknotiz je Kapitel |
| `kapitelFotos.js` | 56 Kapitel- und Weltbilder mit Urheber und Lizenz |
| `wortFotos.js` | 98 Wortfotos |
| `sprachkurse.js` | 4 Nebensprachen × 10 Kapitel × 8 Wörter = 320 Paare |
| `grammatikUebungen.js` | Regeln und Fragen für das Grammatik-Training |
| `kultur.js` | Redewendungen und Kulturkarten |
| `texte.js` | Lesetexte mit Verständnisfragen |
| `woerter.js` | flacher Grundwortschatz, abgeleitet aus `kurse` |

Die drei anderen Apps halten ihre Inhalte in ihrem eigenen `data/`-Ordner
(`codeLessons.js`, `codeSchritte.js`, `codePraxis.js`, `codeExercises.js` ·
`promptLessons.js`, `promptExercises.js`, `promptPraxis.js` · `electroLessons.js`,
`electroExercises.js`, `electroPraxis.js`).

Unter `public/` liegen 154 Fotos (48 Kapitel + 8 Lernwelt + 98 Wörter, je mit
`credits.json`) und 321 Aussprache-Aufnahmen in `audio/index.json` → `audio/kmr/*.mp3`
(Lingua Libre, CC BY-SA). `test/audioIndex.test.js` hält Index und Dateien in beide
Richtungen deckungsgleich.

## Werkzeuge und Prüfungen

| Befehl | Wirkung |
|---|---|
| `npm run dev` | Vite-Entwicklungsserver auf Port 5173 |
| `npm run build` | Produktionsbündel und Worker-Vorbereitung |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint über `src test scripts server.js sites` |
| `npm test` | `node --test` über `test/` |
| `npm run check` | typecheck + lint + test + build in einem Lauf |
| `npm run content:check` | nur die Kursdaten-Tests |

`package.json` führt außerdem `test:e2e` auf `scripts/e2e.mjs` — diese Datei liegt
heute nicht im Repository, der Befehl schlägt also fehl. Entweder Skript nachliefern
oder Eintrag entfernen.

`tsconfig.json` steht auf `strict` mit `noUncheckedIndexedAccess`,
`noImplicitOverride` und `noFallthroughCasesInSwitch`. `allowJs` ist an, `checkJs`
bewusst aus: geprüft wird nur, was schon nach TypeScript umgestellt wurde, damit die
Umstellung Modul für Modul laufen kann, ohne dass die Prüfung rot wird (ADR-006).

`.oxlintrc.json` schaltet die Regelsätze für React, Unicorn und TypeScript ein; hart
gesetzt sind `no-undef`, `no-var`, `react/jsx-key`, `react/no-danger` und
`react/jsx-no-target-blank`.

Die Tests liegen unter `test/` und laufen ohne DOM — es gibt kein jsdom im Projekt,
Komponententests sind daher heute nicht schreibbar. Stand jetzt: **36 Testdateien,
375 Tests, alle grün.** Abgedeckt sind unter anderem der App-Umschalter
(`appMode.test.js`), der Bereichs-Lernstand (`bereichsLernstand.test.js`), die
Wochenübersicht (`wochenUebersicht.test.js`), die Code-Schritte
(`codeSchritte.test.js`), die Mitmach-Aufgaben (`praxisAufgaben.test.js`), der
Prompt-Baukasten (`promptBaukasten.test.js`), die Elektro-Schule
(`elektroSchule.test.js`), das Fehlerbuch (`fehlerbuch.test.js`), der
Sicherungs-Rundlauf (`sicherungRundlauf.test.js`), Konto und Worker (`auth.test.js`,
`sites-worker.test.js`), der Service Worker (`sw.test.js`), der Router
(`router.test.js`), Speicher und Migrationen (`storage.test.js`,
`storage-basis.test.js`), das Wiederholsystem (`scheduler.test.js`) und die Kursdaten
(`course-content.test.js`, `language-courses.test.js`).

## Regeln

1. Seiten enthalten **keine** Lernlogik — sie rufen Selektoren und Planer auf.
2. Nach jeder Änderung an einem Lernstand ruft der Store `melden()`; Seiten holen sich
   mit `useLernstand()` ein Neuzeichnen.
3. Keine Inline-Styles für das Aussehen — nur Tokens und Klassen.
4. **In der Oberfläche** kommen Icons aus `components/icons/Icon.jsx`, nicht aus Emojis.
   Das gilt für Schaltflächen, Navigation, Karten und Zustände.
   **In den Kursdaten** ist das anders und beabsichtigt: das Feld `bild` in `kurse.js`
   ist ein Emoji — es ist Lerninhalt, keine Bedienelement-Beschriftung, und trägt jedes
   der 596 Wörter ohne eigene Datei. 98 Wörter haben zusätzlich ein echtes Foto
   (`wortFotos.js`), das in den Bildaufgaben Vorrang hat; `fotoVon()` vor `bildVon()`.
5. Jede Schaltfläche hat Text oder `aria-label`, Mindestgröße 44 × 44 px.
6. Kurmancî-Text bekommt `lang="ku"`, arabische Schrift zusätzlich `dir="rtl"`.
7. Alle Speicherzugriffe laufen über `src/core/storage.js`. Ausnahmen sind dokumentiert
   und in [STORAGE.md](STORAGE.md) einzeln aufgeführt.
8. Eine neue App ist ein Eintrag in `appModes.js`, ein Feature-Ordner und ein eigener
   Fortschritts-Schlüssel in `KEYS` — kein Eingriff in bestehende Apps.
9. Der Status einer Lektion wird immer aus dem Lernstand abgeleitet, nie aus den
   Datendateien.

## Weiterführend

- [STORAGE.md](STORAGE.md) — jeder Speicherort im Detail
- [DECISIONS.md](DECISIONS.md) — die Entscheidungen dahinter (ADR-001 bis ADR-007)
- [ROADMAP.md](ROADMAP.md) — die Phasen
- [AUFGABEN.md](AUFGABEN.md) — Einzelaufgaben ohne Phasenbezug
