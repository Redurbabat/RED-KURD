import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// App offline-faehig machen (nur im fertigen Build, nicht beim Entwickeln)
if ('serviceWorker' in navigator && !location.host.includes('localhost')) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}
