// Tests fuer den eigenen Router. Node kann .jsx nicht direkt laden, darum
// uebersetzt esbuild (kommt mit Vite) die Datei und wir importieren das
// Ergebnis als data:-Modul. Bare Imports ('react') gaebe es dort nicht mehr,
// deshalb werden sie vorher auf absolute Dateiadressen umgeschrieben.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const quelle = new URL('../src/app/router.jsx', import.meta.url)

async function ladeRouter() {
  const roh = await readFile(quelle, 'utf8')
  const { code } = await transform(roh, {
    loader: 'jsx',
    jsx: 'automatic',
    format: 'esm',
    sourcefile: 'router.jsx',
  })
  const aufgeloest = code.replace(
    /(\bfrom\s*)"([^".][^"]*)"/g,
    (treffer, vorher, spezifizierer) =>
      spezifizierer.startsWith('.') || spezifizierer.includes(':')
        ? treffer
        : `${vorher}${JSON.stringify(import.meta.resolve(spezifizierer))}`
  )
  const daten = Buffer.from(aufgeloest, 'utf8').toString('base64')
  return import(`data:text/javascript;base64,${daten}`)
}

const {
  Link,
  aktuellerPfad,
  istExterneAdresse,
  istInternerKlick,
  loeseUmleitung,
  navigiere,
  normalisiereZiel,
  passt,
  sichereDekodierung,
  waehleRoute,
} = await ladeRouter()

/** Minimales Klick-Ereignis, das sich wie ein React-SyntheticEvent verhaelt. */
function klick(zusatz = {}) {
  const e = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() {
      e.defaultPrevented = true
    },
    ...zusatz,
  }
  return e
}

/**
 * Stellt window/document so weit bereit, dass navigiere() laeuft, und
 * protokolliert die History-Aufrufe. Gibt eine Aufraeum-Funktion zurueck.
 */
function fensterStellen(startPfad = '/today') {
  const protokoll = []
  globalThis.window = {
    location: { protocol: 'https:', pathname: startPfad, search: '', hash: '' },
    history: {
      pushState: (_z, _t, ziel) => protokoll.push(['push', ziel]),
      replaceState: (_z, _t, ziel) => protokoll.push(['replace', ziel]),
    },
    dispatchEvent: (ereignis) => protokoll.push(['ereignis', ereignis.type]),
    scrollTo: () => protokoll.push(['scroll']),
    matchMedia: () => ({ matches: false }),
  }
  globalThis.document = { documentElement: { dataset: {} } }
  return {
    protokoll,
    aufraeumen() {
      delete globalThis.window
      delete globalThis.document
    },
  }
}

// --- Pfad-Mustererkennung ---------------------------------------------------

test('feste Segmente muessen exakt uebereinstimmen', () => {
  assert.deepEqual(passt('/today', '/today'), {})
  assert.deepEqual(passt('/', '/'), {})
  assert.equal(passt('/today', '/progress'), null)
  assert.equal(passt('/course', '/course/12'), null)
  assert.equal(passt('/course/:unitId', '/course'), null)
})

test('Platzhalter werden als Parameter geliefert und dekodiert', () => {
  assert.deepEqual(passt('/course/:unitId', '/course/12'), { unitId: '12' })
  assert.deepEqual(passt('/explore/:bereich/:wort', '/explore/dictionary/av%C3%AA'), {
    bereich: 'dictionary',
    wort: 'avê',
  })
  assert.deepEqual(passt('/course/:unitId', '/course/Kapitel%201'), {
    unitId: 'Kapitel 1',
  })
})

test('kaputte Prozentzeichen liefern den Rohwert statt eines Absturzes', () => {
  // decodeURIComponent('%E0%A4%A') wirft einen URIError.
  assert.deepEqual(passt('/course/:unitId', '/course/%E0%A4%A'), {
    unitId: '%E0%A4%A',
  })
  assert.deepEqual(passt('/course/:unitId', '/course/%'), { unitId: '%' })
  assert.deepEqual(passt('/course/:unitId', '/course/%zz'), { unitId: '%zz' })
  assert.deepEqual(passt('/course/:unitId', '/course/100%'), { unitId: '100%' })
  // Gueltige Sequenz derselben Familie wird weiterhin dekodiert.
  assert.deepEqual(passt('/course/:unitId', '/course/%E0%A4%A1'), { unitId: 'ड' })
})

