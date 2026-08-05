import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'

// Faengt Renderfehler ab, damit nie eine leere weisse Seite erscheint.
// Der Lernstand liegt im localStorage und bleibt von einem Absturz unberuehrt.
class Startschutz extends React.Component {
  constructor(props) {
    super(props)
    this.state = { fehler: null }
  }

  static getDerivedStateFromError(fehler) {
    return { fehler }
  }

  render() {
    if (!this.state.fehler) return this.props.children
    return (
      <main className="start-fehler" role="alert">
        <h1>Da ist etwas schiefgelaufen</h1>
        <p>
          RED-KURD konnte diese Ansicht nicht anzeigen. Dein Lernstand ist
          davon nicht betroffen — er bleibt sicher auf deinem Gerät gespeichert.
        </p>
        <button
          type="button"
          className="rk-knopf rk-knopf-primaer"
          onClick={() => location.reload()}
        >
          <span className="rk-knopf-text">Neu laden</span>
        </button>
      </main>
    )
  }
}

// Ohne den Ankerpunkt #root kann React nichts zeichnen — dann lieber eine
// klare Meldung als eine stumme leere Seite.
const wurzel = document.getElementById('root')
if (wurzel) {
  ReactDOM.createRoot(wurzel).render(
    <React.StrictMode>
      <Startschutz>
        <App />
      </Startschutz>
    </React.StrictMode>
  )
} else {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<p role="alert">RED-KURD konnte nicht starten: Der Ankerpunkt „root“ fehlt in der Seite. Bitte lade die Seite neu.</p>'
  )
}

// App offline-faehig machen — nur im fertigen Build. Die fruehere
// localhost-Heuristik registrierte den Worker auch beim Entwickeln ueber
// eine LAN-IP (iPhone-Test) und vergiftete den Cache mit Dev-Antworten.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

// Den Browser bitten, den lokalen Speicher dauerhaft zu behalten — Safari
// raeumt Website-Daten sonst nach sieben Tagen ohne Besuch ab (ITP) und der
// gesamte Lernstand waere weg. Eine Ablehnung ist still und folgenlos.
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}
