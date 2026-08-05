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

test('Bau- und Schreib-Schritte mit Huelle/Skript sind stimmig', () => {
  for (const [id, schritte] of Object.entries(alleSchritte)) {
    for (const s of schritte.filter((x) => x.art === 'bauen' || x.art === 'tippen')) {
      if (s.huelle) {
        assert.ok(s.huelle.includes('{{code}}'), `${id}: Huelle ohne {{code}}`)
      }
      if (s.skript) {
        assert.ok(s.huelle && s.huelle.includes('<script>'), `${id}: skript ohne <script>-Huelle`)
      }
    }
  }
})

test('Schreib-Schritte: Musterloesung besteht die Pruefliste, der Start nicht', () => {
  let anzahl = 0
  for (const [id, schritte] of Object.entries(alleSchritte)) {
    for (const s of schritte.filter((x) => x.art === 'tippen')) {
      anzahl += 1
      assert.ok(s.auftrag, `${id}: Auftrag fehlt`)
      assert.ok(s.checks && s.checks.length >= 1, `${id}: keine Pruefliste`)
      for (const c of s.checks) {
        assert.ok(c.id && c.text, `${id}: Check ohne Id/Text`)
        assert.equal(typeof c.pruefe, 'function', `${id}/${c.id}: pruefe fehlt`)
        assert.ok(c.pruefe(s.musterloesung), `${id}: Musterloesung faellt bei „${c.text}" durch`)
      }
      const start = s.startText || ''
      assert.equal(
        s.checks.every((c) => c.pruefe(start)),
        false,
        `${id}: schon der Start besteht alles`
      )
    }
  }
  assert.ok(anzahl >= 7, 'mindestens sieben Schreib-Schritte')
})

test('Schreib-Schritte tolerieren schlaue Anfuehrungszeichen (iOS)', () => {
  const js1 = alleSchritte['js-1'].find((s) => s.art === 'tippen')
  const mitSchlauen = js1.checks.every((c) =>
    c.pruefe("document.querySelector('#gruss').textContent = ‚Silav!';")
  )
  assert.equal(mitSchlauen, true)
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
