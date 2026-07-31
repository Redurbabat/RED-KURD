// Einstellungen des Modern-Modus: Profil, Sprache, Tagesziel, Ton, Erinnerungen,
// App-Modus, Design, Datenschutz und Datenverwaltung.
// Die Seite rechnet nichts selbst — sie liest die Stores und schreibt in sie zurück.
import { useEffect, useState } from 'react'
import { useLernstand } from '../../../core/store.js'
import { navigiere } from '../../../app/router.jsx'
import { T } from '../../../core/texts.js'
import {
  holeProfil,
  speichereProfil,
  tageszielWert,
  ZIELE,
  KENNTNISSE,
  VARIANTEN,
  TAGESZIELE,
} from '../../../core/profile/profileStore.js'
import { holeUi, setzeUi, appModus, setzeAppModus } from '../../../core/ui/uiStore.js'
import { tagesZiel, exportiereAlles } from '../../../core/progress/progressStore.js'
import { holeShop } from '../../../core/shop/shopStore.js'
import Icon from '../../../components/icons/Icon.jsx'
import Card from '../../../components/common/Card.jsx'
import Modal from '../../../components/common/Modal.jsx'
import PrimaryButton from '../../../components/common/PrimaryButton.jsx'
import ProgressBar from '../../../components/common/ProgressBar.jsx'
import { ErrorState } from '../../../components/common/EmptyState.jsx'
import PageHeader from '../../../components/layout/PageHeader.jsx'
import './SettingsPage.css'

/** Speicherschlüssel des Profils — wird beim Neustart des Onboardings entfernt. */
const PROFIL_SCHLUESSEL = 'red-kurd-profile-v2'

const DESIGNS = [
  { id: 'light', name: 'Hell', beschreibung: 'Heller Hintergrund, dunkle Schrift', icon: 'sonne' },
  { id: 'dark', name: 'Dunkel', beschreibung: 'Dunkler Hintergrund, helle Schrift', icon: 'mond' },
  {
    id: 'auto',
    name: 'Automatisch',
    beschreibung: 'Richtet sich nach der Einstellung deines Geräts',
    icon: 'einstellungen',
  },
]

const MODI = [
  { id: 'modern', name: 'Modern', beschreibung: 'Klare, reduzierte Lernoberfläche' },
  {
    id: 'abenteuer',
    name: 'Abenteuer',
    beschreibung: 'Spielerische Lernreise mit Karte und Belohnungen',
  },
]

const SCHNELLZUGRIFFE = [
  { id: 'set-modus', name: 'App-Modus', text: 'Modern oder Abenteuer', icon: 'welt' },
  { id: 'set-profil', name: 'Profil & Kurs', text: 'Ziel, Variante und Tagesziel', icon: 'profil' },
  { id: 'set-ton', name: 'Ton & Erinnerungen', text: 'Audio und tägliche Erinnerung', icon: 'glocke' },
  { id: 'set-design', name: 'Darstellung', text: 'Dunkel, hell oder automatisch', icon: 'mond' },
  { id: 'set-daten', name: 'Datenschutz & Daten', text: 'Lokal sichern und übertragen', icon: 'schild' },
]

function springeZu(id) {
  const ziel = document.getElementById(id)
  if (ziel) ziel.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  window.setTimeout(() => URL.revokeObjectURL(adresse), 2000)
}

