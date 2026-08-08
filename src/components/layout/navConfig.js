// Die sechs Bereiche des Modern-Modus und die fünf des Abenteuer-Modus.
import { T } from '../../core/texts.js'

export const MODERN_NAV = [
  { id: 'heute', pfad: '/today', name: T.nav.heute, icon: 'heute' },
  { id: 'kurs', pfad: '/languages', name: T.nav.kurse, icon: 'kurs' },
  { id: 'ueben', pfad: '/practice', name: T.nav.ueben, icon: 'ueben' },
  { id: 'entdecken', pfad: '/explore', name: T.nav.entdecken, icon: 'entdecken' },
  { id: 'fortschritt', pfad: '/progress', name: T.nav.fortschritt, icon: 'fortschritt' },
  { id: 'einstellungen', pfad: '/settings', name: T.nav.einstellungen, icon: 'einstellungen' },
]

// Lernen und Kultur stehen im Vordergrund — der Shop liegt im Profil.
export const ABENTEUER_NAV = [
  { id: 'start', pfad: '/adventure', name: T.nav.start, icon: 'heute' },
  { id: 'lernpfad', pfad: '/adventure/worlds', name: T.nav.lernpfad, icon: 'welt' },
  { id: 'aufgaben', pfad: '/adventure/tasks', name: T.nav.aufgaben, icon: 'aufgaben' },
  { id: 'kultur', pfad: '/adventure/culture', name: T.nav.kultur, icon: 'musik' },
  { id: 'profil', pfad: '/adventure/profile', name: T.nav.profil, icon: 'profil' },
]

export const REDLINGO_NAV = [
  { id: 'redlingo-start', pfad: '/redlingo', name: T.nav.start, icon: 'heute' },
  { id: 'kurs', pfad: '/languages', name: T.nav.kurse, icon: 'kurs' },
  { id: 'ueben', pfad: '/practice', name: T.nav.ueben, icon: 'ueben' },
  { id: 'fortschritt', pfad: '/progress', name: T.nav.fortschritt, icon: 'fortschritt' },
  { id: 'redlingo-profil', pfad: '/redlingo/profile', name: T.nav.profil, icon: 'profil' },
]

/** Welcher Navigationspunkt ist beim aktuellen Pfad aktiv? */
export function istAktiv(eintrag, pfad) {
  if (eintrag.pfad === '/redlingo') return pfad === '/redlingo'
  if (eintrag.pfad === '/redlingo/profile') {
    return pfad.startsWith('/redlingo/profile') || pfad.startsWith('/settings')
  }
  if (eintrag.pfad === '/adventure') return pfad === '/adventure'
  if (eintrag.pfad === '/adventure/worlds') {
    return pfad.startsWith('/adventure/world') || pfad.startsWith('/adventure/lesson')
  }
  if (eintrag.pfad === '/adventure/profile') {
    return pfad.startsWith('/adventure/profile') || pfad.startsWith('/adventure/shop')
  }
  if (eintrag.pfad === '/today') return pfad === '/today' || pfad === '/'
  if (eintrag.pfad === '/languages') {
    return pfad.startsWith('/languages') || pfad.startsWith('/course')
  }
  return pfad === eintrag.pfad || pfad.startsWith(eintrag.pfad + '/')
}
