// Tests fuer die statische Datenquelle: Satzpaare fuer Satzbau und Lesen.
// Regression: Der fruehere Englisch-Fallback zeigte englische Tatoeba-
// Uebersetzungen als vermeintlich deutschen Text (lang="de") an.
import test from 'node:test'
import assert from 'node:assert/strict'

// Beispielpaket mit nur EINEM deutschen, aber vielen englischen Paaren —
// genau die Lage, in der der alte Fallback Englisch untermischte.
const BEISPIELE = [
  ['kmr', 'Ez baş im.', 'deu', 'Mir geht es gut.'],
  ...Array.from({ length: 12 }, (_, i) => ['kmr', `Hevok ${i}.`, 'eng', `English sentence ${i}.`]),
]

const WOERTER = [
  ['kmr', 'çawa', 'deu', 'wie'],
  ['kmr', 'şêr', 'deu', 'Löwe'],
  ['deu', 'Käse', 'kmr', 'penîr'],
  ['kmr', 'nan', 'deu', 'Brot'],
]

globalThis.fetch = async (pfad) => {
  const daten = {
    '/daten/woerter.json': WOERTER,
    '/daten/wiki.json': [],
    '/daten/beispiele.json': BEISPIELE,
  }
  if (!(pfad in daten)) return { ok: false, status: 404, json: async () => ({}) }
  return { ok: true, status: 200, json: async () => daten[pfad] }
}

const { zufallsPaare, beispieleStatisch, statischeAnzahl, sucheStatisch } = await import(
  '../src/core/data/staticData.js'
)

test('die Suche toleriert fehlende kurdische Sonderzeichen', async () => {
  const { woerter } = await sucheStatisch('cawa')
  assert.equal(woerter.length, 1)
  assert.equal(woerter[0].wort, 'çawa')
  const loewe = await sucheStatisch('ser')
  assert.ok(loewe.woerter.some((w) => w.wort === 'şêr'))
})

test('die Suche toleriert fehlende deutsche Umlaute — in beide Richtungen', async () => {
  const { woerter } = await sucheStatisch('kase')
  assert.equal(woerter.length, 1)
  assert.equal(woerter[0].wort, 'Käse')
  const loewe = await sucheStatisch('löwe')
  assert.ok(loewe.woerter.some((w) => w.uebersetzung === 'Löwe'))
})

test('exakte Schreibweise findet natuerlich weiterhin', async () => {
  const { woerter } = await sucheStatisch('çawa')
  assert.equal(woerter.length, 1)
  const brot = await sucheStatisch('nan')
  assert.equal(brot.woerter[0].uebersetzung, 'Brot')
})

test('zufallsPaare liefert niemals englische Saetze als deutsche', async () => {
  for (let lauf = 0; lauf < 5; lauf++) {
    const paare = await zufallsPaare(10)
    assert.equal(paare.length, 10)
    for (const p of paare) {
      assert.ok(
        !/English sentence/.test(p.uebersetzung),
        `englischer Satz als Uebersetzung: ${p.uebersetzung}`
      )
    }
  }
})

test('fehlende deutsche Paare gleichen die Kapitelsaetze aus', async () => {
  const paare = await zufallsPaare(8)
  // Hoechstens eines kann aus dem Satzpaket stammen (das einzige deu-Paar),
  // der Rest muss aus den Kapiteln kommen.
  const ausPaket = paare.filter((p) => p.uebersetzung === 'Mir geht es gut.')
  assert.ok(ausPaket.length <= 1)
  assert.equal(paare.length, 8)
})

test('beispieleStatisch findet Saetze unabhaengig von der Schreibung', async () => {
  const treffer = await beispieleStatisch('ez baş')
  assert.equal(treffer.length, 1)
  assert.equal(treffer[0].uebersetzung, 'Mir geht es gut.')
})

test('statischeAnzahl meldet die echten Bestandsgroessen', async () => {
  assert.deepEqual(await statischeAnzahl(), { woerter: WOERTER.length, beispiele: BEISPIELE.length })
})
