// Die fuenf Bereiche des Modern-Modus und die vier des Abenteuer-Modus.
import { T } from '../../core/texts.js'

export const MODERN_NAV = [
  { id: 'heute', pfad: '/today', name: T.nav.heute, icon: 'heute' },
  { id: 'kurs', pfad: '/course', name: T.nav.kurs, icon: 'kurs' },
  { id: 'ueben', pfad: '/practice', name: T.nav.ueben, icon: 'ueben' },
  { id: 'entdecken', pfad: '/explore', name: T.nav.entdecken, icon: 'entdecken' },
  { id: 'fortschritt', pfad: '/progress', name: T.nav.fortschritt, icon: 'fortschritt' },
]

export const ABENTEUER_NAV = [
  { id: 'welt', pfad: '/adventure', name: T.nav.welt, icon: 'welt' },
  { id: 'aufgaben', pfad: '/adventure/tasks', name: T.nav.aufgaben, icon: 'aufgaben' },
  { id: 'shop', pfad: '/adventure/shop', name: T.nav.shop, icon: 'shop' },
  { id: 'profil', pfad: '/adventure/profile', name: T.nav.profil, icon: 'profil' },
]

/** Welcher Navigationspunkt ist beim aktuellen Pfad aktiv? */
export function istAktiv(eintrag, pfad) {
  if (eintrag.pfad === '/adventure') {
    return (
      pfad === '/adventure' ||
      pfad.startsWith('/adventure/world') ||
      pfad.startsWith('/adventure/lesson')
    )
  }
  if (eintrag.pfad === '/today') return pfad === '/today' || pfad === '/'
  return pfad === eintrag.pfad || pfad.startsWith(eintrag.pfad + '/')
}
