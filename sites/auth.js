const SESSION_COOKIE = 'rk_session'
const SESSION_TAGE = 30
const PASSWORT_ITERATIONEN = 160_000
const EMAIL_MAX = 254
const PASSWORT_MIN = 10
const PASSWORT_MAX = 128

const encoder = new TextEncoder()

function bytesZuBase64(bytes) {
  let binaer = ''
  for (const byte of bytes) binaer += String.fromCharCode(byte)
  return btoa(binaer)
}

function base64ZuBytes(wert) {
  const binaer = atob(wert)
  return Uint8Array.from(binaer, (zeichen) => zeichen.charCodeAt(0))
}

function zufallsBase64(laenge) {
  return bytesZuBase64(crypto.getRandomValues(new Uint8Array(laenge)))
}

function gleicherWert(links, rechts) {
  if (links.length !== rechts.length) return false
  let unterschied = 0
  for (let i = 0; i < links.length; i += 1) unterschied |= links[i] ^ rechts[i]
  return unterschied === 0
}

export function normalisiereEmail(wert) {
  return String(wert || '').trim().toLocaleLowerCase('en-US')
}

export function emailIstGueltig(email) {
  return (
    email.length >= 3 &&
    email.length <= EMAIL_MAX &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
}

export function passwortIstGueltig(passwort) {
  return (
    typeof passwort === 'string' &&
    passwort.length >= PASSWORT_MIN &&
    passwort.length <= PASSWORT_MAX
  )
}

export async function hashPasswort(
  passwort,
  salt = zufallsBase64(16),
  iterationen = PASSWORT_ITERATIONEN
) {
  const schluessel = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passwort),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: base64ZuBytes(salt),
      iterations: iterationen,
    },
    schluessel,
    256
  )
  return { hash: bytesZuBase64(new Uint8Array(bits)), salt, iterationen }
}

export async function passwortStimmt(passwort, konto) {
  const berechnet = await hashPasswort(passwort, konto.password_salt, konto.password_iterations)
  return gleicherWert(base64ZuBytes(berechnet.hash), base64ZuBytes(konto.password_hash))
}

async function sha256Base64(wert) {
  return bytesZuBase64(
    new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(wert)))
  )
}

export function cookieLesen(request, name = SESSION_COOKIE) {
  const header = request.headers.get('cookie') || ''
  for (const teil of header.split(';')) {
    const [schluessel, ...rest] = teil.trim().split('=')
    if (schluessel === name) return decodeURIComponent(rest.join('='))
  }
  return ''
}

