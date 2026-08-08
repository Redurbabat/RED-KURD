// Sprachwahl oben links: Die Flagge zeigt die Sprache, die gerade gelernt
// wird — ein Klick öffnet die Liste aller Kurse. Kurmancî trägt die
// Kurdistan-Flagge und bleibt der Hauptkurs.
import { useEffect, useRef, useState } from 'react'
import { navigiere, useRoute } from '../../app/router.jsx'
import { SPRACHKURSE } from '../../data/sprachkurse.js'
import FlagIcon, { FLAGGEN_SPRACHEN } from '../common/FlagIcon.tsx'
import type { Flaggensprache } from '../common/FlagIcon.tsx'
import Icon from '../icons/Icon.tsx'
import './LanguageSwitch.css'

const KURMANCI = { id: 'kurmanci', name: 'Kurmancî', eigenname: 'Kurmancî' } as const

/**
 * Nur Sprachen, für die es auch eine Flagge gibt. Die Kurs-IDs kommen aus
 * `data/sprachkurse.js` (noch JavaScript) und sind dort blosser Text — ohne
 * diese Prüfung liesse sich eine Sprache anlegen, deren Flagge fehlt, und
 * `FlagIcon` zeigte still gar nichts.
 */
function istFlaggensprache(wert: string): wert is Flaggensprache {
  return FLAGGEN_SPRACHEN.some((s) => s === wert)
}

/** Welche Sprache gehört zur aktuellen Adresse? */
function spracheAusPfad(pfad: string): Flaggensprache {
  const m = /^\/languages\/([a-z]+)/.exec(pfad)
  const id = m?.[1]
  if (id && istFlaggensprache(id) && SPRACHKURSE.some((k) => k.id === id)) return id
  return 'kurmanci'
}

export interface LanguageSwitchProps {
  className?: string
}

export default function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const { pfad } = useRoute()
  const [offen, setOffen] = useState(false)
  const wurzel = useRef<HTMLDivElement>(null)
  const aktiv = spracheAusPfad(pfad)
  // Der Rückfall auf KURMANCI greift auch dann, wenn ein Kurs aus den Daten
  // verschwindet, dessen Adresse aber noch offen ist.
  const aktiverKurs =
    (aktiv === 'kurmanci' ? KURMANCI : SPRACHKURSE.find((k) => k.id === aktiv)) ?? KURMANCI

  // Klick daneben oder Escape schliesst das Menü.
  useEffect(() => {
    if (!offen) return undefined
    function zu(ereignis: Event) {
      if (ereignis instanceof KeyboardEvent && ereignis.key !== 'Escape') return
      // `ereignis.target` ist `EventTarget` — nur ein Knoten lässt sich in
      // `contains()` nachschlagen.
      const ziel = ereignis.target
      if (ereignis.type === 'pointerdown' && ziel instanceof Node && wurzel.current?.contains(ziel)) {
        return
      }
      setOffen(false)
    }
    document.addEventListener('pointerdown', zu)
    document.addEventListener('keydown', zu)
    return () => {
      document.removeEventListener('pointerdown', zu)
      document.removeEventListener('keydown', zu)
    }
  }, [offen])

  function waehle(id: string) {
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
                {istFlaggensprache(kurs.id) && <FlagIcon sprache={kurs.id} breite={24} />}
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
