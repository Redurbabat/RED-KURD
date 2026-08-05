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

## Offene nächste Schritte

- mehr Mitmach-Aufgaben (Elektro: Reihen-/Parallel-Rechnungen;
  Code: kleine JS-Aufgaben)
- mehr Lektionen je Pfad (Elektro: Motoren; Code: React)
- gemeinsame Wochenübersicht über alle Bereiche
