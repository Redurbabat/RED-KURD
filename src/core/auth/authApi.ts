// Der Anmelde-Server. RED-KURD ist local-first: fehlt er, laeuft die App
// trotzdem — deshalb unterscheidet `kontoStatus()` sorgfaeltig zwischen
// „kein Server da" und „Server da, aber nicht angemeldet".

/** Ein angemeldetes Konto, so wie der Server es liefert. */
export interface Konto {
  id: string
  email: string
}

/** Was der Server im Fehlerfall mitschickt. */
interface Serverantwort {
  konto?: Konto | null
  fehler?: string
}

/** Rohantwort plus geparstes JSON — `daten` ist null, wenn es keins gab. */
interface Antwort {
  response: Response
  daten: Serverantwort | null
}

/**
 * Steht ein Anmelde-Server bereit, und ist jemand angemeldet?
 * `backend: false` heisst: hier gibt es gar nichts anzumelden.
 */
export interface Kontostand {
  backend: boolean
  konto: Konto | null
}

async function antwortLesen(response: Response): Promise<Antwort> {
  let daten: Serverantwort | null = null
  try {
    // Ungeprueft: `json()` liefert `any`. Gelesen werden nur `fehler` und
    // `konto`, und beide werden unten auf Vorhandensein abgefragt.
    daten = await response.json()
  } catch {
    /* Eine unerwartete Serverantwort wird unten einheitlich behandelt. */
  }
  return { response, daten }
}

async function api(pfad: string, optionen: RequestInit = {}): Promise<Antwort> {
  let ergebnis: Antwort
  try {
    ergebnis = await fetch(pfad, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...optionen,
      headers: optionen.body
        ? { 'content-type': 'application/json', ...(optionen.headers || {}) }
        : optionen.headers,
    }).then(antwortLesen)
  } catch {
    throw new Error('Die Verbindung zu RED-KURD konnte nicht hergestellt werden.')
  }
  return ergebnis
}

export async function holeKonto(): Promise<Konto | null> {
  const { response, daten } = await api('/api/auth/me')
  if (response.status === 401) return null
  if (!response.ok) throw new Error(daten?.fehler || 'Das Konto konnte nicht geladen werden.')
  return daten?.konto || null
}

/**
 * Konto und Umgebung in einem Schritt: RED-KURD ist local-first, deshalb
 * blockiert ein fehlender Anmelde-Server die App nicht. Nur wenn der Server
 * antwortet (Cloudflare-Betrieb), verlangt die App eine Anmeldung.
 */
export async function kontoStatus(): Promise<Kontostand> {
  let ergebnis: Antwort
  try {
    ergebnis = await api('/api/auth/me')
  } catch {
    // Kein Netz oder kein Server: lokal weiterlernen.
    return { backend: false, konto: null }
  }
  const { response, daten } = ergebnis
  // 404/405: dieser Betrieb (z. B. `vite preview` oder ein statischer Host) hat gar keinen
  // Anmelde-Server — dann gibt es auch nichts anzumelden.
  if (response.status === 404 || response.status === 405) return { backend: false, konto: null }
  if (response.status === 401) return { backend: true, konto: null }
  // Andere Fehlerantworten: Kommt eine JSON-Antwort, ist der Anmelde-Server da
  // und nur gestoert (Deploy, Datenbank, Rate-Limit) — dann bleibt der Riegel,
  // sonst wuerde ein einzelner 500er die App fuer alle oeffnen. Antwortet
  // dagegen ein reiner Statik-Server (HTML oder Text, wie `vite preview` mit
  // seinem 500 auf unbekannte /api-Pfade), gibt es gar nichts anzumelden.
  if (!response.ok) return { backend: daten !== null, konto: null }
  return { backend: true, konto: daten?.konto || null }
}

async function kontoSenden(pfad: string, email: string, passwort: string): Promise<Konto> {
  const { response, daten } = await api(pfad, {
    method: 'POST',
    body: JSON.stringify({ email, passwort }),
  })
  if (!response.ok) throw new Error(daten?.fehler || 'Das hat leider nicht geklappt.')
  // Ein „ok" ohne Konto ist eine kaputte Antwort. Vorher stand hier
  // `daten.konto`: bei fehlendem JSON warf das einen TypeError (die
  // Anmeldeseite zeigte einen Fehler — richtig), bei `{}` gab es dagegen
  // `undefined` zurueck, und App.jsx setzte den Zustand auf „angemeldet"
  // mit `wert: undefined`. Man war dann eingeloggt ohne Konto. Beide Faelle
  // enden jetzt gleich: kein Konto, keine Anmeldung, ein lesbarer Satz.
  if (!daten?.konto) throw new Error('Der Server hat kein Konto zurückgegeben.')
  return daten.konto
}

export function registrieren(email: string, passwort: string): Promise<Konto> {
  return kontoSenden('/api/auth/register', email, passwort)
}

export function anmelden(email: string, passwort: string): Promise<Konto> {
  return kontoSenden('/api/auth/login', email, passwort)
}

export async function abmelden(): Promise<void> {
  const { response, daten } = await api('/api/auth/logout', { method: 'POST' })
  if (!response.ok) throw new Error(daten?.fehler || 'Abmelden war nicht möglich.')
}
