# iPhone 13 Pro Max — Zielgerät und Prüfungen

Das iPhone 13 Pro Max ist das Haupt-Zielgerät der App.

| Merkmal | Wert |
|---|---|
| Display | 6,7 Zoll |
| Auflösung | 1284 × 2778 px |
| CSS-Viewport | **428 × 926 px** |
| Device Scale Factor | 3 |
| Browser | Safari (WebKit) |

## Regeln für die Oberfläche

1. **Touchflächen:** mindestens 44 × 44 px (`--touch-min` in
   `src/styles/tokens.css`); wichtige Buttons 52–56 px hoch.
2. **Bottom-Navigation:** auf Mobilgeräten immer sichtbar, mit
   `env(safe-area-inset-bottom)` für den Home-Indikator gepolstert
   (`viewport-fit=cover` ist in `index.html` gesetzt).
3. **Safe Area:** Kopfleiste mit `env(safe-area-inset-top)`, Inhalte mit
   `calc(var(--nav-height) + env(safe-area-inset-bottom) + …)` Abstand.
4. **Keine horizontale Scrollbar:** keine `100vw`-Breiten, breite Inhalte
   scrollen in eigenen `overflow-x: auto`-Containern.
5. **Eingabefelder nie unter 16 px Schrift** — sonst zoomt iOS-Safari beim
   Fokus in die Seite. Global abgesichert in `src/styles/global.css`
   (`font-size: max(16px, 1em)`) und in `.rk-feld`
   (`max(16px, var(--text-base))`).
6. **Kein Hover-only-Verhalten** — alles per Touch erreichbar.
7. Übungsseiten (`/session`, Lektionen) laufen bewusst **ohne** Navigation,
   damit nichts vom Lernen ablenkt.

## Automatische Prüfung

Der Playwright-Smoke-Test lädt den Produktions-Build (`npm run build` +
`vite preview`) mit Viewport 428 × 926, DPR 3 und iOS-User-Agent und prüft
auf jeder Hauptseite:

- keine horizontale Scrollbar (`scrollWidth` ≤ `innerWidth`)
- Bottom-Navigation sichtbar (außer auf Übungsseiten)
- keine sichtbaren Buttons/Links unter 43 px in beiden Richtungen
- keine Eingabefelder unter 16 px Schriftgröße
- Screenshot je Seite zur Sichtprüfung

Geprüfte Seiten: `/today`, `/course`, `/practice`, `/explore`,
`/explore/dictionary`, `/progress`, `/settings`, `/adventure`,
`/adventure/world`, `/redlingo`, `/session`.

**Stand August 2026: alle Prüfungen bestanden.** Behobene Funde:
Eingabefelder (Wörterbuch-Suche, Einstellungen, Import) lagen mit
`--text-base` bei 15,2 px und lösten den iOS-Zoom aus.

## Installation auf dem Home-Bildschirm

Die App ist eine PWA (`public/manifest.webmanifest`, `public/sw.js`).
Auf dem iPhone: **Safari → Teilen → „Zum Home-Bildschirm“.**
