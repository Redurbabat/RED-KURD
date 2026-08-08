# RED-KURD – vier Lern-Apps, lokal und ohne Konto

RED-KURD ist eine Website mit **vier eigenständigen Apps**: **Sprache lernen**,
**Code lernen**, **AI-Sprache** und **Elektro-Lehre**. Sie läuft vollständig im
Browser: kein Konto nötig, kein Netz nötig, kein Abo, keine Werbung, kein
Echtgeld-Shop. Schwester-Projekt von
[BABAT-RED](https://github.com/Redurbabat/BABAT-RED).

Beim ersten Start erscheint die App-Auswahl. Danach öffnet sich direkt die zuletzt
genutzte App; oben steht ein Umschalter mit allen vier Apps und dem Weg zurück zur
Auswahl. **Sichtbar ist immer genau eine App.**

Lernstände, Profil, Einstellungen und die eigenen Sprachaufnahmen bleiben auf dem
Gerät. Eine vollständige Sicherung geht jederzeit über Export und Import unter
„Fortschritt".

## Die vier Apps

| App | Worum es geht | Fortschritt |
|---|---|---|
| **Sprache lernen** | Kurmancî als Hauptkurs, dazu Englisch, Französisch, Türkisch und Spanisch | `red-kurd-progress-v2` (+ eigener Stand für die Nebensprachen) |
| **Code lernen** | HTML, CSS, JavaScript, TypeScript, GitHub, VS Code, Mini-Projekte | `red-kurd-code-progress-v1` |
| **AI-Sprache** | Prompts schreiben, Aufträge für Claude Code, Bug-Reports, PRs prüfen | `red-kurd-prompting-progress-v1` |
| **Elektro-Lehre** | Strom, Sicherheit, Messen — dazu Noten, Prüfungen und Berichtsheft | `red-kurd-electro-progress-v1` |

**Jede App hat ihren eigenen Fortschritt.** Nichts wird zwischen den Apps
zusammengezählt. Gemeinsam ist nur die Wochenübersicht auf der App-Auswahl — und die
zeigt bewusst je App den eigenen Wert mit eigener Einheit (die Sprach-App zählt gelöste
Aufgaben, die anderen drei zählen XP). Als gemeinsames Maß dient die Zahl der aktiven
Tage.

---

## Sprache lernen

Deutsch → Kurmancî als Hauptkurs, dazu vier kleine Nebensprachkurse.

| | |
|---|---|
| Kurmancî-Kapitel | **56** in 10 Welten, je fünf Abschnitte |
| Lernpaare (Kurmancî) | **596** |
| Aussprache-Aufnahmen | **321** von Muttersprachlern (Lingua Libre, CC BY-SA) |
| Fotos | **154** (48 Kapitel-, 8 Weltbilder, 98 Wortfotos), alle mit Urheber und Lizenz |
| Nebensprachkurse | **4** × 10 Kapitel × 8 Wörter = 320 Paare |
| Trainings (`/practice/:trainingId`) | **11** Kennungen, davon 9 als Karte unter „Üben" |
| Übungsarten | Auswahl in beide Richtungen, Eintippen, Bild, Hören, Satzbau, Aussprache, Grammatik |

### Drei Ansichten, ein Lernstand

| Modern | Abenteuer | Redlingo |
|---|---|---|
| Klare, ruhige Lernoberfläche | Spielerische Lernreise mit Weltkarte | Startseite mit Lernweg, Schnellzielen und Wochenliga |
| Heute · Kurse · Üben · Entdecken · Fortschritt · Einstellungen | Start · Lernpfad · Aufgaben · Kultur · Profil | Start · Kurse · Üben · Fortschritt · Profil |

**Abenteuer ist eine Ansicht der Sprach-App, keine eigene App.** Der Wechsel läuft über
den Ansichts-Umschalter oben oder über Einstellungen → App-Modus. Es ändert sich
ausschließlich die Darstellung: XP, Tagesserie, Wiederholsystem, Kursfortschritt,
Sterne, Fertigkeiten und laufende Sitzungen sind in allen drei Ansichten dieselben. Der
Grund dafür steht in [DECISIONS.md](DECISIONS.md), ADR-002.

### Was drin ist

- **Heute** – Tagesplan, fortsetzbare Sitzung, fällige Wiederholungen, neue Wörter,
  Sitzungsdauer (kurz / standard / intensiv), Tagesziel
- **Kurse** – 56 Kurmancî-Kapitel mit je fünf Abschnitten (Lernen · Festigen ·
  Schreiben · Hören und Sprechen · Kapitelprüfung), Lernziel, Sterne und Fortschritt,
  dazu Beispielsätze und eine deutsche Grammatik-Notiz je Kapitel
- **Weitere Sprachen** – Englisch, Französisch, Türkisch und Spanisch mit je zehn
  Kapiteln à acht Wörtern. Sie haben einen **eigenen, getrennten** Fortschritt und
  speisen nur XP in den Hauptlernstand zurück — keine Wiederholkarten, keine Sterne,
  keine Serie (ADR-007). Die Sprachwahl liegt hinter der Flagge oben links; Kurmancî
  trägt die Kurdistan-Flagge.
- **Üben** – heutige Mischung, Wiederholen, schwierige Wörter, Bilder, Hören,
  Schreiben, Schnellwahl, Bedeutungen, Satzbau, Grammatik und Aussprache
- **Entdecken** – Wörterbuch, Lesetexte mit anklickbaren Wörtern, Beispielsätze,
  Schrift-Umwandlung (Latein ↔ arabische Schrift), Redewendungen und Kultur
- **Fortschritt** – Fertigkeiten (Erkennen, Abrufen, Schreiben, Hören),
  Wochenaktivität, Wochenliga, Lernzeit, Export und Import, Anki-Export
- **Abenteuer** – zehn Welten mit gezeichneten Landschaften, Weltkarte mit Lernpfad,
  4 Tages- und 3 Wochenaufgaben, Schatztruhen, Shop mit 6 Artikeln (nur Kosmetik),
  9 Auszeichnungen
- **Hêlo** – der eigene Adler als SVG-Maskottchen in 14 Haltungen

## Code lernen

Web-Grundlagen von ganz vorn — lesen, antippen, selbst bauen.

| | |
|---|---|
| Lernpfade | **7**: HTML (9 Lektionen), CSS (9), JavaScript (9), TypeScript (4), GitHub (4), VS Code (4), Mini-Projekte (4) |
| Lektionen | **43** |
| Interaktive Schritte | **141** (Antwort wählen, Code aus Bausteinen bauen, selbst tippen) |
| Mitmach-Aufgaben | **29** mit Live-Vorschau und automatischer Prüfliste — 12 Grundübungen, 17 Aufbau-Aufgaben |
| Projekt-Übungen | **6** mit eigener Notiz statt Autoprüfung |

Dazu eine Bildschirmtastatur für Code-Zeichen (`< > " = :`) und ganze Bausteine, damit
das Bauen auch auf dem Handy funktioniert. Die HTML-Vorschau läuft in einem
Sandbox-iframe ohne Skripte. Ein **Fehlerbuch** hält eigene Fehler und ihre Lösungen
fest — lokal auf dem Gerät.

## AI-Sprache

Wie man ChatGPT, Claude und Claude Code klare Aufträge gibt.

| | |
|---|---|
| Lektionen | **10** — vom „Was ist ein Prompt?" bis zum vollständigen Claude-Code-Auftrag |
| Übungen | **6** |
| Mitmach-Aufgaben | **3** mit Prüfliste |

Bereiche: **Heute · Auftrag · Bug-Report · PR prüfen · Lernen.** Der Auftrag-Baukasten
führt durch Ziel, Ort, Verbote und Prüfung und zeigt an, welche Bausteine noch fehlen;
dasselbe für Bug-Reports (Passiert · Erwartet · Nachstellen · Gerät) und für die
PR-Checkliste vor einem Merge. Angefangene Aufträge bleiben gespeichert.

## Elektro-Lehre

Für Schule, Betrieb und Prüfungsvorbereitung.

| | |
|---|---|
| Lektionen | **11** in drei Gruppen (Grundlagen, Sicherheit, Praxis) |
| Übungen | **6** |
| Rechenaufgaben | **10** mit Sofortprüfung (Ohm, Leistung, Energie, Reihe, Parallel, FI) |
| Standardfächer für die Noten | **8**, änderbar |

Bereiche: **Heute · Noten · Prüfung · Bericht · Formeln · Lernen.** Die Noten rechnen
Durchschnitt, Trend und die für ein Ziel noch nötige Note aus; Prüfungen zeigen die
verbleibenden Tage; das Berichtsheft führt die offenen Wochen. Die Formelsammlung
enthält Ohm, Leistung, Energie und Kosten, Spannungsfall und Mindestquerschnitt sowie
die fünf Sicherheitsregeln.

---

## Local-first

Alle vier Apps sind so gebaut, dass sie ohne Server vollständig funktionieren
([ADR-001](DECISIONS.md)).

**Offline vollständig:** alle vier Apps mit ihren Inhalten — der ganze Kurmancî-Kurs,
die vier Nebensprachkurse, alle Bilder und Aufnahmen, Grammatik, Kultur, Lesetexte,
Schrift-Umwandlung, die Code-Lektionen mit Schritten und Mitmach-Aufgaben, die
AI-Sprache samt Werkstatt, die Elektro-Lehre samt Rechnern, Noten und Berichtsheft,
dazu sämtliche Lernstände, Shop, Aufgaben und Auszeichnungen. Ein Service Worker hält
die App-Hülle vor, sodass auch Tiefenlinks wie `/course/12` ohne Netz aufgehen; die App
ist installierbar.

**Nur mit Verbindung:** das große Wörterbuch, die Wiktionary-Daten, das
Kurdish-Tech-Wörterbuch und die Tatoeba-Beispielsätze. Sie kommen als statische
JSON-Dateien unter `/daten` aus einem Cloudflare-R2-Bucket. Fehlen sie, bleiben Suche
und Beispielsätze leer — sonst ändert sich nichts. Betroffen ist nur die Sprach-App.

**Optional:** ein Konto. Es läuft über einen Cloudflare Worker mit D1 und dient der
Anmeldung, nicht dem Gerätesync. Ohne Backend erkennt die App das und läuft unverändert
weiter. Wer „ohne Konto lernen" wählt, wird nicht wieder gefragt.

Kein Tracking, keine Analysewerkzeuge, keine Übertragung persönlicher Lernstände.

## Lokal starten

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

Optional lässt sich der Wörterbuch-Server für die große SQLite-Datenbank starten
(Node 22.5+, eingebautes `node:sqlite`):

```bash
node server.js
```

Standardpfad der Datenbank ist `local-data/private/red-kurd.db`. Anpassbar über
`RED_KURD_DB`, dazu `RED_KURD_HOST` (Standard `127.0.0.1`), `RED_KURD_PORT`
(Standard 3001) und `RED_KURD_ORIGINS`. Ohne diesen Server nutzt die App die
öffentlichen JSON-Daten unter `/daten`.

## Prüfen und bauen

```bash
npm run typecheck   # tsc --noEmit, strict
npm run lint        # oxlint über src test scripts server.js sites
npm test            # node --test über test/
npm run build       # Produktionsbündel
npm run check       # typecheck + lint + test + build nacheinander
```

`npm run content:check` prüft nur die Kursdaten (Kapitelzahl, eindeutige Paare,
Fotopfade, Lizenzangaben).

Die Testsuite umfasst derzeit 36 Dateien mit 375 Tests und läuft ohne DOM.

## Speicheraufteilung

- **Im Browser:** Profil, die vier Lernstände, Serie, Einstellungen, Shop, Aufgaben,
  Auszeichnungen, Fehlerbuch, Noten und Berichtsheft sowie die eigenen
  Sprachaufnahmen.
- **In Cloudflare:** die Web-App sowie die öffentlichen Wörterbuch- und Satzdateien.
  Der Upload ist auf 3 GiB insgesamt und 95 MiB je Datei begrenzt.
- **Nur lokal:** große Rohdatenbanken, Sicherungen und private Quelldateien unter
  `local-data/private`.

Nicht in einer Sicherung enthalten sind bewusst zwei Dinge: die Entscheidung „ohne
Konto lernen" (sie gehört diesem Gerät) und die laufende Sitzung (sie würde sonst auf
einem anderen Gerät halb fertig wiederbelebt).

