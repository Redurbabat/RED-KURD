# RED-KURD – Architektur

RED-KURD ist **eine** App: Deutsch → Kurmancî lernen. Sie hat **drei Oberflächen-Modi**
über **einem** gemeinsamen Lernstand. Ein Moduswechsel ändert nur die Darstellung — XP,
Serie, Wiederholkarten, Einheiten, Sterne, Sitzungen und Fertigkeiten bleiben dieselben
(siehe [DECISIONS.md](DECISIONS.md), ADR-002).

Daneben stehen vier kleine Nebensprachkurse (Englisch, Französisch, Türkisch, Spanisch)
mit **eigenem, getrenntem** Fortschritt (ADR-007).

Grundsatz ist local-first: die App läuft ohne Konto und ohne Netz vollständig (ADR-001).

```
src/
  app/          App.jsx · AppRouter.jsx · router.jsx
  core/         Lernlogik ohne Oberfläche
  components/   adventure/ · common/ · icons/ · layout/ · mascot/
  data/         Kurs-, Foto-, Kultur- und Grammatikdaten (im Bündel)
  features/     auth · culture · dictionary · exercise · grammar · reading ·
                script-converter · sentence-builder · speaking
  modes/        modern/ · adventure/ · redlingo/ — nur Darstellung
  styles/       tokens.css · global.css · components.css ·
                modern.css · adventure.css · redlingo.css
public/         bilder/ · audio/ · sw.js · manifest.webmanifest
sites/          Cloudflare Worker (worker.js, auth.js)
db/ · drizzle/  D1-Schema und Migrationen
test/           node:test
```

## Die drei Modi

Der Modus steht in `red-kurd-ui-v1` (`uiStore.js`, Feld `mode`) und landet als
`data-mode` auf dem `<html>`-Element. `App.jsx` leitet ihn **primär aus dem Pfad** ab
(`istAbenteuerPfad`, `istRedlingoPfad`), sonst aus `appModus()`. Umschalten geht über
Einstellungen → App-Modus oder die Seitenleiste; beide fragen vorher nach.

| Modus | Eigene Seiten | Umfang | Navigation |
|---|---|---|---|
| **modern** | 15 in `src/modes/modern/pages/` | vollständig; stellt zusätzlich `Onboarding`, `SettingsPage`, `ProgressPage` und `NotFoundPage` für alle drei Modi | `MODERN_NAV`, 6 Einträge |
| **abenteuer** | 8 in `src/modes/adventure/pages/` | eigener Lernfluss, Weltkarte, Truhen, Shop, Tages-/Wochenaufgaben, Kultur | `ABENTEUER_NAV`, 5 Einträge |
| **redlingo** | 2 (`RedlingoHomePage`, `RedlingoProfilePage`) | Alternativ-Startseite und Profil; alles Übrige sind Modern-Seiten mit `redlingo.css` | `REDLINGO_NAV`, 5 Einträge |

Gemeinsam benutzt werden `AppShell`, `StatsHeader`, `DesktopSidebar`/`BottomNavigation`
(Modus nur als CSS-Klasse) sowie `ExercisePlayer`, `ExerciseResult`, `sessionPlanner`,
`exerciseFactory` und `courseRepository`. Die Unterschiede sind rein darstellerisch.

## Lern-Engine (`src/core`)

### Reine Logik — ohne DOM, testbar

| Datei | Aufgabe |
|---|---|
| `progress/gamification.js` | `tageZwischen`, `aktualisiereSerie`, `WOCHENLIGEN`, `ligaFuerAufgaben` |
| `progress/scheduler.js` | Wiederholsystem (SM-2-vereinfacht): `ABSTAENDE`, `naechsteKarte`, `kartenSchluessel`, `tagVon` |
| `session/exerciseFactory.js` | `baueUebungen()`, `mische()`, `istRichtigGetippt()`, `SKILL_JE_ART` |
| `session/sessionPlanner.js` | `planeSitzung/Lektion/Wiederholung/Schwierige/Training`, `DAUERN` |
| `courses/courseRepository.js` | `WELTEN` (10), `EINHEITEN` (56), `ALLE_WOERTER` (596), `LEKTIONS_ARTEN` (5), `einheitStatus`, `weltPfad`, `aktuellerKnoten` |
| `schrift/transliteration.js` | `lateinNachArabisch` / `arabischNachLatein` (rein); `sprich`, `hatKurdischeStimme` brauchen `speechSynthesis` |
| `texts.js` | alle wiederkehrenden Oberflächentexte (`T`) |

