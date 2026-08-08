// Den interaktiven Lektions-Player einmal ganz durchspielen.
//
// Warum das hier steht und nicht in `npm test`: der Player ist eine .tsx, und
// Node laedt kein JSX. Ohne diesen Lauf gaebe es fuer 355 Zeilen Bedienlogik
// gar keine Pruefung — und genau darin ist bei der TypeScript-Umstellung die
// Verzweigung ueber die drei Schritt-Arten umgebaut worden.
//
// Die Lektion `html-1` ist mit Absicht gewaehlt: sie enthaelt alle drei Arten
// (wahl, wahl, bauen, wahl, tippen). Ein Durchlauf beruehrt damit jeden Zweig.
//
// Die richtigen Antworten stehen NICHT hier im Text. Dieses Skript laeuft in
// Node und liest sie aus derselben Datendatei, die auch die App benutzt —
// sonst pruefte der Test irgendwann seine eigenen veralteten Annahmen. (Genau
// das ist mir beim ersten Versuch passiert: ich hatte „die erste Option ist
// immer richtig" hingeschrieben, und bei Schritt 2 ist es die zweite.)
import { chromium } from 'playwright'
import { holeSchritte } from '../../src/features/code-learning/data/codeSchritte.js'

const BASIS = process.env.BASIS || 'http://localhost:4173'
let bestanden = 0, fehlgeschlagen = 0
const ok = (n, w, d = '') => { if (w) { bestanden++; console.log('OK  ', n) } else { fehlgeschlagen++; console.log('FEHL', n, d) } }

const SCHRITTE = holeSchritte('html-1')
const ARTEN = SCHRITTE.map((s) => s.art).join(',')

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
  localStorage.setItem('red-kurd-active-app-v1', JSON.stringify('code'))
  localStorage.setItem('red-kurd-ohne-konto-v1', JSON.stringify(true))
  localStorage.setItem('red-kurd-profile-v2', JSON.stringify({
    version: 2, name: 'T', kenntnis: 'etwas', ziel: 'familie',
    minuten: '10', tagesziel: 20, variante: 'kurmanci-standard', erstellt: tag,
  }))
}, heute)

const seite = await ctx.newPage()
const fehler = []
seite.on('pageerror', (f) => fehler.push(f.message))

// Ohne alle drei Arten prueft der Durchlauf nicht mehr, was er soll. Das
// faellt dann hier auf und nicht als stiller Teilerfolg weiter unten.
ok(`html-1 enthaelt alle drei Schritt-Arten (${ARTEN})`,
  ['wahl', 'bauen', 'tippen'].every((a) => ARTEN.includes(a)), ARTEN)

await seite.goto(BASIS + '/', { waitUntil: 'networkidle' })
await seite.waitForTimeout(700)

// Der Lernpfad „HTML Grundlagen" ist zugeklappt — erst aufklappen, dann die
// erste Lektion oeffnen. Sie ist die einzige offene; alle spaeteren sind
// gesperrt.
const pfad = seite.locator('.cl-pfad').filter({ hasText: 'HTML Grundlagen' }).first()
await pfad.getByRole('button', { name: /Starten|Weiterlernen/ }).click()
await seite.waitForTimeout(400)
ok('der Lernpfad klappt auf', await pfad.locator('.cl-lektion').count() > 0)

await pfad.getByRole('button', { name: /^Was ist HTML/ }).click()
await seite.waitForTimeout(500)

const player = seite.locator('.lektion-player')
ok('der Player oeffnet sich statt des Lese-Modals', await player.count() === 1)

const balken = async () => Number(await player.locator('.lp-fortschritt').getAttribute('aria-valuenow'))
const gesamt = await player.locator('.lp-fortschritt').getAttribute('aria-valuemax')
ok('der Fortschrittsbalken kennt alle Schritte', Number(gesamt) === SCHRITTE.length, String(gesamt))

// Streng auf den Player eingegrenzt und exakt: die Lektionskarte darunter
// traegt „… Hier geht es weiter" und wuerde ein loses „Weiter" mitfangen.
const knopf = (text) => player.getByRole('button', { name: text, exact: true })
const feedback = async (art) => await player.locator(`.lp-feedback.${art}`).count() === 1

/** Einen Wahlschritt beantworten. `richtig` steuert, ob absichtlich falsch. */
async function wahl(schritt, richtig) {
  const ziel = richtig
    ? schritt.richtig
    : (schritt.richtig + 1) % schritt.optionen.length
  await player.locator('.lp-option').nth(ziel).click()
  await knopf('Einsenden').click()
  await seite.waitForTimeout(250)
}

/* ---------- Schritt 1: Wahl — erst absichtlich falsch, dann richtig ---------- */
ok('vor der Wahl ist Einsenden gesperrt', await knopf('Einsenden').isDisabled())

