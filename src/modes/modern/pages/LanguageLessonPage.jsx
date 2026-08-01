import { useMemo, useState } from 'react'
import { navigiere } from '../../../app/router.jsx'
import { useLernstand } from '../../../core/store.js'
import { holeSprachkurs, holeSprachkapitel } from '../../../data/sprachkurse.js'
import { kapitelAbschliessen } from '../../../core/courses/languageCourseStore.js'
import { gibXp } from '../../../core/progress/progressStore.js'
import { spieleText, klickGefuehl } from '../../../core/audio/audioService.js'
import FlagIcon from '../../../components/common/FlagIcon.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import './LanguageLessonPage.css'

function rotiere(liste, um) {
  const stelle = um % liste.length
  return [...liste.slice(stelle), ...liste.slice(0, stelle)]
}

function baueFragen(woerter) {
  return woerter.map((wort, index) => {
    const falsche = rotiere(woerter, index + 1)
      .filter((eintrag) => eintrag.ziel !== wort.ziel)
      .slice(0, 3)
      .map((eintrag) => eintrag.ziel)
    return {
      wort,
      optionen: rotiere([wort.ziel, ...falsche], index % 4),
    }
  })
}

export default function LanguageLessonPage({ languageId, chapterId }) {
  useLernstand()
  const kurs = holeSprachkurs(languageId)
  const kapitel = holeSprachkapitel(languageId, chapterId)
  const [phase, setPhase] = useState('lernen')
  const [index, setIndex] = useState(0)
  const [antwort, setAntwort] = useState(null)
  const [richtig, setRichtig] = useState(0)
  const fragen = useMemo(() => baueFragen(kapitel?.woerter || []), [kapitel])

  if (!kurs || !kapitel) {
    return (
      <ErrorState
        titel="Lektion nicht gefunden"
        text="Diese Lektion konnte nicht geladen werden."
        aktion={() => navigiere('/languages')}
        aktionText="Zu den Sprachkursen"
      />
    )
  }

  const wort = kapitel.woerter[index]
  const frage = fragen[index]

  function weiterLernen() {
    klickGefuehl()
    if (index + 1 < kapitel.woerter.length) {
      setIndex((wert) => wert + 1)
      return
    }
    setIndex(0)
    setPhase('quiz')
  }

  function waehlen(option) {
    if (antwort !== null) return
    const korrekt = option === frage.wort.ziel
    setAntwort(option)
    if (korrekt) setRichtig((wert) => wert + 1)
    klickGefuehl(korrekt ? 'richtig' : 'falsch')
    spieleText(frage.wort.ziel, kurs.locale)
  }

  function naechsteFrage() {
    if (index + 1 < fragen.length) {
      setIndex((wert) => wert + 1)
      setAntwort(null)
      return
    }
    const prozent = Math.round((richtig / fragen.length) * 100)
    kapitelAbschliessen(kurs.id, kapitel.id, prozent)
    gibXp(Math.max(10, richtig * 5))
    setPhase('ergebnis')
  }

  if (phase === 'ergebnis') {
    const prozent = Math.round((richtig / fragen.length) * 100)
    const bestanden = prozent >= 75
    return (
      <div className="sprachlektion sprachlektion-ergebnis">
        <div className={`sprachlektion-ergebnis-kugel ${bestanden ? 'bestanden' : ''}`}>
          <Icon name={bestanden ? 'krone' : 'wiederholen'} groesse={58} />
        </div>
        <p className="rk-hero-etikett"><FlagIcon sprache={kurs.id} breite={20} /> {kurs.name}</p>
        <h1>{bestanden ? 'Kapitel geschafft!' : 'Fast geschafft!'}</h1>
        <p>{richtig} von {fragen.length} Antworten waren richtig · {prozent} %</p>
        <ProgressBar wert={prozent} label={`Ergebnis: ${prozent} Prozent`} farbe={bestanden ? 'green' : 'gold'} />
        <div className="sprachlektion-ergebnis-aktionen">
          {!bestanden && (
            <PrimaryButton
              art="gold"
              icon="wiederholen"
              onClick={() => {
                setIndex(0)
                setAntwort(null)
                setRichtig(0)
                setPhase('lernen')
              }}
            >
              Noch einmal
            </PrimaryButton>
          )}
          <PrimaryButton
            art="gruen"
            icon="haken"
            onClick={() => navigiere(`/languages/${kurs.id}`)}
          >
            Zu den Kapiteln
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="sprachlektion" style={{ '--kurs-farbe': kurs.farbe }}>
      <header className="sprachlektion-kopf">
        <button
          type="button"
          className="rk-icon-knopf"
          aria-label="Lektion schließen"
          onClick={() => navigiere(`/languages/${kurs.id}`)}
        >
          <Icon name="kreuz" groesse={22} />
        </button>
        <div className="sprachlektion-kopf-fortschritt">
          <span>{phase === 'lernen' ? 'Lernen' : 'Quiz'} · {index + 1}/{kapitel.woerter.length}</span>
          <ProgressBar
            wert={index + 1}
            max={kapitel.woerter.length}
            label={`${index + 1} von ${kapitel.woerter.length}`}
            farbe="blue"
            klein
          />
        </div>
        <span className="sprachlektion-flagge" aria-hidden="true"><FlagIcon sprache={kurs.id} breite={28} /></span>
      </header>

      {phase === 'lernen' ? (
        <main className="sprachlektion-buehne">
          <section className="sprachlektion-fotokarte">
            <img src={kapitel.foto.src} alt={kapitel.foto.alt} />
            <span className="sprachlektion-fotoverlauf" />
            <span className="sprachlektion-fotolabel">
              Echtes Foto · Wikimedia Commons
            </span>
          </section>

          <section className="sprachlektion-wortkarte" aria-live="polite">
            <span className="sprachlektion-wort-symbol" aria-hidden="true">{wort.bild}</span>
            <p className="sprachlektion-ausgang">{wort.de}</p>
            <h1 lang={kurs.locale}>{wort.ziel}</h1>
            <button
              type="button"
              className="sprachlektion-audio rk-taktil"
              onClick={() => {
                klickGefuehl()
                spieleText(wort.ziel, kurs.locale)
              }}
            >
              <Icon name="lautsprecher" groesse={28} />
              <span>Aussprache anhören</span>
              <span className="sprachlektion-audio-wellen" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
            </button>
          </section>

          <div className="sprachlektion-navigation">
            <PrimaryButton
              art="still"
              icon="pfeilLinks"
              disabled={index === 0}
              onClick={() => {
                klickGefuehl()
                setIndex((wert) => Math.max(0, wert - 1))
              }}
            >
              Zurück
            </PrimaryButton>
            <PrimaryButton art="gruen" iconRechts="pfeilRechts" onClick={weiterLernen}>
              {index + 1 === kapitel.woerter.length ? 'Quiz starten' : 'Weiter'}
            </PrimaryButton>
          </div>
        </main>
      ) : (
        <main className="sprachlektion-buehne sprachlektion-quiz">
          <section className="sprachlektion-quizfrage">
            <span className="sprachlektion-wort-symbol" aria-hidden="true">{frage.wort.bild}</span>
            <p>Wie heißt das auf {kurs.name}?</p>
            <h1>{frage.wort.de}</h1>
            <button
              type="button"
              className="sprachlektion-mini-audio"
              aria-label="Richtige Aussprache nach der Antwort anhören"
              onClick={() => spieleText(frage.wort.ziel, kurs.locale)}
            >
              <Icon name="lautsprecher" groesse={21} />
            </button>
          </section>

          <div className="sprachlektion-optionen">
            {frage.optionen.map((option, optionIndex) => {
              const istRichtig = option === frage.wort.ziel
              const klasse =
                antwort === null
                  ? ''
                  : istRichtig
                    ? ' richtig'
                    : antwort === option
                      ? ' falsch'
                      : ' inaktiv'
              return (
                <button
                  type="button"
                  className={`sprachlektion-option rk-taktil${klasse}`}
                  disabled={antwort !== null}
                  onClick={() => waehlen(option)}
                  key={option}
                >
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                  <strong lang={kurs.locale}>{option}</strong>
                  {antwort !== null && istRichtig && <Icon name="haken" groesse={22} />}
                </button>
              )
            })}
          </div>

          {antwort !== null && (
            <section className={`sprachlektion-feedback ${antwort === frage.wort.ziel ? 'richtig' : 'falsch'}`}>
              <Icon name={antwort === frage.wort.ziel ? 'haken' : 'info'} groesse={25} />
              <span>
                <strong>{antwort === frage.wort.ziel ? 'Richtig!' : 'Richtige Antwort:'}</strong>
                <span lang={kurs.locale}>{frage.wort.ziel}</span>
              </span>
              <PrimaryButton
                art={antwort === frage.wort.ziel ? 'gruen' : 'gold'}
                onClick={naechsteFrage}
              >
                Weiter
              </PrimaryButton>
            </section>
          )}
        </main>
      )}
    </div>
  )
}
