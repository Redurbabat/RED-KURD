// Lernstand im Browser speichern: XP, Tagesserie, Wiederholsystem (SM-2 vereinfacht)
const SCHLUESSEL = 'red-kurd-fortschritt-v1'

function lade() {
  try { return JSON.parse(localStorage.getItem(SCHLUESSEL)) || {} } catch { return {} }
}
function speichere(d) {
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(d)) } catch {}
}

function heute() { return new Date().toISOString().slice(0, 10) }
function gestern() {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function holeStand() {
  const d = lade()
  return {
    xp: d.xp || 0,
    serie: d.serie || 0,
    letzterTag: d.letzterTag || null,
    lektionen: d.lektionen || {},   // { lektionsId: bestesErgebnis 0..100 }
    karten: d.karten || {},         // { 'de|ku': {stufe, faellig} }
  }
}

export function gibXp(punkte) {
  const d = lade()
  d.xp = (d.xp || 0) + punkte
  if (d.letzterTag !== heute()) {
    d.serie = d.letzterTag === gestern() ? (d.serie || 0) + 1 : 1
    d.letzterTag = heute()
  }
  speichere(d)
  return d
}

export function lektionAbgeschlossen(id, prozent) {
  const d = lade()
  d.lektionen = d.lektionen || {}
  if (!d.lektionen[id] || prozent > d.lektionen[id]) d.lektionen[id] = prozent
  speichere(d)
}

// Wiederholsystem: Stufe 0=neu, dann 1,2,3... Abstand 1,3,7,16,35 Tage
const ABSTAENDE = [1, 3, 7, 16, 35, 70]
export function karteBewerten(de, ku, richtig) {
  const d = lade()
  d.karten = d.karten || {}
  const k = d.karten[de + '|' + ku] || { stufe: 0, faellig: heute() }
  if (richtig) {
    k.stufe = Math.min(k.stufe + 1, ABSTAENDE.length)
    const t = new Date(); t.setDate(t.getDate() + ABSTAENDE[Math.min(k.stufe - 1, ABSTAENDE.length - 1)])
    k.faellig = t.toISOString().slice(0, 10)
  } else {
    k.stufe = 0
    k.faellig = heute()
  }
  d.karten[de + '|' + ku] = k
  speichere(d)
}

export function faelligeKarten() {
  const d = lade()
  const h = heute()
  return Object.entries(d.karten || {})
    .filter(([, k]) => k.faellig <= h)
    .map(([schluessel, k]) => {
      const [de, ku] = schluessel.split('|')
      return { de, ku, stufe: k.stufe }
    })
}

export function statistik() {
  const d = lade()
  const karten = Object.values(d.karten || {})
  return {
    xp: d.xp || 0,
    serie: d.serie || 0,
    gelernt: karten.length,
    sicher: karten.filter(k => k.stufe >= 3).length,
    faellig: faelligeKarten().length,
    lektionen: d.lektionen || {},
  }
}

// Tolerantes Vergleichen fuer Tipp-Uebungen (Gross/klein, Sonderzeichen)
export function istRichtigGetippt(eingabe, richtig) {
  const norm = (s) => s.toLowerCase().trim()
    .replace(/ê/g, 'e').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/[.,!?']/g, '').replace(/\s+/g, ' ')
  return norm(eingabe) === norm(richtig)
}
