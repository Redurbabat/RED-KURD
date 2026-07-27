// Einstellungen: Profil, App-Modus (Modern/Klassik), Daten
import { useState } from 'react'
import { profilLaden, profilSpeichern, level, edelsteine, statistik, appModus, setzeAppModus, truheOffen, truheOeffnen, exportiereAlles, importiereAlles } from './fortschritt.js'

export default function Einstellungen({ zurueck, neustart }) {
  const [modus, setModus] = useState(appModus())
  const [truhe, setTruhe] = useState(null)
  const p = profilLaden() || {}
  const s = statistik()
  const l = level()

  return (
    <section>
      <div className="seiten-kopf">
        <div>
          <h1>Einstellungen</h1>
          <p className="untertitel-neu">Passe die App an deine Bedürfnisse an</p>
        </div>
        <img src="/bilder/helo-avatar.png" alt="Hêlo" className="kopf-avatar" />
      </div>

      <div className="karte ring-karte">
        <img src="/bilder/helo-avatar.png" alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <strong>Kurmancî · Grundlagen</strong>
          <div className="hinweis">Level {l.stufe} · 🔥 {s.serie} Tage · ⭐ {s.xp} XP · 💎 {edelsteine()}</div>
          <div className="balken"><div className="balken-voll" style={{ width: l.fortschritt + '%' }} /></div>
          <small className="hinweis">Noch {100 - l.fortschritt} XP bis Level {l.stufe + 1}</small>
        </div>
      </div>

      <div className="karte">
        <div className="karte-titel">🎮 App-Modus</div>
        <p className="hinweis">Wechsle zwischen dem modernen Lern-Design und dem dunklen Klassik-Modus.
          Dein Lernfortschritt bleibt gleich.</p>
        <div className="modus-wahl">
          <button className={'modus-box' + (modus === 'modern' ? ' gewaehlt' : '')}
            onClick={() => { setModus('modern'); setzeAppModus('modern') }}>
            ☀️ <strong>Modern</strong><small>hell & klar</small>
          </button>
          <button className={'modus-box' + (modus === 'klassik' ? ' gewaehlt' : '')}
            onClick={() => { setModus('klassik'); setzeAppModus('klassik') }}>
            🌙 <strong>Klassik</strong><small>dunkel & verspielt</small>
          </button>
        </div>
      </div>

      <div className="karte">
        <div className="karte-titel">🎁 Deine tägliche Truhe</div>
        {truhe ? (
          <div>✨ Geöffnet: <strong>+{truhe.xp} XP</strong>{truhe.stein ? ' und 💎 +1 Edelstein' : ''}! Komm morgen wieder.</div>
        ) : truheOffen() ? (
          <div className="kurs-zeile-heute">
            <div style={{ flex: 1 }}>Komm jeden Tag zurück und sammle deine Belohnung!</div>
            <button className="mini orange" onClick={() => setTruhe(truheOeffnen())}>Öffnen</button>
          </div>
        ) : (
          <div className="hinweis">Heute schon geöffnet — morgen wartet eine neue Truhe. ✅</div>
        )}
      </div>

      <div className="karte">
        <div className="karte-titel">👤 Profil</div>
        <div className="hinweis">Ziel: {p.ziel || '–'} · Tägliche Zeit: {p.minuten || '10'} Minuten · Stand: {p.kenntnis || '–'}</div>
        <button className="mini" onClick={neustart}>Onboarding neu durchlaufen</button>
      </div>

      <div className="karte">
        <div className="karte-titel">🔒 Datenschutz</div>
        <p className="hinweis">RED-KURD ist local-first: Lernstand, Aufnahmen und Profil bleiben auf deinem
          Gerät. Keine Konten, keine Werbung, kein Tracking. Open Source unter MIT-Lizenz.</p>
      </div>

      <button className="weiter zweitrangig" onClick={zurueck}>← Zurück</button>
    </section>
  )
}
