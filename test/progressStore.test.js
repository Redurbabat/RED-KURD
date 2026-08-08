// Tests fuer den einen Lernstand aller drei Modi: XP, Serie, Sterne,
// Karten, Tagesaktivitaet, Tagesziel und Truhen.
import test from 'node:test'
import assert from 'node:assert/strict'

class SpeicherAttrappe {
  constructor() {
    this.daten = new Map()
  }
  getItem(key) {
    return this.daten.has(key) ? this.daten.get(key) : null
  }
  setItem(key, wert) {
    this.daten.set(key, String(wert))
  }
  removeItem(key) {
    this.daten.delete(key)
  }
}
globalThis.localStorage = new SpeicherAttrappe()

const {
  ankiZeilen,
  einheitAbgeschlossen,
  exportiereAlles,
  gibEdelsteine,
  gibSerienSchutz,
  gibXp,
  holeFortschritt,
  holeTageszielBelohnung,
  istLernstand,
  karteBewerten,
  kennstWort,
  level,
  merkeWort,
  oeffneWeltTruhe,
  setzeFortschritt,
  setzeSterne,
  sterneVon,
  tagesZiel,
  truheOeffnen,
  vergissWort,
  zahleEdelsteine,
  zaehleAufgabe,
} = await import('../src/core/progress/progressStore.js')
const { heute, tagPlus, tagVon } = await import('../src/core/progress/scheduler.ts')

// ===== XP und Serie =====

test('der erste XP-Gewinn des Tages startet bzw. verlaengert die Serie', () => {
  setzeFortschritt({})
  gibXp(10)
  const d = holeFortschritt()
  assert.equal(d.xp, 10)
  assert.equal(d.serie, 1)
  assert.equal(d.letzterTag, heute())
})

test('weitere XP am selben Tag erhoehen die Serie nicht noch einmal', () => {
  setzeFortschritt({})
  gibXp(10)
  gibXp(10)
  const d = holeFortschritt()
  assert.equal(d.xp, 20)
  assert.equal(d.serie, 1)
})

test('XP von gestern setzen die Serie heute korrekt fort', () => {
  setzeFortschritt({ xp: 0, serie: 4, letzterTag: tagPlus(-1) })
  gibXp(5)
  assert.equal(holeFortschritt().serie, 5)
})

test('level rechnet 100 XP je Stufe', () => {
  setzeFortschritt({ xp: 250 })
  assert.deepEqual(level(), { stufe: 3, fortschritt: 50, bisNaechstes: 50 })
})

test('der Serien-Schutz ist auf drei gedeckelt', () => {
  setzeFortschritt({})
  gibSerienSchutz(2)
  assert.equal(gibSerienSchutz(5), 3)
})

// ===== Edelsteine =====

test('zahleEdelsteine bucht nur ab, wenn genug da sind', () => {
  setzeFortschritt({ edelsteine: 3 })
  assert.equal(zahleEdelsteine(5), false)
  assert.equal(holeFortschritt().edelsteine, 3)
  assert.equal(zahleEdelsteine(2), true)
  assert.equal(holeFortschritt().edelsteine, 1)
})

test('Edelsteine fallen nie unter null', () => {
  setzeFortschritt({ edelsteine: 1 })
  gibEdelsteine(-10)
  assert.equal(holeFortschritt().edelsteine, 0)
})

// ===== Einheiten und Sterne =====

test('einheitAbgeschlossen behaelt immer den besten Durchgang', () => {
  setzeFortschritt({})
  einheitAbgeschlossen('begruessung', 70)
  einheitAbgeschlossen('begruessung', 90)
  einheitAbgeschlossen('begruessung', 60)
  assert.equal(holeFortschritt().einheiten.begruessung, 90)
})

test('die Sterne-Matrix: unter 50 nichts, ab 50 einer, ab 80 zwei', () => {
  setzeFortschritt({})
  assert.equal(setzeSterne('a', 40), 0)
  assert.equal(setzeSterne('b', 50), 1)
  assert.equal(setzeSterne('c', 79), 1)
  assert.equal(setzeSterne('d', 80), 2)
})

test('der dritte Stern kommt erst mit der zweiten BESTANDENEN Pruefung', () => {
  setzeFortschritt({})
  assert.equal(setzeSterne('begruessung', 95), 2)
  // Ein nicht bestandener Versuch dazwischen zaehlt nicht als Durchgang.
  assert.equal(setzeSterne('begruessung', 50), 2)
  assert.equal(setzeSterne('begruessung', 85), 3)
  assert.equal(sterneVon('begruessung'), 3)
})

test('Sterne gehen nie wieder verloren', () => {
  setzeFortschritt({})
  setzeSterne('a', 85)
  setzeSterne('a', 40)
  assert.equal(sterneVon('a'), 2)
})

// ===== Karten =====

test('karteBewerten legt die Karte an und stuft sie nach Antwort', () => {
  setzeFortschritt({})
  karteBewerten('Brot', 'nan', 'erkennen', true)
  let karte = holeFortschritt().karten['Brot|nan|erkennen']
  assert.equal(karte.stufe, 1)
  karteBewerten('Brot', 'nan', 'erkennen', false)
  karte = holeFortschritt().karten['Brot|nan|erkennen']
  assert.equal(karte.stufe, 0)
  assert.equal(karte.faellig, heute())
  assert.equal(karte.gesehen, 2)
})

