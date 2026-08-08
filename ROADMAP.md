# Fahrplan

Sechs Phasen statt einer Wunschliste. Jede Phase hat ein Ziel, eine Checkliste und ein
Abschlusskriterium. Keine Termine, keine Stundenschätzungen — fertig ist, was das
Abschlusskriterium erfüllt.

Die Phasen bauen aufeinander auf, laufen aber nicht streng nacheinander: Phase 3 setzt
Phase 2 nur dort voraus, wo Typen die Tests tragen sollen.

**Bezugsgröße sind vier Apps, nicht eine.** RED-KURD ist seit den Pull Requests #5–#7
eine Website mit vier eigenständigen Apps — Sprache lernen, Code lernen, AI-Sprache,
Elektro-Lehre (ADR-007). Jede hat ihren eigenen Lernstand (ADR-008). Wo unten „die App"
steht, ist die Sprach-App gemeint; alles Übergreifende ist ausdrücklich benannt. Punkte,
die Tests, Typen oder Sicherungen betreffen, gelten für alle vier Apps.

Grundlage: die Storage- und Architektur-Inventur. Die Entscheidungen dahinter stehen in
[DECISIONS.md](DECISIONS.md).

---

## Phase 1 — Stabilität

**Ziel:** Der Baum ist grün, die Werkzeuge greifen, und die Doku widerspricht dem Code
nicht mehr.

- [x] Widersprüche in der Dokumentation bereinigt (`AUFGABEN.md` forderte eine
      Supabase-Pflicht, die dem local-first-Grundsatz widerspricht — siehe ADR-001)
- [x] Storage-Inventur: alle persistenten Bereiche, ihre Felder, Eigentümer, Export- und
      Migrationslage erfasst — inzwischen 26 Bereiche, davon 18 im `localStorage`
      (`STORAGE.md`)
- [x] Architektur-Inventur: Apps und Ansichten, Routen, `src/core`-Verantwortungen,
      Datenquellen, Dead Code, Testabdeckung
- [x] `npm run typecheck` (tsc, strict, `noEmit`)
- [x] `npm run lint` (oxlint über `src test scripts server.js sites`)
- [x] `npm run check` als gemeinsame Klammer: typecheck + lint + test + build
- [x] `server.js` gehärtet: Standard-DB-Pfad im Projekt statt hartkodiertem
      Windows-Desktoppfad, Bindung auf `127.0.0.1` als Vorgabe, Origin-Prüfung,
      Warnung bei Bindung an fremde Adressen, Zahlenparameter begrenzt
- [x] Router gehärtet: kaputte Prozentzeichen, externe und protokollrelative Ziele,
      `target="_blank"`, Mittel- und Modifikator-Klicks, Query und Anker
- [x] 21 Router-Tests (`test/router.test.js`)
- [x] `ARCHITEKTUR.md` an den Code angleichen: dritte Ansicht `redlingo`, die sieben
      fehlenden `src/core`-Module, die drei fehlenden Speicherschlüssel, `/languages/*`
      und `/redlingo/*`, Worker/R2/D1/Service Worker, der `/daten`-Vertrag
- [x] `AUFGABEN.md` von den überholten Supabase-Punkten befreien oder als historisch
      kennzeichnen
- [x] `STORAGE.md` aus der Inventur ableiten: was wo liegt, was im Export ist, was nicht
- [x] `README.md`, `ARCHITEKTUR.md` und `STORAGE.md` auf die vier Apps heben: App-Wahl
      und Umschalter, die beiden Schlüssel `appAktiv`/`appBereich`, die vier getrennten
      Lernstände, `NUR_LOKAL` mit `ohneKonto` **und** `sitzung`, und der Hinweis, dass
      nur die Sprach-App Adressen hat
- [x] `DECISIONS.md`: ADR-007 auf den Ist-Zustand (vier Apps, Status angenommen),
      ADR-008 zu den Lernstand-Konzepten ergänzt
- [ ] `AUFGABEN.md` auf die vier Apps heben — die Liste beschreibt heute
      ausschließlich die Sprach-App; Code lernen, AI-Sprache und Elektro-Lehre kommen
      darin nicht vor

**Fertig, wenn:** `npm run check` grün durchläuft und keine Aussage in `README.md`,
`ARCHITEKTUR.md` oder `AUFGABEN.md` dem Code widerspricht — insbesondere keine, die
noch von einer einzigen App ausgeht.

---

## Phase 2 — Daten & Typen

