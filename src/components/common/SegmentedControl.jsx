// Segmentierter Schalter (z. B. Kurz · Standard · Intensiv).
// Als Radiogruppe umgesetzt, damit die Pfeiltasten funktionieren.

/**
 * @param {{name:string, label:string, wert:string,
 *          optionen:Array<{id:string,name:string,zusatz?:string}>,
 *          aendern:(id:string)=>void}} props
 */
export default function SegmentedControl({ name, label, wert, optionen, aendern, className = '' }) {
  /** Auswahl UND Fokus wechseln — sonst haengt der Fokus auf der alten Option. */
  function waehleUndFokussiere(id) {
    aendern(id)
    if (typeof document === 'undefined') return
    requestAnimationFrame(() => {
      const ziel = document.getElementById(`${name}-${id}`)
      if (ziel) ziel.focus()
    })
  }

  return (
    <div className={`rk-segment ${className}`} role="radiogroup" aria-label={label}>
      {optionen.map((o) => {
        const aktiv = o.id === wert
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={aktiv}
            className={'rk-segment-knopf' + (aktiv ? ' aktiv' : '')}
            onClick={() => aendern(o.id)}
            onKeyDown={(e) => {
              const i = optionen.findIndex((x) => x.id === wert)
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                waehleUndFokussiere(optionen[(i + 1) % optionen.length].id)
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                waehleUndFokussiere(optionen[(i - 1 + optionen.length) % optionen.length].id)
              }
              if (e.key === 'Home') {
                e.preventDefault()
                waehleUndFokussiere(optionen[0].id)
              }
              if (e.key === 'End') {
                e.preventDefault()
                waehleUndFokussiere(optionen[optionen.length - 1].id)
              }
            }}
            tabIndex={aktiv ? 0 : -1}
            id={`${name}-${o.id}`}
          >
            <span className="rk-segment-name">{o.name}</span>
            {o.zusatz && <span className="rk-segment-zusatz">{o.zusatz}</span>}
          </button>
        )
      })}
    </div>
  )
}
