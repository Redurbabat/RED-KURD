// Tests für das Wiederholsystem. Alles läuft ohne DOM und ohne localStorage —
// der Scheduler ist reine Rechnerei, seine einzige Außenwelt ist die Uhr.
// Damit die Zeitzonen-Prüfungen unabhängig von der Zeitzone des Testrechners
// gelten, werden TZ und Uhr für die Dauer eines Tests fest eingestellt.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ABSTAENDE,
  SICHER_AB,
  SKILLS,
  gestern,
  heute,
  istFaellig,
  kartenSchluessel,
  naechsteKarte,
  schluesselTeile,
  tagPlus,
  tagVon,
} from '../src/core/progress/scheduler.ts'

const EchteUhr = Date

/** Führt den Ablauf in einer festen Zeitzone aus und stellt danach alles zurück. */
function mitZone(zone, ablauf) {
  const alteZone = process.env.TZ
  process.env.TZ = zone
  try {
    return ablauf()
  } finally {
    if (alteZone === undefined) delete process.env.TZ
    else process.env.TZ = alteZone
  }
}

/**
 * Wie mitZone, friert zusätzlich `new Date()` auf einen Zeitpunkt ein.
 * heute(), tagPlus() und naechsteKarte() lesen die echte Uhr selbst aus und
 * nehmen keinen Zeitpunkt entgegen — nur so werden sie exakt prüfbar.
 */
function mitFesterUhr(zone, zeitpunkt, ablauf) {
  return mitZone(zone, () => {
    const fest = new EchteUhr(zeitpunkt).getTime()
    class FesteUhr extends EchteUhr {
      constructor(...teile) {
        if (teile.length === 0) super(fest)
        else super(...teile)
      }
      static now() {
        return fest
      }
    }
    globalThis.Date = FesteUhr
    try {
      return ablauf()
    } finally {
      globalThis.Date = EchteUhr
    }
  })
}

