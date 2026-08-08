// Üben-Übersicht: empfohlene Mischung, sechs Trainings, eine Empfehlung nach
// Fertigkeit und die Wörter, die gerade Mühe machen. Die Seite rechnet nichts
// selbst — sie liest Selektoren und navigiert zu /practice/<id>.
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  statistik,
  schwierigeKarten,
  fertigkeiten,
  fertigkeitStufe,
  schwaechsteFertigkeit,
} from '../../../core/progress/progressSelectors.ts'
import { spieleWort } from '../../../core/audio/audioService.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Card from '../../../components/common/Card.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge, { CountBadge } from '../../../components/common/Badge.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import HeloMascot from '../../../components/mascot/HeloMascot.jsx'
import './PracticePage.css'

const TRAININGS = [
  {
    id: 'review',
    name: 'Wiederholen',
    icon: 'wiederholen',
    ton: 'gruen',
    text: 'Fällige Wörter festigen',
    schwierigkeit: 'Variabel',
    schwierigkeitTon: 'blau',
    dauer: '5–15 Min',
    zeigeFaellig: true,
  },
  {
    id: 'images',
    name: 'Bilder',
    icon: 'bild',
    ton: 'gruen',
    text: 'Wörter mit Bildern lernen',
    schwierigkeit: 'Leicht',
    schwierigkeitTon: 'gruen',
    dauer: '5 Min',
  },
  {
    id: 'listening',
    name: 'Hören',
    icon: 'kopfhoerer',
    ton: 'lila',
    text: 'Gesprochene Wörter verstehen',
    schwierigkeit: 'Mittel',
    schwierigkeitTon: 'gold',
    dauer: '10 Min',
  },
  {
    id: 'writing',
    name: 'Schreiben',
    icon: 'stift',
    ton: 'teal',
    text: 'Wörter und Sätze eintippen',
    schwierigkeit: 'Mittel',
    schwierigkeitTon: 'gold',
    dauer: '10 Min',
  },
  {
    id: 'recall',
    name: 'Schnellwahl',
    icon: 'blitz',
    ton: 'gold',
    text: 'Deutsche Begriffe aktiv auf Kurmancî abrufen',
    schwierigkeit: 'Mittel',
    schwierigkeitTon: 'gold',
    dauer: '5–10 Min',
  },
  {
    id: 'meaning',
    name: 'Bedeutungen',
    icon: 'auge',
    ton: 'blau',
    text: 'Kurmancî lesen und die deutsche Bedeutung erkennen',
    schwierigkeit: 'Leicht',
    schwierigkeitTon: 'gruen',
    dauer: '5–10 Min',
  },
  {
    id: 'grammar',
    name: 'Grammatik',
    icon: 'gehirn',
    ton: 'lila',
    text: 'Regeln aus den Kapiteln lesen und anwenden',
    schwierigkeit: 'Mittel',
    schwierigkeitTon: 'gold',
    dauer: '5–10 Min',
  },
  {
    id: 'sentence-builder',
    name: 'Satzbau',
    icon: 'puzzle',
    ton: 'orange',
    text: 'Wörter in die richtige Reihenfolge bringen',
    schwierigkeit: 'Schwer',
    schwierigkeitTon: 'rot',
    dauer: '10 Min',
  },
  {
    id: 'speaking',
    name: 'Aussprache',
    icon: 'mikrofon',
    ton: 'blau',
    text: 'Anhören, nachsprechen und aufnehmen',
    schwierigkeit: 'Mittel',
    schwierigkeitTon: 'gold',
    dauer: '5–10 Min',
  },
]

const FERTIGKEIT_NAMEN = {
  erkennen: 'Erkennen',
  abrufen: 'Abrufen',
  schreiben: 'Schreiben',
  hoeren: 'Hören',
}

/** Welches Training stärkt eine Fertigkeit am besten? */
const FERTIGKEIT_TRAINING = {
  hoeren: 'listening',
  schreiben: 'writing',
}

/** Ein Wort je Bedeutung, auch wenn es zu mehreren Fertigkeiten fällig ist. */
function ohneDoppelte(karten) {
  const gesehen = new Set()
  const aus = []
  for (const k of karten) {
    if (gesehen.has(k.ku)) continue
    gesehen.add(k.ku)
    aus.push(k)
  }
  return aus
}

