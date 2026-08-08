// Eine geoeffnete Uebung: Aufgabe lesen, eigene Loesung notieren,
// als erledigt markieren. Wird von Code lernen und AI-Sprache genutzt.
import { useState } from 'react'
import Badge from '../../components/common/Badge.tsx'
import Icon from '../../components/icons/Icon.tsx'
import Modal from '../../components/common/Modal.tsx'
import PrimaryButton from '../../components/common/PrimaryButton.tsx'
import { XP_JE_UEBUNG } from '../../core/lernbereiche/bereichsLernstand.ts'
import type { Bereichsbaukasten } from '../../types/lernstand'
import type { Bereichsuebung } from '../../types/lernbereich'

export interface UebungModalProps {
  /** `null`, solange keine Uebung offen ist — dann rendert nichts. */
  uebung: Bereichsuebung | null
  /** Der Lernstand des jeweiligen Bereichs (Code, AI-Sprache, Elektro). */
  lernstand: Bereichsbaukasten
  schliessen: () => void
}

export default function UebungModal({ uebung, lernstand, schliessen }: UebungModalProps) {
  // Der Anfangswert wird nur beim ersten Rendern gelesen; `uebung` ist dabei
  // moeglicherweise noch null, deshalb die Abfrage im Initialisierer.
  const [notiz, setNotiz] = useState<string>(() => (uebung ? lernstand.notiz(uebung.id) : ''))
  if (!uebung) return null
  const erledigt = lernstand.istErledigt(uebung.id)
  // Nach der Abfrage oben steht fest, dass es eine Uebung gibt. Die Konstante
  // haelt das fuer die Rueckrufe unten fest — in ihnen waere `uebung` sonst
  // wieder `Bereichsuebung | null`.
  const offen: Bereichsuebung = uebung

  function notizSichern(): void {
    lernstand.setzeNotiz(offen.id, notiz)
  }

  function abschliessen(): void {
    lernstand.setzeNotiz(offen.id, notiz)
    lernstand.schliesseAb(offen.id, XP_JE_UEBUNG)
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
