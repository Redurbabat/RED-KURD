// Tests fuer die Schrift-Umwandlung Kurmancî: Latein (Hawar) <-> Arabisch.
//
// Bewusst NUR die beiden reinen Funktionen. `sprich` und `hatKurdischeStimme`
// greifen auf `window.speechSynthesis` zu, das es unter Node nicht gibt —
// diese Tests haengen sich deshalb nirgends an die Sprachausgabe.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  arabischNachLatein,
  lateinNachArabisch,
} from '../src/core/schrift/transliteration.ts'
import { kurse } from '../src/data/kurse.js'

test('einfache Woerter wandern korrekt in die arabische Schrift', () => {
  assert.equal(lateinNachArabisch('nan'), 'نان')
  assert.equal(lateinNachArabisch('roj'), 'رۆژ')
})

test('ein Wortanfang mit Vokal bekommt das Hamza-Traegerzeichen', () => {
  assert.equal(lateinNachArabisch('av'), 'ئاڤ')
  assert.equal(lateinNachArabisch('ez'), 'ئەز')
})

test('die Digraphen xw und û werden als Einheit umgesetzt', () => {
  assert.equal(lateinNachArabisch('xwarin'), 'خوارن')
  assert.equal(lateinNachArabisch('şûr'), 'شوور')
})

test('das kurze i wird ausgelassen, Grossschreibung ist egal', () => {
  assert.equal(lateinNachArabisch('Silav'), 'سلاڤ')
  assert.equal(lateinNachArabisch('silav'), lateinNachArabisch('SILAV'))
})

test('Leerzeichen und unbekannte Zeichen bleiben erhalten', () => {
  assert.equal(lateinNachArabisch('roj baş'), 'رۆژ باش')
  assert.ok(lateinNachArabisch('roj 3!').includes('3!'))
})

test('arabische Schrift laesst sich zurueck nach Latein wandeln', () => {
  assert.equal(arabischNachLatein('نان'), 'nan')
  assert.equal(arabischNachLatein('شوور'), 'şûr')
  assert.equal(arabischNachLatein('ئاڤ'), 'av')
})

test('Sonderzeichen der arabischen Schrift werden abgebildet, Unbekanntes bleibt', () => {
  assert.equal(arabischNachLatein('ڕۆژ'), 'roj')
  assert.equal(arabischNachLatein('باش!'), 'baş!')
})

test('Woerter ohne i-Auslassung ueberleben den Rundflug', () => {
  for (const wort of ['nan', 'roj baş', 'şûr', 'av']) {
    assert.equal(arabischNachLatein(lateinNachArabisch(wort)), wort)
  }
})

/* ===== Kurmancî-Sonderzeichen, Hin- und Rueckweg ===== */

test('die Sonderzeichen ç ê î ş x kommen einzeln unbeschadet zurueck', () => {
  // Fuenf der sechs Sonderzeichen haben in der arabischen Schrift ein
  // eigenes, eindeutiges Zeichen — der Rundlauf ist hier verlustfrei.
  assert.equal(lateinNachArabisch('ç'), 'چ')
  assert.equal(lateinNachArabisch('ş'), 'ش')
  assert.equal(lateinNachArabisch('x'), 'خ')
  // ê und î stehen am Wortanfang mit Traegerzeichen.
  assert.equal(lateinNachArabisch('ê'), 'ئێ')
  assert.equal(lateinNachArabisch('î'), 'ئی')

  for (const zeichen of ['ç', 'ê', 'î', 'ş', 'x']) {
    assert.equal(
      arabischNachLatein(lateinNachArabisch(zeichen)),
      zeichen,
      `Rundlauf fuer ${zeichen}`
    )
  }
})

test('die Sonderzeichen ueberleben den Rundlauf auch mitten im Wort', () => {
  for (const wort of ['çûn', 'şeş', 'îş', 'xwe', 'mêr', 'şîr', 'keç', 'fêkî']) {
    assert.equal(arabischNachLatein(lateinNachArabisch(wort)), wort, `Rundlauf fuer ${wort}`)
  }
})

