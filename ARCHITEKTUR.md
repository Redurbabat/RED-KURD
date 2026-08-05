# RED-KURD – Architektur

RED-KURD ist eine Website mit mehreren Apps: **Sprache lernen**,
**Code lernen**, **AI-Sprache** und **Elektro-Lehre** (App-Auswahl und
Umschalter in `src/features/app-mode/`). Sichtbar ist immer genau eine App.

Die Sprach-App hat **drei Ansichten** (Modern, Abenteuer, Redlingo) und
**einen** Lernstand. Abenteuer ist kein eigener App-Bereich, sondern die
spielerische Ansicht der Sprache-lernen-App. Ein Ansichtswechsel ändert nur
die Darstellung — XP, Serie, Karten, Sitzungen, Einheiten und Fertigkeiten
bleiben identisch.

```
src/
  app/          App.jsx · AppRouter.jsx · router.jsx
  core/         Lernlogik ohne Oberfläche
  components/   wiederverwendbare Bausteine
  modes/        modern/ und adventure/ – nur Darstellung
  features/     Übung, Wörterbuch, Lesen, Schrift, Sprechen
  styles/       tokens.css · global.css · components.css · modern.css · adventure.css
```

## Lern-Engine (`src/core`)

| Datei | Aufgabe |
|---|---|
| `storage.js` | localStorage-Zugriff + Migration der v1-Schlüssel |
| `store.js` | `melden()` / `useLernstand()` — Oberfläche neu zeichnen |
| `progress/progressStore.js` | XP, Serie, Edelsteine, Schlüssel, Einheiten, Sterne, Karten, Tage, Truhe |
| `progress/progressSelectors.js` | `statistik()`, `faelligeKarten()`, `fertigkeiten()`, `wochenAktivitaet()` … |
| `progress/scheduler.js` | Wiederholsystem (Stufen, Abstände) |
| `session/sessionStore.js` | laufende Sitzung sichern / laden / löschen |
| `session/sessionPlanner.js` | `planeSitzung()`, `planeLektion()`, `planeWiederholung()`, `planeTraining()` |
| `session/exerciseFactory.js` | `baueUebungen()`, `mische()`, `istRichtigGetippt()` |
| `courses/courseRepository.js` | Einheiten, Lektionen, Welten, Status, Fortschritt |
| `profile/profileStore.js` | Name, Ziel, Vorkenntnisse, Tagesziel, Variante |
| `ui/uiStore.js` | Modus, Design, Ton, Animationen, Erinnerungen |
| `shop/shopStore.js` | Shop-Artikel (nur Aussehen und Komfort) |
| `tasks/taskStore.js` | Tages- und Wochenaufgaben |
| `achievements/achievementsStore.js` | Auszeichnungen |
| `texts.js` | alle wiederkehrenden Oberflächentexte |

## Speicherschlüssel

| Schlüssel | Inhalt |
|---|---|
| `red-kurd-profile-v2` | Profil |
| `red-kurd-progress-v2` | Lernstand (XP, Karten, Einheiten, Tage …) |
| `red-kurd-session-v2` | laufende Sitzung |
| `red-kurd-ui-v1` | Modus, Design, Ton |
| `red-kurd-shop-v1` | gekaufte Artikel |
| `red-kurd-achievements-v1` | Auszeichnungen |
| `red-kurd-tasks-v1` | abgeholte Aufgabenbelohnungen |

Alte Schlüssel (`red-kurd-fortschritt-v1`, `red-kurd-profil-v1`,
`red-kurd-session-v1`, `red-kurd-modus`) werden beim Start **kopiert**, nicht
gelöscht — ein Rückschritt auf eine ältere Version verliert also nichts.

## Adressen

```
/today                              /adventure
/session                            /adventure/world
/course                             /adventure/world/:worldId
/course/:unitId                     /adventure/lesson/:lessonId
/course/:unitId/lesson/:lessonId    /adventure/tasks
/practice                           /adventure/shop
/practice/review|images|listening|  /adventure/profile
  writing|speaking|sentence-builder
/explore                            /settings
/explore/dictionary|reading|script
/progress
```

Alte interne Adressen (`/heute`, `/kurs`, `/ueben`, …) leiten automatisch weiter.

## Regeln

1. Seiten enthalten **keine** Lernlogik — sie rufen Selektoren und Planer auf.
2. Nach jeder Änderung am Lernstand ruft der Store `melden()`; Seiten holen sich
   mit `useLernstand()` ein Neuzeichnen.
3. Keine Inline-Styles für Aussehen — nur Tokens und Klassen.
4. Icons kommen aus `components/icons/Icon.jsx`, nicht aus Emojis.
5. Jede Schaltfläche hat Text oder `aria-label`, Mindestgröße 44 × 44 px.
6. Kurmancî-Text bekommt `lang="ku"`, arabische Schrift zusätzlich `dir="rtl"`.
