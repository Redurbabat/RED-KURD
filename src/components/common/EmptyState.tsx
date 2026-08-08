// Leer-, Lade- und Fehlerzustaende — jede Liste in der App nutzt einen davon.
import type { ReactNode } from 'react'
import HeloMascot from '../mascot/HeloMascot.tsx'
import PrimaryButton from './PrimaryButton.tsx'
import Icon from '../icons/Icon.tsx'
import { T } from '../../core/texts.js'

export interface EmptyStateProps {
  titel: string
  text?: string
  /** Stimmung des Maskottchens; HeloMascot ist noch JavaScript. */
  variante?: string
  /** Nur zusammen mit `aktionText` sichtbar — ein Knopf ohne Text wäre stumm. */
  aktion?: () => void
  aktionText?: string
  className?: string
}

export default function EmptyState({
  titel,
  text,
  variante = 'ruhig',
  aktion,
  aktionText,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`rk-leer ${className}`}>
      <HeloMascot variante={variante} groesse={92} dekorativ />
      <h3>{titel}</h3>
      {text && <p className="gedaempft">{text}</p>}
      {aktion && aktionText && (
        <PrimaryButton onClick={aktion} art="primaer">
          {aktionText}
        </PrimaryButton>
      )}
    </div>
  )
}

export interface LoadingStateProps {
  text?: ReactNode
}

export function LoadingState({ text = T.allgemein.laden }: LoadingStateProps) {
  return (
    <div className="rk-laden" role="status" aria-live="polite">
      <span className="rk-spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}

export interface ErrorStateProps {
  titel?: ReactNode
  text?: ReactNode
  /** Fehlt der Rückruf, erscheint kein „Nochmal versuchen". */
  nochmal?: () => void
}

export function ErrorState({ titel = T.allgemein.fehler, text, nochmal }: ErrorStateProps) {
  return (
    <div className="rk-fehler" role="alert">
      <Icon name="warnung" groesse={28} />
      <div>
        <strong>{titel}</strong>
        {text && <p className="gedaempft">{text}</p>}
      </div>
      {nochmal && (
        <PrimaryButton art="still" groesse="klein" onClick={nochmal}>
          Nochmal versuchen
        </PrimaryButton>
      )}
    </div>
  )
}
