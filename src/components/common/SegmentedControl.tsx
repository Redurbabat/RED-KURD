// Segmentierter Schalter (z. B. Kurz · Standard · Intensiv).
// Als Radiogruppe umgesetzt, damit die Pfeiltasten funktionieren.

export interface Segmentoption {
  id: string
  name: string
  zusatz?: string
}

export interface SegmentedControlProps {
  /** Wird für die Element-IDs gebraucht; muss auf der Seite einmalig sein. */
  name: string
  /** Beschriftung der ganzen Gruppe (`aria-label`). */
  label: string
  wert: string
  optionen: readonly Segmentoption[]
  aendern: (id: string) => void
  className?: string
}

export default function SegmentedControl({
  name,
  label,
  wert,
  optionen,
  aendern,
  className = '',
}: SegmentedControlProps) {
  /** Auswahl UND Fokus wechseln — sonst haengt der Fokus auf der alten Option. */
  function waehleUndFokussiere(id: string) {
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
              // Jeder Zugriff geht über `springeZu`: die Rechnungen liegen alle
              // im Bereich, aber der Prüfer sieht das nicht — und eine leere
              // Optionsliste gäbe es sonst als Absturz statt als Nichts.
              const i = optionen.findIndex((x) => x.id === wert)
              const springeZu = (index: number) => {
                const ziel = optionen[index]
                if (ziel) waehleUndFokussiere(ziel.id)
              }
              if (!optionen.length) return
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                springeZu((i + 1) % optionen.length)
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                springeZu((i - 1 + optionen.length) % optionen.length)
              }
              if (e.key === 'Home') {
                e.preventDefault()
                springeZu(0)
              }
              if (e.key === 'End') {
                e.preventDefault()
                springeZu(optionen.length - 1)
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
