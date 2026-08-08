// Sprachaufnahmen im echten Browser: Datenbank-Hebung von Version 1 auf 2,
// Liste, Groesse, Loeschen — und die Zusage, dass eine aeltere App-Version die
// Aufnahmen weiter lesen koennte.
import { chromium } from 'playwright'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
const heute = new Date().toISOString().slice(0, 10)
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
    version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag }))
  localStorage.setItem('red-kurd-progress-v2', JSON.stringify({
    version: 2, xp: 100, serie: 1, letzterTag: tag, einheiten: {}, sterne: {},
    karten: {}, tage: {}, edelsteine: 0, schluessel: 0, lernzeit: 0 }))
}, heute)

const page = await ctx.newPage()
const fehler = []
page.on('pageerror', (e) => fehler.push(String(e)))

// --- 1. Eine Datenbank in der ALTEN Version 1 anlegen, wie sie vor dieser
//        Aenderung entstanden waere: nur `aufnahmen`, nur rohe Blobs. -------
await page.goto(BASIS + '/', { waitUntil: 'domcontentloaded' })
const altAngelegt = await page.evaluate(async () => {
  await new Promise((res, rej) => {
    const r = indexedDB.deleteDatabase('red-kurd-audio')
    r.onsuccess = res; r.onerror = rej; r.onblocked = res
  })
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open('red-kurd-audio', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('aufnahmen')
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
  })
  await new Promise((res, rej) => {
    const t = db.transaction('aufnahmen', 'readwrite')
    t.objectStore('aufnahmen').put(new Blob([new Uint8Array(2048)], { type: 'audio/webm' }), 'silav')
    t.objectStore('aufnahmen').put(new Blob([new Uint8Array(4096)], { type: 'audio/webm' }), 'spas')
    t.oncomplete = res; t.onerror = () => rej(t.error)
  })
  db.close()
  return true
})
ok('alte Datenbank (Version 1) mit zwei Aufnahmen angelegt', altAngelegt)

