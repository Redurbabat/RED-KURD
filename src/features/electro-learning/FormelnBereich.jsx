// Formeln & Rechner plus die fünf Sicherheitsregeln. Gerechnet wird in
// core/elektro/formeln.js — hier stehen nur Eingabefelder und Ergebnisse.
import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import * as f from '../../core/elektro/formeln.js'
import { gerundet } from '../../core/elektro/notenRechnung.js'

function Feld({ id, label, wert, setzen, platzhalter }) {
  return (
    <span className="el-rechner-feld">
      <label className="rk-feld-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="rk-feld"
        inputMode="decimal"
        value={wert}
        placeholder={platzhalter}
        onChange={(e) => setzen(e.target.value)}
      />
    </span>
  )
}

function Ergebnis({ wert, einheit, stellen = 2 }) {
  return (
    <p className="el-ergebnis" aria-live="polite">
      {wert === null || wert === undefined ? (
        <span className="el-meta">Trag die Werte ein — das Ergebnis erscheint sofort.</span>
      ) : (
        <>
          Ergebnis: <strong>{gerundet(wert, stellen)} {einheit}</strong>
        </>
      )}
    </p>
  )
}

export default function FormelnBereich() {
  const [ohm, setOhm] = useState({ u: '', i: '', r: '' })
  const [p, setP] = useState({ u: '', i: '' })
  const [e, setE] = useState({ p: '', t: '', preis: '' })
  const [du, setDu] = useState({ laenge: '', strom: '', querschnitt: '', phasen: '1', material: 'kupfer', netz: '230' })

  const energie = f.energieKwh(e.p, e.t)
  const fall = f.spannungsfall({
    laenge: du.laenge,
    strom: du.strom,
    querschnitt: du.querschnitt,
    material: du.material,
    phasen: Number(du.phasen),
    netzspannung: du.netz,
  })

  return (
    <div className="el-formeln">
      <Card titel="Ohmsches Gesetz" icon="blitz">
        <p className="el-text">Zwei Werte eintragen — der dritte wird berechnet.</p>
        <div className="el-rechner">
          <Feld id="ohm-u" label="Spannung U (V)" wert={ohm.u} setzen={(v) => setOhm({ ...ohm, u: v })} platzhalter="230" />
          <Feld id="ohm-i" label="Strom I (A)" wert={ohm.i} setzen={(v) => setOhm({ ...ohm, i: v })} platzhalter="16" />
          <Feld id="ohm-r" label="Widerstand R (Ω)" wert={ohm.r} setzen={(v) => setOhm({ ...ohm, r: v })} platzhalter="8" />
        </div>
        <ul className="el-ergebnisse">
          <li>
            U = R · I: <strong>{gerundet(f.spannung(ohm.r, ohm.i), 2) ?? '—'} V</strong>
          </li>
          <li>
            I = U ÷ R: <strong>{gerundet(f.strom(ohm.u, ohm.r), 2) ?? '—'} A</strong>
          </li>
          <li>
            R = U ÷ I: <strong>{gerundet(f.widerstand(ohm.u, ohm.i), 2) ?? '—'} Ω</strong>
          </li>
        </ul>
      </Card>

      <Card titel="Leistung" icon="blitz">
        <div className="el-rechner">
          <Feld id="p-u" label="Spannung U (V)" wert={p.u} setzen={(v) => setP({ ...p, u: v })} platzhalter="230" />
          <Feld id="p-i" label="Strom I (A)" wert={p.i} setzen={(v) => setP({ ...p, i: v })} platzhalter="10" />
        </div>
        <Ergebnis wert={f.leistung(p.u, p.i)} einheit="W" />
      </Card>

      <Card titel="Energie und Kosten" icon="fortschritt">
        <div className="el-rechner">
          <Feld id="e-p" label="Leistung P (W)" wert={e.p} setzen={(v) => setE({ ...e, p: v })} platzhalter="2000" />
          <Feld id="e-t" label="Zeit (Stunden)" wert={e.t} setzen={(v) => setE({ ...e, t: v })} platzhalter="1.5" />
          <Feld id="e-preis" label="Preis je kWh" wert={e.preis} setzen={(v) => setE({ ...e, preis: v })} platzhalter="0.30" />
        </div>
        <Ergebnis wert={energie} einheit="kWh" stellen={3} />
        <Ergebnis wert={f.kosten(energie, e.preis)} einheit="pro Durchgang" stellen={2} />
      </Card>

      <Card titel="Spannungsfall" icon="warnung">
        <div className="el-rechner">
          <Feld id="du-l" label="Länge (m)" wert={du.laenge} setzen={(v) => setDu({ ...du, laenge: v })} platzhalter="30" />
          <Feld id="du-i" label="Strom I (A)" wert={du.strom} setzen={(v) => setDu({ ...du, strom: v })} platzhalter="16" />
          <Feld id="du-a" label="Querschnitt (mm²)" wert={du.querschnitt} setzen={(v) => setDu({ ...du, querschnitt: v })} platzhalter="2.5" />
          <Feld id="du-netz" label="Netzspannung (V)" wert={du.netz} setzen={(v) => setDu({ ...du, netz: v })} platzhalter="230" />
          <span className="el-rechner-feld">
            <label className="rk-feld-label" htmlFor="du-phasen">
              Art
            </label>
            <select
              id="du-phasen"
              className="rk-feld"
              value={du.phasen}
              onChange={(ev) => setDu({ ...du, phasen: ev.target.value })}
            >
              <option value="1">Wechselstrom (1-phasig)</option>
              <option value="3">Drehstrom (3-phasig)</option>
            </select>
          </span>
          <span className="el-rechner-feld">
            <label className="rk-feld-label" htmlFor="du-material">
              Material
            </label>
            <select
              id="du-material"
              className="rk-feld"
              value={du.material}
              onChange={(ev) => setDu({ ...du, material: ev.target.value })}
            >
              <option value="kupfer">Kupfer</option>
              <option value="aluminium">Aluminium</option>
            </select>
          </span>
        </div>
        <p className="el-ergebnis" aria-live="polite">
          {fall === null ? (
            <span className="el-meta">Trag Länge, Strom und Querschnitt ein.</span>
          ) : (
            <>
              Spannungsfall: <strong>{gerundet(fall.volt, 2)} V</strong>
              {fall.prozent !== null && <> · {gerundet(fall.prozent, 2)} %</>}
            </>
          )}
        </p>
        <p className="el-meta">
          Faustregel: Über 3 % wird es kritisch — dann größeren Querschnitt wählen. Diese Rechnung
          ist eine Lernhilfe, keine Norm-Auslegung.
        </p>
      </Card>

      <Card titel="Formelsammlung" icon="buch">
        <ul className="el-formelliste">
          {f.FORMELN.map((formel) => (
            <li key={formel.id}>
              <code>{formel.formel}</code>
              <span className="el-meta">
                {formel.text} · {formel.einheit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card titel="Die fünf Sicherheitsregeln" icon="schild" ton="warm">
        <ol className="el-regeln">
          {f.SICHERHEITSREGELN.map((regel, i) => (
            <li key={regel}>
              <span className="el-regel-nummer" aria-hidden="true">
                {i + 1}
              </span>
              <span>{regel}</span>
            </li>
          ))}
        </ol>
        <p className="el-meta">
          <Icon name="warnung" groesse={14} /> Die Reihenfolge gehört zur Regel. An Anlagen arbeiten
          Elektrofachkräfte — diese App erklärt, sie ersetzt keine Ausbildung.
        </p>
      </Card>
    </div>
  )
}
