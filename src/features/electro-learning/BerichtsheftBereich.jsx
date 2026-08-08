// Berichtsheft: eine Woche pro Eintrag — was gemacht, was gelernt.
// Neueste Woche steht oben.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { useLernstand } from '../../core/store.ts'
import * as schule from '../../core/elektro/schuleStore.js'

const TON = {
  Offen: 'rot',
  Geschrieben: 'gold',
  Kontrolliert: 'lila',
  Abgegeben: 'gruen',
}

export default function BerichtsheftBereich() {
  useLernstand()
  const [offen, setOffen] = useState(false)
  const [neu, setNeu] = useState({ woche: '', von: '', bis: '', taetigkeiten: '', gelernt: '' })

  const wochen = schule.berichtsheft()

  function speichern() {
    if (!neu.woche.trim() && !neu.von) return
    schule.wocheHinzufuegen(neu)
    setNeu({ woche: '', von: '', bis: '', taetigkeiten: '', gelernt: '' })
    setOffen(false)
  }

  return (
    <div className="el-berichtsheft">
      <Card titel="Berichtsheft" icon="buch">
        <p className="el-text">
          {wochen.length === 0
            ? 'Noch keine Woche eingetragen. Schreib direkt nach der Arbeitswoche — dann fällt dir alles noch ein.'
            : `${wochen.length} ${wochen.length === 1 ? 'Woche' : 'Wochen'} · ${schule.offeneWochen()} noch nicht abgegeben`}
        </p>
      </Card>

      {wochen.map((w) => (
        <Card key={w.id} className="el-woche">
          <div className="el-fach-kopf">
            <h3>{w.woche || `${w.von} – ${w.bis}`}</h3>
            <Badge ton={TON[w.status] || 'neutral'}>{w.status}</Badge>
          </div>
          {(w.von || w.bis) && w.woche && (
            <p className="el-meta">
              {w.von} – {w.bis}
            </p>
          )}
          {w.taetigkeiten && (
            <p className="el-text">
              <strong>Tätigkeiten:</strong> {w.taetigkeiten}
            </p>
          )}
          {w.gelernt && (
            <p className="el-text">
              <strong>Gelernt:</strong> {w.gelernt}
            </p>
          )}
          <label className="rk-feld-label" htmlFor={`w-status-${w.id}`}>
            Stand
          </label>
          <select
            id={`w-status-${w.id}`}
            className="rk-feld"
            value={w.status}
            onChange={(e) => schule.wocheAendern(w.id, { status: e.target.value })}
          >
            {schule.BERICHT_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="el-loeschen el-loeschen-breit"
            onClick={() => schule.wocheEntfernen(w.id)}
          >
            <Icon name="muell" groesse={16} /> Woche löschen
          </button>
        </Card>
      ))}

      {offen ? (
        <Card titel="Neue Woche" icon="plus">
          <label className="rk-feld-label" htmlFor="w-woche">
            Woche
          </label>
          <input
            id="w-woche"
            className="rk-feld"
            value={neu.woche}
            placeholder="z. B. KW 32"
            onChange={(e) => setNeu({ ...neu, woche: e.target.value })}
          />
          <div className="el-formular-reihe">
            <span>
              <label className="rk-feld-label" htmlFor="w-von">
                Von
              </label>
              <input
                id="w-von"
                className="rk-feld"
                type="date"
                value={neu.von}
                onChange={(e) => setNeu({ ...neu, von: e.target.value })}
              />
            </span>
            <span>
              <label className="rk-feld-label" htmlFor="w-bis">
                Bis
              </label>
              <input
                id="w-bis"
                className="rk-feld"
                type="date"
                value={neu.bis}
                onChange={(e) => setNeu({ ...neu, bis: e.target.value })}
              />
            </span>
          </div>
          <label className="rk-feld-label" htmlFor="w-taetig">
            Tätigkeiten
          </label>
          <textarea
            id="w-taetig"
            className="rk-feld"
            rows={3}
            value={neu.taetigkeiten}
            placeholder="z. B. Rohre gelegt, Dosen gesetzt, Verteiler verdrahtet"
            onChange={(e) => setNeu({ ...neu, taetigkeiten: e.target.value })}
          />
          <label className="rk-feld-label" htmlFor="w-gelernt">
            Was habe ich gelernt?
          </label>
          <textarea
            id="w-gelernt"
            className="rk-feld"
            rows={3}
            value={neu.gelernt}
            placeholder="z. B. Aderfarben sicher unterscheiden"
            onChange={(e) => setNeu({ ...neu, gelernt: e.target.value })}
          />
          <div className="el-formular-knoepfe">
            <PrimaryButton icon="haken" onClick={speichern}>
              Woche speichern
            </PrimaryButton>
            <PrimaryButton art="still" onClick={() => setOffen(false)}>
              Abbrechen
            </PrimaryButton>
          </div>
        </Card>
      ) : (
        <PrimaryButton icon="plus" onClick={() => setOffen(true)}>
          Woche eintragen
        </PrimaryButton>
      )}
    </div>
  )
}
