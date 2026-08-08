// Die gemeinsame Übungsoberfläche. Modern-Modus und Abenteuer-Modus nutzen
// exakt diese Komponente — nur die Klasse `stil` ändert das Aussehen.
// Ausgangssprache ist immer Deutsch, Zielsprache Kurmancî.
import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import SpecialChars from '../../components/common/SpecialChars.jsx'
import HeloMascot from '../../components/mascot/HeloMascot.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { spieleWort } from '../../core/audio/audioService.js'
import { istRichtigGetippt, SKILL_JE_ART } from '../../core/session/exerciseFactory.ts'
import { gibXp, karteBewerten, zaehleAufgabe } from '../../core/progress/progressStore.js'
import { deutschVon, fotoVon, kurmanciVon } from '../../core/courses/courseRepository.js'
import { sitzungSpeichern, sitzungLoeschen } from '../../core/session/sessionStore.js'
import { T } from '../../core/texts.js'

const BUCHSTABEN = ['A', 'B', 'C', 'D']
const XP_JE_AUFGABE = 10

/**
 * Aussprache der kurmancîschen Sonderzeichen, jeweils mit deutschem Vergleich.
 * Die Reihenfolge bestimmt, welcher Hinweis bei mehreren Treffern gezeigt wird.
 */
const AUSSPRACHE = [
  { zeichen: 'ş', vergleich: 'klingt wie „sch“ in „Schule“' },
  { zeichen: 'ç', vergleich: 'klingt wie „tsch“ in „Tschüss“' },
  { zeichen: 'ê', vergleich: 'ist ein langes, geschlossenes „e“ wie in „Beet“' },
  { zeichen: 'î', vergleich: 'ist ein langes „i“ wie in „Bier“' },
  { zeichen: 'û', vergleich: 'ist ein langes „u“ wie in „Buch“' },
  { zeichen: 'x', vergleich: 'klingt wie das „ch“ in „Bach“' },
]

/** Erster passender Aussprachehinweis zu einem Kurmancî-Wort, sonst leer. */
function ausspracheHinweis(wort) {
  const klein = String(wort || '').toLowerCase()
  const treffer = AUSSPRACHE.find((a) => klein.includes(a.zeichen))
  return treffer ? `Das „${treffer.zeichen}“ ${treffer.vergleich}.` : ''
}

/**
 * Hilfstext unter einer Antwortmöglichkeit.
 * Die Richtung muss mitgegeben werden: „du" ist auf Deutsch ein Pronomen und
 * auf Kurmancî die Zwei — ohne Richtung stünde unter dem deutschen „du" die
 * Übersetzung „zwei".
 */
function untertitel(option, optionenSindKurmanci) {
  const treffer = optionenSindKurmanci ? deutschVon(option) : kurmanciVon(option)
  return treffer && treffer !== option ? treffer : ''
}

/** Ist die richtige Antwort dieser Aufgabenart auf Kurmancî? */
function antwortIstKurmanci(art) {
  return art === 'wahl-ku' || art === 'tippen'
}

/**
 * Die Bedeutung der richtigen Antwort in der jeweils anderen Sprache.
 * @returns {{text:string, sprache:'de'|'ku'}|null}
 */
function bedeutungZurAntwort(u) {
  // Beim Bild ist die Antwort ein Wort-Bild — dazu passt die deutsche Bedeutung.
  if (u.art === 'bild') return u.w.de ? { text: u.w.de, sprache: 'de' } : null
  const nachDeutsch = antwortIstKurmanci(u.art)
  const treffer = nachDeutsch ? deutschVon(u.antwort) || u.w.de : kurmanciVon(u.antwort) || u.w.ku
  if (!treffer || treffer === u.antwort) return null
  return { text: treffer, sprache: nachDeutsch ? 'de' : 'ku' }
}

/** Nur die Daten sichern, die zum Fortsetzen nötig sind. */
function schlank(uebungen) {
  return uebungen.map((u) => ({
    art: u.art,
    frage: u.frage,
    antwort: u.antwort,
    optionen: u.optionen,
    w: { de: u.w.de, ku: u.w.ku, bild: u.w.bild },
  }))
}

/**
 * @param {{uebungen:Array, titel:string, stil?:'modern'|'abenteuer',
 *          startIndex?:number, startPunkte?:number, mitLeben?:boolean,
 *          fertig:(ergebnis:{prozent:number, richtig:number, gesamt:number, fehler:Array})=>void,
 *          abbrechen?:()=>void, speichern?:boolean}} props
 */
