// Die gemeinsame Wochenübersicht über alle vier Apps — reine Funktionen,
// keine Oberfläche, kein Speicher.
//
// Ehrlichkeit vor Schönheit: Die Apps messen Verschiedenes (Sprache zählt
// gelöste Aufgaben, die anderen XP). Deshalb wird NICHT zu einer Zahl
// zusammenaddiert. Gezeigt wird je App ihr eigener Wert mit eigener
// Einheit — und als gemeinsames Maß die aktiven Tage.

const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Datum als JJJJ-MM-TT. */
function tagVon(d) {
  const jahr = d.getFullYear()
  const monat = String(d.getMonth() + 1).padStart(2, '0')
  const tag = String(d.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

/**
 * Die letzten sieben Tage, ältester zuerst, heute zuletzt.
 * @returns {Array<{datum:string, kurz:string, heute:boolean}>}
 */
export function wochenTage(heute) {
  const start = new Date(`${heute}T00:00:00`)
  if (Number.isNaN(start.getTime())) return []
  const liste = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(start)
    d.setDate(d.getDate() - i)
    const datum = tagVon(d)
    liste.push({ datum, kurz: KURZ[d.getDay()], heute: datum === heute })
  }
  return liste
}

/** Zahl aus einem Tageseintrag holen — je nach App steckt sie woanders. */
function wertVon(eintrag, feld) {
  if (eintrag === null || eintrag === undefined) return 0
  if (typeof eintrag === 'number') return Number.isFinite(eintrag) ? eintrag : 0
  if (feld && typeof eintrag === 'object') {
    const wert = eintrag[feld]
    return typeof wert === 'number' && Number.isFinite(wert) ? wert : 0
  }
  return 0
}

/**
 * Eine App über die Woche.
 * @param {{id:string, name:string, einheit:string, tage:Object, feld?:string}} app
 * @param {Array} tage Ergebnis von wochenTage()
 */
export function appWoche(app, tage) {
  const werte = tage.map((t) => wertVon((app.tage || {})[t.datum], app.feld))
  return {
    id: app.id,
    name: app.name,
    einheit: app.einheit,
    werte,
    summe: werte.reduce((a, b) => a + b, 0),
    aktiveTage: werte.filter((w) => w > 0).length,
    hoechster: werte.length ? Math.max(...werte) : 0,
  }
}

/**
 * Die ganze Woche über alle Apps.
 * @returns {{tage:Array, apps:Array, aktiveTage:number, tageAktiv:Array<boolean>}}
 */
export function wochenUebersicht(apps, heute) {
  const tage = wochenTage(heute)
  const proApp = (apps || []).map((a) => appWoche(a, tage))
  // Ein Tag zählt als aktiv, sobald IRGENDEINE App an ihm etwas verzeichnet.
  const tageAktiv = tage.map((_, i) => proApp.some((a) => a.werte[i] > 0))
  return {
    tage,
    apps: proApp,
    tageAktiv,
    aktiveTage: tageAktiv.filter(Boolean).length,
  }
}

/**
 * Wie viele Tage in Folge (bis heute) war irgendetwas los?
 * Gestern zählt noch mit, wenn heute noch nichts passiert ist — sonst
 * wäre die Reihe jeden Morgen kaputt.
 */
export function reiheGesamt(tageAktiv) {
  if (!tageAktiv || !tageAktiv.length) return 0
  const felder = [...tageAktiv]
  if (!felder[felder.length - 1]) felder.pop() // heute noch nichts: ab gestern zählen
  let reihe = 0
  for (let i = felder.length - 1; i >= 0; i -= 1) {
    if (!felder[i]) break
    reihe += 1
  }
  return reihe
}
