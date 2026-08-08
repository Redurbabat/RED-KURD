// Fortschrittsseite des Modern-Modus: Kursstand, Fertigkeiten, Kennzahlen,
// Wochenaktivität, eine Empfehlung und die Verwaltung der eigenen Daten.
// Die Seite rechnet nichts selbst — sie liest Selektoren des Lernstands.
import { useEffect, useState } from 'react'
import { useLernstand } from '../../../core/store.ts'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.ts'
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
} from '../../../core/progress/progressSelectors.ts'
import { exportiereAlles, ankiZeilen } from '../../../core/progress/progressStore.ts'
import {
  pruefeSicherung,
  spieleSicherungEin,
  vorschauVomGeraet,
} from '../../../core/backup/sicherung.ts'
import {
  alleAufnahmen,
  aufnahmenBilanz,
  groesseText,
  loescheAlleAufnahmen,
  loescheAufnahme,
  spieleBlob,
  holeAufnahme,
} from '../../../core/audio/audioService.js'
import { kursFortschritt } from '../../../core/courses/courseRepository.ts'
import { holeProfil } from '../../../core/profile/profileStore.ts'


import Icon from '../../../components/icons/Icon.tsx'
import Card from '../../../components/common/Card.tsx'
import Modal from '../../../components/common/Modal.tsx'
import PrimaryButton from '../../../components/common/PrimaryButton.tsx'
import ProgressBar, { ProgressRing } from '../../../components/common/ProgressBar.tsx'
import { StatTile } from '../../../components/common/StatChip.tsx'
import { LoadingState, ErrorState } from '../../../components/common/EmptyState.tsx'
import PageHeader from '../../../components/layout/PageHeader.tsx'
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
        <Aufnahmenverwaltung />
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

