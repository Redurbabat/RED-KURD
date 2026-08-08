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
  {
    id: 'elpraxis-reihe',
    art: 'zahl',
    title: 'Reihenschaltung: Gesamtwiderstand',
    topic: 'Reihenschaltung',
    estimatedMinutes: 4,
    description: 'In Reihe zählen die Widerstände einfach zusammen.',
    auftrag:
      'Drei Widerstände liegen in Reihe: 100 Ω, 220 Ω und 330 Ω. Wie groß ist der Gesamtwiderstand? (In Reihe: R = R1 + R2 + R3)',
    einheit: 'Ω',
    tipp: 'Einfach addieren — in Reihe wird der Weg für den Strom länger.',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (R = R1 + R2 + R3)', pruefe: istUngefaehr(650) }],
    musterloesung: '650',
  },
  {
    id: 'elpraxis-reihe-strom',
    art: 'zahl',
    title: 'Reihenschaltung: der Strom',
    topic: 'Reihenschaltung',
    estimatedMinutes: 5,
    description: 'Ein Weg, ein Strom — überall derselbe.',
    auftrag:
      'An der Reihenschaltung von eben (650 Ω gesamt) liegen 13 V. Wie groß ist der Strom? Gib das Ergebnis in Milliampere an. (I = U ÷ R, dann × 1000)',
    einheit: 'mA',
    tipp: 'I = 13 ÷ 650 = 0,02 A — und 0,02 A sind 20 mA.',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt', pruefe: istUngefaehr(20, 0.5) }],
    musterloesung: '20',
  },
  {
    id: 'elpraxis-parallel',
    art: 'zahl',
    title: 'Parallelschaltung: zwei gleiche',
    topic: 'Parallelschaltung',
    estimatedMinutes: 5,
    description: 'Parallel wird der Gesamtwiderstand immer KLEINER.',
    auftrag:
      'Zwei gleiche Widerstände von je 100 Ω liegen parallel. Wie groß ist der Gesamtwiderstand? (Bei zwei gleichen: R geteilt durch 2)',
    einheit: 'Ω',
    tipp: 'Der Strom hat zwei Wege — zusammen kommen sie leichter durch.',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt', pruefe: istUngefaehr(50) }],
    musterloesung: '50',
  },
  {
    id: 'elpraxis-parallel-zwei',
    art: 'zahl',
    title: 'Parallelschaltung: zwei verschiedene',
    topic: 'Parallelschaltung',
    estimatedMinutes: 6,
    description: 'Die Formel für zwei ungleiche Widerstände.',
    auftrag:
      'Ein 60-Ω- und ein 30-Ω-Widerstand liegen parallel. Wie groß ist der Gesamtwiderstand? (R = R1 · R2 ÷ (R1 + R2))',
    einheit: 'Ω',
    tipp: 'R = 60 · 30 ÷ 90. Das Ergebnis muss kleiner als 30 sein!',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (R = R1 · R2 ÷ (R1 + R2))', pruefe: istUngefaehr(20) }],
    musterloesung: '20',
  },
  {
    id: 'elpraxis-energie',
    art: 'zahl',
    title: 'Was kostet der Boiler?',
    topic: 'Energie',
    estimatedMinutes: 6,
    description: 'Von der Leistung zur Stromrechnung.',
    auftrag:
      'Ein Boiler mit 2000 W läuft täglich 3 Stunden. Wie viele Kilowattstunden verbraucht er in 30 Tagen? (E = P · t, dann durch 1000)',
    einheit: 'kWh',
    tipp: '2000 W × 3 h × 30 Tage = 180 000 Wh — und Wh geteilt durch 1000 sind kWh.',
    checks: [{ id: 'ergebnis', text: 'Dein Ergebnis stimmt (E = P · t)', pruefe: istUngefaehr(180) }],
    musterloesung: '180',
  },
]
