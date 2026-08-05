# Arbeit diese Nacht

## Ziel

RED-KURD hat jetzt mehrere App-Bereiche — es fühlt sich an wie drei Apps
in einer Website. Sichtbar ist immer genau ein Bereich:

```
RED-KURD
├─ Sprache lernen   (die bisherige App — unverändert)
├─ Code lernen      (neu)
└─ AI-Sprache       (neu)
```

## Gebaut

- **App-Modus** (`src/features/app-mode/`): `appModes.js` (die drei
  Bereiche + deutsche Etiketten), `appModeStorage.js` (laden/speichern/
  prüfen über die zentrale Storage-Schicht), `AppModeSwitcher.jsx`
  (Umschalter-Leiste), `appMode.css`.
- **Gespeicherter Modus**: Schlüssel `red-kurd-active-app-mode-v1`,
  Werte `language` / `code` / `prompting`, Standard `language`.
  Ungültige Werte fallen sicher auf Sprache zurück.
- **Sprache lernen geschützt**: Der bestehende Sprachbaum (Router, Hülle,
  alle Modi) wird in `App.jsx` nur noch bei `language` gerendert — an ihm
  wurde nichts verändert, nichts gelöscht.
- **Code lernen** (`src/features/code-learning/`): Startseite mit
  Dashboard (XP heute, Reihe, offene Übungen, Gesamt-Fortschritt),
  „Heute lernen“, Fortschritts-Überblick, 7 Lernpfade (HTML, CSS,
  JavaScript, TypeScript, GitHub, VS Code, Mini-Projekte) mit
  aufklappbaren Lektionslisten, 6 Übungen, Fehlerbuch-Vorschau.
- **AI-Sprache** (`src/features/prompting-learning/`): Startseite mit
  Dashboard, „Heute lernen“, 9 Lektionen (Was ist ein Prompt? bis
  Claude-Code-Auftrag) und 6 Trainings-Übungen zum Selbst-Formulieren.
- **Daten als echte Struktur**: `data/codeLessons.js` (7 Pfade, 25
  Lektionen mit Status done/current/open/locked), `data/codeExercises.js`,
  `data/promptLessons.js`, `data/promptExercises.js`.
- **Mobile**: Umschalter zeigt auf schmalen Bildschirmen „Sprache | Code
  | AI“, alle Karten untereinander, Buttons mindestens 44 px, keine
  horizontale Scrollbar (mit Playwright auf 428×926 geprüft).
- **Design**: bestehende RED-KURD-Tokens und Karten; Code lernen mit
  blauem, AI-Sprache mit orangem Akzent; hell und dunkel funktionieren.
- **Tests**: `test/appMode.test.js` mit 11 Prüfungen (Speicher-Regeln,
  Daten-Vollständigkeit, einmalige Ids, gültige Status).
- Die neuen Bereiche laden **lazy** (eigene Bundles) und werden im
  Leerlauf nachgeladen, damit sie offline verfügbar sind.

## Wie testen?

1. `npm run dev` und die App öffnen.
2. Oben erscheint der Umschalter: **Sprache lernen · Code lernen ·
   AI-Sprache**.
3. „Sprache lernen“ → das gewohnte RED-KURD (Heute, Kurs, Üben …).
4. „Code lernen“ → nur der Code-Bereich (Sprache unsichtbar).
5. „AI-Sprache“ → nur der Prompting-Bereich.
6. Seite neu laden → der zuletzt gewählte Bereich ist wieder aktiv.
7. `npm test` (213 Tests) und `npm run build` — beide grün.
   `npm run lint` / `npm run typecheck`: **Scripts existieren nicht**
   (Projekt nutzt bewusst nur node --test und Vite).

## Bekannte Kleinigkeit

In der installierten PWA (Notch-iPhone) entsteht ganz oben im
Sprachbereich etwas zusätzlicher Abstand, weil Umschalter und Kopfleiste
beide die Notch-Polsterung tragen. Im Browser ist alles exakt; behoben
wird das, wenn der Umschalter später in die Kopfleiste integriert wird.

## Nachtrag (gleiche Nacht, zweiter Teil)

Inzwischen ebenfalls fertig:

- **Lektionen sind anklickbar und haben echte Inhalte**: alle 25
  Code-Lektionen und 9 Prompting-Lektionen mit deutschen Erklärungen,
  Beispiel (Code bzw. Beispiel-Prompt) und Merksatz — geöffnet in einem
  Modal mit „Lektion abschließen · +10 XP“.
