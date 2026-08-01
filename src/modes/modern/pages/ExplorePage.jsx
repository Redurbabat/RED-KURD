// Entdecken: Übersicht und vier Unterbereiche (Wörterbuch, Lesen, Schrift, Kultur).
// Welcher Bereich offen ist, steht ausschliesslich in der Adresse (Prop `tab`).
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import { texte } from '../../../data/texte.js'
import { redewendungen, kulturkarten } from '../../../data/kultur.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import { ClickCard } from '../../../components/common/Card.jsx'
import DictionaryView from '../../../features/dictionary/DictionaryView.jsx'
import ReadingView from '../../../features/reading/ReadingView.jsx'
import ScriptConverter from '../../../features/script-converter/ScriptConverter.jsx'
import CultureView from '../../../features/culture/CultureView.jsx'
import './ExplorePage.css'

const TABS = [
  { id: 'dictionary', name: T.entdecken.woerterbuch, icon: 'suche' },
  { id: 'reading', name: T.entdecken.lesen, icon: 'buch' },
  { id: 'script', name: T.entdecken.schrift, icon: 'sprache' },
  { id: 'culture', name: 'Kultur', icon: 'herz' },
]

function wortzahl(text) {
  return text.trim().split(/\s+/).length
}

function Uebersicht() {
  return (
    <section className="rk-abschnitt" aria-labelledby="ex-uebersicht-titel">
      <h2 className="rk-abschnitt-titel" id="ex-uebersicht-titel">
        Vier Wege, weiterzukommen
      </h2>

      <ul className="rk-kachelraster ex-kacheln" role="list">
        <li>
          <ClickCard
            titel={T.entdecken.woerterbuch}
            icon="suche"
            className="ex-kachel"
            onClick={() => navigiere('/explore/dictionary')}
          >
            <span className="ex-kachel-text">
              840.000+ Wörter und Ausdrücke — aus Wörterbüchern, Wiktionary und echten
              Beispielsätzen. Jedes Wort kannst du anhören und dir zum Lernen merken.
            </span>
            <span className="ex-meta">
              <Badge ton="teal">Deutsch ↔ Kurmancî</Badge>
              <Badge icon="lautsprecher">Mit Aussprache</Badge>
            </span>
          </ClickCard>
        </li>

        <li>
          <ClickCard
            titel={T.entdecken.lesen}
            icon="buch"
            className="ex-kachel"
            onClick={() => navigiere('/explore/reading')}
          >
            <span className="ex-kachel-text">
              Kurze Texte auf Kurmancî mit Übersetzung, anklickbaren Wörtern und Fragen zum
              Verständnis. Dazu Tausende echte Sätze aus Tatoeba.
            </span>
            <span className="ex-vorschau" role="list">
              {texte.slice(0, 3).map((t) => (
                <span className="ex-vorschau-zeile" role="listitem" key={t.id}>
                  <span className="ex-vorschau-titel" lang="ku">
                    {t.titel}
                  </span>
                  <span className="ex-vorschau-meta">
                    {t.niveau} · {t.thema} · {wortzahl(t.text)} Wörter · {t.fragen.length} Fragen
                  </span>
                </span>
              ))}
            </span>
          </ClickCard>
        </li>

        <li>
          <ClickCard
            titel="Schrift-Umwandlung"
            icon="sprache"
            className="ex-kachel"
            onClick={() => navigiere('/explore/script')}
          >
            <span className="ex-kachel-text">
              Kurmancî wird in lateinischer und in arabischer Schrift geschrieben. Hier wandelst
              du Texte in beide Richtungen um, hörst sie an und kopierst sie.
            </span>
            <span className="ex-meta">
              <Badge ton="gold">Beta</Badge>
              <Badge>Latein ↔ Arabisch</Badge>
            </span>
          </ClickCard>
        </li>

        <li>
          <ClickCard
            titel={'Redewendungen & Kultur'}
            icon="herz"
            className="ex-kachel"
            onClick={() => navigiere('/explore/culture')}
          >
            <span className="ex-kachel-text">
              Sprichwörter mit Bedeutung und Erklärung sowie kurze Texte über Newroz, Govend,
              Dengbêj und die Çay-Kultur.
            </span>
            <span className="ex-meta">
              <Badge ton="lila">{redewendungen.length} Redewendungen</Badge>
              <Badge ton="blau">{kulturkarten.length} Kulturkarten</Badge>
            </span>
          </ClickCard>
        </li>
      </ul>
    </section>
  )
}

export default function ExplorePage({ tab = 'start' }) {
  useLernstand()

  const aktiv = TABS.some((t) => t.id === tab) ? tab : 'start'

  return (
    <>
      <PageHeader
        titel={T.entdecken.titel}
        untertitel={T.entdecken.untertitel}
        variante="denken"
        zurueck={aktiv === 'start' ? undefined : '/explore'}
        zurueckText="Übersicht"
      />

      <div className="rk-tabs" role="tablist" aria-label="Bereiche in Entdecken">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`ex-tab-${t.id}`}
            className="rk-tab"
            aria-selected={aktiv === t.id}
            aria-controls="ex-panel"
            onClick={() => navigiere('/explore/' + t.id)}
          >
            <Icon name={t.icon} groesse={18} />
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      <div
        id="ex-panel"
        role="tabpanel"
        {...(aktiv === 'start'
          ? { 'aria-label': 'Übersicht über Entdecken' }
          : { 'aria-labelledby': `ex-tab-${aktiv}` })}
      >
        {aktiv === 'start' && <Uebersicht />}
        {aktiv === 'dictionary' && <DictionaryView />}
        {aktiv === 'reading' && <ReadingView />}
        {aktiv === 'script' && <ScriptConverter />}
        {aktiv === 'culture' && <CultureView />}
      </div>
    </>
  )
}