test('û mitten im Wort ist verlustfrei — der Digraph وو bleibt als Paar erhalten', () => {
  assert.equal(lateinNachArabisch('çûn'), 'چوون')
  assert.equal(arabischNachLatein('چوون'), 'çûn')
  assert.equal(arabischNachLatein(lateinNachArabisch('hûn')), 'hûn')
})

test('normale Woerter ohne Stolperstelle laufen sauber hin und zurueck', () => {
  for (const wort of ['nan', 'baş', 'bav', 'zarok', 'heval', 'welat', 'goşt', 'penîr']) {
    assert.equal(arabischNachLatein(lateinNachArabisch(wort)), wort, `Rundlauf fuer ${wort}`)
  }
})

/* ===== Stichprobe aus den echten Kursdaten ===== */

const kursWoerter = [...new Set(kurse.flatMap((kurs) => kurs.woerter.map((w) => w.ku)))]

test('die Kursdaten liefern eine brauchbare Stichprobe', () => {
  // Faellt der Wortschatz weg oder wird umbenannt, sollen die folgenden
  // Tests nicht still auf einer leeren Liste gruen werden.
  assert.ok(kursWoerter.length > 100, `nur ${kursWoerter.length} Kurswoerter gefunden`)
})

test('kein einziges Kurswort bringt die Umwandlung zum Absturz', () => {
  for (const wort of kursWoerter) {
    const arabisch = lateinNachArabisch(wort)
    assert.equal(typeof arabisch, 'string', `l2a(${wort})`)
    assert.equal(typeof arabischNachLatein(arabisch), 'string', `a2l fuer ${wort}`)
  }
})

test('ausgewaehlte Kurswoerter treffen genau die erwartete arabische Schrift', () => {
  assert.equal(lateinNachArabisch('spas'), 'سپاس')
  assert.equal(lateinNachArabisch('pênc'), 'پێنج')
  assert.equal(lateinNachArabisch('heşt'), 'هەشت')
  assert.equal(lateinNachArabisch('sêv'), 'سێڤ')
  assert.equal(lateinNachArabisch('çîrok'), 'چیرۆک')
})

test('gut die Haelfte der Kurswoerter ist verlustfrei — der Rest siehe unten', () => {
  const verlustfrei = kursWoerter.filter(
    (wort) => arabischNachLatein(lateinNachArabisch(wort)) === wort.toLowerCase()
  )
  // Kein exakter Wert: der Wortschatz waechst. Die Schranke haelt nur fest,
  // dass die Umschrift nicht heimlich schlechter wird.
  assert.ok(
    verlustfrei.length > kursWoerter.length * 0.4,
    `nur ${verlustfrei.length} von ${kursWoerter.length} Kurswoertern verlustfrei`
  )
})

test('nach einem Rundlauf ist jedes Kurswort stabil — ein zweiter aendert nichts', () => {
  // Wichtiger als Verlustfreiheit: die Umschrift darf nicht bei jedem
  // Durchgang weiter abdriften. Nach einem Durchlauf steht das Ergebnis fest.
  for (const wort of kursWoerter) {
    const einmal = arabischNachLatein(lateinNachArabisch(wort))
    const zweimal = arabischNachLatein(lateinNachArabisch(einmal))
    assert.equal(zweimal, einmal, `nicht stabil: ${wort}`)
  }
})

/* ===== Grenzfaelle ===== */

test('leerer Text bleibt leer', () => {
  assert.equal(lateinNachArabisch(''), '')
  assert.equal(arabischNachLatein(''), '')
})

test('reiner Leerraum bleibt unveraendert erhalten', () => {
  assert.equal(lateinNachArabisch('   '), '   ')
  assert.equal(lateinNachArabisch('  roj  baş  '), '  رۆژ  باش  ')
  assert.equal(lateinNachArabisch('roj\n\tbaş'), 'رۆژ\n\tباش')
})

