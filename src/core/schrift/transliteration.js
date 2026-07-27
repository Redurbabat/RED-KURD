// Schrift-Umwandlung Kurmancî: Latein (Hawar) <-> Arabische Schrift  [Beta]
// Regeln vereinfacht nach dem Vorbild von klpt/wergor

const L2A = {
  'xw': 'خو', 'û': 'وو', 'a': 'ا', 'b': 'ب', 'c': 'ج', 'ç': 'چ', 'd': 'د',
  'e': 'ە', 'ê': 'ێ', 'f': 'ف', 'g': 'گ', 'h': 'ه', 'i': '', 'î': 'ی',
  'j': 'ژ', 'k': 'ک', 'l': 'ل', 'm': 'م', 'n': 'ن', 'o': 'ۆ', 'p': 'پ',
  'q': 'ق', 'r': 'ر', 's': 'س', 'ş': 'ش', 't': 'ت', 'u': 'و', 'v': 'ڤ',
  'w': 'و', 'x': 'خ', 'y': 'ی', 'z': 'ز',
}
const VOKALE = new Set(['a', 'e', 'ê', 'i', 'î', 'o', 'u', 'û'])

export function lateinNachArabisch(text) {
  const woerter = text.toLowerCase().split(/(\s+)/)
  return woerter.map(w => {
    if (/^\s+$/.test(w) || !w) return w
    let aus = ''
    let k = 0
    while (k < w.length) {
      const zwei = w.slice(k, k + 2)
      const eins = w[k]
      if (k === 0 && VOKALE.has(eins)) aus += 'ئ'
      if (L2A[zwei] !== undefined) { aus += L2A[zwei]; k += 2; continue }
      if (L2A[eins] !== undefined) { aus += L2A[eins]; k += 1; continue }
      aus += eins; k += 1
    }
    return aus
  }).join('')
}

const A2L = {
  'وو': 'û', 'ئا': 'a', 'ئە': 'e', 'ئێ': 'ê', 'ئی': 'î', 'ئۆ': 'o', 'ئو': 'u',
  'ا': 'a', 'ب': 'b', 'ج': 'c', 'چ': 'ç', 'د': 'd', 'ە': 'e', 'ه': 'h',
  'ھ': 'h', 'ێ': 'ê', 'ف': 'f', 'گ': 'g', 'ی': 'î', 'ژ': 'j', 'ک': 'k',
  'ك': 'k', 'ل': 'l', 'ڵ': 'l', 'م': 'm', 'ن': 'n', 'ۆ': 'o', 'پ': 'p',
  'ق': 'q', 'ر': 'r', 'ڕ': 'r', 'س': 's', 'ش': 'ş', 'ت': 't', 'و': 'w',
  'ڤ': 'v', 'خ': 'x', 'ز': 'z', 'ع': "'", 'غ': 'x', 'ح': 'h', 'ص': 's',
  'ط': 't', 'ئ': '', 'ي': 'î', 'ـ': '',
}

export function arabischNachLatein(text) {
  let aus = ''
  let k = 0
  while (k < text.length) {
    const zwei = text.slice(k, k + 2)
    const eins = text[k]
    if (A2L[zwei] !== undefined) { aus += A2L[zwei]; k += 2; continue }
    if (A2L[eins] !== undefined) { aus += A2L[eins]; k += 1; continue }
    aus += eins; k += 1
  }
  return aus
}

// Aussprache: beste verfuegbare Stimme finden (Kurdisch selten, sonst Tuerkisch als Naeherung)
export function sprich(text) {
  if (!('speechSynthesis' in window)) return false
  const stimmen = window.speechSynthesis.getVoices()
  const stimme = stimmen.find(v => v.lang.toLowerCase().startsWith('ku'))
    || stimmen.find(v => v.lang.toLowerCase().startsWith('tr'))
    || null
  const u = new SpeechSynthesisUtterance(text)
  if (stimme) u.voice = stimme
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
  return true
}
