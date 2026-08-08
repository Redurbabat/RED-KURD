# Fahrplan

Sechs Phasen statt einer Wunschliste. Jede Phase hat ein Ziel, eine Checkliste und ein
Abschlusskriterium. Keine Termine, keine Stundenschätzungen — fertig ist, was das
Abschlusskriterium erfüllt.

Die Phasen bauen aufeinander auf, laufen aber nicht streng nacheinander: Phase 3 setzt
Phase 2 nur dort voraus, wo Typen die Tests tragen sollen.

Grundlage: die Storage- und Architektur-Inventur. Die Entscheidungen dahinter stehen in
[DECISIONS.md](DECISIONS.md).

---

## Phase 1 — Stabilität

**Ziel:** Der Baum ist grün, die Werkzeuge greifen, und die Doku widerspricht dem Code
nicht mehr.

- [x] Widersprüche in der Dokumentation bereinigt (`AUFGABEN.md` forderte eine
      Supabase-Pflicht, die dem local-first-Grundsatz widerspricht — siehe ADR-001)
- [x] Storage-Inventur: alle 17 Speicherorte, ihre Felder, Eigentümer, Export- und
      Migrationslage erfasst
- [x] Architektur-Inventur: Modi, Routen, `src/core`-Verantwortungen, Datenquellen,
      Dead Code, Testabdeckung
- [x] `npm run typecheck` (tsc, strict, `noEmit`)
- [x] `npm run lint` (oxlint über `src test scripts server.js sites`)
- [x] `npm run check` als gemeinsame Klammer: typecheck + lint + test + build
- [x] `server.js` gehärtet: Standard-DB-Pfad im Projekt statt hartkodiertem
      Windows-Desktoppfad, Bindung auf `127.0.0.1` als Vorgabe, Origin-Prüfung,
      Warnung bei Bindung an fremde Adressen, Zahlenparameter begrenzt
- [x] Router gehärtet: kaputte Prozentzeichen, externe und protokollrelative Ziele,
      `target="_blank"`, Mittel- und Modifikator-Klicks, Query und Anker
- [x] 21 Router-Tests (`test/router.test.js`)
- [x] `ARCHITEKTUR.md` an den Code angleichen: dritter Modus `redlingo`, die sieben
      fehlenden `src/core`-Module, die drei fehlenden Speicherschlüssel, `/languages/*`
      und `/redlingo/*`, Worker/R2/D1/Service Worker, der `/daten`-Vertrag
- [x] `AUFGABEN.md` von den überholten Supabase-Punkten befreien oder als historisch
      kennzeichnen
- [x] `STORAGE.md` aus der Inventur ableiten: was wo liegt, was im Export ist, was nicht

**Fertig, wenn:** `npm run check` grün durchläuft und keine Aussage in `README.md`,
`ARCHITEKTUR.md` oder `AUFGABEN.md` dem Code widerspricht.

---

## Phase 2 — Daten & Typen

**Ziel:** Die Speicherformen sind benannt, geprüft und umziehbar, ohne dass jemand
Angst um seinen Lernstand haben muss.

- [ ] TypeScript-Migration in der Reihenfolge aus ADR-006: **Kernlogik → Stores →
      Komponenten**
  - [ ] Kernlogik ohne Browser-Bindung zuerst: `progress/scheduler`,
        `progress/gamification`, `session/exerciseFactory`, `session/sessionPlanner`,
        `schrift/transliteration`
  - [ ] danach `courses/courseRepository` und `progress/progressSelectors`
  - [ ] danach die Stores: `storage`, `store`, `progressStore`, `profileStore`,
        `uiStore`, `sessionStore`, `taskStore`, `shopStore`, `achievementsStore`,
        `languageCourseStore`
  - [ ] zuletzt Komponenten und Seiten
- [ ] Zentrale Typen unter `src/types/` — je Speicher eine Form: Lernstand, Karte, Tag,
      Profil, UI, Sitzung, Shop, Auszeichnungen, Aufgaben, Sprachkurse; dazu Übung,
      Einheit, Welt
- [ ] Migrations-Pipeline mit Tests: jede Migration eine benannte, einzeln aufrufbare
      Funktion mit Von- und Nach-Version; `migriere()` führt sie geordnet aus
  - [ ] Tests für v1→v2 bei Fortschritt, Profil, Sitzung und Modus
  - [ ] Tests für `migriereKarten` inklusive Kollisionsregel „höhere Stufe gewinnt"
  - [ ] Test für Idempotenz: zweimal migrieren ändert nichts
