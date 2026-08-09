// Die Elektro-Lehre einmal durchklicken.
//
// Warum: die sieben Bausteine der App sind .tsx, `npm test` kann sie nicht
// laden, und bis zur TypeScript-Umstellung gab es fuer sie ueberhaupt keine
// Pruefung. `test/elektroSchule.test.js` deckt die Rechnungen ab — hier geht
// es darum, dass die sechs Bereiche erscheinen und die Rechner tatsaechlich
// rechnen, statt nur ein Eingabefeld zu zeigen.
import { chromium } from 'playwright'
import * as f from '../../src/core/elektro/formeln.ts'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
const heute = new Date().toISOString().slice(0, 10)
await ctx.addInitScript((tag) => {
  if (window.top !== window.self) return
  localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('electro'))
  localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
    version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag,
  }))
}, heute)

const seite = await ctx.newPage()
const fehler = []
seite.on('pageerror', (e) => fehler.push(e.message))
await seite.goto(BASIS + '/', { waitUntil: 'networkidle' })
await seite.waitForTimeout(900)

// Jeder Bereich muss eigene Karten zeigen. Nur „die Seite laedt" waere zu
// wenig — ein leerer Bereich saehe genauso aus.
const ERWARTET = {
  Heute: 'Nächste Prüfung',
  Noten: 'Alle Fächer',
  Prüfung: 'Prüfung',
  Bericht: 'Berichtsheft',
  Formeln: 'Ohmsches Gesetz',
  Lernen: 'berechnen',
}
for (const [name, text] of Object.entries(ERWARTET)) {
  await seite.getByRole('button', { name, exact: true }).click()
  await seite.waitForTimeout(400)
  const karten = (await seite.locator('.rk-karte h2, .rk-karte h3, .rk-karte-titel').allInnerTexts()).join(' / ')
  ok(`Bereich „${name}" zeigt eigene Inhalte`, karten.includes(text), karten.slice(0, 120))
}

/* ---------- Die Rechner rechnen wirklich ---------- */
await seite.getByRole('button', { name: 'Formeln', exact: true }).click()
await seite.waitForTimeout(400)

// Die Erwartung kommt aus derselben Funktion, die auch die App benutzt —
// so prueft der Test die Verdrahtung, nicht noch einmal die Formel.
await seite.locator('#ohm-u').fill('24')
await seite.locator('#ohm-r').fill('8')
await seite.waitForTimeout(300)
const ohmZeilen = await seite.locator('.el-ergebnisse li').allInnerTexts()
const erwarteterStrom = f.strom('24', '8')
ok('I = U ÷ R wird gerechnet, nicht nur angezeigt',
  ohmZeilen.some((z) => z.includes(`${erwarteterStrom} A`)), ohmZeilen.join(' | '))
ok('die beiden anderen Zeilen bleiben leer, solange ihre Werte fehlen',
  ohmZeilen.filter((z) => z.includes('—')).length === 2, ohmZeilen.join(' | '))

await seite.locator('#p-u').fill('230')
await seite.locator('#p-i').fill('16')
await seite.waitForTimeout(300)
const leistung = await seite.locator('.el-ergebnis').first().innerText()
ok('P = U · I wird gerechnet', leistung.includes(String(f.leistung('230', '16'))), leistung)

// Komma statt Punkt muss durchgehen — auf einer deutschen Tastatur tippt
// niemand einen Punkt.
await seite.locator('#ohm-u').fill('4,5')
await seite.locator('#ohm-r').fill('1,5')
await seite.waitForTimeout(300)
const mitKomma = await seite.locator('.el-ergebnisse li').allInnerTexts()
ok('Kommazahlen zaehlen wie Punktzahlen',
  mitKomma.some((z) => z.includes(`${f.strom('4,5', '1,5')} A`)), mitKomma.join(' | '))

ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
