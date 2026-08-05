# RED-KURD — Analyse zum Start des Ausbaus (August 2026)

Acht parallele Tiefenprüfungen über alle Subsysteme (App-Shell, Storage,
Lernlogik, Modi, Features, Styles/iPhone, Daten/Audio/PWA, Texte/Tests).
Stand: Branch `claude/red-kurd-language-app-g1sm4o`.
Mit ✅ markierte Punkte wurden auf diesem Branch bereits behoben.

## Was funktioniert (Fundament ist solide)

- **Ein Lernstand für alle drei Modi** ist sauber umgesetzt: Modern,
  Abenteuer und Redlingo lesen und schreiben ausschließlich über
  `src/core/progress/progressStore.js` (`red-kurd-progress-v2`).
- **Storage-Schicht** (`src/core/storage.js`) ist defensiv: kaputtes JSON,
  fehlender localStorage und voller Speicher werden abgefangen; die
  v1→v2-Migration **kopiert statt löscht**. ✅ Seit diesem Branch durch 22
  Tests abgesichert (`test/storage.test.js`).
- **Wiederholsystem** (vereinfachtes SM-2 mit Stufen 1–6, Abstände
  1/3/7/16/35/70 Tage) rechnet Kalendertage bewusst in Gerätezeitzone —
  kein Streak-Abriss westlich von UTC. ✅ Jetzt getestet.
- **Tipp-Bewertung ist fair**: Groß-/Kleinschreibung, Leerraum, Satzzeichen
  und kurdische Sonderzeichen (ê î û ş ç → e i u s c) werden toleriert.
- **iPhone-Grundlage stimmt**: `viewport-fit=cover`, Safe-Area-Insets in
  Kopfleiste/Bottom-Nav/Modals, 44-px-Token, `touch-action: manipulation`,
  Bottom-Nav-Knöpfe mobil 70 px hoch, 100dvh-Fallbacks. Playwright-Prüfung
  über elf Seiten (428×926, DPR 3): keine horizontale Scrollbar, Navigation
  überall sichtbar, keine zu kleinen Touchflächen.
- **Deutsch ist durchgängig**: keine englischen UI-Strings gefunden;
  `src/core/texts.js` ist ein sauberer deutscher Textkatalog (22 Dateien
  nutzen ihn). Kurmancî-Grüße tragen `lang="ku"`.
- **Local-first-Auth** unterscheidet „kein Server“ von „Server gestört“ und
  läuft ohne Backend ohne Anmeldung weiter; „ohne Konto lernen“ überlebt
  Neuladen, wandert aber nie in Sicherungen.
- Router mit Alt-Adressen-Umleitung, View-Transitions mit
  `prefers-reduced-motion`, Multi-Tab-Cache-Invalidierung über
  storage-Events, A11y-Grundlagen (Sprunglink, aria-current, Fokusringe).

## Bereits auf diesem Branch behoben ✅

1. **Fehlergrenze + Root-Prüfung** in `src/main.jsx` — vorher führte jeder
   Renderfehler zur weißen Seite (keine Error Boundary im Projekt).
2. **iOS-Eingabe-Zoom**: `.rk-feld` lag mit 15,2 px unter der
   16-px-Grenze; Wörterbuch-Suche, Einstellungen und Import lösten den
   Safari-Zoom aus. Global abgesichert (`max(16px, …)`).
3. **Testlücken geschlossen**: storage, scheduler, sessionPlanner,
   exerciseFactory, courseRepository, progressStore, taskStore, sessionStore,
   transliteration, staticData, Service Worker, Audio-Index (169 Tests grün).
4. **Sprachsystem**: `src/core/languages/languages.js` mit Kurmancî als
   Hauptkurs, Zusatzkurse verknüpft, Soranî/Zazakî als geplant (RTL/arabische
   Schrift vorgemerkt) — nichts mehr hartkodiert.
5. Alle zehn unten bestätigten **Bugs sind inzwischen behoben**.
6. **Storage gehärtet**: Defekt-Backup vor dem Überschreiben, Sitzung
   geräte-lokal (kein Export/Import), Sitzungs-Verfall nach 48 h.
7. **Service Worker gehärtet**: nur gesunde Hüllen, Cache-first für Assets,
   Medien-Limit, 4-s-Netzlimit, Registrierung nur im Produktions-Build.
8. **Code-Splitting**: Start-Bundle 612 → 404 kB (gzip 190 → 130 kB),
   Leerlauf-Nachladen erhält die Offline-Abdeckung.
9. **Suche diakritik-tolerant** („cawa“ → „çawa“, „kase“ → „Käse“);
   kein Englisch-Fallback mehr als vermeintlich deutscher Text.
