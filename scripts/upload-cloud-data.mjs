import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'

const MAX_DATEI = 95 * 1024 * 1024
const MAX_GESAMT = 3 * 1024 * 1024 * 1024
const ARGUMENTE = process.argv.slice(2)
const QUELLE = resolve(ARGUMENTE.find((arg) => !arg.startsWith('-')) || 'local-data/cloudflare')
const TROCKEN = ARGUMENTE.includes('--dry-run')
const PRAEFIX = (ARGUMENTE.find((arg) => arg.startsWith('--prefix=')) || '')
  .slice('--prefix='.length)
  .replace(/^\/+|\/+$/g, '')
const AUSLASSEN = new Set(
  (ARGUMENTE.find((arg) => arg.startsWith('--exclude=')) || '')
    .slice('--exclude='.length)
    .split(',')
    .map((wert) => wert.trim())
    .filter(Boolean)
)
const BASIS = String(process.env.RED_KURD_SITE_URL || '').replace(/\/+$/, '')
const TOKEN = process.env.RED_KURD_UPLOAD_TOKEN

const TYPEN = {
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

async function dateienUnter(ordner, relativ = '') {
  const ausgabe = []
  for (const eintrag of await readdir(ordner, { withFileTypes: true })) {
    const relativPfad = relativ ? `${relativ}/${eintrag.name}` : eintrag.name
    if (AUSLASSEN.has(relativPfad.split('/')[0])) continue
    const pfad = resolve(ordner, eintrag.name)
    if (eintrag.isDirectory()) ausgabe.push(...(await dateienUnter(pfad, relativPfad)))
    else if (eintrag.isFile()) ausgabe.push(pfad)
  }
  return ausgabe
}

function schluessel(pfad) {
  const relativPfad = relative(QUELLE, pfad).split(sep).join('/')
  return [PRAEFIX, relativPfad].filter(Boolean).join('/')
}

function urlSchluessel(key) {
  return key.split('/').map(encodeURIComponent).join('/')
}

function cacheRegel(key) {
  if (key === 'app/index.html' || key === 'app/sw.js' || key === 'app/manifest.webmanifest') {
    return 'no-cache'
  }
  if (/^app\/assets\/.+-[A-Za-z0-9_-]{8,}\./.test(key)) {
    return 'public, max-age=31536000, immutable'
  }
  return 'public, max-age=3600, stale-while-revalidate=86400'
}

function warten(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms))
}

async function hochladen(eintrag) {
  const versuche = 5
  for (let versuch = 1; versuch <= versuche; versuch += 1) {
    try {
      const antwort = await fetch(`${BASIS}/__admin/r2/${urlSchluessel(eintrag.key)}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${TOKEN}`,
          'content-type': TYPEN[extname(eintrag.pfad).toLowerCase()] || 'application/octet-stream',
          'content-length': String(eintrag.info.size),
          'cache-control': cacheRegel(eintrag.key),
        },
        body: createReadStream(eintrag.pfad),
        duplex: 'half',
      })
      if (antwort.ok) return
      const text = await antwort.text()
      if (antwort.status < 500 && ![408, 429].includes(antwort.status)) {
        throw new Error(`${eintrag.key}: ${antwort.status} ${text}`)
      }
      if (versuch === versuche) {
        throw new Error(`${eintrag.key}: ${antwort.status} ${text}`)
      }
    } catch (fehler) {
      if (versuch === versuche || String(fehler.message).startsWith(`${eintrag.key}: 4`)) {
        throw fehler
      }
    }
    const pause = 1000 * 2 ** (versuch - 1)
    console.warn(`${eintrag.key}: Verbindung unterbrochen, neuer Versuch in ${pause / 1000} s.`)
    await warten(pause)
  }
}

if (!TROCKEN && (!BASIS || !TOKEN)) {
  throw new Error('RED_KURD_SITE_URL und RED_KURD_UPLOAD_TOKEN müssen gesetzt sein.')
}

const dateien = await dateienUnter(QUELLE)
const eintraege = await Promise.all(
  dateien.map(async (pfad) => ({ pfad, info: await stat(pfad), key: schluessel(pfad) }))
)
const gesamt = eintraege.reduce((summe, eintrag) => summe + eintrag.info.size, 0)
const zuGross = eintraege.find((eintrag) => eintrag.info.size > MAX_DATEI)

if (zuGross) throw new Error(`Datei über 95 MiB bleibt lokal: ${zuGross.key}`)
if (gesamt > MAX_GESAMT) throw new Error('Der Cloudflare-Ordner ist größer als 3 GiB.')

console.log(
  `${eintraege.length} Dateien, ${(gesamt / 1024 / 1024).toFixed(1)} MiB` +
    (TROCKEN ? ' – Prüfung abgeschlossen.' : ' – Upload startet.')
)

if (!TROCKEN) {
  let fertig = 0
  for (const eintrag of eintraege) {
    await hochladen(eintrag)
    fertig += eintrag.info.size
    console.log(`${((fertig / gesamt) * 100).toFixed(1)} %  ${eintrag.key}`)
  }
  console.log('Cloudflare-R2-Upload abgeschlossen.')
}
