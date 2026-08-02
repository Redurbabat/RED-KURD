// Echte Lernfotos für alle Kurmancî-Kapitel.
// Quelle ist Wikimedia Commons: das Skript sucht je Kapitel ein passendes,
// frei lizenziertes Foto, lädt eine verkleinerte Kopie (720 px) nach
// public/bilder/kapitel/ und schreibt die Quellenangaben nach
// src/data/kapitelFotos.js — die App bleibt dadurch offline nutzbar und
// gibt keine Nutzer-IP an einen Bilddienst weiter.
//
// Aufruf:  node scripts/kapitel-fotos.mjs           (fehlende Fotos holen)
//          node scripts/kapitel-fotos.mjs --neu id  (ein Kapitel neu holen)
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ZIEL = resolve('public/bilder/kapitel')
const CACHE = resolve('scripts/fotocache')
const DATEN = resolve('src/data/kapitelFotos.js')
const API = 'https://commons.wikimedia.org/w/api.php'
const BREITE = 720

/**
 * Je Kapitel entweder ein fester Commons-Titel (`title`) oder eine Suche
 * (`suche`). `vorhanden` verweist auf ein bereits lokal gespeichertes Foto
 * aus public/bilder/lernwelt — das wird wiederverwendet statt neu geladen.
 * Bewusst vermieden: Motive mit Moschee-Silhouetten oder türkischen Symbolen.
 */
