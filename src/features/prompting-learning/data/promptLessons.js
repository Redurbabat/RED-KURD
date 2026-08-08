// Lektionen des Bereichs „AI-Sprache": klare Auftraege an ChatGPT, Claude
// und Claude Code. Reine Daten, keine Logik.
//
// WICHTIG: Status und Fortschritt stehen NICHT hier — sie werden aus dem
// gespeicherten Lernstand abgeleitet (promptProgressStore). Jede Lektion
// traegt Inhalt, ein Beispiel und einen Merksatz.

export const promptLessons = [
  {
    id: 'prompt-was',
    title: 'Was ist ein Prompt?',
    description: 'Ein Prompt ist eine klare Arbeitsanweisung für eine KI.',
    durationMinutes: 6,
    inhalt: [
      'Ein Prompt ist das, was du einer KI schreibst — deine Arbeitsanweisung. Die KI kann nicht raten, was du meinst: Sie kennt nur deine Worte.',
      'Gute Prompts sind wie gute Aufträge an einen Handwerker: Was soll entstehen? Wo? Was darf nicht passieren? Woran erkennt man, dass es fertig ist?',
      'Die gute Nachricht: Prompts schreiben kann man lernen wie eine Sprache. Genau das machst du hier.',
    ],
    beispiel: 'Schwach: "Hilf mir mit meiner App."\nStark: "Meine Lern-App zeigt auf dem Handy die Buttons zu klein. Mach alle Buttons mindestens 44 Pixel hoch. Ändere nur CSS-Dateien."',
    merke: 'Die KI liest nur deine Worte — nicht deine Gedanken.',
  },
  {
    id: 'prompt-gut-schlecht',
    title: 'Guter Prompt vs. schlechter Prompt',
    description: 'Lerne, warum „Mach besser“ schlecht ist und klare Ziele besser sind.',
    durationMinutes: 8,
    inhalt: [
      '„Mach die App besser" ist ein schlechter Prompt: Die KI muss raten, was „besser" heißt — und rät oft falsch.',
      'Ein guter Prompt hat vier Zutaten: das ZIEL (was soll da sein), den ORT (welche Seite, welche Datei), die GRENZEN (was bleibt unangetastet) und die PRÜFUNG (woran erkennt man Erfolg).',
      'Faustregel: Wenn ein Fremder deinen Auftrag lesen und ohne Rückfrage erledigen könnte, ist er gut.',
    ],
    beispiel: 'Schlecht: "Mach die Startseite schöner."\nGut: "Auf der Startseite sollen die drei Karten gleich hoch sein und auf dem Handy untereinander stehen. Nutze die vorhandenen Farben. Ändere nur die Startseiten-Dateien."',
    merke: 'Ziel + Ort + Grenzen + Prüfung = guter Prompt.',
  },
  {
    id: 'prompt-ziel',
    title: 'Ziel klar beschreiben',
    description: 'Sage, was am Ende da sein soll — nicht nur, was dich stört.',
    durationMinutes: 8,
    inhalt: [
      'Beschreibe den ZUSTAND DANACH, nicht nur das Problem. „Der Text ist zu klein" sagt, was stört — „Der Text soll mindestens 16 Pixel groß sein" sagt, was da sein soll.',
      'Zahlen und Namen helfen enorm: Seitenname, Knopf-Beschriftung, Pixelwerte, Beispieltexte.',
      'Wenn du das Ergebnis vor dir siehst, beschreibe genau dieses Bild.',
    ],
    beispiel: 'Statt: "Das Wörterbuch nervt."\nBesser: "Wenn ich im Wörterbuch \'cay\' tippe, soll auch \'çay\' gefunden werden — Sonderzeichen sollen keine Rolle spielen."',
    merke: 'Beschreibe das Danach — nicht nur das Ärgernis.',
  },
  {
    id: 'prompt-grenzen',
    title: 'Grenzen setzen',
    description: 'Benenne, welche Dateien und Bereiche angefasst werden dürfen.',
    durationMinutes: 8,
    inhalt: [
      'Ohne Grenzen „verbessert" eine Code-KI gern das halbe Projekt mit. Sage deshalb, WO gearbeitet werden darf: welche Seite, welcher Ordner, welche Dateien.',
      'Gute Grenzen klingen so: „Ändere nur den Einstellungs-Bereich", „Fasse den Speicher-Code nicht an", „Keine neuen Pakete installieren".',
      'Grenzen sind kein Misstrauen — sie sind der Bauzaun um die Baustelle.',
    ],
    beispiel: '"Baue den Dunkelmodus-Schalter in die Einstellungen ein.\nErlaubt: src/features/settings/.\nNicht anfassen: Speicher-Logik, Kursdaten, alle anderen Seiten."',
    merke: 'Sag immer, wo gebaut werden darf — und wo nicht.',
  },
  {
    id: 'prompt-verboten',
    title: '„Nicht erlaubt“ definieren',
    description: 'Was auf keinen Fall passieren darf: löschen, umbenennen, neu bauen.',
    durationMinutes: 6,
    inhalt: [
      'Manche Schäden sind schwer rückgängig zu machen. Genau die gehören als Verbote in jeden größeren Auftrag.',
      'Die Klassiker: nichts löschen, keine Dateien umbenennen, kein „alles neu schreiben", keine neuen Abhängigkeiten, Speicherformate nicht ändern.',
      'Ein Verbot pro Zeile, klar formuliert — die KI hält sich daran, wenn du es hinschreibst.',
    ],
    beispiel: 'Nicht erlaubt:\n- bestehende Kurse oder Daten löschen\n- Speicher-Schlüssel umbenennen\n- neue Pakete installieren\n- das Design komplett ersetzen',
    merke: 'Was unumkehrbar wäre, gehört auf die Verbotsliste.',
  },
  {
    id: 'prompt-tests',
    title: 'Tests verlangen',
    description: 'Verlange, dass die KI ihre Arbeit prüft und dir das Ergebnis zeigt.',
    durationMinutes: 8,
    inhalt: [
      '„Fertig" ist ein Gefühl — ein bestandener Test ist ein Beweis. Verlange beides: dass die KI prüft UND dir das Ergebnis zeigt.',
      'Bei Code heißt das: „Führe npm test und npm run build aus und zeig mir die Ausgabe." Bei Design: „Zeig mir einen Screenshot der Handy-Ansicht."',
      'Extra stark: Verlange einen NEUEN Test für das neue Verhalten — dann bleibt es auch in Zukunft geschützt.',
    ],
    beispiel: '"Am Ende: npm test und npm run build ausführen und die letzten Zeilen zeigen. Schreibe einen Test, der prüft, dass der neue Schalter gespeichert wird."',
    merke: 'Kein „müsste gehen" — Befehle laufen lassen, Ergebnis zeigen.',
  },
  {
    id: 'prompt-bugreport',
    title: 'Bug-Report schreiben',
    description: 'Beschreibe, was passiert, was erwartet war und wie man es nachstellt.',
    durationMinutes: 10,
    inhalt: [
      'Ein guter Fehlerbericht hat drei Teile: Was PASSIERT? Was war ERWARTET? Wie kann man es NACHSTELLEN (Schritt für Schritt)?',
      'Dazu das Umfeld: Gerät, Browser, und die genaue Fehlermeldung — abgeschrieben oder als Screenshot.',
      'Mit so einem Bericht findet jede KI (und jeder Mensch) den Fehler zehnmal schneller.',
    ],
    beispiel: 'Was passiert: Nach dem Import ist mein XP-Stand 0.\nErwartet: Der XP-Stand aus der Datei.\nNachstellen: 1. Export erstellen 2. App neu laden 3. Datei importieren.\nGerät: iPhone 13, Safari.',
    merke: 'Passiert / Erwartet / Nachstellen — mehr braucht ein guter Report nicht.',
  },
  {
    id: 'prompt-design',
    title: 'Design-Prompt schreiben',
    description: 'Erkläre Farben, Layout, Buttons, Mobile und Stil klar.',
    durationMinutes: 10,
    inhalt: [
      '„Schön" ist Geschmackssache — beschreib stattdessen Entscheidungen: Welche Farben? Wie angeordnet? Wie groß? Für welches Gerät zuerst?',
      'Nenne Vorbilder ruhig beim Namen: „wie bei Duolingo, aber ruhiger", „Karten wie im Abenteuer-Modus".',
      'Und sage, was das Design NICHT sein soll: nicht kindisch, nicht überladen, nicht zu bunt.',
    ],
    beispiel: '"Baue die Übersicht als Karten: eine Karte pro Kurs, Titel + Fortschrittsbalken + Starten-Knopf. Handy: untereinander. Farben aus tokens.css. Modern und ruhig — nicht verspielt."',
    merke: 'Beschreibe Entscheidungen, nicht Gefühle.',
  },
  {
    id: 'prompt-kontext',
    title: 'Kontext mitgeben',
    description: 'Die KI kennt dein Projekt nicht — außer du erzählst es ihr.',
    durationMinutes: 8,
    inhalt: [
      'Eine KI weiß nichts über dein Projekt, deine Nutzer oder deine Regeln — außer, du schreibst es in den Auftrag. Guter Kontext spart zehn Rückfragen.',
      'Nützlicher Kontext: Was ist die App? Für wen? Welche Regeln gelten (z. B. „Deutsch ist die Bediensprache“, „keine neuen Pakete“)? Was wurde schon probiert?',
      'Bei RED-KURD übernimmt die Datei CLAUDE.md genau diese Rolle: Sie gibt jeder Arbeitssitzung dieselben Grundregeln mit.',
    ],
    beispiel: 'Kontext: RED-KURD ist eine lokale Lern-App für Deutschsprachige, Haupt-Zielgerät iPhone. Regeln: Deutsch als UI-Sprache, keine neuen Pakete, Lernstand nie gefährden. Aufgabe: …',
    merke: 'Erst der Kontext, dann die Aufgabe — die KI liest nur, was da steht.',
  },
  {
    id: 'prompt-claude-auftrag',
    title: 'Claude-Code-Auftrag schreiben',
    description: 'Ziel, Grenzen, Verbote und Tests — ein kompletter sicherer Auftrag.',
    durationMinutes: 12,
    inhalt: [
      'Jetzt alles zusammen. Ein kompletter Claude-Code-Auftrag hat fünf Blöcke: ZIEL, ORT/erlaubte Dateien, VERBOTE, PRÜFUNG und — bei größeren Sachen — die REIHENFOLGE der Schritte.',
      'Dazu ein Satz zur Arbeitsweise: klein arbeiten, nach jedem Schritt testen, bei Risiko stoppen und fragen.',
      'Genau so ein Auftrag hat diese App heute Nacht umgebaut — du kannst das jetzt auch.',
    ],
    beispiel: 'Ziel: Fehlerbuch im Code-Bereich — Einträge mit Titel, Fehler, Lösung.\nErlaubt: src/features/code-learning/.\nVerboten: Sprachbereich anfassen, Pakete installieren, Daten löschen.\nPrüfung: npm test, npm run build, Screenshot Handy-Ansicht.\nArbeitsweise: kleine Schritte, bei Risiko stoppen und melden.',
    merke: 'Ziel · Erlaubt · Verboten · Prüfung · Arbeitsweise — fertig ist der Auftrag.',
  },
]
