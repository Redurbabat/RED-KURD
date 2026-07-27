# RED-KURD Vollausbau – alle Funktionen aus allen 23 Repos

Ziel: Die beste offene Lernapp. Start Deutsch–Kurmancî, danach alle Sprachen.
Jede Funktion hier stammt aus einem der 23 Studien-Repos (Ordner "github lernen").
Reihenfolge = empfohlene Bau-Reihenfolge. Haken setzen, wenn fertig.

## Stufe 1 – Daten-Fundament
- [ ] **Supabase-Tabellen anlegen**: `woerter` (sprache1, wort1, sprache2, wort2, quelle),
      `saetze` (sprache, text, tatoeba_id), `satz_links` (satz1, satz2)
- [ ] **Tatoeba importieren** (aus sprachdaten/tatoeba): 12 Mio. Sätze + Links → Supabase
      (Quelle: Tatoeba, CC BY – Quellenangabe in die App-Fußzeile)
- [ ] **FreeDict importieren** (sprachdaten/freedict): deu-kur, kur-deu, kur-eng, kur-tur, ckb-kmr
- [ ] **Wiktionary/kaikki importieren** (sprachdaten/wiktionary): Kurmancî + Soranî JSONL
      (Bedeutungen, Aussprache/IPA, Wortarten, Beugungen)
- [ ] **Apertium-Wörterbuch nutzen** (github lernen/apertium-kmr, GPL – nur Daten extrahieren):
      zweisprachige Wortpaare kmr↔eng als zusätzliche Quelle
- [ ] **Kurdish-Tech-Daten**: erst per GitHub-Issue um Lizenz-Erlaubnis fragen!
      (455.000 Wörter + LLM-Dataset)

## Stufe 2 – Wörterbuch (Vorbilder: Kameran, kurdish-tech, KOReader)
- [ ] Wörterbuch-Seite an Supabase anschließen (Suche in beide Richtungen, alle Sprachen)
- [ ] Zu jedem Wort: Bedeutung, Wortart, Aussprache (aus kaikki), Beispielsätze (aus Tatoeba)
- [ ] **Beugungstabellen** anzeigen (Vorbild: unimorph-kmr – Verben/Nomen-Formen)
- [ ] **Kurdische Bildschirm-Tastatur** in Suchfeld (ê î û ş ç) – Vorbild: kurdisch-tastatur,
      als JavaScript-Buttons nachbauen

## Stufe 3 – Lernen wie Duolingo (Vorbild: LibreLingo, oppia)
- [ ] Kursbaum: Themen als Kreise (Begrüßung → Familie → Essen → …), Fortschritt sichtbar
- [ ] Übungstypen: Multiple Choice (fertig ✓), Wort eintippen, Satz aus Wortblöcken bauen,
      Hörverstehen (später), Übersetzen in beide Richtungen
- [ ] XP-Punkte, Tagesserie (Streak), Level – Motivation wie bei Duolingo
- [ ] **Eingabe-Korrektur**: Tippfehler erkennen mit KurdishHunspell-Wortliste
      (Hunspell-Dateien mit typo.js oder nspell im Browser nutzen)

## Stufe 4 – Karteikarten-System (Vorbild: Anki, AnkiDroid, vocabsieve)
- [ ] **Spaced Repetition** einbauen (SM-2-Algorithmus, gut dokumentiert, in JS nachbaubar):
      richtig beantwortet = Wort kommt später wieder, falsch = bald wieder
- [ ] Eigene Kartenstapel: Nutzer kann Wörter aus dem Wörterbuch zum Lernen markieren
- [ ] Lernstatistik: Kalender, gelernte Wörter, Erfolgsquote (Vorbild: Anki-Statistiken)

## Stufe 5 – Lesen & Texte (Vorbild: Lute, KOReader, vocabsieve)
- [ ] Lese-Modus: kurdische Texte anzeigen, jedes Wort anklickbar → Übersetzung erscheint
- [ ] Angeklickte Wörter automatisch als Karteikarten speichern (Vorbild: vocabsieve)
- [ ] Bekannt/Unbekannt-Markierung pro Wort (Vorbild: Lute – Farben für Lernstand)

## Stufe 6 – Sprachwerkzeuge (Vorbild: klpt, languagetool, Apertium)
- [ ] **Schrift-Umwandlung** Latein ↔ Arabisch (Kurmancî/Soranî) – Regeln aus klpt
      (wergor-Transliteration) in JavaScript übertragen
- [ ] Einfache Grammatik-Hinweise für Deutsch-Lerner: LanguageTool hat eine
      kostenlose öffentliche API für Deutsch – bei Übersetzungsübungen DE-Antworten prüfen
- [ ] Später: einfache Wort-für-Wort-Übersetzung mit Apertium-Daten

## Stufe 7 – Plattform-Funktionen (Vorbild: kolibri, oppia, tatoeba2)
- [ ] **Offline-Modus** (PWA): App funktioniert ohne Internet, Lektionen werden
      zwischengespeichert (Vorbild: kolibri – Lernen ohne Netz)
- [ ] Nutzerkonten (Supabase Auth): Fortschritt wird gespeichert, auf jedem Gerät
- [ ] Community-Beiträge: Nutzer können Sätze/Übersetzungen vorschlagen (Vorbild: tatoeba2),
      mit Prüfung vor Veröffentlichung
- [ ] Weitere Sprachpaare freischalten: Englisch, Türkisch, Soranî, Arabisch …
      (Tatoeba-Daten sind schon mehrsprachig!)

## Regeln
1. Eigener Code bleibt MIT. Kein Code aus GPL/AGPL-Repos kopieren – nur Ideen
   nachbauen und freie DATEN nutzen. Quellenangaben in die Fußzeile.
2. InterdialectCorpus (CC BY-NC) NICHT einbauen, solange unklar ist, ob die
   Seite je Geld verdienen soll.
3. Jede Stufe einzeln fertig bauen und testen, dann erst die nächste.
