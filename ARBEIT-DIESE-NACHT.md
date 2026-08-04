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

## Offene nächste Schritte

- echte Lektionen anklickbar machen (Inhalte je Lektion)
- XP und Fortschritt der neuen Bereiche wirklich speichern
  (eigene Schlüssel, z. B. `red-kurd-code-progress-v1`)
- Übungen interaktiv machen (Eingabe + Prüfung)
- Fehlerbuch bauen (lokale Einträge)
- Elektro-Lehre als vierter Bereich
