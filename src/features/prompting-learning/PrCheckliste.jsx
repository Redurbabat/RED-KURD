// Pull Request prüfen: die Fragen, die vor jedem Merge zu beantworten
// sind — mit ehrlicher Empfehlung am Ende.
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { useLernstand } from '../../core/store.js'
import { PR_CHECKLISTE, pruefeMerge } from '../../core/prompting/promptBaukasten.js'
import { holePr, leerePr, schaltePr } from '../../core/prompting/werkstattStore.js'

export default function PrCheckliste() {
  useLernstand()
  const haken = holePr()
  const urteil = pruefeMerge(haken)

  return (
    <div className="pl-pr">
      <Card titel="Pull Request prüfen" icon="schild">
        <p className="pl-text">
          Bevor du einen PR übernimmst: Geh die Punkte durch. Tests und Verbote sind
          Ausschlusskriterien — ohne sie wird nicht gemergt.
        </p>
      </Card>

      <Card>
        <ul className="pl-checkliste">
          {PR_CHECKLISTE.map((punkt) => {
            const an = !!haken[punkt.id]
            return (
              <li key={punkt.id}>
                <button
                  type="button"
                  className={`pl-check-knopf${an ? ' an' : ''}`}
                  aria-pressed={an}
                  onClick={() => schaltePr(punkt.id)}
                >
                  <span className="pl-check-kasten" aria-hidden="true">
                    {an && <Icon name="haken" groesse={16} />}
                  </span>
                  <span>{punkt.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card titel="Empfehlung" icon={urteil.mergen ? 'haken' : 'warnung'} ton={urteil.mergen ? 'gruen' : 'warm'}>
        <p className="pl-urteil" aria-live="polite">
          <Badge ton={urteil.mergen ? 'gruen' : 'rot'}>
            {urteil.mergen ? 'Mergen' : 'Noch nicht mergen'}
          </Badge>{' '}
          {urteil.text}
        </p>
        <PrimaryButton art="still" icon="wiederholen" onClick={leerePr}>
          Haken zurücksetzen
        </PrimaryButton>
      </Card>
    </div>
  )
}
