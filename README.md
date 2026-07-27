# RED-KURD – Kurdisch lernen

Kurdisch (Kurmancî) lernen – frei und offen. Start: **Deutsch–Kurmancî**,
später alle Sprachen mit Millionen Wörtern und Sätzen.

Schwester-Projekt von [BABAT-RED](https://github.com/Redurbabat/BABAT-RED).

## Was schon funktioniert

- **Wörterbuch** – Grundwortschatz Deutsch ↔ Kurmancî durchsuchen
- **Lektion 1** – Quiz mit 10 Fragen (4 Antwortmöglichkeiten)

## Lokal starten

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

## Veröffentlichen (Vercel)

Repo auf GitHub pushen → auf vercel.com "New Project" → dieses Repo wählen →
Deploy. Fertig.

## Fahrplan

1. ✅ Grundgerüst (diese Version)
2. ⬜ Supabase-Datenbank: alle Wörter & Sätze (Tatoeba, FreeDict,
   Wiktionary/kaikki, Kurdish-Tech) importieren
3. ⬜ Wörterbuch an die Datenbank anschließen (455.000+ Einträge)
4. ⬜ Beispielsätze zu jedem Wort (Tatoeba, CC BY)
5. ⬜ Mehr Lektionen + Wiederholungssystem (Spaced Repetition)
6. ⬜ Weitere Sprachen (Englisch, Türkisch, Soranî, …)

## Datenquellen & Lizenzen

- Eigener Code: MIT-Lizenz
- Tatoeba-Sätze: CC BY 2.0 FR (Quellenangabe nötig)
- FreeDict-Wörterbücher: freie Lizenzen (GPL u.a.)
- Wiktionary-Daten (kaikki.org): CC BY-SA / GFDL
