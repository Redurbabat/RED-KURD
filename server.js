// RED-KURD Lokal-Server: verbindet die App mit der grossen Datenbank
// Start: node server.js   (braucht Node 22.5+, nutzt eingebautes SQLite)
//
// Alle Einstellungen kommen aus Umgebungsvariablen, damit nichts Persoenliches
// im Repo landet:
//   RED_KURD_DB       Pfad zur red-kurd.db (Standard: local-data/private/red-kurd.db)
//   RED_KURD_HOST     Netzwerkadresse (Standard: 127.0.0.1, also nur dieser Rechner)
//   RED_KURD_PORT     Port (Standard: 3001)
//   RED_KURD_ORIGINS  Erlaubte Browser-Urspruenge, mit Komma getrennt
import http from "node:http";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const PROJEKT_ORDNER = path.dirname(fileURLToPath(import.meta.url));

// Standardort ist repo-relativ: der Ordner fuer rein lokale Daten, der nicht in
// Git aufgenommen wird. Ein eigener Pfad geht ueber RED_KURD_DB.
const STANDARD_DB = path.join(PROJEKT_ORDNER, "local-data", "private", "red-kurd.db");
const DB_PFAD = path.resolve((process.env.RED_KURD_DB || "").trim() || STANDARD_DB);

// Standardmaessig lauscht der Server nur auf dem eigenen Rechner. Wer ihn
// bewusst im Heimnetz freigeben will, setzt RED_KURD_HOST (z. B. 0.0.0.0).
const HOST = (process.env.RED_KURD_HOST || "").trim() || "127.0.0.1";
const PORT = Number.parseInt(process.env.RED_KURD_PORT || "", 10) || 3001;

// Nur die lokalen Entwicklungs-Urspruenge duerfen den Server im Browser abfragen.
const STANDARD_URSPRUENGE = [
  "http://localhost:5173", "http://127.0.0.1:5173", // vite dev
  "http://localhost:4173", "http://127.0.0.1:4173", // vite preview
];
const ERLAUBTE_URSPRUENGE = new Set(
  ((process.env.RED_KURD_ORIGINS || "").trim()
    ? process.env.RED_KURD_ORIGINS.split(",")
    : STANDARD_URSPRUENGE
  ).map((o) => o.trim()).filter(Boolean)
);

// Diese Pfade ergeben ohne Suchbegriff keinen Sinn.
const BRAUCHT_SUCHBEGRIFF = new Set([
  "/api/suche", "/api/beispiele", "/api/aehnlich", "/api/formen",
]);

if (!existsSync(DB_PFAD)) {
  console.error("Datenbank nicht gefunden:", DB_PFAD);
  console.error("Lege die Datei red-kurd.db dort ab oder gib einen eigenen Pfad an:");
  console.error("  Windows:       set RED_KURD_DB=C:\\pfad\\zur\\red-kurd.db");
  console.error("  macOS/Linux:   RED_KURD_DB=/pfad/zur/red-kurd.db node server.js");
  process.exit(1);
}

let db;
try {
  db = new DatabaseSync(DB_PFAD);
} catch (e) {
  console.error("Datenbank konnte nicht geoeffnet werden:", DB_PFAD);
  console.error("Grund:", e.message);
  process.exit(1);
}

// Setzt die CORS-Kopfzeilen, aber nur fuer bekannte lokale Urspruenge.
function setzeCorsKopf(req, res) {
  const ursprung = req.headers.origin;
  if (ursprung && ERLAUBTE_URSPRUENGE.has(ursprung)) {
    res.setHeader("Access-Control-Allow-Origin", ursprung);
  }
  // Die Antwort haengt vom Ursprung ab -> Zwischenspeicher muss das wissen.
  res.setHeader("Vary", "Origin");
}

// Antwortet als JSON. Der Statuscode gehoert zur Antwort dazu:
// 200 = alles gut, 400 = Anfrage unvollstaendig, 404 = Pfad unbekannt,
// 405 = Methode nicht erlaubt, 500 = Fehler im Server.
function json(res, daten, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(daten));
}

// Zahl aus der Adresse lesen; unsinnige Angaben fallen auf den Standard zurueck.
function zahl(wert, standard, hoechstens) {
  const n = Number.parseInt(wert || "", 10);
  if (!Number.isInteger(n) || n < 1) return standard;
  return Math.min(n, hoechstens);
}

