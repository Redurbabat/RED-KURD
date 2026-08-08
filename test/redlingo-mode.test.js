import test from 'node:test'
import assert from 'node:assert/strict'

import { REDLINGO_NAV, istAktiv } from '../src/components/layout/navConfig.js'
import { appModus, setzeAppModus } from '../src/core/ui/uiStore.ts'

test('Redlingo ist ein eigener gespeicherter Ansichtsmodus', () => {
  setzeAppModus('redlingo')
  assert.equal(appModus(), 'redlingo')

  setzeAppModus('unbekannt')
  assert.equal(appModus(), 'modern')
})

test('Redlingo besitzt fünf kompakte Hauptbereiche mit gemeinsamer Kursnavigation', () => {
  assert.equal(REDLINGO_NAV.length, 5)
  assert.deepEqual(
    REDLINGO_NAV.map((eintrag) => eintrag.pfad),
    ['/redlingo', '/languages', '/practice', '/progress', '/redlingo/profile']
  )

  const kurse = REDLINGO_NAV.find((eintrag) => eintrag.id === 'kurs')
  assert.equal(istAktiv(kurse, '/course/begruessung'), true)
})
