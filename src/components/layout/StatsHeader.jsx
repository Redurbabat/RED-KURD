// Kopfbereich: Logo-Zeile mit Wortmarke und Profil, darunter eine einzelne
// Statistik-Leiste mit senkrechten Trennern — wie in der Design-Vorlage.
import Icon from '../icons/Icon.jsx'
import HeloMascot from '../mascot/HeloMascot.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'
import { navigiere } from '../../app/router.jsx'
import { statistik } from '../../core/progress/progressSelectors.js'
import { T } from '../../core/texts.js'

function Wert({ icon, ton, wert, label, kurzLabel }) {
  return (
    <div className="rk-wert">
      <Icon name={icon} groesse={20} className={'rk-wert-icon ' + ton} />
      <span className="rk-wert-text">
        <strong className={ton}>{wert}</strong>
        <small className="rk-wert-lang">{label}</small>
        <small className="rk-wert-kurz" aria-hidden="true">
          {kurzLabel || label}
        </small>
        {kurzLabel && <span className="nur-sr">{label}</span>}
      </span>
    </div>
  )
}

/**
 * @param {{modus:'modern'|'abenteuer'|'redlingo'}} props
 */
export default function StatsHeader({ modus = 'modern' }) {
  const s = statistik()

  return (
    <header
      className={`rk-kopfleiste${modus === 'abenteuer' ? ' abenteuer' : ''}${
        modus === 'redlingo' ? ' redlingo' : ''
      }`}
    >
      <div className="rk-kopf-zeile">
        <LanguageSwitch />
        <button
          type="button"
          className="rk-marke-klein"
          onClick={() =>
            navigiere(
              modus === 'abenteuer' ? '/adventure' : modus === 'redlingo' ? '/redlingo' : '/today'
            )
          }
          aria-label={`${T.app.name} – Startseite`}
        >
          <img src="/bilder/logo.png" alt="" width="40" height="40" />
          <span className="rk-marke-wort">
            <strong>
              {modus === 'redlingo' ? (
                <span className="rk-marke-rot">REDLINGO</span>
              ) : (
                <>
                  <span className="rk-marke-rot">RED</span>-KURD
                </>
              )}
            </strong>
            <small>{T.app.claim}</small>
          </span>
        </button>

        <span className="luecke" />

        <button
          type="button"
          className="rk-kopf-profil"
          onClick={() =>
            navigiere(
              modus === 'abenteuer'
                ? '/adventure/profile'
                : modus === 'redlingo'
                  ? '/redlingo/profile'
                  : '/settings'
            )
          }
          aria-label={modus === 'modern' ? T.nav.einstellungen : T.nav.profil}
        >
          {modus === 'abenteuer' ? (
            <HeloMascot variante="ruhig" groesse={30} dekorativ />
          ) : (
            <Icon name="profil" groesse={22} />
          )}
        </button>
        <button
          type="button"
          className="rk-kopf-zahnrad"
          onClick={() => navigiere('/settings')}
          aria-label={T.nav.einstellungen}
        >
          <Icon name="einstellungen" groesse={22} />
        </button>
      </div>

      <div className="rk-werteleiste scroll-x">
        <Wert
          icon="flamme"
          ton="ton-flamme"
          wert={s.serie}
          label={T.stats.serie}
          kurzLabel={T.stats.serieKurz}
        />
        <Wert icon="stern" ton="ton-gold" wert={s.xp} label="Gesamt-XP" kurzLabel="XP" />
        {modus === 'abenteuer' ? (
          <>
            <Wert
              icon="edelstein"
              ton="ton-edelstein"
              wert={s.edelsteine}
              label={T.stats.edelsteine}
              kurzLabel={T.stats.edelsteineKurz}
            />
            {/* Energie ist bewusst unbegrenzt: Lerninhalte werden nie gesperrt. */}
            <Wert icon="blitz" ton="ton-energie" wert="∞" label="Energie" kurzLabel="Energie" />
          </>
        ) : modus === 'redlingo' ? (
          <>
            <Wert
              icon="buch"
              ton="ton-woerter"
              wert={s.gelernt}
              label={T.stats.woerter}
              kurzLabel={T.stats.woerterKurz}
            />
            <Wert icon="schild" ton="ton-level" wert={s.level} label="Level" kurzLabel="Level" />
          </>
        ) : (
          <Wert
            icon="buch"
            ton="ton-woerter"
            wert={s.gelernt}
            label={T.stats.woerter}
            kurzLabel={T.stats.woerterKurz}
          />
        )}
      </div>
    </header>
  )
}
