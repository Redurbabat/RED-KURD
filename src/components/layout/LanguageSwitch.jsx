// Sprachwahl oben links: Die Flagge zeigt die Sprache, die gerade gelernt
// wird — ein Klick öffnet die Liste aller Kurse. Kurmancî trägt die
// Kurdistan-Flagge und bleibt der Hauptkurs.
import { useEffect, useRef, useState } from 'react'
import { navigiere, useRoute } from '../../app/router.jsx'
import { SPRACHKURSE } from '../../data/sprachkurse.js'
import FlagIcon from '../common/FlagIcon.jsx'
import Icon from '../icons/Icon.jsx'
import './LanguageSwitch.css'

const KURMANCI = { id: 'kurmanci', name: 'Kurmancî', eigenname: 'Kurmancî' }

/** Welche Sprache gehört zur aktuellen Adresse? */
function spracheAusPfad(pfad) {
  const m = /^\/languages\/([a-z]+)/.exec(pfad)
  if (m && SPRACHKURSE.some((k) => k.id === m[1])) return m[1]
  return 'kurmanci'
}

export default function LanguageSwitch({ className = '' }) {
  const { pfad } = useRoute()
  const [offen, setOffen] = useState(false)
  const wurzel = useRef(null)
  const aktiv = spracheAusPfad(pfad)
  const aktiverKurs = aktiv === 'kurmanci' ? KURMANCI : SPRACHKURSE.find((k) => k.id === aktiv)

  // Klick daneben oder Escape schliesst das Menü.
  useEffect(() => {
    if (!offen) return undefined
    function zu(ereignis) {
      if (ereignis.type === 'keydown' && ereignis.key !== 'Escape') return
      if (ereignis.type === 'pointerdown' && wurzel.current?.contains(ereignis.target)) return
      setOffen(false)
    }
    document.addEventListener('pointerdown', zu)
    document.addEventListener('keydown', zu)
    return () => {
      document.removeEventListener('pointerdown', zu)
      document.removeEventListener('keydown', zu)
    }
  }, [offen])

  function waehle(id) {
    setOffen(false)
    navigiere(id === 'kurmanci' ? '/course' : `/languages/${id}`)
  }

  return (
    <div className={('rk-sprachwahl ' + className).trim()} ref={wurzel}>
      <button
        type="button"
        className="rk-sprachwahl-knopf"
        aria-haspopup="menu"
        aria-expanded={offen}
        aria-label={`Lernsprache wechseln — aktuell ${aktiverKurs.name}`}
        onClick={() => setOffen((o) => !o)}
      >
        <FlagIcon sprache={aktiv} breite={27} />
        <Icon name="pfeilRunter" groesse={14} className="rk-sprachwahl-pfeil" />
      </button>

      {offen && (
        <ul className="rk-sprachwahl-menue" role="menu" aria-label="Lernsprache">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={'rk-sprachwahl-eintrag' + (aktiv === 'kurmanci' ? ' aktiv' : '')}
              aria-current={aktiv === 'kurmanci' ? 'true' : undefined}
              onClick={() => waehle('kurmanci')}
            >
              <FlagIcon sprache="kurmanci" breite={24} />
              <span className="rk-sprachwahl-name">
                <strong>Kurmancî</strong>
                <small>Hauptkurs · Deutsch → Kurmancî</small>
              </span>
              {aktiv === 'kurmanci' && <Icon name="haken" groesse={16} />}
            </button>
          </li>
          {SPRACHKURSE.map((kurs) => (
            <li role="none" key={kurs.id}>
              <button
                type="button"
                role="menuitem"
                className={'rk-sprachwahl-eintrag' + (aktiv === kurs.id ? ' aktiv' : '')}
                aria-current={aktiv === kurs.id ? 'true' : undefined}
                onClick={() => waehle(kurs.id)}
              >
                <FlagIcon sprache={kurs.id} breite={24} />
                <span className="rk-sprachwahl-name">
                  <strong>{kurs.name}</strong>
                  <small lang={kurs.locale}>{kurs.eigenname}</small>
                </span>
                {aktiv === kurs.id && <Icon name="haken" groesse={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