await wahl(SCHRITTE[0], false)
ok('falsche Antwort meldet „Nicht ganz"', await feedback('falsch'))
ok('nach falsch steht kein Weiter-Knopf da', await knopf('Weiter').count() === 0)

await wahl(SCHRITTE[0], true)
ok('richtige Antwort meldet „Das ist richtig"', await feedback('richtig'))
await knopf('Weiter').click()
await seite.waitForTimeout(300)
ok('der Balken ist auf Schritt 1 weitergerueckt', await balken() === 1)

/* ---------- Schritt 2: noch ein Wahlschritt ---------- */
await wahl(SCHRITTE[1], true)
ok('auch der zweite Wahlschritt wird richtig erkannt', await feedback('richtig'))
await knopf('Weiter').click()
await seite.waitForTimeout(300)
ok('der Balken ist auf Schritt 2', await balken() === 2)

/* ---------- Schritt 3: Bauen ---------- */
const bau = SCHRITTE[2]
const bausteine = player.locator('.lp-bausteine .lp-chip')
ok('der Bauschritt zeigt alle Bausteine', await bausteine.count() === bau.bausteine.length)
ok('vor dem Bauen ist Pruefen gesperrt', await knopf('Prüfen').isDisabled())
ok('der Bauschritt hat eine Live-Vorschau', await player.locator('.lp-vorschau').count() === 1)

// In der angezeigten Reihenfolge tippen. Die steht laut codeSchritte.js
// absichtlich falsch da — dass das auch wirklich falsch ist, wird vorher
// gegen die Loesung geprueft, sonst waere die Zusage unten wertlos.
const vorgegeben = bau.bausteine.join('')
ok('die vorgegebene Reihenfolge ergibt nicht die Loesung', vorgegeben !== bau.loesung, vorgegeben)
for (let i = 0; i < bau.bausteine.length; i += 1) await bausteine.nth(i).click()
ok('mit allen Bausteinen ist Pruefen frei', await knopf('Prüfen').isEnabled())
await knopf('Prüfen').click()
await seite.waitForTimeout(250)
ok('die falsche Reihenfolge wird als falsch erkannt', await feedback('falsch'))

await player.getByRole('button', { name: 'Von vorn beginnen' }).click()
await seite.waitForTimeout(200)
ok('nach dem Zuruecksetzen ist Pruefen wieder gesperrt', await knopf('Prüfen').isDisabled())

// Die richtige Reihenfolge: die Bausteine nach ihrer Stelle in der Loesung
// sortieren. Angeklickt wird ueber den Text, nicht ueber den Index — der
// Player deaktiviert benutzte Bausteine, die Positionen bleiben aber stehen.
const richtigeFolge = bau.bausteine
  .map((text, i) => ({ i, pos: bau.loesung.indexOf(text) }))
  .sort((a, b) => a.pos - b.pos)
for (const { i } of richtigeFolge) await bausteine.nth(i).click()
await knopf('Prüfen').click()
await seite.waitForTimeout(250)
ok('die richtige Reihenfolge wird als richtig erkannt', await feedback('richtig'))
await knopf('Weiter').click()
await seite.waitForTimeout(300)

/* ---------- Schritt 4: Wahl ---------- */
await wahl(SCHRITTE[3], true)
ok('der dritte Wahlschritt wird richtig erkannt', await feedback('richtig'))
await knopf('Weiter').click()
await seite.waitForTimeout(300)
ok('der Balken ist auf Schritt 4', await balken() === 4)

/* ---------- Schritt 5: Tippen, ueber die Code-Tastatur ---------- */
const tipp = SCHRITTE[4]
const feld = player.locator('#lp-eingabe')
ok('der Tippschritt zeigt das Eingabefeld', await feld.count() === 1)
ok('die Pruefliste zeigt alle Punkte', await player.locator('.praxis-checks li').count() === tipp.checks.length)
ok('vor der Eingabe ist Pruefen gesperrt', await knopf('Prüfen').isDisabled())

// Bewusst ueber die Bildschirmtastatur statt ueber fill(): genau dieser Weg
// benutzt tastaturHilfen und die Cursorlogik, die mit umgestellt wurden.
await feld.click()
await seite.waitForTimeout(250)
ok('die Code-Tastatur oeffnet sich unter dem Feld', await player.locator('.code-tastatur').count() === 1)

await player.getByRole('button', { name: 'Baustein <p>…</p> einfügen' }).click()
await seite.waitForTimeout(150)
const nachBaustein = await feld.inputValue()
ok('der Baustein steht im Feld', nachBaustein === '<p></p>', JSON.stringify(nachBaustein))

