# -*- coding: utf-8 -*-
"""Holt echte Muttersprachler-Aufnahmen (Lingua Libre/Wikimedia, CC BY-SA):
1. Audio-Links aus dem Wiktionary-Datenpaket (kaikki)
2. Lingua-Libre-Kategorien auf Wikimedia Commons
Speichert MP3/WAV nach public/audio/kmr/ + index.json"""
import json, os, re, sys, time, urllib.request, urllib.parse
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASIS = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(BASIS, "public", "audio", "kmr")
os.makedirs(ZIEL, exist_ok=True)
KAIKKI = os.path.join(BASIS, "..", "github lernen", "sprachdaten", "wiktionary", "kurmanci-woerterbuch.jsonl")

def log(m): print(m, flush=True)

# Kurswoerter aus kurse.js ziehen (fuer Priorisierung)
kursdatei = open(os.path.join(BASIS, "src", "data", "kurse.js"), encoding="utf-8").read()
kurswoerter = set(w.lower() for w in re.findall(r"ku: '([^']+)'", kursdatei))
log(f"{len(kurswoerter)} Kurswoerter")

index = {}

def lade(url, wort):
    if wort in index: return
    ext = ".mp3" if ".mp3" in url.lower() else ".wav" if ".wav" in url.lower() else ".ogg"
    sicher = re.sub(r"[^a-zA-Z0-9êîûşç_-]", "_", wort)
    datei = sicher + ext
    pfad = os.path.join(ZIEL, datei)
    if not os.path.exists(pfad):
        for versuch in range(3):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "RED-KURD-Lernapp/1.0 (github.com/Redurbabat/RED-KURD; babatredur.ch@gmail.com)"})
                with urllib.request.urlopen(req, timeout=30) as r, open(pfad, "wb") as f:
                    f.write(r.read())
                time.sleep(1.5)
                break
            except Exception as e:
                if "429" in str(e) and versuch < 2:
                    log(f"  warte 30s (Ratenbremse) bei {wort}..."); time.sleep(30); continue
                log(f"  FEHLER {wort}: {e}"); time.sleep(3); return
    index[wort] = datei

# 1. Aus kaikki
log("1/2 Wiktionary-Audios...")
for zeile in open(KAIKKI, encoding="utf-8"):
    try: e = json.loads(zeile)
    except: continue
    wort = (e.get("word") or "").lower()
    if not wort: continue
    for s in e.get("sounds", []):
        url = s.get("mp3_url") or s.get("ogg_url")
        if url:
            lade(url, wort)
            break
log(f"  {len(index)} Audios aus Wiktionary")

# 2. Lingua-Libre-Kategorien auf Commons (alle kurdischen Aufnahmen)
log("2/2 Lingua Libre auf Wikimedia Commons...")
API = "https://commons.wikimedia.org/w/api.php"
gefunden = {}
for kategorie in ["Lingua Libre pronunciation-kur", "Lingua Libre pronunciation-kmr"]:
    fortsetzung = ""
    seiten = 0
    while seiten < 40:
        seiten += 1
        params = {
            "action": "query", "format": "json",
            "generator": "categorymembers",
            "gcmtitle": "Category:" + kategorie,
            "gcmtype": "file", "gcmlimit": "500",
            "prop": "imageinfo", "iiprop": "url",
        }
        if fortsetzung: params["gcmcontinue"] = fortsetzung
        url = API + "?" + urllib.parse.urlencode(params)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "RED-KURD-Lernapp/1.0 (github.com/Redurbabat/RED-KURD)"})
            daten = json.load(urllib.request.urlopen(req, timeout=30))
        except Exception as e:
            log(f"  API-FEHLER: {e}"); break
        for seite in daten.get("query", {}).get("pages", {}).values():
            titel = seite.get("title", "")
            m = re.search(r"-([^-]+)\.(wav|ogg|mp3)$", titel)
            if not m: continue
            wort = m.group(1).strip().lower()
            if wort in gefunden or " " in wort or len(wort) > 25: continue
            info = seite.get("imageinfo", [])
            if info and info[0].get("url"):
                gefunden[wort] = info[0]["url"]
        time.sleep(1)
        fortsetzung = daten.get("continue", {}).get("gcmcontinue", "")
        if not fortsetzung: break
    log(f"  Kategorie '{kategorie}' gelesen — {len(gefunden)} Kandidaten gesamt")

# Kurswoerter zuerst, dann weitere bis zur Obergrenze
erste = [(w, u) for w, u in gefunden.items() if w in kurswoerter]
rest = [(w, u) for w, u in gefunden.items() if w not in kurswoerter]
log(f"  {len(erste)} Kurswort-Audios, {len(rest)} weitere")
for w, u in erste:
    lade(u, w)
for w, u in rest:
    if len(index) >= 350: break
    lade(u, w)

# Index mit vorhandenem Stand und Dateien auf der Platte zusammenfuehren
indexpfad = os.path.join(BASIS, "public", "audio", "index.json")
gesamt = {}
try: gesamt = json.load(open(indexpfad, encoding="utf-8"))
except: pass
gesamt.update(index)
for datei in os.listdir(ZIEL):
    stem = datei.rsplit(".", 1)[0]
    gesamt.setdefault(stem, datei)
json.dump(gesamt, open(indexpfad, "w", encoding="utf-8"), ensure_ascii=False)
log(f"FERTIG: {len(gesamt)} echte Aufnahmen in public/audio/")
