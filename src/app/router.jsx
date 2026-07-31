// Kleiner Router ohne Zusatzpaket: echte Adressen (/today, /course/:unitId …),
// Zurueck-Taste, Tiefenlinks und Weiterleitungen von alten Adressen.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const EREIGNIS = 'rk:navigation'

export function aktuellerPfad() {
  if (typeof window === 'undefined') return '/'
  // Wird die App ohne Server geoeffnet (file://), nutzen wir den Hash.
  if (window.location.protocol === 'file:') {
    return window.location.hash.replace(/^#/, '') || '/'
  }
  return window.location.pathname + window.location.search
}

export function navigiere(zu, optionen = {}) {
  if (typeof window === 'undefined') return
  const ziel = zu.startsWith('/') ? zu : '/' + zu
  if (aktuellerPfad() === ziel && !optionen.erzwingen) return

  const wechseln = () => {
    if (window.location.protocol === 'file:') {
      window.location.hash = ziel
    } else if (optionen.ersetzen) {
      window.history.replaceState({}, '', ziel)
    } else {
      window.history.pushState({}, '', ziel)
    }
    window.dispatchEvent(new Event(EREIGNIS))
    if (!optionen.haltePosition) window.scrollTo({ top: 0, behavior: 'auto' })
  }

  // Moderne Browser überblenden echte Seitenzustände ohne Zusatzbibliothek.
  // Reduzierte/abgeschaltete Animationen respektieren wir weiterhin.
  const bewegt =
    document.documentElement.dataset.animations !== 'off' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (bewegt && document.startViewTransition && window.location.protocol !== 'file:') {
    document.startViewTransition(wechseln)
  } else {
    wechseln()
  }
}

const RouteKontext = createContext({ pfad: '/', teile: [] })

export function RouterProvider({ children }) {
  const [pfad, setPfad] = useState(() => aktuellerPfad())

  useEffect(() => {
    const auffrischen = () => setPfad(aktuellerPfad())
    window.addEventListener('popstate', auffrischen)
    window.addEventListener('hashchange', auffrischen)
    window.addEventListener(EREIGNIS, auffrischen)
    return () => {
      window.removeEventListener('popstate', auffrischen)
      window.removeEventListener('hashchange', auffrischen)
      window.removeEventListener(EREIGNIS, auffrischen)
    }
  }, [])

  const wert = useMemo(() => {
    const rein = pfad.split('?')[0]
    return { pfad: rein, teile: rein.split('/').filter(Boolean), voll: pfad }
  }, [pfad])

  return <RouteKontext.Provider value={wert}>{children}</RouteKontext.Provider>
}

export function useRoute() {
  return useContext(RouteKontext)
}

/**
 * Prueft ein Muster wie '/course/:unitId' gegen den aktuellen Pfad.
 * @returns {null|Object} Parameter oder null
 */
export function passt(muster, pfad) {
  const m = muster.split('/').filter(Boolean)
  const p = pfad.split('/').filter(Boolean)
  if (m.length !== p.length) return null
  const params = {}
  for (let i = 0; i < m.length; i++) {
    if (m[i].startsWith(':')) params[m[i].slice(1)] = decodeURIComponent(p[i])
    else if (m[i] !== p[i]) return null
  }
  return params
}

/** Erster Treffer aus einer Liste von [muster, bauFunktion]. */
export function waehleRoute(pfad, routen) {
  for (const [muster, bauen] of routen) {
    const params = passt(muster, pfad)
    if (params) return bauen(params)
  }
  return null
}

/** Ein Link, der die Seite nicht neu laedt (Mittelklick/Strg bleibt normal). */
export function Link({ to, children, className, onClick, ...rest }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onClick && onClick(e)
        navigiere(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** Alte interne Adressen auf die neuen Routen umleiten. */
export const UMLEITUNGEN = {
  '/': '/today',
  '/heute': '/today',
  '/index.html': '/today',
  '/kurs': '/course',
  '/kurse': '/languages',
  '/sprachen': '/languages',
  '/ueben': '/practice',
  '/entdecken': '/explore',
  '/woerterbuch': '/explore/dictionary',
  '/lesen': '/explore/reading',
  '/schrift': '/explore/script',
  '/werkzeuge': '/explore/script',
  '/fortschritt': '/progress',
  '/einstellungen': '/settings',
  '/abenteuer': '/adventure',
}

export function loeseUmleitung(pfad) {
  return UMLEITUNGEN[pfad] || null
}
