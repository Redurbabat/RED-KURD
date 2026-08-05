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

## Offene nächste Schritte

- Bereichs-Lernstand in Export/Import aufnehmen (KEYS sind registriert,
  Export nimmt sie automatisch mit)
- Elektro-Lehre als vierter Bereich
- automatische Prüfung einzelner Übungen (z. B. Noten-Durchschnitt)
