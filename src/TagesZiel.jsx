// Taegliches Ziel mit Geschenk (aus dem PDF-Design)
import { useState } from 'react'
import { tagesZiel, pruefeTagesziel } from './fortschritt.js'

export default function TagesZiel() {
  const [, neu] = useState(0)
  const z = tagesZiel()
  const geschafft = z.erledigt >= z.ziel

  return (
    <div className={'ziel-karte' + (geschafft ? ' geschafft' : '')}>
      <div className="ziel-text">
        <strong>🎯 Tägliches Ziel</strong>
        <span className="hinweis">Löse {z.ziel} Aufgaben und hol dir dein Geschenk!</span>
        <div className="balken"><div className="balken-voll gruen" style={{ width: (z.erledigt / z.ziel) * 100 + '%' }} /></div>
      </div>
      <div className="ziel-rechts">
        <span className="ziel-stand">{z.erledigt} / {z.ziel}</span>
        {geschafft && !z.belohnt ? (
          <button className="mini orange" onClick={() => { pruefeTagesziel(); neu(x => x + 1) }}>🎁 Öffnen</button>
        ) : (
          <span className="geschenk">{z.belohnt ? '✅' : '🎁'}</span>
        )}
      </div>
    </div>
  )
}
