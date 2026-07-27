// Shop des Abenteuer-Modus. Hier gibt es ausschliesslich Aussehen und Komfort —
// Lerninhalte sind und bleiben frei zugänglich.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { T } from '../../../core/texts.js'
import { statistik } from '../../../core/progress/progressSelectors.js'
import { truheBereit, truheOeffnen, gibEdelsteine } from '../../../core/progress/progressStore.js'
import {
  ARTIKEL,
  KATEGORIEN,
  istGekauft,
  istAktiv,
  kannKaufen,
  kaufe,
  setzeAktiv,
} from '../../../core/shop/shopStore.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import StatChip from '../../../components/common/StatChip.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './ShopPage.css'

/** Der Schatzschlüssel wird sofort eingelöst — so viel bringt die Bonustruhe. */
const BONUS_EDELSTEINE = 5

/** Die feste Reihe der Tagestruhe (siehe truheOeffnen im Lernstand). */
const TRUHEN_STUFEN = [
  { xp: 10, edelsteine: 1, schluessel: 0 },
  { xp: 15, edelsteine: 1, schluessel: 0 },
  { xp: 20, edelsteine: 1, schluessel: 0 },
  { xp: 25, edelsteine: 2, schluessel: 0 },
  { xp: 30, edelsteine: 2, schluessel: 1 },
]

function waehrungIcon(waehrung) {
  return waehrung === 'schluessel' ? 'schluessel' : 'edelstein'
}

/** „1 Edelstein“ / „3 Edelsteine“ — Schlüssel bleibt in beiden Fällen gleich. */
function waehrungText(anzahl, waehrung) {
  if (waehrung === 'schluessel') return `${anzahl} Schlüssel`
  return `${anzahl} ${anzahl === 1 ? 'Edelstein' : 'Edelsteine'}`
}

function ArtikelKarte({ artikel, vorrat, kaufen, umschalten }) {
  const verbrauch = artikel.art === 'verbrauch'
  const gekauft = !verbrauch && istGekauft(artikel.id)
  const aktiv = !verbrauch && istAktiv(artikel.id)
  const genug = kannKaufen(artikel.id)
  const fehlt = Math.max(0, artikel.preis - vorrat)
  const preisText = waehrungText(artikel.preis, artikel.waehrung)
  const fehltText = waehrungText(fehlt, artikel.waehrung)

  return (
    <li className={'adv-artikel' + (gekauft ? ' gekauft' : '')}>
      <div className="adv-artikel-kopf">
        <span className="adv-artikel-icon">
          <Icon name={artikel.icon} groesse={24} />
        </span>
        <div className="shop-artikel-text">
          <strong>{artikel.name}</strong>
          <p>{artikel.beschreibung}</p>
        </div>
      </div>

      <p className="shop-preiszeile">
        <span className="adv-artikel-preis">
          <Icon name={waehrungIcon(artikel.waehrung)} groesse={18} />
          <span>{preisText}</span>
        </span>
        {aktiv && (
          <Badge ton="gruen" icon="haken">
            Aktiv
          </Badge>
        )}
        {gekauft && !aktiv && (
          <Badge ton="neutral" icon="haken">
            Gekauft
          </Badge>
        )}
      </p>

      <div className="shop-aktion">
        {gekauft ? (
          <PrimaryButton
            art={aktiv ? 'still' : 'gruen'}
            groesse="klein"
            icon={aktiv ? 'kreuz' : 'haken'}
            onClick={() => umschalten(artikel)}
            aria-label={`„${artikel.name}“ ${aktiv ? 'abwählen' : 'anlegen'}`}
          >
            {aktiv ? 'Abwählen' : 'Anlegen'}
          </PrimaryButton>
        ) : genug ? (
          <PrimaryButton
            art="gold"
            groesse="klein"
            icon="shop"
            onClick={() => kaufen(artikel)}
            aria-label={`„${artikel.name}“ für ${preisText} kaufen`}
          >
            Kaufen
          </PrimaryButton>
        ) : (
          <>
            <PrimaryButton
              art="still"
              groesse="klein"
              icon="shop"
              disabled
              aria-label={`„${artikel.name}“ kaufen — noch ${fehltText} nötig`}
            >
              Kaufen
            </PrimaryButton>
            <span className="shop-fehlt">
              <Icon name="info" groesse={16} />
              <span>Noch {fehltText} nötig</span>
            </span>
          </>
        )}
        {verbrauch && (
          <span className="shop-fehlt">
            <Icon name="wiederholen" groesse={16} />
            <span>Immer wieder kaufbar</span>
          </span>
        )}
      </div>
    </li>
  )
}

