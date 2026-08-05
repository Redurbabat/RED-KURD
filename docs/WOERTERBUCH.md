# Wörterbuch — Datenstrategie

Das Wörterbuch soll groß (Ziel: 455.000+ Einträge), schnell und offline
nutzbar sein — ohne das App-Bundle aufzublähen.

## Schichten

| Schicht | Ort | Größe | Wann |
|---|---|---|---|
| Kurswortschatz | im Bundle (`src/data/`) | ~215 kB | immer, local-first |
| Basiswörterbuch | `public/daten/woerter.json` u. a. | einige MB | lazy beim ersten Öffnen |
| Großes Wörterbuch | Chunks in `public/daten/` bzw. R2 | beliebig | lazy je Anfangsbuchstabe |
| Lokaler DB-Server | `server.js` + `red-kurd.db` (optional) | 455k+ | nur wenn gestartet |

Regeln:

- **Kein großes JSON statisch importieren** — nichts davon darf in den
  Vite-Bundle-Graph.
- Vorbild für Chunks ist die vorhandene KT-Chunk-Lösung in
  `src/core/data/staticData.js` (Index-Datei + Buchstaben-Chunks, Auswahl
  über `first`/`last`-Bereiche).
- Öffentliche Daten (Wörterbuch, Beispielsätze) dürfen nach R2; private
  Daten (Favoriten, Verlauf, „zum Lernen“) bleiben im Browser.

## Bekannte Schwachstellen (aus der Analyse)

1. `ladeStatisch()` lädt `woerter.json` + `wiki.json` + `beispiele.json`
   als Alles-oder-nichts via `Promise.all` ohne `r.ok`-Prüfung komplett in
   den RAM — auf dem iPhone die größte Skalierungs-Schwachstelle. → In
   Chunks mit Index zerlegen, nur den passenden Chunk laden, Fehler je
   Datei abfangen.
2. `zufallsPaare` fällt bei zu wenigen deutschen Sätzen auf **englische**
   Tatoeba-Übersetzungen zurück, die mit `lang="de"` angezeigt werden. →
   Sprachfeld mitgeben oder filtern.
3. Suche ist nicht diakritik-tolerant: „cawa“ findet „çawa“ nicht; der
   SQLite-Server ist bei Ç/Ş/Ê/Î/Û zudem case-sensitiv. → dieselbe
   Normalisierung wie `istRichtigGetippt` (ê→e usw.) auf Suchbegriff und
   Datenseite anwenden; serverseitig eine normalisierte Spalte.
4. Soranî-Einträge (ckb, arabische Schrift) werden ohne `dir="rtl"`
   gerendert; Zazakî (zza) ist fälschlich als `lang="ku"` etikettiert. →
   `sprachAttribute()` aus `src/core/languages/languages.js` verwenden.
5. Die Behauptung „rund 840.000 Wortpaare“ ist hartkodiert und stimmt
   offline nicht. → aus dem tatsächlich geladenen Bestand ableiten.

## Gewünschte Funktionen (Reihenfolge)

1. Suche Deutsch ↔ Kurmancî mit Diakritik-Toleranz und kurdischer
   Bildschirm-Tastatur (ê î û ş ç — `SpecialChars` existiert).
2. Beispielsätze (Tatoeba, mit Quellenangabe CC BY) und Audio je Eintrag.
3. Favoriten ⭐ und „zum Lernen hinzufügen“ (legt eine Karte im
   Wiederholsystem an — `merkeWort` existiert).
4. Verlauf der letzten Suchen (lokal).
5. Offline-Cache der geladenen Chunks in IndexedDB.
6. Wortart/Tags/Beugungen aus den Wiktionary-Daten (kaikki), sobald die
   Chunk-Struktur steht.

## Lizenzen

Tatoeba: CC BY 2.0 FR · FreeDict: GPL u. a. · Wiktionary/kaikki:
CC BY-SA / GFDL. Quellenangabe gehört in die App (Fußzeile/Quellen-Seite);
Daten mit unklarer Lizenz (Kurdish-Tech 455k) erst nach Klärung einbauen.
