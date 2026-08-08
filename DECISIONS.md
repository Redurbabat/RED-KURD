# Architektur-Entscheidungen

Kurzform im ADR-Stil. Festgehalten wird, was der Code heute tatsächlich tut — nicht,
was einmal geplant war. Ältere Planungstexte (`AUFGABEN.md`) widersprechen diesen
Entscheidungen an mehreren Stellen; im Zweifel gilt dieses Dokument.

Status-Werte: **angenommen** (im Code umgesetzt) · **vorgeschlagen** (Bestätigung offen)

---

## ADR-001 — Local-first, kein Konto-Zwang

**Status:** angenommen

**Kontext**
`AUFGABEN.md` forderte in mehreren Punkten eine Supabase-Pflicht: Wörterbuch aus
Supabase-Tabellen, Tatoeba-Import in eine Cloud-Datenbank, Fortschritt nur über
Supabase Auth. Das hätte bedeutet: ohne Netz und ohne Konto keine App. RED-KURD wird
aber auf dem Handy, unterwegs und ohne verlässliche Verbindung benutzt. Ein Lernstand,
der an einen Server gebunden ist, ist bei Netzausfall wertlos.

**Entscheidung**
Die App läuft vollständig ohne Netz und ohne Konto. Kursdaten, Bilder, Audios und der
gesamte Lernstand liegen auf dem Gerät. Ein Konto ist optional und existiert nur im
Cloudflare-Betrieb (Worker + D1, `sites/auth.js`). Fehlt das Backend, erkennt
`authApi.kontoStatus()` das an 404/405 und die App läuft unverändert weiter. Die
Entscheidung „ohne Konto lernen" wird geräte-lokal in `red-kurd-ohne-konto-v1`
festgehalten und ist bewusst von Export und Import ausgenommen (`NUR_LOKAL` in
`src/core/storage.js`), damit ein eingelesenes Backup nicht die Anmeldeentscheidung
eines fremden Geräts überträgt.

**Folgen**
- Die Supabase-Punkte in `AUFGABEN.md` sind überholt und nicht umzusetzen.
- Datensicherung ist Sache des Nutzers: Export/Import unter „Fortschritt".
- Kein Gerätesync ohne Konto — bewusst in Kauf genommen.
- Der Preis steht in ADR-004: alle Lerninhalte müssen ins Bündel passen.

---

## ADR-002 — Ein gemeinsamer Lernstand für alle drei Oberflächen-Modi

**Status:** angenommen

**Kontext**
Es gibt drei Modi: `modern`, `abenteuer`, `redlingo`. Jeder eigene Lernstände hätte
bedeutet, dass ein Moduswechsel den Fortschritt scheinbar löscht — und dass Serie,
Wiederholkarten und XP dreifach gepflegt werden müssten.

**Entscheidung**
Genau ein Speicher hält den Lernstand: `red-kurd-progress-v2`
(`src/core/progress/progressStore.js`). Darin XP, Serie samt Serienschutz, Einheiten,
Sterne, Wiederholkarten, Tagesaktivität (60 Tage), Edelsteine, Schlüssel, Truhen und
Lernzeit. Der Modus steht in `red-kurd-ui-v1` und wirkt ausschließlich auf die
Darstellung: er setzt `data-mode` am `<html>`, wählt Navigation und CSS und schaltet
zwischen den Startseiten um. Die laufende Sitzung (`red-kurd-session-v2`) ist ebenfalls
gemeinsam — eine im Abenteuer begonnene Runde lässt sich in Modern fortsetzen.

**Entsprechend gemeinsam benutzt:** `ExercisePlayer` (`stil` ändert nur das Aussehen),
`sessionPlanner`, `exerciseFactory`, `courseRepository`, `AppShell`, sowie die Seiten
Einstellungen, Fortschritt, Onboarding und 404.

**Folgen**
- Der Moduswechsel-Dialog kann zusagen, dass nichts verloren geht — das stimmt.
- Ein Fehler in `progressStore` trifft alle drei Modi zugleich; entsprechend hoch ist
  der Testbedarf (heute: null Tests, siehe ROADMAP Phase 3).
- Ein Modus kann keine eigene Fortschrittsmechanik einführen, ohne diese Entscheidung
  aufzukündigen.
- Ausnahme ist ADR-007.

---

## ADR-003 — Eigener Router statt react-router

**Status:** angenommen

**Kontext**
Die App braucht echte Adressen, Tiefenlinks, Zurück-Taste und Weiterleitungen von
alten deutschen Adressen (`/kurs`, `/heute`, `/einstellungen` …). Ein Router-Paket
hätte das mitgebracht, aber Bündelgröße und eine weitere Abhängigkeit gekostet — bei
einer App, die offline vollständig laden muss, zählt jedes Kilobyte.

**Entscheidung**
Ein eigener Mini-Router in `src/app/router.jsx` (~180 Zeilen): History-API,
Hash-Fallback bei `file://`, `document.startViewTransition` wenn Animationen an sind,
erstes passendes Muster gewinnt bei exakter Segmentzahl. Keine Laufzeit-Abhängigkeit.

