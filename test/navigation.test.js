// Welcher Navigationspunkt leuchtet bei welcher Adresse?
//
// `istAktiv` hat elf Sonderfaelle und war bisher ungeprueft. Sie sind kein
// Wildwuchs: ein Unterpfad soll seinen Oberpunkt markieren, aber `/adventure`
// darf nicht bei jeder Abenteuer-Seite leuchten, sonst waeren zwei Punkte
// zugleich aktiv. Genau das ist die Zusage, die dieser Test festhaelt.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ABENTEUER_NAV,
  MODERN_NAV,
  REDLINGO_NAV,
  istAktiv,
} from '../src/components/layout/navConfig.ts'
import { ICONNAMEN } from '../src/components/icons/iconPfade.ts'

const ALLE = { MODERN_NAV, ABENTEUER_NAV, REDLINGO_NAV }

test('jede Navigationsliste ist in sich stimmig', () => {
  for (const [name, liste] of Object.entries(ALLE)) {
    assert.ok(liste.length >= 5, `${name} hat nur ${liste.length} Punkte`)
    const ids = liste.map((e) => e.id)
    assert.equal(new Set(ids).size, ids.length, `${name}: doppelte id`)
    for (const e of liste) {
      assert.ok(e.pfad.startsWith('/'), `${name}/${e.id}: Pfad ohne führenden Schrägstrich`)
      assert.ok(e.name && e.name.length > 1, `${name}/${e.id}: kein Name`)
      // Ein Tippfehler im Iconnamen erzeugt kein Fehlerbild, sondern ein
      // leeres Feld in der Navigation.
      assert.ok(ICONNAMEN.includes(e.icon), `${name}/${e.id}: Icon „${e.icon}" gibt es nicht`)
    }
  }
})

/** Welche Punkte einer Liste leuchten bei diesem Pfad? */
function aktive(liste, pfad) {
  return liste.filter((e) => istAktiv(e, pfad)).map((e) => e.id)
}

test('bei jeder echten Adresse leuchtet höchstens ein Punkt', () => {
  const ADRESSEN = [
    '/', '/today', '/course', '/course/begruessung', '/languages', '/languages/englisch',
    '/practice', '/practice/listening', '/explore', '/explore/culture', '/progress',
    '/settings', '/session', '/unit/familie',
    '/adventure', '/adventure/worlds', '/adventure/world/w2', '/adventure/lesson/familie',
    '/adventure/tasks', '/adventure/culture', '/adventure/profile', '/adventure/shop',
    '/redlingo', '/redlingo/profile',
  ]
  for (const [name, liste] of Object.entries(ALLE)) {
    for (const pfad of ADRESSEN) {
      const treffer = aktive(liste, pfad)
      assert.ok(treffer.length <= 1, `${name} bei ${pfad}: ${treffer.join(' + ')} leuchten zugleich`)
    }
  }
})

test('die Startseite zählt als „Heute"', () => {
  assert.deepEqual(aktive(MODERN_NAV, '/'), ['heute'])
  assert.deepEqual(aktive(MODERN_NAV, '/today'), ['heute'])
})

test('ein Kapitel markiert „Kurse", nicht „Heute"', () => {
  assert.deepEqual(aktive(MODERN_NAV, '/course'), ['kurs'])
  assert.deepEqual(aktive(MODERN_NAV, '/course/begruessung'), ['kurs'])
  assert.deepEqual(aktive(MODERN_NAV, '/languages/englisch'), ['kurs'])
})

test('im Abenteuer bleibt „Start" der Startseite vorbehalten', () => {
  // Der Grund fuer den Sonderfall: ohne ihn leuchtete „Start" auf jeder
  // Abenteuer-Seite mit, weil alle mit /adventure beginnen.
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure'), ['start'])
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure/worlds'), ['lernpfad'])
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure/world/w3'), ['lernpfad'])
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure/lesson/familie'), ['lernpfad'])
})

test('der Shop liegt im Profil — also leuchtet dort „Profil"', () => {
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure/profile'), ['profil'])
  assert.deepEqual(aktive(ABENTEUER_NAV, '/adventure/shop'), ['profil'])
})

test('Redlingo: die Einstellungen laufen unter Profil', () => {
  assert.deepEqual(aktive(REDLINGO_NAV, '/redlingo'), ['redlingo-start'])
  assert.deepEqual(aktive(REDLINGO_NAV, '/redlingo/profile'), ['redlingo-profil'])
  assert.deepEqual(aktive(REDLINGO_NAV, '/settings'), ['redlingo-profil'])
})

test('eine unbekannte Adresse lässt alles dunkel', () => {
  for (const [name, liste] of Object.entries(ALLE)) {
    assert.deepEqual(aktive(liste, '/gibt-es-nicht'), [], name)
    assert.deepEqual(aktive(liste, ''), [], name)
  }
})

test('ein Pfad wird nicht mit einem längeren verwechselt', () => {
  // `/practice` darf nicht bei `/practiceXY` leuchten — der Unterschied ist
  // der Schrägstrich, und genau den prüft die letzte Zeile von istAktiv.
  const ueben = MODERN_NAV.find((e) => e.id === 'ueben')
  assert.equal(istAktiv(ueben, '/practice'), true)
  assert.equal(istAktiv(ueben, '/practice/listening'), true)
  assert.equal(istAktiv(ueben, '/practiceXY'), false)
  assert.equal(istAktiv(ueben, '/practicexyz/tief'), false)
})
