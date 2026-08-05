// Bildschirm-Tastatur fuer die Code-Aufgaben: oeffnet sich direkt unter dem
// Eingabefeld (statt der Geraetetastatur) und bringt alles zum Bauen mit —
// Buchstaben, Ziffern, Code-Zeichen und ganze Bausteine wie <button> oder
// color:. Eingefuegt wird immer an der Cursorposition; markierter Text wird
// von Bausteinen umschlossen.
import { useState } from 'react'
import { fuegeEin, loescheZurueck } from './tastaturHilfen.js'

const REIHEN_ABC = [
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
]
const ABC_UNTEN = ['y', 'x', 'c', 'v', 'b', 'n', 'm']

const REIHEN_ZIFFERN = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '"', "'", '=', '+'],
]
const ZIFFERN_UNTEN = ['ä', 'ö', 'ü', 'ß', '.', ',', '?', '!']

const CODE_ZEICHEN = ['<', '>', '/', '=', '"', '.', '#']

// Bausteine: vor + (Auswahl) + nach — der Cursor landet in der Mitte.
const BAUSTEINE = [
  { label: '<h1>…</h1>', vor: '<h1>', nach: '</h1>' },
  { label: '<p>…</p>', vor: '<p>', nach: '</p>' },
  { label: '<button>', vor: '<button type="button">', nach: '</button>' },
  { label: '<div>…</div>', vor: '<div>', nach: '</div>' },
  { label: '<ul>…</ul>', vor: '<ul>\n  ', nach: '\n</ul>' },
  { label: '<li>…</li>', vor: '<li>', nach: '</li>' },
  { label: '<a href="…">', vor: '<a href="https://', nach: '"></a>' },
  { label: '<img …>', vor: '<img src="', nach: '" alt="Beschreibung" />' },
  { label: '<table>', vor: '<table>\n  ', nach: '\n</table>' },
  { label: '<tr>…</tr>', vor: '<tr>', nach: '</tr>' },
  { label: '<th>…</th>', vor: '<th>', nach: '</th>' },
  { label: '<td>…</td>', vor: '<td>', nach: '</td>' },
  { label: '<label>', vor: '<label for="', nach: '"></label>' },
  { label: '<input>', vor: '<input id="', nach: '" type="text" />' },
  { label: '<header>', vor: '<header>', nach: '</header>' },
  { label: '<main>', vor: '<main>', nach: '</main>' },
  { label: '<footer>', vor: '<footer>', nach: '</footer>' },
  { label: '<style>', vor: '<style>\n', nach: '\n</style>' },
  { label: 'class="…"', vor: 'class="', nach: '"' },
  { label: 'style="…"', vor: 'style="', nach: '"' },
  { label: 'type="button"', vor: 'type="button"', nach: '' },
  { label: 'color:', vor: 'color: ', nach: ';' },
  { label: 'background:', vor: 'background: ', nach: ';' },
  { label: 'padding:', vor: 'padding: ', nach: ';' },
  { label: 'border:', vor: 'border: ', nach: ';' },
  { label: 'border-radius:', vor: 'border-radius: ', nach: ';' },
  { label: 'min-height:', vor: 'min-height: ', nach: ';' },
  { label: 'font-size:', vor: 'font-size: ', nach: ';' },
  { label: 'px', vor: 'px', nach: '' },
  { label: '{ … }', vor: ' {\n  ', nach: '\n}' },
]

/**
 * @param {{feldRef:Object, wert:string, aendern:Function,
 *          zurGeraetetastatur:Function, ausblenden:Function}} props
 */
