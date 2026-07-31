import { navigiere } from '../../../app/router.jsx'
import { useLernstand } from '../../../core/store.js'
import { holeSprachkurs } from '../../../data/sprachkurse.js'
import { kapitelStand, kursStand } from '../../../core/courses/languageCourseStore.js'
import { spieleText, klickGefuehl } from '../../../core/audio/audioService.js'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import Icon from '../../../components/icons/Icon.jsx'
import Badge from '../../../components/common/Badge.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import './LanguageCoursePage.css'

export default function LanguageCoursePage({ languageId }) {
  useLernstand()
  const kurs = holeSprachkurs(languageId)
  if (!kurs) {
    return (
      <ErrorState
        titel="Sprachkurs nicht gefunden"
        text="Dieser Kurs ist noch nicht verfügbar."
        aktion={() => navigiere('/languages')}
        aktionText="Zu allen Kursen"
      />
    )
  }

  const stand = kursStand(kurs)

  return (
    <>
      <button type="button" className="rk-zurueck" onClick={() => navigiere('/languages')}>
        <Icon name="pfeilLinks" groesse={18} />
        <span>Alle Sprachkurse</span>
      </button>

      <PageHeader
        titel={`${kurs.flagge} ${kurs.name}`}
        untertitel={`${kurs.beschreibung}. Alle Inhalte funktionieren ohne Konto und speichern nur auf diesem Gerät.`}
        variante="buch"
      />

      <section
        className="sprachkurs-kopf"
        style={{ '--kurs-farbe': kurs.farbe }}
        aria-labelledby="sprachkurs-kopf-titel"
      >
        <div className="sprachkurs-kopf-kugel" aria-hidden="true">{kurs.flagge}</div>
        <div className="sprachkurs-kopf-text">
          <p className="rk-hero-etikett">Deutsch → {kurs.eigenname}</p>
          <h2 id="sprachkurs-kopf-titel">{stand.fertig} von {stand.gesamt} Kapiteln</h2>
          <p>{kurs.woerter} Wörter · {kurs.lektionen} interaktive Übungen · echte Fotos</p>
          <ProgressBar
            wert={stand.prozent}
            label={`${kurs.name}: ${stand.prozent} Prozent`}
            farbe="blue"
          />
        </div>
        <button
          type="button"
          className="sprachkurs-hoerprobe rk-taktil"
          onClick={() => {
            klickGefuehl()
            spieleText(kurs.kapitel[0].woerter[0].ziel, kurs.locale)
          }}
        >
          <Icon name="lautsprecher" groesse={24} />
          <span>Stimme testen</span>
        </button>
      </section>

      <section className="rk-abschnitt" aria-labelledby="sprachkurs-kapitel">
        <h2 className="rk-abschnitt-titel" id="sprachkurs-kapitel">Kapitel</h2>
        <ol className="sprachkurs-kapitel">
          {kurs.kapitel.map((kapitel, index) => {
            const kapitelFortschritt = kapitelStand(kurs.id, kapitel.id)
            return (
              <li key={kapitel.id}>
                <button
                  type="button"
                  className="sprachkurs-kapitelkarte rk-taktil"
                  onClick={() => {
                    klickGefuehl()
                    navigiere(`/languages/${kurs.id}/${kapitel.id}`)
                  }}
                >
                  <img src={kapitel.foto.src} alt={kapitel.foto.alt} loading="lazy" />
                  <span className="sprachkurs-kapitel-verlauf" />
                  <span className="sprachkurs-kapitel-nummer">{index + 1}</span>
                  <span className="sprachkurs-kapitel-inhalt">
                    <span className="sprachkurs-kapitel-symbol" aria-hidden="true">{kapitel.symbol}</span>
                    <span className="sprachkurs-kapitel-text">
                      <strong>{kapitel.name}</strong>
                      <small>{kapitel.ziel}</small>
                      <span>{kapitel.woerter.length} Wörter · Lernen, Hören, Quiz</span>
                    </span>
                    {kapitelFortschritt?.abgeschlossen ? (
                      <Badge icon="haken" ton="gruen">{kapitelFortschritt.prozent} %</Badge>
                    ) : (
                      <Icon name="pfeilRechts" groesse={24} />
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </>
  )
}
