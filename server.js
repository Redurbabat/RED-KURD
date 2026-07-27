// RED-KURD Lokal-Server: verbindet die App mit der grossen Datenbank
// Start: node server.js   (braucht Node 22.5+, nutzt eingebautes SQLite)
import http from "node:http";
import { DatabaseSync } from "node:sqlite";

const DB_PFAD = process.env.RED_KURD_DB ||
  "C:\\Users\\redur\\Desktop\\github lernen\\datenbank\\red-kurd.db";
const PORT = 3001;

let db;
try {
  db = new DatabaseSync(DB_PFAD);
} catch (e) {
  console.error("Datenbank nicht gefunden:", DB_PFAD);
  console.error("Pfad anpassen mit: set RED_KURD_DB=C:\\pfad\\zur\\red-kurd.db");
  process.exit(1);
}

function json(res, daten) {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(daten));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const q = (url.searchParams.get("q") || "").trim();

  try {
    if (url.pathname === "/api/suche" && q) {
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

    if (url.pathname === "/api/beispiele" && q) {
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
      const anzahl = Math.min(parseInt(url.searchParams.get("anzahl") || "20"), 100);
      const vokabeln = db.prepare(
        `SELECT wort, uebersetzung FROM woerter
         WHERE lang = ? AND ziel_lang = ? AND length(wort) < 30
         ORDER BY RANDOM() LIMIT ?`
      ).all(von, nach, anzahl);
      return json(res, { vokabeln });
    }

    if (url.pathname === "/api/aehnlich" && q) {
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

    if (url.pathname === "/api/formen" && q) {
      const formen = db.prepare(
        `SELECT form, merkmale FROM formen WHERE lemma = ? ORDER BY merkmale LIMIT 60`
      ).all(q);
      return json(res, { formen });
    }

    if (url.pathname === "/api/satzpaare") {
      const anzahl = Math.min(parseInt(url.searchParams.get("anzahl") || "15"), 50);
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
      const s = db.prepare("SELECT COUNT(*) AS n FROM saetze").get();
      const w = db.prepare("SELECT COUNT(*) AS n FROM woerter").get();
      let formen = 0, wortlisten = 0;
      try {
        formen = db.prepare("SELECT COUNT(*) AS n FROM formen").get().n;
        wortlisten = db.prepare("SELECT COUNT(*) AS n FROM wortlisten").get().n;
      } catch {}
      return json(res, { saetze: s.n, woerter: w.n, formen, wortlisten, db: DB_PFAD });
    }

    json(res, { fehler: "Unbekannter Pfad. Nutze /api/suche, /api/beispiele, /api/vokabeln, /api/status" });
  } catch (e) {
    json(res, { fehler: String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`RED-KURD Server laeuft: http://localhost:${PORT}/api/status`);
  console.log(`Datenbank: ${DB_PFAD}`);
});
