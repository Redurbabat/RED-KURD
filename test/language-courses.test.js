import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SPRACHKURSE, holeSprachkapitel, holeSprachkurs } from '../src/data/sprachkurse.js'

test('vier zusätzliche Sprachkurse besitzen jeweils sechs Kapitel und 48 Lernpaare', () => {
  assert.equal(SPRACHKURSE.length, 4)
  for (const kurs of SPRACHKURSE) {
    assert.equal(kurs.kapitel.length, 6, kurs.name)
    assert.equal(kurs.kapitel.flatMap((kapitel) => kapitel.woerter).length, 48, kurs.name)
    assert.equal(kurs.locale.includes('-'), true, kurs.name)
  }
})

test('jedes Mehrsprachen-Kapitel hat Audio-, Foto- und Quizdaten', () => {
  for (const kurs of SPRACHKURSE) {
    for (const kapitel of kurs.kapitel) {
      assert.equal(kapitel.woerter.length, 8)
      assert.match(kapitel.foto.src, /^\/bilder\/lernwelt\/.+\.jpg$/)
      assert.ok(kapitel.foto.alt)
      for (const wort of kapitel.woerter) {
        assert.ok(wort.de)
        assert.ok(wort.ziel)
        assert.ok(wort.bild)
      }
    }
  }
})

test('Kurs- und Kapitelauflösung funktionieren für Tiefenlinks', () => {
  assert.equal(holeSprachkurs('englisch')?.name, 'Englisch')
  assert.equal(holeSprachkapitel('franzoesisch', 'essen')?.name, 'Essen & Trinken')
  assert.equal(holeSprachkurs('nicht-da'), null)
  assert.equal(holeSprachkapitel('englisch', 'nicht-da'), null)
})

test('alle verwendeten echten Fotos liegen lokal vor und haben Quellenangaben', () => {
  const credits = JSON.parse(
    readFileSync(resolve('public/bilder/lernwelt/credits.json'), 'utf8')
  )
  const nachweisIds = new Set(credits.fotos.map((foto) => foto.id))
  const fotos = SPRACHKURSE.flatMap((kurs) => kurs.kapitel.map((kapitel) => kapitel.foto))

  for (const foto of fotos) {
    assert.equal(existsSync(resolve('public', foto.src.replace(/^\//, ''))), true, foto.src)
    assert.equal(nachweisIds.has(foto.quelle), true, `Nachweis fehlt: ${foto.quelle}`)
  }
})
