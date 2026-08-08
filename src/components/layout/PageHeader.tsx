// Einheitlicher Seitenkopf: Titel, Untertitel, optional Hêlo und Zurueck-Knopf.
import HeloMascot from '../mascot/HeloMascot.tsx'
import Icon from '../icons/Icon.tsx'
import { navigiere } from '../../app/router.jsx'
import { T } from '../../core/texts.js'

import type { ReactNode } from 'react'

export interface PageHeaderProps {
  titel: ReactNode
  untertitel?: ReactNode
  /** Stimmung des Maskottchens. */
  variante?: string
  /** Ziel des Zurück-Knopfs; ohne Angabe erscheint keiner. */
  zurueck?: string
  zurueckText?: string
  aktion?: ReactNode
  ohneMaskottchen?: boolean
}

export default function PageHeader({
  titel,
  untertitel,
  variante = 'ruhig',
  zurueck,
  zurueckText = T.allgemein.zurueck,
  aktion,
  ohneMaskottchen = false,
}: PageHeaderProps) {
  return (
    <div className="rk-seitenkopf">
      {zurueck && (
        <button type="button" className="rk-zurueck" onClick={() => navigiere(zurueck)}>
          <Icon name="pfeilLinks" groesse={18} />
          <span>{zurueckText}</span>
        </button>
      )}
      <div className="rk-seitenkopf-reihe">
        <div className="rk-seitenkopf-text">
          <h1>{titel}</h1>
          {untertitel && <p className="rk-seitenkopf-unter">{untertitel}</p>}
        </div>
        {!ohneMaskottchen && <HeloMascot variante={variante} groesse={72} dekorativ />}
        {aktion}
      </div>
    </div>
  )
}
