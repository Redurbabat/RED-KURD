// Tests fuer den Shop: nur Aussehen und Komfort, ehrliche Abbuchung.
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

const { holeFortschritt, setzeFortschritt } = await import('../src/core/progress/progressStore.js')
const {
  ARTIKEL,
  aktiverArtikel,
  istAktiv,
  istGekauft,
  kannKaufen,
  kaufe,
  setzeAktiv,
  setzeShop,
} = await import('../src/core/shop/shopStore.js')

test('der Shop verkauft nur Aussehen, Komfort und Verbrauch — nie Lerninhalte', () => {
  const erlaubteArten = new Set(['mascot', 'thema', 'klang', 'rahmen', 'verbrauch'])
  for (const a of ARTIKEL) {
    assert.ok(erlaubteArten.has(a.art), `Artikel ${a.id} hat unbekannte Art ${a.art}`)
    assert.ok(a.preis > 0 && a.name && a.beschreibung)
  }
})

test('ohne genug Edelsteine gibt es nichts — und nichts wird abgebucht', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 10 })
  assert.equal(kannKaufen('helo-schal'), false)
  assert.equal(kaufe('helo-schal'), 'zu-teuer')
  assert.equal(holeFortschritt().edelsteine, 10)
  assert.equal(istGekauft('helo-schal'), false)
})

test('ein Kauf bucht ab, merkt den Artikel und aktiviert ihn', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 150 })
  assert.equal(kaufe('helo-schal'), 'ok')
  assert.equal(holeFortschritt().edelsteine, 30)
  assert.equal(istGekauft('helo-schal'), true)
  assert.equal(istAktiv('helo-schal'), true)
  assert.equal(aktiverArtikel('mascot').id, 'helo-schal')
})

test('ein zweiter Kauf desselben Artikels wird abgelehnt und kostet nichts', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 300 })
  assert.equal(kaufe('profilrahmen'), 'ok')
  const danach = holeFortschritt().edelsteine
  assert.equal(kaufe('profilrahmen'), 'schon-da')
  assert.equal(holeFortschritt().edelsteine, danach)
})

test('der Serien-Schutz ist Verbrauchsware: mehrfach kaufbar, wirkt sofort', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 250, serienSchutz: 0 })
  assert.equal(kaufe('streak-schutz'), 'ok')
  assert.equal(kaufe('streak-schutz'), 'ok')
  const d = holeFortschritt()
  assert.equal(d.serienSchutz, 2)
  assert.equal(d.edelsteine, 50)
  assert.equal(istGekauft('streak-schutz'), false, 'Verbrauch landet nicht in gekauft')
})

test('der Schatzschluessel kostet Schluessel, keine Edelsteine', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 5, schluessel: 2 })
  assert.equal(kaufe('schatzschluessel'), 'ok')
  const d = holeFortschritt()
  assert.equal(d.schluessel, 1)
  assert.equal(d.edelsteine, 5)
})

test('setzeAktiv schaltet nur Gekauftes um und kann auch abwaehlen', () => {
  setzeShop({})
  setzeFortschritt({ edelsteine: 300 })
  assert.equal(setzeAktiv('bergpfad-thema'), false, 'nicht gekauft, nicht aktivierbar')
  kaufe('bergpfad-thema')
  assert.equal(istAktiv('bergpfad-thema'), true)
  setzeAktiv('bergpfad-thema')
  assert.equal(istAktiv('bergpfad-thema'), false, 'zweites Umschalten waehlt ab')
})

test('unbekannte Artikel werden hoeflich abgewiesen', () => {
  assert.equal(kaufe('gibt-es-nicht'), 'unbekannt')
  assert.equal(kannKaufen('gibt-es-nicht'), false)
  assert.equal(istAktiv('gibt-es-nicht'), false)
})
