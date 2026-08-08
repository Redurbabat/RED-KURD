// Der Rundlauf im echten Buendel: Sicherung erzeugen, wieder einspielen,
// und dabei pruefen, dass die Vorschau vor der Rueckfrage steht.
import { chromium } from 'playwright'
import { readFileSync, existsSync, rmSync } from 'node:fs'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({ viewport: { width: 428, height: 926 }, acceptDownloads: true })
const heute = new Date().toISOString().slice(0, 10)
// ACHTUNG: addInitScript laeuft bei JEDEM Seitenaufbau, also auch nach dem
// window.location.reload() am Ende des Einspielens. Ohne die Marke unten
// wuerde der Ausgangsstand danach wieder daruebergeschrieben — und der Test
// meldete einen Fehler, den die App gar nicht hat.
await ctx.addInitScript((tag) => {
  // Playwright spielt dieses Skript in JEDEN Rahmen ein — auch in die
  // sandboxed Live-Vorschau der Code-Aufgaben. Die hat kein
  // allow-same-origin, jeder localStorage-Zugriff wirft dort, und der
  // Wurf landet als „JS-Fehler" im Ergebnis, obwohl die App fehlerfrei
  // ist. Nur der oberste Rahmen wird geseedet.
  if (window.top !== window.self) return
  if (localStorage.getItem('pruef-geseedet')) return
  localStorage.setItem('pruef-geseedet', '1')
  localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('language'))
  localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
    version: 2, name: 'Evin', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag }))
  localStorage.setItem('red-kurd-progress-v2', JSON.stringify({
    version: 2, xp: 1200, serie: 9, letzterTag: tag,
    einheiten: { begruessung: 100, familie: 90 }, sterne: { begruessung: 3 },
    karten: { 'Brot|nan|erkennen': { stufe: 3 }, 'Brot|nan|schreiben': { stufe: 1 }, 'Wasser|av|erkennen': { stufe: 5 } },
    tage: {}, edelsteine: 44, schluessel: 2, lernzeit: 900 }))
  localStorage.setItem('red-kurd-code-progress-v1', JSON.stringify({
    version: 1, xp: 90, erledigt: { a: '2026-07-01', b: '2026-07-02' }, notizen: {}, serie: 2, letzterTag: tag, tage: {} }))
  localStorage.setItem('red-kurd-shop-v1', JSON.stringify({ version: 1, gekauft: ['helo-schal'], aktiv: {} }))
}, heute)

const page = await ctx.newPage()
const fehler = []
page.on('pageerror', (e) => fehler.push(String(e)))

await page.goto(BASIS + '/progress', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

// --- 1. Exportieren -------------------------------------------------------
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 15000 }),
  page.getByRole('button', { name: /export|sicherung|herunterladen|speichern/i }).first().click(),
])
const pfad = process.env.ABLAGE + '/lernstand.json'
if (existsSync(pfad)) rmSync(pfad)
await download.saveAs(pfad)
const datei = JSON.parse(readFileSync(pfad, 'utf8'))

ok('Export traegt Version und App im Kopf', datei.version === 2 && datei.app === 'RED-KURD')
ok('Export enthaelt den Lernstand', datei.fortschritt?.xp === 1200)
ok('Export enthaelt die anderen Apps', datei.speicher?.codeFortschritt?.xp === 90)
ok('Profil steht nur noch EINMAL in der Datei',
  datei.profil === undefined && datei.speicher?.profil?.name === 'Evin',
  `oben: ${JSON.stringify(datei.profil)} / unten: ${JSON.stringify(datei.speicher?.profil)}`)
ok('Shop steht nur noch EINMAL in der Datei',
  datei.shop === undefined && Array.isArray(datei.speicher?.shop?.gekauft))
ok('laufende Sitzung ist NICHT in der Datei', datei.speicher?.sitzung === undefined)

// --- 2. Eine fremde Datei wird abgelehnt, ohne etwas zu schreiben ---------
const vorher = await page.evaluate(() => localStorage.getItem('red-kurd-progress-v2'))
await page.setInputFiles('input[type=file]', {
  name: 'fremd.json', mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ app: 'EineAndereApp', fortschritt: { xp: 1 } })),
})
await page.waitForTimeout(700)
const text = await page.evaluate(() => document.body.innerText)
ok('fremde Datei wird abgelehnt und begruendet', /andere[nr]? App/i.test(text), text.slice(0, 200))
ok('fremde Datei hat nichts geschrieben',
  (await page.evaluate(() => localStorage.getItem('red-kurd-progress-v2'))) === vorher)
ok('keine Rueckfrage bei einer abgelehnten Datei',
  !(await page.getByText('Lernstand ersetzen?').isVisible().catch(() => false)))

// --- 3. Die eigene Datei: Vorschau muss VOR der Rueckfrage stehen ---------
await page.setInputFiles('input[type=file]', pfad)
await page.waitForTimeout(700)
const dialog = await page.evaluate(() => document.body.innerText)
ok('Rueckfrage erscheint', /Lernstand ersetzen/i.test(dialog))
ok('Vorschau nennt das Datum der Sicherung', /Sicherung vom/i.test(dialog), dialog.slice(0, 300))
ok('Vorschau stellt Jetzt und Datei nebeneinander', /Jetzt/.test(dialog) && /Aus der Datei/.test(dialog))
ok('Vorschau nennt die Kennzahlen', /1200/.test(dialog) && /Wiederholkarten/.test(dialog))
ok('Vorschau nennt die anderen Apps', /Code lernen/.test(dialog), dialog.slice(0, 400))

// --- 4. Eine aeltere Sicherung: „weniger" muss auffallen -----------------
await page.getByRole('button', { name: /abbrechen/i }).first().click()
await page.waitForTimeout(300)
const aermer = { ...datei, fortschritt: { ...datei.fortschritt, xp: 10, serie: 1 } }
await page.setInputFiles('input[type=file]', {
  name: 'alt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(aermer)),
})
await page.waitForTimeout(700)
const warnung = await page.evaluate(() => document.body.innerText)
ok('eine aermere Sicherung wird als „weniger" gekennzeichnet', /\(weniger\)/.test(warnung), warnung.slice(0, 400))

// --- 5. Einspielen und nachsehen -----------------------------------------
await page.getByRole('button', { name: /^Ersetzen$/ }).first().click()
await page.waitForTimeout(2500)
const danach = await page.evaluate(() => ({
  stand: JSON.parse(localStorage.getItem('red-kurd-progress-v2') || 'null'),
  code: JSON.parse(localStorage.getItem('red-kurd-code-progress-v1') || 'null'),
  profil: JSON.parse(localStorage.getItem('red-kurd-profile-v2') || 'null'),
}))
ok('der eingespielte Lernstand steht im Speicher', danach.stand?.xp === 10 && danach.stand?.serie === 1, JSON.stringify(danach.stand)?.slice(0, 120))
ok('die anderen Apps kamen mit', danach.code?.xp === 90)
ok('das Profil kam mit', danach.profil?.name === 'Evin')
ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
