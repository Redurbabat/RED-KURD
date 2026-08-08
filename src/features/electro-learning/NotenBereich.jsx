// Noten der Elektro-Lehre: Fächer mit Schnitt, Ziel und Trend, Noten
// eintragen und löschen. Alle Rechnungen kommen aus core/elektro —
// hier wird nur angezeigt.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { useLernstand } from '../../core/store.ts'
import * as schule from '../../core/elektro/schuleStore.ts'
import {
  SKALEN,
  benoetigteNote,
  besteNote,
  gerundet,
  halbeNote,
  istBestanden,
  istGueltigeNote,
  schlechtesteNote,
  trend,
} from '../../core/elektro/notenRechnung.js'

const TREND_TEXT = {
  besser: 'Trend: aufwärts',
  schlechter: 'Trend: abwärts',
  gleich: 'Trend: stabil',
  zuwenig: '',
}

export default function NotenBereich() {
  useLernstand()
  const [offenesFach, setOffenesFach] = useState(null)
  const [neu, setNeu] = useState({ note: '', thema: '', gewicht: '1', datum: '' })
  const [fehler, setFehler] = useState('')
  const [neuesFach, setNeuesFach] = useState('')

  const aktuelleSkala = schule.skala()
  const faecher = schule.faecher()
  const gesamt = schule.gesamtschnitt()

  function eintragen(fachId) {
    if (!istGueltigeNote(neu.note, aktuelleSkala)) {
      setFehler(`Bitte eine Note zwischen ${SKALEN[aktuelleSkala].min} und ${SKALEN[aktuelleSkala].max} eintragen.`)
      return
    }
    schule.noteHinzufuegen({ ...neu, fachId })
    setNeu({ note: '', thema: '', gewicht: '1', datum: '' })
    setFehler('')
    // Formular schliessen: Der neue Schnitt soll sofort sichtbar sein.
    setOffenesFach(null)
  }

  return (
    <div className="el-noten">
      <Card titel="Alle Fächer" icon="fortschritt">
        <p className="el-gross">
          Gesamtschnitt: <strong>{gesamt === null ? '—' : gerundet(gesamt, 2)}</strong>
          {gesamt !== null && (
            <span className="el-meta"> · Zeugnis gerundet: {halbeNote(gesamt)}</span>
          )}
        </p>
        <label className="rk-feld-label" htmlFor="el-skala">
          Notenskala
        </label>
        <select
          id="el-skala"
          className="rk-feld el-skala"
          value={aktuelleSkala}
          onChange={(e) => schule.setzeSkala(e.target.value)}
        >
          {Object.values(SKALEN).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Card>

      {faecher.map((fach) => {
        const notenDesFachs = schule.notenFuerFach(fach.id)
        const schnitt = schule.schnittFuerFach(fach.id)
        const richtung = trend(notenDesFachs, aktuelleSkala)
        const ziel = fach.zielnote ? benoetigteNote(notenDesFachs, fach.zielnote, 1, aktuelleSkala) : null
        const offen = offenesFach === fach.id

        return (
          <Card key={fach.id} className="el-fach">
            <div className="el-fach-kopf">
              <h3>{fach.name}</h3>
              {schnitt === null ? (
                <Badge ton="neutral">noch keine Note</Badge>
              ) : (
                <Badge ton={istBestanden(schnitt, aktuelleSkala) ? 'gruen' : 'rot'}>
                  Ø {gerundet(schnitt, 2)}
                </Badge>
              )}
            </div>

            {notenDesFachs.length > 0 && (
              <p className="el-meta">
                {notenDesFachs.length} {notenDesFachs.length === 1 ? 'Note' : 'Noten'} · beste{' '}
                {besteNote(notenDesFachs, aktuelleSkala)} · schlechteste{' '}
                {schlechtesteNote(notenDesFachs, aktuelleSkala)}
                {TREND_TEXT[richtung] ? ` · ${TREND_TEXT[richtung]}` : ''}
              </p>
            )}

            {fach.zielnote && ziel && (
              <p className="el-ziel">
                <Icon name="stern" groesse={14} /> Zielnote {fach.zielnote}:{' '}
                {ziel.schonErreicht
                  ? 'schon erreicht — weiter so!'
                  : ziel.machbar
                    ? `nächste Prüfung mindestens ${gerundet(ziel.note, 2)}`
                    : 'mit einer Prüfung nicht mehr erreichbar — mehrere Noten nötig'}
              </p>
            )}

            <ul className="el-notenliste">
              {notenDesFachs.map((n) => (
                <li key={n.id}>
                  <span className="el-note-wert">{n.note}</span>
                  <span className="el-note-text">
                    {n.thema || 'ohne Thema'}
                    {n.gewicht && Number(n.gewicht) !== 1 ? ` · Gewicht ${n.gewicht}` : ''}
                    {n.datum ? ` · ${n.datum}` : ''}
                  </span>
                  <button
                    type="button"
                    className="el-loeschen"
                    aria-label={`Note ${n.note} löschen`}
                    onClick={() => schule.noteEntfernen(n.id)}
                  >
                    <Icon name="muell" groesse={16} />
                  </button>
                </li>
              ))}
            </ul>

            {offen ? (
              <div className="el-formular">
                <label className="rk-feld-label" htmlFor={`note-${fach.id}`}>
                  Note ({SKALEN[aktuelleSkala].min}–{SKALEN[aktuelleSkala].max})
                </label>
                <input
                  id={`note-${fach.id}`}
                  className="rk-feld"
                  inputMode="decimal"
                  value={neu.note}
                  placeholder="z. B. 5"
                  onChange={(e) => setNeu({ ...neu, note: e.target.value })}
                />
                <label className="rk-feld-label" htmlFor={`thema-${fach.id}`}>
                  Thema
                </label>
                <input
                  id={`thema-${fach.id}`}
                  className="rk-feld"
                  value={neu.thema}
                  placeholder="z. B. Ohmsches Gesetz"
                  onChange={(e) => setNeu({ ...neu, thema: e.target.value })}
                />
                <div className="el-formular-reihe">
                  <span>
                    <label className="rk-feld-label" htmlFor={`gewicht-${fach.id}`}>
                      Gewicht
                    </label>
                    <input
                      id={`gewicht-${fach.id}`}
                      className="rk-feld"
                      inputMode="decimal"
                      value={neu.gewicht}
                      onChange={(e) => setNeu({ ...neu, gewicht: e.target.value })}
                    />
                  </span>
                  <span>
                    <label className="rk-feld-label" htmlFor={`datum-${fach.id}`}>
                      Datum
                    </label>
                    <input
                      id={`datum-${fach.id}`}
                      className="rk-feld"
                      type="date"
                      value={neu.datum}
                      onChange={(e) => setNeu({ ...neu, datum: e.target.value })}
                    />
                  </span>
                </div>
                {fehler && (
                  <p className="rk-fehler" role="alert">
                    {fehler}
                  </p>
                )}
                <div className="el-formular-knoepfe">
                  <PrimaryButton icon="haken" onClick={() => eintragen(fach.id)}>
                    Note speichern
                  </PrimaryButton>
                  <PrimaryButton
                    art="still"
                    onClick={() => {
                      setOffenesFach(null)
                      setFehler('')
                    }}
                  >
                    Abbrechen
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <PrimaryButton
                art="still"
                icon="plus"
                onClick={() => {
                  setOffenesFach(fach.id)
                  setFehler('')
                }}
              >
                Note eintragen
              </PrimaryButton>
            )}
          </Card>
        )
      })}

      <Card titel="Fach hinzufügen" icon="plus">
        <label className="rk-feld-label" htmlFor="el-neues-fach">
          Name des Fachs
        </label>
        <input
          id="el-neues-fach"
          className="rk-feld"
          value={neuesFach}
          placeholder="z. B. Englisch"
          onChange={(e) => setNeuesFach(e.target.value)}
        />
        <PrimaryButton
          art="still"
          icon="plus"
          onClick={() => {
            if (schule.fachHinzufuegen({ name: neuesFach })) setNeuesFach('')
          }}
        >
          Fach anlegen
        </PrimaryButton>
      </Card>
    </div>
  )
}