await player.getByRole('button', { name: 'Buchstaben zeigen' }).click()
for (const b of ['s', 'i', 'l', 'a', 'v']) {
  await player.getByRole('button', { name: `Buchstabe ${b} einfügen` }).click()
}
await seite.waitForTimeout(200)
const getippt = await feld.inputValue()
// Der Kern der Cursorlogik: der Text muss ZWISCHEN den Marken landen, nicht
// dahinter. Steht er hinten, ist fuegeEin() oder cursorSetzen() kaputt.
ok('die Buchstaben landen zwischen den Marken', getippt === '<p>silav</p>', JSON.stringify(getippt))

ok('die Pruefliste hakt live ab', await player.locator('.praxis-checks li.offen').count() === 0)
ok('die Eingabe besteht dieselben Checks wie in den Daten',
  tipp.checks.every((c) => c.pruefe(getippt)))

await knopf('Prüfen').click()
await seite.waitForTimeout(250)
ok('der letzte Schritt wird als richtig erkannt', await feedback('richtig'))

const abschluss = player.getByRole('button', { name: /Lektion abschließen/ })
ok('am Ende steht der Abschluss-Knopf', await abschluss.count() === 1)
await abschluss.click()
await seite.waitForTimeout(500)

ok('der Player schliesst sich', await seite.locator('.lektion-player').count() === 0)

const stand = await seite.evaluate(() =>
  JSON.parse(localStorage.getItem('red-kurd-code-progress-v1') || 'null')
)
ok('die Lektion steht als erledigt im Speicher', !!stand?.erledigt?.['html-1'], JSON.stringify(stand?.erledigt))
ok('die XP sind gutgeschrieben', stand?.xp === 10, String(stand?.xp))
ok('der Tageseintrag ist gesetzt', (stand?.tage || {})[heute] === 10, JSON.stringify(stand?.tage))

/* ---------- Mitmach-Aufgabe: speichert sie unter der richtigen ID? ----------
   In PraxisAufgabe greifen die Rueckrufe seit der Umstellung nicht mehr auf
   `aufgabe`, sondern auf eine festgehaltene Konstante zu. Waere dabei die
   falsche ID erwischt worden, laege die Notiz unter einem fremden Schluessel —
   im Fenster saehe alles richtig aus, beim naechsten Oeffnen waere sie weg. */
await seite.goto(BASIS + '/', { waitUntil: 'networkidle' })
await seite.waitForTimeout(700)

const grund = seite.locator('.cl-uebung, .cl-praxis, .rk-karte').filter({ hasText: 'Eine Überschrift schreiben' }).first()
await grund.getByRole('button', { name: /Loslegen|Öffnen|Weiter/ }).first().click()
await seite.waitForTimeout(500)

const modal = seite.locator('.rk-modal')
ok('die Mitmach-Aufgabe oeffnet sich', await modal.count() === 1)
const praxisFeld = modal.locator('#praxis-eingabe')
await praxisFeld.click()
await seite.waitForTimeout(200)
await modal.getByRole('button', { name: 'Baustein <h1>…</h1> einfügen' }).click()
await seite.waitForTimeout(200)
ok('die Pruefliste hat noch offene Punkte', await modal.locator('.praxis-checks li.offen').count() > 0)

await modal.getByRole('button', { name: 'Buchstaben zeigen' }).click()
for (const b of ['r', 'o', 'j']) {
  await modal.getByRole('button', { name: `Buchstabe ${b} einfügen` }).click()
}
await seite.waitForTimeout(250)
ok('alle Punkte sind erfuellt', await modal.locator('.praxis-checks li.offen').count() === 0)

const fertig = modal.getByRole('button', { name: /Aufgabe abschließen/ })
ok('der Abschluss-Knopf ist frei', await fertig.isEnabled())
await fertig.click()
await seite.waitForTimeout(500)

const nachher = await seite.evaluate(() =>
  JSON.parse(localStorage.getItem('red-kurd-code-progress-v1') || 'null')
)
ok('die Mitmach-Aufgabe steht unter ihrer eigenen ID',
  !!nachher?.erledigt?.['grund-ueberschrift'], JSON.stringify(nachher?.erledigt))
ok('die Notiz liegt unter derselben ID',
  nachher?.notizen?.['grund-ueberschrift'] === '<h1>roj</h1>',
  JSON.stringify(nachher?.notizen))
ok('die Mitmach-XP sind gutgeschrieben (10 + 20)', nachher?.xp === 30, String(nachher?.xp))

ok('kein JS-Fehler im ganzen Ablauf', fehler.length === 0, fehler[0] || '')

await browser.close()
console.log(`\n=== ${bestanden} bestanden, ${fehlgeschlagen} fehlgeschlagen ===`)
process.exit(fehlgeschlagen ? 1 : 0)