### Browser-gebunden

| Datei | Aufgabe | Bindung |
|---|---|---|
| `storage.js` | `KEYS`, `lies/schreibe/entferne`, Export/Import des Speicherstands, `migriere()`, `migriereKarten()` | localStorage |
| `store.js` | `melden()`, `useLernstand()`, `beiFremdaenderung()` (Cache-Invalidierung über Tabs) | `window`, React |
| `progress/progressStore.js` | **der eine Lernstand**: XP, Serie + Schutz, Einheiten, Sterne, Karten, Tage (max. 60), Edelsteine, Schlüssel, Truhen, Lernzeit, `exportiereAlles`, `ankiZeilen` | localStorage |
| `progress/progressSelectors.js` | `statistik()`, `faelligeKarten()`, `fertigkeiten()`, `wochenAktivitaet()`, `wochenLiga()` | indirekt |
| `session/sessionStore.js` | laufende Sitzung sichern / laden / löschen | localStorage |
| `profile/profileStore.js` | Name, Ziel, Vorkenntnisse, Tagesziel, Variante, `standardDauer()` | localStorage |
| `ui/uiStore.js` | Modus, Design, Ton, Animationen, Erinnerungen; `anwenden()` setzt die `data-*`-Attribute | localStorage + `document` |
| `tasks/taskStore.js` | 4 Tages- und 3 Wochenaufgaben, aus dem Lernstand abgeleitet | localStorage |
| `shop/shopStore.js` | 6 Artikel, `kaufe()`, `setzeAktiv()` — nur Kosmetik und Komfort | localStorage |
| `achievements/achievementsStore.js` | Auszeichnungen, aus `statistik()` berechnet | localStorage |
| `courses/languageCourseStore.js` | getrennter Fortschritt der vier Nebensprachkurse | localStorage |
| `hearts/heartsStore.js` | 5 Herzen mit 4-Stunden-Regeneration — **derzeit von keinem Modul importiert** | localStorage |
| `audio/audioService.js` | eigene Aufnahmen (IndexedDB), `spieleWort()` (Aufnahme → `/audio/kmr/*.mp3` → Computerstimme), `klickGefuehl()` | IndexedDB, Audio, WebAudio, `navigator.vibrate` |
| `data/staticData.js` | Netzsuche gegen `/daten/*.json` und die Kurdish-Tech-Blöcke, `zufallsPaare()` | `fetch` |
| `auth/authApi.js` | `kontoStatus`, `registrieren`, `anmelden`, `abmelden` gegen `/api/auth/*` | `fetch`, Cookie |

Drei Lesepfade schreiben bewusst zurück in den localStorage: `uiStore.holeUi()`
(einmalige Design-Migration), `achievementsStore.holeAuszeichnungen()` und
`taskStore.pruefeTag()`. Alle drei verzichten dabei absichtlich auf `melden()`, um
Render-Schleifen zu vermeiden.

## Speicher

Die App benutzt localStorage, sessionStorage, IndexedDB, Cache Storage, ein Cookie
sowie serverseitig D1 und R2. Die vollständige Aufstellung — jeder Schlüssel mit
Feldern, Eigentümer, Größe, Export- und Migrationslage — steht in
**[STORAGE.md](STORAGE.md)**. Hier nur die Übersicht:

| Schlüssel / Ort | Technik | Inhalt | Im Export? |
|---|---|---|---|
| `red-kurd-progress-v2` | localStorage | Lernstand (XP, Serie, Karten, Einheiten, Sterne, Tage, Währungen) | ja |
| `red-kurd-profile-v2` | localStorage | Profil (Name, Ziel, Kenntnis, Tagesziel, Variante) | ja |
| `red-kurd-ui-v1` | localStorage | Modus, Design, Ton, Animationen | ja |
| `red-kurd-session-v2` | localStorage | laufende Sitzung | ja |
| `red-kurd-shop-v1` | localStorage | gekaufte und aktive Artikel | ja |
| `red-kurd-achievements-v1` | localStorage | Auszeichnungen mit Datum | ja |
| `red-kurd-tasks-v1` | localStorage | abgeholte Aufgabenbelohnungen | ja |
| `red-kurd-hearts-v1` | localStorage | Herzen (derzeit ohne Aufrufer) | ja |
| `red-kurd-language-courses-v1` | localStorage | Fortschritt der vier Nebensprachkurse | ja |
| `red-kurd-ohne-konto-v1` | localStorage | Entscheidung „ohne Konto lernen“ | **nein, absichtlich** |
| `red-kurd-tab-dauer` | sessionStorage | gewählte Sitzungsdauer, nur für diesen Tab (`TAB_KEYS`, `liesTab`/`schreibeTab`) | nein |
| `red-kurd-audio` / `aufnahmen` | IndexedDB | eigene Sprachaufnahmen (Blobs) | nein |
| `red-kurd-v2` | Cache Storage | App-Hülle und besuchte Dateien für den Offline-Betrieb | nein |
| `rk_session` | Cookie | Anmelde-Sitzung, HttpOnly — für die App unsichtbar | nein |
| `users`, `auth_sessions`, `auth_events` | D1 | Konten und Anmeldeereignisse | nein |