test('merkeWort nimmt ein Wort nur einmal auf, vergissWort entfernt es', () => {
  setzeFortschritt({})
  assert.equal(merkeWort('Wasser', 'av'), true)
  assert.equal(merkeWort('Wasser', 'av'), false)
  assert.equal(kennstWort('Wasser', 'av'), true)
  assert.equal(vergissWort('Wasser', 'av'), true)
  assert.equal(kennstWort('Wasser', 'av'), false)
  assert.equal(vergissWort('Wasser', 'av'), false)
})

// ===== Tagesaktivitaet =====

test('zaehleAufgabe zaehlt Treffer, Serienfolge und Fertigkeit', () => {
  setzeFortschritt({})
  zaehleAufgabe(true, 10, 'hoeren')
  zaehleAufgabe(true, 5, 'hoeren')
  zaehleAufgabe(false, 5, 'schreiben')
  zaehleAufgabe(true, 10, 'hoeren')
  const e = holeFortschritt().tage[heute()]
  assert.equal(e.aufgaben, 4)
  assert.equal(e.richtig, 3)
  assert.equal(e.maxFolge, 2)
  assert.equal(e.folge, 1)
  assert.deepEqual(e.skills, { hoeren: 3, schreiben: 1 })
  assert.equal(e.sekunden, 30)
  assert.equal(holeFortschritt().lernzeit, 30)
})

test('die Tagesliste behaelt nur die letzten 60 Tage', () => {
  const tage = {}
  for (let i = 100; i > 35; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    tage[tagVon(d)] = { aufgaben: 1, richtig: 1, sekunden: 10 }
  }
  setzeFortschritt({ tage })
  zaehleAufgabe(true, 5)
  const alle = Object.keys(holeFortschritt().tage)
  assert.equal(alle.length, 60)
  assert.ok(alle.includes(heute()), 'der heutige Tag bleibt erhalten')
  assert.equal(alle.sort()[0] > tagVon(new Date(Date.now() - 101 * 864e5)), true)
})

// ===== Tagesziel und Truhen =====

test('die Tagesziel-Belohnung gibt es erst am Ziel — und nur einmal am Tag', () => {
  setzeFortschritt({})
  for (let i = 0; i < 19; i++) zaehleAufgabe(true, 1)
  assert.equal(holeTageszielBelohnung(20), null)
  zaehleAufgabe(true, 1)
  assert.deepEqual(holeTageszielBelohnung(20), { xp: 20, edelsteine: 1 })
  assert.equal(holeTageszielBelohnung(20), null)
  assert.equal(tagesZiel(20).belohnt, true)
})

test('die Tagestruhe folgt der festen Belohnungsreihe und oeffnet einmal pro Tag', () => {
  setzeFortschritt({ serie: 4 }) // Stufe 4: 30 XP, 2 Edelsteine, 1 Schluessel
  assert.deepEqual(truheOeffnen(), { xp: 30, edelsteine: 2, schluessel: 1 })
  assert.equal(truheOeffnen(), null)
  const d = holeFortschritt()
  assert.equal(d.xp, 30)
  assert.equal(d.schluessel, 1)
})

test('eine Welt-Truhe laesst sich genau einmal oeffnen', () => {
  setzeFortschritt({})
  assert.equal(oeffneWeltTruhe('w1', 5), 5)
  assert.equal(oeffneWeltTruhe('w1', 5), null)
  assert.equal(holeFortschritt().edelsteine, 5)
})

// ===== Export =====

test('exportiereAlles liefert gueltiges JSON ohne Sitzung und ohne Doppelung', () => {
  setzeFortschritt({ xp: 42 })
  const daten = JSON.parse(exportiereAlles())
  assert.equal(daten.app, 'RED-KURD')
  assert.equal(daten.fortschritt.xp, 42)
  assert.ok(!('sitzung' in daten.speicher), 'die Sitzung bleibt geraete-lokal')
  assert.ok(!('fortschritt' in daten.speicher), 'der Fortschritt steht nur einmal in der Datei')
})

test('istLernstand erkennt echte Lernstaende und weist Muell ab', () => {
  assert.equal(istLernstand({ xp: 10, karten: {} }), true)
  assert.equal(istLernstand({ einheiten: { begruessung: 80 } }), true)
  assert.equal(istLernstand({ version: 2 }), false, 'kein bekanntes Lernfeld')
  assert.equal(istLernstand(null), false)
  assert.equal(istLernstand('xp: 10'), false)
  assert.equal(istLernstand([{ xp: 10 }]), false)
  assert.equal(istLernstand({ xp: 10, karten: 'kaputt' }), false, 'karten muss ein Objekt sein')
  assert.equal(istLernstand({ serie: 3, tage: [1, 2] }), false, 'tage darf keine Liste sein')
})

test('ankiZeilen exportiert jedes Wortpaar genau einmal mit Tab', () => {
  setzeFortschritt({
    karten: {
      'Brot|nan|erkennen': { stufe: 1 },
      'Brot|nan|schreiben': { stufe: 2 },
      'Wasser|av|erkennen': { stufe: 1 },
    },
  })
  assert.equal(ankiZeilen(), 'Brot\tnan\nWasser\tav')
})
