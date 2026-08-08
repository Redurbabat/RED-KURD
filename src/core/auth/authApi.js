async function antwortLesen(response) {
  let daten = null
  try {
    daten = await response.json()
  } catch {
    /* Eine unerwartete Serverantwort wird unten einheitlich behandelt. */
  }
  return { response, daten }
}

async function api(pfad, optionen = {}) {
  let ergebnis
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

export async function holeKonto() {
  const { response, daten } = await api('/api/auth/me')
  if (response.status === 401) return null
  if (!response.ok) throw new Error(daten?.fehler || 'Das Konto konnte nicht geladen werden.')
  return daten?.konto || null
}

/**
 * Konto und Umgebung in einem Schritt: RED-KURD ist local-first, deshalb
 * blockiert ein fehlender Anmelde-Server die App nicht. Nur wenn der Server
 * antwortet (Cloudflare-Betrieb), verlangt die App eine Anmeldung.
 * @returns {{backend: boolean, konto: object|null}}
 */
export async function kontoStatus() {
  let ergebnis
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

async function kontoSenden(pfad, email, passwort) {
  const { response, daten } = await api(pfad, {
    method: 'POST',
    body: JSON.stringify({ email, passwort }),
  })
  if (!response.ok) throw new Error(daten?.fehler || 'Das hat leider nicht geklappt.')
  return daten.konto
}

export function registrieren(email, passwort) {
  return kontoSenden('/api/auth/register', email, passwort)
}

export function anmelden(email, passwort) {
  return kontoSenden('/api/auth/login', email, passwort)
}

export async function abmelden() {
  const { response, daten } = await api('/api/auth/logout', { method: 'POST' })
  if (!response.ok) throw new Error(daten?.fehler || 'Abmelden war nicht möglich.')
}
