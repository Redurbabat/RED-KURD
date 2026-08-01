import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../sites/worker.js'
import {
  AUTH_REGELN,
  cookieLesen,
  emailIstGueltig,
  hashPasswort,
  normalisiereEmail,
  passwortIstGueltig,
  passwortStimmt,
} from '../sites/auth.js'

class TestD1 {
  constructor() {
    this.users = new Map()
    this.sessions = new Map()
    this.events = []
  }

  prepare(sql) {
    const db = this
    let werte = []
    return {
      bind(...neu) {
        werte = neu
        return this
      },
      async first() {
        if (sql.startsWith('SELECT id FROM users WHERE email')) {
          const user = [...db.users.values()].find((eintrag) => eintrag.email === werte[0])
          return user ? { id: user.id } : null
        }
        if (sql.startsWith('SELECT id, email, password_hash')) {
          return [...db.users.values()].find((eintrag) => eintrag.email === werte[0]) || null
        }
        if (sql.startsWith('SELECT users.id, users.email FROM auth_sessions')) {
          const session = db.sessions.get(werte[0])
          if (!session || session.expires_at <= werte[1]) return null
          const user = db.users.get(session.user_id)
          return user ? { id: user.id, email: user.email } : null
        }
        throw new Error(`Nicht unterstützte Testabfrage: ${sql}`)
      },
      async run() {
        if (sql.startsWith('INSERT INTO users')) {
          const [id, email, password_hash, password_salt, password_iterations, created_at, last_login_at] = werte
          if ([...db.users.values()].some((eintrag) => eintrag.email === email)) {
            throw new Error('UNIQUE constraint failed: users.email')
          }
          db.users.set(id, { id, email, password_hash, password_salt, password_iterations, created_at, last_login_at })
          return { success: true }
        }
        if (sql.startsWith('INSERT INTO auth_sessions')) {
          const [id, user_id, created_at, expires_at] = werte
          db.sessions.set(id, { id, user_id, created_at, expires_at })
          return { success: true }
        }
        if (sql.startsWith('INSERT INTO auth_events')) {
          const [id, user_id, email, event_type, text_record, created_at] = werte
          db.events.push({ id, user_id, email, event_type, text_record, created_at })
          return { success: true }
        }
        if (sql.startsWith('UPDATE users SET last_login_at')) {
          const user = db.users.get(werte[1])
          if (user) user.last_login_at = werte[0]
          return { success: true }
        }
        if (sql.startsWith('DELETE FROM auth_sessions')) {
          db.sessions.delete(werte[0])
          return { success: true }
        }
        throw new Error(`Nicht unterstützte Teständerung: ${sql}`)
      },
    }
  }
}

function anfrage(pfad, daten, cookie = '') {
  return new Request(`https://lernen.example${pfad}`, {
    method: daten ? 'POST' : 'GET',
    headers: {
      ...(daten ? { 'content-type': 'application/json', origin: 'https://lernen.example' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: daten ? JSON.stringify(daten) : undefined,
  })
}

test('E-Mail und Passwortregeln lehnen unsichere Werte ab', () => {
  assert.equal(normalisiereEmail('  Name@Beispiel.CH '), 'name@beispiel.ch')
  assert.equal(emailIstGueltig('name@beispiel.ch'), true)
  assert.equal(emailIstGueltig('keine-adresse'), false)
  assert.equal(passwortIstGueltig('zu-kurz'), false)
  assert.equal(passwortIstGueltig('lang-und-sicher'), true)
  assert.equal(AUTH_REGELN.passwortMin, 10)
})

test('Passwörter werden gesalzen gehasht und nicht als Klartext gespeichert', async () => {
  const passwort = 'Ein-Sicheres-Passwort-2026'
  const gespeichert = await hashPasswort(passwort)
  assert.notEqual(gespeichert.hash, passwort)
  assert.equal(await passwortStimmt(passwort, {
    password_hash: gespeichert.hash,
    password_salt: gespeichert.salt,
    password_iterations: gespeichert.iterationen,
  }), true)
  assert.equal(await passwortStimmt('Falsch-Falsch-2026', {
    password_hash: gespeichert.hash,
    password_salt: gespeichert.salt,
    password_iterations: gespeichert.iterationen,
  }), false)
})

test('Registrierung, Sitzung, Anmeldung und Abmeldung funktionieren zusammen', async () => {
  const env = { DB: new TestD1() }
  const passwort = 'Mein-Passwort-2026'
  const registrierung = await worker.fetch(
    anfrage('/api/auth/register', { email: '  Test@Beispiel.CH ', passwort }),
    env
  )
  assert.equal(registrierung.status, 201)
  assert.deepEqual(await registrierung.json(), {
    konto: { id: [...env.DB.users.values()][0].id, email: 'test@beispiel.ch' },
  })
  const user = [...env.DB.users.values()][0]
  assert.notEqual(user.password_hash, passwort)
  assert.equal(JSON.stringify(user).includes(passwort), false)
  assert.equal(env.DB.events.length, 1)
  assert.equal(env.DB.events[0].event_type, 'registrierung')
  assert.match(env.DB.events[0].text_record, /REGISTRIERUNG \| test@beispiel\.ch$/)
  assert.equal(JSON.stringify(env.DB.events).includes(passwort), false)

  const setCookie = registrierung.headers.get('set-cookie')
  assert.match(setCookie, /^rk_session=/)
  assert.match(setCookie, /HttpOnly/)
  assert.match(setCookie, /Secure/)
  assert.match(setCookie, /SameSite=Lax/)
  const cookie = setCookie.split(';')[0]

  const me = await worker.fetch(anfrage('/api/auth/me', null, cookie), env)
  assert.equal(me.status, 200)
  assert.equal((await me.json()).konto.email, 'test@beispiel.ch')

  const falsch = await worker.fetch(
    anfrage('/api/auth/login', { email: 'test@beispiel.ch', passwort: 'Falsches-Passwort' }),
    env
  )
  assert.equal(falsch.status, 401)

  const login = await worker.fetch(
    anfrage('/api/auth/login', { email: 'test@beispiel.ch', passwort }),
    env
  )
  assert.equal(login.status, 200)
  assert.match(login.headers.get('set-cookie'), /^rk_session=/)
  assert.equal(env.DB.events.length, 2)
  assert.equal(env.DB.events[1].event_type, 'anmeldung')
  assert.match(env.DB.events[1].text_record, /ANMELDUNG \| test@beispiel\.ch$/)
  assert.equal(JSON.stringify(env.DB.events).includes(passwort), false)

  const logout = await worker.fetch(anfrage('/api/auth/logout', {}, cookie), env)
  assert.equal(logout.status, 200)
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/)
  assert.equal((await worker.fetch(anfrage('/api/auth/me', null, cookie), env)).status, 401)
})

test('Fremde Ursprünge dürfen keine Kontoaktion auslösen', async () => {
  const request = new Request('https://lernen.example/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://angreifer.example' },
    body: JSON.stringify({ email: 'x@example.com', passwort: 'lang-genug-123' }),
  })
  const response = await worker.fetch(request, { DB: new TestD1() })
  assert.equal(response.status, 403)
})

test('Sitzungscookie wird robust aus mehreren Cookies gelesen', () => {
  const request = new Request('https://lernen.example', {
    headers: { cookie: 'theme=dark; rk_session=abc%2F123%3D; sprache=de' },
  })
  assert.equal(cookieLesen(request), 'abc/123=')
})
