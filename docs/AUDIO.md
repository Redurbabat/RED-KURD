# Audio — Aufbau, Prioritäten, offene Punkte

## Prioritätskette (umgesetzt in `src/core/audio/audioService.js`)

1. **Eigene Aufnahme** der Lernenden (IndexedDB `red-kurd-audio`, nur lokal,
   kein Upload).
2. **Echte Muttersprachler-Aufnahme** (Lingua Libre, CC BY-SA) über das
   Manifest `public/audio/index.json` → `public/audio/kmr/…`.
3. **Computerstimme** (`speechSynthesis`) als Fallback.

Seit August 2026: `play()`-Fehler werden abgefangen (iOS kann Wiedergabe
ohne Nutzergeste blockieren) und fallen auf die Computerstimme zurück; ein
gescheiterter Abruf des Audio-Index wird nicht mehr dauerhaft gemerkt.

## Stand der Abdeckung

- 325 echte Aufnahmen, davon ~240 der 603 eindeutigen Kurswörter.
- **0 von 182 Phrasen** haben echte Aufnahmen (z. B. „Tu çawa yî?“);
  auch Kernwörter wie „çay“ fehlen noch.
- iOS hat **keine kurdische Systemstimme**: alles ohne echte Aufnahme wird
  dort von einer falschsprachigen Stimme gelesen. Priorität beim Ausbau:
  Phrasen und Kernwörter zuerst.

## Offene Punkte (priorisiert)

1. **Lizenz-Nachweis je Aufnahme (rechtlich nötig):** CC BY-SA verlangt
   Namensnennung. `audio-holen.py` sollte Urheber/Lizenz/Quelle je Datei
   von der Commons-API mitnehmen (`audio-lizenzen.json`) und die App eine
   Quellen-Ansicht zeigen — bei den Fotos ist genau das bereits vorbildlich
   gelöst (`wortFotos.js` speichert Urheber + Lizenz).

   **Konkretes Rezept** (braucht Netzzugang zu commons.wikimedia.org —
   aus der Cloud-Umgebung derzeit nicht erreichbar, lokal ausführen):
   1. Wie in `audio-holen.py` Schritt 2 die Kategorien
      `Lingua Libre pronunciation-kur`/`-kmr` per `generator=categorymembers`
      listen — der Dateititel `LL-Q36163 (kur)-<Sprecher>-<wort>.wav`
      enthält Sprecher und Wort; das sind nur wenige API-Seiten.
   2. Für die Titel gebündelt (50 je Anfrage)
      `prop=imageinfo&iiprop=extmetadata` abrufen: `Artist`,
      `LicenseShortName`, `LicenseUrl`.
   3. Als `public/audio/lizenzen.json` speichern
      (`wort → { sprecher, lizenz, quelleUrl }`) und in der App neben den
      Fotoquellen anzeigen. Der Integritätstest (`test/audioIndex.test.js`)
      kann dann zusätzlich prüfen, dass jede Aufnahme einen Nachweis hat.
2. **Index bereinigen:** `index.json` enthält Müll-Schlüssel
   (`.find`, `_gulan` u. a.) durch die Dateinamen-Sanitisierung in
   `audio-holen.py`; verschiedene Wörter können auf denselben Dateinamen
   kollidieren. Dazu gehört ein Integritätstest: jeder Eintrag zeigt auf
   eine existierende Datei, keine Kollisionen.
3. **Hörübungen ehrlich stellen:** `hatEchteStimme()` existiert, wird vom
   ExercisePlayer aber nicht genutzt — Hörübungen sollten bevorzugt Wörter
   mit echter Aufnahme (oder verfügbarer Stimme) stellen.
4. **`voiceschanged` abwarten:** `speechSynthesis.getVoices()` ist auf iOS
   beim ersten Aufruf oft leer — Listener ergänzen, sonst spricht die
   erste Wiedergabe mit der Standardstimme.
5. **Offline-Audio-Paket:** Aufnahmen der aktuellen Einheit gezielt in den
   Cache laden (Einstellungen → Offline-Daten), statt auf den
   Service-Worker-Zufall zu vertrauen.

## Manifest-Zielformat

```json
{
  "id": "audio_silav",
  "wordId": "Silav",
  "language": "ku",
  "speaker": "…",
  "license": "CC BY-SA 4.0",
  "source": "Lingua Libre",
  "url": "/audio/kmr/silav.mp3",
  "duration": 1.2
}
```

Der heutige Index (`wort → datei`) bleibt aus Kompatibilität bestehen;
Lizenzdaten kommen als eigene Datei dazu, bis das Manifest umgestellt ist.

## Regeln

- Keine Audiodaten ins App-Bundle; alles über `public/audio/` bzw. R2.
- Eigene Aufnahmen verlassen das Gerät nie (kein Upload, nicht im Export).
- Mikrofon nur nach ausdrücklicher Zustimmung; Fehler nach `error.name`
  unterscheiden (kein Mikro ≠ keine Erlaubnis).
