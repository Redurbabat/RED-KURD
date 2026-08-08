// Die gemeinsame Wochenübersicht über alle vier Apps — reine Funktionen,
// keine Oberfläche, kein Speicher.
//
// Ehrlichkeit vor Schönheit: Die Apps messen Verschiedenes (Sprache zählt
// gelöste Aufgaben, die anderen XP). Deshalb wird NICHT zu einer Zahl
// zusammenaddiert. Gezeigt wird je App ihr eigener Wert mit eigener
// Einheit — und als gemeinsames Maß die aktiven Tage.

import type {
  Tagesschluessel,
  Wochenappstand,
  Wochenbandtag,
  Wochenbild,
  Wochenquelle,
} from '../../types/lernstand'

const KURZ: readonly string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Datum als JJJJ-MM-TT. */
function tagVon(d: Date): Tagesschluessel {
  const jahr = d.getFullYear()
  const monat = String(d.getMonth() + 1).padStart(2, '0')
  const tag = String(d.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

/**
 * Kurzform des Wochentags.
 *
 * Der leere Rückfall ist unerreichbar: `getDay()` liefert immer 0–6 und `KURZ`
 * hat genau sieben Einträge. Er steht nur da, weil ein Zugriff mit einer
 * beliebigen Zahl für den Prüfer `string | undefined` ergibt — die Länge der
 * Liste kennt er nicht.
 */
function kurzVon(d: Date): string {
  const kurz = KURZ[d.getDay()]
  return kurz === undefined ? '' : kurz
}

/** Die letzten sieben Tage, ältester zuerst, heute zuletzt. */
export function wochenTage(heute: Tagesschluessel): Wochenbandtag[] {
  const start = new Date(`${heute}T00:00:00`)
  if (Number.isNaN(start.getTime())) return []
  const liste: Wochenbandtag[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(start)
    d.setDate(d.getDate() - i)
    const datum = tagVon(d)
    liste.push({ datum, kurz: kurzVon(d), heute: datum === heute })
  }
  return liste
}

/**
 * Prüft, was hier wirklich gebraucht wird: aus `unknown` allein lässt sich
 * nicht indizieren. Vorbild ist `istObjekt()` in `storage.ts` — dort ist es
 * bewusst nicht exportiert, deshalb steht die Prüfung hier ein zweites Mal.
 * Listen kommen wie dort durch; sie tragen kein benanntes Feld und fallen
 * darum ohnehin auf 0 zurück.
 */
function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return !!wert && typeof wert === 'object'
}

/** Zahl aus einem Tageseintrag holen — je nach App steckt sie woanders. */
function wertVon(eintrag: unknown, feld: string | undefined): number {
  if (eintrag === null || eintrag === undefined) return 0
  if (typeof eintrag === 'number') return Number.isFinite(eintrag) ? eintrag : 0
  if (feld && istObjekt(eintrag)) {
    const wert = eintrag[feld]
    return typeof wert === 'number' && Number.isFinite(wert) ? wert : 0
  }
  return 0
}

/**
 * Eine App über die Woche.
 * @param tage Ergebnis von wochenTage()
 */
export function appWoche(app: Wochenquelle, tage: readonly Wochenbandtag[]): Wochenappstand {
  // Der Rückfall auf `{}` bleibt: die Aufrufer sind noch ungeprüfte .jsx-Seiten,
  // die ihre Tagesliste aus vier verschiedenen Lernständen zusammentragen.
  //
  // `app.tage` wird jetzt einmal vor der Schleife gelesen statt siebenmal
  // darin. Bei einem gewöhnlichen Objekt ändert das nichts; unterscheidbar
  // wäre es nur mit einem `tage`-Getter, der zählt oder wirft — und den gibt
  // es nirgends, weil die vier Lernstände aus `JSON.parse` kommen.
  const quelle: Record<Tagesschluessel, unknown> = app.tage || {}
  const werte = tage.map((t) => wertVon(quelle[t.datum], app.feld))
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

/** Die ganze Woche über alle Apps. */
export function wochenUebersicht(
  apps: readonly Wochenquelle[],
  heute: Tagesschluessel
): Wochenbild {
  const tage = wochenTage(heute)
  const proApp = (apps || []).map((a) => appWoche(a, tage))
  // Ein Tag zählt als aktiv, sobald IRGENDEINE App an ihm etwas verzeichnet.
  const tageAktiv = tage.map((_, i) =>
    proApp.some((a) => {
      // `werte` entsteht aus derselben Tagesliste und ist deshalb immer genau
      // so lang wie `tage` — der undefined-Zweig ist unerreichbar und steht
      // nur, weil der Prüfer die Länge nicht kennt.
      const wert = a.werte[i]
      return wert !== undefined && wert > 0
    })
  )
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
export function reiheGesamt(tageAktiv: readonly boolean[]): number {
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