const KAPITEL = [
  { id: 'begruessung', title: 'File:Hermandad - friendship.jpg', alt: 'Zwei Hände greifen einander — Gruß und Freundschaft' },
  { id: 'vorstellen', suche: 'two people talking bench park photo', alt: 'Menschen im Gespräch' },
  { id: 'namefragen', suche: 'hello my name is badge', alt: 'Namensschild mit Aufschrift Hello' },
  { id: 'herkunft', suche: 'old world map atlas', alt: 'Alte Weltkarte' },
  { id: 'verabschieden', title: 'File:Taiwan Taoyuan Airport ground crew waving goodbye at flight May 2025.jpg', alt: 'Zum Abschied wird gewinkt' },
  { id: 'familie', suche: 'family walking together park', alt: 'Eine Familie unterwegs' },
  { id: 'verwandtschaft', suche: 'family dinner people eating together', alt: 'Große Familie am gedeckten Tisch' },
  { id: 'zuhause', title: 'File:Qesrikê.jpg', alt: 'Das kurdische Dorf Qesrikê' },
  { id: 'stadt', vorhanden: 'landschaft', alt: 'Akrê mit Häusern und Bergen in Kurdistan' },
  { id: 'gaeste', title: 'File:Pouring Kurdish tea.jpg', alt: 'Kurdischer Tee wird ins Glas eingeschenkt' },
  { id: 'essen', suche: 'dolma stuffed vine leaves plate', alt: 'Kurdische Gerichte auf dem Tisch' },
  { id: 'zeit', suche: 'alarm clock on table', alt: 'Uhrturm' },
  { id: 'einkaufen', suche: 'bazaar Erbil market', alt: 'Basar in Hewlêr (Erbil)' },
  { id: 'arbeit', title: 'File:Farmers from the wheat harvest season.jpg', alt: 'Bauern bei der Weizenernte' },
  { id: 'taetigkeiten', suche: 'baking bread tandoor oven', alt: 'Brotbacken am Ofen' },
  { id: 'verkehr', suche: 'city street bus traffic', alt: 'Straße mit Bus und Verkehr' },
  { id: 'wegbeschreibung', suche: 'signpost direction hiking', alt: 'Wegweiser mit Richtungen' },
  { id: 'reisen', vorhanden: 'zug', alt: 'Personenzug an einem Bahnsteig' },
  { id: 'hotel', suche: 'hotel reception lobby', alt: 'Empfang eines Hotels' },
  { id: 'orientierung', title: 'File:Hand holding Compass against clouds.jpg', alt: 'Eine Hand hält einen Kompass gegen den Himmel' },
  { id: 'newroz', title: 'File:Views of the fire walk for the Newroz festival in Akre in 2018 13.jpg', alt: 'Newroz in Akrê: Fackelzug den Berg hinauf' },
  { id: 'musik', title: 'File:"Daf Players" Conference in Bojnourd 13 Mehr.jpg', alt: 'Musikerin mit Daf, der Rahmentrommel' },
  { id: 'dengbej', suche: 'dengbej Kurdish singer', alt: 'Dengbêj — kurdischer Sänger-Erzähler' },
  { id: 'redewendungen', suche: 'samovar tea culture', alt: 'Samowar und Teegläser' },
  { id: 'geschichten', title: 'File:Close-up of child reading a book.jpg', alt: 'Ein Kind liest in einem Buch' },
  { id: 'zahlen', suche: 'wooden number blocks toy', alt: 'Bunte Zahlen' },
  { id: 'koerper', suche: 'hands together people', alt: 'Hände von Menschen' },
  { id: 'gefuehle', suche: 'children laughing happy', alt: 'Lachende Kinder' },
  { id: 'gesundheit', suche: 'pharmacy medicine shelf', alt: 'Regal einer Apotheke' },
  { id: 'freundschaft', suche: 'friends sitting together laughing', alt: 'Freunde zusammen' },
  { id: 'natur', title: 'File:Pendro Kurdistan.jpg', alt: 'Berge um das Dorf Pendro in Kurdistan' },
  { id: 'tiere', suche: 'flock of sheep road herd', alt: 'Schafherde in den Bergen' },
  { id: 'farben', suche: 'colorful yarn wool skeins', alt: 'Bunte Wolle' },
  { id: 'kleidung', suche: 'Kurdish traditional clothing dress', alt: 'Traditionelle kurdische Kleidung' },
  { id: 'verben', suche: 'people running outdoor', alt: 'Laufende Menschen' },
  { id: 'fragen', suche: 'students raising hands classroom', alt: 'Meldende Schüler im Unterricht' },
  { id: 'schule', vorhanden: 'schule', alt: 'Echtes Klassenzimmer mit Tischen, Stühlen und Tafel' },
  { id: 'saetze', suche: 'handwriting notebook pen', alt: 'Schreiben in ein Heft' },
  // Erweiterte Kapitel
  { id: 'wochentage', suche: 'wall calendar pages', alt: 'Wandkalender' },
  { id: 'wetter', suche: 'rainbow storm clouds landscape', alt: 'Regenbogen über einer Landschaft' },
  { id: 'wohnung', vorhanden: 'haus', alt: 'Modernes Wohnhaus in Deutschland' },
  { id: 'kueche', vorhanden: 'kueche', alt: 'Echte Aufnahme einer eingerichteten Küche' },
  { id: 'obst', vorhanden: 'obst', alt: 'Verschiedene frische Früchte auf einem Tablett' },
  { id: 'gemuese', vorhanden: 'gemuese', alt: 'Eine Auswahl verschiedener frischer Gemüsesorten' },
  { id: 'sport', suche: 'children playing football field', alt: 'Kinder beim Fußballspielen' },
  { id: 'digital', suche: 'smartphone hands typing', alt: 'Hände mit Smartphone' },
  { id: 'restaurant', vorhanden: 'restaurant', alt: 'Gedeckter Tisch in einem Restaurant' },
  { id: 'gespraech', title: 'File:Woman smiling while talking on the phone by the window.jpg', alt: 'Eine Frau telefoniert lächelnd am Fenster' },
  { id: 'zahlen-gross', suche: 'market price tags vegetables', alt: 'Preisschilder auf einem Markt' },
  { id: 'notfall', suche: 'ambulance modern emergency street', alt: 'Rettungswagen' },
  // Neue Kapitel (Welt 10)
  { id: 'jahreszeiten', title: 'File:Almond Blossom Blooming (138687479).jpeg', alt: 'Mandelblüte — der Frühling beginnt' },
  { id: 'hochzeit', suche: 'Kurdish wedding', alt: 'Tanz auf einer kurdischen Hochzeit' },
  { id: 'handwerk', suche: 'carpet weaving loom hands', alt: 'Teppichweben am Webstuhl' },
  { id: 'gebirge', suche: 'Hawraman village Kurdistan', alt: 'Hochweide in den Bergen Kurdistans' },
  { id: 'meinung', suche: 'people discussion meeting', alt: 'Menschen im Austausch' },
  { id: 'alltagssaetze', title: 'File:Easton Lodge Gardens, Little Easton, Essex, England outdoor café 17.jpg', alt: 'Gespräch an Cafétischen im Freien' },
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

const warten = (ms) => new Promise((f) => setTimeout(f, ms))

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
      headers: { 'user-agent': 'RED-KURD learning app photo curator/1.0' },
    })
    if (ergebnis.ok) return ergebnis
    if (versuch === versuche || ![429, 500, 502, 503, 504].includes(ergebnis.status)) {
      throw new Error(`Abruf: ${ergebnis.status} ${url}`)
    }
    // 429 heisst: deutlich langsamer machen, nicht nur kurz blinzeln.
    await warten(ergebnis.status === 429 ? 30000 * versuch : 1000 * 2 ** (versuch - 1))
  }
  throw new Error(`Abruf fehlgeschlagen: ${url}`)
}

