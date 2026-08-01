// Kultur: Redewendungen zum Anhören und Merken, dazu die Kulturkarten mit
// echten Fotos — dieselben Inhalte wie im Abenteuer-Modus, hier im ruhigen
// Gewand des Modern-Modus.
import { useLernstand } from '../../core/store.js'
import { merkeWort, kennstWort } from '../../core/progress/progressStore.js'
import { spieleWort } from '../../core/audio/audioService.js'
import { redewendungen, kulturkarten } from '../../data/kultur.js'
import Card from '../../components/common/Card.jsx'
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import './CultureView.css'

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
        <p className="gedaempft kult-einleitung">
          {kulturkarten.length} Kulturkarten erklären auf Deutsch, was hinter Sprache und
          Alltag steckt — mit echten Fotos und einem Ausdruck zum Mitlernen.
        </p>

        <ul className="kult-liste" role="list">
          {kulturkarten.map((k) => {
            const gemerkt = kennstWort(k.ausdruck.de, k.ausdruck.ku)
            return (
              <li key={k.id}>
                <Card className="kult-karte">
                  {k.foto && (
                    <figure className="kult-foto">
                      <img src={k.foto.src} alt={k.foto.alt} loading="lazy" />
                    </figure>
                  )}
                  <div className="kult-kopfzeile">
                    <h3 className="kult-titel">{k.titel}</h3>
                    <Badge ton="neutral">{k.thema}</Badge>
                  </div>
                  <p className="kult-text" lang="de">
                    {k.erklaerung}
                  </p>

                  <div className="kult-ausdruck">
                    <span className="kult-marke">Ausdruck</span>
                    <p className="kult-de" lang="de">
                      {k.ausdruck.de}
                    </p>
                    <p className="kult-ku" lang="ku">
                      {k.ausdruck.ku}
                    </p>
                    <span className="kult-marke">Beispiel</span>
                    <p className="kult-de" lang="de">
                      {k.beispiel.de}
                    </p>
                    <p className="kult-ku" lang="ku">
                      {k.beispiel.ku}
                    </p>
                  </div>

                  {k.hinweis && (
                    <p className="kult-hinweis">
                      <Icon name="info" groesse={16} />
                      <span lang="de">{k.hinweis}</span>
                    </p>
                  )}

                  <div className="reihe-umbruch kult-knoepfe">
                    <PrimaryButton
                      art="still"
                      groesse="klein"
                      icon="lautsprecher"
                      onClick={() => spieleWort(k.ausdruck.ku)}
                      aria-label={`${k.ausdruck.ku} anhören`}
                    >
                      Anhören
                    </PrimaryButton>
                    <PrimaryButton
                      art={gemerkt ? 'still' : 'gruen'}
                      groesse="klein"
                      icon={gemerkt ? 'haken' : 'plus'}
                      disabled={gemerkt}
                      onClick={() => merkeWort(k.ausdruck.de, k.ausdruck.ku)}
                      aria-label={
                        gemerkt
                          ? `Bereits gemerkt: ${k.ausdruck.ku}`
                          : `Ausdruck merken: ${k.ausdruck.ku}`
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
    </>
  )
}
