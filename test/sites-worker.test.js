import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../sites/worker.js'

function testUmgebung() {
  return {
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