**Folgen**
Der Preis sind die Sonderfälle, die ein fertiges Paket schon gelöst hat. Sie mussten
nachträglich gehärtet werden und sind heute abgesichert:
- kaputte Prozentzeichen in der Adresse (`sichereDekodierung` statt nacktem
  `decodeURIComponent`, das sonst die App abstürzen lässt),
- externe und protokollrelative Ziele (`//host`, `mailto:`), die `history.pushState`
  mit einem SecurityError quittieren würden,
- `target="_blank"`, Mittelklick, Strg-/Cmd-Klick und reine Anker — die dürfen den
  Router nicht anfassen (`istInternerKlick`); bei fremdem `target` wird zusätzlich
  `rel="noopener noreferrer"` gesetzt,
- Query und Anker werden vor dem Musterabgleich abgeschnitten.

Abgesichert durch 21 Tests in `test/router.test.js`. Jede weitere Sonderregel gehört
dort hinein, bevor sie in den Router kommt. Bleibt der Router unter dieser Testdecke,
bleibt die Entscheidung tragfähig; wächst der Bedarf (verschachtelte Layouts,
Datenladen pro Route), ist sie neu zu prüfen.

---

## ADR-004 — Kursdaten als JS-Module im Bündel, nicht in einer Datenbank

**Status:** angenommen

**Kontext**
Aus ADR-001 folgt: was zum Lernen nötig ist, muss ohne Netz da sein. Eine Datenbank
als Quelle der Kursinhalte widerspricht dem direkt.

**Entscheidung**
Alle Lerninhalte liegen als JS-Module unter `src/data/` und wandern in das Bündel:
Kapitel und Wortschatz (56 Einheiten, 10 Welten, 596 Lernpaare), die vier
Nebenkurse, Grammatikübungen, Kultur- und Lesetexte, Foto- und Audioverweise. Bilder
und Aufnahmen liegen unter `public/` (rund 20 MB Bilder, 5,3 MB Audio) und werden vom
Service Worker mitgecacht.

Aus dem Netz kommt nur das, was ohnehin zu groß fürs Bündel ist: das große Wörterbuch,
Wiktionary-Daten, Kurdish-Tech und die Tatoeba-Beispielsätze — ausgeliefert aus
Cloudflare R2 unter `/daten/*` (`sites/worker.js`). Diese Quellen sind **optional**:
jeder Aufrufer fängt den Fehlschlag ab, `zufallsPaare()` fällt auf die Kapitelsätze
zurück. Ohne Worker bleiben Wörterbuchsuche und Tatoeba-Sätze leer, alles andere
funktioniert.

**Folgen**
- Inhaltsänderungen brauchen einen Build und ein Deployment, keine Datenpflege zur
  Laufzeit.
- Das Bündel wächst mit dem Kurs; bei deutlichem Wachstum ist Code-Splitting nach
  Welten zu prüfen, nicht der Umzug in eine Datenbank.
- Der `/daten/*`-Vertrag ist Teil der Architektur und gehört dokumentiert — er ist die
  einzige Netzabhängigkeit im Lernbetrieb.
- Der lokale `server.js` (Wörterbuch aus SQLite, Port 3001) ist ein Entwicklerwerkzeug,
  kein Teil des Auslieferungspfads: keine Datei unter `src/` ruft ihn auf.

---

## ADR-005 — Bei Migrationen wird kopiert, nie gelöscht

**Status:** angenommen

**Kontext**
Der Lernstand ist die einzige unersetzliche Nutzerdatei; sie liegt ausschließlich im
Browser des Nutzers. Eine fehlerhafte Migration oder ein Rückschritt auf eine ältere
App-Version darf sie nicht vernichten.

**Entscheidung**
`migriere()` in `src/core/storage.js` liest die alten v1-Schlüssel
(`red-kurd-fortschritt-v1`, `red-kurd-profil-v1`, `red-kurd-session-v1`,
`red-kurd-modus`), schreibt das Ergebnis unter den neuen Schlüssel und **lässt die
alten Werte liegen**. Geschrieben wird nur, wenn das Ziel noch leer ist; der Vorgang
ist über ein Modulflag idempotent und läuft einmalig beim Laden, vor dem ersten Render.
Dasselbe gilt für Inhaltsmigrationen: `migriereKarten` schreibt umbenannte
Kartenschlüssel um und behält Stufe und Fälligkeit; bei Kollision gewinnt die höhere
Stufe.

**Folgen**
- Ein Rückschritt auf eine ältere Version verliert nichts.
- Die alten Schlüssel bleiben dauerhaft im localStorage liegen und werden nie
  aufgeräumt. Sie sind klein und stehen nicht im Export — das wird akzeptiert.
- Jede künftige Migration folgt derselben Regel. Das gilt ausdrücklich auch für den
  geplanten Umzug nach IndexedDB (ROADMAP Phase 2): bestehende Daten werden kopiert,
  der localStorage-Bestand bleibt vorerst stehen.
