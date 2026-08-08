// Dialog mit Fokusfalle, Escape und Klick auf den Hintergrund.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from './PrimaryButton.tsx'

const FOKUSSIERBAR =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  offen: boolean
  /** Wird als `aria-label` des Dialogs benutzt — deshalb Pflicht. */
  titel: string
  schliessen: () => void
  fussleiste?: ReactNode
  children?: ReactNode
  breit?: boolean
}

export default function Modal({
  offen,
  titel,
  schliessen,
  fussleiste,
  children,
  breit = false,
}: ModalProps) {
  const kasten = useRef<HTMLDivElement>(null)
  // `document.activeElement` ist `Element`, kann also auch ein <svg> sein —
  // nur HTML-Elemente haben `focus()`. Deshalb die Prüfung unten im Aufräumen.
  const vorher = useRef<Element | null>(null)
  // schliessen ist bei jedem Render eine neue Funktion. Der Fokus-Effekt darf
  // deshalb NUR von `offen` abhaengen — sonst laeuft er bei jedem Tastendruck
  // neu, reisst den Fokus aus dem Eingabefeld und die Handy-Tastatur klappt
  // nach jedem Buchstaben zu. Die aktuelle Funktion kommt aus dem Ref.
  const schliessenRef = useRef(schliessen)
  schliessenRef.current = schliessen

  useEffect(() => {
    if (!offen) return undefined
    vorher.current = document.activeElement
    const erste = kasten.current?.querySelector<HTMLElement>(FOKUSSIERBAR)
    erste?.focus()

    function taste(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        schliessenRef.current()
        return
      }
      if (e.key !== 'Tab' || !kasten.current) return
      const liste = [...kasten.current.querySelectorAll<HTMLElement>(FOKUSSIERBAR)]
      const erstes = liste[0]
      const letztes = liste[liste.length - 1]
      // Ohne fokussierbares Element gibt es nichts einzufangen.
      if (!erstes || !letztes) return
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
      // `instanceof HTMLElement` statt einer Prüfung auf `.focus`: nur dann
      // weiß der Prüfer, dass die Methode wirklich existiert.
      if (vorher.current instanceof HTMLElement) vorher.current.focus()
    }
  }, [offen])

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
