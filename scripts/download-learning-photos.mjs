// Lädt die kuratierte Fotobibliothek von Wikimedia Commons herunter.
// Die Originaldateien bleiben auf Commons; RED-KURD speichert verkleinerte
// Kopien lokal, damit die App offline funktioniert und keine Nutzer-IP an
// einen Bilddienst weitergibt.
import { access, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ZIEL = resolve('public/bilder/lernwelt')
const API = 'https://commons.wikimedia.org/w/api.php'

const FOTOS = [
  {
    id: 'obst',
    datei: 'obst.jpg',
    title: 'File:Liat Portal for Foodie Disorder - Assorted Fresh Fruit Tray.jpg',
    alt: 'Verschiedene frische Früchte auf einem Tablett',
  },
  {
    id: 'gemuese',
    datei: 'gemuese.jpg',
    title: 'File:K8666-1 (8453555721).jpg',
    alt: 'Eine Auswahl verschiedener frischer Gemüsesorten',
  },
  {
    id: 'haus',
    datei: 'haus.jpg',
    title: 'File:German House.jpg',
    alt: 'Modernes Wohnhaus in Deutschland',
  },
  {
    id: 'kueche',
    datei: 'kueche.jpg',
    title: 'File:Kitchen interior design.jpg',
    alt: 'Echte Aufnahme einer eingerichteten Küche',
  },
  {
    id: 'restaurant',
    datei: 'restaurant.jpg',
    title: "File:Arnaud's restaurant, New Orleans, interior November 2013 - Table setting.jpg",
    alt: 'Gedeckter Tisch in einem Restaurant',
  },
  {
    id: 'landschaft',
    datei: 'landschaft.jpg',
    title: 'File:Akre city.jpg',
    alt: 'Akrê mit Häusern und Bergen in Kurdistan',
  },
  {
    id: 'schule',
    datei: 'schule.jpg',
    title: 'File:Classroom2.jpg',
    alt: 'Echtes Klassenzimmer mit Tischen, Stühlen und Tafel',
  },
  {
    id: 'zug',
    datei: 'zug.jpg',
    title: 'File:Gusev passenger train 2025-05 5354.JPG',
    alt: 'Personenzug an einem Bahnsteig',
  },
]

function textAusHtml(wert = '') {
  return String(wert)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function commonsSeite(title) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
}

function warten(ms) {
  return new Promise((auflosen) => setTimeout(auflosen, ms))
}

async function existiert(pfad) {
  try {
    await access(pfad)
    return true
  } catch {
    return false
  }
}

async function abrufen(url, versuche = 5) {
  for (let versuch = 1; versuch <= versuche; versuch += 1) {
    const ergebnis = await fetch(url, {
      headers: { 'user-agent': 'RED-KURD learning app photo downloader/1.0' },
    })
    if (ergebnis.ok) return ergebnis
    if (versuch === versuche || ![429, 500, 502, 503, 504].includes(ergebnis.status)) {
      throw new Error(`Download: ${ergebnis.status} ${url}`)
    }
    await warten(1000 * 2 ** (versuch - 1))
  }
  throw new Error(`Download fehlgeschlagen: ${url}`)
}

await mkdir(ZIEL, { recursive: true })

const parameter = new URLSearchParams({
  action: 'query',
  format: 'json',
  origin: '*',
  titles: FOTOS.map((foto) => foto.title).join('|'),
  prop: 'imageinfo',
  iiprop: 'url|extmetadata|mime',
  iiurlwidth: '1200',
})

const antwort = await abrufen(`${API}?${parameter}`)

const daten = await antwort.json()
const seiten = new Map(
  Object.values(daten.query?.pages || {}).map((seite) => [seite.title, seite])
)
const nachweise = []

for (const foto of FOTOS) {
  const seite = seiten.get(foto.title)
  const info = seite?.imageinfo?.[0]
  if (!info?.thumburl) throw new Error(`Foto nicht gefunden: ${foto.title}`)

  const bildPfad = resolve(ZIEL, foto.datei)
  if (!(await existiert(bildPfad))) {
    const bildAntwort = await abrufen(info.thumburl)
    await writeFile(bildPfad, Buffer.from(await bildAntwort.arrayBuffer()))
    await warten(1500)
  }

  const meta = info.extmetadata || {}
  nachweise.push({
    id: foto.id,
    datei: `/bilder/lernwelt/${foto.datei}`,
    alt: foto.alt,
    titel: foto.title.replace(/^File:/, ''),
    urheber: textAusHtml(meta.Artist?.value) || 'siehe Wikimedia Commons',
    lizenz: textAusHtml(meta.LicenseShortName?.value) || 'siehe Dateiseite',
    lizenzUrl: meta.LicenseUrl?.value || commonsSeite(foto.title),
    quelle: commonsSeite(foto.title),
  })
}

await writeFile(
  resolve(ZIEL, 'credits.json'),
  JSON.stringify({ quelle: 'Wikimedia Commons', fotos: nachweise }, null, 2) + '\n'
)
console.log(`${nachweise.length} echte Fotos mit Quellenangaben gespeichert.`)