export default function SettingsPage() {
  useLernstand()

  return (
    <div className="set-seite">
      <PageHeader
        titel={T.einstellungen.titel}
        untertitel={T.einstellungen.untertitel}
        variante="ruhig"
      />

      <nav className="set-schnellmenue" aria-label="Einstellungsbereiche">
        <p className="set-schnellmenue-label">Einstellungen</p>
        <ul>
          {SCHNELLZUGRIFFE.map((eintrag) => (
            <li key={eintrag.id}>
              <button type="button" onClick={() => springeZu(eintrag.id)}>
                <span className="set-schnellmenue-icon">
                  <Icon name={eintrag.icon} groesse={22} />
                </span>
                <span className="set-schnellmenue-text">
                  <strong>{eintrag.name}</strong>
                  <small>{eintrag.text}</small>
                </span>
                <Icon name="pfeilRechts" groesse={20} className="set-schnellmenue-pfeil" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Der Moduswechsel steht bewusst ganz oben — er ist die Einstellung,
          die am meisten veraendert (Designpaket, Bild 12). */}
      <div id="set-modus">
        <ModusKarte />
      </div>

      <section className="rk-abschnitt" id="set-profil">
        <h2 className="rk-abschnitt-titel">Profil und Lernziele</h2>
        <ProfilKarte />
        <SpracheKarte />
        <TageszielKarte />
      </section>

      <section className="rk-abschnitt" id="set-ton">
        <h2 className="rk-abschnitt-titel">Ton und Erinnerungen</h2>
        <AudioKarte />
        <ErinnerungsKarte />
      </section>

      <section className="rk-abschnitt" id="set-design">
        <h2 className="rk-abschnitt-titel">Darstellung</h2>
        <DesignKarte />
      </section>

      <section className="rk-abschnitt" id="set-daten">
        <h2 className="rk-abschnitt-titel">Datenschutz und Daten</h2>
        <DatenschutzKarte />
        <DatenKarte />
      </section>
    </div>
  )
}

/* ===================== Bausteine ===================== */

/**
 * Auswahl mit echten Radios. Damit funktionieren Tastatur, Screenreader und
 * Touch ohne Zusatzcode, und die Liste bleibt eine Liste.
 */
function Wahlgruppe({ name, frage, wert, optionen, aendern }) {
  return (
    <fieldset className="set-gruppe">
      <legend className="set-legende">{frage}</legend>
      <ul className="set-wahlliste">
        {optionen.map((o) => {
          const aktiv = String(o.id) === String(wert)
          return (
            <li key={o.id}>
              <label className={'set-wahl' + (aktiv ? ' aktiv' : '')}>
                <input
                  className="set-wahl-radio"
                  type="radio"
                  name={name}
                  value={String(o.id)}
                  checked={aktiv}
                  onChange={() => aendern(o.id)}
                />
                {o.icon && <Icon name={o.icon} groesse={22} className="set-wahl-icon" />}
                <span className="set-wahl-text">
                  <strong>{o.name}</strong>
                  {o.beschreibung && <small>{o.beschreibung}</small>}
                </span>
                {aktiv && <Icon name="haken" groesse={18} className="set-wahl-haken" />}
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

/** Echter Haken zum An- und Ausschalten, mit sichtbarer Beschriftung. */
function Schalter({ id, titel, zustand, an, aendern }) {
  return (
    <div className="set-schalter">
      <input
        className="set-schalter-box"
        type="checkbox"
        id={id}
        checked={an}
        onChange={(e) => aendern(e.target.checked)}
      />
      <label className="set-schalter-text" htmlFor={id}>
        <strong>{titel}</strong>
        <small>{zustand}</small>
      </label>
    </div>
  )
}

/* ===================== 1 · Profil und Ziele ===================== */

function ProfilKarte() {
  const profil = holeProfil() || {}
  const [name, setName] = useState(() => profil.name || '')

  // Der Name wird kurz nach dem Tippen gespeichert — sonst zeichnet die App
  // bei jedem Tastendruck neu.
  useEffect(() => {
    const uhr = window.setTimeout(() => {
      const gespeichert = (holeProfil() || {}).name || ''
      const neu = name.trim()
      if (neu !== gespeichert) speichereProfil({ name: neu })
    }, 600)
    return () => window.clearTimeout(uhr)
  }, [name])

  return (
    <Card titel={T.einstellungen.profil} icon="profil">
      <div className="set-feldblock">
        <label className="rk-feld-label" htmlFor="set-name">
          Dein Name (freiwillig)
        </label>
        <input
          className="rk-feld"
          id="set-name"
          type="text"
          value={name}
          autoComplete="given-name"
          placeholder="z. B. Rojîn"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            const neu = name.trim()
            if (neu !== ((holeProfil() || {}).name || '')) speichereProfil({ name: neu })
          }}
        />
        <p className="gedaempft set-fussnote">
          Hêlo begrüßt dich damit. Der Name bleibt auf diesem Gerät.
        </p>
      </div>

      <Wahlgruppe
        name="set-ziel"
        frage="Warum lernst du Kurmancî?"
        wert={profil.ziel}
        optionen={ZIELE}
        aendern={(id) => speichereProfil({ ziel: id })}
      />

      <Wahlgruppe
        name="set-kenntnis"
        frage="Wie gut kannst du schon Kurmancî?"
        wert={profil.kenntnis}
        optionen={KENNTNISSE}
        aendern={(id) => speichereProfil({ kenntnis: id })}
      />
    </Card>
  )
}

/* ===================== 2 · Sprache und Variante ===================== */

function SpracheKarte() {
  const profil = holeProfil() || {}

  return (
    <Card titel={T.einstellungen.sprache} icon="sprache">
      <p className="set-sprachpaar">
        <span lang="de">Deutsch</span>
        <Icon name="pfeilRechts" groesse={18} />
        <span className="nur-sr">nach</span>
        <span lang="ku">Kurmancî</span>
      </p>
      <p className="gedaempft set-fussnote">
        Diese Sprachrichtung ist fest eingestellt. Weitere Kurse kommen später dazu.
      </p>

      <Wahlgruppe
        name="set-variante"
        frage="Welche Variante möchtest du hören?"
        wert={profil.variante}
        optionen={VARIANTEN}
        aendern={(id) => {
          speichereProfil({ variante: id })
          setzeUi({ preferredVariant: id })
        }}
      />
    </Card>
  )
}

/* ===================== 3 · Tagesziel ===================== */

function TageszielKarte() {
  const ziel = tageszielWert()
  const stand = tagesZiel(ziel)

  return (
    <Card titel={T.einstellungen.tagesziel} icon="kalender">
      <p className="set-stand">
        Heute: <strong>{stand.roh}</strong> von <strong>{ziel}</strong> Aufgaben
      </p>
      <ProgressBar
        wert={stand.erledigt}
        max={ziel}
        label={`Tagesziel: ${stand.roh} von ${ziel} Aufgaben geschafft`}
        farbe="green"
      />
      <p className="gedaempft set-fussnote">
        {stand.geschafft
          ? 'Dein Ziel für heute ist geschafft. Alles Weitere ist Zugabe.'
          : 'Das Ziel zählt alle gelösten Aufgaben des Tages, egal in welchem Modus.'}
      </p>

      <Wahlgruppe
        name="set-tagesziel"
        frage="Wie viel möchtest du täglich schaffen?"
        wert={ziel}
        optionen={TAGESZIELE}
        aendern={(id) => speichereProfil({ tagesziel: Number(id) })}
      />
    </Card>
  )
}

/* ===================== 4 · Audio ===================== */

function AudioKarte() {
  const ui = holeUi()
  const an = ui.soundEnabled !== false

  return (
    <Card titel={T.einstellungen.audio} icon="lautsprecher">
      <Schalter
        id="set-ton"
        titel="Ton in der App"
        zustand={an ? 'Ist eingeschaltet' : 'Ist ausgeschaltet'}
        an={an}
        aendern={(wert) => setzeUi({ soundEnabled: wert })}
      />
      <p className="gedaempft set-fussnote">
        Ist der Ton aus, wird keine Aussprache abgespielt — weder die aufgenommenen Stimmen
        noch die Vorlesestimme deines Geräts. Alle Übungen bleiben trotzdem lösbar, weil jede
        Höraufgabe auch als Text zu sehen ist.
      </p>
    </Card>
  )
}

/* ===================== 5 · Benachrichtigungen ===================== */

function ErinnerungsKarte() {
  const ui = holeUi()
  const an = ui.remindersEnabled === true

  return (
    <Card titel={T.einstellungen.hinweise} icon="glocke">
      <Schalter
        id="set-erinnerung"
        titel="Tägliche Merkhilfe"
        zustand={an ? 'Ist eingeschaltet' : 'Ist ausgeschaltet'}
        an={an}
        aendern={(wert) => setzeUi({ remindersEnabled: wert })}
      />
      <p className="gedaempft set-fussnote">
        Ehrlich gesagt: RED-KURD verschickt keine Nachrichten. Die Merkhilfe steuert nur den
        Hinweis in der App selbst und gilt allein in diesem Browser auf diesem Gerät. Auf einem
        anderen Gerät musst du sie erneut einschalten.
      </p>
    </Card>
  )
}

/* ===================== 6 · App-Modus ===================== */

function VorschauModern() {
  return (
    <svg className="set-mini" viewBox="0 0 140 90" aria-hidden="true" focusable="false">
      <rect className="set-mini-grund" x="0" y="0" width="140" height="90" />
      <rect className="set-mini-balken" x="10" y="9" width="120" height="20" rx="7" />
      <rect className="set-mini-karte" x="10" y="35" width="120" height="14" rx="5" />
      <rect className="set-mini-karte" x="10" y="55" width="56" height="26" rx="5" />
      <rect className="set-mini-karte" x="74" y="55" width="56" height="26" rx="5" />
      <rect className="set-mini-akzent" x="17" y="62" width="26" height="6" rx="3" />
      <rect className="set-mini-akzent" x="81" y="62" width="26" height="6" rx="3" />
      <rect className="set-mini-linie" x="17" y="72" width="40" height="5" rx="2" />
      <rect className="set-mini-linie" x="81" y="72" width="40" height="5" rx="2" />
    </svg>
  )
}

function VorschauAbenteuer() {
  return (
    <svg className="set-mini" viewBox="0 0 140 90" aria-hidden="true" focusable="false">
      <rect className="set-mini-himmel" x="0" y="0" width="140" height="90" />
      <circle className="set-mini-sonne" cx="116" cy="18" r="9" />
      <path className="set-mini-berg" d="M0 72 L30 32 L52 58 L78 24 L118 72 Z" />
      <rect className="set-mini-boden" x="0" y="68" width="140" height="22" />
      <path className="set-mini-pfad" d="M20 82 C48 78 40 62 64 58 C90 53 86 40 110 36" />
      <circle className="set-mini-knoten" cx="20" cy="82" r="5" />
      <circle className="set-mini-knoten" cx="64" cy="58" r="5" />
      <circle className="set-mini-knoten set-mini-knoten-gold" cx="110" cy="36" r="7" />
    </svg>
  )
}

const VORSCHAU = { modern: <VorschauModern />, abenteuer: <VorschauAbenteuer /> }

function ModusKarte() {
  const aktueller = appModus()
  const [frage, setFrage] = useState(null)

  function wechseln() {
    const neu = frage
    setFrage(null)
    if (!neu) return
    setzeAppModus(neu)
    navigiere(neu === 'abenteuer' ? '/adventure' : '/today')
  }

  return (
    <Card titel={T.einstellungen.modus} icon="rahmen" className="set-moduskartenblock">
      {/* Der Hinweis steht ueber den Karten — er ist die Antwort auf die Frage,
          die sich hier jeder stellt. */}
      <p className="set-modushinweis-oben">{T.einstellungen.modusHinweis}</p>

      <ul className="set-modusliste">
        {MODI.map((m) => {
          const aktiv = m.id === aktueller
          return (
            <li key={m.id}>
              <button
                type="button"
                className={`set-moduskarte set-moduskarte-${m.id}` + (aktiv ? ' aktiv' : '')}
                aria-pressed={aktiv}
                onClick={() => {
                  if (!aktiv) setFrage(m.id)
                }}
              >
                <span className="set-moduskarte-text-block">
                  <strong className="set-moduskarte-name">{m.name}</strong>
                  <span className="set-moduskarte-text">{m.beschreibung}</span>
                </span>
                <span className="set-moduskarte-marke" aria-hidden="true">
                  <Icon name={aktiv ? 'haken' : 'pfeilRechts'} groesse={18} />
                </span>
                <span className="nur-sr">{aktiv ? 'Aktiver Modus' : 'Zu diesem Modus wechseln'}</span>
                <span className="set-mini-rahmen">{VORSCHAU[m.id]}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="set-modushinweis">
        <Icon name="info" groesse={20} />
        <span>{T.einstellungen.modusHinweis}</span>
      </p>

      <Modal
        offen={frage !== null}
        titel={frage === 'abenteuer' ? T.einstellungen.zuAbenteuer : T.einstellungen.zuModern}
        schliessen={() => setFrage(null)}
        fussleiste={
          <>
            <PrimaryButton art="still" onClick={() => setFrage(null)}>
              {T.allgemein.abbrechen}
            </PrimaryButton>
            <PrimaryButton icon="haken" onClick={wechseln}>
              Wechseln
            </PrimaryButton>
          </>
        }
      >
        <p>{T.einstellungen.modusHinweis}</p>
        <p className="gedaempft set-fussnote">
          XP, Serie, Wörter, Kapitel und deine Sterne zählen in beiden Modi gemeinsam. Du
          kannst hier jederzeit zurückwechseln.
        </p>
      </Modal>
    </Card>
  )
}

/* ===================== 7 · Design ===================== */

function DesignKarte() {
  const ui = holeUi()
  const reduziert = ui.animationsEnabled === false

  return (
    <Card titel={T.einstellungen.design} icon="sonne">
      <Wahlgruppe
        name="set-design"
        frage="Wie soll die App aussehen?"
        wert={ui.theme}
        optionen={DESIGNS}
        aendern={(id) => setzeUi({ theme: id })}
      />

      <Schalter
        id="set-animationen"
        titel="Animationen reduzieren"
        zustand={reduziert ? 'Bewegung ist abgeschaltet' : 'Bewegung ist erlaubt'}
        an={reduziert}
        aendern={(wert) => setzeUi({ animationsEnabled: !wert })}
      />
      <p className="gedaempft set-fussnote">
        Blendet Übergänge und bewegte Effekte aus. Hilfreich, wenn Bewegung dich stört oder
        unwohl macht.
      </p>
    </Card>
  )
}

/* ===================== 8 · Datenschutz ===================== */

function DatenschutzKarte() {
  return (
    <Card titel={T.einstellungen.datenschutz} icon="schild">
      <ul className="set-punkte">
        <li>
          <Icon name="haken" groesse={18} />
          <span>
            <strong>Local-first:</strong> Lernstand, Profil und Einstellungen liegen im Speicher
            deines Browsers.
          </span>
        </li>
        <li>
          <Icon name="haken" groesse={18} />
          <span>
            <strong>Kein Konto, keine Cloud:</strong> Es gibt keine Anmeldung und keinen Server,
            der deine Daten sammelt.
          </span>
        </li>
        <li>
          <Icon name="haken" groesse={18} />
          <span>
            <strong>Kein Tracking, keine Werbung:</strong> Keine Analyse-Dienste, keine
            Drittanbieter-Skripte.
          </span>
        </li>
        <li>
          <Icon name="haken" groesse={18} />
          <span>
            <strong>Aufnahmen bleiben im Browser:</strong> Deine Sprachaufnahmen aus dem
            Aussprache-Studio verlassen das Gerät nicht.
          </span>
        </li>
        <li>
          <Icon name="haken" groesse={18} />
          <span>
            <strong>Open Source (MIT):</strong> Der ganze Quelltext ist frei einsehbar und
            veränderbar.
          </span>
        </li>
      </ul>
      <p className="gedaempft set-fussnote">
        Wenn du den Browserspeicher löschst, ist auch dein Lernstand weg. Sichere ihn deshalb
        ab und zu mit dem Export unten.
      </p>
    </Card>
  )
}

/* ===================== 9 · Daten verwalten ===================== */

function DatenKarte() {
  const [hinweis, setHinweis] = useState('')
  const [fehler, setFehler] = useState(null)
  const [frageOffen, setFrageOffen] = useState(false)

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
      setHinweis('')
      setFehler('Die Datei liess sich nicht erzeugen. Bitte versuche es noch einmal.')
    }
  }

  function onboardingNeu() {
    setFrageOffen(false)
    try {
      localStorage.removeItem(PROFIL_SCHLUESSEL)
    } catch {
      /* Privater Modus — dann bleibt das Profil bestehen. */
    }
    window.location.assign('/')
  }

  return (
    <Card titel={T.einstellungen.daten} icon="download">
      <div className="set-datenknoepfe">
        <PrimaryButton art="still" breit icon="download" onClick={exportiere}>
          {T.fortschritt.export}
        </PrimaryButton>
        <PrimaryButton art="still" breit icon="wiederholen" onClick={() => setFrageOffen(true)}>
          Onboarding neu durchlaufen
        </PrimaryButton>
      </div>

      <div aria-live="polite">
        {hinweis && <p className="gedaempft set-hinweis">{hinweis}</p>}
        {fehler && <ErrorState titel="Das hat nicht geklappt." text={fehler} />}
      </div>

      <p className="gedaempft set-fussnote">
        Die Datei enthält Lernstand, Profil, Einstellungen und Shop. Du kannst sie unter
        „Fortschritt“ wieder einlesen.
      </p>

      <Modal
        offen={frageOffen}
        titel="Onboarding neu durchlaufen?"
        schliessen={() => setFrageOffen(false)}
        fussleiste={
          <>
            <PrimaryButton art="still" onClick={() => setFrageOffen(false)}>
              {T.allgemein.abbrechen}
            </PrimaryButton>
            <PrimaryButton icon="wiederholen" onClick={onboardingNeu}>
              Neu durchlaufen
            </PrimaryButton>
          </>
        }
      >
        <p>
          Du beantwortest die drei Fragen zu Vorkenntnissen, Ziel und täglicher Zeit noch
          einmal. Danach wird die App neu geladen.
        </p>
        <p className="gedaempft set-fussnote">
          Dein <strong>Lernstand bleibt erhalten</strong>: XP, Serie, Edelsteine, Wörter,
          Kapitel und Sterne ändern sich dabei nicht. Nur Name, Ziel, Vorkenntnisse und
          Tagesziel werden neu gesetzt.
        </p>
      </Modal>
    </Card>
  )
}
