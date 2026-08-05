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

## Offene nächste Schritte

- interaktive Schritte für CSS- und JavaScript-Pfad (Muster steht)
- Lernpfad-Ansicht als Knoten-Karte (Mimo-Wegpunkte) — größerer Umbau
- mehr Mitmach-Aufgaben (Elektro: Reihen-/Parallel-Rechnungen;
  Code: kleine JS-Aufgaben)
- gemeinsame Wochenübersicht über alle Bereiche
