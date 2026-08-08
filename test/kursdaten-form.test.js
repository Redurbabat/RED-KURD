// Die Kursdaten sind JavaScript; ihre Form kennt TypeScript nur aus den
// Deklarationsdateien neben ihnen (src/data/*.d.ts). Eine solche Deklaration
// waechst nicht mit, wenn jemand die Daten aendert — sie kann also luegen,
// ohne dass der Typpruefer etwas merkt. Diese Tests pruefen die echten Daten
// gegen genau die Zusagen aus src/types/kurs.d.ts.
//
// Faellt hier etwas um, ist die Frage: haben sich die Daten geaendert (dann
// gehoert die Deklaration angepasst) oder ist ein Datensatz kaputt (dann die
// Daten)? Beides stillschweigend laufen zu lassen ist die einzige falsche
// Antwort.
import test from 'node:test'
import assert from 'node:assert/strict'
import { kurse } from '../src/data/kurse.js'
import { kapitelFotos } from '../src/data/kapitelFotos.js'
import { kapitelExtras } from '../src/data/kapitelExtras.js'
import { wortFotos } from '../src/data/wortFotos.js'
import { LEKTIONS_ARTEN, WELTEN, EINHEITEN } from '../src/core/courses/courseRepository.ts'

/** Pflichtfeld: da, eine Zeichenkette, nicht leer. */
function istText(wert) {
  return typeof wert === 'string' && wert.length > 0
}

/** Wahlfrei: entweder gar nicht da oder eine nicht leere Zeichenkette. */
function istTextOderFehlt(wert) {
  return wert === undefined || istText(wert)
}

function pruefeBildnachweis(bild, wo) {
  assert.ok(istText(bild.src), `${wo}: src fehlt`)
  assert.ok(istText(bild.alt), `${wo}: alt fehlt — ohne Alternativtext ist das Bild fuer Screenreader nichts`)
  for (const feld of ['urheber', 'lizenz', 'lizenzUrl', 'quelle', 'titel']) {
    assert.ok(istTextOderFehlt(bild[feld]), `${wo}: ${feld} ist weder Text noch abwesend`)
  }
}

function pruefeBeispielsatz(satz, wo) {
  assert.ok(istText(satz.de), `${wo}: de fehlt`)
  assert.ok(istText(satz.ku), `${wo}: ku fehlt`)
}

test('jede Kurseinheit hat die Form, die kurse.d.ts zusagt', () => {
  assert.ok(Array.isArray(kurse) && kurse.length > 0, 'kurse ist keine gefuellte Liste')
  for (const k of kurse) {
    const wo = `Kapitel ${k?.id}`
    assert.ok(istText(k.id), `${wo}: id fehlt`)
    assert.ok(istText(k.name), `${wo}: name fehlt`)
    assert.ok(istText(k.ziel), `${wo}: ziel fehlt`)
    assert.ok(istText(k.symbol), `${wo}: symbol fehlt`)
    assert.ok(Array.isArray(k.woerter) && k.woerter.length > 0, `${wo}: keine Woerter`)

    for (const w of k.woerter) {
      assert.ok(istText(w.de), `${wo}: ein Wort ohne de`)
      assert.ok(istText(w.ku), `${wo}: „${w.de}" ohne ku`)
      assert.ok(istTextOderFehlt(w.bild), `${wo}: „${w.de}" hat ein bild, das kein Text ist`)
    }

    // `foto` ist Pflicht — kurse.js setzt es fuer jedes Kapitel, notfalls null.
    assert.ok('foto' in k, `${wo}: foto fehlt ganz; kurse.js setzt es sonst immer`)
    assert.ok(k.foto === null || typeof k.foto === 'object', `${wo}: foto ist weder Objekt noch null`)
    if (k.foto) pruefeBildnachweis(k.foto, `${wo} foto`)

    if (k.saetze !== undefined) {
      assert.ok(Array.isArray(k.saetze), `${wo}: saetze ist keine Liste`)
      k.saetze.forEach((s, i) => pruefeBeispielsatz(s, `${wo} Satz ${i + 1}`))
    }
    if (k.grammatik !== undefined) {
      assert.ok(istText(k.grammatik.titel), `${wo}: Grammatik ohne Titel`)
      assert.ok(istText(k.grammatik.text), `${wo}: Grammatik ohne Text`)
      pruefeBeispielsatz(k.grammatik.beispiel, `${wo} Grammatik-Beispiel`)
    }
  }
})