**Ziel:** Die Speicherformen aller vier Apps sind benannt, geprüft und umziehbar, ohne
dass jemand Angst um seinen Lernstand haben muss.

- [~] TypeScript-Migration in der Reihenfolge aus ADR-006: **Kernlogik → Stores →
      Komponenten**
  - [x] `progress/scheduler.ts` und `progress/gamification.ts` (erste Welle;
        Verhalten per Differenztest gegen den Vorstand belegt, kein `!`, kein `as`)
  - [x] restliche Kernlogik ohne Browser-Bindung: `session/exerciseFactory.ts`,
        `session/sessionPlanner.ts`, `schrift/transliteration.ts` (zweite Welle;
        Verhalten über rund 130 000 Vergleiche belegt)
  - [x] `courses/courseRepository.ts` und `progress/progressSelectors.ts` (dritte
        Welle; Verhalten über rund 493 000 Vergleiche mit drei Saaten belegt).
        Dazu kamen die Formen der Kursinhalte (`types/kurs.d.ts`) und
        Deklarationen neben den Datendateien; `test/kursdaten-form.test.js`
        prüft die echten Daten dagegen, damit eine Deklaration nicht lügen kann
  - [x] die zehn Stores der Sprach-App: `storage.ts`, `store.ts`,
        `progressStore.ts`, `profileStore.ts`, `uiStore.ts`, `sessionStore.ts`,
        `taskStore.ts`, `shopStore.ts`, `achievementsStore.ts`,
        `languageCourseStore.ts` (vierte Welle; Verhalten über rund 172 000
        Vergleiche belegt, jede Prüfung mit bestandener Gegenprobe). Verglichen
        wurde nicht nur der Rückgabewert, sondern auch der localStorage-Inhalt
        danach und die Zahl der `melden()`-Aufrufe
  - [x] `@types/react` / `@types/react-dom` ergänzt — ohne sie ließ sich
        `store.ts` (das erste Modul, das React anfasst) nicht ohne `any`
        typisieren, und die Komponenten-Welle wäre blockiert gewesen
  - [x] die Stores der drei anderen Apps: `lernbereiche/bereichsLernstand.ts`,
        `lernbereiche/wochenUebersicht.ts`, `elektro/schuleStore.ts`,
        `prompting/werkstattStore.ts`, `code-learning/fehlerbuchStore.ts`,
        `hearts/heartsStore.ts`, `app-mode/appModeStorage.ts`, `app-mode/appModes.ts`
        und die drei dünnen Hüllen der Bereichs-Lernstände (fünfte Welle;
        Verhalten über rund 310 000 Vergleiche belegt, jede Prüfung mit
        bestandener Gegenprobe)
  - [ ] zuletzt Komponenten und Seiten
- [x] Zentrale Typen unter `src/types/` angelegt (`lernstand.d.ts`, reine
      Deklarationsdatei): Lernstand, Karte, Tag, Profil, UI, Sitzung, Shop,
      Sprachkurse, Sicherung — die Speicherformen der **Sprach-App**
- [x] Typen für die drei neuen Apps ergänzt: Bereichs-Lernstand (`erledigt`, `notizen`,
      `xp`, `serie`, `letzterTag`, `tage`), Elektro-Schule, Prompting-Werkstatt,
      Fehlerbuch, App-Wahl; dazu Übung, Einheit, Welt und Auszeichnungen/Aufgaben
  - [x] Bereichs-Lernstand und Lektionsstatus (`types/lernstand.d.ts`)
  - [x] Übung als Vereinigung von Bild-, Wahl- und Tippaufgabe (zweite Welle)
  - [x] Einheit, Welt, Lektion, Lernpfad-Knoten und die Bildnachweise
        (`types/kurs.d.ts`, dritte Welle)
  - [x] Aufgaben, Auszeichnungen, Herzen, Shop-Artikel, Kapitel- und
        Nebenkursstand, App-Wahl sowie die abgeleiteten Rückgaben der Stores
        (`types/lernstand.d.ts`, vierte Welle)
  - [x] Elektro-Schule, Prompting-Werkstatt und Fehlerbuch (fünfte Welle) —
        `Speicherstand` führt keine `unknown`-Felder mehr. Damit ist **jede**
        gespeicherte Form aller vier Apps benannt
