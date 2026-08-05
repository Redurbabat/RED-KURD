# CLAUDE.md — Regeln für die Arbeit an RED-KURD

RED-KURD ist eine lokale, kostenlose, mobile-first Sprachlern-App für
deutschsprachige Nutzer. Kurmancî ist die wichtigste Lernsprache, weitere
Sprachen folgen. Haupt-Zielgerät ist das iPhone 13 Pro Max (Viewport
428 × 926 CSS-px). Diese Datei ist verbindlich für jede Änderung.

## Projektabgrenzung

- Nur dieses Repository bearbeiten. Nicht an BABAT-RED, STRAN oder Redion arbeiten.
- Kein direkter Push auf `main` — immer über Branches/PRs.
- Kleine, überschaubare Änderungen. Keine großen Refactors ohne Plan.
- Keine neuen Dependencies ohne klare Begründung.

## Unverhandelbare Grundsätze

1. **Local-first.** Profil, Lernstand, Aufnahmen und Einstellungen bleiben im
   Browser. Kein Konto-Zwang, kein Tracking, kein Upload privater Daten.
2. **Lernstand darf niemals verloren gehen.** Jede Änderung an
   `src/core/storage.js` oder an Speicherformaten braucht Tests, bevor sie
   gemergt wird.
3. **Alte localStorage-Schlüssel werden kopiert, nie gelöscht.** Ein
   Rückschritt auf eine ältere App-Version darf nichts verlieren.
4. **Ein Lernstand für alle Modi.** Modern, Abenteuer und Redlingo sind nur
   Darstellungen — XP, Serie, Karten, Sitzungen, Einheiten und Fertigkeiten
   sind identisch. Niemals getrennte Fortschritts-Schlüssel pro Modus anlegen.
5. **Deutsch ist die Haupt-Bediensprache.** Alle UI-Texte, Fehlermeldungen,
   Grammatik-Erklärungen und das Onboarding sind Deutsch. Wiederkehrende
   Texte gehören nach `src/core/texts.js`.
6. **Kurmancî bleibt der Hauptkurs**, aber nichts fest verdrahten: Sprachen
   sind Daten (siehe `src/core/languages/`), keine Sonderfälle im Code.

## Architektur

- `src/core/` enthält die Lernlogik — ohne Oberfläche, ohne React.
- `src/modes/` und `src/features/` enthalten Darstellung — **keine Lernlogik
  in Seiten oder Komponenten.** Seiten rufen Selektoren und Planer auf.
- Stores melden Änderungen über `melden()`; Seiten lesen mit `useLernstand()`.
- Alle localStorage-Zugriffe laufen über `src/core/storage.js` — nirgendwo
  direkt `localStorage` verwenden.
- Details: `ARCHITEKTUR.md`.

## Daten und Bundle

- Keine großen Wörterbuch-, Audio- oder Bilddaten ins App-Bundle. Große Daten
  liegen als Chunks unter `public/daten/` oder in Cloudflare R2 und werden
  lazy geladen.
- Nach R2 werden nur **öffentliche** Daten hochgeladen (Kursdaten, Audio,
  Bilder, Wörterbuch-Chunks) — niemals Profile, Lernstände oder Aufnahmen.
- Fremddaten nur mit geklärter Lizenz; Quelle und Lizenz mitspeichern
  (siehe README „Datenquellen & Lizenzen“).

## iPhone / Mobile-UI

- Buttons mindestens 44 × 44 px; wichtige Buttons 52–56 px hoch.
- Bottom-Navigation auf Mobilgeräten; Safe-Area-Insets
  (`env(safe-area-inset-*)`) beachten — `viewport-fit=cover` ist gesetzt.
- Keine horizontale Scrollbar, keine `100vw`-Fallen.
- Kein Hover-only-Verhalten; alles per Touch erreichbar.
- Eingabefelder mindestens 16 px Schriftgröße (sonst zoomt iOS-Safari).
- Keine Inline-Styles für Aussehen — nur Tokens (`src/styles/tokens.css`)
  und Klassen.
- Icons aus `components/icons/Icon.jsx`, nicht aus Emojis.

## Sprache und Barrierefreiheit

- Kurmancî-Text bekommt `lang="ku"`; arabische Schrift zusätzlich `dir="rtl"`.
- Jede Schaltfläche hat Text oder `aria-label`.
- WCAG-AA-Kontraste, sichtbarer Tastaturfokus, `prefers-reduced-motion`
  respektieren.
- Antwortbewertung fair halten: Groß-/Kleinschreibung und Leerzeichen
  tolerant, kurdische Sonderzeichen (ê î û ç ş) beachten, kleine Tippfehler
  verzeihen.

## Arbeitsweise

- Vor jedem Merge: `npm test` und `npm run build` müssen grün sein.
- Storage-Migrationen nie ohne Tests ändern.
- Nach jeder Phase kurz zusammenfassen: geänderte Dateien, gelaufene Tests,
  verbleibende Risiken.
- Kommentare und Bezeichner im Code auf Deutsch (bestehende Konvention).

## Befehle

```bash
npm install        # Abhängigkeiten
npm run dev        # Entwicklung (http://localhost:5173)
npm test           # node --test (Testdateien unter test/)
npm run build      # Produktions-Build + Sites-Vorbereitung
npm run data:check # Cloud-Daten prüfen (Dry-Run)
```
