// Fortschrittsseite des Modern-Modus: Kursstand, Fertigkeiten, Kennzahlen,
// Wochenaktivität, eine Empfehlung und die Verwaltung der eigenen Daten.
// Die Seite rechnet nichts selbst — sie liest Selektoren des Lernstands.
import { useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  statistik,
  fertigkeiten,
  fertigkeitStufe,
  schwaechsteFertigkeit,
  staerksteFertigkeit,
  wochenAktivitaet,
  wochenLiga,
  wochenSumme,
  wochenMinuten,
  lernzeitText,
} from '../../../core/progress/progressSelectors.js'
import {
  exportiereAlles,
  ankiZeilen,
  setzeFortschritt,
} from '../../../core/progress/progressStore.js'
import { importiereSpeicherstand } from '../../../core/storage.js'
import { kursFortschritt } from '../../../core/courses/courseRepository.js'
import { holeProfil, setzeProfil } from '../../../core/profile/profileStore.js'
import { holeUi, setzeUi } from '../../../core/ui/uiStore.js'
import { holeShop, setzeShop } from '../../../core/shop/shopStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Modal from '../../../components/common/Modal.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar, { ProgressRing } from '../../../components/common/ProgressBar.jsx'
import { StatTile } from '../../../components/common/StatChip.jsx'
import { LoadingState, ErrorState } from '../../../components/common/EmptyState.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import './ProgressPage.css'

/** Die vier Fertigkeiten in fester Reihenfolge — Icon und Balkenfarbe je Zeile. */
const FERTIGKEITEN = [
  { id: 'erkennen', name: 'Erkennen', icon: 'auge', farbe: 'primary' },
  { id: 'abrufen', name: 'Abrufen', icon: 'gehirn', farbe: 'green' },
  { id: 'schreiben', name: 'Schreiben', icon: 'stift', farbe: 'orange' },
  { id: 'hoeren', name: 'Hören', icon: 'kopfhoerer', farbe: 'purple' },
]

/** Passendes Training je Fertigkeit. */
const TRAINING = {
  erkennen: '/practice/review',
  abrufen: '/practice/review',
  schreiben: '/practice/writing',
  hoeren: '/practice/listening',
}

const LANGE_TAGE = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
}

/** Höchste Säulenhöhe in Pixeln — passt in die 130px hohe .rk-woche. */
const SAEULE_MAX = 74

const OFFLINE_PARTNER = [
  { name: 'Rojda', punkte: 720, farbe: 'lila' },
  { name: 'Azad', punkte: 520, farbe: 'blau' },
  { name: 'Dilîn', punkte: 340, farbe: 'pink' },
  { name: 'Baran', punkte: 180, farbe: 'gruen' },
  { name: 'Hêvî', punkte: 80, farbe: 'gold' },
]

function initiale(name) {
  const sauber = String(name || '').trim()
  return sauber ? sauber.charAt(0).toUpperCase() : 'H'
}

function ligaTabelle(name, punkte) {
  return [...OFFLINE_PARTNER, { name, punkte, farbe: 'teal', eigen: true }]
    .sort((a, b) => b.punkte - a.punkte)
    .map((eintrag, index) => ({ ...eintrag, rang: index + 1 }))
}

function fertigkeitInfo(id) {
  return FERTIGKEITEN.find((f) => f.id === id) || FERTIGKEITEN[0]
}

/** Eine Zeichenkette als Datei anbieten, ohne die Seite zu verlassen. */
function ladeHerunter(inhalt, dateiname, typ) {
  const adresse = URL.createObjectURL(new Blob([inhalt], { type: typ }))
  const verweis = document.createElement('a')
  verweis.href = adresse
  verweis.download = dateiname
  document.body.appendChild(verweis)
  verweis.click()
  verweis.remove()
  // Der Browser braucht die Adresse noch einen Moment, bis der Download läuft.
  window.setTimeout(() => URL.revokeObjectURL(adresse), 2000)
}

