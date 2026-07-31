import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../sites/worker.js'

function testUmgebung({ mitR2 = false } = {}) {
  const objekte = new Map()
  const env = {
    R2_UPLOAD_TOKEN: 'test-geheimnis',
    ASSETS: {
      async fetch(request) {
        const url = new URL(request.url)
        if (url.pathname === '/index.html') {
          return new Response(
            '<html><meta property="og:image" content="__SITE_ORIGIN__/og.png"></html>',
            { headers: { 'content-type': 'text/html; charset=utf-8' } }
          )
        }
        return new Response('fehlt', { status: 404 })
      },
    },
  }
  if (mitR2) {
    env.RED_KURD_DATA = {
      async get(key) {
        const wert = objekte.get(key)
        if (!wert) return null
        return {
          key,
          size: wert.body.byteLength,
          body: wert.body,
          httpEtag: '"test-etag"',
          writeHttpMetadata(headers) {
            if (wert.httpMetadata?.contentType) {
              headers.set('content-type', wert.httpMetadata.contentType)
            }
            if (wert.httpMetadata?.cacheControl) {
              headers.set('cache-control', wert.httpMetadata.cacheControl)
            }
          },
        }
      },
      async head(key) {
        return this.get(key)
      },
      async put(key, body, optionen) {
        const wert = new Uint8Array(await new Response(body).arrayBuffer())
        objekte.set(key, { body: wert, httpMetadata: optionen?.httpMetadata })
        return { key, size: wert.byteLength, httpEtag: '"test-etag"' }
      },
    }
  }
  return env
}

test('öffentliche Tiefenlinks erhalten die App-Hülle und absolute Vorschaubilder', async () => {
  const response = await worker.fetch(
    new Request('https://lernen.example/course/begruessung', {
      headers: { accept: 'text/html' },
    }),
    testUmgebung()
  )

  assert.equal(response.status, 200)
  assert.match(await response.text(), /https:\/\/lernen\.example\/og\.png/)
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/)
})

test('fehlende Nicht-HTML-Dateien werden nicht auf die App-Hülle umgeleitet', async () => {
  const response = await worker.fetch(
    new Request('https://lernen.example/fehlt.png', {
      headers: { accept: 'image/avif,image/webp' },
    }),
    testUmgebung()
  )

  assert.equal(response.status, 404)
})

test('Cloudflare-R2-Daten haben Vorrang vor statischen Dateien', async () => {
  const env = testUmgebung({ mitR2: true })
  const upload = await worker.fetch(
    new Request('https://lernen.example/__admin/r2/daten/test.json', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-geheimnis',
        'content-type': 'application/json',
        'content-length': '11',
      },
      body: '{"ok":true}',
    }),
    env
  )
  assert.equal(upload.status, 201)

  const response = await worker.fetch(
    new Request('https://lernen.example/daten/test.json'),
    env
  )
  assert.equal(response.status, 200)
  assert.equal(await response.text(), '{"ok":true}')
  assert.equal(response.headers.get('etag'), '"test-etag"')
})

test('R2-Upload ist ohne korrektes Geheimnis gesperrt', async () => {
  const response = await worker.fetch(
    new Request('https://lernen.example/__admin/r2/daten/test.json', {
      method: 'PUT',
      headers: { 'content-length': '2' },
      body: '{}',
    }),
    testUmgebung({ mitR2: true })
  )
  assert.equal(response.status, 401)
})

test('R2 liefert die App-Hülle aus, wenn das statische Binding fehlt', async () => {
  const env = testUmgebung({ mitR2: true })
  const html = '<html><meta property="og:image" content="__SITE_ORIGIN__/og.png"></html>'
  const upload = await worker.fetch(
    new Request('https://lernen.example/__admin/r2/app/index.html', {
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-geheimnis',
        'content-type': 'text/html; charset=utf-8',
        'content-length': String(html.length),
        'cache-control': 'no-cache',
      },
      body: html,
    }),
    env
  )
  assert.equal(upload.status, 201)

  const response = await worker.fetch(
    new Request('https://lernen.example/today', {
      headers: { accept: 'text/html' },
    }),
    env
  )
  assert.equal(response.status, 200)
  assert.match(await response.text(), /https:\/\/lernen\.example\/og\.png/)
  assert.equal(response.headers.get('cache-control'), 'no-cache')
})