- [ ] Migrations-Pipeline: jede Migration eine benannte, einzeln aufrufbare Funktion mit
      Von- und Nach-Version; `migriere()` führt sie geordnet aus — heute ist es **eine**
      Funktion mit nummerierten Schritten
  - [x] Tests für v1→v2 bei Fortschritt, Profil, Sitzung und Modus
        (`test/storage.test.js`, `test/storage-basis.test.js`)
  - [x] Tests für `migriereKarten` inklusive Kollisionsregel „höhere Stufe gewinnt"
  - [x] Test für Idempotenz: zweimal migrieren ändert nichts
  - [x] Test, dass die alten v1-Schlüssel liegen bleiben (ADR-005)
  - [x] App-Wahl: Test für beide Schlüssel und für den Altwert `adventure` →
        Sprach-App mit Abenteuer-Ansicht (`test/appMode.test.js`)
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
  - [ ] Vorschau vor dem Import: XP, Serie, Kartenzahl, Datum der Sicherung — und je
        App ihr eigener Stand, damit sichtbar ist, was zurückkommt
  - [x] Entschieden und umgesetzt: die laufende Sitzung bleibt geräte-lokal.
        `NUR_LOKAL` in `storage.ts` enthält jetzt `ohneKonto` **und** `sitzung`; ein
        Import belebt keine halbfertige Übungsrunde eines fremden Geräts mehr
  - [x] Sicherung über alle vier Apps bewiesen: `test/sicherungRundlauf.test.js` geht
        den vollen Weg — füllen → exportieren → Gerät leeren → importieren
  - [ ] Aufnahmen in den Export aufnehmen oder in der Oberfläche klar ausschließen;
        heute verspricht die Einstellungsseite eine Sicherung, die sie nicht enthält
  - [ ] Regel festhalten und prüfbar machen: eine neue App ohne Eintrag in `KEYS` fehlt
        still in jedem Export — heute fängt das nur der Rundlauf-Test ab
- [x] Am zentralen `storage.ts` vorbei geschriebene Stellen anbinden:
      `SettingsPage.jsx` (dupliziertes Schlüssel-Literal `red-kurd-profile-v2`),
      `rk-dauer` in `TodayPage`/`SessionPage`, `audioService`
- [ ] Namensdrift bereinigen: `red-kurd-ui-v1` trägt intern `version: 2`;
      `red-kurd-session-v2` hat gar kein `version`-Feld

**Fertig, wenn:** Kernlogik und Stores in TypeScript vorliegen, jeder Speicher aller
vier Apps eine benannte Form in `src/types/` hat, jede Migration einen Test hat, und ein
Import ohne Vorschau und Validierung nicht mehr möglich ist.

---

## Phase 3 — Lernqualität

**Ziel:** Die Module, die in **allen vier Apps** über XP, Serie und Wiederholungen
entscheiden, sind abgesichert — nicht nur die Kursdaten.

Stand: `npm test` läuft heute mit 407 Tests grün.

*Sprach-App*

- [x] `progressStore` testen (21 Tests in `test/progressStore.test.js`): `gibXp` mit
      Serienübergang, `zaehleAufgabe` samt Folge/maxFolge und 60-Tage-Fenster, Sterne
      inklusive „dritter Stern erst ab zwei bestandenen Läufen",
      `holeTageszielBelohnung`, Tages- und Welt-Truhe, `zahleEdelsteine`,
      `exportiereAlles`, `ankiZeilen`
- [x] `scheduler` testen: `naechsteKarte` (Stufenauf- und -abstieg, Indexierung in
      `ABSTAENDE`), `kartenSchluessel`/`schluesselTeile`, `tagVon` und das
      Zeitzonenverhalten
- [x] `storage` testen: siehe Migrations-Pipeline in Phase 2, dazu
      `exportiereSpeicherstand`/`importiereSpeicherstand` und die `NUR_LOKAL`-Ausnahme
- [x] `sessionPlanner` testen: `planeSitzung` mit der Rückstandsheuristik,
      `planeWiederholung`, `planeLektion`, Dauerstufen
- [x] `progressSelectors` testen: `faelligeKarten`, `fertigkeiten`, `statistik`,
      `wochenAktivitaet`
- [x] `exerciseFactory` direkt testen: Fertigkeit→Aufgabenart, „falsche Optionen dürfen
      den richtigen Text nicht doppeln", Bildaufgaben, fällige Karte übt ihre Fertigkeit
- [x] `courseRepository`-Logik testen: Einheiten-Status, Bestehensgrenze, Freischalten,
      Vollständigkeit der Welten und Abschnitte