10. **PWA-Feinschliff**: dunkle Startfarbe, Modal 90dvh + Scroll-Sperre,
    AuthPage-Safe-Area, Hover nur bei echter Maus, Audio-Index bereinigt.

## Echte Bugs (bestätigt — inzwischen alle behoben ✅)

1. **Punkte-Doppelzählung beim Sitzungs-Speichern**
   (`src/features/exercise/ExercisePlayer.jsx:125`): der Speicher-Effekt
   addiert `punkte + 1`, obwohl der State den Treffer bereits enthält.
   Fortgesetzte Sitzungen starten mit zu vielen Punkten; >100 % möglich.
   *Von zwei unabhängigen Prüfungen gefunden.*
2. **Homonyme als falsche Antwortoptionen**
   (`src/core/session/exerciseFactory.js:50-61`): `falscheOptionen` schließt
   nur den exakten Antwortstring aus. „roj“ = Tag UND Sonne → bei Frage
   „roj“/Antwort „Tag“ kann „Sonne“ als „falsche“ Option erscheinen und ein
   objektiv richtiger Tipp wird bestraft. Betroffen: mindestens 9
   ku-Homonyme, 6 de-Synonympaare. `deutschVon`/`kurmanciVon` kennen die
   Mehrfachbedeutungen bereits, werden hier aber nicht genutzt.
3. **Wochenaufgaben doppelt einlösbar** (`taskStore.js` + rollierendes
   7-Tage-Fenster in `wochenSumme()`): Montag früh zählt noch die Vorwoche
   → Belohnung ohne Lernleistung erneut abholbar.
4. **Dark-Mode-Kontrast der Antwort-Rückmeldung**
   (`components.css:1184-1188`): dunkelgrün auf dunkelgrün (~2:1) — im
   Standard-Theme (dunkel!) kaum lesbar. Weitere hartkodierte
   Hellmodus-Farben in Badges/Chips.
5. **Kein `color-scheme`**: iOS zeigt in der dunklen App helle Tastatur,
   helle Selects, helle Scrollbalken.
6. **`.rk-segment-knopf` nur 42 px hoch** — knapp unter dem 44-px-Minimum.
7. **`weltStatus`-Halbregel ist toter Code** (`courseRepository.js:456`):
   Welten öffnen real erst, wenn alle vorherigen Einheiten bestanden sind —
   der Sperrtext „…wenn die Hälfte geschafft ist“ stimmt nicht.
8. **planeTraining ignoriert Karten-Skill** (`sessionPlanner.js:115-118`):
   skill-fremde fällige Karten bleiben ewig fällig (genau das Problem, vor
   dem der eigene Kommentar warnt).
9. **Session-Zähler inkonsistent** (`planeSitzung`): gemeldete
   `wiederholungen`/`neueWoerter` sind Vor-Slice-Werte; `ohneDoppelte`
   dedupliziert faktisch nichts (Schlüssel enthält den Skill).
10. **Onboarding-Neustart wirkungslos für v1-Altnutzer**
    (`SettingsPage.jsx:740-748`): Migration stellt das Profil aus dem nie
    gelöschten Alt-Key wieder her. Zudem ist der Profil-Key dort hart
    dupliziert statt `KEYS.profil` zu importieren.

## Risiken (kein akuter Bug, aber wichtig)

- **Stilles Speicherversagen**: kein Store prüft den Rückgabewert von
  `schreibe()` — bei vollem Speicher/privatem Modus zeigt die UI Fortschritt,
  der beim Neuladen weg ist. Kein Nutzerhinweis.
- **Safari ITP**: localStorage kann nach 7 Tagen ohne Nutzung gelöscht
  werden (ohne Home-Bildschirm-Installation). Kein
  `navigator.storage.persist()`, keine IndexedDB-Spiegelung des Lernstands.
- ~~Korrupte Rohdaten werden überschrieben~~ ✅ behoben: Defekt-Backup
  unter `<key>-defekt`, bevor etwas überschrieben wird.
- ~~Export enthält die laufende Sitzung~~ ✅ behoben (geräte-lokal);
  offen bleibt: Fortschritt doppelt in der Exportdatei, Import validiert
  Inhalte kaum.
- ~~Service Worker cached Fehlerseiten / wächst unbegrenzt~~ ✅ gehärtet
  (nur `res.ok`, Cache-first für Assets, Medien-Limit, Netzlimit).
- **Audio**: nur ~240 von 603 Kurswörtern mit echter Aufnahme, 0 von 182
  Phrasen; auf iOS gibt es keine kurdische TTS-Stimme. ✅ Inzwischen:
  `play().catch` mit TTS-Fallback, Index-Fehlversuch nicht mehr dauerhaft,
  Index bereinigt und testgesichert. **Offen: Lizenzlücke** — CC-BY-SA-
  Aufnahmen ohne gespeicherte Urheber/Lizenz (bei Fotos vorbildlich gelöst!).
