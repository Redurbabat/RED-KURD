# Architektur-Entscheidungen

Kurzform im ADR-Stil. Festgehalten wird, was der Code heute tatsächlich tut — nicht,
was einmal geplant war. Ältere Planungstexte (`AUFGABEN.md`) widersprechen diesen
Entscheidungen an mehreren Stellen; im Zweifel gilt dieses Dokument.

RED-KURD ist seit den Pull Requests #5–#7 eine Website mit **vier eigenständigen Apps**
(ADR-007). Entscheidungen, die nur für die Sprach-App gelten, sind unten als solche
benannt; für alles Übergreifende gelten ADR-007 und ADR-008.

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
eines fremden Geräts überträgt. Aus demselben Grund steht dort inzwischen auch die
laufende Sitzung (`sitzung`): eine halb fertige Übungsrunde gehört dem Gerät, auf dem
sie begonnen wurde, und darf anderswo nicht wiederbelebt werden.

**Folgen**
- Die Supabase-Punkte in `AUFGABEN.md` sind überholt und nicht umzusetzen.
- Datensicherung ist Sache des Nutzers: Export/Import unter „Fortschritt".
- Kein Gerätesync ohne Konto — bewusst in Kauf genommen.
- Der Preis steht in ADR-004: alle Lerninhalte müssen ins Bündel passen.

---

## ADR-002 — Ein gemeinsamer Lernstand für die drei Ansichten der Sprach-App

**Status:** angenommen

**Kontext**
Die Sprach-App hat drei Ansichten: `modern`, `abenteuer`, `redlingo`. Sie sind
Ansichten **einer** App, keine eigenen Apps (ADR-007). Jeder eigene Lernstände hätte
bedeutet, dass ein Ansichtswechsel den Fortschritt scheinbar löscht — und dass Serie,
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
- Der Ansichtswechsel-Dialog kann zusagen, dass nichts verloren geht — das stimmt.
- Ein Fehler in `progressStore` trifft alle drei Ansichten zugleich; entsprechend hoch
  ist der Testbedarf. Inzwischen abgedeckt durch 21 Tests in `test/progressStore.test.js`.
- Eine Ansicht kann keine eigene Fortschrittsmechanik einführen, ohne diese
  Entscheidung aufzukündigen.
- **Diese Entscheidung gilt nur innerhalb der Sprach-App.** Über die vier Apps hinweg
  gibt es keinen gemeinsamen Lernstand (ADR-008); die vier Nebensprachkurse innerhalb
  der Sprach-App haben ebenfalls einen eigenen Stand (ADR-007).

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
Alle Lerninhalte liegen als JS-Module und wandern in das Bündel. Für die Sprach-App
unter `src/data/`: Kapitel und Wortschatz (56 Einheiten, 10 Welten, 596 Lernpaare), die
vier Nebenkurse, Grammatikübungen, Kultur- und Lesetexte, Foto- und Audioverweise.
Bilder und Aufnahmen liegen unter `public/` (rund 20 MB Bilder, 5,3 MB Audio) und
werden vom Service Worker mitgecacht.

Die drei anderen Apps folgen derselben Regel an ihrer eigenen Stelle:
`src/features/code-learning/data/`, `src/features/prompting-learning/data/` und
`src/features/electro-learning/data/` (Lektionen, Übungen, Praxisaufgaben). Sie liegen
hinter `React.lazy` und werden im Leerlauf nachgeladen — der Start der Sprach-App
bleibt schlank, offline ist trotzdem alles da.

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
- Dieselbe Regel gilt für die App-Wahl: `saveAppMode()` schreibt den neuen Schlüssel
  `red-kurd-active-app-v1` **und** den älteren `red-kurd-active-app-mode-v1`. Ein
  gespeicherter Altwert `adventure` war nie eine eigene App und wird zu „Sprache
  lernen + Abenteuer-Ansicht" migriert (`appModeStorage.js`).
- Migrationen sind datenverlust-kritischer Code und inzwischen abgedeckt:
  `test/storage.test.js` und `test/storage-basis.test.js` prüfen v1→v2 für Fortschritt,
  Profil, Sitzung und Modus, `migriereKarten` samt Kollisionsregel, die Idempotenz und
  dass die alten Schlüssel liegen bleiben.

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
- Das zentrale Typenverzeichnis existiert inzwischen: `src/types/lernstand.d.ts`,
  vorerst eine reine Deklarationsdatei (`checkJs` ist aus). Sie beschreibt heute die
  Speicherformen der **Sprach-App** — Lernstand, Karte, Tag, Profil, UI, Sitzung, Shop,
  Nebensprachen, Sicherung.