function sitzungsCookie(token, maxAge) {
  const wert = token ? encodeURIComponent(token) : ''
  return `${SESSION_COOKIE}=${wert}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

function json(daten, status = 200, extraHeaders = {}) {
  return Response.json(daten, {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  })
}

function gleicherUrsprung(request) {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

async function leseJson(request) {
  const typ = request.headers.get('content-type') || ''
  const laenge = Number(request.headers.get('content-length') || 0)
  if (!typ.toLowerCase().includes('application/json') || laenge > 4096) return null
  try {
    const daten = await request.json()
    return daten && typeof daten === 'object' ? daten : null
  } catch {
    return null
  }
}

async function sitzungAnlegen(env, userId) {
  const token = zufallsBase64(32)
  const id = await sha256Base64(token)
  const jetzt = new Date()
  const ablauf = new Date(jetzt.getTime() + SESSION_TAGE * 24 * 60 * 60 * 1000)
  await env.DB.prepare(
    'INSERT INTO auth_sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  )
    .bind(id, userId, jetzt.toISOString(), ablauf.toISOString())
    .run()
  return token
}

async function loginTextSpeichern(env, userId, email, eventType, zeitpunkt) {
  const bezeichnung = eventType === 'registrierung' ? 'REGISTRIERUNG' : 'ANMELDUNG'
  const textRecord = `${zeitpunkt} | ${bezeichnung} | ${email}`
  await env.DB.prepare(
    'INSERT INTO auth_events (id, user_id, email, event_type, text_record, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(crypto.randomUUID(), userId, email, eventType, textRecord, zeitpunkt)
    .run()
}

async function registrieren(request, env) {
  const daten = await leseJson(request)
  const email = normalisiereEmail(daten?.email)
  const passwort = daten?.passwort
  if (!emailIstGueltig(email) || !passwortIstGueltig(passwort)) {
    return json(
      {
        fehler: `Bitte gib eine gültige E-Mail und ein Passwort mit ${PASSWORT_MIN} bis ${PASSWORT_MAX} Zeichen ein.`,
      },
      400
    )
  }

  const vorhanden = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first()
  if (vorhanden) return json({ fehler: 'Für diese E-Mail besteht bereits ein Konto.' }, 409)

  const id = crypto.randomUUID()
  const passwortDaten = await hashPasswort(passwort)
  const jetzt = new Date().toISOString()
  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, password_salt, password_iterations, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        id,
        email,
        passwortDaten.hash,
        passwortDaten.salt,
        passwortDaten.iterationen,
        jetzt,
        jetzt
      )
      .run()
  } catch (fehler) {
    if (/unique/i.test(String(fehler?.message || fehler))) {
      return json({ fehler: 'Für diese E-Mail besteht bereits ein Konto.' }, 409)
    }
    throw fehler
  }

  await loginTextSpeichern(env, id, email, 'registrierung', jetzt)
  const token = await sitzungAnlegen(env, id)
  return json(
    { konto: { id, email } },
    201,
    { 'set-cookie': sitzungsCookie(token, SESSION_TAGE * 24 * 60 * 60) }
  )
}

async function anmelden(request, env) {
  const daten = await leseJson(request)
  const email = normalisiereEmail(daten?.email)
  const passwort = daten?.passwort
  if (!emailIstGueltig(email) || !passwortIstGueltig(passwort)) {
    return json({ fehler: 'E-Mail oder Passwort ist nicht richtig.' }, 401)
  }

  const konto = await env.DB.prepare(
    'SELECT id, email, password_hash, password_salt, password_iterations FROM users WHERE email = ? LIMIT 1'
  )
    .bind(email)
    .first()
  if (!konto || !(await passwortStimmt(passwort, konto))) {
    return json({ fehler: 'E-Mail oder Passwort ist nicht richtig.' }, 401)
  }

  const jetzt = new Date().toISOString()
  const token = await sitzungAnlegen(env, konto.id)
  await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
    .bind(jetzt, konto.id)
    .run()
  await loginTextSpeichern(env, konto.id, konto.email, 'anmeldung', jetzt)
  return json(
    { konto: { id: konto.id, email: konto.email } },
    200,
    { 'set-cookie': sitzungsCookie(token, SESSION_TAGE * 24 * 60 * 60) }
  )
}

async function aktuellesKonto(request, env) {
  const token = cookieLesen(request)
  if (!token) return json({ konto: null }, 401)
  const id = await sha256Base64(token)
  const jetzt = new Date().toISOString()
  const konto = await env.DB.prepare(
    'SELECT users.id, users.email FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id WHERE auth_sessions.id = ? AND auth_sessions.expires_at > ? LIMIT 1'
  )
    .bind(id, jetzt)
    .first()
  return konto ? json({ konto }) : json({ konto: null }, 401)
}

async function abmelden(request, env) {
  const token = cookieLesen(request)
  if (token) {
    const id = await sha256Base64(token)
    await env.DB.prepare('DELETE FROM auth_sessions WHERE id = ?').bind(id).run()
  }
  return json({ abgemeldet: true }, 200, { 'set-cookie': sitzungsCookie('', 0) })
}

export async function authAntwort(request, env) {
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/api/auth/')) return null
  if (!env.DB) return json({ fehler: 'Die Kontodatenbank ist gerade nicht verfügbar.' }, 503)

  if (request.method === 'GET' && url.pathname === '/api/auth/me') {
    return aktuellesKonto(request, env)
  }
  if (request.method !== 'POST' || !gleicherUrsprung(request)) {
    return json({ fehler: 'Diese Anfrage ist nicht erlaubt.' }, 403)
  }
  if (url.pathname === '/api/auth/register') return registrieren(request, env)
  if (url.pathname === '/api/auth/login') return anmelden(request, env)
  if (url.pathname === '/api/auth/logout') return abmelden(request, env)
  return json({ fehler: 'Nicht gefunden.' }, 404)
}

export const AUTH_REGELN = Object.freeze({
  emailMax: EMAIL_MAX,
  passwortMin: PASSWORT_MIN,
  passwortMax: PASSWORT_MAX,
  sessionTage: SESSION_TAGE,
})
