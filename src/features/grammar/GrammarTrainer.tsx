// Grammatik-Training: Die „Gut zu wissen"-Notizen der Kapitel werden zu
// kleinen Runden — erst die Regel lesen, dann zwei Kontrollfragen dazu
// beantworten. Die Fragen liegen geprüft in grammatikUebungen.js.
import { useMemo, useState } from 'react'
import { EINHEITEN } from '../../core/courses/courseRepository.ts'
import { grammatikUebungen } from '../../data/grammatikUebungen.js'
import { mische } from '../../core/session/exerciseFactory.ts'
import { gibXp } from '../../core/progress/progressStore.ts'
import { spieleWort, klickGefuehl } from '../../core/audio/audioService.ts'
import Card from '../../components/common/Card.tsx'
import Icon from '../../components/icons/Icon.tsx'
import PrimaryButton from '../../components/common/PrimaryButton.tsx'
import ProgressBar from '../../components/common/ProgressBar.tsx'
import EmptyState from '../../components/common/EmptyState.tsx'
import HeloMascot from '../../components/mascot/HeloMascot.tsx'
import type { Einheit, Grammatiknotiz } from '../../types/kurs'
import type { Grammatikfrage } from '../../data/grammatikUebungen'
import './GrammarTrainer.css'

const REGELN_JE_RUNDE = 5
const XP_JE_FRAGE = 15

/** Eine Regel dieser Runde: das Kapitel, seine Notiz und ihre Fragen. */
interface Regelrunde {
  einheit: Einheit
  /** Immer da — `zieheRegeln()` nimmt nur Kapitel MIT Notiz auf. */
  note: Grammatiknotiz
  fragen: readonly Grammatikfrage[]
}

/**
 * Kapitel mit Notiz UND geprüften Fragen, in zufälliger Reihenfolge.
 *
 * Notiz und Fragen werden hier gleich mitgenommen statt nur gefiltert: sonst
 * müsste jede Stelle weiter unten noch einmal prüfen, ob es sie gibt,
 * obwohl der Filter das längst entschieden hat.
 */
function zieheRegeln(): Regelrunde[] {
  const passend: Regelrunde[] = []
  for (const einheit of EINHEITEN) {
    const note = einheit.grammatik
    const fragen = grammatikUebungen[einheit.id]
    if (!note || !fragen?.length) continue
    passend.push({ einheit, note, fragen })
  }
  return mische(passend).slice(0, REGELN_JE_RUNDE)
}

