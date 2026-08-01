import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/icons/Icon.jsx'
import HeloMascot from '../../components/mascot/HeloMascot.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { anmelden, registrieren } from '../../core/auth/authApi.js'
import './AuthPage.css'

export function AuthLoading() {
  return (
    <main className="auth-seite auth-laedt" aria-busy="true" aria-label="Konto wird geladen">
      <div className="auth-ladezeichen" aria-hidden="true" />
      <strong>RED-KURD wird vorbereitet …</strong>
    </main>
  )
}

export default function AuthPage({ onErfolg, anfangsFehler = '', onErneut, onOhneKonto }) {
  const [modus, setModus] = useState('anmelden')
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [bestaetigung, setBestaetigung] = useState('')
  const [anzeigen, setAnzeigen] = useState(false)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState(anfangsFehler)
  const emailRef = useRef(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [modus])

  function modusSetzen(neu) {
    setModus(neu)
    setFehler('')
    setPasswort('')
    setBestaetigung('')
  }

  async function senden(ereignis) {
    ereignis.preventDefault()
    setFehler('')
    if (modus === 'registrieren' && passwort !== bestaetigung) {
      setFehler('Die beiden Redswords stimmen nicht überein.')
      return
    }
    setLaedt(true)
    try {
      const konto =
        modus === 'registrieren'
          ? await registrieren(email, passwort)
          : await anmelden(email, passwort)
      onErfolg(konto)
    } catch (grund) {
      setFehler(grund instanceof Error ? grund.message : 'Das hat leider nicht geklappt.')
    } finally {
      setLaedt(false)
    }
  }

  const istNeu = modus === 'registrieren'
  return (
    <main className="auth-seite">
      <section className="auth-buehne" aria-labelledby="auth-titel">
        <div className="auth-marke">
          <span className="auth-marke-bild" aria-hidden="true">
            <img src="/bilder/logo.png" alt="" />
          </span>
          <span>
            <strong>RED-KURD</strong>
            <small>Zimanê xwe bibêje, pêş ve biçin</small>
          </span>
        </div>

        <div className="auth-werbetext">
          <span className="auth-kicker">Kostenlos lernen</span>
          <h1 id="auth-titel">Sprachen lernen.<br /> Jeden Tag ein Stück.</h1>
          <p>
            Kurze Übungen, echte Aussprache und dein persönlicher Lernweg – auf Handy,
            Tablet und Computer.
          </p>
          <ul className="auth-vorteile">
            <li><Icon name="haken" groesse={18} /> Kostenlos und ohne Werbung</li>
            <li><Icon name="schild" groesse={18} /> Redsword nur als Sicherheits-Hash gespeichert</li>
            <li><Icon name="download" groesse={18} /> Lernfortschritt bleibt lokal auf deinem Gerät</li>
          </ul>
        </div>

        <div className="auth-maskottchen" aria-hidden="true">
          <HeloMascot variante="winken" groesse={180} dekorativ />
        </div>
      </section>

      <section className="auth-panel" aria-label={istNeu ? 'Konto erstellen' : 'Anmelden'}>
        <div className="auth-formkopf">
          <span className="auth-mini-logo"><Icon name="sprache" groesse={25} /></span>
          <div>
            <h2>{istNeu ? 'Dein Konto erstellen' : 'Willkommen zurück'}</h2>
            <p>{istNeu ? 'Einmal registrieren und direkt loslernen.' : 'Melde dich an und lerne weiter.'}</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Kontozugang">
          <button type="button" role="tab" aria-selected={!istNeu} className={!istNeu ? 'aktiv' : ''} onClick={() => modusSetzen('anmelden')}>
            Anmelden
          </button>
          <button type="button" role="tab" aria-selected={istNeu} className={istNeu ? 'aktiv' : ''} onClick={() => modusSetzen('registrieren')}>
            Konto erstellen
          </button>
        </div>

        <form className="auth-formular" onSubmit={senden}>
          <label className="auth-feld">
            <span>Redmail</span>
            <span className="auth-eingabe">
              <Icon name="profil" groesse={19} />
              <input ref={emailRef} type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.ch" maxLength={254} required />
            </span>
          </label>

          <label className="auth-feld">
            <span>Redsword</span>
            <span className="auth-eingabe">
              <Icon name="schloss" groesse={19} />
              <input type={anzeigen ? 'text' : 'password'} name="password" autoComplete={istNeu ? 'new-password' : 'current-password'} value={passwort} onChange={(e) => setPasswort(e.target.value)} placeholder={istNeu ? 'Mindestens 10 Zeichen' : 'Dein Redsword'} minLength={10} maxLength={128} required />
              <button type="button" className="auth-passwort-zeigen" aria-label={anzeigen ? 'Redsword verbergen' : 'Redsword anzeigen'} aria-pressed={anzeigen} onClick={() => setAnzeigen((wert) => !wert)}>
                <Icon name="auge" groesse={20} />
              </button>
            </span>
          </label>

          {istNeu && (
            <label className="auth-feld">
              <span>Redsword wiederholen</span>
              <span className="auth-eingabe">
                <Icon name="schild" groesse={19} />
                <input type={anzeigen ? 'text' : 'password'} name="password-confirmation" autoComplete="new-password" value={bestaetigung} onChange={(e) => setBestaetigung(e.target.value)} placeholder="Redsword noch einmal" minLength={10} maxLength={128} required />
              </span>
            </label>
          )}

          {fehler && (
            <div className="auth-fehler" role="alert">
              <Icon name="warnung" groesse={20} />
              <span>{fehler}</span>
              {onErneut && fehler.includes('Verbindung') && <button type="button" onClick={onErneut}>Erneut versuchen</button>}
            </div>
          )}

          <PrimaryButton type="submit" groesse="gross" breit icon="pfeilRechts" disabled={laedt}>
            {laedt ? 'Einen Moment …' : istNeu ? 'Kostenlos starten' : 'Anmelden'}
          </PrimaryButton>
        </form>

        {/* Kein Konto noetig: RED-KURD ist local-first — wer mag, lernt sofort
            los. Die Entscheidung wird gemerkt und laesst sich in den
            Einstellungen jederzeit durch eine Anmeldung ersetzen. */}
        {onOhneKonto && (
          <div className="auth-gast">
            <span className="auth-oder" aria-hidden="true">
              oder
            </span>
            <PrimaryButton art="still" breit icon="download" onClick={onOhneKonto}>
              Ohne Konto weiterlernen
            </PrimaryButton>
            <p className="auth-gast-hinweis">
              Kein Konto nötig: Dein Lernstand bleibt lokal auf diesem Gerät. Anmelden kannst du
              dich später jederzeit in den Einstellungen.
            </p>
          </div>
        )}

        <p className="auth-datenschutz">
          <Icon name="schild" groesse={17} />
          Deine Redmail sowie erfolgreiche Anmeldungen mit Zeitpunkt werden als Text in
          Cloudflare D1 gespeichert. Dein Redsword wird nie lesbar gespeichert, sondern nur
          als gesalzener Sicherheits-Hash.
        </p>
      </section>
    </main>
  )
}
