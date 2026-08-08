// Kleiner Router ohne Zusatzpaket: echte Adressen (/today, /course/:unitId …),
// Zurueck-Taste, Tiefenlinks und Weiterleitungen von alten Adressen.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const EREIGNIS = 'rk:navigation'

/** Adressen mit Schema (http:, mailto:, tel:) oder protokollrelative '//host'. */
const SCHEMA = /^[a-z][a-z0-9+.-]*:/i

export function istExterneAdresse(adresse) {
  if (typeof adresse !== 'string') return false
  const roh = adresse.trim()
  return roh.startsWith('//') || SCHEMA.test(roh)
}

/**
 * decodeURIComponent wirft bei kaputten Prozentzeichen ('/course/%E0%A4%A').
 * Ein unlesbarer Rohwert ist immer besser als eine abgestuerzte App.
 */
export function sichereDekodierung(wert) {
  if (typeof wert !== 'string') return ''
  try {
    return decodeURIComponent(wert)
  } catch {
    return wert
  }
}

/** Query und Anker abschneiden — '/course/1?x=2#y' wird zu '/course/1'. */
function ohneAnhang(pfad) {
  return pfad.split('#')[0].split('?')[0]
}

/**
 * Macht aus 'kurs' bzw. '/kurs' ein sauberes internes Ziel.
 * @returns {null|string} null, wenn das Ziel nicht intern erreichbar ist
 */
export function normalisiereZiel(zu) {
  if (typeof zu !== 'string') return null
  const roh = zu.trim()
  if (!roh || istExterneAdresse(roh)) return null
  const mitSlash = roh.startsWith('/') ? roh : '/' + roh
  // '//host' waere protokollrelativ: history.pushState wirft dabei einen
  // SecurityError, weil das Ziel eine andere Herkunft hat.
  return mitSlash.replace(/^\/+/, '/')
}

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
  const ziel = normalisiereZiel(zu)
  if (!ziel) return
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
  if (typeof muster !== 'string' || typeof pfad !== 'string') return null
  const m = ohneAnhang(muster).split('/').filter(Boolean)
  const p = ohneAnhang(pfad).split('/').filter(Boolean)
  if (m.length !== p.length) return null
  const params = {}
  for (let i = 0; i < m.length; i++) {
    if (m[i].startsWith(':')) params[m[i].slice(1)] = sichereDekodierung(p[i])
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

/**
 * Darf dieser Klick intern (ohne Neuladen) behandelt werden?
 * Nein bei: bereits abgebrochenem Ereignis, Modifikatortaste, Mittelklick,
 * target (neues Fenster), externem Ziel und reinen Ankern.
 */
export function istInternerKlick(ereignis, to, target) {
  if (!ereignis || ereignis.defaultPrevented) return false
  // Ein Tastendruck (Enter) liefert keine Maustaste — das ist ein linker Klick.
  const knopf = typeof ereignis.button === 'number' ? ereignis.button : 0
  if (knopf !== 0) return false
  if (ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return false
  if (typeof target === 'string' && target && target !== '_self') return false
  if (typeof to !== 'string' || !to || to.startsWith('#')) return false
  return !istExterneAdresse(to)
}

/** Ein Link, der die Seite nicht neu laedt (Mittelklick/Strg/_blank bleibt normal). */
export function Link({ to, children, className, onClick, target, rel, ...rest }) {
  // Ohne rel kann die neue Seite ueber window.opener auf diese zugreifen.
  const sicheresRel = target && target !== '_self' ? rel || 'noopener noreferrer' : rel
  return (
    <a
      href={to}
      className={className}
      target={target}
      rel={sicheresRel}
      onClick={(e) => {
        // Zuerst der eigene Handler: setzt er defaultPrevented, bleibt es dabei.
        if (onClick) onClick(e)
        if (!istInternerKlick(e, to, target)) return
        e.preventDefault()
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
