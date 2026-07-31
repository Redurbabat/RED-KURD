// Cloudflare-Worker-Einstieg für die öffentliche Sites-Version.
// Statische Dateien kommen aus dem ASSETS-Binding; unbekannte App-Adressen
// erhalten index.html, damit der clientseitige Router Tiefenlinks öffnen kann.

const DATEN_PREFIX = '/daten/'
const ADMIN_PREFIX = '/__admin/r2/'
const MAX_UPLOAD = 95 * 1024 * 1024

function erwartetHtml(request) {
  if (request.method !== 'GET') return false
  return (request.headers.get('accept') || '').includes('text/html')
}

function schluesselAusPfad(pfad, prefix) {
  if (!pfad.startsWith(prefix)) return null
  try {
    const key = decodeURIComponent(pfad.slice(prefix.length))
    if (!key || key.includes('..') || key.includes('\\') || key.startsWith('/')) return null
    return key
  } catch {
    return null
  }
}

async function tokenStimmt(request, erwartet) {
  if (!erwartet) return false
  const gegeben = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!gegeben) return false
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(gegeben)),
    crypto.subtle.digest('SHA-256', encoder.encode(erwartet)),
  ])
  const links = new Uint8Array(a)
  const rechts = new Uint8Array(b)
  let unterschied = 0
  for (let i = 0; i < links.length; i += 1) unterschied |= links[i] ^ rechts[i]
  return unterschied === 0
}

async function r2Lesen(request, env) {
  if (!env.RED_KURD_DATA || !['GET', 'HEAD'].includes(request.method)) return null
  const url = new URL(request.url)
  const rest = schluesselAusPfad(url.pathname, DATEN_PREFIX)
  if (!rest) return null
  const key = `daten/${rest}`

  const objekt =
    request.method === 'HEAD'
      ? await env.RED_KURD_DATA.head(key)
      : await env.RED_KURD_DATA.get(key)
  if (!objekt) return null

  const headers = new Headers()
  objekt.writeHttpMetadata(headers)
  headers.set('etag', objekt.httpEtag)
  headers.set('content-length', String(objekt.size))
  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'public, max-age=3600, stale-while-revalidate=86400')
  }

  if (request.headers.get('if-none-match') === objekt.httpEtag) {
    return new Response(null, { status: 304, headers })
  }

  return new Response(request.method === 'HEAD' ? null : objekt.body, { headers })
}

async function r2Hochladen(request, env) {
  const url = new URL(request.url)
  const key = schluesselAusPfad(url.pathname, ADMIN_PREFIX)
  if (!key) return null
  if (request.method !== 'PUT') {
    return new Response('Nur PUT ist erlaubt.', { status: 405, headers: { allow: 'PUT' } })
  }
  if (!env.RED_KURD_DATA || !(await tokenStimmt(request, env.R2_UPLOAD_TOKEN))) {
    return new Response('Nicht erlaubt.', { status: 401 })
  }
  if (!key.startsWith('daten/')) {
    return new Response('Nur öffentliche Kursdaten sind erlaubt.', { status: 400 })
  }

  const laenge = Number(request.headers.get('content-length'))
  if (!Number.isFinite(laenge) || laenge < 0) {
    return new Response('Content-Length fehlt.', { status: 411 })
  }
  if (laenge > MAX_UPLOAD) {
    return new Response('Datei ist größer als 95 MiB.', { status: 413 })
  }

  const objekt = await env.RED_KURD_DATA.put(key, request.body, {
    httpMetadata: {
      contentType: request.headers.get('content-type') || 'application/octet-stream',
      cacheControl:
        request.headers.get('cache-control') ||
        'public, max-age=3600, stale-while-revalidate=86400',
    },
    customMetadata: { quelle: 'lokaler-red-kurd-upload' },
  })

  return Response.json(
    { gespeichert: true, key: objekt.key, groesse: objekt.size, etag: objekt.httpEtag },
    { status: 201 }
  )
}

async function mitOeffentlicherAdresse(response, request) {
  const typ = response.headers.get('content-type') || ''
  if (!typ.includes('text/html')) return response

  const ursprung = new URL(request.url).origin
  const html = (await response.text()).replaceAll('__SITE_ORIGIN__', ursprung)
  const headers = new Headers(response.headers)
  headers.set('content-length', String(new TextEncoder().encode(html).byteLength))
  headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-frame-options', 'SAMEORIGIN')
  headers.set(
    'content-security-policy',
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; " +
      "script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; " +
      "worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'"
  )
  return new Response(html, { status: response.status, statusText: response.statusText, headers })
}

export default {
  async fetch(request, env) {
    const adminAntwort = await r2Hochladen(request, env)
    if (adminAntwort) return adminAntwort

    const datenAntwort = await r2Lesen(request, env)
    if (datenAntwort) return datenAntwort

    let response = await env.ASSETS.fetch(request)

    if (response.status === 404 && erwartetHtml(request)) {
      const indexUrl = new URL('/index.html', request.url)
      response = await env.ASSETS.fetch(new Request(indexUrl, request))
    }

    return mitOeffentlicherAdresse(response, request)
  },
}
