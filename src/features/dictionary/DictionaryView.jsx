// Wörterbuch: sucht zuerst im lokalen Server, dann in den statischen JSON-Daten
// und zuletzt im mitgelieferten Grundwortschatz. Treffer erscheinen als Karten
// mit Anhören, Merken und Beispielsätzen.
import { useRef, useState } from 'react'
import { useLernstand } from '../../core/store.js'
import { merkeWort, kennstWort } from '../../core/progress/progressStore.js'
import { spieleWort } from '../../core/audio/audioService.js'
import { arabischNachLatein } from '../../core/schrift/transliteration.js'
import { sucheStatisch, beispieleStatisch } from '../../core/data/staticData.js'
import { woerter as grundwortschatz } from '../../data/woerter.js'
import { T } from '../../core/texts.js'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import Badge from '../../components/common/Badge.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import SpecialChars from '../../components/common/SpecialChars.jsx'
import EmptyState, { LoadingState, ErrorState } from '../../components/common/EmptyState.jsx'
import './DictionaryView.css'

const SPRACHNAMEN = {
  deu: 'Deutsch',
  kur: 'Kurdisch',
  kmr: 'Kurmancî',
  ckb: 'Soranî',
  zza: 'Zazakî',
  eng: 'Englisch',
}
const KURDISCH = new Set(['kur', 'kmr', 'ckb', 'zza'])
const SCHRITT = 20

/** Diese Sprachen zeigt RED-KURD bewusst nicht an. */
const AUSGESCHLOSSEN = new Set(['tur', 'tr', 'ota', 'azj'])

function ohneFremdsprache(w) {
  return !AUSGESCHLOSSEN.has(w.lang) && !AUSGESCHLOSSEN.has(w.ziel_lang)
}

function spracheName(code) {
  return SPRACHNAMEN[code] || code || 'unbekannt'
}

/** Sprachkennzeichen fuer das lang-Attribut. */
function htmlLang(code) {
  if (code === 'deu') return 'de'
  if (code === 'eng') return 'en'
  return 'ku'
}

/**
 * Aus einem Treffer das Paar Deutsch/Kurmancî fuer das Wiederholsystem bilden.
 * Gemerkt wird nur, wenn wirklich Deutsch auf Kurdisch trifft — Paare aus
 * anderen Sprachen gehoeren nicht in den Kurs.
 */
function paarVon(w) {
  const kurdischLinks = KURDISCH.has(w.lang)
  const paar = kurdischLinks
    ? { ku: w.wort || '', de: w.uebersetzung || '' }
    : { de: w.wort || '', ku: w.uebersetzung || '' }
  paar.kurdisch = kurdischLinks || KURDISCH.has(w.ziel_lang)
  paar.deutsch = w.lang === 'deu' || w.ziel_lang === 'deu'
  return paar
}

/** Sprachpaar fuer die Beispielsatz-Abfrage (die Datenbank kennt nur kmr/deu). */
function satzSprachen(lang) {
  if (lang === 'deu') return { quelle: 'deu', ziel: 'kmr' }
  if (lang === 'kur') return { quelle: 'kmr', ziel: 'deu' }
  return { quelle: lang || 'kmr', ziel: 'deu' }
}

