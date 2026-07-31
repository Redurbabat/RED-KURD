import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'

const MAX_DATEI = 95 * 1024 * 1024
const MAX_GESAMT = 3 * 1024 * 1024 * 1024
const ARGUMENTE = process.argv.slice(2)
const QUELLE = resolve(ARGUMENTE.find((arg) => !arg.startsWith('-')) || 'local-data/cloudflare')
const TROCKEN = ARGUMENTE.includes('--dry-run')
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
  '.txt': 'text/plain; charset=utf-8',
}

async function dateienUnter(ordner) {
  const ausgabe = []
  for (const eintrag of await readdir(ordner, { withFileTypes: true })) {
    const pfad = resolve(ordner, eintrag.name)
    if (eintrag.isDirectory()) ausgabe.push(...(await dateienUnter(pfad)))
    else if (eintrag.isFile()) ausgabe.push(pfad)
  }
  return ausgabe
}

function schluessel(pfad) {
  return relative(QUELLE, pfad).split(sep).map(encodeURIComponent).join('/')
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
    const antwort = await fetch(`${BASIS}/__admin/r2/${eintrag.key}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${TOKEN}`,
        'content-type': TYPEN[extname(eintrag.pfad).toLowerCase()] || 'application/octet-stream',
        'content-length': String(eintrag.info.size),
        'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
      body: createReadStream(eintrag.pfad),
      duplex: 'half',
    })
    if (!antwort.ok) {
      throw new Error(`${eintrag.key}: ${antwort.status} ${await antwort.text()}`)
    }
    fertig += eintrag.info.size
    console.log(`${((fertig / gesamt) * 100).toFixed(1)} %  ${eintrag.key}`)
  }
  console.log('Cloudflare-R2-Upload abgeschlossen.')
}