export default function ProgressPage() {
  useLernstand()

  const s = statistik()
  const kurs = kursFortschritt()
  const werte = fertigkeiten()
  const woche = wochenAktivitaet()
  const liga = wochenLiga()
  const profil = holeProfil() || {}
  const name = (profil.name || '').trim() || 'Hêlo'
  const ligaZeilen = ligaTabelle(name, wochenSumme() * 10)
  const maxTag = Math.max(1, ...woche.map((t) => t.anzahl))

  return (
    <div className="fp-seite">
      <PageHeader
        titel={T.fortschritt.titel}
        untertitel={T.fortschritt.untertitel}
        variante="daumen"
      />

      <section className="fp-profilkopf" aria-labelledby="fp-profil-name">
        <span className="fp-avatar" aria-hidden="true">
          {initiale(name)}
        </span>
        <div className="fp-profiltext">
          <h2 id="fp-profil-name">{name}</h2>
          <p>Lokales Profil · Deutsch → Kurmancî</p>
          <ul className="fp-profilzahlen" role="list">
            <li>
              <strong>{s.serie}</strong>
              <span>Tage Serie</span>
            </li>
            <li>
              <strong>{s.xp}</strong>
              <span>Gesamt-XP</span>
            </li>
            <li>
              <strong>{s.gelernt}</strong>
              <span>Wörter</span>
            </li>
            <li>
              <strong>{kurs.gesamt}</strong>
              <span>Kapitel</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Überblick</h2>

        <div className="rk-hero fp-hero">
          <div className="rk-hero-text">
            <span className="rk-hero-etikett">{T.app.kurs}</span>
            <h3 className="fp-hero-zahl">{kurs.prozent} % geschafft</h3>
            <p>
              {kurs.fertig} von {kurs.gesamt} Kapiteln geschafft
            </p>
          </div>
          <ProgressRing
            wert={kurs.prozent}
            label={`Kursfortschritt: ${kurs.fertig} von ${kurs.gesamt} Kapiteln geschafft`}
            groesse={84}
            farbe="#ffffff"
          />
        </div>

        <Card titel={T.fortschritt.fertigkeiten} icon="puzzle">
          <ul className="fp-skills">
            {FERTIGKEITEN.map((f) => {
              const anzahl = werte[f.id + 'Anzahl'] || 0
              const prozent = anzahl ? werte[f.id] || 0 : 0
              const wertText = anzahl ? `${prozent} %` : '–'
              const stufeText = anzahl ? fertigkeitStufe(prozent) : 'Noch keine Daten'
              return (
                <li key={f.id} className="rk-skill">
                  <Icon name={f.icon} groesse={22} className="rk-skill-icon" />
                  <span className="rk-skill-name">
                    <span>{f.name}</span>
                    <span className="rk-skill-stufe">
                      {wertText} · {stufeText}
                    </span>
                  </span>
                  <ProgressBar
                    className="rk-skill-balken"
                    wert={prozent}
                    label={`${f.name}: ${wertText}, ${stufeText}`}
                    farbe={f.farbe}
                    klein
                  />
                </li>
              )
            })}
          </ul>
          <p className="gedaempft fp-fussnote">
            Der Prozentwert zeigt, wie viele deiner Karten in dieser Fertigkeit schon sicher
            sitzen.
          </p>
        </Card>

        <Card titel="Zahlen" icon="berg">
          <ul className="fp-zahlen">
            <li>
              <StatTile icon="kurs" wert={`${kurs.fertig}/${kurs.gesamt}`} label="Kapitel geschafft" />
            </li>
            <li>
              <StatTile icon="buch" wert={s.gelernt} label="Wörter im System" />
            </li>
            <li>
              <StatTile icon="schild" wert={s.sicher} label="Wörter sicher" />
            </li>
            <li>
              <StatTile icon="wiederholen" wert={s.faellig} label="zum Wiederholen" />
            </li>
            <li>
              <StatTile icon="flamme" wert={s.serie} label={T.stats.serie} />
            </li>
            <li>
              <StatTile icon="stern" wert={s.xp} label={T.stats.xp} />
            </li>
          </ul>
        </Card>
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Aktivität</h2>

        <Card titel={T.fortschritt.woche} icon="kalender">
          {/* Das Diagramm ist rein visuell — die Zahlen stehen in der Tabelle darunter. */}
          <div className="rk-woche fp-woche" aria-hidden="true">
            {woche.map((tag) => (
              <div
                key={tag.datum}
                className={'rk-woche-saeule' + (tag.heute ? ' heute' : '')}
              >
                <span className="rk-woche-zahl">{tag.anzahl}</span>
                <div
                  className="rk-woche-balken"
                  style={{ height: Math.max(4, Math.round((tag.anzahl / maxTag) * SAEULE_MAX)) + 'px' }}
                />
                <small>{tag.tag}</small>
              </div>
            ))}
          </div>

          {/* Die Tabelle steckt in einem Wrapper: eine Tabelle allein laesst sich
              nicht auf 1 px klemmen und wuerde die Seite breiter machen. */}
          <div className="nur-sr">
            <table>
              <caption>Gelöste Aufgaben der letzten sieben Tage</caption>
              <thead>
                <tr>
                  <th scope="col">Tag</th>
                  <th scope="col">Aufgaben</th>
                  <th scope="col">davon richtig</th>
                </tr>
              </thead>
              <tbody>
                {woche.map((tag) => (
                  <tr key={tag.datum}>
                    <th scope="row">
                      {LANGE_TAGE[tag.tag] || tag.tag}
                      {tag.heute ? ' (heute)' : ''}
                    </th>
                    <td>{tag.anzahl}</td>
                    <td>{tag.richtig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="fp-zeiten">
            <li>
              <Icon name="uhr" groesse={20} />
              <span>
                {T.fortschritt.lernzeit}: <strong>{lernzeitText(s.lernzeit)}</strong>
              </span>
            </li>
            <li>
              <Icon name="kalender" groesse={20} />
              <span>
                Diese Woche: <strong>{wochenMinuten()} Min</strong>
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Wochenliga</h2>
        <Card titel={liga.name} icon={liga.icon} ton="kuehl" className="fp-liga">
          <p className="fp-liga-text">{liga.text}</p>
          {liga.naechste ? (
            <>
              <ProgressBar
                wert={liga.fortschritt}
                max={liga.spanne}
                label={`${liga.name}: noch ${liga.fehlen} Aufgaben bis ${liga.naechste.name}`}
                farbe="gold"
                zeigeWert
              />
              <p className="gedaempft fp-fussnote">
                Noch {liga.fehlen} Aufgaben bis zur {liga.naechste.name}.
              </p>
            </>
          ) : (
            <p className="fp-liga-gipfel">
              <Icon name="krone" groesse={20} />
              Höchste Liga dieser Woche erreicht.
            </p>
          )}
          <p className="gedaempft fp-liga-lokal">
            Diese persönliche Liga wird nur aus deinen lokal gelösten Aufgaben berechnet. Es gibt
            keine öffentliche Rangliste und keine Übertragung.
          </p>
          <ol className="fp-ligatabelle">
            {ligaZeilen.map((eintrag) => (
              <li key={eintrag.name} className={eintrag.eigen ? 'eigen' : ''}>
                <span className="fp-liga-rang">{eintrag.rang}</span>
                <span className={`fp-liga-avatar fp-liga-avatar-${eintrag.farbe}`} aria-hidden="true">
                  {initiale(eintrag.name)}
                </span>
                <span className="fp-liga-name">
                  <strong>{eintrag.eigen ? `${eintrag.name} (du)` : eintrag.name}</strong>
                  <small>{eintrag.eigen ? 'Dein echtes Wochenergebnis' : 'Offline-Trainingspartner'}</small>
                </span>
                <strong className="fp-liga-punkte">{eintrag.punkte} XP</strong>
              </li>
            ))}
          </ol>
          <p className="gedaempft fp-liga-lokal">
            Die Trainingspartner sind lokale Vergleichswerte, keine echten Personen. Dadurch
            bleibt die Liga kostenlos und privat.
          </p>
        </Card>
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Nächster Schritt</h2>
        <Empfehlung werte={werte} />
      </section>

      <section className="rk-abschnitt">
        <h2 className="rk-abschnitt-titel">Sichern und übertragen</h2>
        <Datenverwaltung />
      </section>
    </div>
  )
}

/** Kurzer Ratschlag aus stärkster und schwächster Fertigkeit. */
function Empfehlung({ werte }) {
  const starkId = staerksteFertigkeit()
  const schwachId = schwaechsteFertigkeit()

  if (!starkId || !schwachId) {
    return (
      <Card titel={T.fortschritt.empfehlung} icon="kompass" ton="kuehl">
        <p>
          Hier steht bald, was dir schon leicht fällt und was du als Nächstes üben solltest.
          Dafür braucht Hêlo ein paar Antworten von dir — eine erste Sitzung genügt.
        </p>
        <PrimaryButton icon="blitz" onClick={() => navigiere('/today')}>
          Erste Sitzung starten
        </PrimaryButton>
      </Card>
    )
  }

  const stark = fertigkeitInfo(starkId)
  const schwach = fertigkeitInfo(schwachId)
  const pStark = werte[starkId] || 0
  const pSchwach = werte[schwachId] || 0
  const gleich = starkId === schwachId

  return (
    <Card titel={T.fortschritt.empfehlung} icon="kompass" ton="kuehl">
      <p className="fp-rat">
        {gleich ? (
          <>
            Bisher hast du vor allem <strong>{stark.name}</strong> geübt — {pStark} % deiner
            Karten sitzen dort sicher. Bleib dran, die anderen Fertigkeiten kommen von selbst
            dazu.
          </>
        ) : (
          <>
            Stark im <strong>{stark.name}</strong> — {pStark} % deiner Karten sitzen dort schon
            sicher. Als Nächstes solltest du <strong>{schwach.name}</strong> üben, dort sind es
            erst {pSchwach} %.
          </>
        )}
      </p>
      <PrimaryButton
        icon={schwach.icon}
        onClick={() => navigiere(TRAINING[schwachId] || '/practice/review')}
      >
        {schwach.name} üben
      </PrimaryButton>
    </Card>
  )
}

/** Export, Import und Anki-Export. Alles bleibt im Gerät. */
function Datenverwaltung() {
  const [datei, setDatei] = useState(null)
  const [frageOffen, setFrageOffen] = useState(false)
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [hinweis, setHinweis] = useState('')

  function exportiere() {
    try {
      setFehler(null)
      ladeHerunter(
        exportiereAlles({ profil: holeProfil(), ui: holeUi(), shop: holeShop() }),
        'red-kurd-lernstand.json',
        'application/json'
      )
      setHinweis('Der Lernstand wurde als red-kurd-lernstand.json gespeichert.')
    } catch {
      setFehler('Die Datei liess sich nicht erzeugen. Bitte versuche es noch einmal.')
    }
  }

  function exportiereAnki() {
    try {
      setFehler(null)
      const zeilen = ankiZeilen()
      if (!zeilen) {
        setHinweis('Es gibt noch keine Karten zum Ausgeben. Lerne zuerst ein Kapitel.')
        return
      }
      ladeHerunter(zeilen, 'red-kurd-anki.txt', 'text/plain;charset=utf-8')
      setHinweis('Die Anki-Datei wurde als red-kurd-anki.txt gespeichert.')
    } catch {
      setFehler('Die Anki-Datei liess sich nicht erzeugen. Bitte versuche es noch einmal.')
    }
  }

  function dateiGewaehlt(e) {
    const gewaehlt = e.target.files && e.target.files[0]
    // Zurücksetzen, damit dieselbe Datei erneut gewählt werden kann.
    e.target.value = ''
    if (!gewaehlt) return
    setFehler(null)
    setHinweis('')
    setDatei(gewaehlt)
    setFrageOffen(true)
  }

  function abbrechen() {
    setFrageOffen(false)
    setDatei(null)
  }

  function importiere() {
    if (!datei) return
    setFrageOffen(false)
    setLaden(true)
    const leser = new FileReader()
    leser.onerror = () => {
      setLaden(false)
      setDatei(null)
      setFehler('Die Datei konnte nicht gelesen werden.')
    }
    leser.onload = () => {
      try {
        const daten = JSON.parse(String(leser.result))
        if (!daten || typeof daten !== 'object' || !daten.fortschritt) {
          throw new Error('kein Lernstand')
        }
        if (daten.speicher) importiereSpeicherstand(daten.speicher)
        setzeFortschritt(daten.fortschritt)
        if (daten.profil) setzeProfil(daten.profil)
        if (daten.ui) setzeUi(daten.ui)
        // Der Export enthält den Shop — beim Import muss er auch zurückkommen,
        // sonst sind gekaufte Artikel nach dem Geräte-Wechsel weg.
        if (daten.shop) setzeShop(daten.shop)
        window.location.reload()
      } catch {
        setLaden(false)
        setDatei(null)
        setFehler('Diese Datei enthält keinen RED-KURD-Lernstand. Bitte wähle eine Datei vom Typ red-kurd-lernstand.json.')
      }
    }
    leser.readAsText(datei)
  }

  return (
    <Card titel="Daten" icon="download">
      {laden ? (
        <LoadingState text="Lernstand wird eingelesen …" />
      ) : (
        <div className="fp-datenknoepfe">
          <PrimaryButton art="still" breit icon="download" onClick={exportiere}>
            {T.fortschritt.export}
          </PrimaryButton>

          <label className="rk-knopf rk-knopf-still fp-dateiknopf">
            <Icon name="upload" groesse={20} />
            <span className="rk-knopf-text">{T.fortschritt.import}</span>
            <input
              className="nur-sr"
              type="file"
              accept=".json,application/json"
              onChange={dateiGewaehlt}
            />
          </label>

          <PrimaryButton art="still" breit icon="teilen" onClick={exportiereAnki}>
            {T.fortschritt.anki}
          </PrimaryButton>
        </div>
      )}

      <div aria-live="polite">
        {hinweis && <p className="gedaempft fp-hinweis">{hinweis}</p>}
        {fehler && <ErrorState titel="Das hat nicht geklappt." text={fehler} />}
      </div>

      <p className="gedaempft fp-fussnote">Alles bleibt bei dir — ohne Konto, ohne Cloud.</p>

      <Modal
        offen={frageOffen}
        titel="Lernstand ersetzen?"
        schliessen={abbrechen}
        fussleiste={
          <>
            <PrimaryButton art="still" onClick={abbrechen}>
              {T.allgemein.abbrechen}
            </PrimaryButton>
            <PrimaryButton art="gefahr" icon="upload" onClick={importiere}>
              Ersetzen
            </PrimaryButton>
          </>
        }
      >
        <p>
          Der aktuelle Lernstand wird ersetzt. XP, Serie, Karten und Kapitel aus der Datei
          gelten danach — der bisherige Stand auf diesem Gerät geht verloren.
        </p>
        {datei && <p className="gedaempft">Gewählte Datei: {datei.name}</p>}
      </Modal>
    </Card>
  )
}
