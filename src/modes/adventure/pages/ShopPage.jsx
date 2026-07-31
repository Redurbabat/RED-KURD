// Shop des Abenteuer-Modus (Designpaket Bild 10). Hier gibt es ausschliesslich
// Aussehen und Komfort — alle Lerninhalte bleiben frei zugänglich.
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

// Kurze Beschriftung der Reiter — im Lernstand heisst die letzte Kategorie
// „Tägliche Belohnung", im Abenteuer-Modus zeigen wir „Tagestruhe".
const TAB_NAME = { taeglich: 'Tagestruhe' }

// Farbton je Artikel wie im Mockup. Unbekannte Artikel bekommen Türkis.
const ARTIKEL_TON = {
  'helo-schal': 'rot',
  'bergpfad-thema': 'gruen',
  klangpaket: 'blau',
  'streak-schutz': 'teal',
  profilrahmen: 'lila',
  schatzschluessel: 'gold',
}

function waehrungIcon(waehrung) {
  return waehrung === 'schluessel' ? 'schluessel' : 'edelstein'
}

/** „1 Edelstein" / „3 Edelsteine" — Schlüssel bleibt in beiden Fällen gleich. */
function waehrungText(anzahl, waehrung) {
  if (waehrung === 'schluessel') return `${anzahl} Schlüssel`
  return `${anzahl} ${anzahl === 1 ? 'Edelstein' : 'Edelsteine'}`
}

function truhenText(stufe) {
  const teile = [`+${stufe.xp} XP`, `+${waehrungText(stufe.edelsteine, 'edelsteine')}`]
  if (stufe.schluessel) teile.push(`+${waehrungText(stufe.schluessel, 'schluessel')}`)
  return teile.join(' · ')
}