- [ ] IndexedDB-Umzug für Lernstand, Sitzungen und Aufnahmen — bestehende Daten werden
      **kopiert, nie gelöscht** (ADR-005); der localStorage-Bestand bleibt vorerst als
      Rückfallebene stehen
  - [ ] Aufnahmen (`red-kurd-audio`) bekommen Metadaten: Wort, Zeitpunkt, Größe
  - [ ] Löschweg für Aufnahmen in der Oberfläche (`loescheAufnahme()` existiert, hat
        aber keinen Aufrufer)
  - [ ] Obergrenze oder wenigstens eine sichtbare Größenanzeige für Aufnahmen
- [ ] Versioniertes Backup-Format mit Validierung und Vorschau
  - [ ] eine Version im Dateikopf, klar getrennt von der Schemaversion je Speicher
  - [ ] Redundanz auflösen: heute stehen `fortschritt`, `profil`, `ui` und `shop`
        doppelt in der Datei (einmal oben, einmal unter `speicher`)
  - [ ] Prüfung vor dem Schreiben: fremde oder kaputte Datei wird abgelehnt statt
        halb eingespielt
  - [ ] Vorschau vor dem Import: XP, Serie, Kartenzahl, Datum der Sicherung
  - [ ] Entscheidung dokumentieren, ob die laufende Sitzung im Export bleibt — heute
        spielt ein Import eine halbfertige Übungsrunde eines fremden Geräts ein
  - [ ] Aufnahmen in den Export aufnehmen oder in der Oberfläche klar ausschließen;
        heute verspricht die Einstellungsseite eine Sicherung, die sie nicht enthält
- [x] Am zentralen `storage.js` vorbei geschriebene Stellen anbinden:
      `SettingsPage.jsx` (dupliziertes Schlüssel-Literal `red-kurd-profile-v2`),
      `rk-dauer` in `TodayPage`/`SessionPage`, `audioService`
- [ ] Namensdrift bereinigen: `red-kurd-ui-v1` trägt intern `version: 2`;
      `red-kurd-session-v2` hat gar kein `version`-Feld

**Fertig, wenn:** Kernlogik und Stores in TypeScript vorliegen, jede Migration einen
Test hat, und ein Import ohne Vorschau und Validierung nicht mehr möglich ist.

---

## Phase 3 — Lernqualität

**Ziel:** Die Module, die über XP, Serie und Wiederholungen entscheiden, sind
abgesichert — nicht nur die Kursdaten.

- [ ] `progressStore` testen (heute 0 Tests, 333 Zeilen, größtes Risiko im Repo):
      `gibXp` mit Serienübergang, `zaehleAufgabe` samt Folge/maxFolge und
      60-Tage-Fenster, `setzeSterne` inklusive „dritter Stern erst ab zwei bestandenen
      Läufen", `holeTageszielBelohnung`, `truheOeffnen`, `oeffneWeltTruhe`,
      `zahleEdelsteine`/`zahleSchluessel`, `exportiereAlles`, `ankiZeilen`
- [x] `scheduler` testen: `naechsteKarte` (Stufenauf- und -abstieg, Indexierung in
      `ABSTAENDE`), `kartenSchluessel`/`schluesselTeile`, `tagVon` und das
      Zeitzonenverhalten
- [x] `storage` testen: siehe Migrations-Pipeline in Phase 2, dazu
      `exportiereSpeicherstand`/`importiereSpeicherstand` und die `NUR_LOKAL`-Ausnahme
- [ ] `sessionPlanner` testen: `planeSitzung` mit der Rückstandsheuristik,
      `planeWiederholung`, `planeSchwierige`, `planeTraining('bild', …)` mit
      Wortschatzbegrenzung
- [ ] `progressSelectors` testen: `faelligeKarten`, `fertigkeiten`, `statistik`,
      `wochenAktivitaet`
- [ ] `exerciseFactory` direkt testen: `istRichtigGetippt` mit Sonderzeichen und
      Satzzeichen, „falsche Optionen dürfen den richtigen Text nicht doppeln",
      Fertigkeit→Aufgabenart
- [ ] `courseRepository`-Logik testen: `einheitStatus`, `weltStatus`, `weltPfad`,
      `aktuellerKnoten`, `kursFortschritt`
- [ ] `transliteration` testen — reine Funktionen, Hin- und Rückweg
- [ ] Testumgebung für Module mit `localStorage`/`document` schaffen; heute läuft
      `node --test` ohne DOM, `redlingo-mode.test.js` funktioniert nur, weil
      `storage.js` still auf Standardwerte zurückfällt
- [ ] Doppelte Konstante auflösen: `BESTEHENSGRENZE` (progressStore) und
      `BESTANDEN_AB` (courseRepository) sind beide 80, nur eine wird benutzt
