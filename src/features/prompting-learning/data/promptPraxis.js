// Mitmach-Aufgaben „AI-Sprache": einen echten Auftrag formulieren —
// die Pruefliste prueft, ob die Bausteine eines guten Prompts drin sind.

export const promptPraxisAufgaben = [
  {
    id: 'plpraxis-auftrag',
    art: 'text',
    title: 'Einen kompletten Auftrag schreiben',
    topic: 'Claude Code',
    estimatedMinutes: 12,
    description: 'Ziel, Ort, Verbote, Prüfung — alles in einem Auftrag.',
    auftrag:
      'Schreibe einen vollständigen Auftrag für eine Code-KI (z. B. für einen dunklen Modus in einer App). Die Prüfliste zeigt dir, welche Bausteine noch fehlen.',
    startCode: '',
    tipp: 'Nenne ein Ziel, den Ordner oder die Datei, mindestens ein Verbot („nicht …“) und wie geprüft wird (z. B. npm test).',
    checks: [
      { id: 'laenge', text: 'Mindestens 150 Zeichen — ein echter Auftrag, kein Zuruf', pruefe: (t) => String(t).trim().length >= 150 },
      { id: 'ort', text: 'Der Ort ist benannt (eine Datei, ein Ordner oder eine Seite)', pruefe: (t) => /(datei|ordner|seite|src\/|\.jsx?|\.css)/i.test(t) },
      { id: 'verbot', text: 'Es gibt mindestens ein Verbot („nicht“, „kein“, „verboten“)', pruefe: (t) => /(nicht |kein|verboten|niemals)/i.test(t) },
      { id: 'pruefung', text: 'Die Prüfung ist beschrieben (Test, Build oder Screenshot)', pruefe: (t) => /(npm test|npm run|test|build|screenshot|prüf)/i.test(t) },
    ],
    musterloesung:
      'Ziel: Baue einen dunklen Modus in die Einstellungen. Ort: nur der Ordner src/features/settings und die Datei tokens.css. Verboten: keine neuen Pakete, nichts löschen, andere Seiten nicht anfassen. Prüfung: npm test und npm run build ausführen und mir einen Screenshot der Einstellungen zeigen.',
  },
  {
    id: 'plpraxis-bugreport',
    art: 'text',
    title: 'Einen Bug-Report schreiben',
    topic: 'Fehler melden',
    estimatedMinutes: 10,
    description: 'Passiert / Erwartet / Nachstellen — vollständig.',
    auftrag:
      'Beschreibe einen Fehler so, dass jemand sofort damit arbeiten kann. Die Prüfliste achtet auf die drei Pflichtteile und das Gerät.',
    startCode: 'Was passiert: \nWas war erwartet: \nSchritte zum Nachstellen: \nGerät/Browser: ',
    tipp: 'Nutze die vier vorbereiteten Zeilen und fülle jede aus.',
    checks: [
      { id: 'passiert', text: '„Was passiert“ ist ausgefüllt', pruefe: (t) => /was passiert:\s*\S+/i.test(t) },
      { id: 'erwartet', text: '„Was war erwartet“ ist ausgefüllt', pruefe: (t) => /erwartet:\s*\S+/i.test(t) },
      { id: 'schritte', text: 'Die Schritte zum Nachstellen stehen drin', pruefe: (t) => /nachstellen:\s*\S+/i.test(t) },
      { id: 'geraet', text: 'Gerät oder Browser ist genannt', pruefe: (t) => /(gerät|browser):\s*\S+|iphone|safari|chrome|android/i.test(t) },
    ],
    musterloesung:
      'Was passiert: Nach dem Import zeigt die App 0 XP.\nWas war erwartet: Der XP-Stand aus der Sicherungsdatei.\nSchritte zum Nachstellen: 1. Export erstellen 2. App neu laden 3. Datei importieren.\nGerät/Browser: iPhone 13, Safari.',
  },
  {
    id: 'plpraxis-verbessern',
    art: 'text',
    title: 'Einen schlechten Prompt retten',
    topic: 'Grundlagen',
    estimatedMinutes: 10,
    description: 'Aus „Mach die App schöner“ wird ein brauchbarer Auftrag.',
    auftrag:
      'Der schlechte Prompt lautet: „Mach die App schöner und schneller.“ Schreibe ihn neu — mit konkretem Ziel, benannter Seite und einer messbaren Prüfung. Das Wort „schöner“ darf nicht mehr vorkommen.',
    startCode: '',
    tipp: 'Was genau soll anders aussehen? Wo? Woran erkennst du, dass es geklappt hat?',
    checks: [
      { id: 'laenge', text: 'Mindestens 120 Zeichen', pruefe: (t) => String(t).trim().length >= 120 },
      { id: 'ohne-schoener', text: 'Das Wort „schöner“ kommt nicht mehr vor', pruefe: (t) => !/schöner/i.test(t) && String(t).trim().length > 0 },
      { id: 'ort', text: 'Eine Seite oder ein Bereich ist benannt', pruefe: (t) => /(startseite|einstellungen|kursseite|heute|seite|bereich)/i.test(t) },
      { id: 'messbar', text: 'Eine messbare Prüfung ist drin (Zahl, Test oder Screenshot)', pruefe: (t) => /(\d|test|screenshot|prüf)/i.test(t) },
    ],
    musterloesung:
      'Auf der Startseite sollen die drei Karten gleich hoch sein und auf dem Handy untereinander stehen. Die Buttons bekommen mindestens 44 Pixel Höhe. Nutze nur die vorhandenen Farben. Prüfung: Screenshot der Handy-Ansicht bei 428 Pixel Breite und npm run build ohne Fehler.',
  },
]