- **XP und Fortschritt werden wirklich gespeichert**:
  `red-kurd-code-progress-v1` und `red-kurd-prompting-progress-v1`
  (erledigte Lektionen, XP, Tagesserie). Der Status jeder Lektion
  (done/current/open/locked) wird daraus abgeleitet — XP gibt es je
  Lektion genau einmal. Baustein:
  `src/core/lernbereiche/bereichsLernstand.js`.
- **Fehlerbuch gebaut**: eigene Einträge mit Titel, Fehlerbeschreibung
  und Lösung, lokal unter `red-kurd-fehlerbuch-v1`, löschbar, neueste
  oben.
- 15 weitere Tests (222 gesamt), E2E geprüft: Lektion abschließen →
  XP 0→10, Reihe 1 Tag, Reload behält alles; Fehlerbuch-Eintrag
  überlebt den Reload.

## Nachtrag 2 (gleiche Nacht, dritter Teil)

- **Übungen sind interaktiv**: „Übung öffnen“ zeigt die Aufgabe im Modal
  mit einem Notizfeld für die eigene Lösung (wird lokal gespeichert, auch
  beim Schließen ohne Abschluss). „Als erledigt markieren · +15 XP“ —
  einmal je Übung. Der Zähler „Offene Übungen“ ist jetzt echt.
- **Tagesziel**: beide Bereiche zeigen „Tagesziel: X/30 XP“ mit Balken
  und „— geschafft!“ ab 30 XP.
- 2 weitere Tests (224 gesamt); E2E: Übung öffnen → Notiz → abschließen
  → XP 15, Offene 6→5, Tagesziel 15/30; Reload behält Notiz und Status.

## Nachtrag 3 (gleiche Nacht, vierter Teil)

- **Elektro-Lehre ist der vierte Bereich** (⚡, gold/gelber Akzent):
  9 Lektionen in drei Gruppen — Grundlagen (Strom, U/I/R, Ohmsches
  Gesetz, Leistung), Sicherheit (Gefahren, die 5 Sicherheitsregeln,
  Schutzleiter/FI) und Praxis (Multimeter, Reihen-/Parallelschaltung) —
  plus 6 Übungen. Eigener Lernstand `red-kurd-electro-progress-v1`.
  Alle Inhalte sind Theorie zum Verstehen; die Texte sagen klar, dass an
  Anlagen Elektrofachkräfte arbeiten.
- Der Umschalter zeigt jetzt vier Bereiche („Sprache | Code | AI |
  Elektro“ auf dem Handy) — ein neuer Bereich ist nur noch ein Eintrag
  in `appModes.js` plus ein Feature-Ordner.
- **Export/Import abgesichert**: Ein Test beweist, dass die Sicherung
  die Lernstände aller Bereiche, das Fehlerbuch und den aktiven Bereich
  mitnimmt.
- 3 weitere Tests (227 gesamt); E2E: Elektro öffnen, erste Lektion
  abschließen → XP 10, gespeichert.

## Nachtrag 4: Mitmach-Aufgaben + mehr Lektionen

Wunsch: „direkte Aufgaben machen — z. B. einen Teil einer Webseite,
einen Button erstellen, Farben — und mehr Lektionen.“

- **Mitmach-Aufgaben mit Sofort-Prüfung** (gemeinsamer Baustein
  `src/features/app-mode/PraxisAufgabe.jsx`, +20 XP je Aufgabe,
  Eingabe wird lokal gespeichert):
  - **Code — „Mitmachen: direkt bauen“** (6 Aufgaben): erste Webseite,
    Button erstellen, Farben ändern, Button schön machen (44-px-Regel!),
    Karte bauen, Seite in Kopf/Inhalt/Fuß aufteilen. Man schreibt
    echten HTML/CSS-Code in ein Feld, die **Live-Vorschau** zeigt sofort
    das Ergebnis (sicher in einer Sandbox, ohne Skripte), und eine
    **Prüfliste** hakt jeden erfüllten Punkt grün ab.
  - **Elektro — „Rechnen: direkt prüfen“** (5 Aufgaben): Strom,
    Widerstand, Spannung, Leistung, FI-Auslösestrom. Komma oder Punkt —
    beides zählt; kleine Rundungen werden toleriert.
  - **AI-Sprache — „Mitmachen: mit Prüfliste schreiben“** (3 Aufgaben):
    kompletten Claude-Auftrag schreiben, Bug-Report ausfüllen, schwachen
    Prompt verbessern — die Prüfliste prüft live auf Ort, Verbote,
    Prüfung, Länge.
