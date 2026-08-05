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
]
