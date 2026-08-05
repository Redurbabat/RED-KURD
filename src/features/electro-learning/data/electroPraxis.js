// Mitmach-Aufgaben „Elektro-Lehre": rechnen mit Sofort-Pruefung.
// Kommazahlen duerfen mit Punkt oder Komma getippt werden.

function zahl(wert) {
  const n = Number.parseFloat(String(wert || '').replace(',', '.').trim())
  return Number.isFinite(n) ? n : null
}

function istUngefaehr(erwartet, toleranz = 0.01) {
  return (wert) => {
    const n = zahl(wert)
    return n !== null && Math.abs(n - erwartet) <= toleranz
  }
}

export const electroPraxisAufgaben = [
  {
    id: 'elpraxis-strom',
    art: 'zahl',
    title: 'Strom berechnen',
    topic: 'Ohmsches Gesetz',
    estimatedMinutes: 5,
    description: 'U und R sind bekannt — wie groß ist I?',
    auftrag: 'Eine 24-V-Quelle liegt an einem Widerstand von 8 Ω. Wie groß ist der Strom I? (I = U ÷ R)',
    einheit: 'A',
    tipp: 'I = U ÷ R = 24 ÷ 8',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (I = U ÷ R)', pruefe: istUngefaehr(3) }],
    musterloesung: '3',
  },
  {
    id: 'elpraxis-widerstand',
    art: 'zahl',
    title: 'Widerstand berechnen',
    topic: 'Ohmsches Gesetz',
    estimatedMinutes: 5,
    description: 'U und I sind bekannt — wie groß ist R?',
    auftrag: 'An 230 V fließt ein Strom von 2 A. Wie groß ist der Widerstand R? (R = U ÷ I)',
    einheit: 'Ω',
    tipp: 'R = U ÷ I = 230 ÷ 2',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (R = U ÷ I)', pruefe: istUngefaehr(115) }],
    musterloesung: '115',
  },
  {
    id: 'elpraxis-spannung',
    art: 'zahl',
    title: 'Spannung berechnen',
    topic: 'Ohmsches Gesetz',
    estimatedMinutes: 5,
    description: 'R und I sind bekannt — wie groß ist U?',
    auftrag: 'Durch einen Widerstand von 100 Ω fließen 0,5 A. Welche Spannung U liegt an? (U = R · I)',
    einheit: 'V',
    tipp: 'U = R · I = 100 · 0,5',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (U = R · I)', pruefe: istUngefaehr(50) }],
    musterloesung: '50',
  },
  {
    id: 'elpraxis-leistung',
    art: 'zahl',
    title: 'Leistung berechnen',
    topic: 'Leistung',
    estimatedMinutes: 5,
    description: 'Von Volt und Ampere zur Watt-Zahl.',
    auftrag: 'Ein Heizlüfter zieht an 230 V genau 8,7 A. Wie groß ist die Leistung P in Watt? (P = U · I)',
    einheit: 'W',
    tipp: 'P = U · I = 230 · 8,7',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (P = U · I)', pruefe: istUngefaehr(2001, 2) }],
    musterloesung: '2001',
  },
  {
    id: 'elpraxis-fi',
    art: 'zahl',
    title: 'Die FI-Grenze kennen',
    topic: 'Sicherheit',
    estimatedMinutes: 3,
    description: 'Der wichtigste Wert des Personenschutzes.',
    auftrag: 'Bei wie viel Milliampere Fehlerstrom löst der FI-Schutzschalter für den Personenschutz aus? (Steht in der Lektion „Schutzleiter, FI und Sicherung“.)',
    einheit: 'mA',
    tipp: 'Der klassische Personenschutz-FI.',
    checks: [{ id: 'ergebnis', text: 'Dein Wert stimmt', pruefe: istUngefaehr(30) }],
    musterloesung: '30',
  },
]
