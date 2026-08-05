// Lernpfade des Bereichs „Code lernen". Reine Daten, keine Logik —
// Symbole als Emoji sind hier erlaubt (wie in src/data/kurse.js),
// die Oberflaeche nutzt fuer Status-Zeichen echte Icons.
//
// WICHTIG: Status und Fortschritt stehen NICHT hier — sie werden aus dem
// gespeicherten Lernstand abgeleitet (codeProgressStore). Jede Lektion
// traegt ihren Inhalt: kurze Absaetze, ein Beispiel, ein Merksatz.

export const codeLearningPaths = [
  {
    id: 'html',
    title: 'HTML Grundlagen',
    icon: '🏗️',
    description: 'Lerne, wie Webseiten aufgebaut sind: Texte, Buttons, Bilder und Bereiche.',
    level: 'Anfänger',
    lessons: [
      {
        id: 'html-1',
        title: 'Was ist HTML?',
        durationMinutes: 8,
        inhalt: [
          'HTML ist die Sprache, in der jede Webseite aufgeschrieben ist. Sie beschreibt, WAS auf der Seite steht: eine Überschrift, ein Absatz, ein Bild, ein Button.',
          'HTML besteht aus Bausteinen, die man Elemente nennt. Ein Element hat meistens einen Anfang und ein Ende — dazwischen steht der Inhalt.',
          'Der Browser liest diese Bausteine von oben nach unten und malt daraus die Seite.',
        ],
        beispiel: '<h1>Meine erste Seite</h1>\n<p>Hallo! Das ist ein Absatz.</p>',
        merke: 'HTML beschreibt den Inhalt — wie es aussieht, kommt später mit CSS.',
      },
      {
        id: 'html-2',
        title: 'Überschriften und Texte',
        durationMinutes: 10,
        inhalt: [
          'Überschriften heißen h1 bis h6. h1 ist die wichtigste — jede Seite sollte genau eine haben. h2 sind Kapitel, h3 Unterkapitel.',
          'Normaler Text steht in einem p-Element (p wie „paragraph", Absatz). Der Browser macht zwischen Absätzen automatisch Abstand.',
          'Mit strong markierst du wichtige Wörter — sie werden fett und Screenreader betonen sie.',
        ],
        beispiel: '<h1>Kurdisch lernen</h1>\n<h2>Warum eigentlich?</h2>\n<p>Weil es <strong>Spaß</strong> macht.</p>',
        merke: 'Genau eine h1 pro Seite — danach h2, h3 in echter Reihenfolge.',
      },
      {
        id: 'html-3',
        title: 'Buttons und Links',
        durationMinutes: 12,
        inhalt: [
          'Ein Link (a-Element) bringt dich zu einer anderen Seite. Ein Button (button-Element) macht etwas auf DIESER Seite — speichern, öffnen, abschicken.',
          'Diese Regel ist wichtig: Wenn sich die Adresse ändert, nimm einen Link. Wenn etwas passiert, nimm einen Button.',
          'Beide kann man mit der Tastatur bedienen — deshalb niemals ein div als Button verkleiden.',
        ],
        beispiel: '<a href="/kurs">Zum Kurs</a>\n<button type="button">Speichern</button>',
        merke: 'Link = woandershin. Button = etwas tun. Nie ein div als Knopf.',
      },
      {
        id: 'html-4',
        title: 'Bilder und Alt-Texte',
        durationMinutes: 10,
        inhalt: [
          'Ein Bild kommt mit dem img-Element auf die Seite. src sagt, wo die Datei liegt.',
          'alt beschreibt das Bild in Worten. Diesen Text sehen Menschen, deren Browser das Bild nicht lädt — und hören Menschen, die einen Screenreader nutzen.',
          'Ist ein Bild nur Dekoration, bekommt es ein leeres alt="" — dann wird es vorgelesen übersprungen.',
        ],
        beispiel: '<img src="/bilder/newroz.jpg" alt="Newroz-Feuer bei Nacht" />',
        merke: 'Jedes Bild braucht ein alt — beschreibend oder bewusst leer.',
      },
      {
        id: 'html-6',
        title: 'Listen: geordnet und ungeordnet',
        durationMinutes: 10,
        inhalt: [
          'Eine ungeordnete Liste (ul) hat Punkte, eine geordnete (ol) hat Nummern. Jeder Eintrag ist ein li-Element.',
          'Listen sind ueberall: Navigationen, Zutaten, Lernkarten — fast jede Aufzaehlung auf einer Webseite ist in Wahrheit eine Liste.',
          'Screenreader sagen bei Listen an, wie viele Eintraege es gibt — noch ein Grund, echte Listen statt vieler Absaetze zu nutzen.',
        ],
        beispiel: '<ul>\n  <li>Silav</li>\n  <li>Spas</li>\n</ul>\n<ol>\n  <li>Erst lesen</li>\n  <li>Dann bauen</li>\n</ol>',
        merke: 'ul = Punkte, ol = Nummern, li = der Eintrag.',
      },
      {
        id: 'html-7',
        title: 'Formulare: Eingabe und Label',
        durationMinutes: 12,
        inhalt: [
          'Ein Formular sammelt Eingaben: input fuer eine Zeile, textarea fuer mehrere, button type="submit" zum Abschicken.',
          'Jede Eingabe braucht ein label — verbunden ueber for und id. Dann kann man aufs Label tippen und landet im Feld, und Screenreader wissen, was gemeint ist.',
          'Eingabefelder nie kleiner als 16 Pixel Schrift — sonst zoomt das iPhone in die Seite.',
        ],
        beispiel: '<label for="name">Dein Name</label>\n<input id="name" type="text" />\n<button type="submit">Absenden</button>',
        merke: 'Kein Eingabefeld ohne Label — for und id verbinden beide.',
      },
      {
        id: 'html-5',
        title: 'Bereiche: header, main, footer',
        durationMinutes: 12,
        inhalt: [
          'Große Seiten teilst du in benannte Bereiche: header (Kopf mit Logo und Navigation), main (der eigentliche Inhalt, genau einmal), footer (Fußzeile).',
          'nav umschließt die Navigation, section einen Themenabschnitt mit eigener Überschrift.',
          'Diese Namen helfen doppelt: Du findest dich im Code zurecht, und Screenreader können direkt zum Inhalt springen.',
        ],
        beispiel: '<header>Logo, Navigation</header>\n<main>Der Inhalt</main>\n<footer>Impressum</footer>',
        merke: 'Ein main pro Seite — header und footer rahmen es ein.',
      },
    ],
  },
  {
    id: 'css',
    title: 'CSS Design',
    icon: '🎨',
    description: 'Lerne Farben, Abstände, Layout, Mobile Design und Buttons.',
    level: 'Anfänger',
    lessons: [
      {
        id: 'css-1',
        title: 'Farben und Schrift',
        durationMinutes: 10,
        inhalt: [
          'CSS bestimmt, wie HTML aussieht. Eine CSS-Regel wählt Elemente aus (Selektor) und setzt Eigenschaften: Farbe, Größe, Schrift.',
          'color ist die Textfarbe, background die Fläche dahinter. font-size setzt die Schriftgröße — für Lesetext nie unter 16px.',
          'Farben schreibst du z. B. als Hex-Wert: #0ea5a8 ist das RED-KURD-Türkis.',
        ],
        beispiel: 'h1 {\n  color: #0ea5a8;\n  font-size: 2rem;\n}\np {\n  font-size: 16px;\n}',
        merke: 'Selektor wählt aus, Eigenschaften gestalten — Lesetext ab 16px.',
      },
      {
        id: 'css-2',
        title: 'Abstände: margin und padding',
        durationMinutes: 12,
        inhalt: [
          'padding ist der Innenabstand — Luft ZWISCHEN Rand und Inhalt eines Elements. margin ist der Außenabstand — Luft zu den Nachbarn.',
          'Eine Karte mit padding wirkt großzügig. Zwei Karten mit margin dazwischen kleben nicht aneinander.',
          'Merkbild: padding polstert innen wie eine Jacke, margin hält Abstand wie persönlicher Freiraum.',
        ],
        beispiel: '.karte {\n  padding: 16px;      /* innen */\n  margin-bottom: 12px; /* Abstand zur nächsten */\n}',
        merke: 'padding = innen, margin = außen.',
      },
      {
        id: 'css-3',
        title: 'Einen Button gestalten',
        durationMinutes: 10,
        inhalt: [
          'Ein guter Button hat: klare Farbe, lesbare Schrift, runde Ecken, genug Fläche zum Tippen — mindestens 44 Pixel hoch.',
          'cursor: pointer zeigt am Computer die Hand. Mit :active gibst du Rückmeldung beim Drücken.',
          'Der Text im Button sagt, was passiert: „Speichern" ist besser als „OK".',
        ],
        beispiel: '.knopf {\n  min-height: 44px;\n  padding: 12px 20px;\n  background: #ef5350;\n  color: white;\n  border-radius: 12px;\n}\n.knopf:active {\n  transform: translateY(2px);\n}',
        merke: 'Mindestens 44px hoch — Finger sind keine Mauszeiger.',
      },
      {
        id: 'css-4',
        title: 'Flexbox: Dinge nebeneinander',
        durationMinutes: 14,
        inhalt: [
          'display: flex legt Kinder eines Elements nebeneinander in eine Reihe. gap macht gleichmäßigen Abstand dazwischen — ohne margin-Tricks.',
          'align-items: center richtet sie senkrecht mittig aus, justify-content verteilt sie waagerecht.',
          'Fast jede Leiste in echten Apps — Kopfzeile, Navigation, Karte mit Bild und Text — ist eine Flexbox.',
        ],
        beispiel: '.zeile {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}',
        merke: 'flex + gap + align-items: center löst 90 % aller Reihen-Layouts.',
      },
      {
        id: 'css-5',
        title: 'Mobile zuerst: Media Queries',
        durationMinutes: 14,
        inhalt: [
          'Gestalte zuerst für das Handy: eine Spalte, große Buttons, alles untereinander. Das ist die Grundform.',
          'Mit einer Media Query legst du zusätzlich fest, was sich auf GROSSEN Bildschirmen ändert — zum Beispiel zwei Spalten.',
          'So bleibt die Handy-Ansicht immer der sichere Standard und der Desktop bekommt die Extras.',
        ],
        beispiel: '.raster {\n  display: grid;\n  grid-template-columns: 1fr;\n}\n@media (min-width: 720px) {\n  .raster {\n    grid-template-columns: 1fr 1fr;\n  }\n}',
        merke: 'Handy ist der Standard — der große Bildschirm ist der Sonderfall.',
      },
      {
        id: 'css-6',
        title: 'Grid: das Karten-Raster',
        durationMinutes: 14,
        inhalt: [
          'display: grid verteilt Kinder in ein Raster. grid-template-columns sagt, wie viele Spalten es gibt — 1fr 1fr heisst: zwei gleich breite.',
          'Zusammen mit einer Media Query wird daraus das wichtigste Layout-Muster: eine Spalte auf dem Handy, zwei auf dem Tablet.',
          'Genau so sind die Kartenraster in RED-KURD gebaut.',
        ],
        beispiel: '.raster {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n@media (min-width: 720px) {\n  .raster { grid-template-columns: 1fr 1fr; }\n}',
        merke: 'grid + 1fr-Spalten + gap = sauberes Kartenraster.',
      },
      {
        id: 'css-7',
        title: 'Übergänge: sanfte Bewegung',
        durationMinutes: 10,
        inhalt: [
          'transition macht Aenderungen weich: Statt hart umzuspringen, gleitet ein Button in 150 Millisekunden in seinen neuen Zustand.',
          'Uebergaenge gehoeren auf kleine Dinge — Farbe, Schatten, ein leichtes Absenken beim Druecken. Grosse Dauerbewegung lenkt nur ab.',
          'Wichtig fuer alle: Wer Animationen reduziert hat (prefers-reduced-motion), soll Ruhe bekommen — gute Apps respektieren das.',
        ],
        beispiel: '.knopf {\n  transition: transform 150ms ease;\n}\n.knopf:active {\n  transform: translateY(2px);\n}',
        merke: 'Kurz und dezent — Bewegung wuerzt, sie ist kein Hauptgericht.',
      },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript Basics',
    icon: '⚡',
    description: 'Lerne Klicks, Funktionen, Bedingungen, Listen und einfache App-Logik.',
    level: 'Anfänger',
    lessons: [
      {
        id: 'js-1',
        title: 'Was ist JavaScript?',
        durationMinutes: 8,
        inhalt: [
          'HTML ist der Inhalt, CSS das Aussehen — JavaScript ist das Verhalten. Es macht Seiten lebendig: reagiert auf Klicks, rechnet, ändert Inhalte.',
          'JavaScript läuft direkt im Browser. Jede Zeile ist eine Anweisung, die der Browser der Reihe nach ausführt.',
          'Auch RED-KURD ist fast komplett JavaScript.',
        ],
        beispiel: "console.log('Silav, Welt!')",
        merke: 'HTML = Inhalt, CSS = Aussehen, JavaScript = Verhalten.',
      },
      {
        id: 'js-2',
        title: 'Klick auf einen Button',
        durationMinutes: 12,
        inhalt: [
          'Mit addEventListener sagst du: „Wenn auf diesen Button geklickt wird, führe diese Funktion aus."',
          'Zuerst holst du dir das Element (querySelector), dann hängst du den Horcher an.',
          'Die Funktion dazwischen darf alles tun: Text ändern, etwas ausrechnen, eine Karte umdrehen.',
        ],
        beispiel: "const knopf = document.querySelector('#gruss')\nknopf.addEventListener('click', () => {\n  knopf.textContent = 'Silav!'\n})",
        merke: 'Element holen → Horcher anhängen → in der Funktion reagieren.',
      },
      {
        id: 'js-3',
        title: 'Variablen und Werte',
        durationMinutes: 10,
        inhalt: [
          'Eine Variable ist eine benannte Schublade für einen Wert. const für Dinge, die sich nicht mehr ändern, let für Dinge, die sich ändern.',
          'Werte haben Arten: Text ("Silav"), Zahlen (42), Wahr/Falsch (true, false).',
          'Gute Namen sagen, was drin ist: punkteHeute ist besser als x.',
        ],
        beispiel: "const name = 'Zilan'\nlet punkte = 0\npunkte = punkte + 10",
        merke: 'const zuerst — let nur, wenn sich der Wert wirklich ändert.',
      },
      {
        id: 'js-4',
        title: 'Wenn/dann: Bedingungen',
        durationMinutes: 12,
        inhalt: [
          'Mit if entscheidet dein Programm: „Wenn das stimmt, tu dies — sonst das."',
          'Vergleiche schreibst du mit === (ist gleich), > (größer), < (kleiner). Das doppelte Und && heißt „und beides".',
          'So entstehen Regeln: Ab 80 % ist die Prüfung bestanden.',
        ],
        beispiel: "if (prozent >= 80) {\n  console.log('Bestanden!')\n} else {\n  console.log('Nochmal üben.')\n}",
        merke: 'Immer === zum Vergleichen — ein einzelnes = weist zu.',
      },
      {
        id: 'js-5',
        title: 'Listen und Schleifen',
        durationMinutes: 14,
        inhalt: [
          'Eine Liste (Array) hält viele Werte in einer Reihenfolge: die Wörter einer Lektion, die Filme einer Watchlist.',
          'Mit for...of gehst du die Liste Stück für Stück durch. Mit .length weißt du, wie viele es sind.',
          'Viele Aufgaben sind nur: Liste durchgehen und für jedes Element etwas Kleines tun.',
        ],
        beispiel: "const woerter = ['Silav', 'Spas', 'Nan']\nfor (const wort of woerter) {\n  console.log(wort)\n}",
        merke: 'Array = geordnete Liste, for...of = jedes Element einmal.',
      },
      {
        id: 'js-6',
        title: 'Funktionen: Werkzeuge bauen',
        durationMinutes: 12,
        inhalt: [
          'Eine Funktion ist ein benanntes Werkzeug: Sie bekommt Eingaben (Parameter), tut etwas und gibt mit return ein Ergebnis zurueck.',
          'Einmal geschrieben, oft benutzt — statt denselben Code zu kopieren, rufst du die Funktion auf.',
          'Gute Funktionen tun EINE Sache und ihr Name sagt welche: durchschnitt(noten), begruesse(name).',
        ],
        beispiel: "function begruesse(name) {\n  return `Silav, ${name}!`\n}\nbegruesse('Zilan') // 'Silav, Zilan!'",
        merke: 'Eingabe -> Arbeit -> return Ergebnis. Eine Aufgabe pro Funktion.',
      },
      {
        id: 'js-7',
        title: 'Die Seite verändern (DOM)',
        durationMinutes: 14,
        inhalt: [
          'JavaScript kann die Seite umbauen, waehrend sie laeuft: Texte aendern, Klassen setzen, Elemente zeigen und verstecken.',
          'querySelector holt ein Element, textContent aendert seinen Text, classList.add/remove schaltet CSS-Klassen um.',
          'Das ist das Grundprinzip jeder App: Ein Klick aendert Daten, und die Seite zeigt den neuen Stand.',
        ],
        beispiel: "const anzeige = document.querySelector('#punkte')\nanzeige.textContent = '10 XP'\nanzeige.classList.add('geschafft')",
        merke: 'holen -> aendern: querySelector, dann textContent oder classList.',
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript verstehen',
    icon: '🧩',
    description: 'Lerne Typen, Interfaces und wie Apps sicherer werden.',
    level: 'Einsteiger',
    lessons: [
      {
        id: 'ts-1',
        title: 'Warum Typen helfen',
        durationMinutes: 8,
        inhalt: [
          'TypeScript ist JavaScript mit Sicherheitsgurt: Du schreibst dazu, welche ART von Wert erwartet wird.',
          'Der Vorteil: Fehler fallen beim Schreiben auf, nicht erst beim Nutzer. Rufst du eine Funktion falsch auf, meckert der Editor sofort.',
          'Der Browser bekommt am Ende normales JavaScript — die Typen sind nur für dich und deine Werkzeuge.',
        ],
        beispiel: 'function begruesse(name: string) {\n  return `Silav, ${name}!`\n}\nbegruesse(42) // Fehler: 42 ist kein Text',
        merke: 'Typen fangen Fehler, bevor sie jemand sieht.',
      },
      {
        id: 'ts-2',
        title: 'string, number, boolean',
        durationMinutes: 10,
        inhalt: [
          'Die drei Grundtypen: string ist Text, number ist eine Zahl, boolean ist wahr oder falsch.',
          'Den Typ schreibst du mit Doppelpunkt hinter den Namen. Meistens errät TypeScript ihn aber selbst aus dem Wert.',
          'Listen bekommen eckige Klammern: string[] ist eine Liste von Texten.',
        ],
        beispiel: 'const name: string = "Zilan"\nconst punkte: number = 120\nconst fertig: boolean = false\nconst woerter: string[] = ["Silav", "Spas"]',
        merke: 'Doppelpunkt + Typ — und string[] ist eine Liste von Texten.',
      },
      {
        id: 'ts-3',
        title: 'Interfaces: Form von Daten',
        durationMinutes: 12,
        inhalt: [
          'Ein Interface beschreibt die FORM eines Objekts: welche Felder es hat und welchen Typ jedes Feld trägt.',
          'Damit weiß jeder im Projekt: Eine Lektion hat immer id, title und durationMinutes — nichts fehlt, nichts ist falsch geschrieben.',
          'Ein Fragezeichen macht ein Feld optional.',
        ],
        beispiel: 'interface Lektion {\n  id: string\n  title: string\n  durationMinutes: number\n  beispiel?: string // optional\n}',
        merke: 'Ein Interface ist der Bauplan deiner Daten.',
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub verstehen',
    icon: '🗂️',
    description: 'Lerne Repository, Dateien, Änderungen, Commits und Pull Requests.',
    level: 'Einsteiger',
    lessons: [
      {
        id: 'github-1',
        title: 'Was ist ein Repository?',
        durationMinutes: 8,
        inhalt: [
          'Ein Repository (kurz: Repo) ist der Projektordner deiner App — mit eingebautem Gedächtnis. Jede gespeicherte Änderung bleibt für immer nachvollziehbar.',
          'RED-KURD ist genau so ein Repository: alle Dateien, die ganze Geschichte, jede Version.',
          'GitHub ist die Website, auf der Repositories liegen — dein Projekt hat dort ein Zuhause mit Adresse.',
        ],
        beispiel: 'github.com/Redurbabat/RED-KURD\n├─ src/        (der Code)\n├─ public/     (Bilder, Audio)\n└─ README.md   (die Beschreibung)',
        merke: 'Ein Repo ist ein Projektordner, der nichts vergisst.',
      },
      {
        id: 'github-2',
        title: 'Änderungen und Commits',
        durationMinutes: 10,
        inhalt: [
          'Ein Commit ist ein gespeicherter Schnappschuss: „Diese Dateien habe ich geändert, und darum." Die Nachricht dazu ist Pflicht und Gold wert.',
          'Kleine Commits mit klarer Nachricht sind wie ein gutes Tagebuch — du kannst jede Entscheidung später nachlesen.',
          'Gute Nachricht: „Buttons auf 44px vergrößert". Schlechte Nachricht: „Fixes".',
        ],
        beispiel: 'Aenderung machen → pruefen → committen:\n"Woerterbuch-Suche toleriert fehlende Sonderzeichen"',
        merke: 'Ein Commit = eine Änderung + ein Satz, warum.',
      },
      {
        id: 'github-3',
        title: 'Branches und Pull Requests',
        durationMinutes: 12,
        inhalt: [
          'Ein Branch ist ein Nebengleis: Du baust in Ruhe, ohne die Hauptversion (main) zu gefährden.',
          'Ein Pull Request (PR) sagt: „Mein Nebengleis ist fertig — bitte anschauen und übernehmen." Dort sieht man jede geänderte Zeile.',
          'RED-KURD arbeitet genau so: nie direkt auf main, immer über einen PR.',
        ],
        beispiel: 'main ───────●────────▶\n              \\\n  branch       ●──●──● → Pull Request → main',
        merke: 'Nie direkt auf main — bauen im Branch, übernehmen per PR.',
      },
    ],
  },
  {
    id: 'vscode',
    title: 'VS Code beherrschen',
    icon: '🛠️',
    description: 'Lerne den Editor kennen: Dateien, Suche, Terminal und nützliche Tricks.',
    level: 'Einsteiger',
    lessons: [
      {
        id: 'vscode-1',
        title: 'Oberfläche und Dateien',
        durationMinutes: 8,
        inhalt: [
          'VS Code ist der Editor, in dem Code geschrieben wird. Links der Datei-Baum, in der Mitte der Code, unten Meldungen.',
          'Mit Strg+P (Mac: Cmd+P) springst du zu jeder Datei, indem du ihren Namen tippst — schneller als jedes Klicken.',
          'Mehrere Dateien öffnen sich als Tabs nebeneinander, wie im Browser.',
        ],
        beispiel: 'Strg+P → "storage" → öffnet src/core/storage.js',
        merke: 'Strg+P und Dateinamen tippen — der schnellste Weg durch ein Projekt.',
      },
      {
        id: 'vscode-2',
        title: 'Suchen und Ersetzen',
        durationMinutes: 8,
        inhalt: [
          'Strg+F sucht in der offenen Datei. Strg+Shift+F sucht im GANZEN Projekt — so findest du jede Stelle, an der ein Wort vorkommt.',
          'Das ist die wichtigste Frage beim Lesen fremden Codes: „Wo wird das benutzt?"',
          'Ersetzen geht genauso — aber immer erst anschauen, was alles getroffen wird.',
        ],
        beispiel: 'Strg+Shift+F → "melden(" → zeigt jede Datei, die den Store benachrichtigt',
        merke: 'Projekt-weite Suche beantwortet: Wo kommt das her, wo wird es benutzt?',
      },
      {
        id: 'vscode-3',
        title: 'Das eingebaute Terminal',
        durationMinutes: 10,
        inhalt: [
          'Das Terminal (Strg+ö bzw. Ctrl+`) ist die Kommandozeile direkt im Editor. Hier startest du die App und die Tests.',
          'Die drei Befehle, die du bei RED-KURD brauchst: npm install (einmalig), npm run dev (App starten), npm test (prüfen).',
          'Rote Schrift ist keine Katastrophe — sie ist eine Fehlermeldung, und die sagt fast immer, WO das Problem liegt.',
        ],
        beispiel: 'npm install     # Pakete holen\nnpm run dev     # App auf localhost:5173\nnpm test        # alle Pruefungen',
        merke: 'Fehlermeldungen lesen lohnt sich — sie zeigen Datei und Zeile.',
      },
    ],
  },
  {
    id: 'mini-projekte',
    title: 'Mini-Projekte',
    icon: '🚀',
    description: 'Baue kleine Dinge wie Filmkarte, Notenrechner, Button oder mobile Navigation.',
    level: 'Praxis',
    lessons: [
      {
        id: 'mini-1',
        title: 'Eine Filmkarte bauen',
        durationMinutes: 20,
        inhalt: [
          'Dein erstes kleines Werkstück: eine Karte mit Filmtitel, Bild, Bewertung und einem Knopf — nur mit HTML und CSS.',
          'Plan: erst die HTML-Bausteine (Bild, Überschrift, Bewertungszeile, Button), dann eine CSS-Klasse für die Karte mit padding, Rand und runden Ecken.',
          'Wenn es fertig ist, hast du das Muster von 80 % aller App-Oberflächen verstanden: Karten.',
        ],
        beispiel: '<article class="filmkarte">\n  <img src="film.jpg" alt="Filmplakat" />\n  <h3>Der Film</h3>\n  <p>★ 8,5</p>\n  <button type="button">Merken</button>\n</article>',
        merke: 'Karten sind das Grundmuster moderner Apps — einmal bauen, überall nutzen.',
      },
      {
        id: 'mini-2',
        title: 'Noten-Durchschnitt berechnen',
        durationMinutes: 20,
        inhalt: [
          'Ein Programm, das aus einer Liste von Noten den Durchschnitt macht: alle zusammenzählen, durch die Anzahl teilen.',
          'Der wichtige Randfall: Was passiert bei einer LEEREN Liste? Teilen durch null geht schief — gib dann einfach 0 zurück.',
          'So denkst du wie eine Programmiererin: erst der normale Fall, dann die Randfälle.',
        ],
        beispiel: 'function durchschnitt(noten) {\n  if (noten.length === 0) return 0\n  let summe = 0\n  for (const note of noten) summe += note\n  return summe / noten.length\n}',
        merke: 'Randfälle zuerst absichern — leere Liste, fehlender Wert.',
      },
      {
        id: 'mini-3',
        title: 'Mobile Navigation bauen',
        durationMinutes: 25,
        inhalt: [
          'Eine Leiste mit fünf Bereichen, die unten am Handy klebt — wie in RED-KURD selbst.',
          'Die Zutaten kennst du schon alle: nav-Element, Flexbox für die Reihe, position: fixed für das Kleben, 44px-Mindesthöhe für die Finger.',
          'Extra-Punkt: padding-bottom mit env(safe-area-inset-bottom), damit die Leiste nicht mit dem Home-Balken des iPhones kollidiert.',
        ],
        beispiel: '.untennav {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  display: flex;\n  padding-bottom: env(safe-area-inset-bottom);\n}\n.untennav button { flex: 1; min-height: 44px; }',
        merke: 'fixed + flex + 44px + safe-area = echte App-Navigation.',
      },
    ],
  },
]

/** Der Pfad zu einer Id — oder null, wenn es ihn nicht gibt. */
export function holeCodePfad(id) {
  return codeLearningPaths.find((pfad) => pfad.id === id) || null
}