test('kaputte Prozentzeichen in festen Segmenten kippen die Erkennung nicht', () => {
  assert.equal(passt('/course/:unitId', '/%E0%A4%A/12'), null)
  assert.deepEqual(passt('/%E0%A4%A/:id', '/%E0%A4%A/12'), { id: '12' })
})

test('Query und Anker gehoeren nicht zum Muster', () => {
  assert.deepEqual(passt('/course/:unitId', '/course/12?von=heute'), { unitId: '12' })
  assert.deepEqual(passt('/course/:unitId', '/course/12#lektion'), { unitId: '12' })
  assert.deepEqual(passt('/today', '/today?tab=2'), {})
})

test('passt wirft bei fehlenden oder falschen Werten nicht', () => {
  assert.equal(passt('/today', undefined), null)
  assert.equal(passt(undefined, '/today'), null)
  assert.equal(passt('/today', null), null)
  assert.equal(passt('/course/:id', 42), null)
})

test('sichereDekodierung faellt auf den Rohwert zurueck', () => {
  assert.equal(sichereDekodierung('av%C3%AA'), 'avê')
  assert.equal(sichereDekodierung('%E0%A4%A'), '%E0%A4%A')
  assert.equal(sichereDekodierung(''), '')
  assert.equal(sichereDekodierung(undefined), '')
})

test('waehleRoute nimmt den ersten Treffer und ueberlebt kaputte Adressen', () => {
  const routen = [
    ['/course', () => 'liste'],
    ['/course/:unitId', (p) => `unit:${p.unitId}`],
    ['/course/:unitId', () => 'nie'],
  ]
  assert.equal(waehleRoute('/course', routen), 'liste')
  assert.equal(waehleRoute('/course/7', routen), 'unit:7')
  assert.equal(waehleRoute('/course/%E0%A4%A', routen), 'unit:%E0%A4%A')
  assert.equal(waehleRoute('/gibtesnicht', routen), null)
})

test('alte Adressen werden weiterhin umgeleitet', () => {
  assert.equal(loeseUmleitung('/heute'), '/today')
  assert.equal(loeseUmleitung('/woerterbuch'), '/explore/dictionary')
  assert.equal(loeseUmleitung('/today'), null)
})

// --- Ziel-Normalisierung ----------------------------------------------------

test('normalisiereZiel erzeugt immer einen internen Pfad', () => {
  assert.equal(normalisiereZiel('/course/12'), '/course/12')
  assert.equal(normalisiereZiel('course/12'), '/course/12')
  assert.equal(normalisiereZiel('/course/%E0%A4%A'), '/course/%E0%A4%A')
  // Protokollrelativ waere eine fremde Herkunft — history.pushState wuerde werfen.
  assert.equal(normalisiereZiel('//example.com/x'), null)
  assert.equal(normalisiereZiel('https://example.com'), null)
  assert.equal(normalisiereZiel('javascript:alert(1)'), null)
  assert.equal(normalisiereZiel(''), null)
  assert.equal(normalisiereZiel(undefined), null)
})

test('istExterneAdresse erkennt Schema und Protokollrelativ', () => {
  assert.equal(istExterneAdresse('https://example.com'), true)
  assert.equal(istExterneAdresse('mailto:a@b.de'), true)
  assert.equal(istExterneAdresse('tel:+49'), true)
  assert.equal(istExterneAdresse('//example.com'), true)
  assert.equal(istExterneAdresse('/course/12'), false)
  assert.equal(istExterneAdresse('course/12'), false)
})

// --- Klick-Logik der Link-Komponente ---------------------------------------

test('ein einfacher Linksklick wird intern behandelt', () => {
  assert.equal(istInternerKlick(klick(), '/today', undefined), true)
  assert.equal(istInternerKlick(klick(), '/today', '_self'), true)
  // Tastatur-Aktivierung liefert keine Maustaste.
  assert.equal(istInternerKlick(klick({ button: undefined }), '/today'), true)
})

test('bewusste Neuer-Tab-Gesten bleiben dem Browser ueberlassen', () => {
  for (const taste of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    assert.equal(istInternerKlick(klick({ [taste]: true }), '/today'), false, taste)
  }
  assert.equal(istInternerKlick(klick({ button: 1 }), '/today'), false)
  assert.equal(istInternerKlick(klick(), '/today', '_blank'), false)
  assert.equal(istInternerKlick(klick(), '/today', 'hilfefenster'), false)
})

