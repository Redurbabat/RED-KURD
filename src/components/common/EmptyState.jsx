// Leer-, Lade- und Fehlerzustaende — jede Liste in der App nutzt einen davon.
import HeloMascot from '../mascot/HeloMascot.jsx'
import PrimaryButton from './PrimaryButton.jsx'
import Icon from '../icons/Icon.jsx'
import { T } from '../../core/texts.js'

export default function EmptyState({ titel, text, variante = 'ruhig', aktion, aktionText, className = '' }) {
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

export function LoadingState({ text = T.allgemein.laden }) {
  return (
    <div className="rk-laden" role="status" aria-live="polite">
      <span className="rk-spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}

export function ErrorState({ titel = T.allgemein.fehler, text, nochmal }) {
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