- **9 neue Lektionen**: Code (Listen, Formulare, Grid, Übergänge,
  Funktionen, DOM), Elektro (Aderfarben L/N/PE, Drehstrom 230/400 V),
  AI-Sprache (Kontext mitgeben).
- 11 weitere Tests (238 gesamt) — darunter: jede Musterlösung besteht
  ihre eigene Prüfliste, kein Startcode löst die Aufgabe von allein,
  Komma-/Punkt-Zahlen werden verstanden.
- E2E (iPhone-Viewport, 15 Prüfungen grün): Button-Aufgabe lösen →
  Checks werden grün, Vorschau zeigt den Button, +20 XP, Reload behält
  Eingabe und „Erledigt“; Elektro „3,0" mit Komma wird als richtig
  erkannt, falsche Zahl bleibt offen.

## Nachtrag 5: Code-Tastatur — Mitmach-Aufgaben handy-tauglich

Wunsch: „Es sollte auch für Handy gut sein — und eine Code-Tastatur,
die sich direkt dort öffnet wie eine normale Tastatur, aber für Code."

- **Eigene Code-Tastatur** (`src/features/app-mode/CodeTastatur.jsx`):
  Tippt man bei einer Code-Aufgabe ins Feld, öffnet sich direkt darunter
  eine eigene Bildschirm-Tastatur — die iPhone-Tastatur bleibt zu
  (`inputMode="none"`). Drei Ebenen wie bei einer echten Tastatur:
  - **ABC**: QWERTZ-Buchstaben mit ⇧ (Großschreiben), ⌫, Leertaste, ⏎
  - **123**: Ziffern, Satz- und Code-Zeichen (`- / : ; ( ) " ' = +`),
    dazu ä ö ü ß
  - **`<>`**: Code-Zeichen (`< > / = " . #`) und **20 ganze Bausteine**
    zum Antippen — `<h1>…</h1>`, `<p>`, `<button>` (gleich mit
    `type="button"`), `<div>`, `<header>/<main>/<footer>`, `<style>`,
    `class="…"`, `color:`, `background:`, `padding:`, `border-radius:`,
    `min-height:`, `px`, `{ }` u. a.
  - Eingefügt wird immer **an der Cursorposition**; markierter Text wird
    von Bausteinen umschlossen (Wort markieren → `<h1>`-Taste →
    Überschrift). Alle Tasten ≥ 44 px hoch.
  - Umschalten jederzeit möglich: „Gerätetastatur" wechselt zur normalen
    Tastatur, ein Chip „Code-Tastatur verwenden" holt sie zurück.
- **Schlaue Anführungszeichen toleriert**: iOS macht aus `"` gern `„ "` —
  die HTML-Prüfungen zählen beide gleich, eine richtige Lösung fällt
  nie mehr wegen der Tastatur durch.
- 8 weitere Tests (246 gesamt): Einfügen/Umschließen/Löschen an der
  Cursorposition, iOS-Anführungszeichen.
- E2E (iPhone-Viewport, 15 Prüfungen grün): Button-Aufgabe **komplett
  nur mit der Code-Tastatur getippt** (Baustein + Shift + Buchstaben +
  Löschen + ⏎), alle Checks grün, +20 XP; Tasten ≥ 44 px, keine
  horizontale Scrollbar, Umschalten in beide Richtungen.

## Nachtrag 6: Fokus-Fehler behoben — Tastatur klappte nach jedem Buchstaben zu

Gemeldet: „Wenn ich etwas schreibe, geht nach jedem Buchstaben die
Tastatur wieder weg."

- Ursache: Die Fokusfalle in `Modal.jsx` lief bei **jedem Neu-Zeichnen**
  neu (weil sie von der bei jedem Render neuen `schliessen`-Funktion
  abhing) — jeder Tastendruck riss so den Fokus aus dem Eingabefeld auf
  den Schließen-Knopf, und auf dem iPhone klappte die Tastatur zu.
  Betroffen waren alle Eingabefelder in Modalen: Praxis-Aufgaben UND
  die Notizfelder der Übungen.
