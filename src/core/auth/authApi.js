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
