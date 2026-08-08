// Prüfungen: was kommt wann, wie weit bin ich beim Lernen.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { useLernstand } from '../../core/store.js'
import { heute } from '../../core/progress/scheduler.ts'
import * as schule from '../../core/elektro/schuleStore.js'
import { tageBis } from '../../core/elektro/notenRechnung.js'

const TON = {
  'Nicht begonnen': 'neutral',
  'Am Lernen': 'gold',
  Wiederholen: 'lila',
  Bereit: 'gruen',
  Erledigt: 'blau',
}

/** „in 5 Tagen", „heute", „vorbei" — Zeit in Worten statt nur als Datum. */
export function zeitText(datum, heuteWert) {
  const tage = tageBis(datum, heuteWert)
  if (tage === null) return ''
  if (tage === 0) return 'heute'
  if (tage === 1) return 'morgen'
  if (tage > 1) return `in ${tage} Tagen`
  return 'vorbei'
}

export default function PruefungenBereich() {
  useLernstand()
  const [neu, setNeu] = useState({ titel: '', fachId: '', datum: '', themen: '' })
  const [offen, setOffen] = useState(false)

  const heuteWert = heute()
  const faecher = schule.faecher()
  const liste = [...schule.pruefungen()].sort((a, b) =>
    String(a.datum || '9999').localeCompare(String(b.datum || '9999'))
  )

  function speichern() {
    if (!neu.titel.trim()) return
    schule.pruefungHinzufuegen(neu)
    setNeu({ titel: '', fachId: '', datum: '', themen: '' })
    setOffen(false)
  }

  return (
    <div className="el-pruefungen">
      {liste.length === 0 && (
        <Card titel="Noch keine Prüfung eingetragen" icon="uhr">
          <p className="el-text">
            Trag deine nächste Prüfung ein — die App zeigt dir dann auf der Startseite, wie viele
            Tage dir noch bleiben.
          </p>
        </Card>
      )}

      {liste.map((p) => {
        const fach = faecher.find((f) => f.id === p.fachId)
        const zeit = zeitText(p.datum, heuteWert)
        return (
          <Card key={p.id} className="el-pruefung">
            <div className="el-fach-kopf">
              <h3>{p.titel}</h3>
              <Badge ton={TON[p.status] || 'neutral'}>{p.status}</Badge>
            </div>
            <p className="el-meta">
              {fach ? `${fach.name} · ` : ''}
              {p.datum || 'ohne Datum'}
              {zeit ? ` · ${zeit}` : ''}
            </p>
            {p.themen && <p className="el-text">Themen: {p.themen}</p>}

            <label className="rk-feld-label" htmlFor={`status-${p.id}`}>
              Stand
            </label>
            <select
              id={`status-${p.id}`}
              className="rk-feld"
              value={p.status}
              onChange={(e) => schule.pruefungAendern(p.id, { status: e.target.value })}
            >
              {schule.PRUEFUNG_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="el-loeschen el-loeschen-breit"
              onClick={() => schule.pruefungEntfernen(p.id)}
            >
              <Icon name="muell" groesse={16} /> Prüfung löschen
            </button>
          </Card>
        )
      })}

      {offen ? (
        <Card titel="Neue Prüfung" icon="plus">
          <label className="rk-feld-label" htmlFor="p-titel">
            Titel
          </label>
          <input
            id="p-titel"
            className="rk-feld"
            value={neu.titel}
            placeholder="z. B. Elektrotechnik Test 3"
            onChange={(e) => setNeu({ ...neu, titel: e.target.value })}
          />
          <label className="rk-feld-label" htmlFor="p-fach">
            Fach
          </label>
          <select
            id="p-fach"
            className="rk-feld"
            value={neu.fachId}
            onChange={(e) => setNeu({ ...neu, fachId: e.target.value })}
          >
            <option value="">— kein Fach —</option>
            {faecher.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <label className="rk-feld-label" htmlFor="p-datum">
            Datum
          </label>
          <input
            id="p-datum"
            className="rk-feld"
            type="date"
            value={neu.datum}
            onChange={(e) => setNeu({ ...neu, datum: e.target.value })}
          />
          <label className="rk-feld-label" htmlFor="p-themen">
            Themen
          </label>
          <textarea
            id="p-themen"
            className="rk-feld"
            rows={3}
            value={neu.themen}
            placeholder="z. B. Ohmsches Gesetz, Leistung, Reihenschaltung"
            onChange={(e) => setNeu({ ...neu, themen: e.target.value })}
          />
          <div className="el-formular-knoepfe">
            <PrimaryButton icon="haken" onClick={speichern}>
              Prüfung speichern
            </PrimaryButton>
            <PrimaryButton art="still" onClick={() => setOffen(false)}>
              Abbrechen
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        <PrimaryButton icon="plus" onClick={() => setOffen(true)}>
          Prüfung eintragen
        </PrimaryButton>
      )}
    </div>
  )
}
