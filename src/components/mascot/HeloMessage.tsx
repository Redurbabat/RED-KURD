// Hêlo mit Sprechblase — der wiederkehrende Begleiter auf allen Seiten.
import type { ReactNode } from 'react'
import HeloMascot from './HeloMascot.tsx'

export interface HeloMessageProps {
  text: ReactNode
  titel?: string
  variante?: string
  groesse?: number
  seite?: 'links' | 'rechts'
  className?: string
}

export default function HeloMessage({
  text,
  titel = 'Hêlo sagt:',
  variante = 'ruhig',
  groesse = 84,
  seite = 'rechts',
  className = '',
}: HeloMessageProps) {
  return (
    <div className={`helo-nachricht helo-${seite} ${className}`}>
      <div className="helo-blase">
        <span className="helo-blase-titel">{titel}</span>
        <p className="helo-blase-text">{text}</p>
      </div>
      <HeloMascot variante={variante} groesse={groesse} dekorativ />
    </div>
  )
}
