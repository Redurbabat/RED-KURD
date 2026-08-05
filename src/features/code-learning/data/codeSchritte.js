// Interaktive Schritte fuer Lektionen — der Stoff als kleine Aufgaben,
// eine pro Bildschirm (wie bei Mimo, aber mit Live-Vorschau).
//
// Zwei Schritt-Arten:
//   'wahl'  → Frage + Antwortkarten, eine ist richtig (richtig = Index)
//   'bauen' → Code aus Bausteinen zusammentippen; die Bausteine stehen
//             ABSICHTLICH in falscher Reihenfolge. loesung ist der fertige
//             Code; eine Live-Vorschau zeigt das Ergebnis sofort.
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

/** Die interaktiven Schritte einer Lektion — oder null (dann Lese-Modal). */
export function holeSchritte(lektionId) {
  return SCHRITTE[lektionId] || null
}

export const alleSchritte = SCHRITTE