/** Ein Datum aus der Sicherung lesbar machen; „unbekannt", wenn keins drinsteht. */
function datumText(iso) {
  if (!iso) return 'ohne Datum'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'ohne Datum'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Was auf diesem Gerät liegt, neben dem, was aus der Datei käme.
 *
 * Bewusst beide Seiten: Eine Vorschau, die nur die Datei zeigt, beantwortet
 * die eigentliche Frage nicht — nämlich ob man gerade mehr aufgibt, als man
 * bekommt. Die Spalte „jetzt" steht deshalb zuerst.
 */
function Sicherungsvergleich({ vorher, nachher }) {
  const zeilen = [
    { name: 'XP', jetzt: vorher.xp, datei: nachher.xp },
    { name: 'Serie (Tage)', jetzt: vorher.serie, datei: nachher.serie },
    { name: 'Gelernte Wörter', jetzt: vorher.woerter, datei: nachher.woerter },
    { name: 'Wiederholkarten', jetzt: vorher.karten, datei: nachher.karten },
    { name: 'Kapitel mit Ergebnis', jetzt: vorher.einheiten, datei: nachher.einheiten },
    { name: 'Edelsteine', jetzt: vorher.edelsteine, datei: nachher.edelsteine },
  ]

  return (
    <div className="fp-vergleich">
      <p className="fp-vergleich-datum">Sicherung vom {datumText(nachher.exportiert)}</p>

      <table className="fp-vergleich-tabelle">
        <caption className="nur-sr">
          Vergleich: aktueller Lernstand auf diesem Gerät und Lernstand aus der Datei
        </caption>
        <thead>
          <tr>
            <th scope="col">&nbsp;</th>
            <th scope="col">Jetzt</th>
            <th scope="col">Aus der Datei</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.name} className={z.datei < z.jetzt ? 'fp-vergleich-weniger' : undefined}>
              <th scope="row">{z.name}</th>
              <td>{z.jetzt}</td>
              <td>
                {z.datei}
                {/* Weniger als jetzt: das ist der Fall, in dem jemand aus
                    Versehen eine alte Sicherung einspielt. Nicht nur farbig
                    markieren — das Wort steht auch für Screenreader da. */}
                {z.datei < z.jetzt && <span className="fp-vergleich-marke"> (weniger)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {nachher.bereiche.length > 0 && (
        <>
          <p className="fp-vergleich-titel">Ebenfalls in der Datei:</p>
          <ul className="fp-vergleich-liste" role="list">
            {nachher.bereiche.map((b) => (
              <li key={b.name}>
                {b.name}: <span className="gedaempft">{b.wert}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/**
 * Sprachaufnahmen verwalten.
 *
 * Sie liegen als einzige Nutzerdaten in der IndexedDB und nicht im
 * localStorage — deshalb sind sie **nicht** in der Sicherungsdatei. Das stand
 * bisher nirgends in der App, und es gab auch keinen Weg, eine Aufnahme wieder
 * loszuwerden: `loescheAufnahme()` existierte, hatte aber keinen einzigen
 * Aufrufer. Beides wird hier nachgeholt.
 */
function Aufnahmenverwaltung() {
  const [liste, setListe] = useState(null)
  const [bilanz, setBilanz] = useState({ anzahl: 0, bytes: 0 })
  const [offen, setOffen] = useState(false)
  const [frageAlle, setFrageAlle] = useState(false)
  const [hinweis, setHinweis] = useState('')

  async function laden() {
    const [neu, summe] = await Promise.all([alleAufnahmen(), aufnahmenBilanz()])
    setListe(neu)
    setBilanz(summe)
  }

  useEffect(() => {
    let lebt = true
    aufnahmenBilanz().then((summe) => {
      if (lebt) setBilanz(summe)
    })
    return () => {
      lebt = false
    }
  }, [])

  async function aufklappen() {
    if (!offen && liste === null) await laden()
    setOffen((o) => !o)
  }

  async function entferne(wort) {
    await loescheAufnahme(wort)
    await laden()
    setHinweis(`Die Aufnahme zu „${wort}" wurde gelöscht.`)
  }

  async function entferneAlle() {
    setFrageAlle(false)
    await loescheAlleAufnahmen()
    await laden()
    setHinweis('Alle Aufnahmen wurden gelöscht.')
  }

  async function anhoeren(wort) {
    const blob = await holeAufnahme(wort)
    if (blob) spieleBlob(blob)
  }

  return (
    <Card titel="Sprachaufnahmen" icon="mikrofon">
      <p className="fp-aufnahmen-zahl">
        <strong>{bilanz.anzahl}</strong>{' '}
        {bilanz.anzahl === 1 ? 'Aufnahme' : 'Aufnahmen'} · {groesseText(bilanz.bytes)}
      </p>
      <p className="gedaempft fp-aufnahmen-hinweis">
        Deine eigenen Aussprache-Aufnahmen liegen im Gerät und sind{' '}
        <strong>nicht Teil der Sicherungsdatei</strong> — bei einem Gerätewechsel bleiben
        sie zurück.
      </p>

      {bilanz.anzahl > 0 && (
        <div className="fp-aufnahmen-knoepfe">
          <PrimaryButton art="still" icon={offen ? 'pfeilHoch' : 'pfeilRunter'} onClick={aufklappen}>
            {offen ? 'Liste schließen' : 'Aufnahmen anzeigen'}
          </PrimaryButton>
          <PrimaryButton art="still" icon="muell" onClick={() => setFrageAlle(true)}>
            Alle löschen
          </PrimaryButton>
        </div>
      )}

      {offen && liste && (
        <ul className="fp-aufnahmen-liste" role="list">
          {liste.map((a) => (
            <li key={a.wort} className="fp-aufnahme">
              <div className="fp-aufnahme-text">
                <span lang="ku" className="fp-aufnahme-wort">
                  {a.wort}
                </span>
                <span className="gedaempft fp-aufnahme-angabe">
                  {groesseText(a.groesse)}
                  {a.zeit ? ` · ${datumText(a.zeit)}` : ''}
                </span>
              </div>
              <button
                type="button"
                className="rk-knopf rk-knopf-still fp-aufnahme-knopf"
                onClick={() => anhoeren(a.wort)}
                aria-label={`Aufnahme zu ${a.wort} anhören`}
              >
                <Icon name="lautsprecher" groesse={20} />
              </button>
              <button
                type="button"
                className="rk-knopf rk-knopf-still fp-aufnahme-knopf"
                onClick={() => entferne(a.wort)}
                aria-label={`Aufnahme zu ${a.wort} löschen`}
              >
                <Icon name="muell" groesse={20} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite">{hinweis && <p className="gedaempft">{hinweis}</p>}</div>

      <Modal
        offen={frageAlle}
        titel="Alle Aufnahmen löschen?"
        schliessen={() => setFrageAlle(false)}
        fussleiste={
          <>
            <PrimaryButton art="still" onClick={() => setFrageAlle(false)}>
              {T.allgemein.abbrechen}
            </PrimaryButton>
            <PrimaryButton art="gefahr" icon="muell" onClick={entferneAlle}>
              Löschen
            </PrimaryButton>
          </>
        }
      >
        <p>
          {bilanz.anzahl} {bilanz.anzahl === 1 ? 'Aufnahme wird' : 'Aufnahmen werden'} vom
          Gerät entfernt ({groesseText(bilanz.bytes)}). Das lässt sich nicht rückgängig
          machen — sie sind in keiner Sicherung enthalten.
        </p>
      </Modal>
    </Card>
  )
}

/** Export, Import und Anki-Export. Alles bleibt im Gerät. */
function Datenverwaltung() {
  const [datei, setDatei] = useState(null)
  // Das Prüfergebnis samt Vorschau — gesetzt, sobald die Datei gelesen ist,
  // und Voraussetzung dafür, dass „Ersetzen" überhaupt etwas tut.
  const [geprueft, setGeprueft] = useState(null)
  const [frageOffen, setFrageOffen] = useState(false)
  const [laden, setLaden] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [hinweis, setHinweis] = useState('')

  function exportiere() {
    try {
      setFehler(null)
      ladeHerunter(
        // Profil, Oberfläche und Shop stehen bereits unter `speicher` — sie
        // hier ein zweites Mal oben mitzugeben, verdoppelte sie in der Datei
        // und die beiden Fassungen konnten auseinanderlaufen. Ältere Dateien
        // MIT der Kopie bleiben lesbar (siehe pruefeSicherung).
        exportiereAlles(),
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
    setLaden(true)

    // Erst lesen und prüfen, dann fragen. Vorher stand die Rückfrage vor dem
    // Lesen — sie konnte also gar nicht zeigen, was in der Datei steckt, und
    // eine untaugliche Datei fiel erst nach dem „Ersetzen" auf.
    const leser = new FileReader()
    leser.onerror = () => {
      setLaden(false)
      setFehler('Die Datei konnte nicht gelesen werden.')
    }
    leser.onload = () => {
      setLaden(false)
      const ergebnis = pruefeSicherung(String(leser.result))
      if (!ergebnis.ok) {
        setFehler(
          `${ergebnis.grund} Bitte wähle eine Datei vom Typ red-kurd-lernstand.json.`
        )
        return
      }
      setDatei(gewaehlt)
      setGeprueft(ergebnis)
      setFrageOffen(true)
    }
    leser.readAsText(gewaehlt)
  }

  function abbrechen() {
    setFrageOffen(false)
    setDatei(null)
    setGeprueft(null)
  }

  function importiere() {
    if (!geprueft || !geprueft.ok) return
    setFrageOffen(false)
    setLaden(true)
    try {
      spieleSicherungEin(geprueft.datei)
      window.location.reload()
    } catch {
      // Geprüft ist geprüft — hierher kommt nur, wer keinen Speicher mehr hat.
      setLaden(false)
      setDatei(null)
      setGeprueft(null)
      setFehler('Der Lernstand liess sich nicht schreiben. Ist der Speicher voll?')
    }
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
        {geprueft?.ok && (
          <Sicherungsvergleich vorher={vorschauVomGeraet()} nachher={geprueft.vorschau} />
        )}
      </Modal>
    </Card>
  )
}