test('die generierten Kapitelfotos haben die Form, die kapitelFotos.d.ts zusagt', () => {
  const eintraege = Object.entries(kapitelFotos)
  assert.ok(eintraege.length > 0, 'keine Kapitelfotos')
  for (const [schluessel, foto] of eintraege) {
    pruefeBildnachweis(foto, `Kapitelfoto ${schluessel}`)
    assert.equal(foto.id, schluessel, `Kapitelfoto ${schluessel}: id passt nicht zum Schluessel`)
  }
})

test('die generierten Wortfotos haben die Form, die wortFotos.d.ts zusagt', () => {
  const eintraege = Object.entries(wortFotos)
  assert.ok(eintraege.length > 0, 'keine Wortfotos')
  for (const [schluessel, foto] of eintraege) {
    pruefeBildnachweis(foto, `Wortfoto ${schluessel}`)
    assert.equal(foto.ku, schluessel, `Wortfoto ${schluessel}: ku passt nicht zum Schluessel`)
  }
})

test('die Kapitel-Extras haben die Form, die kapitelExtras.d.ts zusagt', () => {
  const eintraege = Object.entries(kapitelExtras)
  assert.ok(eintraege.length > 0, 'keine Kapitel-Extras')
  for (const [id, extra] of eintraege) {
    if (extra.saetze !== undefined) {
      assert.ok(Array.isArray(extra.saetze), `Extra ${id}: saetze ist keine Liste`)
      extra.saetze.forEach((s, i) => pruefeBeispielsatz(s, `Extra ${id} Satz ${i + 1}`))
    }
    if (extra.grammatik !== undefined) {
      assert.ok(istText(extra.grammatik.titel), `Extra ${id}: Grammatik ohne Titel`)
      assert.ok(istText(extra.grammatik.text), `Extra ${id}: Grammatik ohne Text`)
      pruefeBeispielsatz(extra.grammatik.beispiel, `Extra ${id} Grammatik-Beispiel`)
    }
  }
})

test('WELTEN hat die Form, die kurs.d.ts zusagt', () => {
  assert.ok(WELTEN.length > 0, 'keine Welten')
  const gesehen = new Set()
  for (const w of WELTEN) {
    const wo = `Welt ${w?.id}`
    assert.ok(istText(w.id), `${wo}: id fehlt`)
    assert.equal(typeof w.nr, 'number', `${wo}: nr ist keine Zahl`)
    for (const feld of ['name', 'untertitel', 'ort', 'landschaft', 'farbe', 'himmel']) {
      assert.ok(istText(w[feld]), `${wo}: ${feld} fehlt`)
    }
    assert.ok(Array.isArray(w.einheiten) && w.einheiten.length > 0, `${wo}: keine Einheiten`)
    for (const id of w.einheiten) {
      assert.ok(istText(id), `${wo}: eine Einheiten-ID ist kein Text`)
      assert.ok(!gesehen.has(id), `${wo}: Einheit ${id} steht in zwei Welten`)
      gesehen.add(id)
    }
  }
})

