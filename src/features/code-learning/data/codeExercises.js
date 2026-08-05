// Uebungen des Bereichs „Code lernen". Reine Daten — spaeter werden sie
// interaktiv, heute beschreiben sie klar, was zu tun ist.

export const codeExercises = [
  {
    id: 'uebung-filmkarte',
    title: 'Filmkarte bauen',
    topic: 'HTML & CSS',
    difficulty: 'Anfänger',
    estimatedMinutes: 20,
    description: 'Eine kleine Karte mit Filmtitel, Bild, Bewertung und einem Knopf.',
    task: 'Baue eine Karte mit Überschrift, Bild, einer Zeile „★ 8,5“ und einem Button „Merken“. Nutze eine eigene CSS-Klasse für die Karte.',
  },
  {
    id: 'uebung-roter-button',
    title: 'Roter Button',
    topic: 'CSS',
    difficulty: 'Anfänger',
    estimatedMinutes: 10,
    description: 'Ein Button, der gut aussieht und sich gedrückt anfühlt.',
    task: 'Gestalte einen Button: rote Fläche, weiße Schrift, runde Ecken, mindestens 44 px hoch. Beim Drücken soll er sich leicht absenken (:active).',
  },
  {
    id: 'uebung-mobile-navigation',
    title: 'Mobile Navigation',
    topic: 'HTML & CSS',
    difficulty: 'Mittel',
    estimatedMinutes: 25,
    description: 'Eine Leiste mit fünf Bereichen, die unten am Handy klebt.',
    task: 'Baue eine Bottom-Navigation mit fünf Knöpfen (Icon + Text). Sie bleibt unten fixiert und jeder Knopf ist mindestens 44 × 44 px groß.',
  },
  {
    id: 'uebung-notendurchschnitt',
    title: 'Noten-Durchschnitt berechnen',
    topic: 'JavaScript',
    difficulty: 'Anfänger',
    estimatedMinutes: 15,
    description: 'Aus einer Liste von Noten den Durchschnitt ausrechnen.',
    task: 'Schreibe eine Funktion durchschnitt(noten), die aus [2, 3, 1] den Wert 2 macht. Eine leere Liste soll 0 ergeben, nicht abstürzen.',
  },
  {
    id: 'uebung-watchlist-karte',
    title: 'Watchlist-Karte',
    topic: 'JavaScript',
    difficulty: 'Mittel',
    estimatedMinutes: 25,
    description: 'Ein Klick auf „Merken“ ändert den Zustand der Karte.',
    task: 'Baue eine Filmkarte mit einem „Merken“-Knopf. Ein Klick wechselt zwischen „Merken“ und „Gemerkt ✓“ und ändert die Farbe des Knopfs.',
  },
  {
    id: 'uebung-claude-prompt',
    title: 'Guter Claude-Code-Prompt',
    topic: 'Prompting',
    difficulty: 'Anfänger',
    estimatedMinutes: 15,
    description: 'Formuliere einen Auftrag, den eine Code-KI sauber erledigen kann.',
    task: 'Schreibe einen Auftrag für Claude Code: Was gebaut werden soll, welche Dateien angefasst werden dürfen, was verboten ist und wie getestet wird.',
  },
]
