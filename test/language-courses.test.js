import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SPRACHKURSE, holeSprachkapitel, holeSprachkurs } from '../src/data/sprachkurse.js'

test('alle Sprachkurse haben gleich viele Kapitel und vollstaendige Wortlisten', () => {
  assert.equal(SPRACHKURSE.length, 4)
  const kapitelZahl = SPRACHKURSE[0].kapitel.length
  assert.ok(kapitelZahl >= 10, `nur ${kapitelZahl} Kapitel`)
  for (const kurs of SPRACHKURSE) {
    // Alle Kurse muessen denselben Umfang haben — sonst fehlen Uebersetzungen.
    assert.equal(kurs.kapitel.length, kapitelZahl, kurs.name)
    assert.equal(
      kurs.kapitel.flatMap((kapitel) => kapitel.woerter).length,
      kapitelZahl * 8,
      kurs.name
    )
    assert.equal(kurs.locale.includes('-'), true, kurs.name)
  }
})

test('jedes Mehrsprachen-Kapitel hat Audio-, Foto- und Quizdaten', () => {
  for (const kurs of SPRACHKURSE) {
    for (const kapitel of kurs.kapitel) {
      assert.equal(kapitel.woerter.length, 8)
      assert.match(kapitel.foto.src, /^\/bilder\/(lernwelt|kapitel)\/.+\.jpg$/)
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
  // Zwei Quellen: die alte lernwelt-Bibliothek und die Kapitel-Bibliothek.
  const lernwelt = JSON.parse(
    readFileSync(resolve('public/bilder/lernwelt/credits.json'), 'utf8')
  )
  const kapitel = JSON.parse(readFileSync(resolve('public/bilder/kapitel/credits.json'), 'utf8'))
  const nachweisIds = new Set([
    ...lernwelt.fotos.map((foto) => foto.id),
    ...kapitel.fotos.map((foto) => foto.id),
  ])
  const fotos = SPRACHKURSE.flatMap((kurs) => kurs.kapitel.map((kapitel) => kapitel.foto))

  for (const foto of fotos) {
    assert.equal(existsSync(resolve('public', foto.src.replace(/^\//, ''))), true, foto.src)
    assert.equal(nachweisIds.has(foto.quelle), true, `Nachweis fehlt: ${foto.quelle}`)
  }
})

test('jedes Kapitelfoto der App traegt Urheber und Lizenz', () => {
  const kapitel = JSON.parse(readFileSync(resolve('public/bilder/kapitel/credits.json'), 'utf8'))
  assert.ok(kapitel.fotos.length >= 48)
  for (const foto of kapitel.fotos) {
    assert.ok(foto.urheber, `${foto.id}: Urheber fehlt`)
    assert.ok(foto.lizenz, `${foto.id}: Lizenz fehlt`)
    assert.ok(foto.quelle?.startsWith('https://'), `${foto.id}: Quelle fehlt`)
  }
})
