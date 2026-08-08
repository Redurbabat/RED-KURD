// Zwei echte Tabs im selben Browser-Profil.
//
// Der Unit-Test stellt das Ereignis nach; hier loest es der Browser selbst aus.
// Nur so ist belegt, dass `localStorage.clear()` in Tab B in Tab A wirklich als
// `storage`-Ereignis mit `key === null` ankommt — die ganze Behebung haengt an
// dieser Annahme ueber das Browserverhalten.
//
// Welche Zusage hier traegt: „Tab A zeigt den alten Stand nicht mehr an". Nur
// die faellt ohne die Behebung um (per Gegenprobe geprueft). Der eigentliche
// Rueckschreib-Vorgang braucht eine echte Lernaktion und laesst sich hier nicht
// verlaesslich ausloesen — den deckt `test/mehrereTabs.test.js` genau ab.
import { chromium } from 'playwright'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const browser = await chromium.launch({ executablePath: process.env.CHROME })
// EIN Kontext = ein Browser-Profil = geteilter localStorage. Zwei Seiten darin
// sind zwei Tabs.
const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
const heute = new Date().toISOString().slice(0, 10)
// Die Marke steht im sessionStorage, NICHT im localStorage: `clear()` loescht
// sonst auch sie, und die naechste Navigation saet alles neu — dann prueft der
// Test seinen eigenen Aufbau statt der App. (Genau das ist mir hier passiert.)
await ctx.addInitScript((tag) => {
  // Playwright spielt dieses Skript in JEDEN Rahmen ein — auch in die
  // sandboxed Live-Vorschau der Code-Aufgaben. Die hat kein
  // allow-same-origin, jeder localStorage-Zugriff wirft dort, und der
  // Wurf landet als „JS-Fehler" im Ergebnis, obwohl die App fehlerfrei
  // ist. Nur der oberste Rahmen wird geseedet.
  if (window.top !== window.self) return
  if (sessionStorage.getItem('pruef-geseedet')) return
  sessionStorage.setItem('pruef-geseedet', '1')
  localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('language'))
  localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
    version: 2, name: 'Evin', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag }))
  localStorage.setItem('red-kurd-progress-v2', JSON.stringify({
    version: 2, xp: 500, serie: 12, letzterTag: tag, einheiten: {}, sterne: {},
    karten: {}, tage: {}, edelsteine: 30, schluessel: 0, lernzeit: 0 }))
}, heute)

const tabA = await ctx.newPage()
const fehler = []
tabA.on('pageerror', (e) => fehler.push(String(e)))
await tabA.goto(BASIS + '/progress', { waitUntil: 'networkidle' })
await tabA.waitForTimeout(900)

const vorher = await tabA.evaluate(() => JSON.parse(localStorage.getItem('red-kurd-progress-v2')).xp)
ok('Tab A hat den Lernstand geladen', vorher === 500, String(vorher))

// Tab A soll seinen Modul-Cache wirklich gefuellt haben — die Seite hat den
// Stand ja gerade gezeichnet.
const sichtbar = await tabA.evaluate(() => document.body.innerText.includes('500'))
ok('Tab A zeigt den Stand an (Cache ist gefuellt)', sichtbar)

// --- Tab B loescht alles ---------------------------------------------------
const tabB = await ctx.newPage()
await tabB.goto(BASIS + '/', { waitUntil: 'domcontentloaded' })
await tabB.evaluate(() => localStorage.clear())
await tabB.close()

// Der Browser stellt das Ereignis zu; kurz warten.
await tabA.waitForTimeout(600)

const nachClear = await tabA.evaluate(() => localStorage.getItem('red-kurd-progress-v2'))
ok('nach dem clear() ist der Speicher wirklich leer', nachClear === null, String(nachClear))

// --- Tab A bleibt offen und zeichnet neu -----------------------------------
// KEIN Neuladen: dabei laese die App ohnehin frisch von der Platte und der
// Modul-Cache waere unbeteiligt. Der ganze Fehler lebt davon, dass der Tab
// offen BLEIBT. Deshalb wird nur innerhalb der App navigiert — der Router
// arbeitet mit `history.pushState`, das laedt die Seite nicht neu.
await tabA.evaluate(() => {
  history.pushState({}, '', '/today')
  window.dispatchEvent(new PopStateEvent('popstate'))
})
await tabA.waitForTimeout(500)
await tabA.evaluate(() => {
  history.pushState({}, '', '/progress')
  window.dispatchEvent(new PopStateEvent('popstate'))
})
await tabA.waitForTimeout(800)

const zeigtAlt = await tabA.evaluate(() => document.body.innerText.includes('500'))
ok('Tab A zeigt den alten Stand nicht mehr an (Cache wurde verworfen)', !zeigtAlt)

// Beim Neuzeichnen schreiben Aufgaben- und Auszeichnungs-Store still mit. Das
// ist in Ordnung — entscheidend ist, dass dabei nichts Altes zurueckkommt.
const danach = await tabA.evaluate(() => {
  const roh = localStorage.getItem('red-kurd-progress-v2')
  return roh ? JSON.parse(roh) : null
})
ok(
  'der geloeschte Lernstand ist nicht zurueckgeschrieben worden',
  danach === null || (danach.xp ?? 0) === 0,
  `xp = ${danach?.xp}`
)
ok(
  'auch die alte Serie ist nicht zurueck',
  danach === null || (danach.serie ?? 0) === 0,
  `serie = ${danach?.serie}`
)

const profil = await tabA.evaluate(() => localStorage.getItem('red-kurd-profile-v2'))
ok(
  'auch das geloeschte Profil kam nicht zurueck',
  profil === null || !JSON.parse(profil).name,
  String(profil)
)

ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