- Die Formen der drei neuen Apps fehlen dort noch: Bereichs-Lernstand
  (`code`/`prompting`/`electro`), Elektro-Schule, Prompting-Werkstatt, Fehlerbuch und
  die App-Wahl. Sie gehören dazu, bevor die Stores nach TypeScript wandern
  (ROADMAP Phase 2).

---

## ADR-007 — RED-KURD ist eine Lernplattform mit vier Apps

**Status:** **angenommen** — umgesetzt in den Pull Requests #5–#7

**Kontext**
Bis dahin war RED-KURD eine App zum Kurdischlernen mit drei Oberflächen-Ansichten. Eine
frühere Fassung dieses ADR hielt genau das fest — „RED-KURD bleibt eine Kurdisch-Lern-App",
Status vorgeschlagen, mit dem Gegenentwurf „allgemeines Lernsystem" daneben.

Der tatsächliche Bedarf war aber nicht „mehr Sprachen", sondern anderer Lernstoff neben
der Sprache: Programmieren, der Umgang mit KI-Werkzeugen und der Stoff der Elektro-Lehre
(Schule und Betrieb). Diesen Stoff in den Kurmancî-Kurs zu pressen — als weitere Welten
oder Einheiten — hätte den Kurs verfälscht: er braucht andere Lektionsarten (laufender
Code, Rechenaufgaben, Prüfungen, Noten, Berichtsheft), andere Maßeinheiten und kein
Vokabel-Wiederholsystem. Die Frage war damit nicht mehr, ob die App eine Kurdisch-App
bleibt, sondern wo der neue Stoff hingehört.

**Entscheidung**
RED-KURD ist eine Website mit vier eigenständigen Apps. Die Liste steht in
`src/features/app-mode/appModes.js`:

| App | Kennung | Code | Lernstand |
|---|---|---|---|
| Sprache lernen | `language` | `src/modes/`, `src/features/`, `src/app/AppRouter.jsx` | `red-kurd-progress-v2` |
| Code lernen | `code` | `src/features/code-learning/` | `red-kurd-code-progress-v1` |
| AI-Sprache | `prompting` | `src/features/prompting-learning/` | `red-kurd-prompting-progress-v1` |
| Elektro-Lehre | `electro` | `src/features/electro-learning/` | `red-kurd-electro-progress-v1` |

**Sichtbar ist immer genau eine App.** `App.jsx` rendert nach `activeMode` entweder die
Sprach-App (mit Router und Hülle) oder genau eine der drei anderen. Der Einstieg ist die
Vollbild-Auswahl `AppLauncher.jsx` beim allerersten Start; danach öffnet sich direkt die
zuletzt genutzte App, und der `AppModeSwitcher.jsx` am oberen Rand führt zwischen den
Apps und über „Apps" zur Auswahl zurück. Die Wahl liegt in `KEYS.appAktiv`
(`red-kurd-active-app-v1`), der ältere `KEYS.appBereich` wird mitgeschrieben (ADR-005).

**Sprache lernen ist die größte und namensgebende App.** Sie ist die einzige mit eigenem
Router, eigener Hülle (`AppShell`, Navigation, Zusatzspalte), mit dem Wiederholsystem und
mit drei Ansichten über **einem** Lernstand (ADR-002). **Abenteuer ist eine Ansicht der
Sprach-App, kein eigener App-Bereich** — ein alter gespeicherter Wert `adventure` wird
beim Laden zu „Sprache lernen + Abenteuer-Ansicht" migriert.

**Folgen**

*Was die Entscheidung einbringt*
- Jeder Stoff bekommt die Lektionsart, die zu ihm passt, ohne den Kurmancî-Kurs zu
  verbiegen.
- Local-first gilt unverändert für alle vier Apps (ADR-001): kein Konto, kein Netz nötig.

*Was sie kostet*
- **Geteilte Bausteine.** Was mehr als eine App braucht, liegt zentral:
  `src/core/lernbereiche/bereichsLernstand.js` (der Lernstand-Baukasten der drei neuen
  Apps), `src/core/lernbereiche/wochenUebersicht.js` sowie `LernpfadKarte.jsx`,
  `LektionModal.jsx`, `LektionPlayer.jsx`, `UebungModal.jsx`, `PraxisAufgabe.jsx` und
  `CodeTastatur.jsx` in `src/features/app-mode/`. Der Preis: dieser Ordner ist heute
  zweierlei zugleich — App-Umschalter **und** Sammelstelle gemeinsamer Lernbausteine.
