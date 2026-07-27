// Kulturseite des Abenteuer-Modus. Kultur ist hier ein eigener Lernbereich:
// jede Karte erklärt zuerst auf Deutsch, was hinter einem Brauch steckt, und
// gibt danach einen Ausdruck und einen Beispielsatz zum Mitnehmen.
// Reihenfolge in jedem Block: Deutsch zuerst, Kurmancî darunter.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { merkeWort, kennstWort } from '../../../core/progress/progressStore.js'
import { spieleWort } from '../../../core/audio/audioService.js'
import { kulturkarten } from '../../../data/kultur.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Badge from '../../../components/common/Badge.jsx'
import PrimaryButton, { IconButton } from '../../../components/common/PrimaryButton.jsx'
import EmptyState from '../../../components/common/EmptyState.jsx'
import './AdventureCulturePage.css'

// Reiter über der Liste. „Alle“ filtert nicht, die übrigen entsprechen dem
// Feld „thema“ der Kulturkarten.
const THEMEN = [
  { id: 'alle', name: 'Alle', icon: 'welt' },
  { id: 'Alltag', name: 'Alltag', icon: 'heute' },
  { id: 'Fest', name: 'Fest', icon: 'flamme' },
  { id: 'Musik', name: 'Musik', icon: 'musik' },
  { id: 'Sprache', name: 'Sprache', icon: 'sprache' },
  { id: 'Geschichte', name: 'Geschichte', icon: 'buch' },
]

// Farbton der Plakette je Thema — die Farbe steht nie allein, das Thema
// steht als Text daneben im Etikett.
const THEMA_TON = {
  Alltag: 'erde',
  Fest: 'rot',
  Musik: 'teal',
  Sprache: 'gruen',
  Geschichte: 'gold',
}

/** Ein zweizeiliger Block: deutsche Zeile oben, Kurmancî darunter mit Ton. */
function Sprachblock({ marke, de, ku }) {
  return (
    <div className="ak-block">
      <span className="ak-block-marke">{marke}</span>
      <p className="ak-de" lang="de">
        {de}
      </p>
      <p className="ak-ku-zeile">
        <span className="ak-ku" lang="ku">
          {ku}
        </span>
        <IconButton
          icon="lautsprecher"
          label={`${ku} anhören`}
          groesse={18}
          className="ak-hoeren"
          onClick={() => spieleWort(ku)}
        />
      </p>
    </div>
  )
}

function Kulturkarte({ karte }) {
  const gemerkt = kennstWort(karte.ausdruck.de, karte.ausdruck.ku)
  const ton = THEMA_TON[karte.thema] || 'erde'

  return (
    <li>
      <article className={`adv-pergament ak-karte ak-ton-${ton}`}>
        <div className="ak-kopf">
          <span className="ak-plakette" aria-hidden="true">
            <Icon name={karte.icon} groesse={22} />
          </span>
          <Badge ton="neutral" className="ak-thema">
            {karte.thema}
          </Badge>
        </div>

        <h3 className="ak-titel">{karte.titel}</h3>
        <p className="ak-text" lang="de">
          {karte.erklaerung}
        </p>

        {/* Kelim-Trennlinie zwischen Erklärung und Sprachteil */}
        <span className="ak-band" aria-hidden="true" />

        <Sprachblock marke="Ausdruck" de={karte.ausdruck.de} ku={karte.ausdruck.ku} />
        <Sprachblock marke="Beispiel" de={karte.beispiel.de} ku={karte.beispiel.ku} />

        {karte.hinweis && (
          <p className="ak-hinweis">
            <Icon name="info" groesse={16} />
            <span lang="de">{karte.hinweis}</span>
          </p>
        )}

        <div className="ak-fuss">
          <PrimaryButton
            art={gemerkt ? 'gruen' : 'primaer'}
            groesse="klein"
            icon={gemerkt ? 'haken' : 'plus'}
            onClick={() => merkeWort(karte.ausdruck.de, karte.ausdruck.ku)}
            aria-label={
              gemerkt
                ? `Bereits gemerkt: ${karte.ausdruck.de} — ${karte.ausdruck.ku}`
                : `Ausdruck merken: ${karte.ausdruck.de} — ${karte.ausdruck.ku}`
            }
          >
            {gemerkt ? 'Gemerkt' : 'Ausdruck merken'}
          </PrimaryButton>
        </div>
      </article>
    </li>
  )
}

export default function AdventureCulturePage() {
  useLernstand()

  const [thema, setThema] = useState('alle')
  const karten = thema === 'alle' ? kulturkarten : kulturkarten.filter((k) => k.thema === thema)

  return (
    <div className="ak-seite">
      <PageHeader titel="Kultur" untertitel="Wo die Sprache herkommt." variante="tee" />

      <div className="rk-tabs ak-tabs" role="tablist" aria-label="Themen der Kultur">
        {THEMEN.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`ak-tab-${t.id}`}
            className="rk-tab"
            aria-selected={thema === t.id}
            aria-controls="ak-panel"
            onClick={() => setThema(t.id)}
          >
            <Icon name={t.icon} groesse={18} />
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      <div id="ak-panel" role="tabpanel" aria-labelledby={`ak-tab-${thema}`}>
        <section className="rk-abschnitt" aria-labelledby="ak-liste-titel">
          <h2 className="rk-abschnitt-titel" id="ak-liste-titel">
            {thema === 'alle' ? 'Alle Kulturkarten' : `Kultur: ${thema}`}
            <span className="nur-sr">, {karten.length} Karten</span>
          </h2>

          <ul className="ak-liste" role="list">
            {karten.map((k) => (
              <Kulturkarte key={k.id} karte={k} />
            ))}
          </ul>

          {karten.length === 0 && (
            <EmptyState
              titel="Hier ist noch nichts."
              text={'Zu diesem Thema gibt es gerade keine Karte. Schau bei „Alle“ nach.'}
              variante="denken"
            />
          )}
        </section>
      </div>

      <Card titel="Warum Kultur?" icon="gehirn" className="ak-warum">
        <p>
          Wörter tragen die Bräuche mit, aus denen sie kommen: Wer weiß, wie ein Glas Tee
          angeboten wird, versteht auch, warum „Kerem bike“ so oft fällt.
        </p>
        <p>
          Darum steht Kultur hier neben den Lektionen — sie erklärt, was ein Satz im Alltag
          wirklich bedeutet.
        </p>
      </Card>
    </div>
  )
}
