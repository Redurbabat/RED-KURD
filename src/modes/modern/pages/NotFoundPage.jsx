// Freundliche Seite für unbekannte Adressen: sagt, was los ist, zeigt den
// gesuchten Pfad und bietet zwei sichere Wege zurück in die App.
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './NotFoundPage.css'

export default function NotFoundPage({ pfad }) {
  useLernstand()

  return (
    <div className="nf-seite">
      <HeloMascot variante="denken" groesse={120} dekorativ />

      <h1>Diese Seite gibt es nicht</h1>
      <p className="gedaempft">
        Hêlo hat überall gesucht und nichts gefunden. Vielleicht hat sich ein Tippfehler
        eingeschlichen, oder die Adresse stammt aus einer älteren Version.
      </p>

      {pfad && (
        <p className="nf-pfad">
          Gesucht: <code className="nf-code">{pfad}</code>
        </p>
      )}

      <div className="nf-knoepfe">
        <PrimaryButton icon="heute" onClick={() => navigiere('/today')}>
          Zu Heute
        </PrimaryButton>
        <PrimaryButton art="still" icon="welt" onClick={() => navigiere('/adventure/world')}>
          Zur Weltkarte
        </PrimaryButton>
      </div>
    </div>
  )
}
