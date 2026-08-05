// Interaktive Schritte fuer Lektionen — der Stoff als kleine Aufgaben,
// eine pro Bildschirm (wie bei Mimo, aber mit Live-Vorschau).
//
// Zwei Schritt-Arten:
//   'wahl'  → Frage + Antwortkarten, eine ist richtig (richtig = Index)
//   'bauen' → Code aus Bausteinen zusammentippen; die Bausteine stehen
//             ABSICHTLICH in falscher Reihenfolge. loesung ist der fertige
//             Code; eine Live-Vorschau zeigt das Ergebnis sofort.
//
//   'tippen' → selber schreiben: eigenes Eingabefeld (mit Code-Tastatur),
//              Live-Vorschau und eine Pruefliste, die live abhakt.
//
// Lektionen ohne Schritte behalten automatisch das Lese-Modal.

const SCHRITTE = {
  'html-1': [
    {
      art: 'wahl',
      frage: 'Was beschreibt HTML am besten?',
      optionen: [
        'Die Struktur einer Seite: Überschriften, Absätze, Knöpfe',
        'Die Farben und Schriften einer Seite',
        'Berechnungen und Logik',
      ],
      richtig: 0,
      erklaerung: 'HTML ist das Gerüst — Farben macht CSS, Logik macht JavaScript.',
    },
    {
      art: 'wahl',
      frage: 'Welcher dieser HTML-Tags erstellt einen Absatz?',
      optionen: ['<button>', '<p>', '<h1>'],
      code: true,
      richtig: 1,
      erklaerung: 'p wie „paragraph" — der Absatz.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue deinen ersten Absatz: ein p-Element mit dem Text Silav!',
      bausteine: ['Silav!', '<p>', '</p>'],
      loesung: '<p>Silav!</p>',
      tipp: 'Erst öffnen, dann der Text, dann schließen.',
    },
    {
      art: 'wahl',
      frage: 'Wie hören die meisten Elemente auf?',
      optionen: ['Mit einem Schluss-Tag wie </p>', 'Gar nicht — sie enden von selbst', 'Mit einem Punkt'],
      richtig: 0,
      erklaerung: 'Öffnen und schließen: <p>…</p>. Nur wenige Elemente wie <img> stehen allein.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib SELBST einen Absatz mit einem Gruß deiner Wahl.',
      checks: [
        { id: 'p', text: 'Ein Absatz <p>…</p>', pruefe: (c) => /<p[\s>][\s\S]*<\/p>/i.test(c) },
        { id: 'inhalt', text: 'Der Absatz hat Text', pruefe: (c) => /<p[^>]*>\s*[^<\s][\s\S]*?<\/p>/i.test(c) },
      ],
      musterloesung: '<p>Silav, ez Redur im!</p>',
      tipp: '<p>Dein Gruß</p>',
    },
  ],

  'html-2': [
    {
      art: 'wahl',
      frage: 'Welche Überschrift ist die größte?',
      optionen: ['<h1>', '<h6>', '<p>'],
      code: true,
      richtig: 0,
      erklaerung: 'h1 ist die Hauptüberschrift, h6 die kleinste Stufe.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue die Hauptüberschrift deiner Seite: ein h1 mit dem Text Meine Seite.',
      bausteine: ['</h1>', 'Meine Seite', '<h1>'],
      loesung: '<h1>Meine Seite</h1>',
    },
    {
      art: 'wahl',
      frage: 'Wie viele h1-Überschriften gehören auf eine Seite?',
      optionen: ['Genau eine', 'So viele wie möglich', 'Höchstens sechs'],
      richtig: 0,
      erklaerung: 'Eine Hauptüberschrift pro Seite — darunter h2, h3 als Zwischenüberschriften.',
    },
    {
      art: 'bauen',
      auftrag: 'Jetzt beides zusammen: eine Zwischenüberschrift und ein Absatz darunter.',
      bausteine: ['<p>', 'Ich lerne HTML.', '</p>', '<h2>Über mich</h2>'],
      loesung: '<h2>Über mich</h2><p>Ich lerne HTML.</p>',
      tipp: 'Die Überschrift kommt zuerst.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib SELBST die Hauptüberschrift für eine Seite über dich.',
      checks: [
        { id: 'h1', text: 'Eine Überschrift <h1>…</h1>', pruefe: (c) => /<h1[\s>][\s\S]*<\/h1>/i.test(c) },
        { id: 'inhalt', text: 'Die Überschrift ist nicht leer', pruefe: (c) => /<h1[^>]*>\s*[^<\s][\s\S]*?<\/h1>/i.test(c) },
      ],
      musterloesung: '<h1>Redur lernt Code</h1>',
      tipp: '<h1>…</h1>',
    },
  ],

  'html-3': [
    {
      art: 'bauen',
      auftrag: 'Programmiere einen Button, der den Text Post hat.',
      bausteine: ['<button>', '</button>', 'Post'],
      loesung: '<button>Post</button>',
    },
    {
      art: 'wahl',
      frage: 'Wozu schreibt man type="button" an einen Button?',
      optionen: [
        'Er verhält sich wie ein einfacher Knopf und schickt kein Formular ab',
        'Er wird dadurch größer',
        'Das ist Pflicht, sonst erscheint er nicht',
      ],
      richtig: 0,
      erklaerung: 'Ohne type verhält sich ein Button in Formularen wie „Absenden" — oft ungewollt.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue einen Link zur deutschen Wikipedia mit einem klaren Linktext.',
      bausteine: ['Wikipedia', '</a>', '<a href="https://de.wikipedia.org">'],
      loesung: '<a href="https://de.wikipedia.org">Wikipedia</a>',
    },
    {
      art: 'wahl',
      frage: 'Welcher Linktext ist gut?',
      optionen: ['„Zur Wörterbuch-Suche"', '„hier klicken"', '„Link"'],
      richtig: 0,
      erklaerung: 'Der Linktext sagt, wohin es geht — „hier klicken" sagt nichts.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib SELBST einen Button mit type="button" und einer deutschen Beschriftung.',
      checks: [
        { id: 'button', text: 'Ein <button>-Element', pruefe: (c) => /<button[\s>]/i.test(c) },
        { id: 'type', text: 'type="button" ist gesetzt', pruefe: (c) => /<button[^>]*type\s*=\s*["']button["']/i.test(c) },
        { id: 'text', text: 'Der Button hat eine Beschriftung', pruefe: (c) => /<button[^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(c) },
      ],
      musterloesung: '<button type="button">Speichern</button>',
      tipp: '<button type="button">…</button> — die Code-Tastatur hat den Baustein.',
    },
  ],

  'html-4': [
    {
      art: 'wahl',
      frage: 'Wofür ist der alt-Text eines Bildes da?',
      optionen: [
        'Er beschreibt das Bild für Menschen, die es nicht sehen können',
        'Er macht das Bild schärfer',
        'Er ist nur für Suchmaschinen',
      ],
      richtig: 0,
      erklaerung: 'Screenreader lesen alt vor — und wenn das Bild nicht lädt, steht er dort.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue ein Bild mit src und alt ein. In der Vorschau siehst du den Alt-Text — genau das sehen Menschen ohne das Bild.',
      bausteine: [' alt="Newroz-Feuer" />', '<img', ' src="/bilder/newroz.jpg"'],
      loesung: '<img src="/bilder/newroz.jpg" alt="Newroz-Feuer" />',
      tipp: 'Reihenfolge: img öffnen, src, alt.',
    },
    {
      art: 'wahl',
      frage: 'Ein Bild ist reine Dekoration. Was machst du mit alt?',
      optionen: ['Leer lassen: alt=""', 'alt ganz weglassen', '„Bild" hineinschreiben'],
      richtig: 0,
      erklaerung: 'Leeres alt heißt: bewusst überspringen. Fehlendes alt ist ein Fehler.',
    },
  ],

  'html-6': [
    {
      art: 'wahl',
      frage: 'Welches Element macht eine Liste mit Punkten?',
      optionen: ['<ul>', '<ol>', '<table>'],
      code: true,
      richtig: 0,
      erklaerung: 'ul = ungeordnet (Punkte), ol = geordnet (Nummern).',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Liste mit zwei Einträgen: Silav und Spas.',
      bausteine: ['<li>Spas</li>', '<ul>', '</ul>', '<li>Silav</li>'],
      loesung: '<ul><li>Silav</li><li>Spas</li></ul>',
      tipp: 'ul umschließt alles, jeder Eintrag ist ein li. Silav zuerst.',
    },
    {
      art: 'wahl',
      frage: 'Du willst Schritte in fester Reihenfolge zeigen (1., 2., 3.). Was nimmst du?',
      optionen: ['<ol>', '<ul>', '<p>'],
      code: true,
      richtig: 0,
      erklaerung: 'ol nummeriert automatisch — perfekt für Anleitungen.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib SELBST eine kleine Liste mit zwei Dingen, die du magst.',
      checks: [
        { id: 'ul', text: 'Eine Liste <ul>…</ul>', pruefe: (c) => /<ul[\s>][\s\S]*<\/ul>/i.test(c) },
        { id: 'li', text: 'Mindestens zwei Einträge <li>', pruefe: (c) => (c.match(/<li[\s>]/gi) || []).length >= 2 },
        { id: 'inhalt', text: 'Die Einträge sind nicht leer', pruefe: (c) => /<li[^>]*>\s*[^<\s][\s\S]*?<\/li>/i.test(c) },
      ],
      musterloesung: '<ul>\n  <li>Çay</li>\n  <li>Musik</li>\n</ul>',
      tipp: 'ul und li liegen als Bausteine auf der <>-Ebene der Code-Tastatur.',
    },
  ],

  'html-7': [
    {
      art: 'wahl',
      frage: 'Wozu braucht ein Eingabefeld ein label?',
      optionen: [
        'Es sagt, was ins Feld gehört — und ist mit dem Feld verbunden',
        'Es ist nur Dekoration',
        'Es macht das Feld breiter',
      ],
      richtig: 0,
      erklaerung: 'Tippt man aufs Label, landet man im Feld — und Screenreader wissen Bescheid.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue ein Label und sein Eingabefeld — verbunden über for und id.',
      bausteine: ['<input id="name" type="text" />', '<label for="name">Dein Name</label>'],
      loesung: '<label for="name">Dein Name</label><input id="name" type="text" />',
      tipp: 'Das Label kommt vor dem Feld.',
    },
    {
      art: 'wahl',
      frage: 'Warum stehen for="name" und id="name" beide da?',
      optionen: [
        'So weiß der Browser, dass Label und Feld zusammengehören',
        'Reiner Zufall',
        'Damit das Feld einen Namen anzeigt',
      ],
      richtig: 0,
      erklaerung: 'for (am Label) zeigt auf das id (am Feld) — das ist die Verbindung.',
    },
  ],

  'html-5': [
    {
      art: 'wahl',
      frage: 'Wie oft darf <main> auf einer Seite vorkommen?',
      optionen: ['Genau einmal', 'Beliebig oft', 'Gar nicht'],
      richtig: 0,
      erklaerung: 'Ein Hauptinhalt pro Seite — header und footer rahmen ihn ein.',
    },
    {
      art: 'bauen',
      auftrag: 'Teile eine Seite in ihre drei Bereiche auf.',
      bausteine: ['<footer>Fuß</footer>', '<header>Kopf</header>', '<main>Inhalt</main>'],
      loesung: '<header>Kopf</header><main>Inhalt</main><footer>Fuß</footer>',
      tipp: 'Von oben nach unten: Kopf, Inhalt, Fuß.',
    },
    {
      art: 'wahl',
      frage: 'Wofür ist <nav> da?',
      optionen: ['Es umschließt die Navigation', 'Es macht Text fett', 'Es lädt eine neue Seite'],
      richtig: 0,
      erklaerung: 'nav sagt: Hier sind die Links, mit denen man sich bewegt.',
    },
  ],

  'html-8': [
    {
      art: 'wahl',
      frage: 'Welches Element ist EINE ZEILE einer Tabelle?',
      optionen: ['<tr>', '<td>', '<table>'],
      code: true,
      richtig: 0,
      erklaerung: 'tr = table row. Darin stehen die Zellen: th (Kopf) und td (Daten).',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine kleine Vokabel-Tabelle: Kopfzeile und ein Wortpaar.',
      bausteine: [
        '<tr><td>Silav</td><td>Hallo</td></tr>',
        '</table>',
        '<table>',
        '<tr><th>Kurdisch</th><th>Deutsch</th></tr>',
      ],
      loesung:
        '<table><tr><th>Kurdisch</th><th>Deutsch</th></tr><tr><td>Silav</td><td>Hallo</td></tr></table>',
      tipp: 'table öffnen, Kopfzeile, Datenzeile, table schließen.',
    },
    {
      art: 'wahl',
      frage: 'Darf man Tabellen benutzen, um die ganze Seite anzuordnen?',
      optionen: ['Nein — Tabellen sind nur für echte Daten', 'Ja, das ist der moderne Weg', 'Nur auf dem Handy'],
      richtig: 0,
      erklaerung: 'Fürs Layout gibt es header/main/footer und CSS (Flexbox, Grid).',
    },
  ],

  'css-1': [
    {
      art: 'wahl',
      frage: 'Welche Sprache ist für Farben und Schriften zuständig?',
      optionen: ['CSS', 'HTML', 'JavaScript'],
      richtig: 0,
      erklaerung: 'HTML baut das Gerüst, CSS macht es schön, JavaScript macht es lebendig.',
    },
    {
      art: 'bauen',
      auftrag: 'Färbe einen Absatz: erst der style-Block mit der Regel, dann der Absatz.',
      bausteine: ['<p>Silav!</p>', '<style>', '</style>', 'p { color: crimson; }'],
      loesung: '<style>p { color: crimson; }</style><p>Silav!</p>',
      tipp: 'style öffnen, Regel, style schließen — dann der Absatz.',
    },
    {
      art: 'wahl',
      frage: 'Wie ist eine CSS-Regel aufgebaut?',
      optionen: ['selektor { eigenschaft: wert; }', 'wert = eigenschaft', '<regel>…</regel>'],
      code: true,
      richtig: 0,
      erklaerung: 'Wen? (Selektor) — was? (Eigenschaft) — wie? (Wert).',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib SELBST in den style-Block eine Regel, die dem Absatz eine Farbe gibt.',
      startText: '<style>\n\n</style>\n<p>Silav!</p>',
      checks: [
        { id: 'selektor', text: 'Eine Regel p { … }', pruefe: (c) => /p\s*\{[\s\S]*?\}/i.test(c) },
        { id: 'farbe', text: 'color: ist gesetzt', pruefe: (c) => /color\s*:/i.test(c) },
      ],
      musterloesung: '<style>\np { color: crimson; }\n</style>\n<p>Silav!</p>',
      tipp: 'p { color: crimson; } — die Vorschau färbt sofort um.',
    },
  ],

  'css-2': [
    {
      art: 'wahl',
      frage: 'Was ist padding?',
      optionen: [
        'Der Innenabstand — Luft ZWISCHEN Rand und Inhalt',
        'Der Außenabstand zum Nachbarn',
        'Die Randfarbe',
      ],
      richtig: 0,
      erklaerung: 'padding = innen, margin = außen.',
    },
    {
      art: 'bauen',
      auftrag: 'Gib der Karte Luft: eine Klasse mit padding und Hintergrundfarbe.',
      bausteine: [
        '<div class="karte">Silav!</div>',
        '.karte { padding: 24px; background: #e3f5f6; }',
        '<style>',
        '</style>',
      ],
      loesung: '<style>.karte { padding: 24px; background: #e3f5f6; }</style><div class="karte">Silav!</div>',
      tipp: 'Erst der style-Block, dann die Karte.',
    },
    {
      art: 'wahl',
      frage: 'Der Text klebt am Rand seiner Karte. Was fehlt?',
      optionen: ['padding', 'margin', 'color'],
      code: true,
      richtig: 0,
      erklaerung: 'Innen-Luft = padding.',
    },
  ],

  'css-3': [
    {
      art: 'wahl',
      frage: 'Wie hoch muss ein Button für Finger mindestens sein?',
      optionen: ['44 Pixel', '20 Pixel', '8 Pixel'],
      richtig: 0,
      erklaerung: 'Die 44-px-Regel — gilt in RED-KURD für jeden Knopf.',
    },
    {
      art: 'bauen',
      auftrag: 'Mach aus dem grauen Standard-Button einen echten App-Button.',
      bausteine: [
        '<button type="button">Speichern</button>',
        'button { min-height: 44px; border-radius: 12px; background: #0ea5a8; color: white; border: none; padding: 0 20px; }',
        '</style>',
        '<style>',
      ],
      loesung:
        '<style>button { min-height: 44px; border-radius: 12px; background: #0ea5a8; color: white; border: none; padding: 0 20px; }</style><button type="button">Speichern</button>',
      tipp: 'style öffnen, Regel, style schließen, Button.',
    },
    {
      art: 'wahl',
      frage: 'Woran erkennt man einen guten Touch-Button?',
      optionen: [
        'Groß genug für den Finger und mit klarer Beschriftung',
        'Möglichst klein, damit mehr aufs Display passt',
        'Nur ein Symbol, nie Text',
      ],
      richtig: 0,
      erklaerung: 'Große Fläche + klarer Text = weniger Fehltipper.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Gestalte den Button SELBST — mindestens 44 px hoch und mit Hintergrundfarbe.',
      startText: '<style>\nbutton {\n\n}\n</style>\n<button type="button">Speichern</button>',
      checks: [
        { id: 'hoehe', text: 'min-height: mindestens 44px', pruefe: (c) => /min-height\s*:\s*(4[4-9]|[5-9]\d|\d{3,})px/i.test(c) },
        { id: 'farbe', text: 'background ist gesetzt', pruefe: (c) => /background[^:]*:/i.test(c) },
      ],
      musterloesung:
        '<style>\nbutton {\n  min-height: 44px;\n  background: #0ea5a8;\n  color: white;\n}\n</style>\n<button type="button">Speichern</button>',
      tipp: 'min-height: 44px; background: …; — beides in die button-Regel.',
    },
  ],

  'css-4': [
    {
      art: 'wahl',
      frage: 'Was macht display: flex mit den Kindern eines Elements?',
      optionen: ['Es stellt sie in eine Reihe', 'Es versteckt sie', 'Es macht sie fett'],
      code: true,
      richtig: 0,
      erklaerung: 'Flexbox ordnet Kinder in einer Reihe (oder Spalte) an.',
    },
    {
      art: 'bauen',
      auftrag: 'Stelle zwei Buttons nebeneinander — mit Abstand dazwischen.',
      bausteine: [
        '<div class="reihe"><button>Ja</button><button>Nein</button></div>',
        '.reihe { display: flex; gap: 12px; }',
        '<style>',
        '</style>',
      ],
      loesung:
        '<style>.reihe { display: flex; gap: 12px; }</style><div class="reihe"><button>Ja</button><button>Nein</button></div>',
    },
    {
      art: 'wahl',
      frage: 'Wofür ist gap da?',
      optionen: [
        'Abstand ZWISCHEN den Elementen — ohne margin-Tricks',
        'Die Schriftgröße',
        'Der Zoom-Faktor',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'gap regelt die Lücken in Flex- und Grid-Layouts.',
    },
  ],

  'css-5': [
    {
      art: 'wahl',
      frage: 'Was bedeutet „Mobile zuerst"?',
      optionen: [
        'Erst fürs Handy gestalten, dann für große Bildschirme erweitern',
        'Die Handy-Version kommt irgendwann später',
        'Nur eine App im App-Store zählt',
      ],
      richtig: 0,
      erklaerung: 'Genau so ist RED-KURD gebaut: iPhone zuerst.',
    },
    {
      art: 'wahl',
      frage: 'Welche Regel gilt NUR ab 700 Pixel Breite?',
      optionen: ['@media (min-width: 700px) { … }', '@media (max-width: 700px) { … }', 'width: 700px;'],
      code: true,
      richtig: 0,
      erklaerung: 'min-width: „ab dieser Breite aufwärts".',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Grundregel plus eine Zusatzregel, die ab 100 px Breite fett macht — die Vorschau ist breiter, also siehst du beides wirken.',
      bausteine: [
        'p { color: teal; }',
        '</style>',
        '@media (min-width: 100px) { p { font-weight: bold; } }',
        '<style>',
        '<p>Silav!</p>',
      ],
      loesung:
        '<style>p { color: teal; }@media (min-width: 100px) { p { font-weight: bold; } }</style><p>Silav!</p>',
      tipp: 'style öffnen, Grundregel, media-Regel, style schließen, Absatz.',
    },
  ],

  'css-6': [
    {
      art: 'wahl',
      frage: 'Wofür ist Grid besser als Flexbox?',
      optionen: [
        'Für Raster aus Zeilen UND Spalten gleichzeitig',
        'Für eine einzelne Reihe',
        'Für Töne und Musik',
      ],
      richtig: 0,
      erklaerung: 'Flex = eine Richtung, Grid = beide Richtungen.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue ein Karten-Raster mit zwei Spalten — vier Knöpfe füllen es.',
      bausteine: [
        '.raster { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }',
        '<div class="raster"><button>1</button><button>2</button><button>3</button><button>4</button></div>',
        '</style>',
        '<style>',
      ],
      loesung:
        '<style>.raster { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }</style><div class="raster"><button>1</button><button>2</button><button>3</button><button>4</button></div>',
    },
    {
      art: 'wahl',
      frage: 'Was bedeutet 1fr?',
      optionen: ['Ein Anteil des freien Platzes', 'Ein Pixel', 'Ein Prozent'],
      code: true,
      richtig: 0,
      erklaerung: '1fr 1fr = zwei gleich breite Spalten, egal wie breit der Schirm ist.',
    },
  ],

  'css-7': [
    {
      art: 'wahl',
      frage: 'Was macht transition?',
      optionen: [
        'Änderungen gleiten weich statt hart umzuspringen',
        'Es lädt die Seite neu',
        'Es übersetzt Texte',
      ],
      richtig: 0,
      erklaerung: '150 ms weiches Gleiten fühlt sich hochwertig an.',
    },
    {
      art: 'bauen',
      auftrag: 'Ein Button, der beim Drücken weich absinkt. Drück ihn danach in der Vorschau!',
      bausteine: [
        'button:active { transform: translateY(2px); }',
        '<button type="button">Drück mich</button>',
        'button { transition: transform 150ms ease; min-height: 44px; }',
        '<style>',
        '</style>',
      ],
      loesung:
        '<style>button { transition: transform 150ms ease; min-height: 44px; }button:active { transform: translateY(2px); }</style><button type="button">Drück mich</button>',
      tipp: 'style öffnen, Grundregel, :active-Regel, style schließen, Button.',
    },
    {
      art: 'wahl',
      frage: 'Wofür ist prefers-reduced-motion?',
      optionen: [
        'Menschen, die weniger Bewegung eingestellt haben, bekommen Ruhe',
        'Es macht Animationen schneller',
        'Es spart Akku beim Laden',
      ],
      richtig: 0,
      erklaerung: 'Gute Apps respektieren diese Einstellung — RED-KURD auch.',
    },
  ],

  'css-8': [
    {
      art: 'wahl',
      frage: 'Was klebt IMMER am Fenster, egal wie weit man rollt?',
      optionen: ['position: fixed', 'position: sticky', 'position: static'],
      code: true,
      richtig: 0,
      erklaerung: 'sticky klebt erst, wenn es beim Rollen an seiner Kante ankommt.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Kopfzeile, die beim Rollen oben kleben bleibt — roll danach in der Vorschau!',
      bausteine: [
        '.kopf { position: sticky; top: 0; background: #0ea5a8; color: white; padding: 8px; }',
        '<div class="kopf">Kopfzeile</div>',
        '<p>Zeile 1<br>Zeile 2<br>Zeile 3<br>Zeile 4<br>Zeile 5<br>Zeile 6<br>Zeile 7<br>Zeile 8<br>Zeile 9<br>Zeile 10</p>',
        '</style>',
        '<style>',
      ],
      loesung:
        '<style>.kopf { position: sticky; top: 0; background: #0ea5a8; color: white; padding: 8px; }</style><div class="kopf">Kopfzeile</div><p>Zeile 1<br>Zeile 2<br>Zeile 3<br>Zeile 4<br>Zeile 5<br>Zeile 6<br>Zeile 7<br>Zeile 8<br>Zeile 9<br>Zeile 10</p>',
      tipp: 'style, Regel, style zu — dann Kopfzeile, dann der lange Inhalt.',
    },
    {
      art: 'wahl',
      frage: 'Eine fixe Leiste unten am iPhone braucht zusätzlich …',
      optionen: [
        'padding-bottom mit env(safe-area-inset-bottom)',
        'mehr Werbung',
        'position: static',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'Sonst kollidiert sie mit dem Home-Balken.',
    },
  ],

  'css-9': [
    {
      art: 'wahl',
      frage: 'Wozu sind CSS-Variablen gut?',
      optionen: [
        'Einen Wert einmal anlegen und überall benutzen',
        'Sie machen die Seite schneller',
        'Sie ersetzen HTML',
      ],
      richtig: 0,
      erklaerung: 'Farbe an EINER Stelle ändern — die ganze App zieht mit.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine dunkle Karte, deren Farben aus Variablen kommen.',
      bausteine: [
        ':root { --flaeche: #10222b; --schrift: #ffffff; }',
        '.karte { background: var(--flaeche); color: var(--schrift); padding: 16px; border-radius: 12px; }',
        '<div class="karte">Silav!</div>',
        '</style>',
        '<style>',
      ],
      loesung:
        '<style>:root { --flaeche: #10222b; --schrift: #ffffff; }.karte { background: var(--flaeche); color: var(--schrift); padding: 16px; border-radius: 12px; }</style><div class="karte">Silav!</div>',
      tipp: 'style öffnen, Variablen anlegen, Karte gestalten, style zu, Karte.',
    },
    {
      art: 'wahl',
      frage: 'Wie funktioniert ein Dunkelmodus mit Variablen?',
      optionen: [
        'Dieselben Variablen bekommen im Dunkeln einfach andere Werte',
        'Man schreibt jede Regel doppelt',
        'Das geht mit CSS nicht',
      ],
      richtig: 0,
      erklaerung: 'Genau so macht es RED-KURD in tokens.css.',
    },
  ],

  'js-1': [
    {
      art: 'wahl',
      frage: 'Was ist die Aufgabe von JavaScript?',
      optionen: [
        'Verhalten: auf Klicks reagieren und die Seite verändern',
        'Nur Farben und Schriften',
        'Nur Überschriften und Absätze',
      ],
      richtig: 0,
      erklaerung: 'HTML = Gerüst, CSS = Aussehen, JavaScript = Verhalten.',
    },
    {
      art: 'wahl',
      frage: 'Wo läuft das JavaScript einer Webseite?',
      optionen: ['Im Browser — direkt auf deinem Gerät', 'Nur auf einem Server', 'Im Router'],
      richtig: 0,
      erklaerung: 'Deshalb funktioniert RED-KURD auch offline.',
    },
    {
      art: 'bauen',
      auftrag: 'Dein erstes JavaScript: Schreib einen Gruß in den leeren Absatz. Die Vorschau führt deinen Code wirklich aus!',
      skript: true,
      huelle: '<p id="gruss"></p>\n<script>{{code}}</script>',
      bausteine: [".textContent", "document.querySelector('#gruss')", " = 'Silav ji JavaScript!';"],
      loesung: "document.querySelector('#gruss').textContent = 'Silav ji JavaScript!';",
      tipp: 'Element holen, dann .textContent, dann der neue Wert.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib die Zeile SELBST — hol #gruss und setz textContent auf deinen eigenen Gruß. Die Vorschau führt deinen Code aus!',
      skript: true,
      huelle: '<p id="gruss"></p>\n<script>{{code}}</script>',
      checks: [
        {
          id: 'holen',
          text: "Das Element holen: document.querySelector('#gruss')",
          pruefe: (c) => /document\.querySelector\(\s*['"]#gruss['"]\s*\)/.test(c),
        },
        {
          id: 'setzen',
          text: 'textContent = mit einem eigenen Text',
          pruefe: (c) => /\.textContent\s*=\s*['"][^'"]+['"]/.test(c),
        },
      ],
      musterloesung: "document.querySelector('#gruss').textContent = 'Silav!';",
      tipp: "document.querySelector('#gruss').textContent = '…';",
    },
  ],

  'js-2': [
    {
      art: 'wahl',
      frage: 'Was macht addEventListener("click", …)?',
      optionen: [
        'Es führt Code aus, sobald das Element angeklickt wird',
        'Es klickt selbst auf den Knopf',
        'Es löscht den Knopf',
      ],
      richtig: 0,
      erklaerung: 'Ereignis „click" → deine Funktion läuft.',
    },
    {
      art: 'bauen',
      auftrag: 'Verdrahte den Knopf: Beim Klick soll „Spas!" erscheinen. Tippe danach in der Vorschau auf den Knopf!',
      skript: true,
      huelle:
        '<button id="knopf" type="button">Klick mich</button>\n<p id="antwort"></p>\n<script>{{code}}</script>',
      bausteine: [
        ".addEventListener('click', () => {",
        "document.querySelector('#knopf')",
        " document.querySelector('#antwort').textContent = 'Spas!';",
        ' });',
      ],
      loesung:
        "document.querySelector('#knopf').addEventListener('click', () => { document.querySelector('#antwort').textContent = 'Spas!'; });",
      tipp: 'Knopf holen, Lauscher anhängen, im Inneren die Antwort setzen, schließen.',
    },
    {
      art: 'wahl',
      frage: 'Was ist "click" in diesem Code?',
      optionen: ['Der Name des Ereignisses', 'Eine Farbe', 'Ein CSS-Selektor'],
      code: true,
      richtig: 0,
      erklaerung: 'Es gibt viele Ereignisse: click, input, submit …',
    },
  ],

  'js-3': [
    {
      art: 'wahl',
      frage: 'Womit legst du eine Variable an, die sich noch ändern darf?',
      optionen: ['let', 'const', 'fest'],
      code: true,
      richtig: 0,
      erklaerung: 'let darf sich ändern, const bleibt bei seinem Wert.',
    },
    {
      art: 'wahl',
      frage: 'Was bedeutet const?',
      optionen: [
        'Der Wert wird nicht neu zugewiesen',
        'Die Variable ist unsichtbar',
        'Die Variable ist eine Zahl',
      ],
      richtig: 0,
      erklaerung: 'Erst const versuchen — nur bei Bedarf let.',
    },
    {
      art: 'bauen',
      auftrag: 'Rechne mit einer Variablen: 10 XP, dann +5 — und zeig das Ergebnis an.',
      skript: true,
      huelle: '<p id="punkte"></p>\n<script>{{code}}</script>',
      bausteine: [
        " punkte = punkte + 5;",
        'let punkte = 10;',
        " document.querySelector('#punkte').textContent = punkte + ' XP';",
      ],
      loesung:
        "let punkte = 10; punkte = punkte + 5; document.querySelector('#punkte').textContent = punkte + ' XP';",
      tipp: 'Anlegen, erhöhen, anzeigen — die Vorschau zeigt 15 XP.',
    },
  ],

  'js-4': [
    {
      art: 'wahl',
      frage: 'Was prüft ein if?',
      optionen: [
        'Eine Bedingung — der Code läuft nur, wenn sie stimmt',
        'Die Internetverbindung',
        'Die Rechtschreibung',
      ],
      richtig: 0,
      erklaerung: 'if (bedingung) { … } — sonst passiert nichts.',
    },
    {
      art: 'bauen',
      auftrag: 'Zeig die Erfolgsmeldung nur, wenn das Tagesziel (30 XP) erreicht ist.',
      skript: true,
      huelle: '<p id="meldung"></p>\n<script>{{code}}</script>',
      bausteine: [
        ' if (xp >= 30) {',
        'const xp = 35;',
        " document.querySelector('#meldung').textContent = 'Tagesziel geschafft!';",
        ' }',
      ],
      loesung:
        "const xp = 35; if (xp >= 30) { document.querySelector('#meldung').textContent = 'Tagesziel geschafft!'; }",
      tipp: 'Wert anlegen, if öffnen, Meldung setzen, if schließen.',
    },
    {
      art: 'wahl',
      frage: 'Welches Zeichen heißt „größer oder gleich"?',
      optionen: ['>=', '=>', '=='],
      code: true,
      richtig: 0,
      erklaerung: '=> ist etwas anderes: eine Pfeilfunktion!',
    },
  ],

  'js-5': [
    {
      art: 'wahl',
      frage: 'Wie sieht eine Liste (Array) in JavaScript aus?',
      optionen: ["['Silav', 'Spas']", '{Silav, Spas}', '"Silav, Spas"'],
      code: true,
      richtig: 0,
      erklaerung: 'Eckige Klammern, Einträge mit Komma.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue aus einer Wortliste automatisch eine HTML-Liste — ein Eintrag je Wort.',
      skript: true,
      huelle: '<ul id="liste"></ul>\n<script>{{code}}</script>',
      bausteine: [
        ' for (const wort of woerter) {',
        "const woerter = ['Silav', 'Spas', 'Baş'];",
        " document.querySelector('#liste').innerHTML += '<li>' + wort + '</li>';",
        ' }',
      ],
      loesung:
        "const woerter = ['Silav', 'Spas', 'Baş']; for (const wort of woerter) { document.querySelector('#liste').innerHTML += '<li>' + wort + '</li>'; }",
      tipp: 'Liste anlegen, Schleife öffnen, Eintrag anhängen, Schleife schließen.',
    },
    {
      art: 'wahl',
      frage: 'Wie oft läuft for (const wort of woerter)?',
      optionen: ['Einmal je Eintrag der Liste', 'Genau einmal', 'Endlos'],
      richtig: 0,
      erklaerung: 'Drei Wörter → drei Durchläufe.',
    },
  ],

  'js-6': [
    {
      art: 'wahl',
      frage: 'Was ist eine Funktion?',
      optionen: [
        'Ein benanntes Stück Code, das man wiederverwenden kann',
        'Eine CSS-Regel',
        'Ein HTML-Element',
      ],
      richtig: 0,
      erklaerung: 'Einmal schreiben, überall aufrufen.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Begrüßungs-Funktion und rufe sie mit dem Namen Zilan auf.',
      skript: true,
      huelle: '<p id="aus"></p>\n<script>{{code}}</script>',
      bausteine: [
        " return 'Silav, ' + name + '!';",
        'function begruesse(name) {',
        ' }',
        " document.querySelector('#aus').textContent = begruesse('Zilan');",
      ],
      loesung:
        "function begruesse(name) { return 'Silav, ' + name + '!'; } document.querySelector('#aus').textContent = begruesse('Zilan');",
      tipp: 'Funktion öffnen, return, Funktion schließen, aufrufen.',
    },
    {
      art: 'wahl',
      frage: 'Was macht return?',
      optionen: [
        'Es gibt das Ergebnis der Funktion zurück',
        'Es lädt die Seite neu',
        'Es druckt die Seite',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'Ohne return kommt undefined heraus.',
    },
  ],

  'js-7': [
    {
      art: 'wahl',
      frage: 'Was liefert document.querySelector("#status")?',
      optionen: [
        'Das Element mit der id status — zum Weiterarbeiten',
        'Eine neue Seite',
        'Eine Zahl',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'Holen → dann textContent, style oder classList ändern.',
    },
    {
      art: 'bauen',
      auftrag: 'Hole das Status-Element, ändere seinen Text auf „erledigt" und färbe ihn grün.',
      skript: true,
      huelle: '<p id="status">offen</p>\n<script>{{code}}</script>',
      bausteine: [
        " el.textContent = 'erledigt';",
        "const el = document.querySelector('#status');",
        " el.style.color = 'green';",
      ],
      loesung:
        "const el = document.querySelector('#status'); el.textContent = 'erledigt'; el.style.color = 'green';",
      tipp: 'Erst holen, dann Text, dann Farbe.',
    },
    {
      art: 'wahl',
      frage: 'Was macht classList.add("geschafft")?',
      optionen: [
        'Es hängt dem Element die CSS-Klasse geschafft an',
        'Es legt eine neue Datei an',
        'Es addiert Zahlen',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'So schaltet JavaScript Zustände um, die CSS dann gestaltet.',
    },
  ],

  'js-8': [
    {
      art: 'wahl',
      frage: 'Überlebt localStorage das Neuladen der Seite?',
      optionen: [
        'Ja — genau so merkt sich RED-KURD deinen Lernstand',
        'Nein, alles ist danach weg',
        'Nur fünf Minuten lang',
      ],
      richtig: 0,
      erklaerung: 'Lokal im Browser, ohne Konto, ohne Server.',
    },
    {
      art: 'bauen',
      auftrag: 'Objekte speichert man als Text: Wandle den Lernstand mit JSON.stringify um und zeig ihn an.',
      skript: true,
      huelle: '<pre id="aus"></pre>\n<script>{{code}}</script>',
      bausteine: [
        ' const text = JSON.stringify(stand);',
        'const stand = { xp: 120, tage: 3 };',
        " document.querySelector('#aus').textContent = text;",
      ],
      loesung:
        "const stand = { xp: 120, tage: 3 }; const text = JSON.stringify(stand); document.querySelector('#aus').textContent = text;",
      tipp: 'Objekt anlegen, in Text verwandeln, anzeigen.',
    },
    {
      art: 'wahl',
      frage: 'Beim Lesen ist noch nichts gespeichert. Was macht guter Code?',
      optionen: [
        'Er rechnet mit einem Startwert weiter',
        'Er stürzt ab',
        'Er lädt die Seite endlos neu',
      ],
      richtig: 0,
      erklaerung: 'roh ? JSON.parse(roh) : { xp: 0 } — Fehlen ist der Normalfall.',
    },
  ],

  'js-9': [
    {
      art: 'wahl',
      frage: 'Etwas funktioniert nicht. Was ist der erste Schritt?',
      optionen: [
        'Nachsehen: die Fehlermeldung lesen oder den Wert loggen',
        'Raten und Zeilen löschen',
        'Alles neu schreiben',
      ],
      richtig: 0,
      erklaerung: 'Nicht raten — nachsehen.',
    },
    {
      art: 'wahl',
      frage: 'Was verrät dir eine rote Fehlermeldung fast immer?',
      optionen: ['Datei und Zeile des Problems', 'Das Wetter', 'Nichts Nützliches'],
      richtig: 0,
      erklaerung: 'Deshalb: immer erst die Meldung lesen.',
    },
    {
      art: 'wahl',
      frage: 'Der Profi-Trick, um mehrere Werte gleichzeitig zu loggen?',
      optionen: ['console.log({ name, punkte })', 'console.log()', 'console.log;'],
      code: true,
      richtig: 0,
      erklaerung: 'Die geschweiften Klammern zeigen Namen UND Wert.',
    },
  ],

  'html-9': [
    {
      art: 'wahl',
      frage: 'Was bewirkt das Attribut controls bei audio und video?',
      optionen: [
        'Es zeigt die Bedienknöpfe: Abspielen, Pause, Lautstärke',
        'Es spielt den Ton automatisch ab',
        'Es macht die Datei kleiner',
      ],
      richtig: 0,
      erklaerung: 'Ohne controls sieht man nichts zum Drücken.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue einen Audio-Player für eine Aussprache-Aufnahme.',
      bausteine: [' src="/audio/silav.mp3">', '<audio', '</audio>', ' controls'],
      loesung: '<audio controls src="/audio/silav.mp3"></audio>',
      tipp: 'audio öffnen, controls, src, schließen.',
    },
    {
      art: 'wahl',
      frage: 'Soll Ton automatisch losspielen, wenn die Seite lädt?',
      optionen: ['Nein — Abspielen entscheidet immer der Mensch', 'Ja, das spart einen Klick', 'Nur nachts'],
      richtig: 0,
      erklaerung: 'Auto-Ton erschreckt, kostet Datenvolumen — und Browser blocken ihn meist.',
    },
  ],
}

// ===== TypeScript, GitHub, VS Code und die Mini-Projekte =====
// Hier gibt es nichts anzuzeigen (kein HTML), deshalb `vorschau: false` —
// gebaut wird trotzdem, nur ohne Vorschau-Rahmen.

Object.assign(SCHRITTE, {
  'ts-1': [
    {
      art: 'wahl',
      frage: 'Was ist TypeScript?',
      optionen: [
        'JavaScript mit Typangaben — Fehler fallen beim Schreiben auf',
        'Eine ganz andere Sprache, die der Browser direkt versteht',
        'Ein Design-Werkzeug',
      ],
      richtig: 0,
      erklaerung: 'Der Browser bekommt am Ende normales JavaScript.',
    },
    {
      art: 'bauen',
      auftrag: 'Schreib eine Funktion, die einen Namen als Text erwartet.',
      vorschau: false,
      bausteine: ['(name: string)', 'function begruesse', ' { return `Silav, ${name}!` }'],
      loesung: 'function begruesse(name: string) { return `Silav, ${name}!` }',
      tipp: 'Erst function und Name, dann die Klammer mit dem Typ.',
    },
    {
      art: 'wahl',
      frage: 'Wann merkst du mit TypeScript einen Fehler?',
      optionen: ['Schon beim Schreiben im Editor', 'Erst wenn ein Nutzer sich beschwert', 'Nie'],
      richtig: 0,
      erklaerung: 'Genau das ist der Gewinn: Fehler vor dem Nutzer.',
    },
  ],

  'ts-2': [
    {
      art: 'wahl',
      frage: 'Welcher Typ passt zu „wahr oder falsch"?',
      optionen: ['boolean', 'string', 'number'],
      code: true,
      richtig: 0,
      erklaerung: 'string ist Text, number eine Zahl, boolean wahr/falsch.',
    },
    {
      art: 'bauen',
      auftrag: 'Lege eine Liste von Texten an — zum Beispiel deine Sprachen.',
      vorschau: false,
      bausteine: [": string[] = ['Kurmancî', 'Deutsch']", 'const sprachen'],
      loesung: "const sprachen: string[] = ['Kurmancî', 'Deutsch']",
    },
    {
      art: 'wahl',
      frage: 'Was bedeutet string[]?',
      optionen: ['Eine Liste von Texten', 'Ein einzelner Buchstabe', 'Ein Text mit Klammern'],
      code: true,
      richtig: 0,
      erklaerung: 'Die eckigen Klammern machen aus dem Typ eine Liste.',
    },
  ],

  'ts-3': [
    {
      art: 'wahl',
      frage: 'Wozu dient ein interface?',
      optionen: [
        'Es beschreibt die Form eines Objekts: welche Felder es hat',
        'Es zeichnet die Oberfläche',
        'Es startet die App',
      ],
      richtig: 0,
      erklaerung: 'Ein Interface ist der Bauplan deiner Daten.',
    },
    {
      art: 'bauen',
      auftrag: 'Beschreibe eine Lektion: id und title sind Texte, durationMinutes eine Zahl.',
      vorschau: false,
      bausteine: [
        ' title: string;',
        'interface Lektion {',
        ' id: string;',
        ' durationMinutes: number; }',
      ],
      loesung: 'interface Lektion { id: string; title: string; durationMinutes: number; }',
      tipp: 'Erst öffnen, dann id, title, durationMinutes.',
    },
    {
      art: 'wahl',
      frage: 'Was macht das Fragezeichen in beispiel?: string',
      optionen: ['Das Feld ist optional', 'Das Feld ist Pflicht', 'Das Feld ist geheim'],
      code: true,
      richtig: 0,
      erklaerung: 'Optional heißt: Es darf fehlen — du musst das im Code bedenken.',
    },
  ],

  'ts-4': [
    {
      art: 'wahl',
      frage: 'Was steht hinter der Klammer einer Funktion?',
      optionen: ['Der Rückgabetyp', 'Der Name', 'Der Dateiname'],
      richtig: 0,
      erklaerung: 'function xp(karten: number): number — hinten steht, was herauskommt.',
    },
    {
      art: 'bauen',
      auftrag: 'Schreib eine Funktion mit Parameter- UND Rückgabetyp: aus Karten werden XP.',
      vorschau: false,
      bausteine: ['(karten: number)', ': number', 'function xp', ' { return karten * 10 }'],
      loesung: 'function xp(karten: number): number { return karten * 10 }',
      tipp: 'Name, Parameter, Rückgabetyp, dann der Rumpf.',
    },
    {
      art: 'wahl',
      frage: 'Warum lohnt sich der Rückgabetyp?',
      optionen: [
        'Niemand kann das Ergebnis versehentlich falsch weiterverwenden',
        'Der Code läuft schneller',
        'Die Datei wird kleiner',
      ],
      richtig: 0,
      erklaerung: 'Typen sind Absprachen — der Editor hält sie durch.',
    },
  ],

  'github-1': [
    {
      art: 'wahl',
      frage: 'Was ist ein Repository?',
      optionen: [
        'Der Ordner eines Projekts samt seiner ganzen Geschichte',
        'Ein einzelner Ordner ohne Verlauf',
        'Ein Chat-Programm',
      ],
      richtig: 0,
      erklaerung: 'Jede Änderung ist nachlesbar — das ist der Kern von Git.',
    },
    {
      art: 'wahl',
      frage: 'Wofür ist die Datei README.md da?',
      optionen: [
        'Sie erklärt, was das Projekt ist und wie man es startet',
        'Sie enthält den Programmcode',
        'Sie löscht alte Dateien',
      ],
      richtig: 0,
      erklaerung: 'Sie ist das Erste, was jemand liest — auch du in einem Jahr.',
    },
    {
      art: 'wahl',
      frage: 'Was bedeutet „clonen"?',
      optionen: [
        'Eine Kopie des Projekts auf den eigenen Rechner holen',
        'Das Projekt löschen',
        'Eine neue Datei anlegen',
      ],
      richtig: 0,
      erklaerung: 'git clone holt Code UND Geschichte.',
    },
  ],

  'github-2': [
    {
      art: 'wahl',
      frage: 'Was ist ein Commit?',
      optionen: [
        'Ein gespeicherter Schnappschuss mit einer Nachricht, warum',
        'Ein gelöschter Ordner',
        'Ein Programm zum Testen',
      ],
      richtig: 0,
      erklaerung: 'Ein Commit = eine Änderung + ein Satz, warum.',
    },
    {
      art: 'wahl',
      frage: 'Welche Commit-Nachricht ist gut?',
      optionen: ['„Buttons auf 44px vergrößert"', '„Fixes"', '„asdf"'],
      richtig: 0,
      erklaerung: 'Die Nachricht erklärt das WARUM — den Code sieht man ohnehin.',
    },
    {
      art: 'bauen',
      auftrag: 'Setz die drei Schritte in die richtige Reihenfolge: ändern, prüfen, committen.',
      vorschau: false,
      bausteine: ['2. npm test ausführen · ', '3. committen mit klarer Nachricht', '1. Änderung machen · '],
      loesung: '1. Änderung machen · 2. npm test ausführen · 3. committen mit klarer Nachricht',
      tipp: 'Erst arbeiten, dann prüfen, dann sichern.',
    },
  ],

  'github-3': [
    {
      art: 'wahl',
      frage: 'Was ist ein Branch?',
      optionen: [
        'Ein Nebengleis zum Bauen, ohne main zu gefährden',
        'Ein gelöschtes Projekt',
        'Ein anderer Computer',
      ],
      richtig: 0,
      erklaerung: 'RED-KURD arbeitet genau so: nie direkt auf main.',
    },
    {
      art: 'wahl',
      frage: 'Wozu dient ein Pull Request?',
      optionen: [
        'Er zeigt jede geänderte Zeile und bittet um Übernahme',
        'Er löscht den Branch sofort',
        'Er startet die App',
      ],
      richtig: 0,
      erklaerung: 'Im PR sieht man den Unterschied — Zeile für Zeile.',
    },
    {
      art: 'bauen',
      auftrag: 'Bring den Ablauf in die richtige Reihenfolge.',
      vorschau: false,
      bausteine: [' → Pull Request öffnen', 'Branch anlegen', ' → im Branch arbeiten', ' → nach Prüfung mergen'],
      loesung: 'Branch anlegen → im Branch arbeiten → Pull Request öffnen → nach Prüfung mergen',
      tipp: 'Anlegen, arbeiten, zeigen, übernehmen.',
    },
  ],

  'github-4': [
    {
      art: 'wahl',
      frage: 'Was ist ein Issue?',
      optionen: [
        'Eine Notizkarte am Projekt: Fehler, Wunsch oder Idee mit Nummer',
        'Ein Programmierfehler im Code',
        'Ein gelöschter Branch',
      ],
      richtig: 0,
      erklaerung: 'So geht kein Thema im Chat verloren.',
    },
    {
      art: 'wahl',
      frage: 'Was bewirkt „closes #12" in einem PR?',
      optionen: [
        'Wird der PR übernommen, schließt sich Issue 12 automatisch',
        'Es löscht Issue 12 sofort',
        'Es sperrt das Projekt',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'Issue und PR bleiben so automatisch synchron.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue die drei Teile eines guten Fehler-Issues zusammen.',
      vorschau: false,
      bausteine: ['Was passiert · ', 'Wie nachstellen', 'Was war erwartet · '],
      loesung: 'Was passiert · Was war erwartet · Wie nachstellen',
    },
  ],

  'vscode-1': [
    {
      art: 'wahl',
      frage: 'Was macht Strg+P (Mac: Cmd+P)?',
      optionen: [
        'Zu einer Datei springen, indem man ihren Namen tippt',
        'Die Datei drucken',
        'Das Programm schließen',
      ],
      richtig: 0,
      erklaerung: 'Der schnellste Weg durch ein fremdes Projekt.',
    },
    {
      art: 'wahl',
      frage: 'Wo findest du im Editor die Dateien eines Projekts?',
      optionen: ['Im Datei-Baum links', 'Ganz unten rechts', 'Gar nicht'],
      richtig: 0,
      erklaerung: 'Links der Baum, Mitte der Code, unten die Meldungen.',
    },
    {
      art: 'wahl',
      frage: 'Was sind Tabs im Editor?',
      optionen: [
        'Mehrere offene Dateien nebeneinander — wie im Browser',
        'Eine Art Kommentar',
        'Der Name des Projekts',
      ],
      richtig: 0,
      erklaerung: 'So arbeitest du an mehreren Dateien gleichzeitig.',
    },
  ],

  'vscode-2': [
    {
      art: 'wahl',
      frage: 'Welche Tastenkombination sucht im GANZEN Projekt?',
      optionen: ['Strg+Shift+F', 'Strg+F', 'Strg+S'],
      code: true,
      richtig: 0,
      erklaerung: 'Strg+F sucht nur in der offenen Datei.',
    },
    {
      art: 'wahl',
      frage: 'Welche Frage beantwortet die Projekt-Suche am besten?',
      optionen: [
        '„Wo wird das benutzt?"',
        '„Wie ist das Wetter?"',
        '„Wie groß ist die Datei?"',
      ],
      richtig: 0,
      erklaerung: 'Beim Lesen fremden Codes die wichtigste Frage überhaupt.',
    },
    {
      art: 'wahl',
      frage: 'Worauf musst du beim Ersetzen achten?',
      optionen: [
        'Erst anschauen, was alles getroffen wird',
        'Immer sofort alles ersetzen',
        'Die Datei vorher löschen',
      ],
      richtig: 0,
      erklaerung: 'Ein unbedachtes „Alle ersetzen" macht viel Arbeit kaputt.',
    },
  ],

  'vscode-3': [
    {
      art: 'wahl',
      frage: 'Womit startest du die App bei RED-KURD?',
      optionen: ['npm run dev', 'npm delete', 'npm start app jetzt'],
      code: true,
      richtig: 0,
      erklaerung: 'npm install einmalig, npm run dev zum Starten, npm test zum Prüfen.',
    },
    {
      art: 'bauen',
      auftrag: 'Bring die drei Befehle in die sinnvolle Reihenfolge.',
      vorschau: false,
      bausteine: [' npm run dev', 'npm install', ' npm test'],
      loesung: 'npm install npm run dev npm test',
      tipp: 'Erst Pakete holen, dann starten, dann prüfen.',
    },
    {
      art: 'wahl',
      frage: 'Rote Schrift im Terminal bedeutet …',
      optionen: [
        'eine Fehlermeldung, die meist Datei und Zeile nennt',
        'dass der Computer kaputt ist',
        'dass alles gut ist',
      ],
      richtig: 0,
      erklaerung: 'Fehlermeldungen lesen lohnt sich immer.',
    },
  ],

  'vscode-4': [
    {
      art: 'wahl',
      frage: 'Was macht Prettier?',
      optionen: [
        'Es formatiert den Code automatisch ordentlich',
        'Es sucht Bilder',
        'Es lädt die App hoch',
      ],
      richtig: 0,
      erklaerung: 'Nie wieder von Hand einrücken.',
    },
    {
      art: 'wahl',
      frage: 'Welche Einstellung lohnt sich am meisten?',
      optionen: ['Format on Save', 'Schriftart ändern', 'Zeilennummern ausblenden'],
      richtig: 0,
      erklaerung: 'Beim Speichern sieht der Code automatisch gut aus.',
    },
    {
      art: 'wahl',
      frage: 'Wie viele Erweiterungen brauchst du am Anfang?',
      optionen: [
        'Zwei bis drei gute reichen',
        'So viele wie möglich',
        'Gar keine, Erweiterungen sind schlecht',
      ],
      richtig: 0,
      erklaerung: 'Zu viele machen den Editor langsam und unübersichtlich.',
    },
  ],

  'mini-1': [
    {
      art: 'wahl',
      frage: 'Woraus besteht eine Karte in fast jeder App?',
      optionen: [
        'Bild, Überschrift, Text und ein Knopf',
        'Nur einem großen Bild',
        'Nur einer Tabelle',
      ],
      richtig: 0,
      erklaerung: 'Karten sind das Grundmuster moderner Oberflächen.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Filmkarte: Überschrift, Bewertung und ein Merken-Knopf.',
      bausteine: [
        '<p>★ 8,5</p>',
        '<article class="karte">',
        '<h3>Der Film</h3>',
        '<button type="button">Merken</button></article>',
      ],
      loesung:
        '<article class="karte"><h3>Der Film</h3><p>★ 8,5</p><button type="button">Merken</button></article>',
      tipp: 'Erst die Karte öffnen, dann Titel, Bewertung, Knopf.',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Bau deine eigene Karte — mit Überschrift, einem Absatz und einem Knopf.',
      checks: [
        { id: 'h3', text: 'Eine Überschrift (h2 oder h3)', pruefe: (c) => /<h[23][\s>][\s\S]*<\/h[23]>/i.test(c) },
        { id: 'p', text: 'Ein Absatz mit Text', pruefe: (c) => /<p[^>]*>\s*[^<\s][\s\S]*?<\/p>/i.test(c) },
        { id: 'button', text: 'Ein Button mit Beschriftung', pruefe: (c) => /<button[^>]*>\s*[^<\s][\s\S]*?<\/button>/i.test(c) },
      ],
      musterloesung: '<h3>Mein Film</h3>\n<p>★ 9,0</p>\n<button type="button">Merken</button>',
      tipp: 'Die Bausteine liegen alle auf der <>-Ebene der Code-Tastatur.',
    },
  ],

  'mini-2': [
    {
      art: 'wahl',
      frage: 'Wie rechnest du einen Durchschnitt?',
      optionen: [
        'Alles zusammenzählen, dann durch die Anzahl teilen',
        'Die größte Zahl nehmen',
        'Die Zahlen aneinanderhängen',
      ],
      richtig: 0,
      erklaerung: 'Summe ÷ Anzahl — der Klassiker.',
    },
    {
      art: 'wahl',
      frage: 'Was passiert bei einer LEEREN Liste?',
      optionen: [
        'Teilen durch null geht schief — man muss den Fall abfangen',
        'Es kommt automatisch 0 heraus',
        'Der Computer stürzt ab',
      ],
      richtig: 0,
      erklaerung: 'Erst der Normalfall, dann die Randfälle.',
    },
    {
      art: 'bauen',
      auftrag: 'Sichere den Randfall ab: bei leerer Liste gleich 0 zurückgeben.',
      skript: true,
      huelle: '<p id="aus"></p>\n<script>{{code}}</script>',
      bausteine: [
        ' if (noten.length === 0) return 0;',
        'function schnitt(noten) {',
        ' return noten.reduce((a, b) => a + b, 0) / noten.length; }',
        " document.querySelector('#aus').textContent = schnitt([]) + ' (leere Liste)';",
      ],
      loesung:
        "function schnitt(noten) { if (noten.length === 0) return 0; return noten.reduce((a, b) => a + b, 0) / noten.length; } document.querySelector('#aus').textContent = schnitt([]) + ' (leere Liste)';",
      tipp: 'Funktion öffnen, Randfall zuerst, dann rechnen, dann anzeigen.',
    },
  ],

  'mini-3': [
    {
      art: 'wahl',
      frage: 'Was hält eine Navigation unten am Bildschirm fest?',
      optionen: ['position: fixed', 'display: none', 'color: blue'],
      code: true,
      richtig: 0,
      erklaerung: 'fixed + bottom: 0 klebt die Leiste ans Fenster.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue eine Bottom-Navigation: fest unten, Knöpfe nebeneinander, 44 Pixel hoch.',
      bausteine: [
        '.untennav button { flex: 1; min-height: 44px; }',
        '<style>',
        '.untennav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; }',
        '</style>',
        '<nav class="untennav"><button>Heute</button><button>Üben</button></nav>',
      ],
      loesung:
        '<style>.untennav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; }.untennav button { flex: 1; min-height: 44px; }</style><nav class="untennav"><button>Heute</button><button>Üben</button></nav>',
      tipp: 'style öffnen, Leiste, Knöpfe, style schließen, dann das nav.',
    },
    {
      art: 'wahl',
      frage: 'Was fehlt am iPhone noch, damit die Leiste nicht am Home-Balken klebt?',
      optionen: [
        'padding-bottom mit env(safe-area-inset-bottom)',
        'Eine größere Schrift',
        'Ein zweites nav',
      ],
      code: true,
      richtig: 0,
      erklaerung: 'Die Schutzzone gehört zu jeder festen Leiste unten.',
    },
  ],

  'mini-4': [
    {
      art: 'wahl',
      frage: 'Wie gehst du eine ganze Seite am besten an?',
      optionen: [
        'Von außen nach innen: erst die Bereiche, dann den Inhalt',
        'Alles auf einmal schreiben',
        'Mit den Farben anfangen',
      ],
      richtig: 0,
      erklaerung: 'Erst das Gerüst — dann füllst du es.',
    },
    {
      art: 'bauen',
      auftrag: 'Baue das Gerüst deiner Visitenkarten-Seite.',
      bausteine: ['<main>Über mich</main>', '<header><h1>Redur</h1></header>', '<footer>2026</footer>'],
      loesung: '<header><h1>Redur</h1></header><main>Über mich</main><footer>2026</footer>',
    },
    {
      art: 'tippen',
      auftrag: 'Jetzt du: Schreib deine eigene Visitenkarten-Seite — Kopf mit Überschrift, ein main mit Absatz und Liste, ein footer.',
      checks: [
        { id: 'header', text: 'Ein <header> mit Überschrift', pruefe: (c) => /<header[\s>][\s\S]*<h1[\s>]/i.test(c) },
        { id: 'main', text: 'Genau ein <main>', pruefe: (c) => (c.match(/<main[\s>]/gi) || []).length === 1 },
        { id: 'liste', text: 'Eine Liste mit mindestens zwei Einträgen', pruefe: (c) => /<ul[\s>]/i.test(c) && (c.match(/<li[\s>]/gi) || []).length >= 2 },
        { id: 'footer', text: 'Ein <footer>', pruefe: (c) => /<footer[\s>]/i.test(c) },
      ],
      musterloesung:
        '<header>\n  <h1>Redur</h1>\n</header>\n<main>\n  <p>Ich lerne Code.</p>\n  <ul>\n    <li>Kurmancî</li>\n    <li>Deutsch</li>\n  </ul>\n</main>\n<footer>2026</footer>',
      tipp: 'Erst header, main, footer — dann main füllen.',
    },
  ],
})

// iOS macht aus geraden Anfuehrungszeichen gern „schlaue" — fuer die
// Schreib-Schritte zaehlen beide gleich (wie bei den Mitmach-Aufgaben).
function glaette(code) {
  return String(code ?? '')
    .replace(/[„“”«»]/g, '"')
    .replace(/[‚‘’]/g, "'")
}

for (const schritte of Object.values(SCHRITTE)) {
  for (const schritt of schritte) {
    if (schritt.art !== 'tippen') continue
    for (const check of schritt.checks) {
      const roh = check.pruefe
      check.pruefe = (wert) => roh(glaette(wert))
    }
  }
}

/** Die interaktiven Schritte einer Lektion — oder null (dann Lese-Modal). */
export function holeSchritte(lektionId) {
  return SCHRITTE[lektionId] || null
}

export const alleSchritte = SCHRITTE