- [ ] Dead Code entfernen oder anbinden — Entscheidung je Fall dokumentieren:
      `heartsStore.js` (von niemandem importiert, `KEYS.herzen` wandert trotzdem in
      jeden Export), `KelimBorder.jsx`, die Route `/adventure/quests` (nirgends
      verlinkt, Dublette von `/adventure/tasks`), die Dublette `/adventure/world`,
      die toten Einträge `UMLEITUNGEN['/']` und `['/index.html']`, die Kopie von
      `waehleRoute` in `AppRouter.jsx`

**Fertig, wenn:** `progressStore`, `scheduler`, `storage` und `sessionPlanner` Tests
haben, die den beschriebenen Verhaltensweisen widersprechen können, und kein Modul
ohne Aufrufer mehr im Export-Vertrag steht.

---

## Phase 4 — PWA & Offline

**Ziel:** Die App aktualisiert sich verlässlich, sagt Bescheid, wenn sie es tut, und
verhält sich auf dem iPhone wie eine installierte App.

- [ ] Service-Worker-Version an den Build koppeln: der Cachename `red-kurd-v2` ist
      heute handgepflegt, obwohl der Cachename-Bump der einzige
      Migrationsmechanismus für die App-Hülle ist
- [ ] Update-Hinweis in der Oberfläche: erkennen, dass eine neue Version bereitliegt,
      und einen Neuladen-Hinweis zeigen statt still zu warten
- [ ] Apple-PWA-Metadaten ergänzen: `apple-mobile-web-app-capable`,
      `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`,
      Startbilder; heute steht nur `apple-touch-icon` im `index.html`
- [ ] Offline-Verhalten der `/daten/*`-Abfragen prüfen: Wörterbuch und Tatoeba fallen
      bewusst aus, das darf nicht wie ein Fehler aussehen
- [ ] Cachegröße im Blick behalten: der Service Worker legt jede besuchte
      same-origin-GET-Antwort ab, ohne Obergrenze
- [ ] Service-Worker-Registrierung testen — sie läuft heute bewusst nicht auf
      localhost, das gehört dokumentiert

**Fertig, wenn:** ein Deployment ohne Handgriff am Cachenamen auskommt, der Nutzer ein
Update angeboten bekommt und die App auf iOS mit eigener Statusleiste und eigenem
Namen startet.

---

## Phase 5 — Inhalte

**Ziel:** Der Kurs wächst dort, wo er dünn ist, und alle Inhalte bleiben nachweisbar
lizenziert.

- [ ] Redlingo bekommt entweder einen eigenen Lernfluss oder wird ehrlich als
      Alternativ-Startseite beschrieben — heute sind es zwei Seiten, alles andere sind
      umgestylte Modern-Seiten
- [ ] Fotoabdeckung erhöhen: 98 von 596 Lernpaaren haben ein echtes Foto, der Rest ein
      Emoji
- [ ] Audioabdeckung erhöhen: 325 Schlüssel gegenüber 596 Lernpaaren
- [ ] Lizenznachweise weiterhin vollständig halten — jedes Bild mit Urheber und Lizenz
      in `credits.json`, geprüft durch `content:check`
- [ ] Beispielsätze und Grammatiknotizen für die Kapitel vervollständigen, die heute
      nur das Nötigste haben
- [ ] Nebensprachen bleiben eingefroren, solange ADR-007 gilt

**Fertig, wenn:** `npm run content:check` grün ist, jedes Kapitel Foto, Beispielsätze
und Grammatiknotiz hat, und jede Mediendatei einen Lizenznachweis trägt.

---

## Phase 6 — Optionale Cloud

**Ziel:** Wer ein Konto will, bekommt Gerätesync — wer keines will, merkt nichts davon.

- [ ] Der local-first-Grundsatz bleibt unberührt: jede Cloud-Funktion ist zusätzlich,
      keine wird Voraussetzung (ADR-001)
- [ ] Lernstand-Sync für angemeldete Nutzer, aufbauend auf dem versionierten
      Backup-Format aus Phase 2
- [ ] Konfliktbehandlung festlegen und dokumentieren: zwei Geräte, zwei Lernstände —
      wer gewinnt, und was passiert mit den Wiederholkarten
- [ ] Kontoverwaltung vervollständigen: Passwort ändern, Konto löschen, Daten
      mitnehmen
- [ ] `/daten/*` aus R2 offiziell dokumentieren: welche Dateien, welches Format,
      welches Verhalten ohne Worker
- [ ] Serverseitige Tests erweitern — `auth.test.js` und `sites-worker.test.js` sind
      heute die beste Abdeckung im Repo, das soll so bleiben

**Fertig, wenn:** ein angemeldeter Nutzer auf zwei Geräten denselben Lernstand sieht,
die Konfliktregel dokumentiert ist, und die App ohne Backend unverändert
weiterfunktioniert.
