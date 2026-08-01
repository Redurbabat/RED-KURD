// Echte Fotos für einzelne Kurswörter — sie ersetzen in den Bildaufgaben
// die Emojis. Quelle ist Wikimedia Commons; verkleinerte Kopien (480 px)
// liegen lokal unter public/bilder/woerter/, die Quellenangaben wandern in
// src/data/wortFotos.js und public/bilder/woerter/credits.json.
//
// Aufruf:  node scripts/wort-fotos.mjs           (fehlende Fotos holen)
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ZIEL = resolve('public/bilder/woerter')
const CACHE = resolve('scripts/fotocache/woerter')
const DATEN = resolve('src/data/wortFotos.js')
const API = 'https://commons.wikimedia.org/w/api.php'
const BREITE = 480

/** Schlüssel ist das Kurmancî-Wort, exakt wie in den Kursdaten. */
const WOERTER = [
  // Essen & Trinken
  { ku: 'av', suche: 'glass of water', alt: 'Ein Glas Wasser' },
  { ku: 'nan', suche: 'flatbread baked', alt: 'Frisch gebackenes Fladenbrot' },
  { ku: 'çay', suche: 'tea glass saucer black tea', alt: 'Schwarzer Tee im Glas' },
  { ku: 'şîr', suche: 'milk glass bottle white', alt: 'Ein Glas Milch' },
  { ku: 'penîr', suche: 'white cheese feta', alt: 'Weißer Käse' },
  { ku: 'goşt', title: 'File:Meat skewers (41181693760).jpg', alt: 'Fleisch am Spieß' },
  { ku: 'sêv', suche: 'red apple fruit', alt: 'Ein roter Apfel' },
  { ku: 'birinc', suche: 'cooked rice bowl', alt: 'Eine Schüssel Reis' },
  { ku: 'fêkî', suche: 'fruit basket assorted', alt: 'Ein Korb mit Obst' },
  // Tiere
  { ku: 'mî', title: 'File:Black Sheep Closeup.jpg', alt: 'Ein Schaf' },
  { ku: 'bizin', title: 'File:Brown and white goat standing on a tire, Parque Rural Tambor, Aveiras de Cima, Portugal julesvernex2.jpg', alt: 'Eine Ziege' },
  { ku: 'kûçik', suche: 'dog portrait', alt: 'Ein Hund' },
  { ku: 'pisîk', suche: 'cat portrait', alt: 'Eine Katze' },
  { ku: 'hesp', suche: 'brown horse standing pasture', alt: 'Ein Pferd' },
  { ku: 'çûk', suche: 'small songbird branch', alt: 'Ein kleiner Vogel' },
  { ku: 'masî', suche: 'fish swimming', alt: 'Ein Fisch' },
  { ku: 'çêlek', title: 'File:Fine Holstein Cow - geograph.org.uk - 4666716.jpg', alt: 'Eine Kuh' },
  { ku: 'şêr', suche: 'lion portrait', alt: 'Ein Löwe' },
  { ku: 'gur', suche: 'grey wolf', alt: 'Ein Wolf' },
  // Natur
  { ku: 'roj', suche: 'sun bright sky', alt: 'Die Sonne am Himmel' },
  { ku: 'heyv', title: 'File:Full Moon Luc Viatour.jpg', alt: 'Der Vollmond' },
  { ku: 'stêrk', suche: 'milky way night photograph', alt: 'Sternenhimmel' },
  { ku: 'çiya', suche: 'mountain peak snow', alt: 'Ein Berg mit Schnee' },
  { ku: 'dar', suche: 'lone tree field', alt: 'Ein einzelner Baum' },
  { ku: 'gul', suche: 'red rose flower', alt: 'Eine rote Rose' },
  { ku: 'baran', suche: 'rain drops window', alt: 'Regentropfen' },
  { ku: 'berf', suche: 'snow covered landscape', alt: 'Schneelandschaft' },
  { ku: 'agir', suche: 'campfire flames', alt: 'Ein Lagerfeuer' },
  // Kleidung
  { ku: 'kiras', suche: 'shirt folded', alt: 'Ein Hemd' },
  { ku: 'şalwar', suche: 'shalwar trousers', alt: 'Weite Hose (Şalwar)' },
  { ku: 'sol', suche: 'brown leather shoes photograph', alt: 'Ein Paar Schuhe' },
  { ku: 'çakêt', suche: 'jacket coat hanging', alt: 'Eine Jacke' },
  { ku: 'kum', suche: 'knitted cap wool', alt: 'Eine Mütze' },
  { ku: 'fîstan', suche: 'summer dress mannequin', alt: 'Ein Kleid' },
  { ku: 'gore', suche: 'wool socks pair', alt: 'Ein Paar Socken' },
  { ku: 'qayîş', suche: 'leather belt buckle', alt: 'Ein Gürtel' },
  { ku: 'çente', suche: 'handbag leather', alt: 'Eine Tasche' },
  { ku: 'gustîl', suche: 'gold ring jewelry', alt: 'Ein Ring' },
  // Körper
  { ku: 'çav', suche: 'human eye closeup', alt: 'Ein Auge' },
  { ku: 'dest', suche: 'open hand palm', alt: 'Eine offene Hand' },
  { ku: 'dev', suche: 'lips mouth closeup', alt: 'Ein Mund' },
  { ku: 'guh', suche: 'human ear closeup', alt: 'Ein Ohr' },
  { ku: 'por', suche: 'braided hair braid', alt: 'Langes Haar' },
  { ku: 'diran', suche: 'smile teeth closeup', alt: 'Zähne beim Lächeln' },
  { ku: 'pê', suche: 'bare feet sand', alt: 'Füße' },
  // Verkehr
  { ku: 'bisiklêt', suche: 'bicycle standing', alt: 'Ein Fahrrad' },
  { ku: 'motorsîklêt', suche: 'motorbike side view parked', alt: 'Ein Motorrad' },
  { ku: 'taksî', suche: 'yellow taxi street', alt: 'Ein Taxi' },
  { ku: 'rawestgeh', suche: 'bus stop shelter', alt: 'Eine Haltestelle' },
  { ku: 'stasyon', suche: 'railway station platform', alt: 'Ein Bahnhof' },
  { ku: 'balafirgeh', suche: 'airport terminal apron', alt: 'Ein Flughafen' },
  { ku: 'keştî', title: 'File:Sailing Ship - panoramio.jpg', alt: 'Ein Schiff' },
  { ku: 'şiverê', suche: 'footpath trail hills', alt: 'Ein Pfad' },
  // Obst
  { ku: 'mûz', suche: 'bananas bunch', alt: 'Bananen' },
  { ku: 'pirteqal', suche: 'oranges fruit', alt: 'Orangen' },
  { ku: 'lîmon', suche: 'lemons fruit', alt: 'Zitronen' },
  { ku: 'tirî', title: 'File:Owoce Winogron.jpg', alt: 'Trauben' },
  { ku: 'çilek', suche: 'strawberries bowl', alt: 'Erdbeeren' },
  { ku: 'zebeş', suche: 'watermelon slice', alt: 'Wassermelone' },
  { ku: 'qawûn', suche: 'cantaloupe melon', alt: 'Melone' },
  { ku: 'hirmî', suche: 'pears fruit', alt: 'Birnen' },
  { ku: 'xox', suche: 'peaches fruit', alt: 'Pfirsiche' },
  { ku: 'gêlas', suche: 'sweet cherries fruit red', alt: 'Kirschen' },
  { ku: 'hinar', title: 'File:Pomegranate fruit - whole and piece with arils.jpg', alt: 'Ein aufgeschnittener Granatapfel' },
  // Gemüse
  { ku: 'firingî', suche: 'tomatoes ripe', alt: 'Tomaten' },
  { ku: 'xiyar', suche: 'cucumbers fresh', alt: 'Gurken' },
  { ku: 'kartol', suche: 'potatoes raw', alt: 'Kartoffeln' },
  { ku: 'pîvaz', suche: 'onions bulbs', alt: 'Zwiebeln' },
  { ku: 'gêzer', suche: 'fresh orange carrots vegetable', alt: 'Karotten' },
  { ku: 'bîber', suche: 'bell peppers colorful', alt: 'Paprika' },
  { ku: 'bacanê reş', suche: 'eggplant aubergine', alt: 'Auberginen' },
  { ku: 'sîr', suche: 'garlic bulbs', alt: 'Knoblauch' },
  { ku: 'kelem', suche: 'cabbage head', alt: 'Ein Kohlkopf' },
  { ku: 'ispanaq', suche: 'spinach leaves fresh', alt: 'Spinat' },
  { ku: 'fasûlî', suche: 'green beans fresh', alt: 'Grüne Bohnen' },
  { ku: 'kivark', suche: 'mushrooms forest edible', alt: 'Pilze' },
  // Küche
  { ku: 'kevçî', suche: 'wooden spoon single', alt: 'Ein Löffel' },
  { ku: 'çetel', title: 'File:Fork isolated on white background 03.jpg', alt: 'Eine Gabel' },
  { ku: 'kêr', suche: 'kitchen knife', alt: 'Ein Messer' },
  { ku: 'firaq', suche: 'empty white plate', alt: 'Ein Teller' },
  { ku: 'qedeh', suche: 'drinking glass empty', alt: 'Ein Glas' },
  { ku: 'fîncan', suche: 'coffee cup saucer', alt: 'Eine Tasse' },
  { ku: 'beroş', suche: 'cooking pot stove', alt: 'Ein Kochtopf' },
  { ku: 'firin', suche: 'kitchen oven', alt: 'Ein Backofen' },
  { ku: 'sarinc', suche: 'refrigerator kitchen', alt: 'Ein Kühlschrank' },
  // Wetter
  { ku: 'ewr', suche: 'cumulus clouds sky', alt: 'Wolken' },
  { ku: 'bahoz', suche: 'storm dark clouds', alt: 'Ein Sturm zieht auf' },
  { ku: 'mij', suche: 'fog forest morning', alt: 'Nebel' },
  { ku: 'birûsk', suche: 'lightning strike night', alt: 'Ein Blitz' },
  { ku: 'sîwan', suche: 'umbrella rain open', alt: 'Ein Regenschirm' },
  // Wohnung & Zuhause
  { ku: 'mase', suche: 'kitchen table wooden chairs', alt: 'Ein Holztisch' },
  { ku: 'kursî', suche: 'chair furniture wooden simple', alt: 'Ein Stuhl' },
  { ku: 'çira', suche: 'table lamp lit', alt: 'Eine Lampe' },
  { ku: 'derî', suche: 'old wooden door', alt: 'Eine Holztür' },
  { ku: 'pencere', suche: 'window green shutters facade', alt: 'Ein Fenster' },
  { ku: 'baxçe', suche: 'flower garden colorful', alt: 'Ein Garten' },
  { ku: 'balkon', suche: 'balcony flowers house', alt: 'Ein Balkon' },
  { ku: 'pirtûk', suche: 'open book reading table', alt: 'Ein aufgeschlagenes Buch' },
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

const commonsSeite = (title) =>
  `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
const warten = (ms) => new Promise((f) => setTimeout(f, ms))
const slug = (ku) =>
  ku
    .toLowerCase()
    .replace(/[^a-zêîûşç0-9]+/g, '-')
    .replace(/^-|-$/g, '')

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
    await warten(ergebnis.status === 429 ? 30000 * versuch : 1000 * 2 ** (versuch - 1))
  }
  throw new Error(`Abruf fehlgeschlagen: ${url}`)
}

function taugt(info) {
  if (!info) return false
  if (!['image/jpeg', 'image/png'].includes(info.mime)) return false
  if ((info.width || 0) < 480 || (info.height || 0) < 320) return false
  const seiten = info.width / info.height
  if (seiten < 0.55 || seiten > 2.4) return false
  const lizenz = textAusHtml(info.extmetadata?.LicenseShortName?.value || '')
  if (/fair use|non-free/i.test(lizenz)) return false
  return true
}

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
  const suchDaten = await (await abrufen(`${API}?${suchParameter}`)).json()
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
  const infoDaten = await (await abrufen(`${API}?${infoParameter}`)).json()
  const nachTitel = new Map(
    Object.values(infoDaten.query?.pages || {}).map((seite) => [seite.title, seite])
  )
  for (const t of titel) {
    const info = nachTitel.get(t)?.imageinfo?.[0]
    if (taugt(info)) return { title: t, info }
  }
  return null
}

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
  const daten = await (await abrufen(`${API}?${parameter}`)).json()
  const seite = Object.values(daten.query?.pages || {})[0]
  const info = seite?.imageinfo?.[0]
  return taugt(info) ? { title: seite.title, info } : null
}

await mkdir(ZIEL, { recursive: true })
await mkdir(CACHE, { recursive: true })
const eintraege = []
const probleme = []

for (const wort of WOERTER) {
  const kennung = slug(wort.ku)
  const dateiPfad = resolve(ZIEL, `${kennung}.jpg`)
  const nachweisPfad = resolve(CACHE, `${kennung}.json`)

  if ((await existiert(dateiPfad)) && (await existiert(nachweisPfad))) {
    eintraege.push(JSON.parse(await readFile(nachweisPfad, 'utf8')))
    continue
  }

  let treffer = null
  try {
    treffer = wort.title ? await direkt(wort.title) : await suche(wort.suche)
  } catch (fehler) {
    probleme.push(`${wort.ku}: ${fehler.message}`)
    continue
  }
  if (!treffer) {
    probleme.push(`${wort.ku}: kein brauchbares Foto für „${wort.suche || wort.title}“`)
    continue
  }

  const bild = await abrufen(treffer.info.thumburl)
  await writeFile(dateiPfad, Buffer.from(await bild.arrayBuffer()))

  const meta = treffer.info.extmetadata || {}
  const eintrag = {
    ku: wort.ku,
    src: `/bilder/woerter/${kennung}.jpg`,
    alt: wort.alt,
    urheber: textAusHtml(meta.Artist?.value) || 'siehe Wikimedia Commons',
    lizenz: textAusHtml(meta.LicenseShortName?.value) || 'siehe Dateiseite',
    lizenzUrl: meta.LicenseUrl?.value || commonsSeite(treffer.title),
    quelle: commonsSeite(treffer.title),
    titel: treffer.title.replace(/^File:/, ''),
  }
  await writeFile(nachweisPfad, JSON.stringify(eintrag, null, 2) + '\n')
  eintraege.push(eintrag)
  console.log(`geholt  ${wort.ku}  ←  ${eintrag.titel}`)
  await warten(3000)
}

const inhalt =
  '// GENERIERT von scripts/wort-fotos.mjs — nicht von Hand bearbeiten.\n' +
  '// Echte Fotos für einzelne Kurswörter (Wikimedia Commons, lokal gespeichert).\n' +
  '// Schlüssel ist das Kurmancî-Wort, exakt wie in den Kursdaten.\n' +
  'export const wortFotos = ' +
  JSON.stringify(Object.fromEntries(eintraege.map((e) => [e.ku, e])), null, 2) +
  '\n'
await writeFile(DATEN, inhalt)
await writeFile(
  resolve(ZIEL, 'credits.json'),
  JSON.stringify(
    { quelle: 'Wikimedia Commons', fotos: eintraege.map(({ ku, ...rest }) => ({ id: ku, datei: rest.src, ...rest })) },
    null,
    2
  ) + '\n'
)

console.log(`\n${eintraege.length} Wörter mit Foto, ${probleme.length} Probleme.`)
for (const p of probleme) console.log('  ! ' + p)
