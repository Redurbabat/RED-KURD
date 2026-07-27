// Online-Modus ohne lokalen Server: durchsucht die statischen JSON-Daten
let daten = null

export async function ladeStatisch() {
  if (daten) return daten
  const [woerter, wiki, beispiele] = await Promise.all([
    fetch('/daten/woerter.json').then(r => r.json()),
    fetch('/daten/wiki.json').then(r => r.json()),
    fetch('/daten/beispiele.json').then(r => r.json()),
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
        ktIndex[ordner] = await fetch(`/daten/kt/${ordner}/index.json`).then(r => r.json())
      }
      const buchstabe = s[0]
      const dateien = (ktIndex[ordner].letters[buchstabe] || [])
        .filter(e => e.first <= ende && e.last >= s)
      for (const e of dateien) {
        const pfad = `${ordner}/${e.file}`
        if (!ktChunks[pfad]) {
          ktChunks[pfad] = await fetch(`/daten/kt/${pfad}`).then(r => r.json())
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
