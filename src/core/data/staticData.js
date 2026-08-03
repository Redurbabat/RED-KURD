// Online-Modus ohne lokalen Server: durchsucht die statischen JSON-Daten
let daten = null

async function holeJson(pfad) {
  const r = await fetch(pfad)
  // Ohne diese Pruefung wuerde eine Fehlerseite als JSON geparst und der
  // kaputte Zustand dauerhaft im Modul-Cache landen.
  if (!r.ok) throw new Error(`${pfad}: ${r.status}`)
  return r.json()
}

/** Unverzerrtes Mischen (Fisher-Yates) — sort(Math.random) bevorzugt Positionen. */
function mischen(liste) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function ladeStatisch() {
  if (daten) return daten
  const [woerter, wiki, beispiele] = await Promise.all([
    holeJson('/daten/woerter.json'),
    holeJson('/daten/wiki.json'),
    holeJson('/daten/beispiele.json'),
  ])
  daten = { woerter, wiki, beispiele }
  return daten
}

export async function sucheStatisch(q) {
  const d = await ladeStatisch()
  const s = q.toLowerCase()
  const woerter = d.woerter
    .filter(([, wort, , ueb]) => wort.toLowerCase().startsWith(s) || ueb.toLowerCase().startsWith(s))
    .slice(0, 60)
    .map(([lang, wort, ziel_lang, uebersetzung]) => ({ lang, wort, ziel_lang, uebersetzung, quelle: 'online' }))
  const wiki = d.wiki
    .filter(([, wort]) => wort.toLowerCase().startsWith(s))
    .slice(0, 15)
    .map(([lang, wort, wortart, ipa, bedeutungen, formen]) => ({ lang, wort, wortart, ipa, bedeutungen, formen }))
  let kt = []
  try { kt = await sucheKurdishTech(q) } catch {}
  return { woerter, wiki: wiki.concat(kt), formen: [] }
}

export async function beispieleStatisch(wort) {
  const d = await ladeStatisch()
  const s = wort.toLowerCase()
  return d.beispiele
    .filter(([, satz]) => satz.toLowerCase().includes(s))
    .slice(0, 15)
    .map(([, satz, , uebersetzung]) => ({ satz, uebersetzung }))
}

export async function statischeAnzahl() {
  const d = await ladeStatisch()
  return { woerter: d.woerter.length, beispiele: d.beispiele.length }
}

// Kurdish-Tech-Woerterbuch (456.000+ Woerter, mit Erlaubnis): pro Buchstabe nachladen
const KT_SPRACHEN = { ku: 'kmr', sor: 'ckb', zza: 'zza' }
const ktIndex = {}
const ktChunks = {}

export async function sucheKurdishTech(q) {
  const s = q.toLowerCase()
  const ende = s + '￿'
  const ergebnisse = []
  for (const ordner of Object.keys(KT_SPRACHEN)) {
    try {
      if (!ktIndex[ordner]) {
        ktIndex[ordner] = await holeJson(`/daten/kt/${ordner}/index.json`)
      }
      const buchstabe = s[0]
      const dateien = (ktIndex[ordner].letters[buchstabe] || [])
        .filter(e => e.first <= ende && e.last >= s)
      for (const e of dateien) {
        const pfad = `${ordner}/${e.file}`
        if (!ktChunks[pfad]) {
          ktChunks[pfad] = await holeJson(`/daten/kt/${pfad}`)
        }
        for (const w of ktChunks[pfad]) {
          if (w.word && w.word.toLowerCase().startsWith(s)) {
            ergebnisse.push({
              lang: KT_SPRACHEN[ordner], wort: w.word,
              wortart: w.pos_title || w.pos || '', ipa: '',
              bedeutungen: (w.glosses || []).slice(0, 5).join(' | '), formen: '',
            })
            if (ergebnisse.length >= 20) return ergebnisse
          }
        }
      }
    } catch { /* Sprache nicht verfuegbar */ }
  }
  return ergebnisse
}

/** Die geprüften Beispielsätze der Kapitel — offline immer verfügbar. */
async function lokalePaare() {
  // Spät geladen, damit staticData keine harte Abhängigkeit zum Kursbaum hat.
  const { EINHEITEN } = await import('../courses/courseRepository.js')
  return EINHEITEN.flatMap((e) => e.saetze || []).map((s) => ({
    satz: s.ku,
    uebersetzung: s.de,
  }))
}

export async function zufallsPaare(anzahl) {
  // Etwa die Hälfte kommt aus den eigenen Kapiteln — so lassen sich die
  // gelernten Sätze wirklich üben. Der Rest kommt aus dem großen Satzpaket;
  // fehlt es (offline, kein R2), tragen die Kapitelsätze allein.
  const lokal = mischen(await lokalePaare())
  let fern = []
  try {
    const d = await ladeStatisch()
    // Nur echte deutsche Uebersetzungen: Der fruehere Englisch-Fallback
    // zeigte englische Tatoeba-Saetze als vermeintlich deutschen Text an.
    // Fehlen deutsche Paare, tragen unten die Kapitelsaetze allein.
    const deu = d.beispiele.filter(([sl, , tl]) => sl === 'kmr' && tl === 'deu')
    fern = mischen(deu).map(([, satz, , uebersetzung]) => ({ satz, uebersetzung }))
  } catch {
    /* ohne Satzpaket üben wir mit den Kapitelsätzen */
  }
  const halb = Math.min(lokal.length, Math.ceil(anzahl / 2))
  const auswahl = lokal.slice(0, halb).concat(fern.slice(0, anzahl - halb))
  if (auswahl.length < anzahl) auswahl.push(...lokal.slice(halb, halb + (anzahl - auswahl.length)))
  return mischen(auswahl).slice(0, anzahl)
}