- **Was der gemeinsame Kern ist, ist nicht abschließend beantwortet.** Heute gilt als
  gemeinsam: Speicherschicht, Serienregel, Lektions-Statusableitung, Wegkarte,
  Übungs-Modale, Wochenübersicht. Nicht gemeinsam: Router und Hülle (nur Sprach-App),
  Wiederholsystem (nur Sprach-App), Währungen, Sterne, Shop, Auszeichnungen (nur
  Sprach-App). Diese Grenze ist gewachsen, nicht entworfen, und gehört bei der nächsten
  gemeinsamen Funktion neu geprüft.
- **Vier Fortschritte.** Vier Schlüssel, kein gemeinsamer Lernstand — Einzelheiten und
  Begründung in ADR-008.
- **Größerer Prüfaufwand.** Jede Änderung an `storage.js`, am Sicherungsformat oder am
  Lernstand-Baukasten betrifft vier Apps zugleich. `test/sicherungRundlauf.test.js` prüft
  deshalb den vollen Weg über alle vier: füllen → exportieren → Gerät leeren →
  importieren. Fehlt beim Hinzufügen einer App der Schlüssel in `KEYS`, fehlt ihr Stand
  still in jeder Sicherung.
- **Nur die Sprach-App hat Adressen.** Code lernen, AI-Sprache und Elektro-Lehre stehen
  nicht im `AppRouter`; sie werden in `App.jsx` nach `activeMode` gerendert und führen
  ihre Unterbereiche in Komponentenzustand. Sie sind damit nicht verlinkbar, und die
  Zurück-Taste wirkt in ihnen nicht. Das ist ein offener Preis (ROADMAP Phase 4).
- **Der Name deckt die Plattform nicht mehr.** „RED-KURD" beschreibt die Sprach-App.
  Das wird bewusst hingenommen, solange sie die größte App bleibt.

*Innerhalb der Sprach-App bleibt es beim Bisherigen*
- Die vier Nebensprachkurse (Englisch, Französisch, Türkisch, Spanisch; je 10 Kapitel,
  je 80 Wörter, `src/data/sprachkurse.js`) bleiben klein und behalten ihren eigenen
  Fortschritt in `red-kurd-language-courses-v1`: kein Wiederholsystem, keine Serie,
  keine Sterne, keine Aufnahme in Statistik oder Fertigkeiten.
- Deutsch → Kurmancî bleibt der Hauptkurs. Ein weiterer Sprachzuwachs braucht eine
  eigene Entscheidung; die Plattform wächst über neue Apps, nicht über neue Sprachen.
- Dass Nebensprachen keine Wiederholungen und keine Serie zeigen, ist Absicht und
  gehört in der Oberfläche benannt, damit es nicht als Fehler wirkt.

---

## ADR-008 — Jede App hat ihren eigenen Lernstand; geteilt werden die Regeln, nicht die Zahlen

**Status:** **angenommen** — der Code ist eindeutig; offen ist nur eine Teilfrage
(siehe Folgen)

