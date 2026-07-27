# RED-KURD – Kurdisch lernen

Kurmancî lernen – frei und offen. Start: **Deutsch–Kurmancî**, später weitere
Sprachen. Schwester-Projekt von [BABAT-RED](https://github.com/Redurbabat/BABAT-RED).

## Zwei Oberflächen, ein Lernstand

| Modern | Abenteuer |
|---|---|
| Klare, ruhige Lernoberfläche | Spielerische Lernreise mit Weltkarte |
| Heute · Kurs · Üben · Entdecken · Fortschritt | Welt · Aufgaben · Shop · Profil |

Der Wechsel läuft über **Einstellungen → App-Modus**. Es ändert sich ausschliesslich
die Darstellung: XP, Tagesserie, Wiederholsystem, Kursfortschritt, Fertigkeiten und
laufende Sitzungen sind in beiden Modi dieselben.

## Was drin ist

- **Heute** – Tagesplan, fortsetzbare Sitzung, Wiederholungen, neue Wörter,
  Sitzungsdauer (kurz / standard / intensiv), Tagesziel
- **Kurs** – 29 Einheiten mit je drei Abschnitten (Lernen · Hören und Sprechen ·
  Mini-Prüfung), Lernziel, Sterne, Fortschritt
- **Üben** – Wiederholen, Bilder, Hören, Schreiben, Satzbau, Aussprache
- **Entdecken** – Wörterbuch, Lesetexte, Tatoeba-Sätze, Schrift-Umwandlung
  (Latein ↔ arabische Schrift), Redewendungen & Kultur
- **Fortschritt** – Fertigkeiten (Erkennen, Abrufen, Schreiben, Hören),
  Wochenaktivität, Lernzeit, Export/Import, Anki-Export
- **Abenteuer** – sieben Welten mit gezeichneten Landschaften, Weltkarte mit Pfad,
  Tages- und Wochenaufgaben, Schatztruhe, Shop (nur Kosmetik), Auszeichnungen
- **Hêlo** – der eigene Adler als SVG-Maskottchen mit zwölf Varianten

Alles bleibt lokal: kein Konto, keine Cloud, kein Tracking. Die App ist PWA-fähig
und funktioniert offline.

## Lokal starten

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

Optional lässt sich der Datenbank-Server für das grosse Wörterbuch starten:

```bash
node server.js        # braucht red-kurd.db, Pfad über RED_KURD_DB
```

Ohne diesen Server nutzt die App die statischen JSON-Daten unter `public/daten`.

## Veröffentlichen

Repo auf GitHub pushen → auf vercel.com „New Project" → dieses Repo wählen →
Deploy. `vercel.json` enthält bereits die Weiterleitung für die App-Adressen
(`/today`, `/course/…`, `/adventure/…`).

## Aufbau

Siehe [ARCHITEKTUR.md](ARCHITEKTUR.md) – Lernlogik (`src/core`) und Oberfläche
(`src/modes`, `src/components`, `src/features`) sind getrennt.

## Barrierefreiheit

Sichtbarer Tastaturfokus, Touchflächen ab 44 × 44 px, WCAG-AA-Kontraste,
`lang="ku"` für Kurmancî, `dir="rtl"` für arabische Schrift, reduzierte
Animationen bei `prefers-reduced-motion`, Screenreader-taugliche
Fortschrittsbalken.

## Fahrplan

1. ✅ Zwei Modi, gemeinsame Lern-Engine, responsives Design
2. ⬜ Grosse Wörterbuch-Datenbank direkt anbinden (455.000+ Einträge)
3. ⬜ Mehr Lesetexte und Hörmaterial mit Muttersprachler-Aufnahmen
4. ⬜ Weitere kurdische Varianten (Soranî, Zazakî) und Englisch

## Datenquellen & Lizenzen

- Eigener Code: MIT-Lizenz
- Tatoeba-Sätze: CC BY 2.0 FR (Quellenangabe nötig)
- FreeDict-Wörterbücher: freie Lizenzen (GPL u.a.)
- Wiktionary-Daten (kaikki.org): CC BY-SA / GFDL
- Aussprache-Aufnahmen: Lingua Libre, CC BY-SA
