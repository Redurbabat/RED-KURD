// Cloudflare-Worker-Einstieg für die öffentliche Sites-Version.
// Statische Dateien kommen aus dem ASSETS-Binding; unbekannte App-Adressen
// erhalten index.html, damit der clientseitige Router Tiefenlinks öffnen kann.

function erwartetHtml(request) {
  if (request.method !== 'GET') return false
  return (request.headers.get('accept') || '').includes('text/html')
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
    let response = await env.ASSETS.fetch(request)

    if (response.status === 404 && erwartetHtml(request)) {
      const indexUrl = new URL('/index.html', request.url)
      response = await env.ASSETS.fetch(new Request(indexUrl, request))
    }

    return mitOeffentlicherAdresse(response, request)
  },
}
