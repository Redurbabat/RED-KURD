// Eine geoeffnete Lektion: Inhalt lesen, Beispiel ansehen, abschliessen.
// Wird von Code lernen und AI-Sprache gemeinsam genutzt.
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'
import Modal from '../../components/common/Modal.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { XP_JE_LEKTION } from '../../core/lernbereiche/bereichsLernstand.js'

/**
 * @param {{lektion:Object|null, erledigt:boolean, schliessen:Function,
 *          abschliessen:Function}} props
 */
export default function LektionModal({ lektion, erledigt, schliessen, abschliessen }) {
  if (!lektion) return null
  return (
    <Modal
      offen
      breit
      titel={lektion.title}
      schliessen={schliessen}
      fussleiste={
        erledigt ? (
          <>
            <Badge ton="gruen" icon="haken">
              Erledigt
            </Badge>
            <PrimaryButton art="still" onClick={schliessen}>
              Schließen
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton icon="haken" onClick={abschliessen}>
            Lektion abschließen · +{XP_JE_LEKTION} XP
          </PrimaryButton>
        )
      }
    >
      <div className="lektion-inhalt">
        {(lektion.inhalt || []).map((absatz, i) => (
          <p key={i}>{absatz}</p>
        ))}

        {lektion.beispiel && (
          <pre className="lektion-beispiel" tabIndex={0} aria-label="Beispiel">
            <code>{lektion.beispiel}</code>
          </pre>
        )}

        {lektion.merke && (
          <p className="lektion-merke">
            <Icon name="info" groesse={18} />
            <span>
              <strong>Merke:</strong> {lektion.merke}
            </span>
          </p>
        )}
      </div>
    </Modal>
  )
}
