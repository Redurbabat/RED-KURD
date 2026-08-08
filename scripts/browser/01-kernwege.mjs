// Browser-Regression fuer RED-KURD, im echten Produktionsbuendel.
// Deckt die Sprach-App (Kernwege, Router, Sitzung, Moduswechsel) UND die drei
// anderen Apps ab. Aufruf: BASIS=http://localhost:4174 CHROME=... node browser.mjs
import { chromium } from 'playwright'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (name, wahr, detail = '') => {
  if (wahr) { bestanden++; console.log('OK  ', name) }
  else { fehlgeschlagen++; console.log('FEHL', name, detail) }
}

const heute = new Date().toISOString().slice(0, 10)
const browser = await chromium.launch({ executablePath: process.env.CHROME })

// `vite preview` beantwortet unbekannte /api-Pfade mit 500 text/plain. Die App
// faengt das ab (authApi: JSON -> echter Server, sonst Statik-Server) und laeuft
// ohne Anmeldung weiter. Dieser eine Netzfehler ist erwartet und wird gefiltert.
function fehlerSammler(page, topf) {
  page.on('pageerror', (e) => topf.push('pageerror: ' + e))
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/api/')) topf.push(`http ${r.status()}: ${r.url()}`)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) topf.push('console: ' + m.text())
  })
}

// ===== Teil 1: die Sprach-App =====
{
  const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
  await ctx.addInitScript((tag) => {
    localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('language'))
    localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
    localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
      version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
      minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag,
    }))
    localStorage.setItem('red-kurd-progress-v2', JSON.stringify({
      version: 2, xp: 245, serie: 3, letzterTag: tag,
      einheiten: { begruessung: 100 }, sterne: { begruessung: 2 },
      karten: {}, tage: {}, edelsteine: 120, schluessel: 1, lernzeit: 100,
    }))
  }, heute)
  const page = await ctx.newPage()
  const fehler = []
  fehlerSammler(page, fehler)

  await page.goto(BASIS + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  ok('Startseite ohne Login-Riegel', !(await page.locator('text=Anmelden').first().isVisible().catch(() => false)))
  ok('App-Hülle da', (await page.locator('nav, .rk-nav, [class*=nav]').count()) > 0)

  await page.goto(BASIS + '/course', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const text = await page.evaluate(() => document.body.innerText)
  ok('Kursseite zeichnet Inhalt', text.length > 200, `${text.length} Zeichen`)

  // Kaputte Adresse: der Router muss sie abfangen, nicht die App.
  await page.evaluate(() => history.pushState({}, '', '/course/%E0%A4%A'))
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')))
  await page.waitForTimeout(400)
  ok('Kaputte Adresse stürzt nicht ab', (await page.evaluate(() => document.body.innerText.length)) > 40)

  // Sitzungsdauer landet im sessionStorage, nicht im Lernstand.
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  for (const knopf of await page.locator('button').all()) {
    const t = (await knopf.innerText().catch(() => '')) || ''
    if (/Kurz|Standard|Intensiv/.test(t)) { await knopf.click().catch(() => {}); break }
  }
  await page.waitForTimeout(400)
  ok('Alter Schlüssel rk-dauer wird nicht geschrieben',
    (await page.evaluate(() => sessionStorage.getItem('rk-dauer'))) === null)

  // Moduswechsel darf den Lernstand nicht anfassen.
  const vorher = await page.evaluate(() => JSON.parse(localStorage.getItem('red-kurd-progress-v2')).xp)
  await page.goto(BASIS + '/adventure', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const nachher = await page.evaluate(() => JSON.parse(localStorage.getItem('red-kurd-progress-v2')).xp)
  ok('XP nach Moduswechsel unverändert', vorher === nachher, `${vorher} -> ${nachher}`)

  for (const pfad of ['/practice', '/explore/culture', '/progress', '/settings', '/languages', '/adventure/worlds']) {
    await page.goto(BASIS + pfad, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(250)
  }
  ok('Alle Kernseiten ohne JS-Fehler', fehler.length === 0, fehler[0] || '')
  await ctx.close()
}

// ===== Teil 2: alle vier Apps =====
const APPS = [
  ['language', 'Sprache lernen'], ['code', 'Code lernen'],
  ['prompting', 'AI-Sprache'], ['electro', 'Elektro-Lehre'],
]
for (const [id, name] of APPS) {
  const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
  await ctx.addInitScript(([app, tag]) => {
    localStorage.setItem('red-kurd-active-app-v1', JSON.stringify(app))
    localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
    localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
      version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
      minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag,
    }))
  }, [id, heute])
  const page = await ctx.newPage()
  const fehler = []
  fehlerSammler(page, fehler)
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  ok(`${name}: zeichnet Inhalt`, (await page.evaluate(() => document.body.innerText.length)) > 80)
  ok(`${name}: keine JS-Fehler`, fehler.length === 0, fehler[0] || '')
  ok(`${name}: bedienbar`, (await page.locator('button:visible').count()) > 0)
  await ctx.close()
}

// ===== Teil 3: die Migration im echten Browser =====
// Ein Gerät, das seit Version 1 nicht mehr in der App war — inklusive einer
// Karte in der alten Schreibweise, die diese Änderung gerade behoben hat.
{
  const ctx = await browser.newContext()
  await ctx.addInitScript(() => {
    localStorage.setItem('red-kurd-fortschritt-v1', JSON.stringify({
      xp: 340, serie: 5, letzterTag: '2026-01-10',
      lektionen: { begruessung: 100 },
      karten: { 'Pilz|kundir|erkennen': { stufe: 4, faellig: '2026-01-11' } },
      tage: { '2026-01-10': 20 }, edelsteine: 25,
    }))
    localStorage.setItem('red-kurd-profil-v1', JSON.stringify({ name: 'Rojîn', minuten: '20' }))
    localStorage.setItem('red-kurd-modus', 'klassik')
    localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  })
  const page = await ctx.newPage()
  const fehler = []
  fehlerSammler(page, fehler)
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)

  const nach = await page.evaluate(() => ({
    stand: JSON.parse(localStorage.getItem('red-kurd-progress-v2') || 'null'),
    profil: JSON.parse(localStorage.getItem('red-kurd-profile-v2') || 'null'),
    altStand: localStorage.getItem('red-kurd-fortschritt-v1'),
    altProfil: localStorage.getItem('red-kurd-profil-v1'),
  }))
  ok('v1-Lernstand ist nach v2 gehoben', nach.stand?.xp === 340 && nach.stand?.serie === 5, JSON.stringify(nach.stand)?.slice(0, 120))
  ok('v1-Profil ist gehoben, Tagesziel abgeleitet', nach.profil?.name === 'Rojîn' && nach.profil?.tagesziel === 30)
  ok('alte Schlüssel liegen unangetastet weiter', !!nach.altStand && !!nach.altProfil)
  ok('Karte trägt jetzt die aktuelle Schreibweise',
    !!nach.stand?.karten?.['Pilz|kivark|erkennen'] && !nach.stand?.karten?.['Pilz|kundir|erkennen'],
    Object.keys(nach.stand?.karten || {}).join(', '))
  ok('Migration ohne JS-Fehler', fehler.length === 0, fehler[0] || '')
  await ctx.close()
}

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
