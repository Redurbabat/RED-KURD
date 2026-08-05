// Mitmach-Aufgaben „Code lernen": direkt in der App bauen, mit
// Live-Vorschau und automatischer Pruefung.
//
// Jede Aufgabe: startCode (womit man beginnt), checks (die Pruefliste,
// jede mit einer pruefe-Funktion) und musterloesung (besteht ALLE Checks —
// das sichern die Tests ab).

export const codePraxisAufgaben = [
  {
    id: 'praxis-erste-seite',
    art: 'html',
    title: 'Deine erste Webseite',
    topic: 'HTML',
    estimatedMinutes: 10,
    description: 'Überschrift und Absatz — mehr braucht eine erste Seite nicht.',
    auftrag:
      'Baue eine Mini-Seite: eine große Überschrift (h1) mit einem Titel deiner Wahl und darunter ein Absatz (p) mit einem Satz über dich. Die Vorschau zeigt sofort, was du schreibst.',
    startCode: '<!-- Schreibe hier deinen Code -->\n',
    tipp: 'Elemente haben Anfang und Ende: <h1>Titel</h1>',
    checks: [
      { id: 'h1', text: 'Es gibt eine Überschrift <h1>…</h1>', pruefe: (c) => /<h1[\s>][\s\S]*<\/h1>/i.test(c) },
      { id: 'p', text: 'Es gibt einen Absatz <p>…</p>', pruefe: (c) => /<p[\s>][\s\S]*<\/p>/i.test(c) },
      { id: 'inhalt', text: 'Die Überschrift ist nicht leer', pruefe: (c) => /<h1[^>]*>\s*[^<\s][\s\S]*?<\/h1>/i.test(c) },
    ],
    musterloesung: '<h1>Silav, ich bin Redur</h1>\n<p>Ich lerne Code mit RED-KURD.</p>',
  },
  {
    id: 'praxis-button',
    art: 'html',
    title: 'Einen Button erstellen',
    topic: 'HTML',
    estimatedMinutes: 10,
    description: 'Ein echter Button mit Beschriftung — die Grundlage jeder App.',
    auftrag:
      'Erstelle einen Button mit type="button" und einer klaren deutschen Beschriftung (z. B. „Speichern“). Schreibe außerdem eine kurze Überschrift darüber.',
    startCode: '<h1>Meine Knöpfe</h1>\n<!-- Hier fehlt noch ein Button -->\n',
    tipp: '<button type="button">Beschriftung</button>',
    checks: [
      { id: 'button', text: 'Es gibt ein <button>-Element', pruefe: (c) => /<button[\s>]/i.test(c) },
      { id: 'type', text: 'Der Button hat type="button"', pruefe: (c) => /<button[^>]*type\s*=\s*["']button["']/i.test(c) },
      { id: 'text', text: 'Der Button hat eine Beschriftung', pruefe: (c) => /<button[^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(c) },
    ],
    musterloesung: '<h1>Meine Knöpfe</h1>\n<button type="button">Speichern</button>',
  },
  {
    id: 'praxis-farben',
    art: 'html',
    title: 'Farben ändern',
    topic: 'CSS',
    estimatedMinutes: 12,
    description: 'Mit CSS bekommen Text und Fläche deine Farben.',
    auftrag:
      'Gib der Überschrift mit CSS eine Farbe (color) und der Seite eine Hintergrundfarbe (background). Nutze den <style>-Block und probiere Werte wie #0ea5a8 oder tomato — die Vorschau zeigt jede Änderung sofort.',
    startCode: '<style>\n  /* Hier kommt dein CSS hin */\n</style>\n\n<h1>Farben!</h1>\n<p>Diese Seite bekommt gleich Farbe.</p>\n',
    tipp: 'h1 { color: #0ea5a8; }  und  body { background: #f7fafc; }',
    checks: [
      { id: 'style', text: 'Es gibt einen <style>-Block', pruefe: (c) => /<style[\s>][\s\S]*<\/style>/i.test(c) },
      { id: 'color', text: 'Irgendwo wird color: gesetzt', pruefe: (c) => /color\s*:/i.test(c) },
      { id: 'background', text: 'Irgendwo wird background gesetzt', pruefe: (c) => /background[^:]*:/i.test(c) },
    ],
    musterloesung: '<style>\n  body { background: #f7fafc; }\n  h1 { color: #0ea5a8; }\n</style>\n<h1>Farben!</h1>\n<p>Jetzt mit Farbe.</p>',
  },
  {
    id: 'praxis-schoener-button',
    art: 'html',
    title: 'Einen Button schön machen',
    topic: 'CSS',
    estimatedMinutes: 15,
    description: 'Runde Ecken, Farbe, genug Fläche für den Daumen.',
    auftrag:
      'Gestalte den Button mit CSS: eine Hintergrundfarbe, weiße Schrift, runde Ecken (border-radius) und mindestens 44 Pixel Höhe (min-height) — die Regel für gute Touch-Buttons.',
    startCode: '<style>\n  button {\n    /* Hier gestaltest du den Button */\n  }\n</style>\n\n<button type="button">Merken</button>\n',
    tipp: 'background, color: white, border-radius: 12px, min-height: 44px',
    checks: [
      { id: 'radius', text: 'Der Button hat runde Ecken (border-radius)', pruefe: (c) => /border-radius\s*:/i.test(c) },
      { id: 'hoehe', text: 'Mindesthöhe 44px ist gesetzt (min-height)', pruefe: (c) => /min-height\s*:\s*4[4-9]|min-height\s*:\s*[5-9]\d/i.test(c) },
      { id: 'farbe', text: 'Der Button hat eine Hintergrundfarbe', pruefe: (c) => /background[^:]*:/i.test(c) },
    ],
    musterloesung: '<style>\n  button {\n    background: #ef5350;\n    color: white;\n    border-radius: 12px;\n    min-height: 44px;\n    padding: 0 20px;\n  }\n</style>\n<button type="button">Merken</button>',
  },
  {
    id: 'praxis-karte',
    art: 'html',
    title: 'Eine Karte bauen',
    topic: 'HTML & CSS',
    estimatedMinutes: 18,
    description: 'Das Grundmuster moderner Apps: die Karte.',
    auftrag:
      'Baue eine Karte mit einer eigenen CSS-Klasse (class="karte"): Überschrift, ein Satz Text und ein Button. Die Klasse bekommt in CSS einen Rand (border), Innenabstand (padding) und runde Ecken.',
    startCode: '<style>\n  .karte {\n    /* Rand, Innenabstand, runde Ecken */\n  }\n</style>\n\n<!-- Baue hier die Karte mit class="karte" -->\n',
    tipp: 'border: 2px solid #ddd; padding: 16px; border-radius: 12px;',
    checks: [
      { id: 'klasse', text: 'Ein Element nutzt class="karte"', pruefe: (c) => /class\s*=\s*["']karte["']/i.test(c) },
      { id: 'padding', text: 'Die Karte hat Innenabstand (padding)', pruefe: (c) => /padding\s*:/i.test(c) },
      { id: 'border', text: 'Die Karte hat einen Rand (border)', pruefe: (c) => /border\s*:/i.test(c) },
      { id: 'button', text: 'In der Karte steckt ein Button', pruefe: (c) => /<button[\s>]/i.test(c) },
    ],
    musterloesung: '<style>\n  .karte {\n    border: 2px solid #ddd;\n    padding: 16px;\n    border-radius: 12px;\n  }\n</style>\n<div class="karte">\n  <h2>Mein Film</h2>\n  <p>★ 8,5 — großartig.</p>\n  <button type="button">Merken</button>\n</div>',
  },
  {
    id: 'praxis-aufteilen',
    art: 'html',
    title: 'Eine Webseite aufteilen',
    topic: 'HTML',
    estimatedMinutes: 15,
    description: 'Kopf, Inhalt, Fuß — wie echte Seiten aufgebaut sind.',
    auftrag:
      'Teile die Seite in drei Bereiche: <header> mit dem Seitentitel, <main> mit einem Absatz Inhalt und <footer> mit deinem Namen. Genau ein <main> — wie bei richtigen Webseiten.',
    startCode: '<!-- header, main und footer -->\n',
    tipp: '<header>…</header> <main>…</main> <footer>…</footer>',
    checks: [
      { id: 'header', text: 'Es gibt einen <header>', pruefe: (c) => /<header[\s>]/i.test(c) },
      { id: 'main', text: 'Es gibt genau ein <main>', pruefe: (c) => (c.match(/<main[\s>]/gi) || []).length === 1 },
      { id: 'footer', text: 'Es gibt einen <footer>', pruefe: (c) => /<footer[\s>]/i.test(c) },
    ],
    musterloesung: '<header>\n  <h1>Meine Seite</h1>\n</header>\n<main>\n  <p>Hier steht der Inhalt.</p>\n</main>\n<footer>Von Redur</footer>',
  },
  {
    id: 'praxis-liste',
    art: 'html',
    title: 'Eine Liste bauen',
    topic: 'HTML',
    estimatedMinutes: 8,
    description: 'Drei Einträge mit Punkten davor — wie in jeder echten App.',
    auftrag:
      'Baue eine ungeordnete Liste (ul) mit mindestens drei Einträgen (li) — zum Beispiel Sprachen, die du sprichst oder lernst. Die Vorschau zeigt die Punkte sofort.',
    startCode: '<h2>Meine Sprachen</h2>\n<!-- Hier fehlt die Liste -->\n',
    tipp: '<ul>\n  <li>Erster Eintrag</li>\n</ul> — auf der <>-Ebene der Code-Tastatur liegen ul und li als Bausteine bereit.',
    checks: [
      { id: 'ul', text: 'Es gibt eine Liste <ul>…</ul>', pruefe: (c) => /<ul[\s>][\s\S]*<\/ul>/i.test(c) },
      { id: 'drei', text: 'Mindestens drei Einträge <li>', pruefe: (c) => (c.match(/<li[\s>]/gi) || []).length >= 3 },
      { id: 'inhalt', text: 'Die Einträge sind nicht leer', pruefe: (c) => /<li[^>]*>\s*[^<\s][\s\S]*?<\/li>/i.test(c) },
    ],
    musterloesung: '<h2>Meine Sprachen</h2>\n<ul>\n  <li>Kurmancî</li>\n  <li>Deutsch</li>\n  <li>Englisch</li>\n</ul>',
  },
  {
    id: 'praxis-link',
    art: 'html',
    title: 'Einen Link erstellen',
    topic: 'HTML',
    estimatedMinutes: 8,
    description: 'Ein Link mit Ziel und klarem Text — das a-Element.',
    auftrag:
      'Erstelle einen Link (a) auf eine Seite deiner Wahl: href bekommt eine vollständige Adresse mit https://, und der Linktext sagt klar, wohin es geht. (In der Vorschau ist Klicken aus Sicherheitsgründen aus — der Link wird trotzdem geprüft.)',
    startCode: '<h1>Gute Seiten</h1>\n<!-- Hier fehlt der Link -->\n',
    tipp: '<a href="https://…">Klarer Linktext</a> — „hier klicken" ist ein schlechter Linktext.',
    checks: [
      { id: 'a', text: 'Es gibt einen Link <a>…</a>', pruefe: (c) => /<a[\s>][\s\S]*<\/a>/i.test(c) },
      { id: 'https', text: 'href beginnt mit https://', pruefe: (c) => /<a[^>]*href\s*=\s*["']https:\/\//i.test(c) },
      { id: 'text', text: 'Der Link hat einen Text', pruefe: (c) => /<a[^>]*>\s*[^<\s][\s\S]*?<\/a>/i.test(c) },
    ],
    musterloesung: '<h1>Gute Seiten</h1>\n<a href="https://de.wikipedia.org">Wikipedia auf Deutsch</a>',
  },
  {
    id: 'praxis-bild',
    art: 'html',
    title: 'Ein Bild mit Alt-Text',
    topic: 'HTML',
    estimatedMinutes: 8,
    description: 'img mit src und beschreibendem alt — Pflicht auf jeder guten Seite.',
    auftrag:
      'Baue ein Bild ein: img mit einem src (z. B. /bilder/foto.jpg) und einem beschreibenden alt-Text. In der Vorschau siehst du den Alt-Text — genau das sehen Menschen, wenn ein Bild nicht lädt. Dein alt-Text ist also selbst das Ergebnis!',
    startCode: '<h2>Mein Foto</h2>\n<!-- Hier fehlt das Bild -->\n',
    tipp: '<img src="/bilder/foto.jpg" alt="Was auf dem Bild zu sehen ist" />',
    checks: [
      { id: 'img', text: 'Es gibt ein <img>-Element', pruefe: (c) => /<img[\s>]/i.test(c) },
      { id: 'src', text: 'Das Bild hat ein src', pruefe: (c) => /<img[^>]*src\s*=\s*["'][^"']+["']/i.test(c) },
      { id: 'alt', text: 'Das alt beschreibt das Bild (mind. 4 Zeichen)', pruefe: (c) => /<img[^>]*alt\s*=\s*["'][^"']{4,}["']/i.test(c) },
    ],
    musterloesung: '<h2>Mein Foto</h2>\n<img src="/bilder/newroz.jpg" alt="Newroz-Feuer bei Nacht" />',
  },
  {
    id: 'praxis-formular',
    art: 'html',
    title: 'Ein kleines Formular',
    topic: 'HTML',
    estimatedMinutes: 12,
    description: 'Label, Eingabefeld und Absenden-Knopf — richtig verbunden.',
    auftrag:
      'Baue eine Anmeldung: ein label, ein input und ein Absenden-Button (type="submit"). Wichtig: label und input gehören zusammen — das for des Labels muss zum id des Feldes passen. Dann landet man beim Tippen aufs Label direkt im Feld.',
    startCode: '<h2>Anmeldung</h2>\n<!-- Label, Eingabefeld, Absenden-Knopf -->\n',
    tipp: '<label for="name">Dein Name</label>\n<input id="name" type="text" />\n<button type="submit">Absenden</button>',
    checks: [
      { id: 'label', text: 'Es gibt ein <label> mit Text', pruefe: (c) => /<label[^>]*>\s*[^<\s][\s\S]*?<\/label>/i.test(c) },
      {
        id: 'verbunden',
        text: 'for (Label) und id (Feld) passen zusammen',
        pruefe: (c) => {
          const forWert = c.match(/<label[^>]*for\s*=\s*["']([^"']+)["']/i)
          if (!forWert) return false
          // Nutzereingabe darf keine Regex-Sonderzeichen einschleusen.
          const sicher = forWert[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`<input[^>]*id\\s*=\\s*["']${sicher}["']`, 'i').test(c)
        },
      },
      { id: 'submit', text: 'Der Button hat type="submit" und einen Text', pruefe: (c) => /<button[^>]*type\s*=\s*["']submit["'][^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(c) },
    ],
    musterloesung: '<h2>Anmeldung</h2>\n<label for="name">Dein Name</label>\n<input id="name" type="text" />\n<button type="submit">Absenden</button>',
  },
  {
    id: 'praxis-tabelle',
    art: 'html',
    title: 'Eine Vokabel-Tabelle',
    topic: 'HTML',
    estimatedMinutes: 12,
    description: 'Kurdisch links, Deutsch rechts — echte Daten in Zeilen und Spalten.',
    auftrag:
      'Baue eine Tabelle mit zwei Spaltenköpfen (th: Kurdisch, Deutsch) und mindestens zwei Wortpaaren darunter (je Zeile ein tr mit zwei td).',
    startCode: '<h2>Meine Wörter</h2>\n<!-- Tabelle: Kurdisch | Deutsch -->\n',
    tipp: '<table>\n  <tr><th>Kurdisch</th><th>Deutsch</th></tr>\n  <tr><td>Silav</td><td>Hallo</td></tr>\n</table>',
    checks: [
      { id: 'table', text: 'Es gibt eine <table>…</table>', pruefe: (c) => /<table[\s>][\s\S]*<\/table>/i.test(c) },
      { id: 'koepfe', text: 'Zwei Spaltenköpfe <th>', pruefe: (c) => (c.match(/<th[\s>]/gi) || []).length >= 2 },
      { id: 'zeilen', text: 'Mindestens drei Zeilen <tr> (Kopf + 2 Wortpaare)', pruefe: (c) => (c.match(/<tr[\s>]/gi) || []).length >= 3 },
      { id: 'daten', text: 'Die Datenzellen <td> sind nicht leer', pruefe: (c) => /<td[^>]*>\s*[^<\s]/i.test(c) },
    ],
    musterloesung: '<h2>Meine Wörter</h2>\n<table>\n  <tr><th>Kurdisch</th><th>Deutsch</th></tr>\n  <tr><td>Silav</td><td>Hallo</td></tr>\n  <tr><td>Spas</td><td>Danke</td></tr>\n</table>',
  },
  {
    id: 'praxis-variablen',
    art: 'html',
    title: 'Farben als CSS-Variablen',
    topic: 'CSS',
    estimatedMinutes: 12,
    description: 'Farben einmal anlegen, überall benutzen — wie der Dunkelmodus der App.',
    auftrag:
      'Lege im style-Block zwei CSS-Variablen an (z. B. --flaeche und --schrift) und benutze sie mit var() für die Karte: background und color kommen aus den Variablen. Ändere danach nur den Variablen-Wert — die Vorschau wechselt sofort die Farbe.',
    startCode: '<style>\n  /* Lege hier --flaeche und --schrift an */\n  .karte {\n    padding: 16px;\n    border-radius: 12px;\n  }\n</style>\n<div class="karte">Silav!</div>\n',
    tipp: ':root { --flaeche: #10222b; } und dann background: var(--flaeche);',
    checks: [
      { id: 'style', text: 'Es gibt einen <style>-Block', pruefe: (c) => /<style[\s>][\s\S]*<\/style>/i.test(c) },
      { id: 'variable', text: 'Eine Variable ist angelegt (--name: wert)', pruefe: (c) => /--[a-z][a-z0-9-]*\s*:/i.test(c) },
      { id: 'var', text: 'Die Variable wird mit var(--…) benutzt', pruefe: (c) => /var\(\s*--[a-z][a-z0-9-]*\s*\)/i.test(c) },
    ],
    musterloesung: '<style>\n  :root {\n    --flaeche: #10222b;\n    --schrift: #ffffff;\n  }\n  .karte {\n    background: var(--flaeche);\n    color: var(--schrift);\n    padding: 16px;\n    border-radius: 12px;\n  }\n</style>\n<div class="karte">Silav!</div>',
  },
  {
    id: 'praxis-meine-seite',
    art: 'html',
    title: 'Deine eigene Seite',
    topic: 'Projekt',
    estimatedMinutes: 15,
    description: 'Alles zusammen: Kopf, Inhalt mit Liste und Button, Fußzeile.',
    auftrag:
      'Das Abschluss-Projekt: Baue deine eigene kleine Seite — header mit deinem Namen als h1, main mit einem Absatz über dich, einer Liste (mindestens drei Einträge) und einem Button, footer mit dem Jahr. Alles, was du dafür brauchst, hast du in den Aufgaben davor gebaut.',
    startCode: '<!-- Deine Seite: header, main (Absatz + Liste + Button), footer -->\n',
    tipp: 'Arbeite von außen nach innen: erst header/main/footer, dann den Inhalt in main füllen.',
    checks: [
      { id: 'rahmen', text: 'Es gibt <header> und <footer>', pruefe: (c) => /<header[\s>]/i.test(c) && /<footer[\s>]/i.test(c) },
      { id: 'main', text: 'Es gibt genau ein <main>', pruefe: (c) => (c.match(/<main[\s>]/gi) || []).length === 1 },
      { id: 'h1', text: 'Im Kopf steht eine Überschrift <h1>', pruefe: (c) => /<h1[^>]*>\s*[^<\s][\s\S]*?<\/h1>/i.test(c) },
      { id: 'liste', text: 'Eine Liste mit mindestens drei Einträgen', pruefe: (c) => /<ul[\s>]/i.test(c) && (c.match(/<li[\s>]/gi) || []).length >= 3 },
      { id: 'button', text: 'Ein Button mit Beschriftung', pruefe: (c) => /<button[^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(c) },
    ],
    musterloesung: '<header>\n  <h1>Redur</h1>\n</header>\n<main>\n  <p>Ich lerne Kurmancî und baue Apps.</p>\n  <ul>\n    <li>Kurmancî</li>\n    <li>Deutsch</li>\n    <li>Englisch</li>\n  </ul>\n  <button type="button">Schreib mir</button>\n</main>\n<footer>2026</footer>',
  },
]

// iOS-Tastaturen machen aus geraden Anfuehrungszeichen gern „schlaue"
// (geschwungene). Fuer die Pruefung zaehlen beide gleich — sonst faellt
// eine richtige Loesung nur wegen der Tastatur durch.
function glaette(code) {
  return String(code ?? '')
    .replace(/[„“”«»]/g, '"')
    .replace(/[‚‘’]/g, "'")
}

for (const aufgabe of codePraxisAufgaben) {
  for (const check of aufgabe.checks) {
    const roh = check.pruefe
    check.pruefe = (wert) => roh(glaette(wert))
  }
}
