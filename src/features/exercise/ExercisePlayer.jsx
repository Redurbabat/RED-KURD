// Die gemeinsame Übungsoberfläche. Modern-Modus und Abenteuer-Modus nutzen
// exakt diese Komponente — nur die Klasse `stil` ändert das Aussehen.
import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import SpecialChars from '../../components/common/SpecialChars.jsx'
import HeloMascot from '../../components/mascot/HeloMascot.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { spieleWort } from '../../core/audio/audioService.js'
import { istRichtigGetippt, SKILL_JE_ART } from '../../core/session/exerciseFactory.js'
import { gibXp, karteBewerten, zaehleAufgabe } from '../../core/progress/progressStore.js'
import { deutschVon, kurmanciVon } from '../../core/courses/courseRepository.js'
import { sitzungSpeichern, sitzungLoeschen } from '../../core/session/sessionStore.js'
import { T } from '../../core/texts.js'

const BUCHSTABEN = ['A', 'B', 'C', 'D']
const XP_JE_AUFGABE = 10

function untertitel(option) {
  return deutschVon(option) || kurmanciVon(option) || ''
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
  const startZeit = useRef(Date.now())
  const gemeldet = useRef(false)

  const u = uebungen[index]
  const amEnde = index >= uebungen.length

  // Sitzung nach jeder Aufgabe sichern, damit ein Reload nichts verliert.
  useEffect(() => {
    if (!speichern) return
    if (amEnde) sitzungLoeschen()
    else sitzungSpeichern({ titel, index, punkte, uebungen: schlank(uebungen) })
  }, [index, amEnde, speichern, titel])

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
          <span className="rk-leben" aria-label={`${leben} von 3 Leben übrig`}>
            {[0, 1, 2].map((i) => (
              <Icon key={i} name="herz" groesse={18} className={i < leben ? 'voll' : 'leer'} />
            ))}
          </span>
        )}
      </div>

      <p className="rk-uebung-zeile">
        {titel} · {T.uebung.aufgabe} {index + 1} {T.uebung.von} {uebungen.length}
      </p>

      {/* ---- Bildaufgabe ---- */}
      {u.art === 'bild' && (
        <>
          <h2 className="rk-frage">
            Welches Bild passt zu <strong lang="ku">{u.frage}</strong>?
          </h2>
          <HoerKnopf wort={u.frage} />
          <div className="rk-optionen rk-optionen-bild">
            {u.optionen.map((opt) => (
              <button
                key={opt.bild}
                type="button"
                className={'rk-option rk-option-bild' + zustand(opt.bild, antwort, u.antwort)}
                onClick={() => waehle(opt.bild)}
                disabled={antwort !== null}
                aria-label={`Bild ${opt.bild}`}
              >
                <span className="rk-option-emoji" aria-hidden="true">
                  {opt.bild}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ---- Auswahlaufgaben ---- */}
      {(u.art === 'hoeren' || u.art === 'wahl-de' || u.art === 'wahl-ku') && (
        <>
          {u.art === 'hoeren' ? (
            <>
              <h2 className="rk-frage">Was hörst du?</h2>
              <HoerKnopf wort={u.frage} gross />
            </>
          ) : (
            <>
              <h2 className="rk-frage">
                {u.w.bild && (
                  <span className="rk-frage-bild" aria-hidden="true">
                    {u.w.bild}
                  </span>
                )}
                Wie sagt man{' '}
                <strong lang={u.art === 'wahl-de' ? 'ku' : 'de'}>{u.frage}</strong>?
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
                  {untertitel(opt) && <small>{untertitel(opt)}</small>}
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

      {/* ---- Tippaufgabe ---- */}
      {u.art === 'tippen' && (
        <>
          <h2 className="rk-frage" id="tipp-frage">
            {u.w.bild && (
              <span className="rk-frage-bild" aria-hidden="true">
                {u.w.bild}
              </span>
            )}
            Tippe auf Kurmancî: <strong lang="de">{u.frage}</strong>
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
                  <strong>{T.uebung.falsch}</strong> {T.uebung.falschText}:{' '}
                  <strong lang={u.art === 'tippen' || u.art === 'wahl-ku' ? 'ku' : 'de'}>{u.antwort}</strong>
                  {u.art !== 'tippen' && untertitel(u.antwort) && <div className="gedaempft">{untertitel(u.antwort)}</div>}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {antwort !== null && (
        <PrimaryButton breit groesse="gross" art={richtigGewaehlt ? 'gruen' : 'primaer'} onClick={weiter} autoFocus>
          {T.uebung.weiter}
        </PrimaryButton>
      )}

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
