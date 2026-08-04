// Lektionen des Bereichs „AI-Sprache": klare Auftraege an ChatGPT, Claude
// und Claude Code. Reine Daten, keine Logik.
//
// Status je Lektion: 'done' | 'current' | 'open' | 'locked'

export const promptLessons = [
  {
    id: 'prompt-was',
    title: 'Was ist ein Prompt?',
    description: 'Ein Prompt ist eine klare Arbeitsanweisung für eine KI.',
    durationMinutes: 6,
    status: 'current',
  },
  {
    id: 'prompt-gut-schlecht',
    title: 'Guter Prompt vs. schlechter Prompt',
    description: 'Lerne, warum „Mach besser“ schlecht ist und klare Ziele besser sind.',
    durationMinutes: 8,
    status: 'open',
  },
  {
    id: 'prompt-ziel',
    title: 'Ziel klar beschreiben',
    description: 'Sage, was am Ende da sein soll — nicht nur, was dich stört.',
    durationMinutes: 8,
    status: 'open',
  },
  {
    id: 'prompt-grenzen',
    title: 'Grenzen setzen',
    description: 'Benenne, welche Dateien und Bereiche angefasst werden dürfen.',
    durationMinutes: 8,
    status: 'locked',
  },
  {
    id: 'prompt-verboten',
    title: '„Nicht erlaubt“ definieren',
    description: 'Was auf keinen Fall passieren darf: löschen, umbenennen, neu bauen.',
    durationMinutes: 6,
    status: 'locked',
  },
  {
    id: 'prompt-tests',
    title: 'Tests verlangen',
    description: 'Verlange, dass die KI ihre Arbeit prüft und dir das Ergebnis zeigt.',
    durationMinutes: 8,
    status: 'locked',
  },
  {
    id: 'prompt-bugreport',
    title: 'Bug-Report schreiben',
    description: 'Beschreibe, was passiert, was erwartet war und wie man es nachstellt.',
    durationMinutes: 10,
    status: 'locked',
  },
  {
    id: 'prompt-design',
    title: 'Design-Prompt schreiben',
    description: 'Erkläre Farben, Layout, Buttons, Mobile und Stil klar.',
    durationMinutes: 10,
    status: 'locked',
  },
  {
    id: 'prompt-claude-auftrag',
    title: 'Claude-Code-Auftrag schreiben',
    description: 'Ziel, Grenzen, Verbote und Tests — ein kompletter sicherer Auftrag.',
    durationMinutes: 12,
    status: 'locked',
  },
]

/** Die naechste offene Lektion — fuer „Heute lernen". */
export function naechstePromptLektion() {
  return promptLessons.find((l) => l.status === 'current' || l.status === 'open') || null
}
