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
  return { woerter, wiki, formen: [] }
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
