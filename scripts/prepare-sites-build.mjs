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

// __SITE_ORIGIN__ (og:image/twitter:image) ersetzt normalerweise der
// Cloudflare-Worker zur Laufzeit. Statische Hosts wie Vercel liefern den
// Platzhalter sonst woertlich aus — kaputte Link-Vorschauen. Ist SITE_ORIGIN
// (oder Vercels produktive URL) beim Build bekannt, ersetzen wir schon hier;
// ohne Angabe bleibt der Platzhalter fuer den Worker stehen.
const origin =
  process.env.SITE_ORIGIN ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '')
if (origin) {
  const indexUrl = new URL('../dist/index.html', import.meta.url)
  const html = await readFile(indexUrl, 'utf8')
  await writeFile(indexUrl, html.replaceAll('__SITE_ORIGIN__', origin.replace(/\/$/, '')))
  console.log(`__SITE_ORIGIN__ -> ${origin}`)
}