test('LEKTIONS_ARTEN hat die Form, die kurs.d.ts zusagt', () => {
  assert.ok(LEKTIONS_ARTEN.length > 0, 'keine Lektionsarten')
  const ERLAUBTE_ARTEN = new Set(['wahl-ku', 'wahl-de', 'tippen', 'bild', 'hoeren'])
  for (const l of LEKTIONS_ARTEN) {
    const wo = `Lektionsart ${l?.id}`
    for (const feld of ['id', 'name', 'beschreibung', 'dauer', 'icon']) {
      assert.ok(istText(l[feld]), `${wo}: ${feld} fehlt`)
    }
    assert.equal(typeof l.nr, 'number', `${wo}: nr ist keine Zahl`)
    assert.ok(l.anzahl > 0, `${wo}: anzahl muss groesser als 0 sein`)
    assert.ok(Array.isArray(l.arten) && l.arten.length > 0, `${wo}: keine Aufgabenarten`)
    for (const art of l.arten) {
      assert.ok(ERLAUBTE_ARTEN.has(art), `${wo}: „${art}" ist keine bekannte Aufgabenart`)
    }
    assert.ok(
      l.pruefung === undefined || l.pruefung === true,
      `${wo}: pruefung ist weder true noch abwesend`
    )
  }
})

test('EINHEITEN reichert an, statt zu verlieren', () => {
  assert.equal(EINHEITEN.length, kurse.length, 'beim Sortieren ist ein Kapitel verloren gegangen')

  const nachId = new Map(kurse.map((k) => [k.id, k]))
  EINHEITEN.forEach((e, i) => {
    const roh = nachId.get(e.id)
    assert.ok(roh, `Einheit ${e.id} kommt in den Kursdaten gar nicht vor`)
    assert.equal(e.nr, i + 1, `Einheit ${e.id}: nr passt nicht zur Reihenfolge`)
    assert.equal(e.woerter, roh.woerter, `Einheit ${e.id}: Woerter wurden ersetzt statt uebernommen`)

    // weltId ist string oder null — nie undefined, sonst faellt die Weltkarte
    // stumm auf „keine Welt" zurueck.
    assert.ok(
      e.weltId === null || istText(e.weltId),
      `Einheit ${e.id}: weltId ist weder Text noch null`
    )
    assert.ok(e.saetze === null || Array.isArray(e.saetze), `Einheit ${e.id}: saetze ist weder Liste noch null`)
    assert.ok(
      e.grammatik === null || typeof e.grammatik === 'object',
      `Einheit ${e.id}: grammatik ist weder Objekt noch null`
    )
    assert.ok(e.foto === null || typeof e.foto === 'object', `Einheit ${e.id}: foto ist weder Objekt noch null`)

    assert.equal(
      e.lektionen.length,
      LEKTIONS_ARTEN.length,
      `Einheit ${e.id}: nicht alle Abschnitte gebaut`
    )
    e.lektionen.forEach((l, j) => {
      const art = LEKTIONS_ARTEN[j]
      assert.equal(l.id, `${e.id}-${art.id}`, `Einheit ${e.id}: Lektions-ID falsch zusammengesetzt`)
      assert.equal(l.einheitId, e.id, `Einheit ${e.id}: Lektion zeigt auf die falsche Einheit`)
      assert.equal(l.anzahl, art.anzahl, `Einheit ${e.id}: Aufgabenzahl der Lektion verloren`)
    })
  })
})

test('ein Kapitel-Extra wird nur genommen, wenn das Kapitel selbst nichts mitbringt', () => {
  for (const e of EINHEITEN) {
    const roh = kurse.find((k) => k.id === e.id)
    const extra = kapitelExtras[e.id]
    if (roh?.saetze) {
      assert.equal(e.saetze, roh.saetze, `Einheit ${e.id}: eigene Saetze wurden ueberschrieben`)
    } else if (extra?.saetze) {
      assert.equal(e.saetze, extra.saetze, `Einheit ${e.id}: Extra-Saetze nicht uebernommen`)
    } else {
      assert.equal(e.saetze, null, `Einheit ${e.id}: saetze sollte null sein`)
    }
  }
})