/** Lokales Kalenderdatum, unabhängig vom Code, der geprüft wird. */
function lokalerTag(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// --- tagVon(): lokaler Kalendertag statt UTC --------------------------------

// Zonen ohne Sommerzeit: Honolulu liegt fest bei UTC-10, Kiritimati bei UTC+14.
// Damit sind die Fixtures ganzjährig stabil.
const ZEITZONEN_FAELLE = [
  {
    zone: 'Pacific/Honolulu',
    zeitpunkt: '2026-08-09T09:30:00Z',
    ortszeit: '23:30',
    stunde: 23,
    lokal: '2026-08-08',
    utc: '2026-08-09', // UTC ist hier bereits einen Tag weiter
  },
  {
    zone: 'Pacific/Honolulu',
    zeitpunkt: '2026-08-09T10:30:00Z',
    ortszeit: '00:30',
    stunde: 0,
    lokal: '2026-08-09',
    utc: '2026-08-09',
  },
  {
    zone: 'Pacific/Kiritimati',
    zeitpunkt: '2026-08-08T09:30:00Z',
    ortszeit: '23:30',
    stunde: 23,
    lokal: '2026-08-08',
    utc: '2026-08-08',
  },
  {
    zone: 'Pacific/Kiritimati',
    zeitpunkt: '2026-08-08T10:30:00Z',
    ortszeit: '00:30',
    stunde: 0,
    lokal: '2026-08-09',
    utc: '2026-08-08', // UTC hinkt hier einen Tag hinterher
  },
]

test('tagVon liefert den lokalen Kalendertag, auch spät abends und früh morgens', () => {
  for (const fall of ZEITZONEN_FAELLE) {
    mitZone(fall.zone, () => {
      const d = new Date(fall.zeitpunkt)
      const wo = `${fall.zone} ${fall.ortszeit}`
      // Fixture absichern: die Ortszeit ist wirklich die gemeinte.
      assert.equal(d.getHours(), fall.stunde, wo)
      assert.equal(tagVon(d), fall.lokal, wo)
      // Und die Gegenprobe: toISOString() (UTC) würde hier abweichen.
      assert.equal(d.toISOString().slice(0, 10), fall.utc, wo)
    })
  }
})

test('an den Tagesrändern weicht der UTC-Tag nachweislich vom lokalen ab', () => {
  // Genau diese beiden Fälle würden bei UTC-Rechnung die Tagesserie zerreißen.
  mitZone('Pacific/Honolulu', () => {
    const spaetAbends = new Date('2026-08-09T09:30:00Z') // 23:30 Ortszeit
    assert.equal(tagVon(spaetAbends), '2026-08-08')
    assert.notEqual(tagVon(spaetAbends), spaetAbends.toISOString().slice(0, 10))
  })
  mitZone('Pacific/Kiritimati', () => {
    const frueh = new Date('2026-08-08T10:30:00Z') // 00:30 Ortszeit
    assert.equal(tagVon(frueh), '2026-08-09')
    assert.notEqual(tagVon(frueh), frueh.toISOString().slice(0, 10))
  })
})

test('tagVon trägt Monats-, Jahres- und Schaltjahrgrenzen sauber', () => {
  // Ortszeit-Konstruktor: die Werte gelten in der eingestellten Zone.
  mitZone('Pacific/Honolulu', () => {
    assert.equal(tagVon(new Date(2025, 11, 31, 23, 30)), '2025-12-31')
    assert.equal(tagVon(new Date(2026, 0, 1, 0, 30)), '2026-01-01')
    assert.equal(tagVon(new Date(2026, 0, 31, 23, 30)), '2026-01-31')
    assert.equal(tagVon(new Date(2026, 1, 1, 0, 30)), '2026-02-01')
    // Schalttag und der Tag danach.
    assert.equal(tagVon(new Date(2024, 1, 29, 0, 30)), '2024-02-29')
    assert.equal(tagVon(new Date(2024, 1, 29, 23, 30)), '2024-02-29')
    assert.equal(tagVon(new Date(2024, 2, 1, 0, 30)), '2024-03-01')
    // Ohne Schalttag folgt auf den 28. Februar direkt der März.
    assert.equal(tagVon(new Date(2025, 1, 28, 23, 30)), '2025-02-28')
    assert.equal(tagVon(new Date(2025, 2, 1, 0, 30)), '2025-03-01')
  })
  // Dasselbe östlich von UTC, wo der UTC-Tag umgekehrt hinterherhinkt.
  mitZone('Pacific/Kiritimati', () => {
    assert.equal(tagVon(new Date(2025, 11, 31, 23, 30)), '2025-12-31')
    assert.equal(tagVon(new Date(2026, 0, 1, 0, 30)), '2026-01-01')
    assert.equal(tagVon(new Date(2024, 1, 29, 23, 30)), '2024-02-29')
  })
})

test('Monat und Tag werden immer zweistellig geschrieben', () => {
  mitZone('Europe/Berlin', () => {
    assert.equal(tagVon(new Date(2026, 0, 5, 12, 0)), '2026-01-05')
    assert.equal(tagVon(new Date(2026, 8, 9, 12, 0)), '2026-09-09')
    assert.equal(tagVon(new Date(2026, 9, 10, 12, 0)), '2026-10-10')
    // Nur so bleibt der Textvergleich in istFaellig() richtig sortiert.
    assert.ok(tagVon(new Date(2026, 8, 1, 12, 0)) < tagVon(new Date(2026, 9, 1, 12, 0)))
  })
})

test('tagVon nimmt auch Zeitstempel und ISO-Text entgegen', () => {
  mitZone('Pacific/Honolulu', () => {
    const d = new Date(2026, 7, 8, 23, 30)
    assert.equal(tagVon(d.getTime()), '2026-08-08')
    // Text mit Uhrzeit ohne Zonenangabe wird als Ortszeit gelesen.
    assert.equal(tagVon('2026-08-08T23:30:00'), '2026-08-08')
    // Achtung, dokumentierte Falle: ein reiner Datums-Text gilt laut Norm als
    // UTC-Mitternacht und rutscht westlich von UTC einen Tag zurück. Aufrufer
    // im Projekt übergeben deshalb Date-Objekte, keine Datums-Strings.
    assert.equal(tagVon('2026-08-08'), '2026-08-07')
  })
})

// --- heute(), tagPlus(), gestern() ------------------------------------------

test('heute nimmt den lokalen Tag der aktuellen Uhr', () => {
  mitFesterUhr('Pacific/Honolulu', '2026-08-09T09:30:00Z', () => {
    assert.equal(heute(), '2026-08-08') // 23:30 Ortszeit
  })
  mitFesterUhr('Pacific/Kiritimati', '2026-08-08T10:30:00Z', () => {
    assert.equal(heute(), '2026-08-09') // 00:30 Ortszeit
  })
  // Auch ohne feste Uhr bleibt das Format verlässlich.
  assert.match(heute(), /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(heute(), lokalerTag(new Date()))
})

test('tagPlus zählt Kalendertage vor und zurück', () => {
  mitFesterUhr('Pacific/Honolulu', '2026-08-09T09:30:00Z', () => {
    assert.equal(tagPlus(0), '2026-08-08')
    assert.equal(tagPlus(0), heute())
    assert.equal(tagPlus(1), '2026-08-09')
    assert.equal(tagPlus(3), '2026-08-11')
    assert.equal(tagPlus(7), '2026-08-15')
    assert.equal(tagPlus(16), '2026-08-24')
    assert.equal(tagPlus(35), '2026-09-12')
    assert.equal(tagPlus(70), '2026-10-17')
    assert.equal(tagPlus(-1), '2026-08-07')
    assert.equal(gestern(), '2026-08-07')
  })
})

test('tagPlus überschreitet Monats-, Jahres- und Schaltjahrgrenzen richtig', () => {
  mitFesterUhr('Pacific/Honolulu', '2024-01-01T09:30:00Z', () => {
    assert.equal(heute(), '2023-12-31') // 23:30 Ortszeit am Silvesterabend
    assert.equal(tagPlus(1), '2024-01-01')
    assert.equal(tagPlus(31), '2024-01-31')
    assert.equal(gestern(), '2023-12-30')
  })
  mitFesterUhr('Pacific/Honolulu', '2024-02-29T09:30:00Z', () => {
    assert.equal(heute(), '2024-02-28')
    assert.equal(tagPlus(1), '2024-02-29') // Schalttag existiert
    assert.equal(tagPlus(2), '2024-03-01')
  })
  mitFesterUhr('Pacific/Honolulu', '2025-03-01T09:30:00Z', () => {
    assert.equal(heute(), '2025-02-28')
    assert.equal(tagPlus(1), '2025-03-01') // 2025 hat keinen 29. Februar
  })
})

test('die Sommerzeitumstellung verschiebt keinen Kalendertag', () => {
  // In Berlin wird in der Nacht zum 29.03.2026 auf Sommerzeit gestellt.
  mitFesterUhr('Europe/Berlin', '2026-03-28T11:00:00Z', () => {
    assert.equal(heute(), '2026-03-28')
    assert.equal(tagPlus(1), '2026-03-29')
    assert.equal(tagPlus(2), '2026-03-30')
  })
  // 01:30 Ortszeit, also kurz vor dem Sprung auf 03:00.
  mitFesterUhr('Europe/Berlin', '2026-03-29T00:30:00Z', () => {
    assert.equal(heute(), '2026-03-29')
    assert.equal(tagPlus(1), '2026-03-30')
    assert.equal(gestern(), '2026-03-28')
  })
})

// --- naechsteKarte() --------------------------------------------------------

// Feste Uhr für alle Kartentests: 08.08.2026, 23:30 Ortszeit in Honolulu.
const UHR_ZONE = 'Pacific/Honolulu'
const UHR_ZEITPUNKT = '2026-08-09T09:30:00Z'
const HEUTE = '2026-08-08'
// heute + ABSTAENDE[i], von Hand nachgerechnet.
const FAELLIG_JE_STUFE = [
  '2026-08-09', // Stufe 1, +1
  '2026-08-11', // Stufe 2, +3
  '2026-08-15', // Stufe 3, +7
  '2026-08-24', // Stufe 4, +16
  '2026-09-12', // Stufe 5, +35
  '2026-10-17', // Stufe 6, +70
]

function mitKartenUhr(ablauf) {
  return mitFesterUhr(UHR_ZONE, UHR_ZEITPUNKT, ablauf)
}

test('die Abstandstabelle passt zu den erwarteten Fälligkeiten', () => {
  assert.deepEqual(ABSTAENDE, [1, 3, 7, 16, 35, 70])
  assert.equal(FAELLIG_JE_STUFE.length, ABSTAENDE.length)
  mitKartenUhr(() => {
    ABSTAENDE.forEach((abstand, i) => {
      assert.equal(tagPlus(abstand), FAELLIG_JE_STUFE[i], `Abstand ${abstand}`)
    })
  })
  // Streng steigend — sonst käme eine höhere Stufe früher zurück als eine tiefe.
  for (let i = 1; i < ABSTAENDE.length; i++) {
    assert.ok(ABSTAENDE[i] > ABSTAENDE[i - 1], `Abstand ${i} muss größer sein`)
  }
})

test('eine neue Karte startet bei richtiger Antwort auf Stufe 1', () => {
  mitKartenUhr(() => {
    assert.deepEqual(naechsteKarte(undefined, true), {
      stufe: 1,
      faellig: '2026-08-09',
      gesehen: 1,
      richtig: 1,
    })
    // null wird genauso behandelt wie „noch nie gesehen".
    assert.deepEqual(naechsteKarte(null, true), {
      stufe: 1,
      faellig: '2026-08-09',
      gesehen: 1,
      richtig: 1,
    })
  })
})

test('eine neue Karte bleibt bei falscher Antwort heute fällig', () => {
  mitKartenUhr(() => {
    const k = naechsteKarte(undefined, false)
    assert.deepEqual(k, { stufe: 0, faellig: HEUTE, gesehen: 1, richtig: 0 })
    assert.equal(istFaellig(k), true) // sofort wieder dran
  })
})

test('richtige Antworten steigen Stufe für Stufe und setzen die Fälligkeit nach ABSTAENDE', () => {
  mitKartenUhr(() => {
    let karte
    for (let stufe = 1; stufe <= ABSTAENDE.length; stufe++) {
      karte = naechsteKarte(karte, true)
      assert.equal(karte.stufe, stufe, `Stufe nach ${stufe} richtigen Antworten`)
      assert.equal(karte.faellig, FAELLIG_JE_STUFE[stufe - 1], `Fälligkeit Stufe ${stufe}`)
      assert.equal(karte.faellig, tagPlus(ABSTAENDE[stufe - 1]), `Abstand Stufe ${stufe}`)
      assert.equal(karte.gesehen, stufe)
      assert.equal(karte.richtig, stufe)
      assert.equal(istFaellig(karte), false) // liegt in der Zukunft
    }
    assert.equal(karte.stufe, 6)
  })
})

test('die höchste Stufe läuft nicht über das Ende von ABSTAENDE hinaus', () => {
  mitKartenUhr(() => {
    // Weitere richtige Antworten auf der Höchststufe bleiben bei +70 Tagen.
    let karte = { stufe: ABSTAENDE.length, faellig: HEUTE, gesehen: 20, richtig: 18 }
    for (let i = 0; i < 3; i++) {
      karte = naechsteKarte(karte, true)
      assert.equal(karte.stufe, ABSTAENDE.length)
      assert.equal(karte.faellig, FAELLIG_JE_STUFE.at(-1))
      assert.equal(karte.faellig, tagPlus(ABSTAENDE.at(-1)))
    }
    // Auch eine (etwa durch Altdaten) viel zu hohe Stufe greift nicht ins Leere:
    // Math.min deckelt sowohl die Stufe als auch den Tabellenindex.
    const wild = naechsteKarte({ stufe: 99, gesehen: 5, richtig: 5 }, true)
    assert.equal(wild.stufe, ABSTAENDE.length)
    assert.equal(wild.faellig, FAELLIG_JE_STUFE.at(-1))
    assert.match(wild.faellig, /^\d{4}-\d{2}-\d{2}$/) // kein NaN aus einem Loch in der Tabelle
  })
})

test('eine falsche Antwort stuft auf Stufe 0 zurück und macht sofort wieder fällig', () => {
  mitKartenUhr(() => {
    const alt = { stufe: 5, faellig: '2026-12-24', gesehen: 10, richtig: 7 }
    const neu = naechsteKarte(alt, false)
    assert.deepEqual(neu, { stufe: 0, faellig: HEUTE, gesehen: 11, richtig: 7 })
    assert.equal(istFaellig(neu), true)
    // Die alte Karte wird nicht verändert.
    assert.deepEqual(alt, { stufe: 5, faellig: '2026-12-24', gesehen: 10, richtig: 7 })
    // Danach beginnt der Aufstieg wieder bei Stufe 1 mit +1 Tag.
    assert.deepEqual(naechsteKarte(neu, true), {
      stufe: 1,
      faellig: FAELLIG_JE_STUFE[0],
      gesehen: 12,
      richtig: 8,
    })
  })
})

test('gesehen und richtig werden über eine ganze Übungsreihe mitgezählt', () => {
  mitKartenUhr(() => {
    let karte
    const antworten = [true, true, false, true, false, false, true]
    for (const antwort of antworten) karte = naechsteKarte(karte, antwort)
    assert.equal(karte.gesehen, antworten.length)
    assert.equal(karte.richtig, antworten.filter(Boolean).length)
    assert.equal(karte.stufe, 1) // zuletzt: falsch, falsch, richtig
    assert.equal(karte.faellig, FAELLIG_JE_STUFE[0])
  })
})

test('fehlende Zähler in alten Karten werden verträglich ergänzt', () => {
  mitKartenUhr(() => {
    // Karten aus älteren Ständen haben womöglich nur eine Stufe.
    assert.deepEqual(naechsteKarte({ stufe: 2 }, true), {
      stufe: 3,
      faellig: FAELLIG_JE_STUFE[2],
      gesehen: 1,
      richtig: 1,
    })
    assert.deepEqual(naechsteKarte({}, false), {
      stufe: 0,
      faellig: HEUTE,
      gesehen: 1,
      richtig: 0,
    })
  })
})

test('ab Stufe 3 gilt ein Wort als sicher', () => {
  assert.equal(SICHER_AB, 3)
  mitKartenUhr(() => {
    let karte
    for (let i = 0; i < SICHER_AB - 1; i++) karte = naechsteKarte(karte, true)
    assert.ok(karte.stufe < SICHER_AB)
    karte = naechsteKarte(karte, true)
    assert.ok(karte.stufe >= SICHER_AB)
    // Ein Fehler nimmt den Status sofort wieder weg.
    assert.ok(naechsteKarte(karte, false).stufe < SICHER_AB)
  })
})

// --- kartenSchluessel() / schluesselTeile() ---------------------------------

test('Schlüssel und Teile sind für alle Fertigkeiten ein sauberer Hin- und Rückweg', () => {
  assert.deepEqual(SKILLS, ['erkennen', 'abrufen', 'schreiben', 'hoeren'])
  for (const skill of SKILLS) {
    const key = kartenSchluessel('Haus', 'mal', skill)
    assert.equal(key, `Haus|mal|${skill}`)
    assert.deepEqual(schluesselTeile(key), { de: 'Haus', ku: 'mal', skill })
  }
})

test('Umlaute und kurdische Sonderzeichen überstehen den Rückweg unverändert', () => {
  const faelle = [
    ['Fluss', 'çem'],
    ['Nacht', 'şev'],
    ['Hündchen', 'kûçikê piçûk'],
    ['guten Morgen', 'beyanî baş'],
  ]
  for (const [de, ku] of faelle) {
    const teile = schluesselTeile(kartenSchluessel(de, ku, 'abrufen'))
    assert.deepEqual(teile, { de, ku, skill: 'abrufen' })
  }
})

test('ohne Fertigkeit entsteht ein zweiteiliger Schlüssel und der Rückweg meldet "gemischt"', () => {
  assert.equal(kartenSchluessel('Haus', 'mal'), 'Haus|mal')
  assert.equal(kartenSchluessel('Haus', 'mal', undefined), 'Haus|mal')
  assert.equal(kartenSchluessel('Haus', 'mal', ''), 'Haus|mal')
  assert.equal(kartenSchluessel('Haus', 'mal', null), 'Haus|mal')
  assert.deepEqual(schluesselTeile('Haus|mal'), { de: 'Haus', ku: 'mal', skill: 'gemischt' })
  // Auch ein ausdrücklich gemischter Schlüssel liest sich wieder gleich.
  assert.deepEqual(schluesselTeile(kartenSchluessel('Haus', 'mal', 'gemischt')), {
    de: 'Haus',
    ku: 'mal',
    skill: 'gemischt',
  })
})

test('ein "|" im Wort zerlegt den Schlüssel falsch — bekannte Grenze des Trennzeichens', () => {
  // MERKE: '|' ist Trennzeichen UND darf im Wort vorkommen — dafür fehlt eine
  // Maskierung. Solange keine Vokabel ein '|' enthält, faellt das nicht auf;
  // sobald doch, landen Wortteile in den falschen Feldern. Der Test haelt das
  // heutige Verhalten fest, damit eine spaetere Maskierung sofort auffaellt.
  const mitStrich = kartenSchluessel('Hund|Katze', 'kûçik', 'erkennen')
  assert.equal(mitStrich, 'Hund|Katze|kûçik|erkennen')
  assert.deepEqual(schluesselTeile(mitStrich), {
    de: 'Hund', // richtig waere 'Hund|Katze'
    ku: 'Katze', // richtig waere 'kûçik'
    skill: 'kûçik', // richtig waere 'erkennen'
  })
  assert.notEqual(schluesselTeile(mitStrich).de, 'Hund|Katze')

  // Ohne Fertigkeit wird das kurdische Wort stillschweigend zur Fertigkeit.
  const ohneSkill = kartenSchluessel('Hund|Katze', 'kûçik')
  assert.equal(ohneSkill, 'Hund|Katze|kûçik')
  assert.deepEqual(schluesselTeile(ohneSkill), {
    de: 'Hund',
    ku: 'Katze',
    skill: 'kûçik',
  })

  // Steht das '|' im kurdischen Wort, ist der deutsche Teil wenigstens heil.
  const hinten = kartenSchluessel('Haus', 'mal|xanî', 'schreiben')
  assert.equal(schluesselTeile(hinten).de, 'Haus')
  assert.equal(schluesselTeile(hinten).ku, 'mal')
  assert.equal(schluesselTeile(hinten).skill, 'xanî')

  // Leerzeichen, Bindestriche und Kommas sind dagegen unkritisch.
  const harmlos = kartenSchluessel('Guten Tag, mein Freund', 'rojbaş - hevalê min', 'hoeren')
  assert.deepEqual(schluesselTeile(harmlos), {
    de: 'Guten Tag, mein Freund',
    ku: 'rojbaş - hevalê min',
    skill: 'hoeren',
  })
})

test('naechsteKarte und kartenSchluessel greifen wie im Lernstand ineinander', () => {
  mitKartenUhr(() => {
    const karten = {}
    const key = kartenSchluessel('Haus', 'mal', 'erkennen')
    karten[key] = naechsteKarte(karten[key], true)
    karten[key] = naechsteKarte(karten[key], true)
    assert.deepEqual(karten[key], {
      stufe: 2,
      faellig: FAELLIG_JE_STUFE[1],
      gesehen: 2,
      richtig: 2,
    })
    // Dieselbe Vokabel mit anderer Fertigkeit ist ein eigener Eintrag.
    const anderer = kartenSchluessel('Haus', 'mal', 'schreiben')
    assert.notEqual(anderer, key)
    assert.equal(karten[anderer], undefined)
    assert.deepEqual(Object.keys(karten).map((k) => schluesselTeile(k).skill), ['erkennen'])
  })
})

// --- istFaellig() -----------------------------------------------------------

test('istFaellig vergleicht Kalendertage und schließt den Fälligkeitstag ein', () => {
  assert.equal(istFaellig({ faellig: '2026-08-07' }, '2026-08-08'), true) // überfällig
  assert.equal(istFaellig({ faellig: '2026-08-08' }, '2026-08-08'), true) // heute dran
  assert.equal(istFaellig({ faellig: '2026-08-09' }, '2026-08-08'), false) // noch nicht
})

test('eine Karte ohne Fälligkeit ist immer fällig', () => {
  assert.equal(istFaellig({}, '2026-08-08'), true)
  assert.equal(istFaellig({ faellig: null }, '2026-08-08'), true)
  assert.equal(istFaellig({ faellig: '' }, '2026-08-08'), true)
  assert.equal(istFaellig({ stufe: 4 }, '2026-08-08'), true)
})

test('istFaellig nimmt ohne Angabe den heutigen lokalen Tag', () => {
  mitKartenUhr(() => {
    assert.equal(istFaellig({ faellig: HEUTE }), true)
    assert.equal(istFaellig({ faellig: gestern() }), true)
    assert.equal(istFaellig({ faellig: tagPlus(1) }), false)
    // Frisch beantwortete Karten verhalten sich entsprechend.
    assert.equal(istFaellig(naechsteKarte(undefined, false)), true)
    assert.equal(istFaellig(naechsteKarte(undefined, true)), false)
  })
})

test('der Textvergleich trägt über Monats- und Jahresgrenzen', () => {
  // Das Format JJJJ-MM-TT ist genau deshalb zweistellig aufgefüllt.
  assert.equal(istFaellig({ faellig: '2025-12-31' }, '2026-01-01'), true)
  assert.equal(istFaellig({ faellig: '2026-01-01' }, '2025-12-31'), false)
  assert.equal(istFaellig({ faellig: '2026-09-30' }, '2026-10-01'), true)
  assert.equal(istFaellig({ faellig: '2026-10-01' }, '2026-09-30'), false)
  assert.equal(istFaellig({ faellig: '2024-02-29' }, '2024-03-01'), true)
})

test('eine beschaedigte Karte mit negativer Stufe bekommt eine gueltige Faelligkeit', () => {
  // Ohne untere Deckelung des Tabellenindex entstand hier "NaN-NaN-NaN";
  // istFaellig vergleicht als Text, die Karte waere nie wieder drangekommen.
  for (const stufe of [-1, -5, -99]) {
    const karte = naechsteKarte({ stufe, gesehen: 3, richtig: 1 }, true)
    assert.match(karte.faellig, /^\d{4}-\d{2}-\d{2}$/, `stufe ${stufe}`)
    assert.equal(istFaellig({ faellig: karte.faellig }, tagPlus(400)), true, `stufe ${stufe}`)
  }
})
