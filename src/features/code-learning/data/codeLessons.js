// Lernpfade des Bereichs „Code lernen". Reine Daten, keine Logik —
// Symbole als Emoji sind hier erlaubt (wie in src/data/kurse.js),
// die Oberflaeche nutzt fuer Status-Zeichen echte Icons.
//
// Status je Lektion: 'done' | 'current' | 'open' | 'locked'

export const codeLearningPaths = [
  {
    id: 'html',
    title: 'HTML Grundlagen',
    icon: '🏗️',
    description: 'Lerne, wie Webseiten aufgebaut sind: Texte, Buttons, Bilder und Bereiche.',
    level: 'Anfänger',
    progress: 20,
    lessons: [
      { id: 'html-1', title: 'Was ist HTML?', durationMinutes: 8, status: 'done' },
      { id: 'html-2', title: 'Überschriften und Texte', durationMinutes: 10, status: 'current' },
      { id: 'html-3', title: 'Buttons und Links', durationMinutes: 12, status: 'open' },
      { id: 'html-4', title: 'Bilder und Alt-Texte', durationMinutes: 10, status: 'locked' },
      { id: 'html-5', title: 'Bereiche: header, main, footer', durationMinutes: 12, status: 'locked' },
    ],
  },
  {
    id: 'css',
    title: 'CSS Design',
    icon: '🎨',
    description: 'Lerne Farben, Abstände, Layout, Mobile Design und Buttons.',
    level: 'Anfänger',
    progress: 10,
    lessons: [
      { id: 'css-1', title: 'Farben und Schrift', durationMinutes: 10, status: 'done' },
      { id: 'css-2', title: 'Abstände: margin und padding', durationMinutes: 12, status: 'current' },
      { id: 'css-3', title: 'Einen Button gestalten', durationMinutes: 10, status: 'open' },
      { id: 'css-4', title: 'Flexbox: Dinge nebeneinander', durationMinutes: 14, status: 'locked' },
      { id: 'css-5', title: 'Mobile zuerst: Media Queries', durationMinutes: 14, status: 'locked' },
    ],
  },
  {
    id: 'javascript',
    title: 'JavaScript Basics',
    icon: '⚡',
    description: 'Lerne Klicks, Funktionen, Bedingungen, Listen und einfache App-Logik.',
    level: 'Anfänger',
    progress: 0,
    lessons: [
      { id: 'js-1', title: 'Was ist JavaScript?', durationMinutes: 8, status: 'current' },
      { id: 'js-2', title: 'Klick auf einen Button', durationMinutes: 12, status: 'open' },
      { id: 'js-3', title: 'Variablen und Werte', durationMinutes: 10, status: 'locked' },
      { id: 'js-4', title: 'Wenn/dann: Bedingungen', durationMinutes: 12, status: 'locked' },
      { id: 'js-5', title: 'Listen und Schleifen', durationMinutes: 14, status: 'locked' },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript verstehen',
    icon: '🧩',
    description: 'Lerne Typen, Interfaces und wie Apps sicherer werden.',
    level: 'Einsteiger',
    progress: 0,
    lessons: [
      { id: 'ts-1', title: 'Warum Typen helfen', durationMinutes: 8, status: 'open' },
      { id: 'ts-2', title: 'string, number, boolean', durationMinutes: 10, status: 'locked' },
      { id: 'ts-3', title: 'Interfaces: Form von Daten', durationMinutes: 12, status: 'locked' },
    ],
  },
  {
    id: 'github',
    title: 'GitHub verstehen',
    icon: '🗂️',
    description: 'Lerne Repository, Dateien, Änderungen, Commits und Pull Requests.',
    level: 'Einsteiger',
    progress: 0,
    lessons: [
      { id: 'github-1', title: 'Was ist ein Repository?', durationMinutes: 8, status: 'open' },
      { id: 'github-2', title: 'Änderungen und Commits', durationMinutes: 10, status: 'locked' },
      { id: 'github-3', title: 'Branches und Pull Requests', durationMinutes: 12, status: 'locked' },
    ],
  },
  {
    id: 'vscode',
    title: 'VS Code beherrschen',
    icon: '🛠️',
    description: 'Lerne den Editor kennen: Dateien, Suche, Terminal und nützliche Tricks.',
    level: 'Einsteiger',
    progress: 0,
    lessons: [
      { id: 'vscode-1', title: 'Oberfläche und Dateien', durationMinutes: 8, status: 'open' },
      { id: 'vscode-2', title: 'Suchen und Ersetzen', durationMinutes: 8, status: 'locked' },
      { id: 'vscode-3', title: 'Das eingebaute Terminal', durationMinutes: 10, status: 'locked' },
    ],
  },
  {
    id: 'mini-projekte',
    title: 'Mini-Projekte',
    icon: '🚀',
    description: 'Baue kleine Dinge wie Filmkarte, Notenrechner, Button oder mobile Navigation.',
    level: 'Praxis',
    progress: 0,
    lessons: [
      { id: 'mini-1', title: 'Eine Filmkarte bauen', durationMinutes: 20, status: 'open' },
      { id: 'mini-2', title: 'Noten-Durchschnitt berechnen', durationMinutes: 20, status: 'locked' },
      { id: 'mini-3', title: 'Mobile Navigation bauen', durationMinutes: 25, status: 'locked' },
    ],
  },
]

/** Der Pfad zu einer Id — oder null, wenn es ihn nicht gibt. */
export function holeCodePfad(id) {
  return codeLearningPaths.find((pfad) => pfad.id === id) || null
}

/** Die naechste offene Lektion je Pfad — fuer „Heute lernen". */
export function naechsteLektionen(anzahl = 3) {
  const aus = []
  for (const pfad of codeLearningPaths) {
    const lektion = pfad.lessons.find((l) => l.status === 'current' || l.status === 'open')
    if (lektion) aus.push({ pfad, lektion })
    if (aus.length === anzahl) break
  }
  return aus
}
