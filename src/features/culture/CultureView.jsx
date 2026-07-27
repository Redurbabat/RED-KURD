// Kultur: Redewendungen zum Anhören und Merken, dazu kurze Kulturtexte.
import { useLernstand } from '../../core/store.js'
import { merkeWort, kennstWort } from '../../core/progress/progressStore.js'
import { spieleWort } from '../../core/audio/audioService.js'
import { redewendungen, kultur } from '../../data/kultur.js'
import Card from '../../components/common/Card.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import './CultureView.css'

// Die Kultur-Titel tragen ein Symbol im Text. Fuer Screenreader trennen wir es ab.
const SYMBOL_MUSTER = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu

function teileTitel(titel) {
  const symbol = (titel.match(SYMBOL_MUSTER) || []).join('')
  return { symbol, text: titel.replace(SYMBOL_MUSTER, '').trim() }
}

export default function CultureView() {
  useLernstand()

  return (
    <>
      <section className="rk-abschnitt" aria-labelledby="kult-redewendungen-titel">
        <h2 className="rk-abschnitt-titel" id="kult-redewendungen-titel">
          Redewendungen
        </h2>
        <p className="gedaempft kult-einleitung">
          Sprichwörter zeigen, wie eine Sprache denkt. Höre sie an und nimm sie in dein
          Wiederholsystem auf.
        </p>

        <ul className="kult-liste" role="list">
          {redewendungen.map((r) => {
            const gemerkt = kennstWort(r.de, r.ku)
            return (
              <li key={r.ku}>
                <Card className="kult-karte">
                  <p className="kult-ku" lang="ku">
                    {r.ku}
                  </p>
                  <p className="kult-de" lang="de">
                    {r.de}
                  </p>
                  <p className="kult-sinn">{r.sinn}</p>
                  <div className="reihe-umbruch kult-knoepfe">
                    <PrimaryButton
                      art="still"
                      groesse="klein"
                      icon="lautsprecher"
                      onClick={() => spieleWort(r.ku)}
                      aria-label={`Redewendung anhören: ${r.ku}`}
                    >
                      Anhören
                    </PrimaryButton>
                    <PrimaryButton
                      art={gemerkt ? 'still' : 'gruen'}
                      groesse="klein"
                      icon={gemerkt ? 'haken' : 'plus'}
                      disabled={gemerkt}
                      onClick={() => merkeWort(r.de, r.ku)}
                      aria-label={
                        gemerkt
                          ? `Bereits gemerkt: ${r.ku}`
                          : `Redewendung merken: ${r.ku}`
                      }
                    >
                      {gemerkt ? 'Gemerkt' : 'Merken'}
                    </PrimaryButton>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rk-abschnitt" aria-labelledby="kult-kultur-titel">
        <h2 className="rk-abschnitt-titel" id="kult-kultur-titel">
          Kultur kennenlernen
        </h2>

        <ul className="kult-liste" role="list">
          {kultur.map((k) => {
            const { symbol, text } = teileTitel(k.titel)
            return (
              <li key={k.titel}>
                <Card className="kult-karte">
                  <h3 className="kult-titel">
                    {symbol && (
                      <span className="kult-symbol" aria-hidden="true">
                        {symbol}
                      </span>
                    )}
                    <span>{text}</span>
                  </h3>
                  <p className="kult-text">{k.text}</p>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