/** Ein Foto taugt, wenn es ein ausreichend großes, frei lizenziertes JPEG/PNG ist. */
function taugt(info) {
  if (!info) return false
  if (!['image/jpeg', 'image/png'].includes(info.mime)) return false
  if ((info.width || 0) < 640 || (info.height || 0) < 360) return false
  const seiten = info.width / info.height
  if (seiten < 0.55 || seiten > 2.6) return false
  const lizenz = textAusHtml(info.extmetadata?.LicenseShortName?.value || '')
  if (/fair use|non-free/i.test(lizenz)) return false
  return true
}

/** Suche auf Commons; gibt die beste brauchbare Seite zurück.
    Zwei leichte Anfragen statt einer schweren: erst Titel suchen, dann
    Bildinfos holen — generator=search antwortet hier sonst mit 503. */
async function suche(begriff) {
  const suchParameter = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    list: 'search',
    srsearch: `filetype:bitmap ${begriff}`,
    srnamespace: '6',
    srlimit: '8',
  })
  const suchAntwort = await abrufen(`${API}?${suchParameter}`)
  const suchDaten = await suchAntwort.json()
  const titel = (suchDaten.query?.search || []).map((s) => s.title)
  if (!titel.length) return null
  await warten(1200)

  const infoParameter = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: titel.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime|size',
    iiurlwidth: String(BREITE),
  })
  const infoAntwort = await abrufen(`${API}?${infoParameter}`)
  const infoDaten = await infoAntwort.json()
  const nachTitel = new Map(
    Object.values(infoDaten.query?.pages || {}).map((seite) => [seite.title, seite])
  )
  // Reihenfolge der Suchtreffer beibehalten — der erste brauchbare gewinnt.
  for (const t of titel) {
    const info = nachTitel.get(t)?.imageinfo?.[0]
    if (taugt(info)) return { title: t, info }
  }
  return null
}

/** Fester Titel: Bildinfo direkt holen. */
async function direkt(title) {
  const parameter = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime|size',
    iiurlwidth: String(BREITE),
  })
  const antwort = await abrufen(`${API}?${parameter}`)
  const daten = await antwort.json()
  const seite = Object.values(daten.query?.pages || {})[0]
  const info = seite?.imageinfo?.[0]
  return taugt(info) ? { title: seite.title, info } : null
}

async function vorhandeneNachweise() {
  try {
    const roh = await readFile(resolve('public/bilder/lernwelt/credits.json'), 'utf8')
    const daten = JSON.parse(roh)
    return new Map((daten.fotos || []).map((f) => [f.id, f]))
  } catch {
    return new Map()
  }
}