- Migrationen sind damit datenverlust-kritischer Code — und heute ungetestet. Das ist
  die höchste Testpriorität der ROADMAP.

---

## ADR-006 — TypeScript schrittweise, aber strict von Anfang an

**Status:** angenommen

**Kontext**
Der Bestand ist JavaScript und JSX. Eine Migration in einem Zug ist bei dieser Größe
nicht realistisch. Der übliche Ausweg — nachsichtige Einstellungen, später verschärfen —
ist teurer, weil dann jede bereits migrierte Datei ein zweites Mal angefasst wird.

**Entscheidung**
`tsconfig.json` steht von Beginn an auf `strict` samt `noUncheckedIndexedAccess`,
`noImplicitOverride` und `noFallthroughCasesInSwitch`. `allowJs` ist an, damit Importe
aus `.js` funktionieren; **`checkJs` bleibt aus** — geprüft wird nur, was schon
migriert ist. `include` erfasst gezielt `src/**/*.ts`, `src/**/*.tsx` und
`src/types/**/*.d.ts`. Die Prüfung ist deshalb heute grün und bleibt es, weil jede neue
`.ts`-Datei sofort dem vollen Anspruch genügen muss.

Migrationsreihenfolge: **Kernlogik → Stores → Komponenten.** Zuerst die reinen Module
ohne Browser-Bindung (`scheduler`, `gamification`, `exerciseFactory`, `sessionPlanner`,
`transliteration`), dann die Speicher-Stores, zuletzt die Oberfläche.

Ergänzend eingerichtet: `npm run typecheck`, `npm run lint` (oxlint) und
`npm run check` als gemeinsame Klammer (typecheck + lint + test + build).

**Folgen**
- Der Fortschritt ist an der Zahl der `.ts`-Dateien ablesbar, nicht an Konfigflags.
- Reine Logik zuerst zu migrieren heißt: die Module mit dem besten Verhältnis von
  Nutzen zu Aufwand kommen zuerst, und sie sind zugleich die, die Tests brauchen.
- Ein zentrales Typenverzeichnis (`src/types/`) für die Speicherformen existiert noch
  nicht und ist Voraussetzung für den Store-Schritt.

---

## ADR-007 — Nebensprachen bleiben klein und haben eigenen Fortschritt

**Status:** **vorgeschlagen** — Produktentscheidung, Bestätigung durch den Eigentümer
steht aus

**Kontext**
Neben Kurmancî gibt es vier kleine Kurse: Englisch, Französisch, Türkisch, Spanisch,
je 10 Kapitel à 8 Wörter (`src/data/sprachkurse.js`). Sie haben einen eigenen
Fortschritt in `red-kurd-language-courses-v1`, getrennt vom Kurmancî-Lernstand. Sie
speisen nur XP zurück, erzeugen **keine** Wiederholkarten und tauchen in Statistik und
Fertigkeiten nicht auf.

**Entscheidung (vorgeschlagen)**
Das bleibt so. RED-KURD ist eine App zum Kurdischlernen (Deutsch → Kurmancî); die
Nebensprachen sind eine Zugabe und werden bewusst nicht ausgebaut. Konkret heißt das:
kein Wiederholsystem, keine Aufnahme in Serie, Sterne oder Liga, kein weiterer
Sprachzuwachs ohne neue Entscheidung.

**Alternative: allgemeines Lernsystem**
Die Sprachen würden gleichrangig, mit einem gemeinsamen Wiederholsystem und einem
Fortschrittsmodell je Sprache. Was das kostet:
- `progressStore` wird pro Sprache instanziiert — Kartenschlüssel, Serie, Sterne,
  Truhen und Tagesstatistik brauchen eine Sprachdimension. Das ist eine Migration des
  größten und heute ungetesteten Speichers (siehe ADR-005).
- `courseRepository`, `sessionPlanner`, `exerciseFactory` und alle Selektoren müssten
  von den fest importierten Kurmancî-Daten gelöst werden.
- Die Oberfläche braucht überall eine Sprachwahl: Startseite, Statistik, Aufgaben,
  Auszeichnungen, Shop-Wirkungen.
- Inhaltlich: 80 Wörter je Nebensprache sind kein Kurs. Gleichrangigkeit hieße, vier
  weitere Kurse in der Tiefe des Kurmancî-Kurses zu schreiben — 56 Einheiten, Fotos,
  Audios, Grammatik, Kultur — samt Lizenzpflege.
- Die Identität der App verschiebt sich von „Kurdisch lernen" zu „irgendeine Sprache
  lernen", wo es starke bestehende Angebote gibt.

**Folgen (bei Beibehaltung)**
- Zwei Fortschrittsmodelle nebeneinander; ein Export enthält beide, aber sie werden
  nirgends verrechnet.
- Nutzer sehen bei den Nebensprachen keine Wiederholungen und keine Serie. Das ist
  Absicht und sollte in der Oberfläche benannt werden, damit es nicht als Fehler wirkt.
- Der Umfang von `sprachkurse.js` bleibt eingefroren, solange dieser ADR gilt.
