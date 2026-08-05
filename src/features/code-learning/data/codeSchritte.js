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
