// Kopfleiste: Logo, Kennzahlen, Profil-Knopf. Bleibt bewusst flach,
// damit auf 9:16-Handys moeglichst viel Platz fuer den Inhalt bleibt.
import StatChip from '../common/StatChip.jsx'
import { IconButton } from '../common/PrimaryButton.jsx'
import HeloMascot from '../mascot/HeloMascot.jsx'
import { navigiere } from '../../app/router.jsx'
import { statistik } from '../../core/progress/progressSelectors.js'
import { T } from '../../core/texts.js'

/**
 * @param {{modus:'modern'|'abenteuer'}} props
 */
export default function StatsHeader({ modus = 'modern' }) {
  const s = statistik()

  return (
    <header className={'rk-kopfleiste' + (modus === 'abenteuer' ? ' abenteuer' : '')}>
      <button
        type="button"
        className="rk-kopf-logo"
        onClick={() => navigiere(modus === 'abenteuer' ? '/adventure' : '/today')}
        aria-label={`${T.app.name} – Startseite`}
      >
        <img src="/bilder/logo.png" alt="" width="34" height="34" />
        <span className="rk-kopf-name">{T.app.name}</span>
      </button>

      <div className="rk-kopf-werte scroll-x">
        <StatChip
          icon="flamme"
          wert={s.serie}
          label={T.stats.serie}
          kurzLabel={T.stats.serieKurz}
          ton="orange"
        />
        <StatChip icon="stern" wert={s.xp} label={T.stats.xp} ton="gold" />
        {modus === 'abenteuer' ? (
          <>
            <StatChip
              icon="edelstein"
              wert={s.edelsteine}
              label={T.stats.edelsteine}
              kurzLabel={T.stats.edelsteineKurz}
              ton="teal"
            />
            <StatChip
              icon="schild"
              wert={s.level}
              label={T.stats.level}
              kurzLabel={T.stats.levelKurz}
              ton="blau"
            />
          </>
        ) : (
          <StatChip
            icon="buch"
            wert={s.gelernt}
            label={T.stats.woerter}
            kurzLabel={T.stats.woerterKurz}
            ton="teal"
          />
        )}
      </div>

      <button
        type="button"
        className="rk-kopf-profil"
        onClick={() => navigiere(modus === 'abenteuer' ? '/adventure/profile' : '/settings')}
        aria-label={modus === 'abenteuer' ? T.nav.profil : T.nav.einstellungen}
      >
        <HeloMascot variante="ruhig" groesse={30} dekorativ />
      </button>
      <IconButton
        icon="einstellungen"
        label={T.nav.einstellungen}
        className="rk-kopf-zahnrad"
        onClick={() => navigiere('/settings')}
      />
    </header>
  )
}
