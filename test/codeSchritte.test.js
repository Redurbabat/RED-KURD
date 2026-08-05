// Tests fuer die interaktiven Lektions-Schritte: Jeder Schritt muss in sich
// stimmig sein — die Wahl hat genau eine richtige Antwort im gueltigen
// Bereich, und die Bausteine ergeben (richtig sortiert) genau die Loesung.
import test from 'node:test'
import assert from 'node:assert/strict'

const { alleSchritte, holeSchritte } = await import(
  '../src/features/code-learning/data/codeSchritte.js'
)
const { codeLearningPaths } = await import('../src/features/code-learning/data/codeLessons.js')

const lektionIds = new Set(codeLearningPaths.flatMap((p) => p.lessons.map((l) => l.id)))

test('jede Schritte-Sammlung gehoert zu einer echten Lektion', () => {
  for (const id of Object.keys(alleSchritte)) {
    assert.ok(lektionIds.has(id), `${id}: Lektion gibt es nicht`)
    assert.ok(alleSchritte[id].length >= 3, `${id}: mindestens drei Schritte`)
  }
})

test('HTML-, CSS- und JavaScript-Pfad sind komplett interaktiv', () => {
  for (const pfadId of ['html', 'css', 'javascript']) {
    const pfad = codeLearningPaths.find((p) => p.id === pfadId)
    for (const lektion of pfad.lessons) {
      assert.ok(holeSchritte(lektion.id), `${lektion.id}: Schritte fehlen`)
    }
  }
})

test('Bau-Schritte mit Huelle/Skript sind stimmig', () => {
  for (const [id, schritte] of Object.entries(alleSchritte)) {
    for (const s of schritte.filter((x) => x.art === 'bauen')) {
      if (s.huelle) {
        assert.ok(s.huelle.includes('{{code}}'), `${id}: Huelle ohne {{code}}`)
      }
      if (s.skript) {
        assert.ok(s.huelle && s.huelle.includes('<script>'), `${id}: skript ohne <script>-Huelle`)
      }
    }
  }
})

test('Wahl-Schritte: eine richtige Antwort im gueltigen Bereich', () => {
  for (const [id, schritte] of Object.entries(alleSchritte)) {
    for (const s of schritte.filter((x) => x.art === 'wahl')) {
      assert.ok(s.frage, `${id}: Frage fehlt`)
      assert.ok(s.optionen.length >= 2, `${id}: zu wenige Antworten`)
      assert.equal(new Set(s.optionen).size, s.optionen.length, `${id}: doppelte Antwort`)
      assert.ok(
        Number.isInteger(s.richtig) && s.richtig >= 0 && s.richtig < s.optionen.length,
        `${id}: richtig-Index kaputt`
      )
    }
  }
})

test('Bau-Schritte: die Bausteine ergeben genau die Loesung', () => {
  for (const [id, schritte] of Object.entries(alleSchritte)) {
    for (const s of schritte.filter((x) => x.art === 'bauen')) {
      assert.ok(s.auftrag, `${id}: Auftrag fehlt`)
      assert.ok(s.bausteine.length >= 2, `${id}: zu wenige Bausteine`)
      assert.equal(new Set(s.bausteine).size, s.bausteine.length, `${id}: doppelter Baustein`)
      // Es muss eine Reihenfolge geben, in der die Bausteine exakt die
      // Loesung ergeben — sonst kann niemand den Schritt loesen.
      const passt = eineReihenfolgePasst(s.bausteine, s.loesung)
      assert.ok(passt, `${id}: Bausteine ergeben nie „${s.loesung}"`)
      // Und die angezeigte Reihenfolge darf NICHT schon die Loesung sein,
      // sonst tippt man nur stumpf von links nach rechts.
      assert.notEqual(s.bausteine.join(''), s.loesung, `${id}: Bausteine schon vorsortiert`)
    }
  }
})

/** Prueft per Tiefensuche, ob eine Anordnung der Bausteine die Loesung ergibt. */
function eineReihenfolgePasst(bausteine, loesung) {
  function suche(rest, bisher) {
    if (!loesung.startsWith(bisher)) return false
    if (rest.length === 0) return bisher === loesung
    return rest.some((b, i) => suche(rest.filter((_, j) => j !== i), bisher + b))
  }
  return suche(bausteine, '')
}