- Fix: Der Effekt hängt nur noch am Auf/Zu des Modals; die aktuelle
  `schliessen`-Funktion kommt aus einem Ref.
- E2E-Nachweis (vorher rot, nachher grün): „abcdef" tippen → alle
  Buchstaben kommen an, Fokus bleibt im Feld — mit Gerätetastatur, mit
  Code-Tastatur und im Übungs-Notizfeld.

## Nachtrag 7: Mehr Lerninhalte für „Code lernen"

- **10 neue Lektionen** (43 gesamt im Code-Bereich):
  - HTML: Tabellen (table/tr/th/td), Audio und Video einbinden
  - CSS: position sticky/fixed (Bottom-Navigation!), Dunkelmodus mit
    CSS-Variablen — erklärt am echten tokens.css-Muster der App
  - JavaScript: Speichern im Browser (localStorage, JSON) — erklärt am
    echten Speicher-Muster der App; Fehler finden mit console.log
  - TypeScript: Funktionen mit Typen · GitHub: Issues ·
    VS Code: Erweiterungen/Format on Save · Mini-Projekt: Visitenkarten-Seite
- **2 neue Mitmach-Aufgaben** (8 gesamt): „Eine Liste bauen" (ul mit
  drei li) und „Einen Link erstellen" (a mit https-Adresse und klarem
  Linktext). Die Code-Tastatur hat dafür drei neue Bausteine:
  `<ul>…</ul>`, `<li>…</li>`, `<a href="…">`.
- Tests decken alles automatisch mit ab (246 grün); E2E: beide neue
  Aufgaben sichtbar, neue Lektionen in den aufgeklappten Pfaden,
  Listen-Aufgabe komplett nur mit den neuen Tastatur-Bausteinen gelöst
  (+20 XP).

## Nachtrag 8: Mitmachen nach oben, Ergebnis direkt unterm Code, 5 neue Bau-Aufgaben

Wunsch: „Mehr Mitmachen — selber bauen und direkt darunter das Ergebnis
live sehen. Und die Aufgaben sollen oben stehen."