export default function PracticePage() {
  useLernstand()

  const s = statistik()
  const f = fertigkeiten()
  const schwaechste = schwaechsteFertigkeit()
  const schwierige = ohneDoppelte(schwierigeKarten(15)).slice(0, 5)

  return (
    <>
      <PageHeader titel={T.ueben.titel} untertitel={T.ueben.untertitel} variante="hantel" />

      <section className="pr-feature" aria-labelledby="pr-feature-titel">
        <div className="pr-feature-text">
          <span className="pr-feature-label">Tägliche Empfehlung</span>
          <h2 id="pr-feature-titel">Sicherer sprechen</h2>
          <p>Höre echte Kurmancî-Wörter, sprich sie nach und vergleiche deine Aufnahme.</p>
          <PrimaryButton art="still" icon="mikrofon" onClick={() => navigiere('/practice/speaking')}>
            Aussprache starten
          </PrimaryButton>
        </div>
        <HeloMascot variante="winken" groesse={132} className="pr-feature-helo" dekorativ />
      </section>

      <section className="rk-abschnitt" aria-labelledby="pr-mix-titel">
        <h2 className="rk-abschnitt-titel" id="pr-mix-titel">
          Empfohlene Sitzung
        </h2>

        <button type="button" className="rk-startkarte" onClick={() => navigiere('/practice/mix')}>
          <Icon name="blitz" groesse={26} />
          <span className="rk-startkarte-text">
            <strong>{T.ueben.empfehlung}</strong>
            <small>{T.ueben.empfehlungText}</small>
          </span>
          <span className="rk-startkarte-wert">{T.ueben.starten}</span>
        </button>
      </section>

      <section className="rk-abschnitt" aria-labelledby="pr-trainings-titel">
        <h2 className="rk-abschnitt-titel" id="pr-trainings-titel">
          Fertigkeiten trainieren
        </h2>

        <ul className="rk-kachelraster pr-kachelraster">
          {TRAININGS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="rk-trainingskachel"
                onClick={() => navigiere(`/practice/${t.id}`)}
              >
                <span className={`rk-trainingskachel-icon rk-ton-${t.ton}`}>
                  <Icon name={t.icon} groesse={24} />
                </span>
                <span className="rk-trainingskachel-text">
                  <strong>{t.name}</strong>
                  {/* bewusst ein span statt p: der Text steht in einem Knopf */}
                  <span className="pr-kachel-text">{t.text}</span>
                  <span className="rk-trainingskachel-meta">
                    <Badge ton={t.schwierigkeitTon}>{t.schwierigkeit}</Badge>
                    <Badge icon="uhr">{t.dauer}</Badge>
                    {t.zeigeFaellig && <CountBadge anzahl={s.faellig} label={T.stats.faellig} />}
                  </span>
                </span>
                <Icon name="pfeilRechts" groesse={20} className="pr-kachel-pfeil" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {schwaechste && (
        <Card titel="Empfohlen für dich" icon="stern" ton="warm">
          <div className="pr-empfehlung">
            <div className="pr-empfehlung-text">
              <p className="pr-empfehlung-name">{FERTIGKEIT_NAMEN[schwaechste]}</p>
              <ProgressBar
                wert={f[schwaechste]}
                label={`${FERTIGKEIT_NAMEN[schwaechste]}: ${f[schwaechste]} Prozent sicher`}
                farbe="orange"
                zeigeWert
              />
              <p className="gedaempft">
                Deine schwächste Fertigkeit · {fertigkeitStufe(f[schwaechste])}. Ein kurzes Training
                bringt dich hier weiter.
              </p>
            </div>
            <PrimaryButton
              art="gold"
              icon="blitz"
              onClick={() => navigiere(`/practice/${FERTIGKEIT_TRAINING[schwaechste] || 'review'}`)}
            >
              {FERTIGKEIT_NAMEN[schwaechste]} trainieren
            </PrimaryButton>
          </div>
        </Card>
      )}

      <Card titel="Schwierige Wörter" icon="gehirn">
        {schwierige.length > 0 ? (
          <>
            <p className="pr-schwierig-text">
              {schwierige.length === 1
                ? 'Ein Wort macht dir gerade Mühe. Tippe es an, um es zu hören.'
                : `${schwierige.length} Wörter machen dir gerade Mühe. Tippe ein Wort an, um es zu hören.`}
            </p>
            <ul className="rk-wortliste pr-wortliste">
              {schwierige.map((k) => (
                <li key={k.ku + '|' + k.de}>
                  <button
                    type="button"
                    className="rk-wortchip"
                    onClick={() => spieleWort(k.ku)}
                    aria-label={`${k.ku}, ${k.de}, anhören`}
                  >
                    <span lang="ku">{k.ku}</span>
                    <span lang="de" className="pr-wortchip-de">
                      {k.de}
                    </span>
                    <Icon name="lautsprecher" groesse={16} />
                  </button>
                </li>
              ))}
            </ul>
            <PrimaryButton icon="blitz" onClick={() => navigiere('/practice/hard')}>
              Jetzt üben
            </PrimaryButton>
          </>
        ) : (
          <p className="gedaempft">
            Gerade fällt dir kein Wort besonders schwer. Wörter, die du mehrmals falsch
            beantwortest, erscheinen hier.
          </p>
        )}
      </Card>
    </>
  )
}
