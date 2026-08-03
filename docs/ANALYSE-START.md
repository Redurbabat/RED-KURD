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
3. **Testlücken Kernlogik**: 68 neue Tests für storage, scheduler,
   sessionPlanner, exerciseFactory, courseRepository (93 gesamt, alle grün).
4. **Sprachsystem**: `src/core/languages/languages.js` mit Kurmancî als
   Hauptkurs, Zusatzkurse verknüpft, Soranî/Zazakî als geplant (RTL/arabische
   Schrift vorgemerkt) — nichts mehr hartkodiert, 7 Tests.

## Echte Bugs (bestätigt, priorisiert)

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
- **Korrupte Rohdaten werden überschrieben** statt unter einem
  Backup-Key gesichert (stiller Totalverlust bzw. stiller v1-Rollback).
- **Export enthält die laufende Sitzung** und den Fortschritt doppelt;
  Import validiert Inhalte kaum.
- **Service Worker**: cached jede Navigations-Antwort ungeprüft als
  App-Hülle (auch Fehlerseiten), Cache wächst unbegrenzt, Netz-zuerst auch
  für unveränderliche gehashte Assets (langsamer PWA-Start).
- **Audio**: nur 240 von 603 Kurswörtern mit echter Aufnahme, 0 von 182
  Phrasen; auf iOS gibt es keine kurdische TTS-Stimme → falschsprachige
  Systemstimme. `play()` ohne `.catch`, Fehlversuch des Audio-Index wird
  dauerhaft gecacht. **Lizenzlücke**: CC-BY-SA-Aufnahmen ohne gespeicherte
  Urheber/Lizenz (bei Fotos vorbildlich gelöst!).
- **Bundle/Assets**: ein 612-kB-JS-Chunk (kein Code-Splitting wirksam),
  20 MB unoptimierte Bilder, og.png 2,35 MB, `__SITE_ORIGIN__`-Platzhalter
  bleibt auf Vercel unersetzt.
- **Schriften deklariert, aber nie geladen** (Nunito/Baloo 2/Noto Naskh
  Arabic ohne @font-face) — alles fällt still auf Systemschrift zurück.
- **AuthPage ohne Safe-Area** (Notch/Home-Indicator im PWA-Modus).
- **Sticky Hover auf Touch**: kein `@media (hover: hover)` im Projekt.
- „Redsword“/„Redmail“ statt „Passwort“/„E-Mail“ (17 Stellen): bewusste
  Namensentscheidung (Commit „rename login fields“), aber die Fehlermeldung
  „Die beiden Redswords stimmen nicht überein“ ist für Neue unverständlich —
  Entscheidung des Maintainers, ob Branding oder Klartext.

## Fehlende Tests (nach Priorität)

1. `progressStore.js` (333 Zeilen, größtes ungetestetes Core-Modul): XP,
   Serie, Sterne-Matrix, Truhen, Tagesziel-Belohnung, 60-Tage-Beschneidung.
2. `progressSelectors.js`: statistik, faelligeKarten, fertigkeiten,
   wochenAktivitaet über Monatsgrenzen.
3. `transliteration.js` (Schrift-Umwandlung Latein↔Arabisch): einziger im
   Auftrag genannter Bereich, der noch komplett ungetestet ist.
4. `sessionStore.js` (korrupte/uralt gespeicherte Sitzungen),
   `taskStore.js` (Doppel-Abholung), `heartsStore.js`, `shopStore.js`.
5. Service Worker (Fehlerseiten-Caching), Audio-Index-Integrität
   (Müll-Einträge `.find`/`_gulan` existieren real), Asset-Existenz.
6. Determinismus: `mische()` und `heute()` sind nicht injizierbar — für
   tiefere Planner-Tests rng/jetzt-Parameter ergänzen.

## Daten-/Größenrisiken

- `staticData.js` lädt wörter/wiki/beispiele als Alles-oder-nichts in den
  RAM — beim „840.000+“-Anspruch die größte Skalierungs-Schwachstelle.
  Vorbild ist die eigene KT-Chunk-Lösung (Buchstaben-Chunks + Index).
- Kursdaten (~215 kB) dürfen local-first im Bundle bleiben; Foto-/Extra-
  Maps (~104 kB) könnten per dynamic import von der Startroute weg.
- `zufallsPaare` fällt bei wenigen deutschen Sätzen auf **englische**
  Tatoeba-Übersetzungen zurück, die dann mit `lang="de"` angezeigt werden.

## Empfohlene nächste PRs (Reihenfolge)

1. **Bugfix-Paket Übungen**: Punkte-Doppelzählung, Homonym-Distraktoren
   (mit Regressionstests „roj“/„rast“), Segment-Knopf 44 px.
2. **Dark-Mode/iOS-Paket**: Rückmeldungs-Kontrast, `color-scheme`,
   `autocapitalize` auf der Wörterbuch-Suche, `play().catch` im Audio.
3. **Storage-Härtung**: Schreibfehler sichtbar machen, korrupte Rohdaten
   als Backup-Key sichern, Sitzung aus dem Export nehmen, Import validieren,
   Onboarding-Neustart reparieren (`KEYS.profil`).
4. **Wochenaufgaben auf Kalenderwoche** umstellen + taskStore-Tests.
5. **Service Worker härten**: nur `res.ok` cachen, Cache-first für
   gehashte Assets, Größenlimit, Version beim Build stempeln.
6. **Audio-Lizenzen nachziehen** (Urheber/Lizenz je Aufnahme speichern und
   anzeigen — rechtlich nötig bei CC BY-SA) + Index-Müll bereinigen.
7. **Code-Splitting** (React.lazy je Modus + schwere Features) und
   Bilder-Optimierung (20 MB → mobile Größen).
8. **progressStore/Selectors-Tests**, danach transliteration-Tests.
9. **Wörterbuch-Suche normalisieren** (Diakritik-tolerant wie
   `istRichtigGetippt`, serverseitig normalisierte Spalte).
10. **PWA-Feinschliff**: manifest background_color ans dunkle Theme,
    maskable Icon, AuthPage-Safe-Area, `@media (hover: hover)`.

## Nicht jetzt bauen (bewusst verschoben)

KI-Tutor, Social/Community, kompletter Login-Zwang, Cloud-Sync des
Lernstands, komplettes Soranî/Englisch als Vollkurse, 455k-Wörterbuch im
Bundle — erst die Basis oben fertig machen.
