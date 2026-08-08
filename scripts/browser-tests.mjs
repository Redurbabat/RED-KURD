#!/usr/bin/env node
// Fuehrt die Browser-Pruefungen gegen das echte Produktionsbuendel aus.
//
// Warum ueberhaupt: `npm test` prueft die Lernlogik ohne Browser — schnell und
// ohne Abhaengigkeiten. Manches laesst sich so aber gar nicht pruefen, und es
// ist ausgerechnet das, was am meisten weh taete: die Migration von Version 1,
// das Einspielen einer Sicherung, die Aufnahmen in der IndexedDB (die es in
// Node nicht gibt) und ob alle vier Apps ueberhaupt starten.
//
// Deshalb liegt das hier getrennt und NICHT in `npm run check`: es braucht
// einen Browser, und wer keinen hat, soll trotzdem entwickeln koennen.
//
//   npm run test:browser
//
// Ohne installierten Browser bricht der Lauf nicht ab, sondern sagt, was fehlt.
import { spawn } from 'node:child_process'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '..')
const PORT = Number(process.env.PORT || 4173)
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const BASIS = `http://localhost:${PORT}`

/** Gibt es ueberhaupt einen Browser? Playwright oder ein vorinstallierter. */
async function findeBrowser() {
  if (process.env.CHROME && existsSync(process.env.CHROME)) return process.env.CHROME
  // In manchen Umgebungen liegen die Browser ausserhalb von node_modules.
  const ordner = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (ordner && existsSync(ordner)) {
    for (const eintrag of await readdir(ordner)) {
      const pfad = path.join(ordner, eintrag, 'chrome-linux', 'chrome')
      if (eintrag.startsWith('chromium') && existsSync(pfad)) return pfad
    }
  }
  // Sonst soll Playwright selbst entscheiden — dann bleibt executablePath leer.
  return null
}

function warte(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

/** Den Vorschauserver samt seiner Kinder beenden. */
function beende(server) {
  if (!server || server.killed) return
  try {
    // Negative PID = ganze Prozessgruppe. Unter Windows gibt es das nicht,
    // dort trifft der gewoehnliche Kill den Prozess selbst.
    if (process.platform === 'win32') server.kill()
    else process.kill(-server.pid, 'SIGTERM')
  } catch {
    try {
      server.kill()
    } catch {
      /* schon weg */
    }
  }
}

async function erreichbar() {
  try {
    const antwort = await fetch(BASIS + '/', { signal: AbortSignal.timeout(1500) })
    return antwort.ok
  } catch {
    return false
  }
}

async function main() {
  if (!existsSync(path.join(WURZEL, 'node_modules', 'playwright'))) {
    console.error('Playwright fehlt. Einmalig einrichten:\n  npm install\n  npx playwright install chromium')
    process.exit(1)
  }
  if (!existsSync(path.join(WURZEL, 'dist', 'index.html'))) {
    console.error('Es gibt kein Buendel. Zuerst `npm run build` ausfuehren.')
    process.exit(1)
  }

  const browser = await findeBrowser()
  if (browser) console.log(`Browser: ${browser}`)

  // Laeuft schon ein Vorschauserver auf dem Port, wird er benutzt statt eines
  // zweiten — sonst landet der neue auf 4174 und die Pruefungen greifen ins Leere.
  let server = null
  if (await erreichbar()) {
    console.log(`Vorschauserver auf ${BASIS} laeuft bereits.`)
  } else {
    console.log(`Starte Vorschauserver auf ${BASIS} …`)
    // `detached` samt Gruppen-Kill ist noetig: ohne das ueberlebt der eigentliche
    // vite-Prozess das Beenden seines Starters und haelt den Port fest, sodass
    // der naechste Lauf ins Leere greift.
    server = spawn(NPX, ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: WURZEL,
      stdio: 'ignore',
      detached: true,
    })
    for (let i = 0; i < 30; i++) {
      if (await erreichbar()) break
      await warte(500)
    }
    if (!(await erreichbar())) {
      beende(server)
      console.error(`Der Vorschauserver auf ${BASIS} kam nicht hoch.`)
      process.exit(1)
    }
  }

  // Auch bei Strg-C darf kein Server zurueckbleiben.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      beende(server)
      process.exit(130)
    })
  }

  const ablage = await mkdtemp(path.join(tmpdir(), 'red-kurd-pruef-'))
  const ordner = path.join(HIER, 'browser')
  const dateien = (await readdir(ordner)).filter((d) => d.endsWith('.mjs')).sort()

  let fehlgeschlagen = 0
  for (const datei of dateien) {
    console.log(`\n───── ${datei} ─────`)
    const code = await new Promise((res) => {
      const lauf = spawn(process.execPath, [path.join(ordner, datei)], {
        cwd: WURZEL,
        stdio: 'inherit',
        env: { ...process.env, BASIS, ABLAGE: ablage, ...(browser ? { CHROME: browser } : {}) },
      })
      lauf.on('close', res)
    })
    if (code !== 0) fehlgeschlagen += 1
  }

  await rm(ablage, { recursive: true, force: true })
  beende(server)

  console.log(
    fehlgeschlagen
      ? `\n${fehlgeschlagen} von ${dateien.length} Pruefungen fehlgeschlagen.`
      : `\nAlle ${dateien.length} Pruefungen bestanden.`
  )
  process.exit(fehlgeschlagen ? 1 : 0)
}

await main()
