# RED-KURD – kostenlos und lokal Kurdisch lernen

Kurmancî lernen – frei und offen. Start: **Deutsch–Kurmancî**, später weitere
Sprachen. Schwester-Projekt von [BABAT-RED](https://github.com/Redurbabat/BABAT-RED).

RED-KURD ist vollständig kostenlos: kein Abo, keine Werbung, kein Echtgeld-Shop
und keine kostenpflichtige API. Lernstand, Einstellungen, Aufnahmen und
Gamification-Daten bleiben im Browser auf dem eigenen Gerät. Eine vollständige
Sicherung ist jederzeit über Export/Import möglich.

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

Persönliche Daten bleiben lokal: kein Konto, kein Tracking. Öffentliche
Kursdateien können aus Cloudflare R2 geladen und für den Offline-Betrieb im
Browser zwischengespeichert werden.

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

Ohne diesen Server nutzt die App die öffentlichen JSON-Daten unter `/daten`.

## Speicheraufteilung

- **Im Browser:** Profil, Lernstand, Serie, Einstellungen und Aufnahmen.
- **Cloudflare:** die Web-App sowie öffentliche Kurs-, Wörterbuch- und
  Audiodateien. Der lokale Upload ist auf 3 GiB insgesamt und 95 MiB je Datei
  begrenzt.
- **Nur lokal:** große Rohdatenbanken, Sicherungen und private Quelldateien
  unter `local-data/private`.

Öffentliche Daten werden lokal unter `local-data/cloudflare` vorbereitet,
mit `npm run data:check` geprüft und mit `npm run data:upload` nach R2
übertragen. Kurzzeitige Netzwerkfehler werden automatisch erneut versucht.
Der Ordner selbst wird nicht in Git aufgenommen.

## Veröffentlichen

Die öffentliche Version läuft als Cloudflare Worker mit statischen Assets und
einem R2-Bucket für Kursdaten. Tiefenlinks wie `/today`, `/course/…` und
`/adventure/…` werden vom Worker an die App weitergegeben.

Nach `npm run build` können die kleinen App-Dateien mit `npm run app:upload`
in denselben R2-Bucket geladen werden. Dabei werden Servercode, Kursdaten und
Hosting-Metadaten automatisch ausgelassen.

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
