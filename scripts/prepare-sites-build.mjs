import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../sites/worker.js', import.meta.url),
  new URL('../dist/server/index.js', import.meta.url)
)
await copyFile(
  new URL('../sites/auth.js', import.meta.url),
  new URL('../dist/server/auth.js', import.meta.url)
)

// __SITE_ORIGIN__ (og:image/twitter:image) ersetzt im Normalfall der
// Cloudflare-Worker zur Laufzeit — er ist das Deployment-Ziel der App.
// Fuer Sonderfaelle (Vorschau auf einem rein statischen Host) kann
// SITE_ORIGIN den Platzhalter schon beim Build ersetzen; ohne Angabe
// bleibt er fuer den Worker stehen.
const origin = process.env.SITE_ORIGIN || ''
if (origin) {
  const indexUrl = new URL('../dist/index.html', import.meta.url)
  const html = await readFile(indexUrl, 'utf8')
  await writeFile(indexUrl, html.replaceAll('__SITE_ORIGIN__', origin.replace(/\/$/, '')))
  console.log(`__SITE_ORIGIN__ -> ${origin}`)
}
