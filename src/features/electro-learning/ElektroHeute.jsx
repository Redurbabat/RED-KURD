// Startseite der Elektro-Lehre: was heute zählt — nächste Prüfung, Noten,
// offene Wochen, Formel des Tages.
import Badge from '../../components/common/Badge.jsx'
import Card from '../../components/common/Card.jsx'
import Icon from '../../components/icons/Icon.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { useLernstand } from '../../core/store.js'
import { heute } from '../../core/progress/scheduler.js'
import * as schule from '../../core/elektro/schuleStore.js'
import { FORMELN, SICHERHEITSREGELN } from '../../core/elektro/formeln.js'
import { gerundet, istBestanden } from '../../core/elektro/notenRechnung.js'
import { electroLessons } from './data/electroLessons.js'
import { electroLernstand } from './electroProgressStore.js'

/** Eine Formel je Tag — dieselbe für alle, wechselt täglich. */
export function formelDesTages(datum, formeln = FORMELN) {
  const zahl = String(datum || '')
    .split('-')
    .reduce((s, t) => s + Number(t || 0), 0)
  return formeln[zahl % formeln.length]
}

export default function ElektroHeute({ zumBereich }) {
  useLernstand()
  const heuteWert = heute()

  const naechste = schule.naechstePruefung(heuteWert)
  const fach = naechste ? schule.holeFach(naechste.pruefung.fachId) : null
  const gesamt = schule.gesamtschnitt()
  const offeneWochen = schule.offeneWochen()
  const lernen = schule.pruefungen().filter((p) => p.status === 'Am Lernen').length
  const formel = formelDesTages(heuteWert)
  const naechsteLektion =
    electroLessons.find((l) => electroLernstand.statusFuer(electroLessons)[l.id] === 'current') || null
  const regelHeute = SICHERHEITSREGELN[(new Date(`${heuteWert}T00:00:00`).getDate() || 1) % 5]

  return (
    <div className="el-heute-seite">
      <Card titel="Nächste Prüfung" icon="uhr" ton={naechste && naechste.tage <= 7 ? 'warm' : 'normal'}>
        {naechste ? (
          <>
            <p className="el-gross">
              <strong>{naechste.pruefung.titel}</strong>
            </p>
            <p className="el-meta">
              {fach ? `${fach.name} · ` : ''}
              {naechste.pruefung.datum} ·{' '}
              {naechste.tage === 0
                ? 'heute!'
                : naechste.tage === 1
                  ? 'morgen'
                  : `noch ${naechste.tage} Tage`}
            </p>
            {naechste.pruefung.themen && <p className="el-text">Themen: {naechste.pruefung.themen}</p>}
            <Badge ton="gold">{naechste.pruefung.status}</Badge>
          </>
        ) : (
          <>
            <p className="el-text">Keine Prüfung eingetragen.</p>
            <PrimaryButton art="still" icon="plus" onClick={() => zumBereich('pruefungen')}>
              Prüfung eintragen
            </PrimaryButton>
          </>
        )}
      </Card>

      <div className="bereich-raster">
        <Card titel="Noten" icon="fortschritt">
          <p className="el-gross">
            Schnitt:{' '}
            <strong>
              {gesamt === null ? '—' : gerundet(gesamt, 2)}
            </strong>{' '}
            {gesamt !== null && (
              <Badge ton={istBestanden(gesamt, schule.skala()) ? 'gruen' : 'rot'}>
                {istBestanden(gesamt, schule.skala()) ? 'im grünen Bereich' : 'aufpassen'}
              </Badge>
            )}
          </p>
          <p className="el-meta">
            {schule.noten().length} {schule.noten().length === 1 ? 'Note' : 'Noten'} in{' '}
            {schule.faecher().length} Fächern
          </p>
          <PrimaryButton art="still" icon="stift" onClick={() => zumBereich('noten')}>
            Noten öffnen
          </PrimaryButton>
        </Card>

        <Card titel="Berichtsheft" icon="buch">
          <p className="el-gross">
            <strong>{offeneWochen}</strong> {offeneWochen === 1 ? 'Woche' : 'Wochen'} offen
          </p>
          <p className="el-meta">
            {schule.berichtsheft().length === 0
              ? 'Noch nichts eingetragen'
              : `${schule.berichtsheft().length} insgesamt`}
          </p>
          <PrimaryButton art="still" icon="stift" onClick={() => zumBereich('bericht')}>
            Berichtsheft öffnen
          </PrimaryButton>
        </Card>
      </div>

      <Card titel="Formel des Tages" icon="blitz">
        <p className="el-formel-gross">
          <code>{formel.formel}</code>
        </p>
        <p className="el-meta">
          {formel.text} · Ergebnis in {formel.einheit}
        </p>
        <PrimaryButton art="still" icon="fortschritt" onClick={() => zumBereich('formeln')}>
          Zum Rechner
        </PrimaryButton>
      </Card>

      <Card titel="Sicherheit zuerst" icon="schild" ton="warm">
        <p className="el-text">
          <strong>Regel des Tages:</strong> {regelHeute}
        </p>
        <p className="el-meta">
          <Icon name="warnung" groesse={14} /> An Anlagen arbeiten Elektrofachkräfte.
        </p>
      </Card>

      {naechsteLektion && (
        <Card titel="Heute lernen" icon="heute">
          <p className="el-text">
            <strong>{naechsteLektion.title}</strong> — {naechsteLektion.description}
          </p>
          <p className="el-meta">
            <Icon name="uhr" groesse={14} /> ca. {naechsteLektion.durationMinutes} Min ·{' '}
            {lernen > 0 ? `${lernen} Prüfung(en) im Lernen` : 'Theorie und Praxis'}
          </p>
          <PrimaryButton art="still" icon="play" onClick={() => zumBereich('lernen')}>
            Zum Lernbereich
          </PrimaryButton>
        </Card>
      )}
    </div>
  )
}
