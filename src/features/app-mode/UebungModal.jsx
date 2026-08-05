// Eine geoeffnete Uebung: Aufgabe lesen, eigene Loesung notieren,
// als erledigt markieren. Wird von Code lernen und AI-Sprache genutzt.
import { useState } from 'react'
import Badge from '../../components/common/Badge.jsx'
import Icon from '../../components/icons/Icon.jsx'
import Modal from '../../components/common/Modal.jsx'
import PrimaryButton from '../../components/common/PrimaryButton.jsx'
import { XP_JE_UEBUNG } from '../../core/lernbereiche/bereichsLernstand.js'

/**
 * @param {{uebung:Object|null, lernstand:Object, schliessen:Function}} props
 */
export default function UebungModal({ uebung, lernstand, schliessen }) {
  const [notiz, setNotiz] = useState(() => (uebung ? lernstand.notiz(uebung.id) : ''))
  if (!uebung) return null
  const erledigt = lernstand.istErledigt(uebung.id)

  function notizSichern() {
    lernstand.setzeNotiz(uebung.id, notiz)
  }

  function abschliessen() {
    lernstand.setzeNotiz(uebung.id, notiz)
    lernstand.schliesseAb(uebung.id, XP_JE_UEBUNG)
    schliessen()
  }

  return (
    <Modal
      offen
      breit
      titel={uebung.title}
      schliessen={() => {
        notizSichern()
        schliessen()
      }}
      fussleiste={
        erledigt ? (
          <>
            <Badge ton="gruen" icon="haken">
              Erledigt
            </Badge>
            <PrimaryButton
              art="still"
              onClick={() => {
                notizSichern()
                schliessen()
              }}
            >
              Schließen
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton icon="haken" onClick={abschliessen}>
            Als erledigt markieren · +{XP_JE_UEBUNG} XP
          </PrimaryButton>
        )
      }
    >
      <div className="lektion-inhalt">
        <p>{uebung.description}</p>
        <p className="uebung-modal-aufgabe">{uebung.task}</p>
        <p className="pl-meta">
          <Icon name="uhr" groesse={14} /> ca. {uebung.estimatedMinutes} Min · {uebung.difficulty}{' '}
          · {uebung.topic}
        </p>

        <label className="rk-feld-label" htmlFor="uebung-notiz">
          Deine Lösung / Notizen (bleibt lokal gespeichert)
        </label>
        <textarea
          id="uebung-notiz"
          className="rk-feld"
          rows={5}
          value={notiz}
          placeholder="Schreibe deine Lösung oder deinen Prompt hier auf …"
          onChange={(e) => setNotiz(e.target.value)}
          onBlur={notizSichern}
        />
      </div>
    </Modal>
  )
}
