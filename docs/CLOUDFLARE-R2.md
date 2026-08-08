# Cloudflare & R2 — Veröffentlichung und öffentliche Daten

Cloudflare ist das Deployment-Ziel von RED-KURD: Ein **Worker**
(`sites/worker.js`) liefert die App aus und bindet einen **R2-Bucket**
(`RED_KURD_DATA`) für große öffentliche Daten an.

## Eiserne Regel

Nach Cloudflare/R2 gehen ausschließlich **öffentliche** Daten:

| Öffentlich (R2 erlaubt) | Privat (bleibt im Browser) |
|---|---|
| Kursdaten, Wörterbuch-Chunks | Profil, Lernstand, Serie |
| Audio-Aufnahmen (freie Lizenz) | eigene Aufnahmen |
| Bilder (mit Lizenznachweis) | Einstellungen, Sicherungen |
| die gebaute App selbst | alles unter `local-data/private` |

Der Worker erzwingt das technisch mit: Der Upload-Endpunkt akzeptiert nur
Schlüssel unter `daten/` und `app/` (`sites/worker.js`, `r2Hochladen`).

## Wie der Worker ausliefert

Reihenfolge je Anfrage (`sites/worker.js`):

1. **`/api/auth/*`** → Konto-Endpunkte (`sites/auth.js`, D1-Datenbank).
2. **`PUT /__admin/r2/<key>`** → Upload, nur mit Bearer-Token
   (`R2_UPLOAD_TOKEN`, zeitkonstant verglichen), max. 95 MiB je Datei,
   nur `daten/`- und `app/`-Schlüssel.
3. **`/daten/*`** → aus R2 (`daten/…`), mit ETag/304 und
   `max-age=3600, stale-while-revalidate=86400`.
4. **Statische Dateien** aus dem ASSETS-Binding (der gebaute `dist/`).
5. **404 + Accept: text/html** → `index.html` (SPA-Fallback für
   Tiefenlinks wie `/today`, `/course/…`).
6. Letzter Rückgriff: App-Dateien aus R2 unter `app/…`.

Jede HTML-Antwort bekommt zum Schluss (`mitOeffentlicherAdresse`):
`__SITE_ORIGIN__` → tatsächlicher Origin (og:image-Links), plus
Security-Header (CSP `default-src 'self'`, nosniff, frame-options,
referrer-policy). **Deshalb bleibt der Platzhalter im Build stehen** —
nur für Sonderfälle ersetzt ihn `SITE_ORIGIN` beim Build
(`scripts/prepare-sites-build.mjs`).

## Veröffentlichen

```bash
npm run build        # baut dist/ und kopiert den Worker nach dist/server/
npm run app:upload   # kleine App-Dateien nach R2 unter app/ (optional)
```

Der Worker selbst wird über das Cloudflare-Dashboard/Wrangler mit
`dist/server/index.js` als Einstieg und `dist/` als ASSETS deployt.
Bindings: `RED_KURD_DATA` (R2), D1 für Konten, Secrets `R2_UPLOAD_TOKEN`.

## Öffentliche Daten hochladen

```bash
# Daten lokal vorbereiten (nicht in Git):
local-data/cloudflare/daten/…      # Kurspakete, Wörterbuch-Chunks

npm run data:check                  # Dry-Run: zählt, prüft Größenlimits
RED_KURD_SITE_URL=https://…    \
RED_KURD_UPLOAD_TOKEN=…        \
npm run data:upload                 # lädt über den Worker nach R2
```

Limits (Skript bricht vorher ab): 95 MiB je Datei, 3 GiB gesamt.
Netzwerkfehler werden bis zu fünfmal mit wachsendem Abstand wiederholt.

Cache-Regeln setzt das Skript pro Schlüssel (`cacheRegel`):
`app/index.html`, `sw.js`, Manifest → `no-cache`; gehashte
`app/assets/…` → ein Jahr `immutable`; alles andere → eine Stunde mit
`stale-while-revalidate`.

## Wie die App die Daten lädt

- `src/core/data/staticData.js` holt `/daten/woerter.json`,
  `/daten/wiki.json`, `/daten/beispiele.json` lazy und die
  Kurdish-Tech-Wörterbuch-Chunks buchstabenweise (`/daten/kt/…`).
- Der Service Worker (`public/sw.js`) hält `/daten/`-Antworten als
  stale-while-revalidate im größenbegrenzten Medien-Cache — einmal
  Geladenes funktioniert offline weiter.
- Fehlt R2 (lokale Entwicklung, Offline), trägt der eingebaute
  Kurswortschatz — die App bricht nie.

## Tests

`test/sites-worker.test.js` deckt Worker-Routing, SPA-Fallback,
`__SITE_ORIGIN__`-Ersetzung, Upload-Autorisierung und die
Schlüssel-Beschränkung ab; `npm test` führt sie mit aus.