- **Aufgaben zuerst**: In allen drei Bereichen steht die
  Mitmach-Sektion jetzt ganz oben auf der Seite — Code („Mitmachen:
  direkt bauen"), Elektro („Rechnen: direkt prüfen"), AI-Sprache
  („Mitmachen: mit Prüfliste schreiben"). Lernpfade/Lektionen folgen
  darunter.
- **Ergebnis direkt unterm Code**: Im Aufgabenfenster kommt die
  Live-Vorschau („dein Ergebnis") jetzt unmittelbar unter dem
  Eingabefeld — die Code-Tastatur sitzt darunter. Beim Tippen sieht man
  Code und Ergebnis gleichzeitig.
- **5 neue Bau-Aufgaben** (13 gesamt im Code-Bereich):
  Bild mit Alt-Text (die Vorschau zeigt den Alt-Text — der Sinn von alt
  wird sichtbar), kleines Formular (for/id müssen wirklich
  zusammenpassen — die Prüfung gleicht beide ab), Vokabel-Tabelle
  (Kurdisch|Deutsch), Farben als CSS-Variablen (das
  Dunkelmodus-Muster der App zum Anfassen) und als Abschluss-Projekt
  „Deine eigene Seite" (header/main/footer + Liste + Button).
- Die Code-Tastatur kann alles davon: 8 neue Bausteine
  (img, table, tr, th, td, label, input …) — jetzt 31 Bausteine.
- 1 neuer gezielter Test (247 gesamt; die Musterlösungs-/Startcode-Tests
  decken die 5 neuen Aufgaben automatisch mit ab). E2E: Mitmachen ist in
  allen drei Bereichen die erste Sektion, die Vorschau steht direkt
  unter dem Feld, die Bild-Aufgabe wurde gelöst; alle früheren
  E2E-Suiten (Praxis, Tastatur, Fokus) weiter grün.

## Nachtrag 9: Interaktiver Lektions-Player (Mimo-Stil, mit Live-Vorschau)

Wunsch (mit Screenshots aus Mimo): „Der Code-Bereich soll so sein — aber
ich sollte die Übungen live sehen: Wenn ich etwas schreibe, sollte ich
die Ergebnisse direkt sehen."

- **Neuer Lektions-Player** (`src/features/app-mode/LektionPlayer.jsx`):
  Vollbild, oben ✕ und Fortschrittsbalken, EIN Schritt pro Bildschirm,
  unten die Rückmeldung („Das ist richtig! Lass uns so weitermachen." /
  „Nicht ganz — versuch es noch einmal." mit Tipp) und der Weiter-Knopf.
- **Zwei Schritt-Arten**:
  - *Wahl*: Frage + Antwortkarten (auch mit Code wie `<p>`), Einsenden,
    grün/rot-Markierung der Karten.
  - *Bauen*: Code aus Baustein-Chips zusammentippen (absichtlich
    durcheinander), mit ↺ und ⌫, „index.html"-Editor — und **anders als
    bei Mimo: eine Live-Vorschau direkt darunter**, die schon während
    des Bauens jedes angetippte Teil sofort anzeigt.
- **Alle 9 HTML-Lektionen sind jetzt interaktiv** (31 Schritte, darunter
  9 Bau-Schritte mit Vorschau — inkl. der Mimo-Klassiker „Welcher Tag
  erstellt einen Absatz?" und „Programmiere einen Button mit dem Text
  Post"). Lektionen ohne Schritte behalten automatisch das Lese-Modal.
  Abschluss wie gehabt: einmalig +10 XP über den gemeinsamen Lernstand.
- 4 neue Tests (251 gesamt), darunter eine Tiefensuche, die beweist:
  Jede Baustein-Menge ergibt in genau erreichbarer Reihenfolge die
  Lösung — und ist nie schon vorsortiert.
- E2E (11 Prüfungen grün): falsche Antwort → rot, richtige → grün,
  Bau-Schritt per Chips gelöst, Vorschau zeigt „Silav!" schon während
  des Bauens, Abschluss speichert +10 XP.

## Nachtrag 10: CSS und JavaScript ebenfalls interaktiv — und JS läuft wirklich

- **Alle 27 Lektionen der drei Hauptpfade sind jetzt interaktiv**:
  HTML (31 Schritte), CSS (27) und JavaScript (27) — insgesamt
  85 Schritte, davon 26 Bau-Schritte.
- **CSS-Bau-Schritte mit sichtbarem Ergebnis**: roten Absatz färben,
  Karte mit padding, App-Button gestalten, Flexbox-Reihe, Media Query,
  Grid-Raster, Drück-Animation (in der Vorschau ausprobierbar!),
  klebende Kopfzeile (in der Vorschau scrollbar!), dunkle Karte mit
  CSS-Variablen.
- **JavaScript-Bau-Schritte werden wirklich AUSGEFÜHRT**: Die Vorschau
  erlaubt Skripte nur hier — der Code besteht ausschließlich aus
  unseren kuratierten Bausteinen (nie freie Eingabe), und ohne
  allow-same-origin bleibt der Rahmen ohne Zugriff auf Speicher und
  Cookies. Ergebnis: „Silav ji JavaScript!" erscheint, weil DEIN
  zusammengesetzter Code läuft; beim Klick-Schritt reagiert der Knopf
  in der Vorschau tatsächlich; Variablen rechnen (15 XP), if zeigt die
  Tagesziel-Meldung, die Schleife baut eine echte Liste, die Funktion
  begrüßt Zilan, JSON.stringify zeigt den Text.
- Player kann jetzt optional eine „Hülle" um den gebauten Code legen
  (z. B. der leere Absatz plus script-Tag) — der Lernende baut nur die
  spannende Zeile.
- Layout-Fix: Inhalte im Player werden nie mehr zusammengedrückt
  (flex-shrink), bei Platzmangel scrollt der Bereich.
- 1 neuer Test (252 gesamt) — Hülle/Skript-Regeln; die Tiefensuche
  prüft auch alle 17 neuen Bau-Schritte. E2E: CSS-Absatz ist wirklich
  rot (getComputedStyle), JS-Code läuft, Klick in der Vorschau wirkt,
  css-1 und js-1 abgeschlossen.

## Nachtrag 11: „Jetzt du" — selber schreiben, nicht nur klicken

Wunsch: „Ich sollte auch selber schreiben, nicht nur klicken."

- **Neue Schritt-Art „Selber schreiben"** im Lektions-Player: ein
  eigenes Codefeld (mit der Code-Tastatur samt Bausteinen und
  Gerätetastatur-Umschalter), die Live-Vorschau direkt darunter und
  eine Prüfliste, die live grün abhakt. Erst wenn deine eigene Lösung
  alle Punkte erfüllt, geht es weiter.
- **7 „Jetzt du"-Schritte** als Abschluss wichtiger Lektionen:
  Absatz (html-1), Überschrift (html-2), Button mit type (html-3),
  Liste (html-6), p-Regel mit Farbe (css-1, mit vorbereitetem
  style-Block), Button-Gestaltung mit 44-px-Regel (css-3) und die
  querySelector-Zeile (js-1) — **der selbst getippte JS-Code läuft
  wirklich in der Vorschau**.
- Schlaue iOS-Anführungszeichen zählen auch hier wie gerade.
- 2 neue Tests (254 gesamt): jede Musterlösung besteht ihre Prüfliste,
  kein Starttext löst von allein, Anführungszeichen-Toleranz.
- E2E: Code-Tastatur öffnet sich im Player, Prüfliste hakt live ab,
  eigener Text erscheint in der Vorschau, eigener JS-Gruß („Rojbaş!")
  läuft, Lektionen weiterhin mit +10 XP abschließbar.

## Nachtrag 12: Multi-App-System — App-Auswahl, harte Trennung, App-Identitäten

Korrektur-Auftrag: „Code lernen soll sich wie eine EIGENE App anfühlen —
mehrere Apps in einer Website, jede öffnet sich getrennt."

- **App-Auswahl (Launcher)**: Beim allerersten Start fragt RED-KURD
  „Welche App möchtest du öffnen?" — vier Karten (Sprache lernen 🌍,
  Code lernen, AI-Sprache, Elektro-Lehre), jede mit Symbol,
  Beschreibung, eigener Farbe und großem Öffnen-Knopf. Während die
  Auswahl offen ist, ist KEINE App sichtbar.
- **Harte Trennung bestätigt und getestet**: Die aktive App füllt den
  ganzen Bildschirm; die Sprach-App (inkl. ihrer Navigation und
  Kopfleiste) wird in den anderen Apps gar nicht erst gerendert —
  nichts überlappt, nichts steht untereinander.
- **„← Apps"**: In jeder App führt der Apps-Knopf im Umschalter zurück
  zur Auswahl; die Schnell-Chips (Sprache | Code | AI | Elektro)
  bleiben für den direkten Wechsel.
- **Neuer Speicher-Schlüssel** `red-kurd-active-app-v1` (Werte
  language/code/prompting/electro, Standard language). Der alte
  Schlüssel `red-kurd-active-app-mode-v1` wird beim Lesen übernommen
  und beim Speichern weiter mitgeschrieben — ein Rücksprung auf eine
  ältere Version verliert nichts.
- **App-Identitäten**: Sprache grün/türkis, Code blau/violett,
  AI-Sprache rot/orange, Elektro gold — in Auswahl und Umschalter.
- 1 neuer Test + erweiterte Storage-Tests (255 gesamt). E2E: alle
  6 Akzeptanztests des Auftrags grün (36 Prüfungen) — Auswahl, Nur-Code,
  Nur-Sprache, Nur-AI, Reload-Persistenz, Mobile-Regeln (44-px-Buttons,
  keine horizontale Scroll-Leiste).
- Struktur: statt des vorgeschlagenen src/apps/-Umbaus wurde passend in
  die bestehende Struktur integriert (src/features/app-mode/ trägt
  Launcher + Umschalter + Speicher; die Apps liegen in src/features/*
  bzw. src/modes für Sprache) — kein riskanter Großumzug.

## Nachtrag 13: Abenteuer ist eine ANSICHT, keine App

Korrektur-Auftrag: „Abenteuer ist keine eigene App — es ist eine Ansicht
innerhalb von Sprache lernen."

- **Prüfung**: Launcher, Umschalter, appModes und App-Speicher kannten
  Abenteuer nie als App — die Struktur war korrekt (Ansichten leben in
  `red-kurd-ui-v1` → mode modern/abenteuer/redlingo, getrennt vom
  App-Schlüssel, ein gemeinsamer Lernstand).
- **Neu: Ansichts-Umschalter oben in der Sprach-App**
  („Ansicht: Modern | Abenteuer | Redlingo") — nur dort sichtbar, auf
  Übungs-/Lektionsseiten ausgeblendet. Wechsel sofort, gleicher
  Lernstand, globale App bleibt „language".
- **Absicherung im Speicher**: Sollte je `activeApp="adventure"` (oder
  „abenteuer") gespeichert sein, migriert die App zu
  `activeApp="language"` + Ansicht „abenteuer" — und ein solcher Wert
  lässt sich nicht mehr als App speichern.
- **Launcher-Texte** nach Auftrag: „Deine kostenlose lokale Lernwelt." /
  „Wähle, was du lernen möchtest." / Sprache-Karte mit Zusatz „Mit
  Modern-Ansicht und Abenteuer-Ansicht." / Fußzeile „Kostenlos · lokal ·
  ohne Konto".
- **Doku klargestellt** (README, ARCHITEKTUR): „Abenteuer ist kein
  eigener App-Bereich, sondern die spielerische Ansicht der
  Sprache-lernen-App." AUFGABEN.md enthielt nichts Falsches.
- 2 neue Tests (257 gesamt). E2E: 23 Ansicht-Prüfungen grün (Launcher
  genau 4 Apps, Umschalter, Abenteuer-Wechsel + Reload, Migration,
  Code-App ohne Abenteuer-Inhalte) + die 36 Multi-App-Prüfungen weiter
  grün.

## Nachtrag 14: Elektro-Lehre wird eine echte App (Phase 3)

Aus der Karte mit Lektionen ist eine App mit eigener Navigation geworden:
**Heute · Noten · Prüfung · Bericht · Formeln · Lernen**.

- **Heute**: nächste Prüfung mit Countdown („noch 3 Tage"), Notenschnitt
  mit Ampel, offene Berichtsheft-Wochen, Formel des Tages, Regel des
  Tages aus den fünf Sicherheitsregeln.
- **Noten**: acht Fächer als Startbestand (Elektrotechnik, Mathematik,
  Deutsch, Allgemeinbildung, Berufskunde, Zeichnen/Schema,
  Werkstatt/Praxis, Sicherheit), eigene Fächer ergänzbar. Noten mit
  Thema, **Gewicht** und Datum; gewichteter Schnitt, beste/schlechteste
  Note, Trend und der **Ziel-Rechner**: „Zielnote 5 → nächste Prüfung
  mindestens 6" (und ehrlich „mit einer Prüfung nicht mehr erreichbar",
  wenn es rechnerisch nicht geht).
- **Notenskala umschaltbar**: Schweiz (6 = beste) oder Deutschland
  (1 = beste). Alle Rechnungen fragen die Skala — bestanden, beste Note
  und Trend drehen sich mit.
- **Prüfungen**: Titel, Fach, Datum, Themen, Stand (Nicht begonnen · Am
  Lernen · Wiederholen · Bereit · Erledigt), sortiert nach Datum.
- **Berichtsheft**: Woche, Zeitraum, Tätigkeiten, Gelerntes, Status
  (Offen · Geschrieben · Kontrolliert · Abgegeben), neueste oben.
- **Formeln & Rechner**: Ohmsches Gesetz (alle drei Richtungen),
  Leistung, Energie + Stromkosten, Spannungsfall (Wechsel-/Drehstrom,
  Kupfer/Aluminium, in Volt und Prozent), Formelsammlung und die fünf
  Sicherheitsregeln in der richtigen Reihenfolge.
- **Lernen**: die bisherigen Lektionen, Rechen-Aufgaben und Übungen —
  unverändert, nur ohne doppelten Kopf.
- Technik: reine Rechenlogik in `src/core/elektro/` (notenRechnung.js,
  formeln.js), Speicher in `schuleStore.js` über den neuen Schlüssel
  `red-kurd-electro-school-v1` — wandert automatisch in Export/Import.
- 20 neue Tests (277 gesamt): Gewichtung, Ziel-Rechner in beide
  Skalen-Richtungen, Trend, Spannungsfall gegen Handrechnung, kaputter
  Speicherstand. E2E: 30 Prüfungen grün — Note eintragen (auch „5,5"
  mit Komma), ungültige Note abgelehnt, Countdown, Berichtsheft,
  Live-Rechner, alles nach Reload noch da, mobil ohne Scroll-Leiste.

## Nachtrag 15: AI-Sprache wird eine Werkstatt (Phase 5)

Auch die AI-Sprache hat jetzt eine eigene Navigation:
**Heute · Auftrag · Bug-Report · PR prüfen · Lernen** — und drei
Werkzeuge, mit denen man wirklich arbeitet statt nur liest.

- **Auftrag-Baukasten**: Fünf Felder (Ziel · Ort · Nicht erlaubt ·
  Prüfung · Arbeitsweise) — beim Tippen entsteht darunter **live der
  fertige Claude-Code-Auftrag** mit sauberen Überschriften; mehrzeilige
  Felder werden automatisch zur Aufzählung. Ein Knopf kopiert alles in
  die Zwischenablage.
- **Ehrliche Prüfliste**: Sie verlangt ein Ziel mit Substanz (≥ 30
  Zeichen), Ort, mindestens ein Verbot und eine Prüfung — und sie
  erkennt leere Wörter: „Mach die Seite besser" fällt durch, mit
  Begründung.
- **Bug-Report-Generator**: Was passiert · Erwartet · Nachstellen ·
  Gerät · Fehlermeldung. Die Schritte werden automatisch nummeriert;
  ein einzelner Schritt zählt nicht als Anleitung.
- **PR prüfen**: acht Fragen zum Abhaken mit ehrlicher Empfehlung.
  Tests/Build und die Verbote sind **Ausschlusskriterien** — fehlen
  sie, sagt die App „Zurückgeben" statt „fast fertig".
- Angefangene Texte und Haken überleben das Neuladen (neuer Schlüssel
  `red-kurd-prompting-workshop-v1`, wandert in Export/Import mit).
- Logik in `src/core/prompting/promptBaukasten.js` (rein, testbar),
  Speicher in `werkstattStore.js`.
- 13 neue Tests (290 gesamt). E2E: 26 Prüfungen grün — Live-Text,
  „besser"-Erkennung, Kopieren in die Zwischenablage, nummerierte
  Schritte, Merge-Empfehlung in drei Stufen, Reload-Persistenz, mobil.

## Nachtrag 16: Sicherung über alle vier Apps + der Rest wird interaktiv

**Phase 7 — die Sicherung ist bewiesen.** Ein neuer Rundlauf-Test macht
den Ernstfall durch: in allen vier Apps etwas tun → exportieren → Gerät
komplett leeren → importieren → prüfen, ob wirklich alles zurückkommt.
Zurück sind: Sprach-Lernstand und Profil, Code-Lektion und Fehlerbuch,
AI-Lektion samt angefangenem Auftrag und PR-Haken, Elektro-Lektion mit
Note, Prüfung und Berichtsheft-Woche. Dazu drei Sicherheitsnetze:
- Die XP der vier Apps bleiben getrennt — keine App zählt für die andere.
- Gerätelokale Werte (Anmelde-Entscheidung, laufende Sitzung) wandern
  bewusst NICHT in die Sicherung.
- Eine fremde oder kaputte Datei überschreibt garantiert nichts.

**Der Code-Bereich ist jetzt vollständig interaktiv.** Auch TypeScript,
GitHub, VS Code und die Mini-Projekte laufen im Schritt-Player — der
Test besteht darauf, dass **jede** Lektion Schritte hat:
- TypeScript: Funktionen mit Typen, string[], interface, Rückgabetypen —
  Bau-Schritte ohne Vorschau (es gibt nichts anzuzeigen), Editor bleibt.
- GitHub: Commit-Nachrichten, Branch → PR → Merge als Reihenfolge-Aufgabe,
  Issues und „closes #12".
- VS Code: Strg+P, Projekt-Suche, Terminal-Befehle in der richtigen
  Reihenfolge, Prettier und Format on Save.
- Mini-Projekte: Filmkarte bauen (mit Vorschau) und selbst schreiben,
  Notenrechner mit abgesichertem Randfall (läuft wirklich),
  Bottom-Navigation, Visitenkarten-Seite als „Jetzt du".
- 4 neue Tests (294 gesamt). E2E: 14 Prüfungen grün — inklusive des
  schönen Nebenbefunds, dass spätere Lektionen korrekt gesperrt bleiben,
  bis die davor fertig sind.

## Offene nächste Schritte
- mehr „Jetzt du"-Schreib-Schritte (weitere CSS-/JS-Lektionen)
- Lernpfad-Ansicht als Knoten-Karte (Mimo-Wegpunkte) — größerer Umbau
- mehr Mitmach-Aufgaben (Elektro: Reihen-/Parallel-Rechnungen;
  Code: kleine JS-Aufgaben)
- gemeinsame Wochenübersicht über alle Bereiche
