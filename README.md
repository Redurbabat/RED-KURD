# RED-KURD – Kurmancî lernen, lokal und ohne Konto

RED-KURD ist eine Lern-App für **Deutsch → Kurmancî**. Sie läuft vollständig im
Browser: kein Konto nötig, kein Netz nötig, kein Abo, keine Werbung, kein
Echtgeld-Shop. Schwester-Projekt von
[BABAT-RED](https://github.com/Redurbabat/BABAT-RED).

Der Lernstand, das Profil, die Einstellungen und die eigenen Sprachaufnahmen bleiben
auf dem Gerät. Eine vollständige Sicherung geht jederzeit über Export und Import unter
„Fortschritt".

## Umfang

| | |
|---|---|
| Kurmancî-Kapitel | **56** in 10 Welten, je fünf Abschnitte |
| Lernpaare (Kurmancî) | **596** |
| Aussprache-Aufnahmen | **325** von Muttersprachlern (Lingua Libre, CC BY-SA) |
| Fotos | **154** (56 Kapitel- und Weltbilder, 98 Wortfotos), alle mit Urheber und Lizenz |
| Nebensprachkurse | **4** × 10 Kapitel × 8 Wörter = 320 Paare |
| Übungsarten | Auswahl in beide Richtungen, Eintippen, Bild, Hören, Satzbau, Aussprache, Grammatik |

Alles davon liegt im Bündel und funktioniert ohne Verbindung.

## Drei Oberflächen, ein Lernstand

| Modern | Abenteuer | Redlingo |
|---|---|---|
| Klare, ruhige Lernoberfläche | Spielerische Lernreise mit Weltkarte | Startseite mit Lernweg, Schnellzielen und Wochenliga |
| Heute · Kurse · Üben · Entdecken · Fortschritt · Einstellungen | Start · Lernpfad · Aufgaben · Kultur · Profil | Start · Kurse · Üben · Fortschritt · Profil |

Der Wechsel läuft über **Einstellungen → App-Modus**. Es ändert sich ausschließlich die
Darstellung: XP, Tagesserie, Wiederholsystem, Kursfortschritt, Sterne, Fertigkeiten und
laufende Sitzungen sind in allen drei Modi dieselben. Der Grund dafür steht in
[DECISIONS.md](DECISIONS.md), ADR-002.

## Vier kleine Nebensprachkurse

Neben Kurmancî gibt es Englisch, Französisch, Türkisch und Spanisch mit je zehn
Kapiteln à acht Wörtern. Sie haben einen **eigenen, getrennten Fortschritt** und speisen
nur XP in den Hauptlernstand zurück — keine Wiederholkarten, keine Sterne, keine Serie.
Sie sind eine Zugabe, kein zweiter Hauptkurs (ADR-007). Die Sprachwahl liegt hinter der
Flagge oben links; Kurmancî trägt die Kurdistan-Flagge.

## Was drin ist

- **Heute** – Tagesplan, fortsetzbare Sitzung, fällige Wiederholungen, neue Wörter,
  Sitzungsdauer (kurz / standard / intensiv), Tagesziel
- **Kurse** – 56 Kurmancî-Kapitel mit je fünf Abschnitten (Lernen · Festigen ·
  Schreiben · Hören und Sprechen · Kapitelprüfung), Lernziel, Sterne und Fortschritt,
  dazu Beispielsätze und eine deutsche Grammatik-Notiz je Kapitel
- **Üben** – heutige Mischung, Wiederholen, schwierige Wörter, Bilder, Hören,
  Schreiben, Schnellwahl, Bedeutungen, Satzbau, Grammatik und Aussprache
- **Entdecken** – Wörterbuch, Lesetexte mit anklickbaren Wörtern, Beispielsätze,
  Schrift-Umwandlung (Latein ↔ arabische Schrift), Redewendungen und Kultur
- **Fortschritt** – Fertigkeiten (Erkennen, Abrufen, Schreiben, Hören),
  Wochenaktivität, Wochenliga, Lernzeit, Export und Import, Anki-Export
- **Abenteuer** – zehn Welten mit gezeichneten Landschaften, Weltkarte mit Lernpfad,
  Tages- und Wochenaufgaben, Schatztruhen, Shop (nur Kosmetik), Auszeichnungen
- **Hêlo** – der eigene Adler als SVG-Maskottchen in 14 Haltungen

## Local-first

Die App ist so gebaut, dass sie ohne Server vollständig funktioniert
([ADR-001](DECISIONS.md)).

**Offline vollständig:** der ganze Kurmancî-Kurs, die vier Nebensprachkurse, alle
Bilder und Aufnahmen, Grammatik, Kultur, Lesetexte, Schrift-Umwandlung, der komplette
Lernstand, Shop, Aufgaben und Auszeichnungen. Ein Service Worker hält die App-Hülle
vor, sodass auch Tiefenlinks wie `/course/12` ohne Netz aufgehen; die App ist
installierbar.

**Nur mit Verbindung:** das große Wörterbuch, die Wiktionary-Daten, das
Kurdish-Tech-Wörterbuch und die Tatoeba-Beispielsätze. Sie kommen als statische
JSON-Dateien unter `/daten` aus einem Cloudflare-R2-Bucket. Fehlen sie, bleiben Suche
und Beispielsätze leer — sonst ändert sich nichts.

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
npm run check       # alle vier nacheinander
```

`npm run content:check` prüft nur die Kursdaten (Kapitelzahl, eindeutige Paare,
Fotopfade, Lizenzangaben).

## Speicheraufteilung

- **Im Browser:** Profil, Lernstand, Serie, Einstellungen, Shop, Aufgaben,
  Auszeichnungen und die eigenen Sprachaufnahmen.
- **In Cloudflare:** die Web-App sowie die öffentlichen Wörterbuch- und Satzdateien.
  Der Upload ist auf 3 GiB insgesamt und 95 MiB je Datei begrenzt.
- **Nur lokal:** große Rohdatenbanken, Sicherungen und private Quelldateien unter
  `local-data/private`.

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
sind getrennt. Einzelheiten in [ARCHITEKTUR.md](ARCHITEKTUR.md).

- [ARCHITEKTUR.md](ARCHITEKTUR.md) — Module, Routen, Modi, Worker, Offline-Vertrag
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
- Aussprache-Aufnahmen: Lingua Libre, CC BY-SA — 325 Aufnahmen liegen lokal in der App,
  für alles Übrige springt die Computerstimme ein
- Fotos: Wikimedia Commons, je mit Urheber und Lizenz in `credits.json`
- Tatoeba-Sätze: CC BY 2.0 FR (Quellenangabe nötig)
- Wiktionary-Daten (kaikki.org): CC BY-SA / GFDL
- Kurdish-Tech-Wörterbuch: mit Erlaubnis der Urheber
- FreeDict-Wörterbücher: freie Lizenzen (GPL u. a.)