export default function CodeTastatur({ feldRef, wert, aendern, zurGeraetetastatur, ausblenden }) {
  const [ebene, setEbene] = useState('code')
  const [gross, setGross] = useState(false)

  function cursorSetzen(pos) {
    requestAnimationFrame(() => {
      const feld = feldRef.current
      if (!feld) return
      feld.focus({ preventScroll: true })
      feld.setSelectionRange(pos, pos)
    })
  }

  function einfuegen(vor, nach = '') {
    const feld = feldRef.current
    const start = feld ? feld.selectionStart : wert.length
    const ende = feld ? feld.selectionEnd : wert.length
    const neu = fuegeEin(wert, start, ende, vor, nach)
    aendern(neu.wert)
    cursorSetzen(neu.cursor)
  }

  function buchstabe(z) {
    einfuegen(gross ? z.toUpperCase() : z)
    if (gross) setGross(false)
  }

  function loeschen() {
    const feld = feldRef.current
    const start = feld ? feld.selectionStart : wert.length
    const ende = feld ? feld.selectionEnd : wert.length
    const neu = loescheZurueck(wert, start, ende)
    aendern(neu.wert)
    cursorSetzen(neu.cursor)
  }

  // Tasten duerfen dem Textfeld nicht den Fokus stehlen — sonst springt die
  // Cursorposition weg und iOS klappt Fokus-Zustaende um.
  const halteFokus = (e) => e.preventDefault()

  const zeichenTaste = (z) => (
    <button
      key={z}
      type="button"
      className="ct-taste"
      onPointerDown={halteFokus}
      onMouseDown={halteFokus}
      onClick={() => einfuegen(z)}
      aria-label={`Zeichen ${z} einfügen`}
    >
      {z}
    </button>
  )

  return (
    <div className="code-tastatur" role="group" aria-label="Code-Tastatur">
      <div className="ct-kopf">
        <span className="ct-titel">Code-Tastatur</span>
        <button
          type="button"
          className="ct-schalter"
          onMouseDown={halteFokus}
          onClick={zurGeraetetastatur}
        >
          Gerätetastatur
        </button>
        <button type="button" className="ct-schalter" onMouseDown={halteFokus} onClick={ausblenden}>
          Ausblenden
        </button>
      </div>

      {ebene === 'abc' && (
        <>
          {REIHEN_ABC.map((reihe) => (
            <div key={reihe[0]} className="ct-reihe">
              {reihe.map((z) => (
                <button
                  key={z}
                  type="button"
                  className="ct-taste"
                  onPointerDown={halteFokus}
                  onMouseDown={halteFokus}
                  onClick={() => buchstabe(z)}
                  aria-label={`Buchstabe ${gross ? z.toUpperCase() : z} einfügen`}
                >
                  {gross ? z.toUpperCase() : z}
                </button>
              ))}
            </div>
          ))}
          <div className="ct-reihe">
            <button
              type="button"
              className={`ct-taste ct-aktion ${gross ? 'ct-aktiv' : ''}`}
              onPointerDown={halteFokus}
              onMouseDown={halteFokus}
              onClick={() => setGross((g) => !g)}
              aria-label="Großschreiben"
              aria-pressed={gross}
            >
              ⇧
            </button>
            {ABC_UNTEN.map((z) => (
              <button
                key={z}
                type="button"
                className="ct-taste"
                onPointerDown={halteFokus}
                onMouseDown={halteFokus}
                onClick={() => buchstabe(z)}
                aria-label={`Buchstabe ${gross ? z.toUpperCase() : z} einfügen`}
              >
                {gross ? z.toUpperCase() : z}
              </button>
            ))}
            <button
              type="button"
              className="ct-taste ct-aktion"
              onPointerDown={halteFokus}
              onMouseDown={halteFokus}
              onClick={loeschen}
              aria-label="Zeichen löschen"
            >
              ⌫
            </button>
          </div>
        </>
      )}

      {ebene === 'ziffern' && (
        <>
          {REIHEN_ZIFFERN.map((reihe) => (
            <div key={reihe[0]} className="ct-reihe">
              {reihe.map((z) => zeichenTaste(z))}
            </div>
          ))}
          <div className="ct-reihe">
            {ZIFFERN_UNTEN.map((z) => zeichenTaste(z))}
            <button
              type="button"
              className="ct-taste ct-aktion"
              onPointerDown={halteFokus}
              onMouseDown={halteFokus}
              onClick={loeschen}
              aria-label="Zeichen löschen"
            >
              ⌫
            </button>
          </div>
        </>
      )}

      {ebene === 'code' && (
        <>
          <div className="ct-reihe">
            {CODE_ZEICHEN.map((z) => zeichenTaste(z))}
            <button
              type="button"
              className="ct-taste ct-aktion"
              onPointerDown={halteFokus}
              onMouseDown={halteFokus}
              onClick={loeschen}
              aria-label="Zeichen löschen"
            >
              ⌫
            </button>
          </div>
          <div className="ct-bausteine" aria-label="Code-Bausteine">
            {BAUSTEINE.map((b) => (
              <button
                key={b.label}
                type="button"
                className="ct-baustein"
                onPointerDown={halteFokus}
                onMouseDown={halteFokus}
                onClick={() => einfuegen(b.vor, b.nach)}
                aria-label={`Baustein ${b.label} einfügen`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="ct-reihe ct-unten">
        <button
          type="button"
          className={`ct-taste ct-aktion ${ebene === 'abc' ? 'ct-aktiv' : ''}`}
          onMouseDown={halteFokus}
          onClick={() => setEbene('abc')}
          aria-label="Buchstaben zeigen"
          aria-pressed={ebene === 'abc'}
        >
          ABC
        </button>
        <button
          type="button"
          className={`ct-taste ct-aktion ${ebene === 'ziffern' ? 'ct-aktiv' : ''}`}
          onMouseDown={halteFokus}
          onClick={() => setEbene('ziffern')}
          aria-label="Ziffern und Zeichen zeigen"
          aria-pressed={ebene === 'ziffern'}
        >
          123
        </button>
        <button
          type="button"
          className={`ct-taste ct-aktion ${ebene === 'code' ? 'ct-aktiv' : ''}`}
          onMouseDown={halteFokus}
          onClick={() => setEbene('code')}
          aria-label="Code-Bausteine zeigen"
          aria-pressed={ebene === 'code'}
        >
          {'<>'}
        </button>
        <button
          type="button"
          className="ct-taste ct-leertaste"
          onPointerDown={halteFokus}
          onMouseDown={halteFokus}
          onClick={() => einfuegen(' ')}
          aria-label="Leerzeichen einfügen"
        >
          Leer
        </button>
        <button
          type="button"
          className="ct-taste ct-aktion"
          onPointerDown={halteFokus}
          onMouseDown={halteFokus}
          onClick={() => einfuegen('\n')}
          aria-label="Zeilenumbruch einfügen"
        >
          ⏎
        </button>
      </div>
    </div>
  )
}
