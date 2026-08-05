// Lektionen des Bereichs „Elektro-Lehre": Grundlagen fuer die Ausbildung.
// Reine Daten — Status kommt aus dem gespeicherten Lernstand.
//
// WICHTIG (Inhalt): Alles hier ist Theorie zum Verstehen. Arbeiten an
// elektrischen Anlagen gehoeren in die Haende von Elektrofachkraeften —
// in der Ausbildung immer unter Anleitung.

export const electroLessons = [
  // ===== Grundlagen =====
  {
    id: 'el-strom',
    gruppe: 'Grundlagen',
    title: 'Was ist elektrischer Strom?',
    description: 'Ladung, Elektronen und der geschlossene Stromkreis.',
    durationMinutes: 8,
    inhalt: [
      'Elektrischer Strom ist bewegte elektrische Ladung — meistens Elektronen, die durch einen Leiter wandern.',
      'Strom fließt nur, wenn der Kreis geschlossen ist: Quelle, Leitung, Verbraucher und zurück. Ein offener Schalter unterbricht den Kreis — der Strom stoppt sofort.',
      'Merkbild: wie Wasser in einem Rohrkreislauf. Die Pumpe ist die Quelle, das Wasser die Ladung, das Wasserrad der Verbraucher.',
    ],
    beispiel: 'Batterie (+) ── Schalter ── Lampe ── zurück zur Batterie (−)\nSchalter offen  → kein Strom, Lampe aus\nSchalter zu     → Strom fließt, Lampe leuchtet',
    merke: 'Ohne geschlossenen Kreis fließt kein Strom.',
  },
  {
    id: 'el-uir',
    gruppe: 'Grundlagen',
    title: 'Spannung, Strom, Widerstand',
    description: 'Die drei Grundgrößen U, I und R mit ihren Einheiten.',
    durationMinutes: 10,
    inhalt: [
      'Spannung U (Volt, V) ist der „Druck", der die Ladung antreibt. Strom I (Ampere, A) ist die Menge, die tatsächlich fließt. Widerstand R (Ohm, Ω) bremst den Fluss.',
      'Im Wasserbild: Spannung = Pumpendruck, Strom = Wassermenge pro Sekunde, Widerstand = enge Stelle im Rohr.',
      'Diese drei Größen hängen immer zusammen — wie genau, sagt das Ohmsche Gesetz in der nächsten Lektion.',
    ],
    beispiel: 'U = Spannung  → Volt (V)   → der Antrieb\nI = Strom     → Ampere (A) → die Menge\nR = Widerstand → Ohm (Ω)   → die Bremse',
    merke: 'U treibt an, I fließt, R bremst — V, A, Ω.',
  },
  {
    id: 'el-ohm',
    gruppe: 'Grundlagen',
    title: 'Das Ohmsche Gesetz',
    description: 'U = R · I — die wichtigste Formel der Elektrotechnik.',
    durationMinutes: 12,
    inhalt: [
      'Das Ohmsche Gesetz verbindet die drei Grundgrößen: U = R · I. Wer zwei kennt, rechnet die dritte aus: I = U ÷ R und R = U ÷ I.',
      'Beispiel: Eine 12-V-Quelle an einem Widerstand von 6 Ω — es fließen I = 12 V ÷ 6 Ω = 2 A.',
      'Eselsbrücke ist das URI-Dreieck: U oben, R und I unten. Halte die gesuchte Größe zu — was übrig bleibt, ist die Rechnung.',
    ],
    beispiel: '     U\n   ─────\n   R · I\n\nU = 12 V, R = 6 Ω  →  I = U ÷ R = 2 A\nU = 12 V, I = 2 A  →  R = U ÷ I = 6 Ω',
    merke: 'U = R · I — das URI-Dreieck hilft beim Umstellen.',
  },
  {
    id: 'el-leistung',
    gruppe: 'Grundlagen',
    title: 'Elektrische Leistung',
    description: 'P = U · I — warum auf Geräten Watt steht.',
    durationMinutes: 10,
    inhalt: [
      'Leistung P (Watt, W) sagt, wie viel elektrische Energie ein Gerät pro Sekunde umsetzt: P = U · I.',
      'Beispiel: Ein Wasserkocher an 230 V zieht 8,7 A — das sind P = 230 V · 8,7 A ≈ 2000 W, also 2 kW.',
      'Deshalb steht auf jedem Gerät die Watt-Zahl: Sie verrät, wie viel Strom es bei Netzspannung zieht — wichtig für Sicherungen und Leitungen.',
    ],
    beispiel: 'P = U · I\n230 V · 8,7 A ≈ 2000 W (Wasserkocher)\n230 V · 0,04 A ≈ 9 W  (LED-Lampe)',
    merke: 'P = U · I — Watt ist Volt mal Ampere.',
  },

  // ===== Sicherheit =====
  {
    id: 'el-gefahr',
    gruppe: 'Sicherheit',
    title: 'Warum Strom gefährlich ist',
    description: 'Was Strom im Körper macht und ab wann es ernst wird.',
    durationMinutes: 10,
    inhalt: [
      'Der Körper leitet Strom. Schon wenige Milliampere spürst du als Kribbeln; ab etwa 10–20 mA verkrampfen Muskeln — loslassen wird unmöglich. Höhere Ströme können das Herz aus dem Takt bringen.',
      'Als gefährlich gelten Spannungen ab etwa 50 V Wechselspannung bzw. 120 V Gleichspannung. Die Steckdose mit 230 V liegt weit darüber.',
      'Entscheidend ist der Strom durch den Körper — und der hängt von Spannung, Hautwiderstand und dem Weg durch den Körper ab. Nasse Haut leitet viel besser: darum nie mit nassen Händen an Elektrik.',
    ],
    beispiel: 'ca.  1 mA  → spürbar\nca. 10–20 mA → Muskeln verkrampfen\nab ca. 30 mA → lebensgefährlich (deshalb löst der FI bei 30 mA aus)',
    merke: 'Ab 50 V AC wird es gefährlich — die Steckdose hat 230 V.',
  },
  {
    id: 'el-5regeln',
    gruppe: 'Sicherheit',
    title: 'Die 5 Sicherheitsregeln',
    description: 'Die eiserne Reihenfolge vor jeder Arbeit an einer Anlage.',
    durationMinutes: 12,
    inhalt: [
      'Vor Arbeiten an elektrischen Anlagen gelten immer die fünf Sicherheitsregeln — in genau dieser Reihenfolge, ohne Ausnahme.',
      '1. Freischalten. 2. Gegen Wiedereinschalten sichern. 3. Spannungsfreiheit feststellen. 4. Erden und kurzschließen. 5. Benachbarte, unter Spannung stehende Teile abdecken oder abschranken.',
      'Regel 3 heißt: mit einem zweipoligen Spannungsprüfer messen — niemals „wird schon aus sein" glauben. Diese Arbeiten führen Elektrofachkräfte aus; in der Ausbildung immer unter Anleitung.',
    ],
    beispiel: '1. Freischalten\n2. Gegen Wiedereinschalten sichern\n3. Spannungsfreiheit feststellen\n4. Erden und kurzschließen\n5. Benachbarte Teile abdecken',
    merke: 'Fünf Regeln, feste Reihenfolge — erst messen, dann anfassen.',
  },
  {
    id: 'el-schutz',
    gruppe: 'Sicherheit',
    title: 'Schutzleiter, FI und Sicherung',
    description: 'Wer dich schützt: PE, RCD/FI und die Leitungssicherung.',
    durationMinutes: 12,
    inhalt: [
      'Der Schutzleiter (PE, grün-gelb) verbindet Metallgehäuse mit der Erde. Bei einem Fehler fließt der Strom über ihn ab, statt über dich.',
      'Der FI-Schutzschalter (RCD) vergleicht hin- und zurückfließenden Strom. Fehlen mehr als 30 mA — etwa weil sie durch einen Menschen fließen — schaltet er in Millisekunden ab.',
      'Die Leitungssicherung (z. B. B16) schützt vor allem die Leitung vor Überlastung und Kurzschluss — Menschen schützt in erster Linie der FI.',
    ],
    beispiel: 'Schutzleiter PE → grün-gelb, niemals als stromführende Ader nutzen\nFI/RCD 30 mA   → Personenschutz\nSicherung B16  → Leitungsschutz',
    merke: 'Grün-gelb ist heilig — und der FI rettet Leben.',
  },

  // ===== Praxis =====
  {
    id: 'el-multimeter',
    gruppe: 'Praxis',
    title: 'Messen mit dem Multimeter',
    description: 'Spannung, Strom und Widerstand richtig messen.',
    durationMinutes: 12,
    inhalt: [
      'Spannung misst du PARALLEL zum Bauteil — das Multimeter liegt daneben. Strom misst du IN REIHE — der Strom muss durch das Gerät hindurch.',
      'Vor jeder Messung: richtige Messart und ausreichend großen Messbereich wählen, Leitungen in die richtigen Buchsen. Widerstand nur am spannungsfreien Bauteil messen.',
      'Übe zuerst an ungefährlichen Quellen wie Batterien (1,5–9 V) — die Messtechnik ist dieselbe wie bei großen Anlagen.',
    ],
    beispiel: 'Spannung → parallel  → V-Buchse\nStrom    → in Reihe  → A-Buchse\nWiderstand → nur spannungsfrei messen',
    merke: 'Spannung parallel, Strom in Reihe — Bereich vorher wählen.',
  },
  {
    id: 'el-schaltplan',
    gruppe: 'Praxis',
    title: 'Reihen- und Parallelschaltung',
    description: 'Zwei Grundschaltungen, die alles erklären.',
    durationMinutes: 12,
    inhalt: [
      'In der REIHENSCHALTUNG fließt derselbe Strom durch alle Bauteile; die Spannung teilt sich auf. Fällt ein Bauteil aus, ist der Kreis unterbrochen — alles geht aus (alte Lichterkette).',
      'In der PARALLELSCHALTUNG liegt an allen Bauteilen dieselbe Spannung; der Strom teilt sich auf. Fällt eines aus, laufen die anderen weiter — so sind Steckdosen im Haus geschaltet.',
      'Widerstände: in Reihe addieren sie sich (R = R1 + R2), parallel wird der Gesamtwiderstand KLEINER als der kleinste Einzelne.',
    ],
    beispiel: 'Reihe:    ──[R1]──[R2]──   gleicher Strom, R = R1 + R2\nParallel: ──┬[R1]┬──       gleiche Spannung,\n            └[R2]┘         R wird kleiner',
    merke: 'Reihe: ein Weg, alles teilt die Spannung. Parallel: viele Wege, alle sehen die volle Spannung.',
  },
]

/** Die Gruppen in Anzeige-Reihenfolge. */
export const electroGruppen = ['Grundlagen', 'Sicherheit', 'Praxis']
