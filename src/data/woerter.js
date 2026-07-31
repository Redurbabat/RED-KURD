// Offline-Grundwortschatz: alle Kurswörter sind direkt mit der App gebündelt.
// Das große R2-Wörterbuch erweitert diese Liste, ist aber keine Voraussetzung.
import { kurse } from './kurse.js'

export const woerter = kurse.flatMap((kurs) =>
  kurs.woerter.map((wort) => ({ ...wort, kat: kurs.name }))
)