export default function ShopPage() {
  useLernstand()
  const [tab, setTab] = useState(KATEGORIEN[0].id)
  const [meldung, setMeldung] = useState('')
  const [truhenGewinn, setTruhenGewinn] = useState(null)

  const s = statistik()
  const vorrat = { edelsteine: s.edelsteine, schluessel: s.schluessel }
  const kategorie = KATEGORIEN.find((k) => k.id === tab) || KATEGORIEN[0]
  const artikelListe = ARTIKEL.filter((a) => a.kategorie === kategorie.id)
  const truheOffen = truheBereit()
  const stufe = s.serie % TRUHEN_STUFEN.length

  function kaufen(artikel) {
    const ergebnis = kaufe(artikel.id)
    if (ergebnis === 'ok' && artikel.art === 'verbrauch') {
      // Der Schatzschlüssel wird sofort eingelöst. Der Lernstand kennt nur die
      // Tagestruhe, deshalb wird die Bonustruhe hier ausgezahlt.
      gibEdelsteine(BONUS_EDELSTEINE)
      setMeldung(
        `Gekauft! Die Bonustruhe bringt dir ${waehrungText(BONUS_EDELSTEINE, 'edelsteine')}.`
      )
      return
    }
    if (ergebnis === 'ok') {
      setMeldung('Gekauft!')
      return
    }
    if (ergebnis === 'zu-teuer') {
      setMeldung(
        artikel.waehrung === 'schluessel'
          ? 'Dafür fehlen dir noch Schlüssel.'
          : 'Dafür fehlen dir noch Edelsteine.'
      )
      return
    }
    if (ergebnis === 'schon-da') {
      setMeldung('Das besitzt du schon.')
      return
    }
    setMeldung('Diesen Artikel gibt es hier nicht.')
  }

  function umschalten(artikel) {
    const warAktiv = istAktiv(artikel.id)
    setzeAktiv(artikel.id)
    setMeldung(warAktiv ? `„${artikel.name}“ abgewählt.` : `„${artikel.name}“ angelegt.`)
  }

  function oeffneTruhe() {
    const gewinn = truheOeffnen()
    if (gewinn) setTruhenGewinn(gewinn)
  }

  function wechsle(id) {
    setTab(id)
    setMeldung('')
  }

  return (
    <div className="shop-seite">
      <PageHeader
        titel="Shop"
        untertitel="Nur Aussehen und Komfort — nie Lerninhalte."
        variante="truhe"
      />

      <ul className="shop-besitz" role="list" aria-label="Dein Besitz">
        <li>
          <StatChip icon="edelstein" wert={s.edelsteine} label="Edelsteine" ton="teal" />
        </li>
        <li>
          <StatChip icon="schluessel" wert={s.schluessel} label="Schlüssel" ton="gold" />
        </li>
      </ul>

      <div className="rk-tabs" role="tablist" aria-label="Kategorien im Shop">
        {KATEGORIEN.map((k) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            id={`shop-tab-${k.id}`}
            className="rk-tab"
            aria-selected={tab === k.id}
            aria-controls="shop-panel"
            onClick={() => wechsle(k.id)}
          >
            <Icon name={k.icon} groesse={18} />
            <span>{k.name}</span>
          </button>
        ))}
      </div>

      <div className="shop-meldung" aria-live="polite">
        {meldung && (
          <p className="shop-meldung-text">
            <Icon name="info" groesse={18} />
            <span>{meldung}</span>
          </p>
        )}
      </div>

      <div id="shop-panel" role="tabpanel" aria-labelledby={`shop-tab-${kategorie.id}`}>
        {kategorie.id === 'taeglich' ? (
          <>
            <div className="adv-truhe">
              <HeloMascot variante="truhe" groesse={64} dekorativ />
              <div className="adv-truhe-text">
                {truheOffen ? (
                  <>
                    <strong>Die heutige Truhe ist noch verschlossen.</strong>
                    <p>Jeden Tag wartet eine neue Truhe auf dich — kostenlos.</p>
                  </>
                ) : (
                  <>
                    <strong>Heute schon geöffnet</strong>
                    <p>Morgen liegt die nächste Truhe für dich bereit.</p>
                  </>
                )}
              </div>
              {truheOffen && (
                <PrimaryButton art="gold" icon="truhe" onClick={oeffneTruhe}>
                  {T.abenteuer.truheOeffnen}
                </PrimaryButton>
              )}
            </div>

            <div aria-live="polite">
              {truhenGewinn && (
                <p className="shop-gewinn">
                  <Icon name="haken" groesse={18} />
                  <span>
                    Truhe geöffnet: +{truhenGewinn.xp} XP · +
                    {waehrungText(truhenGewinn.edelsteine, 'edelsteine')}
                    {truhenGewinn.schluessel
                      ? ` · +${waehrungText(truhenGewinn.schluessel, 'schluessel')}`
                      : ''}
                  </span>
                </p>
              )}
            </div>

            <Card titel="So wächst deine Belohnung" icon="flamme">
              <p className="shop-text">
                Der Inhalt der Truhe richtet sich nach deiner Serie. Sie durchläuft eine feste
                Reihe von fünf Stufen und beginnt danach wieder von vorn. Deine Serie liegt gerade
                bei {s.serie} {s.serie === 1 ? 'Tag' : 'Tagen'}.
              </p>
              <ul className="shop-stufen" role="list">
                {TRUHEN_STUFEN.map((t, i) => (
                  <li key={t.xp} className="shop-stufe">
                    <span className="shop-stufe-nr">Stufe {i + 1}</span>
                    <span className="shop-stufe-inhalt">
                      +{t.xp} XP · +{waehrungText(t.edelsteine, 'edelsteine')}
                      {t.schluessel ? ` · +${waehrungText(t.schluessel, 'schluessel')}` : ''}
                    </span>
                    {i === stufe && (
                      <Badge ton="gold" icon="stern">
                        Deine Stufe
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
              <p className="shop-text">
                Die Tagestruhe kostet nichts. Mit einem Schatzschlüssel öffnest du zusätzlich eine
                Bonustruhe.
              </p>
            </Card>
          </>
        ) : artikelListe.length ? (
          <ul className="adv-shopraster shop-raster" role="list">
            {artikelListe.map((a) => (
              <ArtikelKarte
                key={a.id}
                artikel={a}
                vorrat={a.waehrung === 'schluessel' ? vorrat.schluessel : vorrat.edelsteine}
                kaufen={kaufen}
                umschalten={umschalten}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            variante="denken"
            titel="Hier ist gerade nichts zu haben."
            text="Schau später noch einmal vorbei — Lerninhalte findest du ohnehin immer frei im Kurs."
          />
        )}
      </div>

      <p className="rk-hinweisstreifen shop-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          Im Shop gibt es nur Aussehen und Komfort. Alle Lerninhalte sind und bleiben frei
          zugänglich.
        </span>
      </p>
    </div>
  )
}
