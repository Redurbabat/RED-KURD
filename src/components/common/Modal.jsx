// Dialog mit Fokusfalle, Escape und Klick auf den Hintergrund.
import { useEffect, useRef } from 'react'
import { IconButton } from './PrimaryButton.jsx'

const FOKUSSIERBAR =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * @param {{offen:boolean, titel:string, schliessen:()=>void,
 *          fussleiste?:React.ReactNode, children:React.ReactNode}} props
 */
export default function Modal({ offen, titel, schliessen, fussleiste, children, breit = false }) {
  const kasten = useRef(null)
  const vorher = useRef(null)

  useEffect(() => {
    if (!offen) return undefined
    vorher.current = document.activeElement
    const erste = kasten.current?.querySelector(FOKUSSIERBAR)
    erste?.focus()

    function taste(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        schliessen()
        return
      }
      if (e.key !== 'Tab' || !kasten.current) return
      const liste = [...kasten.current.querySelectorAll(FOKUSSIERBAR)]
      if (!liste.length) return
      const erstes = liste[0]
      const letztes = liste[liste.length - 1]
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault()
        letztes.focus()
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault()
        erstes.focus()
      }
    }

    document.addEventListener('keydown', taste)
    const alteBreite = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', taste)
      document.body.style.overflow = alteBreite
      if (vorher.current && vorher.current.focus) vorher.current.focus()
    }
  }, [offen, schliessen])

  if (!offen) return null

  return (
    <div className="rk-modal-hintergrund" onClick={schliessen}>
      <div
        className={'rk-modal' + (breit ? ' rk-modal-breit' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={titel}
        ref={kasten}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rk-modal-kopf">
          <h2>{titel}</h2>
          <IconButton icon="kreuz" label="Dialog schließen" onClick={schliessen} />
        </header>
        <div className="rk-modal-inhalt">{children}</div>
        {fussleiste && <footer className="rk-modal-fuss">{fussleiste}</footer>}
      </div>
    </div>
  )
}