Öffentliche Daten werden unter `local-data/cloudflare` vorbereitet, mit
`npm run data:check` geprüft und mit `npm run data:upload` nach R2 übertragen. Der
Ordner wird nicht in Git aufgenommen. Welcher Speicher was enthält, steht vollständig
in [STORAGE.md](STORAGE.md).

## Veröffentlichen

Die öffentliche Version läuft als Cloudflare Worker mit statischen Assets, einem
R2-Bucket für die Zusatzdaten und D1 für die Konten. Tiefenlinks wie `/today`,
`/course/…`, `/languages/…` und `/adventure/…` gibt der Worker an die App weiter.

Nach `npm run build` können die App-Dateien mit `npm run app:upload` in denselben
R2-Bucket geladen werden. Servercode, Kursdaten und Hosting-Metadaten werden dabei
ausgelassen.

## Aufbau

Lernlogik (`src/core`) und Oberfläche (`src/modes`, `src/components`, `src/features`)
sind getrennt. App-Auswahl und Umschalter liegen in `src/features/app-mode/`, die drei
neuen Apps je in einem eigenen Feature-Ordner. Einzelheiten in
[ARCHITEKTUR.md](ARCHITEKTUR.md).

- [ARCHITEKTUR.md](ARCHITEKTUR.md) — die vier Apps, Module, Routen, Worker, Offline-Vertrag
- [STORAGE.md](STORAGE.md) — jeder Speicherort mit Feldern, Export- und Migrationslage
- [DECISIONS.md](DECISIONS.md) — die Architektur-Entscheidungen (ADR-001 bis ADR-007)
- [ROADMAP.md](ROADMAP.md) — die Phasen
- [AUFGABEN.md](AUFGABEN.md) — Einzelaufgaben ohne Phasenbezug

## Barrierefreiheit

Sichtbarer Tastaturfokus, Touchflächen ab 44 × 44 px, WCAG-AA-Kontraste, `lang="ku"`
für Kurmancî, `dir="rtl"` für arabische Schrift, reduzierte Animationen bei
`prefers-reduced-motion`, Screenreader-taugliche Fortschrittsbalken.

## Datenquellen und Lizenzen

- Eigener Code: MIT-Lizenz
- Aussprache-Aufnahmen: Lingua Libre, CC BY-SA — 321 Aufnahmen liegen lokal in der App,
  für alles Übrige springt die Computerstimme ein
- Fotos: Wikimedia Commons, je mit Urheber und Lizenz in `credits.json`
- Tatoeba-Sätze: CC BY 2.0 FR (Quellenangabe nötig)
- Wiktionary-Daten (kaikki.org): CC BY-SA / GFDL
- Kurdish-Tech-Wörterbuch: mit Erlaubnis der Urheber
- FreeDict-Wörterbücher: freie Lizenzen (GPL u. a.)
