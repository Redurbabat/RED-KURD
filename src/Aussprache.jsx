// Aussprache-Studio: Anhoeren, selbst aufnehmen, vergleichen (A/B)
// Ehrlich ohne falschen KI-Score — du (oder ein Muttersprachler) bewertest selbst.
import { useEffect, useRef, useState } from 'react'
import { kurse } from './data/kurse.js'
import { sprich } from './schrift.js'
import { speichereAufnahme, holeAufnahme, spieleWort } from './audio.js'
import { gibXp } from './fortschritt.js'

export default function Aussprache() {
  const [kursId, setKursId] = useState(kurse[0].id)
  const [aufnahmeWort, setAufnahmeWort] = useState(null)
  const [hatAufnahme, setHatAufnahme] = useState({})
  const [fehler, setFehler] = useState(null)
  const rekorder = useRef(null)
  const stuecke = useRef([])

  const kurs = kurse.find(k => k.id === kursId)

  useEffect(() => {
    (async () => {
      const map = {}
      for (const w of kurs.woerter) {
        map[w.ku] = !!(await holeAufnahme(w.ku))
      }
      setHatAufnahme(map)
    })()
  }, [kursId])

  async function starteAufnahme(wort) {
    setFehler(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const r = new MediaRecorder(stream)
      stuecke.current = []
      r.ondataavailable = (e) => stuecke.current.push(e.data)
      r.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(stuecke.current, { type: r.mimeType || 'audio/webm' })
        await speichereAufnahme(wort, blob)
        setHatAufnahme(h => ({ ...h, [wort]: true }))
        setAufnahmeWort(null)
        gibXp(5)
      }
      r.start()
      rekorder.current = r
      setAufnahmeWort(wort)
    } catch {
      setFehler('Mikrofon nicht verfügbar — bitte im Browser erlauben.')
    }
  }

  function stoppeAufnahme() {
    if (rekorder.current && rekorder.current.state === 'recording') rekorder.current.stop()
  }

  async function spieleMeine(wort) {
    const b = await holeAufnahme(wort)
    if (b) new Audio(URL.createObjectURL(b)).play()
  }

  async function abVergleich(wort) {
    sprich(wort)
    setTimeout(() => spieleMeine(wort), 1600)
  }

  return (
    <div>
      <p className="hinweis">
        Höre das Wort, sprich es nach und nimm dich auf. Deine Aufnahmen bleiben auf deinem Gerät.
        Tipp: Lass einen Muttersprachler die Wörter einsprechen — dann hat deine App echte Stimmen! 🎙️
      </p>
      {fehler && <div className="rueckstand">{fehler}</div>}
      <div className="richtungswahl" style={{ flexWrap: 'wrap' }}>
        {kurse.map(k => (
          <button key={k.id} className={k.id === kursId ? 'aktiv-klein' : 'mini'}
            onClick={() => setKursId(k.id)}>{k.symbol} {k.name}</button>
        ))}
      </div>
      <table>
        <tbody>
          {kurs.woerter.map(w => (
            <tr key={w.ku}>
              <td>{w.bild} <span className="ku">{w.ku}</span> <span className="kat">{w.de}</span></td>
              <td className="knopfzelle">
                <button className="mini" onClick={() => spieleWort(w.ku)}>🔊 Anhören</button>
                {aufnahmeWort === w.ku ? (
                  <button className="mini aufnahme-laeuft" onClick={stoppeAufnahme}>⏹ Stopp</button>
                ) : (
                  <button className="mini" onClick={() => starteAufnahme(w.ku)}>🎙️ Aufnehmen</button>
                )}
                {hatAufnahme[w.ku] && (
                  <>
                    <button className="mini" onClick={() => spieleMeine(w.ku)}>▶ Meine</button>
                    <button className="mini" onClick={() => abVergleich(w.ku)}>🔁 A/B</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