test('null und undefined werfen einen TypeError — beide Funktionen erwarten Text', () => {
  // Festgehalten, nicht geaendert: die Funktionen sind auf `string` getippt.
  // Wer sie ungetippt aus JSX heraus mit null fuettert, bekommt einen
  // klaren Fehler statt einer stillen Falschausgabe.
  assert.throws(() => lateinNachArabisch(null), TypeError)
  assert.throws(() => lateinNachArabisch(undefined), TypeError)
  assert.throws(() => arabischNachLatein(null), TypeError)
  assert.throws(() => arabischNachLatein(undefined), TypeError)
})

test('Ziffern gehen unveraendert durch beide Richtungen', () => {
  assert.equal(lateinNachArabisch('123'), '123')
  assert.equal(arabischNachLatein('123'), '123')
  assert.equal(lateinNachArabisch('roj 2025'), 'رۆژ 2025')
})

test('Satzzeichen bleiben stehen, auch das arabische Komma', () => {
  assert.equal(lateinNachArabisch('roj, baş!'), 'رۆژ, باش!')
  assert.equal(lateinNachArabisch('Tu çawa yî?'), 'تو چاوا یی?')
  // Das arabische Komma steht in keiner Tabelle und bleibt darum, wie es ist.
  assert.equal(arabischNachLatein('رۆژ، باش!'), 'roj، baş!')
})

test('bereits arabische Schrift laesst lateinNachArabisch unberuehrt', () => {
  // Keine arabische Letter ist ein Schluessel der Latein-Tabelle, es gibt
  // also nichts zu ersetzen. Ein doppelter Klick auf "umwandeln" schadet nicht.
  for (const wort of ['نان', 'رۆژ', 'ئاڤ', 'شوور', 'چوون']) {
    assert.equal(lateinNachArabisch(wort), wort, `unveraendert: ${wort}`)
  }
})

test('bereits lateinische Schrift laesst arabischNachLatein weitgehend unberuehrt', () => {
  assert.equal(arabischNachLatein('nan'), 'nan')
  assert.equal(arabischNachLatein('roj baş'), 'roj baş')
})

/* ===== Bekannte Verluste im Rundlauf =====
   Eine Umschrift zwischen zwei Schriften ist selten umkehrbar. Die folgenden
   Faelle sind KEIN Versehen der Tests, sondern der festgehaltene Ist-Zustand.
   Aendert sich die Umschrift, sollen sie auffallen. */

test('bekannter Verlust: das kurze i wird nicht geschrieben und kehrt nie zurueck', () => {
  // In der arabischen Schrift des Kurmancî hat das kurze `i` kein Zeichen —
  // die Tabelle bildet es auf '' ab. Der Rueckweg kann es nicht erraten.
  assert.equal(lateinNachArabisch('silav'), 'سلاڤ')
  assert.equal(arabischNachLatein('سلاڤ'), 'slav')
  assert.equal(arabischNachLatein(lateinNachArabisch('bira')), 'bra')
  assert.equal(arabischNachLatein(lateinNachArabisch('ziman')), 'zman')
  assert.equal(arabischNachLatein(lateinNachArabisch('birinc')), 'brnc')
})

test('bekannter Verlust: u und w teilen sich das Zeichen و, zurueck kommt immer w', () => {
  // 'u' -> و und 'w' -> و. Der Rueckweg hat nur einen Eintrag fuer و und
  // waehlt 'w'; aus 'tu' wird darum 'tw'.
  assert.equal(lateinNachArabisch('tu'), 'تو')
  assert.equal(lateinNachArabisch('du'), 'دو')
  assert.equal(arabischNachLatein(lateinNachArabisch('tu')), 'tw')
  assert.equal(arabischNachLatein(lateinNachArabisch('du')), 'dw')
  assert.equal(arabischNachLatein(lateinNachArabisch('kur')), 'kwr')
})

