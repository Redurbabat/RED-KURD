// Der Baukasten der AI-Sprache: aus einzelnen Feldern wird ein fertiger,
// klarer Auftrag. Reine Funktionen — kein Speicher, keine Oberflaeche.
//
// Idee: Wer die Felder ausfuellt, schreibt automatisch einen guten Prompt.
// Die Pruefliste sagt live, welcher Baustein noch fehlt.

function sauber(wert) {
  return String(wert ?? '').trim()
}

/** Zeilen aus einem Textfeld: leere Zeilen fliegen raus. */
function zeilen(wert) {
  return sauber(wert)
    .split('\n')
    .map((z) => z.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

/** Als Aufzaehlung ausgeben — eine Zeile, ein Strich. */
function liste(wert) {
  return zeilen(wert)
    .map((z) => `- ${z}`)
    .join('\n')
}

// ===== Claude-Code-Auftrag =====

export const AUFTRAG_FELDER = [
  {
    id: 'ziel',
    label: 'Ziel',
    frage: 'Was soll am Ende da sein?',
    platzhalter: 'Die Buttons auf der Startseite sind auf dem Handy mindestens 44 Pixel hoch.',
    mehrzeilig: true,
  },
  {
    id: 'ort',
    label: 'Ort / erlaubte Dateien',
    frage: 'Wo darf gearbeitet werden?',
    platzhalter: 'src/features/settings/',
    mehrzeilig: true,
  },
  {
    id: 'verboten',
    label: 'Nicht erlaubt',
    frage: 'Was darf auf keinen Fall passieren? (eine Zeile pro Verbot)',
    platzhalter: 'Kursdaten löschen\nSpeicher-Schlüssel umbenennen\nneue Pakete installieren',
    mehrzeilig: true,
  },
  {
    id: 'pruefung',
    label: 'Prüfung',
    frage: 'Woran erkennt man, dass es fertig ist?',
    platzhalter: 'npm test und npm run build ausführen und die Ausgabe zeigen',
    mehrzeilig: true,
  },
  {
    id: 'arbeitsweise',
    label: 'Arbeitsweise',
    frage: 'Wie soll gearbeitet werden?',
    platzhalter: 'Kleine Schritte, nach jedem Schritt testen, bei Risiko stoppen und fragen.',
    mehrzeilig: true,
  },
]

/** Baut aus den Feldern den fertigen Auftrag zum Kopieren. */
export function baueAuftrag(felder = {}) {
  const teile = []
  if (sauber(felder.ziel)) teile.push(`ZIEL\n${sauber(felder.ziel)}`)
  if (sauber(felder.ort)) teile.push(`ERLAUBT (nur hier arbeiten)\n${liste(felder.ort)}`)
  if (sauber(felder.verboten)) teile.push(`NICHT ERLAUBT\n${liste(felder.verboten)}`)
  if (sauber(felder.pruefung)) teile.push(`PRÜFUNG\n${liste(felder.pruefung)}`)
  if (sauber(felder.arbeitsweise)) teile.push(`ARBEITSWEISE\n${sauber(felder.arbeitsweise)}`)
  return teile.join('\n\n')
}

/**
 * Die Pruefliste zum Auftrag — jeder Punkt sagt, warum er zaehlt.
 * @returns {Array<{id:string, text:string, ok:boolean}>}
 */
export function pruefeAuftrag(felder = {}) {
  const ziel = sauber(felder.ziel)
  return [
    {
      id: 'ziel',
      text: 'Das Ziel beschreibt den Zustand DANACH (mindestens 30 Zeichen)',
      ok: ziel.length >= 30,
    },
    {
      id: 'kein-besser',
      text: 'Kein leeres Wort wie „besser“ oder „schöner“ ohne Erklärung',
      ok: ziel.length > 0 && !/\b(besser|schöner|schoener|toller|optimieren)\b/i.test(ziel),
    },
    {
      id: 'ort',
      text: 'Der Ort ist genannt (Datei, Ordner oder Seite)',
      ok: zeilen(felder.ort).length >= 1,
    },
    {
      id: 'verboten',
      text: 'Mindestens ein Verbot steht da',
      ok: zeilen(felder.verboten).length >= 1,
    },
    {
      id: 'pruefung',
      text: 'Eine Prüfung ist verlangt (Test, Build oder Screenshot)',
      ok: zeilen(felder.pruefung).length >= 1,
    },
  ]
}

// ===== Bug-Report =====

export const BUG_FELDER = [
  {
    id: 'passiert',
    label: 'Was passiert?',
    frage: 'Beschreibe, was du siehst.',
    platzhalter: 'Nach dem Import steht mein XP-Stand auf 0.',
    mehrzeilig: true,
  },
  {
    id: 'erwartet',
    label: 'Was war erwartet?',
    frage: 'Was hättest du stattdessen erwartet?',
    platzhalter: 'Der XP-Stand aus der Sicherungsdatei.',
    mehrzeilig: true,
  },
  {
    id: 'nachstellen',
    label: 'Wie nachstellen?',
    frage: 'Schritt für Schritt — eine Zeile pro Schritt.',
    platzhalter: 'Export erstellen\nApp neu laden\nDatei importieren',
    mehrzeilig: true,
  },
  {
    id: 'geraet',
    label: 'Gerät und Browser',
    frage: 'Womit ist es passiert?',
    platzhalter: 'iPhone 13 Pro Max, Safari',
    mehrzeilig: false,
  },
  {
    id: 'meldung',
    label: 'Fehlermeldung',
    frage: 'Falls eine Meldung erschien: genau abschreiben.',
    platzhalter: 'TypeError: undefined is not a function',
    mehrzeilig: true,
  },
]

export function baueBugReport(felder = {}) {
  const teile = []
  if (sauber(felder.passiert)) teile.push(`WAS PASSIERT\n${sauber(felder.passiert)}`)
  if (sauber(felder.erwartet)) teile.push(`ERWARTET\n${sauber(felder.erwartet)}`)
  if (sauber(felder.nachstellen)) {
    const schritte = zeilen(felder.nachstellen)
      .map((z, i) => `${i + 1}. ${z}`)
      .join('\n')
    teile.push(`NACHSTELLEN\n${schritte}`)
  }
  if (sauber(felder.geraet)) teile.push(`GERÄT\n${sauber(felder.geraet)}`)
  if (sauber(felder.meldung)) teile.push(`FEHLERMELDUNG\n${sauber(felder.meldung)}`)
  return teile.join('\n\n')
}

export function pruefeBugReport(felder = {}) {
  return [
    { id: 'passiert', text: 'Was passiert, steht da', ok: sauber(felder.passiert).length >= 10 },
    { id: 'erwartet', text: 'Was erwartet war, steht da', ok: sauber(felder.erwartet).length >= 10 },
    {
      id: 'schritte',
      text: 'Mindestens zwei Schritte zum Nachstellen',
      ok: zeilen(felder.nachstellen).length >= 2,
    },
    { id: 'geraet', text: 'Gerät oder Browser ist genannt', ok: sauber(felder.geraet).length >= 3 },
  ]
}

// ===== Pull Request pruefen =====

/** Die Fragen, die vor jedem Merge zu beantworten sind. */
export const PR_CHECKLISTE = [
  { id: 'verstanden', text: 'Ich verstehe, was der PR ändert — in einem Satz erklärbar' },
  { id: 'ziel', text: 'Er macht genau das, was im Auftrag stand — nicht mehr' },
  { id: 'grenzen', text: 'Nur erlaubte Dateien wurden angefasst' },
  { id: 'verbote', text: 'Kein Verbot wurde gebrochen (nichts gelöscht, keine neuen Pakete)' },
  { id: 'tests', text: 'Tests und Build sind grün — die Ausgabe habe ich gesehen' },
  { id: 'neuertest', text: 'Für neues Verhalten gibt es einen neuen Test' },
  { id: 'speicher', text: 'Speicherformate und Lernstand sind unangetastet' },
  { id: 'handy', text: 'Auf dem Handy geprüft (oder Screenshot gesehen)' },
]

/**
 * Empfehlung aus den abgehakten Punkten. „tests“ und „verbote“ sind
 * Ausschlusskriterien — ohne sie wird nicht gemergt.
 * @returns {{mergen:boolean, text:string, offen:number}}
 */
export function pruefeMerge(abgehakt = {}) {
  const offen = PR_CHECKLISTE.filter((p) => !abgehakt[p.id])
  const hartOffen = offen.filter((p) => p.id === 'tests' || p.id === 'verbote')
  if (hartOffen.length) {
    return {
      mergen: false,
      offen: offen.length,
      text: 'Zurückgeben: Tests/Build oder die Verbote sind nicht geklärt.',
    }
  }
  if (offen.length === 0) {
    return { mergen: true, offen: 0, text: 'Mergen: alles geprüft.' }
  }
  return {
    mergen: false,
    offen: offen.length,
    text: `Noch nicht mergen — ${offen.length} ${offen.length === 1 ? 'Punkt ist' : 'Punkte sind'} offen.`,
  }
}
