// Hêlo mit Sprechblase — der wiederkehrende Begleiter auf allen Seiten.
import HeloMascot from './HeloMascot.jsx'

/**
 * @param {{text:string, titel?:string, variante?:string, groesse?:number,
 *          seite?:'links'|'rechts', className?:string}} props
 */
export default function HeloMessage({
  text,
  titel = 'Hêlo sagt:',
  variante = 'ruhig',
  groesse = 84,
  seite = 'rechts',
  className = '',
}) {
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
