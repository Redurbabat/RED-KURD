// Tolerante Schrift-Normalisierung fuer die SUCHE: kurdische Diakritika und
// deutsche Umlaute werden auf Grundbuchstaben gefaltet, damit „cawa" auch
// „çawa" findet und „kase" auch „Käse".
//
// Bewusst getrennt von der Tipp-Bewertung (istRichtigGetippt in
// exerciseFactory.js): Die Suche darf grosszuegiger sein als eine Antwort-
// Pruefung — ein Treffer zu viel stoert nicht, eine falsch akzeptierte
// Antwort schon.
export function sucheNormal(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/ê/g, 'e')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
}
