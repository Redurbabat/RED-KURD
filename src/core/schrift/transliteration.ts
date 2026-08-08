// Schrift-Umwandlung Kurmancî: Latein (Hawar) <-> Arabische Schrift  [Beta]
// Regeln vereinfacht nach dem Vorbild von klpt/wergor

/**
 * Eine Umschrifttabelle: Zeichenfolge der einen Schrift -> Zeichenfolge der
 * anderen. Der Wert darf leer sein — das kurze `i` etwa wird in der
 * arabischen Schrift gar nicht geschrieben.
 *
 * Die Annotation ist noetig, damit mit einer beliebigen Zeichenfolge
 * nachgeschlagen werden darf. Ohne sie kennt TypeScript nur die woertlich
 * notierten Schluessel und lehnt jeden berechneten Zugriff ab.
 */
type Umschrifttabelle = Readonly<Record<string, string>>

const L2A: Umschrifttabelle = {
  'xw': 'خو', 'û': 'وو', 'a': 'ا', 'b': 'ب', 'c': 'ج', 'ç': 'چ', 'd': 'د',
  'e': 'ە', 'ê': 'ێ', 'f': 'ف', 'g': 'گ', 'h': 'ه', 'i': '', 'î': 'ی',
  'j': 'ژ', 'k': 'ک', 'l': 'ل', 'm': 'م', 'n': 'ن', 'o': 'ۆ', 'p': 'پ',
  'q': 'ق', 'r': 'ر', 's': 'س', 'ş': 'ش', 't': 'ت', 'u': 'و', 'v': 'ڤ',
  'w': 'و', 'x': 'خ', 'y': 'ی', 'z': 'ز',
}
const VOKALE: ReadonlySet<string> = new Set(['a', 'e', 'ê', 'i', 'î', 'o', 'u', 'û'])

export function lateinNachArabisch(text: string): string {
  const woerter = text.toLowerCase().split(/(\s+)/)
  return woerter.map(w => {
    if (/^\s+$/.test(w) || !w) return w
    let aus = ''
    let k = 0
    while (k < w.length) {
      const zwei = w.slice(k, k + 2)
      // Die Schleife laeuft nur solange k < w.length, ein Zeichen gibt es hier
      // also immer. Der Rueckfall auf '' beruhigt bloss
      // noUncheckedIndexedAccess und aendert nichts: er ist nicht erreichbar.
      const eins = w[k] ?? ''
      if (k === 0 && VOKALE.has(eins)) aus += 'ئ'
      // Der Treffer wird einmal nachgeschlagen und festgehalten, statt zweimal
      // zugegriffen. Nur so weiss TypeScript beim Anhaengen, dass er da ist —
      // ein zweiter Zugriff waere wieder `string | undefined`.
      const trefferZwei = L2A[zwei]
      if (trefferZwei !== undefined) { aus += trefferZwei; k += 2; continue }
      const trefferEins = L2A[eins]
      if (trefferEins !== undefined) { aus += trefferEins; k += 1; continue }
      aus += eins; k += 1
    }
    return aus
  }).join('')
}

const A2L: Umschrifttabelle = {
  'وو': 'û', 'ئا': 'a', 'ئە': 'e', 'ئێ': 'ê', 'ئی': 'î', 'ئۆ': 'o', 'ئو': 'u',
  'ا': 'a', 'ب': 'b', 'ج': 'c', 'چ': 'ç', 'د': 'd', 'ە': 'e', 'ه': 'h',
  'ھ': 'h', 'ێ': 'ê', 'ف': 'f', 'گ': 'g', 'ی': 'î', 'ژ': 'j', 'ک': 'k',
  'ك': 'k', 'ل': 'l', 'ڵ': 'l', 'م': 'm', 'ن': 'n', 'ۆ': 'o', 'پ': 'p',
  'ق': 'q', 'ر': 'r', 'ڕ': 'r', 'س': 's', 'ش': 'ş', 'ت': 't', 'و': 'w',
  'ڤ': 'v', 'خ': 'x', 'ز': 'z', 'ع': "'", 'غ': 'x', 'ح': 'h', 'ص': 's',
  'ط': 't', 'ئ': '', 'ي': 'î', 'ـ': '',
}

export function arabischNachLatein(text: string): string {
  let aus = ''
  let k = 0
  while (k < text.length) {
    const zwei = text.slice(k, k + 2)
    // Wie oben: k < text.length sichert das Zeichen zu, '' ist unerreichbar.
    const eins = text[k] ?? ''
    const trefferZwei = A2L[zwei]
    if (trefferZwei !== undefined) { aus += trefferZwei; k += 2; continue }
    const trefferEins = A2L[eins]
    if (trefferEins !== undefined) { aus += trefferEins; k += 1; continue }
    aus += eins; k += 1
  }
  return aus
}

// Aussprache: nur kurdische Stimmen werden gezielt gewaehlt. Gibt es keine,
// nimmt der Browser seine Standardstimme — eine Fremdsprache wird nicht
// untergeschoben. Echte Muttersprachler-Aufnahmen haben ohnehin Vorrang
// (siehe core/audio/audioService.js).
const KURDISCH: readonly string[] = ['ku', 'kmr', 'ckb', 'kur', 'sdh']

/*
 * ACHTUNG, bekannte Grenze — hier bewusst NICHT geaendert:
 * `'speechSynthesis' in window` faengt nur den Fall ab, dass es ein `window`
 * gibt, das die Sprachausgabe nicht kennt. Fehlt `window` selbst — also
 * ueberall ausserhalb des Browsers, etwa unter Node im Test —, wirft schon
 * das Auslesen von `window` einen ReferenceError, bevor die Pruefung greift.
 * Die beiden Funktionen sind darum nur aus dem Browser heraus aufrufbar.
 * Der Typ verschweigt das nicht: die DOM-Bibliothek erklaert `window` fuer
 * immer vorhanden, deshalb steht die Einschraenkung hier als Kommentar.
 * Die Tests haengen sich aus genau diesem Grund nicht an diese Funktionen.
 */

export function sprich(text: string): boolean {
  if (!('speechSynthesis' in window)) return false
  const stimmen = window.speechSynthesis.getVoices()
  const stimme: SpeechSynthesisVoice | null =
    stimmen.find((v) => KURDISCH.some((k) => v.lang.toLowerCase().startsWith(k))) || null
  const u = new SpeechSynthesisUtterance(text)
  if (stimme) {
    u.voice = stimme
    u.lang = stimme.lang
  } else {
    u.lang = 'ku'
  }
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
  return true
}

/** Gibt es auf diesem Geraet ueberhaupt eine kurdische Stimme? */
export function hatKurdischeStimme(): boolean {
  if (!('speechSynthesis' in window)) return false
  return window.speechSynthesis
    .getVoices()
    .some((v) => KURDISCH.some((k) => v.lang.toLowerCase().startsWith(k)))
}
