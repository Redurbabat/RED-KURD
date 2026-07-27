// Ergebnisseite nach einer Sitzung — in beiden Modi gleich, nur anders gestylt.
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import HeloMascot from '../../components/mascot/HeloMascot.jsx'
import { T } from '../../core/texts.js'

/**
 * @param {{ergebnis:{prozent:number,richtig:number,gesamt:number,fehler:Array},
 *          sterne?:number, belohnung?:{xp?:number,edelsteine?:number,serie?:number},
 *          stil?:'modern'|'abenteuer', weiter:()=>void, wiederholen?:()=>void,
 *          fehlerUeben?:()=>void, titel?:string}} props
 */
export default function ExerciseResult({
  ergebnis,
  sterne = null,
  belohnung,
  stil = 'modern',
  weiter,
  wiederholen,
  fehlerUeben,
  titel,
}) {
  const gut = ergebnis.prozent >= 80
  return (
    <div className={`rk-ergebnis rk-ergebnis-${stil}`} role="status" aria-live="polite">
      <HeloMascot variante={gut ? 'feiern' : 'ruhig'} groesse={130} dekorativ />
      <h2>{titel || (gut ? T.uebung.ergebnis : 'Weiter so!')}</h2>
      <p className="rk-ergebnis-zahl">
        {ergebnis.richtig} von {ergebnis.gesamt} Aufgaben richtig
      </p>

      {sterne !== null && (
        <p className="rk-sterne">
          <span aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <Icon key={i} name="stern" groesse={34} className={i <= sterne ? 'stern-voll' : 'stern-leer'} />
            ))}
          </span>
          <span className="nur-sr">{sterne} von 3 Sternen</span>
        </p>
      )}

      {belohnung && (
        <ul className="rk-belohnungen">
          {belohnung.xp ? (
            <li>
              <Icon name="stern" groesse={18} /> +{belohnung.xp} XP
            </li>
          ) : null}
          {belohnung.edelsteine ? (
            <li>
              <Icon name="edelstein" groesse={18} /> +{belohnung.edelsteine} Edelsteine
            </li>
          ) : null}
          {belohnung.serie ? (
            <li>
              <Icon name="flamme" groesse={18} /> +{belohnung.serie} Serienpunkt
            </li>
          ) : null}
        </ul>
      )}

      {sterne !== null && sterne < 3 && (
        <p className="gedaempft">
          Den dritten Stern gibt es bei einer späteren erfolgreichen Wiederholung.
        </p>
      )}

      <div className="rk-ergebnis-knoepfe">
        <PrimaryButton breit groesse="gross" art={stil === 'abenteuer' ? 'gold' : 'primaer'} onClick={weiter}>
          Weiter
        </PrimaryButton>
        {wiederholen && (
          <PrimaryButton art="still" onClick={wiederholen}>
            {T.uebung.nochmal}
          </PrimaryButton>
        )}
        {fehlerUeben && ergebnis.fehler.length > 0 && (
          <PrimaryButton art="still" onClick={fehlerUeben}>
            {T.uebung.fehlerUeben} ({ergebnis.fehler.length})
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