- **Bundle/Assets**: ✅ Code-Splitting aktiv (Start 404 statt 612 kB).
  ✅ Bilder auf 14 MB verkleinert, og.png 348 kB. Deployment laeuft
  ueber Cloudflare (Worker ersetzt `__SITE_ORIGIN__` zur Laufzeit).
- **Schriften deklariert, aber nie geladen** (Nunito/Baloo 2/Noto Naskh
  Arabic ohne @font-face) — alles fällt still auf Systemschrift zurück.
- ~~AuthPage ohne Safe-Area~~ ✅ behoben (env()-Insets).
- ~~Sticky Hover auf Touch~~ ✅ die auffälligen Stellen sind in
  `@media (hover: hover)` gewickelt.
- „Redsword“/„Redmail“ statt „Passwort“/„E-Mail“ (17 Stellen): bewusste
  Namensentscheidung (Commit „rename login fields“), aber die Fehlermeldung
  „Die beiden Redswords stimmen nicht überein“ ist für Neue unverständlich —
  Entscheidung des Maintainers, ob Branding oder Klartext.

## Fehlende Tests (nach Priorität)

✅ Inzwischen abgedeckt: progressStore, taskStore, sessionStore,
transliteration, Service Worker, Audio-Index, staticData (169 Tests).

Noch offen:

1. `progressSelectors.js` direkt (statistik, fertigkeiten,
   wochenAktivitaet über Monatsgrenzen) — indirekt teilweise mitgeprüft.
2. `heartsStore.js`, `shopStore.js`, `achievementsStore.js`.
3. Komponenten-/Render-Tests (kein jsdom im Projekt) — z. B. für den
   ExercisePlayer-Speicherpfad und die Modus-Hüllen.
4. Determinismus: `mische()` und `heute()` sind nicht injizierbar — für
   tiefere Planner-Tests rng/jetzt-Parameter ergänzen.

## Daten-/Größenrisiken

- `staticData.js` lädt wörter/wiki/beispiele als Alles-oder-nichts in den
  RAM — beim „840.000+“-Anspruch die größte Skalierungs-Schwachstelle.
  Vorbild ist die eigene KT-Chunk-Lösung (Buchstaben-Chunks + Index).
- Kursdaten (~215 kB) dürfen local-first im Bundle bleiben; Foto-/Extra-
  Maps (~104 kB) könnten per dynamic import von der Startroute weg.
- ~~zufallsPaare fällt auf englische Übersetzungen zurück~~ ✅ behoben.

## Empfohlene nächste PRs (Reihenfolge)

Erledigt sind: Bugfix-Paket Übungen, Dark-Mode/iOS-Paket, Storage-Härtung
(Backup, Sitzung, Onboarding-Neustart), Wochenaufgaben-Kalenderwoche,
Service-Worker-Härtung, Code-Splitting, Suche-Normalisierung (statisch),
PWA-Feinschliff, Audio-Index-Bereinigung, planeTraining-Skill-Filter und
konsistente Sitzungszähler.

Noch offen (Reihenfolge):

1. **Audio-Lizenzen nachziehen** (Urheber/Lizenz je Aufnahme speichern und
   anzeigen — rechtlich nötig bei CC BY-SA); `audio-holen.py` kann die
   Angaben von der Commons-API mitnehmen.
2. **Stilles Speicherversagen sichtbar machen**: Stores werten den
   Rückgabewert von `schreibe()` aus und warnen einmalig auf Deutsch.
3. ~~Bilder optimieren~~ ✅ erledigt (14 MB, og.png 348 kB);
   `__SITE_ORIGIN__` ersetzt der Cloudflare-Worker, optional SITE_ORIGIN
   beim Build.
4. **Import validieren** (Grundprüfung + Rückgabewert auswerten) und den
   doppelten Fortschritt aus der Exportdatei nehmen.
5. **Safari-ITP-Schutz**: `navigator.storage.persist()` anfragen und/oder
   Lernstand in IndexedDB spiegeln; Export-Erinnerung.
6. **Entscheidung Herzen**: `heartsStore` anbinden oder entfernen; dazu
   Edelstein-Parität der Kapitelprüfung zwischen Modern und Abenteuer.
7. **Schriften entscheiden**: selbst hosten (@font-face) oder Stacks ehrlich
   auf system-ui kürzen.
8. **Serverseitige Such-Normalisierung** (normalisierte Spalte in der
   SQLite-DB) — die statische Suche ist bereits tolerant.

## Nicht jetzt bauen (bewusst verschoben)

KI-Tutor, Social/Community, kompletter Login-Zwang, Cloud-Sync des
Lernstands, komplettes Soranî/Englisch als Vollkurse, 455k-Wörterbuch im
Bundle — erst die Basis oben fertig machen.