Alte Schlüssel (`red-kurd-fortschritt-v1`, `red-kurd-profil-v1`, `red-kurd-session-v1`,
`red-kurd-modus`) werden beim Start **kopiert**, nicht gelöscht — ein Rückschritt auf
eine ältere Version verliert also nichts (ADR-005).

## Adressen

Eigener Mini-Router (`src/app/router.jsx`, ADR-003): History-API, bei `file://`
Hash-Fallback, `document.startViewTransition` wenn Animationen an sind. Das erste
passende Muster gewinnt, die Segmentanzahl muss exakt stimmen.

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
| `/settings` | Profil, Modus, Design, Ton, Konto, Datenexport |
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
`/adventure/lesson/*` und `/practice/*`.

Alte interne Adressen (`/heute`, `/kurs`, `/kurse`, `/sprachen`, `/ueben`,
`/entdecken`, `/woerterbuch`, `/lesen`, `/schrift`, `/werkzeuge`, `/fortschritt`,
`/einstellungen`, `/abenteuer`) leiten automatisch weiter. Die Wurzel `/` geht
modusabhängig auf `/today`, `/adventure` oder `/redlingo`.

## Netz, Server und Offline-Vertrag

Die App braucht keinen Server. Was ein Server hinzufügt, steht hier.

### Cloudflare Worker (`sites/worker.js`)

Der öffentliche Betrieb läuft als Worker mit statischen Assets. Reihenfolge einer
Anfrage: Auth (`/api/auth/*`) → R2-Upload (`/__admin/r2/*`) → `/daten/*` aus R2 →
statisches `ASSETS`-Binding → bei HTML-404 die App-Hülle `index.html` (damit Tiefenlinks
funktionieren) → R2-Kopie unter `app/`. Ausgeliefertes HTML bekommt CSP,
`X-Content-Type-Options: nosniff` und `X-Frame-Options`; der Platzhalter
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
Der Aufrufvertrag ist damit: **`/daten` ist optional, nie Voraussetzung.**

### Konto (`sites/auth.js` + D1)

Anmeldung ist optional. PBKDF2-SHA256 mit 160 000 Runden, Sitzungs-Cookie `rk_session`
(HttpOnly, Secure, SameSite=Lax, 30 Tage); gespeichert wird serverseitig nur der
SHA-256 des Tokens. POST-Anfragen verlangen denselben Ursprung. Tabellen `users`,
`auth_sessions`, `auth_events` in D1, Schema in `db/schema.ts`, Migrationen unter
`drizzle/`.

Ohne Backend unterscheidet `authApi.kontoStatus()` sauber: 404/405 = kein Backend
vorhanden, 401 = Backend da und nicht angemeldet, kein JSON = reiner Statik-Server.
In allen Fällen läuft die App weiter. Die Entscheidung „ohne Konto lernen“ wird
geräte-lokal festgehalten und nie exportiert.

### Service Worker (`public/sw.js`)

Cache `red-kurd-v2`. Beim `install` werden `/` und `/index.html` vorgeladen. Behandelt
werden nur GET-Anfragen an denselben Ursprung; `/api/*` wird nie zwischengespeichert.
Seitenaufrufe sind network-first mit Rückfall auf die App-Hülle, alles Übrige
network-first mit Cache-Nachtrag. Beim `activate` werden alle Caches mit anderem Namen
gelöscht — ein neuer Cachename ist damit der Migrationsmechanismus. Registriert wird
der Worker in `src/main.jsx`, aber nicht auf localhost.

### Lokaler Wörterbuch-Server (`server.js`)