test('externe Ziele und reine Anker werden nicht abgefangen', () => {
  assert.equal(istInternerKlick(klick(), 'https://example.com'), false)
  assert.equal(istInternerKlick(klick(), 'mailto:hallo@example.com'), false)
  assert.equal(istInternerKlick(klick(), '//example.com'), false)
  assert.equal(istInternerKlick(klick(), '#abschnitt'), false)
  assert.equal(istInternerKlick(klick(), ''), false)
  assert.equal(istInternerKlick(klick(), undefined), false)
})

test('ein bereits abgebrochenes Ereignis bricht die Navigation ab', () => {
  assert.equal(istInternerKlick(klick({ defaultPrevented: true }), '/today'), false)
  assert.equal(istInternerKlick(undefined, '/today'), false)
})

// --- Link-Komponente (ohne DOM, ueber die erzeugten Props) ------------------

test('Link setzt href und bei target="_blank" ein schuetzendes rel', () => {
  assert.equal(Link({ to: '/today' }).props.href, '/today')
  assert.equal(Link({ to: '/today' }).props.rel, undefined)
  assert.equal(
    Link({ to: 'https://example.com', target: '_blank' }).props.rel,
    'noopener noreferrer'
  )
  assert.equal(
    Link({ to: 'https://example.com', target: '_blank', rel: 'external' }).props.rel,
    'external'
  )
})

test('Link navigiert bei einem normalen Klick intern', (t) => {
  const fenster = fensterStellen('/today')
  t.after(fenster.aufraeumen)
  const e = klick()
  Link({ to: '/course/12' }).props.onClick(e)
  assert.equal(e.defaultPrevented, true)
  assert.deepEqual(fenster.protokoll[0], ['push', '/course/12'])
})

test('Link laesst target="_blank" und Modifikatorklicks in Ruhe', (t) => {
  const fenster = fensterStellen('/today')
  t.after(fenster.aufraeumen)

  const imTab = klick()
  Link({ to: '/course/12', target: '_blank' }).props.onClick(imTab)
  assert.equal(imTab.defaultPrevented, false)

  const mitStrg = klick({ ctrlKey: true })
  Link({ to: '/course/12' }).props.onClick(mitStrg)
  assert.equal(mitStrg.defaultPrevented, false)

  const mittelklick = klick({ button: 1 })
  Link({ to: '/course/12' }).props.onClick(mittelklick)
  assert.equal(mittelklick.defaultPrevented, false)

  assert.deepEqual(fenster.protokoll, [])
})

test('ein eigener onClick-Handler kann die Navigation abbrechen', (t) => {
  const fenster = fensterStellen('/today')
  t.after(fenster.aufraeumen)

  const gesehen = []
  const abbrechen = (e) => {
    gesehen.push(e)
    e.preventDefault()
  }
  Link({ to: '/course/12', onClick: abbrechen }).props.onClick(klick())
  assert.equal(gesehen.length, 1)
  assert.deepEqual(fenster.protokoll, [])

  // Ohne preventDefault laeuft die Navigation wie bisher.
  const durchlassen = (e) => gesehen.push(e)
  Link({ to: '/course/12', onClick: durchlassen }).props.onClick(klick())
  assert.equal(gesehen.length, 2)
  assert.deepEqual(fenster.protokoll[0], ['push', '/course/12'])
})

test('navigiere ignoriert Ziele, die die App verlassen wuerden', (t) => {
  const fenster = fensterStellen('/today')
  t.after(fenster.aufraeumen)

  navigiere('//example.com/boese')
  navigiere('https://example.com')
  navigiere('')
  navigiere(undefined)
  assert.deepEqual(fenster.protokoll, [])

  navigiere('course/12')
  assert.deepEqual(fenster.protokoll[0], ['push', '/course/12'])
})

test('navigiere wiederholt den aktuellen Pfad nicht', (t) => {
  const fenster = fensterStellen('/today')
  t.after(fenster.aufraeumen)
  assert.equal(aktuellerPfad(), '/today')
  navigiere('/today')
  assert.deepEqual(fenster.protokoll, [])
  navigiere('/today', { erzwingen: true })
  assert.deepEqual(fenster.protokoll[0], ['push', '/today'])
})