export default function GrammarTrainer() {
  const [versuch, setVersuch] = useState(0)
  const regeln = useMemo(() => zieheRegeln(), [versuch])

  // Position im Ablauf: welche Regel, und darin Regelkarte (-1) oder Frage 0/1.
  const [regelNr, setRegelNr] = useState(0)
  const [frageNr, setFrageNr] = useState(-1)
  const [antwort, setAntwort] = useState<number | null>(null)
  const [punkte, setPunkte] = useState(0)

  const aktuelle = regeln[regelNr] || null
  const gesamtFragen = regeln.reduce((summe, r) => summe + r.fragen.length, 0)
  const beantwortet =
    regeln.slice(0, regelNr).reduce((summe, r) => summe + r.fragen.length, 0) +
    Math.max(0, frageNr) +
    (antwort !== null ? 1 : 0)

  function nochmal() {
    setVersuch((v) => v + 1)
    setRegelNr(0)
    setFrageNr(-1)
    setAntwort(null)
    setPunkte(0)
  }

  function antworten(index: number): void {
    // `aktuelle` und die Frage stehen fest, sobald die Antwortknöpfe zu sehen
    // sind — die Abfragen sind unerreichbar und halten nur `| null` fern.
    if (antwort !== null || !aktuelle) return
    setAntwort(index)
    const richtig = index === aktuelle.fragen[frageNr]?.richtig
    klickGefuehl(richtig ? 'richtig' : 'falsch')
    if (richtig) {
      setPunkte((p) => p + 1)
      gibXp(XP_JE_FRAGE)
    }
  }

  function weiter(): void {
    if (!aktuelle) return
    if (frageNr + 1 < aktuelle.fragen.length) {
      setFrageNr((n) => n + 1)
    } else {
      setRegelNr((n) => n + 1)
      setFrageNr(-1)
    }
    setAntwort(null)
  }

  if (!regeln.length) {
    return (
      <EmptyState
        variante="denken"
        titel="Noch keine Grammatik-Fragen da."
        text="Zu den Grammatik-Notizen liessen sich keine Fragen laden."
      />
    )
  }

  // Alle Regeln durch: Auswertung.
  if (!aktuelle) {
    return (
      <div className="gt-ende" role="status">
        <HeloMascot variante={punkte >= gesamtFragen / 2 ? 'feiern' : 'daumen'} groesse={120} dekorativ />
        <h2>Grammatik geschafft!</h2>
        <p className="gt-ende-zahl">
          {punkte} von {gesamtFragen} Fragen richtig
        </p>
        <p className="gedaempft">+{punkte * XP_JE_FRAGE} XP gesammelt</p>
        <PrimaryButton groesse="gross" icon="wiederholen" onClick={nochmal}>
          Neue Runde
        </PrimaryButton>
      </div>
    )
  }

  const { einheit, note } = aktuelle

  // Schritt 1: die Regel in Ruhe lesen.
  if (frageNr === -1) {
    return (
      <div className="gt-spiel">
        <ProgressBar
          wert={beantwortet}
          max={gesamtFragen}
          label={`Grammatik: ${beantwortet} von ${gesamtFragen} Fragen beantwortet`}
        />
        <p className="gedaempft gt-zeile">
          Regel {regelNr + 1} von {regeln.length} · aus dem Kapitel „{einheit.name}“
        </p>

        <Card titel={`Gut zu wissen: ${note.titel}`} icon="gehirn">
          <div className="stapel-eng">
            <p lang="de">{note.text}</p>
            {note.beispiel && (
              <p className="gt-beispiel">
                <button
                  type="button"
                  className="gt-beispiel-ton"
                  onClick={() => spieleWort(note.beispiel.ku)}
                  aria-label={`${note.beispiel.ku} anhören`}
                >
                  <strong lang="ku">{note.beispiel.ku}</strong>
                  <Icon name="lautsprecher" groesse={16} />
                </button>
                <span lang="de" className="gedaempft">
                  {note.beispiel.de}
                </span>
              </p>
            )}
          </div>
        </Card>

        <PrimaryButton groesse="gross" breit icon="pfeilRechts" onClick={() => setFrageNr(0)}>
          Zu den Fragen
        </PrimaryButton>
      </div>
    )
  }

  // Schritt 2: die Kontrollfragen.
  // Der Rückfall ist unerreichbar: `frageNr` läuft nur bis `fragen.length - 1`
  // und springt danach auf -1 der nächsten Regel.
  const frage = aktuelle.fragen[frageNr] ?? aktuelle.fragen[0]
  if (!frage) return null

  return (
    <div className="gt-spiel">
      <ProgressBar
        wert={beantwortet}
        max={gesamtFragen}
        label={`Grammatik: ${beantwortet} von ${gesamtFragen} Fragen beantwortet`}
      />
      <p className="gedaempft gt-zeile">
        Frage {frageNr + 1} von {aktuelle.fragen.length} zu „{note.titel}“ · {punkte} richtig
      </p>

      <Card titel={frage.frage} icon="gehirn">
        <div className="gt-optionen" role="group" aria-label="Antwortmöglichkeiten">
          {frage.optionen.map((option, i) => {
            const zustand =
              antwort === null
                ? ''
                : i === frage.richtig
                  ? ' richtig'
                  : i === antwort
                    ? ' falsch'
                    : ' blass'
            return (
              <button
                key={option}
                type="button"
                lang="ku"
                className={'gt-option' + zustand}
                disabled={antwort !== null}
                onClick={() => antworten(i)}
              >
                <span className="gt-option-buchstabe" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="gt-option-text">{option}</span>
                {antwort !== null && i === frage.richtig && <Icon name="haken" groesse={18} />}
                {antwort !== null && i === antwort && i !== frage.richtig && (
                  <Icon name="kreuz" groesse={18} />
                )}
              </button>
            )
          })}
        </div>

        <div aria-live="polite">
          {antwort !== null && (
            <div className={'gt-feedback ' + (antwort === frage.richtig ? 'richtig' : 'falsch')}>
              <strong>
                {antwort === frage.richtig ? `Richtig! +${XP_JE_FRAGE} XP` : 'Fast!'}
              </strong>
              <p lang="de">{frage.erklaerung}</p>
            </div>
          )}
        </div>

        {antwort !== null && (
          <PrimaryButton groesse="gross" breit icon="pfeilRechts" onClick={weiter}>
            Weiter
          </PrimaryButton>
        )}
      </Card>
    </div>
  )
}
