# Datenmodell — was wo gespeichert ist

Alle Zugriffe laufen über `src/core/storage.js` (`lies`/`schreibe`/
`entferne`). Nirgendwo sonst wird `localStorage` direkt angefasst.
Jede Änderung an diesen Formaten braucht Tests (`test/storage.test.js`,
`test/progressStore.test.js`) — **Lernstand darf niemals verloren gehen.**

## localStorage-Schlüssel (`KEYS` in storage.js)

| Schlüssel | Inhalt | Export? |
|---|---|---|
| `red-kurd-profile-v2` | Profil (Name, Ziel, Tagesziel, Variante) | ja |
| `red-kurd-progress-v2` | **der eine Lernstand** (siehe unten) | ja |
| `red-kurd-session-v2` | laufende Sitzung | **nein** (gerätelokal) |
| `red-kurd-ui-v1` | Modus, Design, Ton, Animationen | ja |
| `red-kurd-shop-v1` | gekaufte/aktive Artikel | ja |
| `red-kurd-achievements-v1` | Auszeichnungen mit Erreicht-Datum | ja |
| `red-kurd-tasks-v1` | abgeholte Aufgaben, Tages-/Wochenmarken | ja |
| `red-kurd-hearts-v1` | Herzen + Nachwachs-Zeitpunkt | ja |
| `red-kurd-language-courses-v1` | Fortschritt der Zusatz-Sprachkurse | ja |
| `red-kurd-ohne-konto-v1` | „ohne Konto lernen“-Entscheidung | **nein** |

Zusätzlich, nur im Fehlerfall: `<schlüssel>-defekt` — der rohe Text eines
nicht mehr parsbaren Eintrags, gesichert **bevor** irgendetwas ihn
überschreibt (Handrettung möglich). Ein bestehendes Backup wird nie durch
neuere Korruption ersetzt.

## Der Lernstand (`red-kurd-progress-v2`)

Ein Objekt für **alle drei Modi** (Modern/Abenteuer/Redlingo). Niemals
getrennte Fortschritts-Schlüssel pro Modus anlegen.

```js
{
  version: 2,
  xp: 0,                    // Level = floor(xp/100)+1
  serie: 0,                 // Tagesserie
  letzterTag: 'JJJJ-MM-TT', // letzter Tag mit richtiger Antwort
  serienSchutz: 0,          // 0..3, überbrückt je einen Fehltag
  einheiten: { einheitId: besteProzent },
  sterne:    { einheitId: 0..3 },
  bestanden: { einheitId: AnzahlBestandenerPruefungen },
  karten:    { 'de|ku|skill': { stufe, faellig, gesehen, richtig } },
  tage:      { 'JJJJ-MM-TT': { aufgaben, richtig, sekunden, skills, folge, maxFolge } },
  edelsteine: 0, schluessel: 0,
  zielBelohnt: 'JJJJ-MM-TT' | null,   // Tagesziel-Belohnung abgeholt
  truhe: 'JJJJ-MM-TT' | null,          // Tagestruhe geöffnet
  weltTruhen: { weltId: 'JJJJ-MM-TT' },
  lernzeit: 0,              // Sekunden gesamt
}
```

- **Karten-Schlüssel**: `deutsch|kurmancî|fertigkeit` mit Fertigkeit aus
  `['erkennen','abrufen','schreiben','hoeren']`. Alt-Karten ohne
  Fertigkeit gelten als `gemischt`.
- **Stufen**: richtig → Stufe+1 (max 6), fällig nach 1/3/7/16/35/70
  Tagen; falsch → Stufe 0, sofort fällig. Ab Stufe 3 gilt „sicher“.
- **Kalendertage** immer in Gerätezeitzone (`tagVon`), nie `toISOString`.
- `tage` behält nur die letzten 60 Einträge.

## Migration (storage.js, läuft einmal pro Start)

1. Umbenannte Lernpaare (`UMBENANNT`) werden auf die aktuelle Schreibweise
   gehoben; bei Konflikt gewinnt die weiter fortgeschrittene Karte.
2. v1-Schlüssel (`red-kurd-fortschritt-v1`, `-profil-v1`, `-session-v1`,
   `red-kurd-modus`) werden **kopiert, nie gelöscht** — ein Rückschritt
   auf eine ältere App-Version verliert nichts.
3. Vorhandene v2-Daten werden nie überschrieben.

Einzige Ausnahme vom Nie-Löschen: der **bewusste** Onboarding-Neustart in
den Einstellungen entfernt auch das v1-Profil — sonst würde die Migration
es sofort wiederherstellen.

## Exportdatei (`exportiereAlles`)

```js
{
  version: 2,
  app: 'RED-KURD',
  exportiert: '…ISO…',
  fortschritt: { … },   // der Lernstand, nur hier (nicht doppelt)
  speicher: { profil, ui, shop, … },  // ohne sitzung, ohne ohneKonto
}
```

Der Import prüft mit `istLernstand()` die Form, bevor irgendetwas
geschrieben wird; unbekannte Schlüssel werden ignoriert; alte
Exportdateien (mit der früheren fortschritt-Kopie in `speicher`) bleiben
importierbar.

## Fehlerfälle

- `schreibe()` scheitert (voll/privat): einmalige Meldung über
  `beiSpeicherproblem()` → die App zeigt einen Warnhinweis.
- Kaputtes JSON: Ersatzwert + `-defekt`-Backup (siehe oben).
- Mehrere Tabs: `storage`-Events leeren die Store-Caches
  (`beiFremdaenderung`); Schreibkonflikte sind last-writer-wins.
- Safari ITP: `navigator.storage.persist()` wird beim Start angefragt;
  zusätzlich regelmäßig exportieren.
