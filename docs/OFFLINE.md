# Offline — wie RED-KURD ohne Netz funktioniert

Local-first heißt: Lernen geht immer, Netz ist Zugabe. Träger der
Offline-Fähigkeit sind der Service Worker (`public/sw.js`), das
Code-Splitting mit Leerlauf-Nachladen und der eingebaute Kurswortschatz.

## Service Worker (`red-kurd-v3`)

Registriert nur im Produktions-Build (`import.meta.env.PROD`) — beim
Entwickeln (auch über LAN-IP am iPhone) bleibt der Cache sauber.

| Anfrage | Strategie |
|---|---|
| Seitenaufrufe (`navigate`) | Netz mit 4-s-Limit, sonst gecachte App-Hülle. Nur gesunde Antworten (`res.ok`) dürfen die Hülle ersetzen — eine Fehlerseite bricht die Offline-App nie. |
| `/assets/*` (gehashte Bundles) | **Cache zuerst** — unveränderlich, Netz nur beim ersten Mal. |
| `/bilder/`, `/audio/`, `/daten/` | Cache sofort, Aktualisierung im Hintergrund (stale-while-revalidate), eigener Cache mit **150-Einträge-Limit** (älteste zuerst raus — iOS räumt übervolle Caches sonst komplett ab). |
| `/api/*` | nie angefasst (lokaler Konto-Server). |
| alles Übrige | Netz, sonst Cache; ohne beides eine ehrliche 504 statt untergeschobener HTML-Hülle. |

Versionswechsel: Cache-Namen tragen die Version (`red-kurd-v3`,
`red-kurd-medien-v3`); `activate` räumt alle anderen ab.

## Code-Splitting und Offline-Abdeckung

Der schnelle Lernpfad (Heute, Sitzung, Kurs, Üben) steckt im
Start-Bundle. Alle übrigen Seiten laden lazy — **und werden nach dem
Start im Leerlauf komplett nachgeladen** (`AppRouter.jsx`), damit der
Service Worker jeden Chunk einsammelt. Ergebnis: schneller erster Aufbau
*und* volle Offline-Abdeckung, sobald die App einmal kurz online war.

## Was offline funktioniert

- Alle Lektionen, Übungen, Wiederholungen (Kursdaten sind im Bundle).
- Lernstand, XP, Serie, Aufgaben, Shop — alles liegt im Browser.
- Bereits geladene Fotos, Audio-Aufnahmen und Wörterbuch-Chunks.
- Eigene Aussprache-Aufnahmen (IndexedDB, verlassen das Gerät nie).

Was Netz braucht: das große Wörterbuch/Satzpaket beim **ersten** Laden
(`/daten/…` aus R2), neue Audio-Aufnahmen, das optionale Konto.
Ohne Netz fällt die Sprachausgabe auf die Systemstimme zurück.

## iPhone-Installation

Safari → **Teilen → „Zum Home-Bildschirm“**. Als installierte App:

- eigener, stabilerer Speicher (Safari-ITP-Löschung nach 7 Tagen trifft
  vor allem den Browser-Tab; zusätzlich fragt die App
  `navigator.storage.persist()` an),
- dunkler Start ohne weißen Blitz (`manifest.webmanifest`),
- Vollbild ohne Safari-Leisten (`display: standalone`).

## Prüfen

```bash
npm run build && npx vite preview
# DevTools → Netzwerk „Offline“ → App neu laden:
# Hülle erscheint, /today & Co. funktionieren, Datenanfragen geben 504.
```

`test/sw.test.js` deckt die Strategien mit Attrappen ab (Fehlerseiten,
Cache-first, Limit, 504, Versionswechsel).
