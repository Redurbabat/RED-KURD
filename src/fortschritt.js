// Lernstand im Browser: XP, Serie, Wiederholsystem, Fertigkeiten, Profil, Aktivitaet
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
    lektionen: d.lektionen || {},
    karten: d.karten || {},
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

const ABSTAENDE = [1, 3, 7, 16, 35, 70]
function bewerteKarte(d, key, richtig) {
  const k = d.karten[key] || { stufe: 0, faellig: heute() }
  if (richtig) {
    k.stufe = Math.min(k.stufe + 1, ABSTAENDE.length)
    const t = new Date(); t.setDate(t.getDate() + ABSTAENDE[Math.min(k.stufe - 1, ABSTAENDE.length - 1)])
    k.faellig = t.toISOString().slice(0, 10)
  } else {
    k.stufe = 0
    k.faellig = heute()
  }
  d.karten[key] = k
}

export function karteBewerten(de, ku, richtig) {
  const d = lade(); d.karten = d.karten || {}
  bewerteKarte(d, de + '|' + ku, richtig)
  speichere(d)
}

export function karteBewertenSkill(de, ku, skill, richtig) {
  const d = lade(); d.karten = d.karten || {}
  bewerteKarte(d, de + '|' + ku + '|' + skill, richtig)
  speichere(d)
}

export function merkeWort(de, ku) {
  const d = lade()
  d.karten = d.karten || {}
  if (!d.karten[de + '|' + ku]) {
    d.karten[de + '|' + ku] = { stufe: 0, faellig: heute() }
    speichere(d)
  }
}

export function faelligeKarten() {
  return faelligeKartenAlle()
}

export function faelligeKartenAlle() {
  const d = lade()
  const h = heute()
  return Object.entries(d.karten || {})
    .filter(([, k]) => k.faellig <= h)
    .map(([key, k]) => {
      const teile = key.split('|')
      return { de: teile[0], ku: teile[1], skill: teile[2] || 'gemischt', stufe: k.stufe }
    })
}

export function fertigkeiten() {
  const d = lade()
  const map = { erkennen: [0, 0], abrufen: [0, 0], schreiben: [0, 0], hoeren: [0, 0] }
  for (const [key, k] of Object.entries(d.karten || {})) {
    const skill = key.split('|')[2] || 'erkennen'
    if (!map[skill]) continue
    map[skill][1]++
    if (k.stufe >= 3) map[skill][0]++
  }
  const aus = {}
  for (const [skill, [gut, gesamt]] of Object.entries(map)) {
    aus[skill] = gesamt ? Math.round((gut / gesamt) * 100) : 0
    aus[skill + 'Anzahl'] = gesamt
  }
  return aus
}

export function statistik() {
  const d = lade()
  const karten = Object.values(d.karten || {})
  return {
    xp: d.xp || 0,
    serie: d.serie || 0,
    gelernt: karten.length,
    sicher: karten.filter(k => k.stufe >= 3).length,
    faellig: faelligeKartenAlle().length,
    lektionen: d.lektionen || {},
  }
}

export function istRichtigGetippt(eingabe, richtig) {
  const norm = (s) => s.toLowerCase().trim()
    .replace(/ê/g, 'e').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/[.,!?']/g, '').replace(/\s+/g, ' ')
  return norm(eingabe) === norm(richtig)
}

// ===== Session-Fortsetzung =====
const SESSION_KEY = 'red-kurd-session-v1'
export function sessionSpeichern(daten) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(daten)) } catch {}
}
export function sessionLaden() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
export function sessionLoeschen() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// ===== Lernprofil (Onboarding) =====
const PROFIL_KEY = 'red-kurd-profil-v1'
export function profilSpeichern(p) {
  try { localStorage.setItem(PROFIL_KEY, JSON.stringify(p)) } catch {}
}
export function profilLaden() {
  try { return JSON.parse(localStorage.getItem(PROFIL_KEY)) } catch { return null }
}

// ===== Geraete-Sync per Datei =====
export function exportiereAlles() {
  return JSON.stringify({
    version: 1,
    exportiert: new Date().toISOString(),
    fortschritt: lade(),
    profil: profilLaden(),
  }, null, 2)
}
export function importiereAlles(text) {
  const daten = JSON.parse(text)
  if (!daten || daten.version !== 1) throw new Error('Unbekanntes Format')
  if (daten.fortschritt) speichere(daten.fortschritt)
  if (daten.profil) profilSpeichern(daten.profil)
  return true
}

export function ankiExport() {
  const d = lade()
  const zeilen = Object.keys(d.karten || {}).map(schluessel => {
    const [de, ku] = schluessel.split('|')
    return de + '\t' + ku
  })
  return [...new Set(zeilen)].join('\n')
}

// ===== Tages-Aktivitaet (Rueckblick + Wochen-Chart) =====
export function zaehleAufgabe(richtig) {
  const d = lade()
  const t = heute()
  d.tage = d.tage || {}
  const e = d.tage[t] || { aufgaben: 0, richtig: 0 }
  e.aufgaben++; if (richtig) e.richtig++
  d.tage[t] = e
  const alle = Object.keys(d.tage).sort()
  while (alle.length > 30) { delete d.tage[alle.shift()] }
  speichere(d)
}

export function gesternStatistik() {
  const d = lade()
  return (d.tage && d.tage[gestern()]) || null
}

export function wochenAktivitaet() {
  const d = lade()
  const namen = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const aus = []
  for (let i = 6; i >= 0; i--) {
    const t = new Date(); t.setDate(t.getDate() - i)
    const key = t.toISOString().slice(0, 10)
    aus.push({ tag: namen[t.getDay()], anzahl: (d.tage && d.tage[key]) ? d.tage[key].aufgaben : 0 })
  }
  return aus
}