**Kontext**
Aus ADR-007 folgt unmittelbar die Frage: Teilen sich die vier Apps die Lernstand-Konzepte
— XP, Serie, Wiederholsystem — oder bleibt jede bei ihrem eigenen? Ein gemeinsames
XP-Konto wäre einfacher zu erzählen („dein Lernstand"), würde aber Ungleiches addieren:
eine gelöste Vokabelaufgabe, eine gelöste Rechenaufgabe und eine geschriebene
Prompt-Übung sind nicht dieselbe Einheit.

**Befund am Code (Ist-Zustand)**
- **Vier getrennte Speicher**, kein übergreifender Lernstand: `red-kurd-progress-v2`
  (Sprache), `red-kurd-code-progress-v1`, `red-kurd-prompting-progress-v1`,
  `red-kurd-electro-progress-v1`.
- **Die drei neuen Apps teilen sich eine Implementierung.**
  `erstelleBereichsLernstand(key)` in `src/core/lernbereiche/bereichsLernstand.js` bindet
  dieselben Felder (`erledigt`, `notizen`, `xp`, `serie`, `letzterTag`, `tage`) und
  dieselben Regeln an je einen Schlüssel: XP gibt es nur beim ersten Abschluss, der
  Lektionsstatus wird immer aus dem Lernstand abgeleitet (`done` → `current` → `open` →
  `locked`), Konstanten `XP_JE_LEKTION` = 10, `XP_JE_UEBUNG` = 15, `TAGESZIEL_XP` = 30.
- **Geteilt wird die Serienregel, nicht die Serie.** Alle drei rufen dieselbe reine
  Funktion `aktualisiereSerie()` aus `core/progress/gamification.js` und `heute()` aus
  `core/progress/scheduler.js` — jede aber auf ihrem eigenen Stand.
- **Die Sprach-App hat ihr eigenes, älteres und größeres Modell** (`progressStore.js`):
  XP, Serie samt Serienschutz, Einheiten, Sterne, Wiederholkarten, Tagesstatistik über 60
  Tage, Edelsteine, Schlüssel, Truhen, Lernzeit. Mit den anderen teilt sie nur die
  Serienregel.
- **Das Wiederholsystem gibt es nur in der Sprach-App.** `scheduler.js` (SM-2-Idee,
  Stufen mit den Abständen 1/3/7/16/35/70 Tage) arbeitet auf Karten. Die drei neuen Apps
  kennen keine Karten: ihr Lernstand merkt sich, **was** erledigt ist, nicht, **wann** es
  wieder fällig wird.
- **Das Tagesziel ist verschieden.** Die Sprach-App nimmt es aus dem Profil, die drei
  neuen Apps rechnen mit festen 30 XP.
- **Zusammengezählt wird nichts.** `core/lernbereiche/wochenUebersicht.js` legt die vier
  Stände nebeneinander, jeder mit eigener Einheit — die Sprach-App zählt Aufgaben, die
  anderen XP. Gemeinsames Maß ist allein „an diesem Tag war irgendwo etwas los"
  (`tageAktiv`) und die daraus abgeleitete Reihe (`reiheGesamt`).

**Entscheidung**
So bleibt es: **geteilt werden Regeln und Bausteine, nicht die Zahlen.** Konkret:
- Eine neue App übernimmt `erstelleBereichsLernstand`, statt eine eigene
  Fortschrittsmechanik zu schreiben.
- Braucht eine der neuen Apps später ein Wiederholsystem, wandert die Scheduler-Logik in
  den gemeinsamen Baukasten — es wird kein zweites System danebengestellt.
- Es gibt kein app-übergreifendes XP-Konto und keine gemeinsame Serie. Die einzige
  Klammer ist die Wochenübersicht, und sie addiert bewusst nicht.
- Die Sprach-App wird nicht auf den Baukasten umgestellt. Das wäre eine Migration des
  größten Speichers (ADR-005) und brächte nichts: Sterne, Truhen, Shop, Auszeichnungen
  und Wiederholkarten brauchen die anderen drei Apps nicht.

**Folgen**
- Ehrlich benannt: Es gibt vier XP-Zahlen und bis zu vier Serien. Eine Serie in einer App
  rettet die Serie einer anderen nicht. Das muss in der Oberfläche stehen, sonst wirkt es
  wie ein Fehler.
- **Offene Teilfrage:** Wer täglich lernt, aber die App wechselt, verliert je App die
  Serie und behält nur die Reihe der Wochenübersicht. Ob das reicht — oder ob die Reihe
  über alle Apps die sichtbare Hauptzahl werden sollte statt vier Einzelserien — ist noch
  nicht entschieden. Eine Antwort gehört als Nachtrag hierher, nicht in eine einzelne App.
- Ein Fehler in `bereichsLernstand.js` trifft drei Apps zugleich; abgesichert durch
  `test/bereichsLernstand.test.js`, die Wochenlogik durch `test/wochenUebersicht.test.js`.
- Jeder Lernstand wandert in die Sicherung: `exportiereSpeicherstand()` läuft über `KEYS`,
  ausgenommen `NUR_LOKAL` (`ohneKonto`, `sitzung`). Eine neue App ohne Eintrag in `KEYS`
  fehlt still in jedem Export — `test/sicherungRundlauf.test.js` ist die Absicherung
  dagegen.
- Ein Gerätesync (ROADMAP Phase 6) muss alle vier Stände tragen, nicht nur den
  Sprach-Lernstand.
