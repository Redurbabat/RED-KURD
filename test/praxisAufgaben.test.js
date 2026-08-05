// Tests fuer die Mitmach-Aufgaben aller Bereiche: Jede Aufgabe muss in sich
// stimmig sein — die Musterloesung besteht ALLE Pruefungen, der Startcode
// loest die Aufgabe nicht schon von allein.
import test from 'node:test'
import assert from 'node:assert/strict'

const { codePraxisAufgaben } = await import('../src/features/code-learning/data/codePraxis.js')
const { electroPraxisAufgaben } = await import(
  '../src/features/electro-learning/data/electroPraxis.js'
)
const { promptPraxisAufgaben } = await import(
  '../src/features/prompting-learning/data/promptPraxis.js'
)

const BEREICHE = [
  ['Code', codePraxisAufgaben, 'html'],
  ['Elektro', electroPraxisAufgaben, 'zahl'],
  ['Prompting', promptPraxisAufgaben, 'text'],
]

const ARTEN = new Set(['html', 'text', 'zahl'])

for (const [name, aufgaben, erwarteteArt] of BEREICHE) {
  test(`${name}: jede Mitmach-Aufgabe ist vollstaendig`, () => {
    const ids = aufgaben.map((a) => a.id)
    assert.equal(new Set(ids).size, ids.length, 'Ids sind einmalig')
    assert.ok(aufgaben.length >= 3, 'mindestens drei Aufgaben')
    for (const a of aufgaben) {
      assert.ok(a.title && a.auftrag && a.description && a.topic, a.id)
      assert.ok(ARTEN.has(a.art), `${a.id}: unbekannte Art ${a.art}`)
      assert.equal(a.art, erwarteteArt, `${a.id}: Art passt zum Bereich`)
      assert.ok(a.checks.length >= 1, `${a.id}: keine Pruefliste`)
      for (const c of a.checks) {
        assert.ok(c.id && c.text, `${a.id}: Check ohne Id/Text`)
        assert.equal(typeof c.pruefe, 'function', `${a.id}/${c.id}: pruefe fehlt`)
      }
      assert.ok('musterloesung' in a, `${a.id}: Musterloesung fehlt`)
    }
  })

  test(`${name}: die Musterloesung besteht alle Pruefungen`, () => {
    for (const a of aufgaben) {
      for (const c of a.checks) {
        assert.ok(
          c.pruefe(a.musterloesung),
          `${a.id}: Musterloesung faellt bei „${c.text}" durch`
        )
      }
    }
  })

  test(`${name}: der Startzustand loest die Aufgabe nicht von allein`, () => {
    for (const a of aufgaben) {
      const start = a.startCode || ''
      const alleOk = a.checks.every((c) => c.pruefe(start))
      assert.equal(alleOk, false, `${a.id}: schon der Startcode besteht alles`)
    }
  })
}

test('Rechen-Pruefungen verstehen Komma und Punkt und lehnen Unsinn ab', () => {
  const strom = electroPraxisAufgaben.find((a) => a.id === 'elpraxis-strom')
  const check = strom.checks[0]
  assert.equal(check.pruefe('3'), true)
  assert.equal(check.pruefe('3,0'), true)
  assert.equal(check.pruefe('3.0'), true)
  assert.equal(check.pruefe(' 3 '), true)
  assert.equal(check.pruefe('4'), false)
  assert.equal(check.pruefe('drei'), false)
  assert.equal(check.pruefe(''), false)
})

test('HTML-Pruefungen erkennen echte Loesungen, nicht nur Schluesselwoerter im Kommentar', () => {
  const button = codePraxisAufgaben.find((a) => a.id === 'praxis-button')
  const mitButton = button.checks.every((c) =>
    c.pruefe('<h1>Hi</h1>\n<button type="button">Speichern</button>')
  )
  assert.equal(mitButton, true)
  const ohneButton = button.checks.every((c) => c.pruefe('<h1>Hi</h1>'))
  assert.equal(ohneButton, false)
})

test('Formular-Pruefung verlangt, dass for und id wirklich zusammenpassen', () => {
  const formular = codePraxisAufgaben.find((a) => a.id === 'praxis-formular')
  const verbunden = formular.checks.find((c) => c.id === 'verbunden')
  assert.equal(
    verbunden.pruefe('<label for="name">Name</label>\n<input id="name" type="text" />'),
    true
  )
  assert.equal(
    verbunden.pruefe('<label for="name">Name</label>\n<input id="mail" type="text" />'),
    false,
    'for und id passen nicht zusammen'
  )
  assert.equal(verbunden.pruefe('<input id="name" />'), false, 'ohne Label kein Treffer')
})

test('HTML-Pruefungen tolerieren schlaue Anfuehrungszeichen (iOS-Tastatur)', () => {
  const button = codePraxisAufgaben.find((a) => a.id === 'praxis-button')
  const mitSchlauenZeichen = button.checks.every((c) =>
    c.pruefe('<h1>Hi</h1>\n<button type=„button“>Speichern</button>')
  )
  assert.equal(mitSchlauenZeichen, true)
})