const server = http.createServer((req, res) => {
  setzeCorsKopf(req, res);

  // Vorabfrage des Browsers (CORS-Preflight)
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
    });
    return res.end();
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(res, { fehler: "Nur GET wird unterstuetzt." }, 405);
  }

  let url;
  try {
    url = new URL(req.url, "http://localhost");
  } catch {
    return json(res, { fehler: "Ungueltige Adresse." }, 400);
  }
  const q = (url.searchParams.get("q") || "").trim();

  if (BRAUCHT_SUCHBEGRIFF.has(url.pathname) && !q) {
    return json(res, { fehler: "Parameter q fehlt." }, 400);
  }

  try {
    if (url.pathname === "/api/suche") {
      const woerter = db.prepare(
        `SELECT lang, wort, ziel_lang, uebersetzung, quelle FROM woerter
         WHERE wort LIKE ? OR uebersetzung LIKE ? LIMIT 60`
      ).all(q + "%", q + "%");
      const wiki = db.prepare(
        `SELECT lang, wort, wortart, ipa, bedeutungen, formen FROM wiki_eintraege
         WHERE wort LIKE ? LIMIT 15`
      ).all(q + "%");
      const formen = db.prepare(
        `SELECT lang, lemma, form, merkmale FROM formen
         WHERE form LIKE ? OR lemma LIKE ? LIMIT 25`
      ).all(q + "%", q + "%");
      let kt = [];
      try {
        kt = db.prepare(
          `SELECT lang, wort, wortart, bedeutungen FROM kurdish_tech
           WHERE wort LIKE ? LIMIT 20`
        ).all(q + "%").map(e => ({ lang: e.lang, wort: e.wort, wortart: e.wortart,
          ipa: "", bedeutungen: e.bedeutungen, formen: "", quelle: "kurdish-tech" }));
      } catch {}
      return json(res, { woerter, wiki: wiki.concat(kt), formen });
    }

    if (url.pathname === "/api/beispiele") {
      const lang = url.searchParams.get("lang") || "kmr";
      const ziel = url.searchParams.get("ziel") || "deu";
      const saetze = db.prepare(
        `SELECT s.text AS satz, t.text AS uebersetzung
         FROM saetze s
         JOIN satz_links l ON l.satz_id = s.id
         JOIN saetze t ON t.id = l.uebersetzung_id
         WHERE s.lang = ? AND t.lang = ? AND s.text LIKE ?
         LIMIT 15`
      ).all(lang, ziel, "%" + q + "%");
      return json(res, { saetze });
    }

    if (url.pathname === "/api/vokabeln") {
      const von = url.searchParams.get("von") || "deu";
      const nach = url.searchParams.get("nach") || "kur";
      const anzahl = zahl(url.searchParams.get("anzahl"), 20, 100);
      const vokabeln = db.prepare(
        `SELECT wort, uebersetzung FROM woerter
         WHERE lang = ? AND ziel_lang = ? AND length(wort) < 30
         ORDER BY RANDOM() LIMIT ?`
      ).all(von, nach, anzahl);
      return json(res, { vokabeln });
    }

    if (url.pathname === "/api/aehnlich") {
      // Rechtschreibhilfe auf Basis der Hunspell-Wortlisten
      const kandidaten = db.prepare(
        `SELECT DISTINCT wort FROM wortlisten
         WHERE wort LIKE ? AND length(wort) BETWEEN ? AND ? LIMIT 3000`
      ).all(q[0] + "%", q.length - 1, q.length + 1);
      const dist = (a, b) => {
        if (Math.abs(a.length - b.length) > 1) return 9;
        const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) m[0][j] = j;
        for (let i = 1; i <= a.length; i++)
          for (let j = 1; j <= b.length; j++)
            m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1,
              m[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
        return m[a.length][b.length];
      };
      const s = q.toLowerCase();
      const vorschlaege = kandidaten
        .map(k => ({ wort: k.wort, d: dist(s, k.wort.toLowerCase()) }))
        .filter(k => k.d <= 1 && k.wort.toLowerCase() !== s)
        .slice(0, 6).map(k => k.wort);
      return json(res, { vorschlaege });
    }

    if (url.pathname === "/api/formen") {
      const formen = db.prepare(
        `SELECT form, merkmale FROM formen WHERE lemma = ? ORDER BY merkmale LIMIT 60`
      ).all(q);
      return json(res, { formen });
    }

    if (url.pathname === "/api/satzpaare") {
      const anzahl = zahl(url.searchParams.get("anzahl"), 15, 50);
      let paare = db.prepare(
        `SELECT s.text AS satz, t.text AS uebersetzung
         FROM saetze s JOIN satz_links l ON l.satz_id = s.id
         JOIN saetze t ON t.id = l.uebersetzung_id
         WHERE s.lang = 'kmr' AND t.lang = 'deu' AND length(s.text) < 90
         ORDER BY RANDOM() LIMIT ?`).all(anzahl);
      if (paare.length < anzahl) {
        const mehr = db.prepare(
          `SELECT s.text AS satz, t.text AS uebersetzung
           FROM saetze s JOIN satz_links l ON l.satz_id = s.id
           JOIN saetze t ON t.id = l.uebersetzung_id
           WHERE s.lang = 'kmr' AND t.lang = 'eng' AND length(s.text) < 90
           ORDER BY RANDOM() LIMIT ?`).all(anzahl - paare.length);
        paare = paare.concat(mehr);
      }
      return json(res, { paare });
    }

    if (url.pathname === "/api/status") {
      // Nur unverfaengliche Angaben: der lokale Datenbankpfad bleibt im Server.
      const s = db.prepare("SELECT COUNT(*) AS n FROM saetze").get();
      const w = db.prepare("SELECT COUNT(*) AS n FROM woerter").get();
      let formen = 0, wortlisten = 0;
      try {
        formen = db.prepare("SELECT COUNT(*) AS n FROM formen").get().n;
        wortlisten = db.prepare("SELECT COUNT(*) AS n FROM wortlisten").get().n;
      } catch {}
      return json(res, { datenbank: "erreichbar", saetze: s.n, woerter: w.n, formen, wortlisten });
    }

    return json(res, {
      fehler: "Unbekannter Pfad. Nutze /api/suche, /api/beispiele, /api/vokabeln, /api/status",
    }, 404);
  } catch (e) {
    // Einzelheiten bleiben im Server-Log, der Client bekommt nur einen Hinweis.
    console.error("Serverfehler bei", req.url, "-", e);
    if (res.headersSent) return res.end();
    return json(res, { fehler: "Serverfehler." }, 500);
  }
});

server.on("error", (e) => {
  console.error("Server konnte nicht starten:", e.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const anzeige = HOST === "0.0.0.0" || HOST === "::" ? "localhost" : HOST;
  console.log(`RED-KURD Server laeuft: http://${anzeige}:${PORT}/api/status`);
  console.log(`Datenbank: ${DB_PFAD}`);
  if (!["127.0.0.1", "localhost", "::1"].includes(HOST)) {
    console.warn(`Achtung: Server ist ueber das Netzwerk erreichbar (RED_KURD_HOST=${HOST}).`);
  }
});