function ArtikelKarte({ artikel, vorrat, kaufen, umschalten }) {
  const verbrauch = artikel.art === 'verbrauch'
  const gekauft = !verbrauch && istGekauft(artikel.id)
  const aktiv = !verbrauch && istAktiv(artikel.id)
  const genug = kannKaufen(artikel.id)
  const fehlt = Math.max(0, artikel.preis - vorrat)
  const preisText = waehrungText(artikel.preis, artikel.waehrung)
  const fehltText = waehrungText(fehlt, artikel.waehrung)
  const ton = ARTIKEL_TON[artikel.id] || 'teal'

  return (
    <li className={`adv-artikel sh-artikel sh-ton-${ton}` + (gekauft ? ' gekauft' : '')}>
      <div className="adv-artikel-kopf">
        <span className="adv-artikel-icon sh-artikel-icon">
          <Icon name={artikel.icon} groesse={22} />
        </span>
        <div className="sh-artikel-text">
          <strong>{artikel.name}</strong>
          <p>{artikel.beschreibung}</p>
        </div>
      </div>

      {/* Im Mockup steht in der Pille nur die Zahl — die Währung liest der
          Screenreader trotzdem mit. */}
      <span className="adv-artikel-preis sh-preis">
        <Icon name={waehrungIcon(artikel.waehrung)} groesse={18} />
        <span aria-hidden="true">{artikel.preis}</span>
        <span className="nur-sr">Preis: {preisText}</span>
      </span>

      <div className="sh-aktion">
        {aktiv && (
          <Badge ton="gruen" icon="haken">
            Aktiv
          </Badge>
        )}

        {gekauft ? (
          <PrimaryButton
            art={aktiv ? 'still' : 'gruen'}
            groesse="klein"
            icon={aktiv ? 'kreuz' : 'haken'}
            onClick={() => umschalten(artikel)}
            aria-label={`„${artikel.name}“ ${aktiv ? 'abwählen' : 'anlegen'}. ${artikel.beschreibung}`}
          >
            {aktiv ? 'Abwählen' : 'Anlegen'}
          </PrimaryButton>
        ) : genug ? (
          <PrimaryButton
            art="gold"
            groesse="klein"
            icon="shop"
            onClick={() => kaufen(artikel)}
            aria-label={`„${artikel.name}“ für ${preisText} kaufen. ${artikel.beschreibung}`}
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
              aria-label={`„${artikel.name}“ kaufen — dafür fehlen dir noch ${fehltText}`}
            >
              Kaufen
            </PrimaryButton>
            <span className="sh-hinweiszeile">
              <Icon name="info" groesse={16} />
              <span>Noch {fehltText} nötig</span>
            </span>
          </>
        )}

        {verbrauch && (
          <span className="sh-hinweiszeile">
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

  const s = statistik()
  const kategorie = KATEGORIEN.find((k) => k.id === tab) || KATEGORIEN[0]
  const artikelListe = ARTIKEL.filter((a) => a.kategorie === kategorie.id)
  const truheOffen = truheBereit()
  const stufe = s.serie % TRUHEN_STUFEN.length

  function kaufen(artikel) {
    const ergebnis = kaufe(artikel.id)
    if (ergebnis === 'ok' && artikel.id === 'schatzschluessel') {
      // Der Schatzschlüssel wird sofort eingelöst. Der Lernstand kennt nur die
      // Tagestruhe, deshalb wird die Bonustruhe hier ausgezahlt.
      gibEdelsteine(BONUS_EDELSTEINE)
      setMeldung(
        `Gekauft! Die Bonustruhe bringt dir ${waehrungText(BONUS_EDELSTEINE, 'edelsteine')}.`
      )
      return
    }
    if (ergebnis === 'ok' && artikel.id === 'streak-schutz') {
      setMeldung('Serien-Schutz liegt bereit und wird bei einem fehlenden Lerntag automatisch genutzt.')
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
    setMeldung(
      gewinn ? `Truhe geöffnet: ${truhenText(gewinn)}.` : 'Die Tagestruhe ist heute schon geöffnet.'
    )
  }

  function wechsle(id) {
    setTab(id)
    setMeldung('')
  }

  return (
    <div className="sh-seite">
      <PageHeader
        titel="Shop"
        untertitel="Nur erspielte Edelsteine, niemals Echtgeld."
        ohneMaskottchen
      />

      <ul className="sh-besitz" role="list" aria-label="Dein Besitz">
        <li>
          <StatChip icon="edelstein" wert={s.edelsteine} label="Edelsteine" ton="teal" />
        </li>
        <li>
          <StatChip icon="schluessel" wert={s.schluessel} label="Schlüssel" ton="gold" />
        </li>
      </ul>

      <div className="rk-tabs sh-tabs" role="tablist" aria-label="Kategorien im Shop">
        {KATEGORIEN.map((k) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            id={`sh-tab-${k.id}`}
            className="rk-tab"
            aria-selected={tab === k.id}
            aria-controls="sh-panel"
            onClick={() => wechsle(k.id)}
          >
            <Icon name={k.icon} groesse={18} />
            <span>{TAB_NAME[k.id] || k.name}</span>
          </button>
        ))}
      </div>

      <div className="sh-meldung" aria-live="polite">
        {meldung && (
          <p className="sh-meldung-text">
            <Icon name="info" groesse={18} />
            <span>{meldung}</span>
          </p>
        )}
      </div>

      <div id="sh-panel" role="tabpanel" aria-labelledby={`sh-tab-${kategorie.id}`}>
        <h2 className="nur-sr">{TAB_NAME[kategorie.id] || kategorie.name}</h2>

        {kategorie.id === 'taeglich' ? (
          <>
            <div className="adv-truhe sh-truhe">
              <span className="sh-truhe-marke">
                <Icon name="truhe" groesse={30} />
              </span>
              <div className="adv-truhe-text">
                <strong>{truheOffen ? 'Die heutige Truhe wartet' : 'Heute schon geöffnet'}</strong>
                <p className="sh-truhe-text">
                  {truheOffen
                    ? `Sie kostet nichts und bringt dir ${truhenText(TRUHEN_STUFEN[stufe])}.`
                    : 'Morgen liegt die nächste Truhe für dich bereit.'}
                </p>
              </div>
              {truheOffen && (
                <PrimaryButton
                  art="gold"
                  icon="truhe"
                  onClick={oeffneTruhe}
                  aria-label={`${T.abenteuer.truheOeffnen}: ${truhenText(TRUHEN_STUFEN[stufe])}`}
                >
                  {T.abenteuer.truheOeffnen}
                </PrimaryButton>
              )}
            </div>

            <Card className="sh-stufenkarte">
              <h3 className="sh-kartentitel">So wächst deine Belohnung</h3>
              <p className="sh-text">
                Der Inhalt der Truhe richtet sich nach deiner Serie. Sie durchläuft eine feste Reihe
                von fünf Stufen und beginnt danach wieder von vorn. Deine Serie liegt gerade bei{' '}
                {s.serie} {s.serie === 1 ? 'Tag' : 'Tagen'}.
              </p>
              <ul className="sh-stufen" role="list">
                {TRUHEN_STUFEN.map((t, i) => (
                  <li key={t.xp} className="sh-stufe">
                    <span className="sh-stufe-nr">Stufe {i + 1}</span>
                    <span className="sh-stufe-inhalt">{truhenText(t)}</span>
                    {i === stufe && (
                      <Badge ton="gold" icon="stern">
                        Deine Stufe
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
              <p className="sh-text">
                Die Tagestruhe kostet nichts. Mit einem Schatzschlüssel öffnest du zusätzlich eine
                Bonustruhe.
              </p>
            </Card>
          </>
        ) : artikelListe.length ? (
          <ul className="adv-shopraster sh-raster" role="list">
            {artikelListe.map((a) => (
              <ArtikelKarte
                key={a.id}
                artikel={a}
                vorrat={a.waehrung === 'schluessel' ? s.schluessel : s.edelsteine}
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

      <p className="sh-hinweis">
        <Icon name="info" groesse={18} />
        <span>
          Im Shop gibt es nur Aussehen und Komfort. Alle Lerninhalte sind und bleiben frei
          zugänglich. Es gibt keine Käufe mit echtem Geld.
        </span>
      </p>
    </div>
  )
}