Optionales Entwicklerwerkzeug, kein Bestandteil der App: Node 22 mit `node:sqlite`
gegen eine lokale `red-kurd.db`. Einstellungen über `RED_KURD_DB` (Standard
`local-data/private/red-kurd.db`), `RED_KURD_HOST` (Standard `127.0.0.1`),
`RED_KURD_PORT` (Standard 3001) und `RED_KURD_ORIGINS`. Vite leitet `/api` dorthin
weiter. Keine Datei unter `src/` ruft ihn zwingend auf.

### Offline-Bilanz

**Vollständig offline:** der Kurmancî-Kurs (56 Kapitel, 596 Lernpaare), die vier
Nebensprachkurse, alle Bilder und Aufnahmen, Grammatik, Kultur, Lesetexte,
Schrift-Umwandlung, der komplette Lernstand, Shop, Aufgaben und Auszeichnungen.

**Nur online:** das große Wörterbuch, Wiktionary-Daten, Kurdish-Tech und die
Tatoeba-Beispielsätze (alle aus R2 über `/daten`).

**Nur mit Worker:** Konto und Anmeldung.

## Daten im Bündel (`src/data`)

| Datei | Inhalt |
|---|---|
| `kurse.js` + `kurseErweitert.js` + `kurseVertiefung.js` | 56 Einheiten in 10 Welten, 596 Lernpaare |
| `kapitelExtras.js` | Beispielsätze und Grammatiknotiz je Kapitel |
| `kapitelFotos.js` | 56 Kapitelfotos mit Urheber und Lizenz |
| `wortFotos.js` | 98 Wortfotos |
| `sprachkurse.js` | 4 Nebensprachen × 10 Kapitel × 8 Wörter = 320 Paare |
| `grammatikUebungen.js` | Regeln und Fragen für das Grammatik-Training |
| `kultur.js` | Redewendungen und Kulturkarten |
| `texte.js` | Lesetexte mit Verständnisfragen |
| `woerter.js` | flacher Grundwortschatz, abgeleitet aus `kurse` |

Unter `public/` liegen 154 Fotos (48 Kapitel + 8 Lernwelt + 98 Wörter, je mit
`credits.json`) und 325 Aussprache-Aufnahmen in `audio/index.json` → `audio/kmr/*.mp3`
(Lingua Libre, CC BY-SA).

## Werkzeuge und Prüfungen

| Befehl | Wirkung |
|---|---|
| `npm run dev` | Vite-Entwicklungsserver auf Port 5173 |
| `npm run build` | Produktionsbündel und Worker-Vorbereitung |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint über `src test scripts server.js sites` |
| `npm test` | `node --test` über `test/` — alle grün |
| `npm run check` | typecheck + lint + test + build in einem Lauf |
| `npm run content:check` | nur die Kursdaten-Tests |

`tsconfig.json` steht auf `strict` mit `noUncheckedIndexedAccess`,
`noImplicitOverride` und `noFallthroughCasesInSwitch`. `allowJs` ist an, `checkJs`
bewusst aus: geprüft wird nur, was schon nach TypeScript umgestellt wurde, damit die
Umstellung Modul für Modul laufen kann, ohne dass die Prüfung rot wird (ADR-006).

`.oxlintrc.json` schaltet die Regelsätze für React, Unicorn und TypeScript ein; hart
gesetzt sind `no-undef`, `no-var`, `react/jsx-key`, `react/no-danger` und
`react/jsx-no-target-blank`.

Die Tests liegen unter `test/` und laufen ohne DOM — es gibt kein jsdom im Projekt,
Komponententests sind daher heute nicht schreibbar. Abgedeckt sind: Konto und Worker
(`auth.test.js`, `sites-worker.test.js`), der Router (`router.test.js`), Speicher und
Migrationen (`storage.test.js`), das Wiederholsystem (`scheduler.test.js`), die
Kursdaten (`course-content.test.js`, `language-courses.test.js`), Serie und Liga
(`gamification.test.js`) sowie der Moduswechsel (`redlingo-mode.test.js`).

## Regeln

1. Seiten enthalten **keine** Lernlogik — sie rufen Selektoren und Planer auf.
2. Nach jeder Änderung am Lernstand ruft der Store `melden()`; Seiten holen sich mit
   `useLernstand()` ein Neuzeichnen.
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

## Weiterführend

- [STORAGE.md](STORAGE.md) — jeder Speicherort im Detail
- [DECISIONS.md](DECISIONS.md) — die Entscheidungen dahinter (ADR-001 bis ADR-007)
- [ROADMAP.md](ROADMAP.md) — die Phasen
- [AUFGABEN.md](AUFGABEN.md) — Einzelaufgaben ohne Phasenbezug
