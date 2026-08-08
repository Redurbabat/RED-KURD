# Aufgaben

> **Die Phasen führt [ROADMAP.md](ROADMAP.md).** Diese Datei sammelt nur noch
> Einzelaufgaben ohne Phasenbezug — Ideen aus den Studien-Repos, die geprüft und
> entweder eingebaut oder verworfen wurden. Bei Widersprüchen gilt
> [DECISIONS.md](DECISIONS.md).

Herkunft: die Liste stammt aus der Auswertung von 23 offenen Lern- und Sprachprojekten
(Ordner „github lernen"). Der Stand unten ist am Code geprüft, nicht geschätzt.

---

## Erledigt

### Wörterbuch und Sprachdaten
- [x] **Wörterbuch angebunden** — nicht an eine Cloud-Datenbank, sondern an statische
      JSON-Dateien unter `/daten/*` (Cloudflare R2) mit dem optionalen Lokal-Server
      `server.js` als zweiter Quelle. Suche in beide Richtungen.
      (`src/core/data/staticData.js`, `src/features/dictionary/DictionaryView.jsx`)
- [x] **Tatoeba-Sätze** als `/daten/beispiele.json`; im Wörterbuch als Beispielsätze zum
      Wort, im Lesen-Bereich als eigener Bereich. Quellenangabe in der Fußzeile.
- [x] **Wiktionary/kaikki-Daten** als `/daten/wiki.json`: Wortart, Aussprache (IPA),
      Bedeutungen und Formen werden am Treffer angezeigt.
- [x] **Kurdish-Tech-Wörterbuch** (456 000+ Wörter) eingebunden — die Lizenzfrage ist
      geklärt, die Nutzung erfolgt mit Erlaubnis. Nachgeladen wird blockweise über
      `/daten/kt/{ku,sor,zza}/index.json`, damit nichts unnötig übertragen wird.
- [x] **Kurdische Bildschirm-Tastatur** (ê î û ş ç …) als `SpecialChars`-Komponente —
      im Suchfeld, im Schreib-Übungsfeld und in der Schrift-Umwandlung.

### Lernen
- [x] **Kursbaum** — 10 Welten mit Pfad und sichtbarem Fortschritt
      (`weltPfad`, `WorldDetailPage`, `CoursePage`).
- [x] **Übungstypen** — Auswahl in beide Richtungen (`wahl-ku`, `wahl-de`),
      Wort eintippen (`tippen`), Bildzuordnung (`bild`), Hörverstehen (`hoeren`),
      Satz aus Wortblöcken (`SentenceBuilder`), Aussprache (`PronunciationStudio`),
      Grammatik (`GrammarTrainer`).
- [x] **XP, Tagesserie, Level** und dazu Sterne, Edelsteine, Schlüssel, Truhen,
      Tages- und Wochenaufgaben, Auszeichnungen, Wochenliga.
- [x] **Spaced Repetition** — SM-2-vereinfacht in `src/core/progress/scheduler.ts`,
      Stufen 0–6 mit den Abständen 1/3/7/16/35/70 Tage.
- [x] **Eigene Kartenstapel** — `merkeWort()` aus dem Wörterbuch und aus dem Lesetext,
      dort auch „alle Wörter merken".
- [x] **Lernstatistik** — Fertigkeiten (Erkennen, Abrufen, Schreiben, Hören),
      Wochentabelle mit Aufgaben und davon richtig, gelernte und sichere Wörter,
      Lernzeit, Wochenliga (`progressSelectors.ts`, `/progress`).

### Lesen und Texte
- [x] **Lese-Modus** — kurdische Texte, jedes Wort anklickbar, Übersetzung und
      Aussprache im Wortfenster (`src/features/reading/ReadingView.jsx`).
- [x] **Angeklickte Wörter als Karteikarten speichern.**
- [x] **Bekannt-Markierung pro Wort** — gemerkte Wörter werden im Text hervorgehoben.

### Sprachwerkzeuge
- [x] **Schrift-Umwandlung Latein ↔ Arabisch** — eigene Regeln in
      `src/core/schrift/transliteration.ts`, Oberfläche unter `/explore/script`.

### Plattform
- [x] **Offline-Modus (PWA)** — Service Worker `public/sw.js` mit App-Hülle für
      Tiefenlinks, `manifest.webmanifest`, installierbar. Der Kurs liegt ohnehin
      vollständig im Bündel.
- [x] **Nutzerkonten** — umgesetzt über Cloudflare Worker + D1 (`sites/auth.js`),
      nicht über einen Fremdanbieter. Optional: ohne Backend läuft die App unverändert
      weiter (ADR-001).
- [x] **Weitere Sprachen** — Englisch, Französisch, Türkisch und Spanisch als kleine
      Nebenkurse mit eigenem Fortschritt (ADR-007).

---

## Offen

- [ ] **Beugungstabellen** — die Formen aus den Wiktionary-Daten werden heute nur als
      Textzeile („Formen: …") gezeigt. Eine echte Tabelle für Verben und Nomen fehlt.
      Der Lokal-Server hat dafür `/api/formen`, die App ruft es nicht auf.
- [ ] **FreeDict-Wörterbücher** (deu-kur, kur-deu, kur-eng, kur-tur, ckb-kmr) als
      zusätzliche Quelle in `/daten/woerter.json` — im Code nicht als eigene Quelle
      nachweisbar.
- [ ] **Apertium-Daten** (`apertium-kmr`, GPL — nur Daten, kein Code) als weitere
      zweisprachige Wortpaare kmr↔eng.
- [ ] **Tippfehler-Erkennung** bei Schreibübungen mit einer Hunspell-Wortliste.
      `istRichtigGetippt()` gleicht heute nur Sonderzeichen und Satzzeichen an; „fast
      richtig" gibt es nicht.
- [ ] **Lernkalender über das ganze Jahr** — heute gibt es die Woche und die letzten
      60 Tage im Lernstand, aber keine Jahresansicht.
- [ ] **Weitere kurdische Varianten** (Soranî, Zazakî) als eigene Kurse. Achtung:
      ADR-007 hält fest, dass die Nebensprachen bewusst klein bleiben — ein weiterer
      Sprachzuwachs braucht eine neue Entscheidung.

---

## Später, optional — nicht Teil des local-first-Kerns

Diese Punkte setzen einen Server oder einen fremden Dienst voraus. Sie stehen damit
gegen [ADR-001](DECISIONS.md) („die App läuft vollständig ohne Netz und ohne Konto")
und werden **nicht** umgesetzt, solange sie Voraussetzung für die normale Benutzung
wären. Falls sie je kommen, dann als reine Zugabe, die beim Ausfall nichts kaputt macht.

- [ ] ~~Supabase-Tabellen `woerter`, `saetze`, `satz_links` anlegen~~ —
      **überholt.** Wörterbuchdaten liegen als statische JSON-Dateien in R2, der
      Lernstand liegt im Browser. Es gibt kein Supabase im Projekt.
- [ ] ~~Tatoeba, FreeDict und Wiktionary in eine Cloud-Datenbank importieren~~ —
      **überholt.** Der Import läuft in flache JSON-Dateien, die offline
      zwischengespeichert werden können.
- [ ] ~~Fortschritt über Supabase Auth speichern~~ — **überholt.** Konto und Anmeldung
      laufen heute über Cloudflare D1 (`sites/auth.js`, `db/schema.ts`) und sind
      optional. Gerätesync gibt es bewusst nicht; gesichert wird über Export/Import
      unter „Fortschritt".
- [ ] Grammatikprüfung deutscher Antworten über die öffentliche LanguageTool-API —
      bräuchte bei jeder Übersetzungsübung einen Netzaufruf.
- [ ] Community-Beiträge: Nutzer schlagen Sätze und Übersetzungen vor, mit Prüfung vor
      der Veröffentlichung — braucht Backend, Moderation und Rechteklärung.
- [ ] Wort-für-Wort-Übersetzung mit Apertium — nur sinnvoll, wenn die Daten lokal
      mitgeliefert werden können.

---

## Regeln

1. Eigener Code bleibt MIT. Kein Code aus GPL/AGPL-Projekten kopieren — nur Ideen
   nachbauen und freie **Daten** nutzen. Quellenangaben in die Fußzeile.
2. InterdialectCorpus (CC BY-NC) nicht einbauen, solange unklar ist, ob die Seite je
   Geld verdienen soll.
3. Jede Aufgabe einzeln fertig bauen und testen, dann die nächste.
4. Nichts, was die App ohne Netz oder ohne Konto unbenutzbar macht (ADR-001).
