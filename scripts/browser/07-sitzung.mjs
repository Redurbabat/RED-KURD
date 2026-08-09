// Eine echte Lernsitzung von der ersten Aufgabe bis zum Ergebnis.
//
// Warum das hier fehlte: `ExercisePlayer` ist mit rund 470 Zeilen die
// laengste Datei der Sprach-App und ihr Kernstueck — jede Aufgabe, jede
// Bewertung, jeder XP-Punkt laeuft hindurch. `npm test` kann sie nicht laden
// (JSX), und keine Browser-Pruefung hat je eine Sitzung durchgespielt. Bis
// zur TypeScript-Umstellung war sie damit ungeprueft.
//
// Absichtlich wird EINE Aufgabe falsch beantwortet: nur so zeigt sich, dass
// die Fehlerliste gefuellt wird — an ihr haengt der Knopf „Fehler üben".
import { chromium } from 'playwright'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const browser = await chromium.launch({ executablePath: process.env.CHROME })
const ctx = await browser.newContext({ viewport: { width: 428, height: 926 } })
const heute = new Date().toISOString().slice(0, 10)
await ctx.addInitScript((tag) => {
  if (window.top !== window.self) return
  localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('language'))
  localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
    version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag,
  }))
  localStorage.setItem('red-kurd-progress-v2', JSON.stringify({
    version: 2, xp: 100, serie: 1, letzterTag: tag,
    einheiten: { begruessung: 100 }, sterne: { begruessung: 2 },
    karten: {}, tage: {}, edelsteine: 0, schluessel: 0, lernzeit: 0,
  }))
  // Eine feste Sitzung statt einer zufaellig zusammengestellten: nur so ist
  // vorher bekannt, welche Antwort richtig ist. Ohne das haengt „XP sind
  // gewachsen" davon ab, ob zufaellig eine Karte getroffen wurde — genau
  // dieser Wackler ist mir beim ersten Lauf begegnet.
  localStorage.setItem('red-kurd-session-v2', JSON.stringify({
    version: 2, titel: 'Prüfsitzung', index: 0, punkte: 0, zeit: new Date().toISOString(),
    uebungen: [
      { art: 'wahl-de', frage: 'Was bedeutet „silav" auf Deutsch?',
        antwort: 'Hallo', optionen: ['Hallo', 'Tschüss', 'Danke', 'Bitte'],
        w: { de: 'Hallo', ku: 'silav' } },
      { art: 'wahl-de', frage: 'Was bedeutet „spas" auf Deutsch?',
        antwort: 'Danke', optionen: ['Danke', 'Hallo', 'Wasser', 'Brot'],
        w: { de: 'Danke', ku: 'spas' } },
      { art: 'wahl-ku', frage: 'Wie heißt „Wasser" auf Kurmancî?',
        antwort: 'av', optionen: ['av', 'nan', 'roj', 'mal'],
        w: { de: 'Wasser', ku: 'av' } },
    ],
  }))
}, heute)

const seite = await ctx.newPage()
const fehler = []
seite.on('pageerror', (e) => fehler.push(e.message))

await seite.goto(BASIS + '/session', { waitUntil: 'networkidle' })
await seite.waitForTimeout(1000)

ok('die Sitzung startet mit einer Aufgabe', await seite.locator('.rk-uebung').count() === 1)
ok('die vorgegebene Sitzung wird fortgesetzt',
  (await seite.locator('.rk-frage').first().innerText()).includes('silav'),
  await seite.locator('.rk-frage').first().innerText())

const xpVorher = await seite.evaluate(() =>
  JSON.parse(localStorage.getItem('red-kurd-progress-v2')).xp
)

/** Die Karte mit diesem Text antippen und die Rueckmeldung abwarten. */
async function tippeAn(text) {
  await seite.locator('.rk-option', { hasText: text }).first().click()
  await seite.waitForTimeout(400)
}

async function weiter() {
  await seite.locator('.rk-uebung button.rk-knopf:not([disabled])').last().click()
  await seite.waitForTimeout(400)
}

/* ---------- 1. Aufgabe: absichtlich falsch ---------- */
await tippeAn('Tschüss')
ok('nach dem Antworten kommt eine Rueckmeldung', await seite.locator('.rk-rueckmeldung').count() === 1)
ok('eine falsche Antwort meldet „Nicht ganz"',
  await seite.locator('.rk-rueckmeldung.schlecht').count() === 1)
ok('die richtige Karte wird trotzdem markiert',
  await seite.locator('.rk-option.richtig').count() === 1)
ok('die angetippte falsche Karte ist als falsch gekennzeichnet',
  await seite.locator('.rk-option.falsch').count() === 1)
await weiter()

/* ---------- 2. Aufgabe: richtig ---------- */
ok('die zweite Aufgabe steht da',
  (await seite.locator('.rk-frage').first().innerText()).includes('spas'))
await tippeAn('Danke')
ok('eine richtige Antwort meldet Erfolg',
  await seite.locator('.rk-rueckmeldung.gut').count() === 1)
ok('es ist immer genau eine der beiden Rueckmeldungen',
  await seite.locator('.rk-rueckmeldung.schlecht').count() === 0)
await weiter()

/* ---------- 3. Aufgabe: richtig ---------- */
await tippeAn('av')
ok('auch die Kurmancî-Richtung wird richtig bewertet',
  await seite.locator('.rk-rueckmeldung.gut').count() === 1)
await weiter()

/* ---------- Ergebnis ---------- */
const ergebnisText = await seite.locator('.rk-ergebnis').innerText()
ok('die Sitzung erreicht das Ergebnis', (await seite.locator('.rk-ergebnis').count()) === 1)
ok('das Ergebnis zaehlt zwei von drei', /2 von 3 Aufgaben richtig/.test(ergebnisText),
  ergebnisText.slice(0, 120))
ok('nach der falschen Antwort steht „Fehler üben" mit der Zahl 1 bereit',
  /Fehler üben \(1\)/.test(ergebnisText), ergebnisText.slice(0, 200))

const nachher = await seite.evaluate(() =>
  JSON.parse(localStorage.getItem('red-kurd-progress-v2'))
)
// Zwei richtige Antworten, XP_JE_AUFGABE ist 10 — die Zahl steht also fest
// und nicht bloss „mehr als vorher".
ok('genau zwei richtige Antworten geben XP', nachher.xp === xpVorher + 20,
  `${xpVorher} -> ${nachher.xp}`)
ok('alle drei Woerter liegen im Wiederholsystem',
  Object.keys(nachher.karten || {}).length === 3,
  JSON.stringify(Object.keys(nachher.karten || {})))
ok('der Tageseintrag zaehlt drei Aufgaben',
  nachher.tage?.[heute]?.aufgaben === 3, JSON.stringify(nachher.tage))
const offeneSitzung = await seite.evaluate(() => localStorage.getItem('red-kurd-session-v2'))
ok('die beendete Sitzung ist aus dem Speicher entfernt', offeneSitzung === null, String(offeneSitzung))

ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