// --- 2. App laden: die Hebung auf Version 2 muss die Aufnahmen behalten ----
await page.goto(BASIS + '/progress', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const text1 = await page.evaluate(() => document.body.innerText)
ok('Karte „Sprachaufnahmen" ist da', /Sprachaufnahmen/.test(text1))
ok('die zwei alten Aufnahmen werden gezaehlt', /2 Aufnahmen/.test(text1), text1.match(/.{0,40}Aufnahme.{0,60}/)?.[0] || '')
ok('die Gesamtgroesse wird angezeigt', /\d+ KB|\d+,\d MB/.test(text1), text1.match(/.{0,30}KB.{0,20}/)?.[0] || '')
ok('der Hinweis zur Sicherung steht da', /nicht Teil der Sicherungsdatei/i.test(text1))

// --- 3. Die Datenbank steht jetzt auf Version 2 — mit BEIDEN Speichern ----
const schema = await page.evaluate(async () => {
  const db = await new Promise((res) => {
    const r = indexedDB.open('red-kurd-audio')
    r.onsuccess = () => res(r.result)
  })
  const namen = [...db.objectStoreNames]
  const version = db.version
  const wert = await new Promise((res) => {
    const r = db.transaction('aufnahmen').objectStore('aufnahmen').get('silav')
    r.onsuccess = () => res({ istBlob: r.result instanceof Blob, groesse: r.result?.size ?? null })
  })
  db.close()
  return { namen, version, wert }
})
ok('Datenbank steht auf Version 2', schema.version === 2, String(schema.version))
ok('beide Objektspeicher vorhanden', schema.namen.includes('aufnahmen') && schema.namen.includes('angaben'), schema.namen.join(','))
ok('die alte Aufnahme ist unveraendert erhalten', schema.wert.istBlob && schema.wert.groesse === 2048, JSON.stringify(schema.wert))
ok('`aufnahmen` enthaelt weiterhin ROHE Blobs — eine aeltere App-Version kann sie lesen', schema.wert.istBlob)

// --- 4. Liste aufklappen ---------------------------------------------------
await page.getByRole('button', { name: /Aufnahmen anzeigen/i }).click()
await page.waitForTimeout(500)
const text2 = await page.evaluate(() => document.body.innerText)
ok('die Liste nennt beide Woerter', /silav/.test(text2) && /spas/.test(text2), text2.slice(-400))

// --- 5. Eine neue Aufnahme bekommt Angaben --------------------------------
await page.evaluate(async () => {
  const db = await new Promise((res) => {
    const r = indexedDB.open('red-kurd-audio')
    r.onsuccess = () => res(r.result)
  })
  await new Promise((res) => {
    const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
    t.objectStore('aufnahmen').put(new Blob([new Uint8Array(8192)], { type: 'audio/webm' }), 'roj')
    t.objectStore('angaben').put({ wort: 'roj', zeit: new Date().toISOString(), groesse: 8192, typ: 'audio/webm' }, 'roj')
    t.oncomplete = res
  })
  db.close()
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const text3 = await page.evaluate(() => document.body.innerText)
ok('die neue Aufnahme wird mitgezaehlt', /3 Aufnahmen/.test(text3), text3.match(/.{0,30}Aufnahme.{0,40}/)?.[0] || '')

// --- 5b. Reihenfolge und Zeitpunkte ---------------------------------------
// Aufgefallen bei einer Gegenprobe: `alleAufnahmen()` durfte den Speicher
// `angaben` vollstaendig ignorieren, ohne dass eine Pruefung es merkte. Die
// Liste haette dann alle Zeitpunkte verloren und ihre Sortierung gleich mit —
// sichtbar nur als „die Reihenfolge ist irgendwie komisch".
//
// Das Wort ist mit Bedacht `zer`: es steht alphabetisch HINTER silav, spas und
// roj. Nur wenn wirklich nach Zeit sortiert wird, steht es oben. Mein erster
// Versuch nahm dafuer `roj` — das steht alphabetisch ohnehin vorn und haette
// beide Reihenfolgen gleich aussehen lassen.
await page.evaluate(async () => {
  const db = await new Promise((res) => {
    const r = indexedDB.open('red-kurd-audio')
    r.onsuccess = () => res(r.result)
  })
  await new Promise((res) => {
    const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
    t.objectStore('aufnahmen').put(new Blob([new Uint8Array(2048)], { type: 'audio/webm' }), 'zer')
    t.objectStore('angaben').put(
      { wort: 'zer', zeit: new Date(Date.now() + 60000).toISOString(), groesse: 2048, typ: 'audio/webm' },
      'zer'
    )
    t.oncomplete = res
  })
  db.close()
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.getByRole('button', { name: /Aufnahmen anzeigen/i }).click()
await page.waitForTimeout(600)
const reihenfolge = await page.locator('.fp-aufnahme-wort').allInnerTexts()
ok('die neueste Aufnahme steht oben, nicht die alphabetisch erste',
  reihenfolge[0] === 'zer', reihenfolge.join(','))
ok('danach kommt die zweitneueste', reihenfolge[1] === 'roj', reihenfolge.join(','))
ok('Aufnahmen ohne Zeitpunkt stehen hinten, dort alphabetisch',
  reihenfolge.slice(2).join(',') === 'silav,spas', reihenfolge.join(','))

// Die Testaufnahme wieder entfernen und die Liste zuklappen — Schritt 6
// erwartet drei Aufnahmen und einen zugeklappten Bereich.
await page.evaluate(async () => {
  const db = await new Promise((res) => {
    const r = indexedDB.open('red-kurd-audio')
    r.onsuccess = () => res(r.result)
  })
  await new Promise((res) => {
    const t = db.transaction(['aufnahmen', 'angaben'], 'readwrite')
    t.objectStore('aufnahmen').delete('zer')
    t.objectStore('angaben').delete('zer')
    t.oncomplete = res
  })
  db.close()
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(900)

// --- 6. Einzeln loeschen ---------------------------------------------------
await page.getByRole('button', { name: /Aufnahmen anzeigen/i }).click()
await page.waitForTimeout(500)
await page.getByRole('button', { name: /Aufnahme zu silav löschen/i }).click()
await page.waitForTimeout(700)
const text4 = await page.evaluate(() => document.body.innerText)
ok('nach dem Loeschen sind es zwei', /2 Aufnahmen/.test(text4), text4.match(/.{0,30}Aufnahme.{0,40}/)?.[0] || '')
// Gezielt die LISTE pruefen, nicht den ganzen Seitentext: die Rueckmeldung
// „Die Aufnahme zu ‚silav' wurde geloescht" enthaelt das Wort ja gerade.
const inListe = await page.locator('.fp-aufnahme-wort').allInnerTexts()
ok('das geloeschte Wort ist aus der Liste verschwunden', !inListe.includes('silav'), inListe.join(','))
ok('die uebrigen stehen noch in der Liste', inListe.includes('spas') && inListe.includes('roj'), inListe.join(','))
ok('die Rueckmeldung nennt das geloeschte Wort', /„silav" wurde gelöscht/i.test(text4), text4.slice(-200))

const nachEinzeln = await page.evaluate(async () => {
  const db = await new Promise((res) => { const r = indexedDB.open('red-kurd-audio'); r.onsuccess = () => res(r.result) })
  const zaehle = (speicher) => new Promise((res) => {
    const r = db.transaction(speicher).objectStore(speicher).getAllKeys()
    r.onsuccess = () => res(r.result)
  })
  const a = await zaehle('aufnahmen'); const b = await zaehle('angaben')
  db.close(); return { aufnahmen: a, angaben: b }
})
ok('Blob UND Angaben sind zusammen geloescht',
  !nachEinzeln.aufnahmen.includes('silav') && !nachEinzeln.angaben.includes('silav'),
  JSON.stringify(nachEinzeln))

// --- 7. Alle loeschen ------------------------------------------------------
await page.getByRole('button', { name: /Alle löschen/i }).click()
await page.waitForTimeout(400)
const dialog = await page.evaluate(() => document.body.innerText)
ok('die Rueckfrage warnt, dass es keine Sicherung gibt', /keiner Sicherung/i.test(dialog), dialog.slice(-300))
await page.getByRole('button', { name: /^Löschen$/ }).click()
await page.waitForTimeout(800)
const text5 = await page.evaluate(() => document.body.innerText)
ok('danach sind es null', /0 Aufnahmen/.test(text5), text5.match(/.{0,30}Aufnahme.{0,40}/)?.[0] || '')
ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