- [x] `transliteration` testen — reine Funktionen, Hin- und Rückweg
- [ ] `istRichtigGetippt` gezielt mit Sonderzeichen und Satzzeichen prüfen (ê î û ş ç,
      Groß-/Kleinschreibung, Punkt und Fragezeichen)

*Die drei neuen Apps*

- [x] `bereichsLernstand` testen: Statusableitung (`done`/`current`/`open`/`locked`),
      XP nur beim ersten Abschluss, Trennung zweier Bereiche mit verschiedenen
      Schlüsseln, Notizen, leere Lektionslisten (`test/bereichsLernstand.test.js`)
- [x] `wochenUebersicht` testen: sieben Tage, aktive Tage über alle Apps, Reihe, keine
      Addition ungleicher Einheiten (`test/wochenUebersicht.test.js`)
- [x] App-Wahl testen: Speichern/Laden je Bereich, beide Schlüssel, ungültige Werte,
      Altwert `adventure` (`test/appMode.test.js`)
- [x] Inhalte der drei Apps auf Pflichtfelder und einmalige Ids prüfen — Code-Lernpfade,
      Prompting- und Elektro-Lektionen samt Sicherheitshinweisen (`test/appMode.test.js`,
      `test/codeSchritte.test.js`, `test/praxisAufgaben.test.js`,
      `test/promptBaukasten.test.js`, `test/elektroSchule.test.js`,
      `test/fehlerbuch.test.js`, `test/tastaturHilfen.test.js`)
- [ ] Elektro-Rechenwege testen: `core/elektro/formeln.js` und `notenRechnung.js` mit
      Grenzfällen (Division durch null, fehlende Noten)
- [ ] Die Oberfläche der neuen Apps ist ungetestet — `LektionPlayer`, `PraxisAufgabe`,
      `UebungModal`, `CodeTastatur` laufen ohne DOM nicht; hängt an der Testumgebung
      unten

*Übergreifend*

- [ ] Testumgebung für Module mit `localStorage`/`document` schaffen: heute bringt jede
      Testdatei ihre eigene Speicher-Attrappe mit (z. B. `sicherungRundlauf`,
      `progressStore`, `appMode`), ein gemeinsamer Helfer fehlt — und ohne DOM bleibt
      jede Komponente ungetestet
- [ ] Doppelte Konstante auflösen: `BESTEHENSGRENZE` (progressStore) und
      `BESTANDEN_AB` (courseRepository) sind beide 80, nur eine wird benutzt
- [ ] Dead Code entfernen oder anbinden — Entscheidung je Fall dokumentieren:
      `heartsStore.ts` (von keiner Datei unter `src/` importiert, `KEYS.herzen` wandert
      trotzdem in jeden Export), `KelimBorder.jsx` (kein Aufrufer), die Route
      `/adventure/quests` (nirgends verlinkt, Dublette von `/adventure/tasks`), die
      Dublette `/adventure/world`, die toten Einträge `UMLEITUNGEN['/']` und
      `['/index.html']` (`AppRouter` behandelt `/` vorher selbst).
      Die frühere Kopie von `waehleRoute` in `AppRouter.jsx` ist erledigt — der Router
      benutzt jetzt `passt()` aus `router.jsx`
- [ ] Klären, was in `src/features/app-mode/` gehört: der Ordner ist heute App-Umschalter
      **und** Sammelstelle gemeinsamer Lernbausteine (`LernpfadKarte`, `LektionPlayer`,
      `UebungModal`, `PraxisAufgabe`, `CodeTastatur`). Entweder trennen oder die
      Doppelrolle bewusst festhalten (ADR-007 nennt sie als offenen Punkt)

**Fertig, wenn:** die Kernmodule der Sprach-App und der gemeinsame Lernstand-Baukasten
Tests haben, die den beschriebenen Verhaltensweisen widersprechen können, und kein Modul
ohne Aufrufer mehr im Export-Vertrag steht.

---

## Phase 4 — PWA & Offline

**Ziel:** Die Website aktualisiert sich verlässlich, sagt Bescheid, wenn sie es tut, und
verhält sich auf dem iPhone wie eine installierte App — mit allen vier Apps darin.

- [ ] Entscheiden, ob Code lernen, AI-Sprache und Elektro-Lehre eigene Adressen bekommen.
      Heute stehen sie nicht im `AppRouter`, sondern werden in `App.jsx` nach
      `activeMode` gerendert: nicht verlinkbar, keine Tiefenlinks, die Zurück-Taste wirkt
      in ihnen nicht. Das Ergebnis — Adressen oder bewusster Verzicht — gehört als ADR
      festgehalten (ADR-007 nennt es als offenen Preis)