export default function DictionaryView() {
  useLernstand()

  const [suche, setSuche] = useState('')
  const [frage, setFrage] = useState('')
  const [ergebnis, setErgebnis] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState(false)
  const [ausGrundwortschatz, setAusGrundwortschatz] = useState(false)
  const [vorschlaege, setVorschlaege] = useState([])
  const [beispiele, setBeispiele] = useState({})
  const [anzahl, setAnzahl] = useState(SCHRITT)
  const lauf = useRef(0)

  /** Letzte Rettung, wenn weder Server noch statische Daten erreichbar sind. */
  function ausStartwoertern(q) {
    const s = q.toLowerCase()
    return grundwortschatz
      .filter((w) => w.de.toLowerCase().includes(s) || w.ku.toLowerCase().includes(s))
      .map((w) => ({
        lang: 'deu',
        wort: w.de,
        ziel_lang: 'kmr',
        uebersetzung: w.ku,
        quelle: 'grundwortschatz',
      }))
  }

  async function suchen(e, direkt) {
    if (e) e.preventDefault()
    let q = (direkt !== undefined ? direkt : suche).trim()
    if (!q) return

    // Arabische Schrift zuerst nach Latein umwandeln und damit weitersuchen.
    if (/[\u0600-\u06FF]/.test(q)) {
      const lat = arabischNachLatein(q).trim()
      if (lat) q = lat
    }
    setSuche(q)
    setFrage(q)
    setLaedt(true)
    setFehler(false)
    setAusGrundwortschatz(false)
    setVorschlaege([])
    setBeispiele({})
    setAnzahl(SCHRITT)

    const nr = ++lauf.current
    let daten = null

    try {
      const r = await fetch('/api/suche?q=' + encodeURIComponent(q))
      if (r.ok) {
        const d = await r.json()
        if (!d.fehler) daten = d
      }
    } catch {
      /* Lokaler Server laeuft nicht — weiter mit den statischen Daten. */
    }

    if (!daten) {
      try {
        daten = await sucheStatisch(q)
      } catch {
        /* Auch die statischen Daten fehlen. */
      }
    }

    if (nr !== lauf.current) return

    if (!daten) {
      const treffer = ausStartwoertern(q)
      if (treffer.length > 0) {
        setErgebnis({ woerter: treffer, wiki: [] })
        setAusGrundwortschatz(true)
      } else {
        setErgebnis(null)
        setFehler(true)
      }
      setLaedt(false)
      return
    }

    const sauber = {
      woerter: (daten.woerter || []).filter(ohneFremdsprache),
      wiki: (daten.wiki || []).filter(ohneFremdsprache),
    }
    setErgebnis(sauber)

    if (sauber.woerter.length === 0 && sauber.wiki.length === 0) {
      try {
        const rv = await fetch('/api/aehnlich?q=' + encodeURIComponent(q))
        if (rv.ok) {
          const dv = await rv.json()
          if (nr === lauf.current) setVorschlaege(dv.vorschlaege || [])
        }
      } catch {
        /* Rechtschreibhilfe gibt es nur mit lokalem Server. */
      }
    }
    if (nr === lauf.current) setLaedt(false)
  }

  async function zeigeBeispiele(schluessel, w) {
    if (beispiele[schluessel]) {
      setBeispiele((b) => {
        const neu = { ...b }
        delete neu[schluessel]
        return neu
      })
      return
    }
    setBeispiele((b) => ({ ...b, [schluessel]: { laedt: true, saetze: [] } }))
    const { quelle, ziel } = satzSprachen(w.lang)
    let saetze = null
    try {
      const r = await fetch(
        `/api/beispiele?q=${encodeURIComponent(w.wort)}&lang=${quelle}&ziel=${ziel}`
      )
      if (r.ok) {
        const d = await r.json()
        if (!d.fehler) saetze = d.saetze || []
      }
    } catch {
      /* Server aus */
    }
    if (!saetze) {
      try {
        saetze = await beispieleStatisch(w.wort)
      } catch {
        saetze = null
      }
    }
    setBeispiele((b) => ({
      ...b,
      [schluessel]: { laedt: false, saetze: saetze || [], fehler: saetze === null },
    }))
  }

  const treffer = ergebnis ? ergebnis.woerter : []
  const wiki = ergebnis ? ergebnis.wiki : []
  const nichtsGefunden = ergebnis !== null && treffer.length === 0 && wiki.length === 0

  return (
    <>
      {/* Der Tab nennt den Bereich schon — die Überschrift haelt die Gliederung sauber. */}
      <h2 className="nur-sr">Wörterbuch</h2>

      <form className="rk-suchzeile dict-suchzeile" onSubmit={suchen} role="search">
        <label className="nur-sr" htmlFor="dict-suche">
          Wort auf Deutsch oder Kurmancî suchen
        </label>
        <input
          id="dict-suche"
          className="rk-feld"
          type="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={suche}
          placeholder={T.entdecken.suchePlatzhalter}
          onChange={(e) => setSuche(e.target.value)}
        />
        <PrimaryButton type="submit" icon="suche">
          {T.entdecken.suchen}
        </PrimaryButton>
      </form>

      <SpecialChars einfuegen={(z) => setSuche((s) => s + z)} />

      {!ergebnis && !laedt && !fehler && (
        <p className="rk-hinweisstreifen dict-hinweis">
          <Icon name="info" groesse={18} />
          <span>
            Durchsucht rund 840.000 Wortpaare, die Wiktionary-Einträge und Millionen
            Beispielsätze. Arabische Schrift wird automatisch in lateinische Schrift
            umgewandelt.
          </span>
        </p>
      )}

      {laedt && <LoadingState text="Wird gesucht …" />}

      {fehler && !laedt && (
        <ErrorState
          titel="Die Suche hat nicht geklappt."
          text="Weder der lokale Server noch die Wörterdaten waren erreichbar."
          nochmal={() => suchen(null, frage)}
        />
      )}

      {ausGrundwortschatz && !laedt && (
        <p className="rk-hinweisstreifen dict-hinweis">
          <Icon name="warnung" groesse={18} />
          <span>
            Die grosse Wörterdatenbank ist gerade nicht erreichbar. Angezeigt wird der
            Grundwortschatz der App.
          </span>
        </p>
      )}

      {nichtsGefunden && !laedt && (
        <>
          <EmptyState
            titel={`Nichts gefunden für „${frage}“`}
            text="Vielleicht ist es eine gebeugte Form oder ein Tippfehler. Versuche die Grundform des Wortes."
            variante="denken"
          />
          {vorschlaege.length > 0 && (
            <Card titel="Meintest du …?" icon="gehirn">
              <ul className="rk-wortliste dict-vorschlaege" role="list">
                {vorschlaege.map((v) => (
                  <li key={v}>
                    <button
                      type="button"
                      className="rk-wortchip"
                      onClick={() => suchen(null, v)}
                      aria-label={`Stattdessen nach ${v} suchen`}
                    >
                      <span lang="ku">{v}</span>
                      <Icon name="suche" groesse={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {treffer.length > 0 && !laedt && (
        <section className="rk-abschnitt" aria-labelledby="dict-treffer-titel">
          <h2 className="rk-abschnitt-titel" id="dict-treffer-titel">
            Treffer für „{frage}“{' '}
            <Badge ton="teal">
              {treffer.length} {treffer.length === 1 ? 'Eintrag' : 'Einträge'}
            </Badge>
          </h2>

          <ul className="dict-liste" role="list">
            {treffer.slice(0, anzahl).map((w, i) => {
              const schluessel = `${i}-${w.wort}`
              const paar = paarVon(w)
              const kannMerken = !!paar.de && !!paar.ku && paar.kurdisch && paar.deutsch
              const kannHoeren = !!paar.ku && paar.kurdisch
              const gemerkt = kannMerken && kennstWort(paar.de, paar.ku)
              const offen = beispiele[schluessel]
              return (
                <li key={schluessel}>
                  <Card className="dict-karte">
                    <p className="dict-paar">
                      <span className="dict-wort" lang={htmlLang(w.lang)}>
                        {w.wort}
                      </span>
                      <Icon name="pfeilRechts" groesse={18} className="dict-pfeil" />
                      <span className="dict-ueb" lang={htmlLang(w.ziel_lang)}>
                        {w.uebersetzung}
                      </span>
                    </p>
                    <p className="dict-richtung">
                      {spracheName(w.lang)} → {spracheName(w.ziel_lang)}
                      {w.quelle ? ` · Quelle: ${w.quelle}` : ''}
                    </p>

                    <div className="reihe-umbruch dict-knoepfe">
                      <PrimaryButton
                        art="still"
                        groesse="klein"
                        icon="lautsprecher"
                        disabled={!kannHoeren}
                        onClick={() => spieleWort(paar.ku)}
                      >
                        {T.entdecken.anhoeren}
                      </PrimaryButton>
                      <PrimaryButton
                        art={gemerkt ? 'still' : 'gruen'}
                        groesse="klein"
                        icon={gemerkt ? 'haken' : 'plus'}
                        disabled={!kannMerken || gemerkt}
                        onClick={() => merkeWort(paar.de, paar.ku)}
                      >
                        {gemerkt ? 'Gemerkt' : T.entdecken.merken}
                      </PrimaryButton>
                      <PrimaryButton
                        art="still"
                        groesse="klein"
                        icon="sprechblase"
                        aria-expanded={!!offen}
                        onClick={() => zeigeBeispiele(schluessel, w)}
                      >
                        {offen ? 'Beispielsätze verbergen' : 'Beispielsätze'}
                      </PrimaryButton>
                    </div>

                    {offen && offen.laedt && <LoadingState text="Sätze werden gesucht …" />}
                    {offen && !offen.laedt && (
                      <>
                        {offen.saetze.length === 0 && (
                          <p className="gedaempft dict-keine-saetze">
                            {offen.fehler
                              ? 'Die Beispielsätze sind gerade nicht erreichbar.'
                              : `Keine Beispielsätze mit „${w.wort}“ gefunden.`}
                          </p>
                        )}
                        {offen.saetze.length > 0 && (
                          <ul className="dict-beispiele" role="list">
                            {offen.saetze.map((s, k) => (
                              <li key={k}>
                                <span className="dict-satz-ku" lang="ku">
                                  {s.satz}
                                </span>
                                <span className="dict-satz-de" lang="de">
                                  {s.uebersetzung}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </Card>
                </li>
              )
            })}
          </ul>

          {treffer.length > anzahl && (
            <PrimaryButton
              art="still"
              icon="pfeilRunter"
              onClick={() => setAnzahl((n) => n + SCHRITT)}
            >
              Weitere {Math.min(SCHRITT, treffer.length - anzahl)} Einträge anzeigen
            </PrimaryButton>
          )}
        </section>
      )}

      {wiki.length > 0 && !laedt && (
        <Card titel="Aus dem Wiktionary" icon="buch">
          <ul className="dict-wiki" role="list">
            {wiki.map((w, i) => (
              <li key={`${i}-${w.wort}`}>
                <p className="dict-wiki-kopf">
                  <span className="dict-wiki-wort" lang={htmlLang(w.lang)}>
                    {w.wort}
                  </span>
                  <Badge>{spracheName(w.lang)}</Badge>
                  {w.wortart && <Badge ton="lila">{w.wortart}</Badge>}
                </p>
                {w.ipa && (
                  <p className="dict-wiki-meta">
                    Aussprache: <span lang="ku">{w.ipa}</span>
                  </p>
                )}
                {w.bedeutungen && <p className="dict-wiki-bedeutung">{w.bedeutungen}</p>}
                {w.formen && <p className="dict-wiki-meta">Formen: {w.formen}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