export default function ExercisePlayer({
  uebungen,
  titel,
  stil = 'modern',
  startIndex = 0,
  startPunkte = 0,
  mitLeben = false,
  fertig,
  abbrechen,
  speichern = true,
}) {
  const [index, setIndex] = useState(startIndex)
  const [punkte, setPunkte] = useState(startPunkte)
  const [antwort, setAntwort] = useState(null)
  const [eingabe, setEingabe] = useState('')
  const [leben, setLeben] = useState(3)
  const [fehler, setFehler] = useState([])
  const feldRef = useRef(null)
  const weiterRef = useRef(null)
  const startZeit = useRef(Date.now())
  const gemeldet = useRef(false)

  const u = uebungen[index]
  const amEnde = index >= uebungen.length

  // Sitzung sichern, damit ein Reload nichts verliert.
  // Sobald eine Aufgabe beantwortet ist, wird sie als erledigt gesichert —
  // sonst wird sie nach einem Neuladen erneut gestellt UND erneut gewertet
  // (doppelte XP und doppelter Eintrag im Wiederholsystem).
  useEffect(() => {
    if (!speichern) return
    if (amEnde) {
      sitzungLoeschen()
      return
    }
    // `punkte` enthaelt den Treffer bereits: setAntwort und setPunkte laufen
    // im selben Batch, dieser Effekt sieht also schon den erhoehten Stand.
    const erledigt = antwort !== null
    sitzungSpeichern({
      titel,
      index: erledigt ? index + 1 : index,
      punkte,
      uebungen: schlank(uebungen),
    })
  }, [index, antwort, punkte, amEnde, speichern, titel])

  // Ergebnis genau einmal melden.
  useEffect(() => {
    if (!amEnde || gemeldet.current) return
    gemeldet.current = true
    fertig({
      prozent: uebungen.length ? Math.round((punkte / uebungen.length) * 100) : 0,
      richtig: punkte,
      gesamt: uebungen.length,
      fehler,
    })
  }, [amEnde])

  // Hörübungen spielen automatisch ab.
  useEffect(() => {
    if (u && u.art === 'hoeren' && antwort === null) spieleWort(u.frage)
  }, [index])

  useEffect(() => {
    if (u && u.art === 'tippen' && antwort === null) feldRef.current?.focus()
  }, [index, u, antwort])

  // Nach dem Antworten wandert der Fokus auf „Weiter" — sonst landet er beim
  // Klick auf einen deaktivierten Knopf am Seitenanfang und die Tastatur-
  // Bedienung bricht ab.
  useEffect(() => {
    if (antwort !== null) weiterRef.current?.focus()
  }, [antwort])

  if (amEnde || !u) {
    return (
      <div className="rk-uebung-ende" role="status" aria-live="polite">
        <HeloMascot variante="feiern" groesse={110} dekorativ />
        <p>Sitzung abgeschlossen.</p>
      </div>
    )
  }

  const richtigGewaehlt = antwort !== null && antwort === u.antwort
  const skill = SKILL_JE_ART[u.art] || 'erkennen'
  // Nur bei 'wahl-ku' stehen Kurmancî-Wörter zur Auswahl, sonst deutsche.
  const optionenKu = u.art === 'wahl-ku'
  const bedeutung = bedeutungZurAntwort(u)
  const hinweis = ausspracheHinweis(u.w.ku)

  function bewerten(richtig) {
    const sekunden = Math.min(120, Math.round((Date.now() - startZeit.current) / 1000))
    startZeit.current = Date.now()
    if (richtig) {
      setPunkte((p) => p + 1)
      gibXp(XP_JE_AUFGABE)
    } else {
      setLeben((l) => Math.max(0, l - 1))
      setFehler((f) => [...f, { de: u.w.de, ku: u.w.ku, bild: u.w.bild }])
    }
    karteBewerten(u.w.de, u.w.ku, skill, richtig)
    zaehleAufgabe(richtig, sekunden, skill)
  }

  function waehle(option) {
    if (antwort !== null) return
    setAntwort(option)
    bewerten(option === u.antwort)
  }

  function pruefeTipp(e) {
    e.preventDefault()
    if (antwort !== null) return
    const ok = istRichtigGetippt(eingabe, u.antwort)
    setAntwort(ok ? u.antwort : eingabe || '(leer)')
    bewerten(ok)
  }

  function weiter() {
    setAntwort(null)
    setEingabe('')
    setIndex((i) => i + 1)
  }

  return (
    <div className={`rk-uebung rk-uebung-${stil}`}>
      <div className="rk-uebung-kopf">
        {abbrechen && (
          <button type="button" className="rk-uebung-schliessen" onClick={abbrechen} aria-label="Sitzung beenden">
            <Icon name="kreuz" groesse={20} />
          </button>
        )}
        <ProgressBar
          wert={index}
          max={uebungen.length}
          label={`Fortschritt der Sitzung: Aufgabe ${index + 1} von ${uebungen.length}`}
          farbe={stil === 'abenteuer' ? 'gold' : 'primary'}
        />
        <span className="rk-uebung-xp">
          <Icon name="stern" groesse={16} />
          {punkte * XP_JE_AUFGABE} XP
        </span>
        {mitLeben && (
          <span className="rk-leben">
            <span aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Icon key={i} name="herz" groesse={18} className={i < leben ? 'voll' : 'leer'} />
              ))}
            </span>
            <small className="rk-leben-zahl">{leben}/3</small>
            <span className="nur-sr" role="status">
              {leben} von 3 Leben übrig
            </span>
          </span>
        )}
      </div>

      <p className="rk-uebung-zeile">
        {titel} · {T.uebung.aufgabe} {index + 1} {T.uebung.von} {uebungen.length}
      </p>

      {/* ---- Bildaufgabe: Frage auf Kurmancî, Antwort ist ein Wort-Bild ---- */}
      {u.art === 'bild' && (
        <>
          <h2 className="rk-frage">
            Welches Bild passt zu „<strong lang="ku">{u.frage}</strong>“?
          </h2>
          <HoerKnopf wort={u.frage} />
          <div className="rk-optionen rk-optionen-bild">
            {u.optionen.map((opt, i) => {
              const foto = opt.ku ? fotoVon(opt.ku) : null
              return (
                <button
                  key={opt.bild}
                  type="button"
                  className={'rk-option rk-option-bild' + zustand(opt.bild, antwort, u.antwort)}
                  onClick={() => waehle(opt.bild)}
                  disabled={antwort !== null}
                  aria-label={foto ? foto.alt : `Bildoption ${i + 1}`}
                >
                  {foto ? (
                    <img className="rk-option-foto" src={foto.src} alt="" loading="lazy" />
                  ) : (
                    <span className="rk-option-emoji" aria-hidden="true">
                      {opt.bild}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ---- Auswahlaufgaben ---- */}
      {(u.art === 'hoeren' || u.art === 'wahl-de' || u.art === 'wahl-ku') && (
        <>
          {u.art === 'hoeren' ? (
            <>
              <h2 className="rk-frage">Höre das kurmancîsche Wort. Was bedeutet es auf Deutsch?</h2>
              <HoerKnopf wort={u.frage} gross />
            </>
          ) : (
            <>
              <h2 className="rk-frage">
                {/* Das Wort-Bild steht nur bei „wahl-ku" neben der Frage. Bei
                    „wahl-de" wird die deutsche Bedeutung gesucht — das Bild
                    würde sie verraten. */}
                {u.w.bild && u.art === 'wahl-ku' && (
                  <span className="rk-frage-bild" aria-hidden="true">
                    {fotoVon(u.w.ku) ? (
                      <img src={fotoVon(u.w.ku).src} alt="" loading="lazy" />
                    ) : (
                      u.w.bild
                    )}
                  </span>
                )}
                {u.art === 'wahl-ku' ? (
                  <>
                    Wie sagt man „<strong lang="de">{u.frage}</strong>“ auf Kurmancî?
                  </>
                ) : (
                  <>
                    Was bedeutet „<strong lang="ku">{u.frage}</strong>“ auf Deutsch?
                  </>
                )}
              </h2>
              {u.art === 'wahl-de' && <HoerKnopf wort={u.w.ku} />}
            </>
          )}
          <div className="rk-optionen rk-optionen-liste">
            {u.optionen.map((opt, i) => (
              <button
                key={opt}
                type="button"
                className={'rk-option rk-option-karte' + zustand(opt, antwort, u.antwort)}
                onClick={() => waehle(opt)}
                disabled={antwort !== null}
              >
                <span className="rk-option-buchstabe" aria-hidden="true">
                  {BUCHSTABEN[i]}
                </span>
                <span className="rk-option-text">
                  <strong lang={u.art === 'wahl-ku' ? 'ku' : 'de'}>{opt}</strong>
                  {untertitel(opt, optionenKu) && <small>{untertitel(opt, optionenKu)}</small>}
                </span>
                {antwort !== null && opt === u.antwort && <Icon name="haken" groesse={20} className="rk-option-haken" />}
                {antwort !== null && opt === antwort && opt !== u.antwort && (
                  <Icon name="kreuz" groesse={20} className="rk-option-kreuz" />
                )}
              </button>
            ))}
          </div>
          {u.art === 'hoeren' && antwort !== null && (
            <p className="gedaempft">
              Das Wort war: <strong lang="ku">{u.frage}</strong>
            </p>
          )}
        </>
      )}

      {/* ---- Tippaufgabe: deutsches Wort vorgeben, Kurmancî tippen ---- */}
      {u.art === 'tippen' && (
        <>
          <h2 className="rk-frage" id="tipp-frage">
            {u.w.bild && (
              <span className="rk-frage-bild" aria-hidden="true">
                {u.w.bild}
              </span>
            )}
            Schreibe „<strong lang="de">{u.frage}</strong>“ auf Kurmancî.
          </h2>
          <form onSubmit={pruefeTipp} className="rk-tippzeile">
            <label className="nur-sr" htmlFor="tipp-feld">
              Antwort auf Kurmancî eingeben
            </label>
            <input
              id="tipp-feld"
              ref={feldRef}
              className="rk-feld"
              lang="ku"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              placeholder="Antwort tippen …"
              disabled={antwort !== null}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-describedby="tipp-frage"
            />
            <PrimaryButton type="submit" disabled={antwort !== null}>
              {T.uebung.pruefen}
            </PrimaryButton>
          </form>
          <SpecialChars einfuegen={(z) => setEingabe((e) => e + z)} />
        </>
      )}

      {/* ---- Rueckmeldung ---- */}
      <div aria-live="polite" className="rk-rueckmeldung-bereich">
        {antwort !== null && (
          <div className={'rk-rueckmeldung ' + (richtigGewaehlt ? 'gut' : 'schlecht')}>
            <HeloMascot variante={richtigGewaehlt ? 'daumen' : 'traurig'} groesse={58} dekorativ />
            <div>
              {richtigGewaehlt ? (
                <>
                  <strong>{T.uebung.richtig}</strong> {T.uebung.richtigText}
                  <div className="rk-rueckmeldung-xp">+{XP_JE_AUFGABE} XP</div>
                </>
              ) : (
                <>
                  <strong>{T.uebung.falsch}</strong>
                  <div>
                    {T.uebung.falschText}:{' '}
                    <strong lang={antwortIstKurmanci(u.art) ? 'ku' : 'de'}>{u.antwort}</strong>
                  </div>
                  {bedeutung && (
                    <div className="gedaempft" lang={bedeutung.sprache}>
                      {bedeutung.text}
                    </div>
                  )}
                  {hinweis && <div className="gedaempft">{hinweis}</div>}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {antwort !== null && (
        <PrimaryButton
          ref={weiterRef}
          breit
          groesse="gross"
          art={richtigGewaehlt ? 'gruen' : 'primaer'}
          onClick={weiter}
        >
          {T.uebung.weiter}
        </PrimaryButton>
      )}

      {/* Bei „wahl-ku" und „tippen" ist das kurmancîsche Wort die gesuchte
          Antwort — vorgesprochen würde der Tonknopf sie verraten. Dort taucht
          er erst nach dem Antworten auf, sonst von Anfang an. */}
      {(!antwortIstKurmanci(u.art) || antwort !== null) && (
        <p className="rk-tipp">
          <Icon name="info" groesse={16} />
          Tipp: Höre dir die Aussprache an und sprich laut mit.
          <button
            type="button"
            className="rk-tonknopf"
            onClick={() => spieleWort(u.w.ku)}
            aria-label={`${u.w.ku} anhören`}
          >
            <Icon name="lautsprecher" groesse={18} />
          </button>
        </p>
      )}
    </div>
  )
}

function zustand(option, antwort, richtig) {
  if (antwort === null) return ''
  if (option === richtig) return ' richtig'
  if (option === antwort) return ' falsch'
  return ' blass'
}

function HoerKnopf({ wort, gross = false }) {
  return (
    <button
      type="button"
      className={'rk-hoerknopf' + (gross ? ' gross' : '')}
      onClick={() => spieleWort(wort)}
      aria-label={T.uebung.anhoeren}
    >
      <Icon name="lautsprecher" groesse={gross ? 28 : 20} />
      <span>{T.uebung.anhoeren}</span>
    </button>
  )
}