- [ ] Service-Worker-Version an den Build koppeln: der Cachename `red-kurd-v2` ist
      heute handgepflegt, obwohl der Cachename-Bump der einzige
      Migrationsmechanismus für die App-Hülle ist
- [ ] Offline-Nachladen der drei neuen Apps prüfen: sie liegen hinter `React.lazy` und
      werden in `App.jsx` im Leerlauf nachgeladen, damit der Service Worker ihre Teile
      einsammelt — das ist heute nicht durch einen Test abgesichert
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
Update angeboten bekommt, die App auf iOS mit eigener Statusleiste und eigenem Namen
startet, und alle vier Apps offline vollständig laufen.

---

## Phase 5 — Inhalte

**Ziel:** Die Kurse wachsen dort, wo sie dünn sind, und alle Inhalte bleiben nachweisbar
lizenziert.

*Sprach-App*

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
- [ ] Nebensprachen bleiben eingefroren (ADR-007): je 10 Kapitel, je 80 Wörter, eigener
      Fortschritt, kein Wiederholsystem

*Code lernen, AI-Sprache, Elektro-Lehre*

- [ ] Inhalte wachsen nach derselben Regel: JS-Module unter
      `src/features/*-learning/data/`, jede neue Lektion mit den Pflichtfeldern, die die
      Tests einfordern, und mit einmaliger Id über alle Pfade hinweg
- [ ] In der Oberfläche benennen, dass jede App ihren eigenen Fortschritt hat
      (ADR-008) — sonst wirkt die zurückgesetzte Serie beim App-Wechsel wie ein Fehler
- [ ] Elektro-Lehre: sicherheitsrelevante Aussagen brauchen eine belastbare Quelle, bevor
      der Stoff wächst — der Bereich gibt Anleitungen zum Umgang mit Strom
- [ ] Prüfen, ob die Wochenübersicht das richtige gemeinsame Maß ist, oder ob die Reihe
      über alle Apps sichtbarer werden muss (offene Teilfrage aus ADR-008)
- [ ] `npm run content:check` auf die neuen Apps ausweiten — heute läuft es nur über
      `course-content.test.js` und `language-courses.test.js`, also nur über die
      Sprach-App

**Fertig, wenn:** `npm run content:check` grün ist, jedes Kapitel der Sprach-App Foto,
Beispielsätze und Grammatiknotiz hat, jede Mediendatei einen Lizenznachweis trägt und
die Inhaltstests aller vier Apps grün sind.

---

## Phase 6 — Optionale Cloud

**Ziel:** Wer ein Konto will, bekommt Gerätesync — wer keines will, merkt nichts davon.

- [ ] Der local-first-Grundsatz bleibt unberührt: jede Cloud-Funktion ist zusätzlich,
      keine wird Voraussetzung (ADR-001)
- [ ] Lernstand-Sync für angemeldete Nutzer, aufbauend auf dem versionierten
      Backup-Format aus Phase 2 — er muss **alle vier** Lernstände tragen, nicht nur
      den der Sprach-App (ADR-008)
- [ ] Konfliktbehandlung festlegen und dokumentieren: zwei Geräte, zwei Lernstände —
      wer gewinnt, was passiert mit den Wiederholkarten, und wird je App entschieden
      oder für die ganze Sicherung auf einmal
- [ ] Geräte-lokale Werte bleiben außen vor: `ohneKonto` und `sitzung` (`NUR_LOKAL`)
      gehören auch beim Sync nicht auf ein anderes Gerät
- [ ] Kontoverwaltung vervollständigen: Passwort ändern, Konto löschen, Daten
      mitnehmen
- [ ] `/daten/*` aus R2 offiziell dokumentieren: welche Dateien, welches Format,
      welches Verhalten ohne Worker
- [ ] Serverseitige Tests erweitern — `auth.test.js` und `sites-worker.test.js` decken
      Worker und Anmeldung ab; jeder neue Endpunkt kommt mit Test dazu

**Fertig, wenn:** ein angemeldeter Nutzer auf zwei Geräten in allen vier Apps denselben
Lernstand sieht, die Konfliktregel dokumentiert ist, und die App ohne Backend unverändert
weiterfunktioniert.