test('bekannter Verlust: y und î teilen sich das Zeichen ی, zurueck kommt immer î', () => {
  // 'y' -> ی und 'î' -> ی. Der Rueckweg entscheidet sich fuer 'î'.
  assert.equal(lateinNachArabisch('yek'), 'یەک')
  assert.equal(arabischNachLatein(lateinNachArabisch('yek')), 'îek')
  assert.equal(arabischNachLatein(lateinNachArabisch('çay')), 'çaî')
  assert.equal(arabischNachLatein(lateinNachArabisch('dayik')), 'daîk')
})

test('bekannter Verlust: û am Wortanfang kommt als uw zurueck', () => {
  // Hier liegt die Ursache NICHT in der Schrift, sondern in der Reihenfolge
  // der Rueckwaerts-Tabelle: 'û' am Wortanfang wird zu ئ + وو = 'ئوو'.
  // Zurueck greift der Zwei-Zeichen-Eintrag 'ئو' -> 'u' zuerst und laesst ein
  // einzelnes و uebrig, das zu 'w' wird. Mitten im Wort passiert das nicht,
  // dort steht وو allein und trifft den Eintrag 'وو' -> 'û'.
  assert.equal(lateinNachArabisch('û'), 'ئوو')
  assert.equal(arabischNachLatein('ئوو'), 'uw')
  assert.equal(arabischNachLatein(lateinNachArabisch('ûr')), 'uwr')
  // Zum Vergleich der saubere Fall mitten im Wort:
  assert.equal(arabischNachLatein(lateinNachArabisch('çûn')), 'çûn')
})

test('bekannter Sonderfall: ein alleinstehendes i ergibt nur das Traegerzeichen', () => {
  // 'i' zaehlt als Vokal, bekommt also am Wortanfang das Traegerzeichen ئ —
  // hat selbst aber kein Zeichen. Uebrig bleibt der blosse Traeger.
  assert.equal(lateinNachArabisch('i'), 'ئ')
  assert.equal(arabischNachLatein('ئ'), '')
})

/* ===== Sprachausgabe ===== */

test('das Modul laedt ohne Browser — die Sprachausgabe wird dabei nicht angefasst', async () => {
  // Unter Node gibt es kein `window`. Der Import darf trotzdem nicht scheitern,
  // sonst waeren die reinen Funktionen oben nicht testbar. `sprich` selbst
  // wird hier bewusst NICHT aufgerufen: die Funktion liest `window` und wuerde
  // unter Node einen ReferenceError werfen.
  const modul = await import('../src/core/schrift/transliteration.ts')
  assert.equal(typeof modul.sprich, 'function')
  assert.equal(typeof modul.hatKurdischeStimme, 'function')
  assert.equal(typeof globalThis.window, 'undefined')
})

test('auch die Zeichen, die nur beim Lesen vorkommen, werden umgeschrieben', () => {
  // lateinNachArabisch erzeugt diese Zeichen nie — sie stehen in Texten aus
  // anderen Quellen (soranî-Schreibungen, arabische Lehnwörter). Der Rundlauf
  // erreicht sie deshalb nicht; ohne diesen Test bliebe die halbe A2L-Tabelle
  // ungeprüft (per Mutationstest belegt).
  const NUR_LESEN = [
    ['ھ', 'h'], // zweite Form des h
    ['ك', 'k'], // arabisches k
    ['ڵ', 'l'], // velares l
    ['غ', 'x'],
    ['ح', 'h'],
    ['ص', 's'],
    ['ط', 't'],
    ['ي', 'î'], // arabisches y
    ['ع', "'"],
  ]
  for (const [arabisch, latein] of NUR_LESEN) {
    assert.equal(arabischNachLatein(arabisch), latein, `${arabisch} soll ${latein} ergeben`)
  }
  // Das Dehnungszeichen wird verworfen, nicht übernommen.
  assert.equal(arabischNachLatein('بـب'), 'bb')
})
