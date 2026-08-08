import test from 'node:test'
import assert from 'node:assert/strict'
import {
  aktualisiereSerie,
  ligaFuerAufgaben,
  tageZwischen,
} from '../src/core/progress/gamification.ts'

test('Kalendertage werden unabhängig von Uhrzeit und Sommerzeit gezählt', () => {
  assert.equal(tageZwischen('2026-03-28', '2026-03-30'), 2)
  assert.equal(tageZwischen('2026-12-31', '2027-01-01'), 1)
})

test('ein Serien-Schutz überbrückt genau einen ausgelassenen Tag', () => {
  assert.deepEqual(
    aktualisiereSerie(
      { serie: 8, letzterTag: '2026-07-29', serienSchutz: 1 },
      '2026-07-31'
    ),
    {
      serie: 9,
      letzterTag: '2026-07-31',
      serienSchutz: 0,
      schutzBenutzt: 1,
    }
  )
})

test('ein unzureichender Schutz wird nicht verschwendet', () => {
  assert.deepEqual(
    aktualisiereSerie(
      { serie: 8, letzterTag: '2026-07-27', serienSchutz: 1 },
      '2026-07-31'
    ),
    {
      serie: 1,
      letzterTag: '2026-07-31',
      serienSchutz: 1,
      schutzBenutzt: 0,
    }
  )
})

test('die lokale Wochenliga hat klare, stabile Schwellen', () => {
  assert.equal(ligaFuerAufgaben(0).name, 'Tal-Liga')
  assert.equal(ligaFuerAufgaben(25).name, 'Pfad-Liga')
  assert.equal(ligaFuerAufgaben(60).name, 'Berg-Liga')
  assert.equal(ligaFuerAufgaben(120).name, 'Gipfel-Liga')
  assert.equal(ligaFuerAufgaben(45).fehlen, 15)
})