const neuHolen = new Set(
  process.argv.includes('--neu') ? process.argv.slice(process.argv.indexOf('--neu') + 1) : []
)

await mkdir(ZIEL, { recursive: true })
await mkdir(CACHE, { recursive: true })
const lernwelt = await vorhandeneNachweise()
const eintraege = []
const probleme = []

for (const kapitel of KAPITEL) {
  // Wiederverwendung: das Foto liegt schon lokal in bilder/lernwelt.
  if (kapitel.vorhanden) {
    const nachweis = lernwelt.get(kapitel.vorhanden)
    if (!nachweis) {
      probleme.push(`${kapitel.id}: lernwelt-Foto „${kapitel.vorhanden}“ fehlt`)
      continue
    }
    eintraege.push({
      id: kapitel.id,
      src: nachweis.datei,
      alt: kapitel.alt,
      urheber: nachweis.urheber,
      lizenz: nachweis.lizenz,
      lizenzUrl: nachweis.lizenzUrl,
      quelle: nachweis.quelle,
      titel: nachweis.titel,
    })
    continue
  }

  const dateiPfad = resolve(ZIEL, `${kapitel.id}.jpg`)
  const schonDa = (await existiert(dateiPfad)) && !neuHolen.has(kapitel.id)
  const nachweisPfad = resolve(CACHE, `${kapitel.id}.json`)

  if (schonDa && (await existiert(nachweisPfad))) {
    eintraege.push(JSON.parse(await readFile(nachweisPfad, 'utf8')))
    continue
  }

  const treffer = kapitel.title ? await direkt(kapitel.title) : await suche(kapitel.suche)
  if (!treffer) {
    probleme.push(`${kapitel.id}: kein brauchbares Foto für „${kapitel.suche || kapitel.title}“`)
    continue
  }

  const bild = await abrufen(treffer.info.thumburl)
  await writeFile(dateiPfad, Buffer.from(await bild.arrayBuffer()))

  const meta = treffer.info.extmetadata || {}
  const eintrag = {
    id: kapitel.id,
    src: `/bilder/kapitel/${kapitel.id}.jpg`,
    alt: kapitel.alt,
    urheber: textAusHtml(meta.Artist?.value) || 'siehe Wikimedia Commons',
    lizenz: textAusHtml(meta.LicenseShortName?.value) || 'siehe Dateiseite',
    lizenzUrl: meta.LicenseUrl?.value || commonsSeite(treffer.title),
    quelle: commonsSeite(treffer.title),
    titel: treffer.title.replace(/^File:/, ''),
  }
  await writeFile(nachweisPfad, JSON.stringify(eintrag, null, 2) + '\n')
  eintraege.push(eintrag)
  console.log(`geholt  ${kapitel.id}  ←  ${eintrag.titel}`)
  await warten(3000)
}

// Generierte Datendatei — die App liest Fotos und Nachweise von hier.
// Ein misslungener Lauf darf die vorhandenen Nachweise nicht loeschen.
if (probleme.length) {
  console.error(`\nAbbruch: ${probleme.length} Kapitel ohne Foto — Datendatei bleibt unveraendert.`)
  for (const p of probleme) console.error('  ! ' + p)
  process.exit(1)
}

const inhalt =
  '// GENERIERT von scripts/kapitel-fotos.mjs — nicht von Hand bearbeiten.\n' +
  '// Echte Fotos aus Wikimedia Commons, lokal gespeichert, mit Quellenangabe.\n' +
  'export const kapitelFotos = ' +
  JSON.stringify(Object.fromEntries(eintraege.map((e) => [e.id, e])), null, 2) +
  '\n'
await writeFile(DATEN, inhalt)
await writeFile(
  resolve(ZIEL, 'credits.json'),
  JSON.stringify({ quelle: 'Wikimedia Commons', fotos: eintraege }, null, 2) + '\n'
)

console.log(`\n${eintraege.length} Kapitel mit Foto, ${probleme.length} Probleme.`)
for (const p of probleme) console.log('  ! ' + p)
