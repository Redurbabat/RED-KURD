// Alle Adressen der App an einer Stelle. Seiten sind ganz normale Komponenten
// ohne Eigenschaften — ihre Daten holen sie sich aus den Stores.
import { useEffect } from 'react'
import { useRoute, navigiere, passt, loeseUmleitung } from './router.jsx'
import { appModus } from '../core/ui/uiStore.js'

import TodayPage from '../modes/modern/pages/TodayPage.jsx'
import SessionPage from '../modes/modern/pages/SessionPage.jsx'
import CoursePage from '../modes/modern/pages/CoursePage.jsx'
import UnitPage from '../modes/modern/pages/UnitPage.jsx'
import LessonPage from '../modes/modern/pages/LessonPage.jsx'
import PracticePage from '../modes/modern/pages/PracticePage.jsx'
import PracticeRunPage from '../modes/modern/pages/PracticeRunPage.jsx'
import ExplorePage from '../modes/modern/pages/ExplorePage.jsx'
import ProgressPage from '../modes/modern/pages/ProgressPage.jsx'
import SettingsPage from '../modes/modern/pages/SettingsPage.jsx'

import AdventureHomePage from '../modes/adventure/pages/AdventureHomePage.jsx'
import WorldMapPage from '../modes/adventure/pages/WorldMapPage.jsx'
import WorldDetailPage from '../modes/adventure/pages/WorldDetailPage.jsx'
import AdventureLessonPage from '../modes/adventure/pages/AdventureLessonPage.jsx'
import DailyTasksPage from '../modes/adventure/pages/DailyTasksPage.jsx'
import ShopPage from '../modes/adventure/pages/ShopPage.jsx'
import AdventureProfilePage from '../modes/adventure/pages/AdventureProfilePage.jsx'

import NotFoundPage from '../modes/modern/pages/NotFoundPage.jsx'

/** Muster → Seite. Reihenfolge zählt: das erste passende Muster gewinnt. */
const ROUTEN = [
  ['/today', () => <TodayPage />],
  ['/session', () => <SessionPage />],

  ['/course', () => <CoursePage />],
  ['/course/:unitId', (p) => <UnitPage unitId={p.unitId} />],
  ['/course/:unitId/lesson/:lessonId', (p) => <LessonPage unitId={p.unitId} lessonId={p.lessonId} />],

  ['/practice', () => <PracticePage />],
  ['/practice/:trainingId', (p) => <PracticeRunPage trainingId={p.trainingId} />],

  ['/explore', () => <ExplorePage tab="start" />],
  ['/explore/dictionary', () => <ExplorePage tab="dictionary" />],
  ['/explore/reading', () => <ExplorePage tab="reading" />],
  ['/explore/script', () => <ExplorePage tab="script" />],
  ['/explore/culture', () => <ExplorePage tab="culture" />],

  ['/progress', () => <ProgressPage />],
  ['/settings', () => <SettingsPage />],

  ['/adventure', () => <AdventureHomePage />],
  ['/adventure/worlds', () => <WorldMapPage />],
  ['/adventure/world', () => <WorldMapPage />],
  ['/adventure/world/:worldId', (p) => <WorldDetailPage worldId={p.worldId} />],
  ['/adventure/lesson/:lessonId', (p) => <AdventureLessonPage unitId={p.lessonId} />],
  ['/adventure/quests', () => <DailyTasksPage />],
  ['/adventure/tasks', () => <DailyTasksPage />],
  ['/adventure/shop', () => <ShopPage />],
  ['/adventure/profile', () => <AdventureProfilePage />],
]

/** Gehört der Pfad zum Abenteuer-Modus? */
export function istAbenteuerPfad(pfad) {
  return pfad.startsWith('/adventure')
}

export default function AppRouter() {
  const { pfad } = useRoute()

  // Alte Adressen umleiten. Die Startseite richtet sich nach dem gewählten Modus.
  useEffect(() => {
    if (pfad === '/' || pfad === '/index.html') {
      navigiere(appModus() === 'abenteuer' ? '/adventure' : '/today', { ersetzen: true })
      return
    }
    const ziel = loeseUmleitung(pfad)
    if (ziel && ziel !== pfad) navigiere(ziel, { ersetzen: true })
  }, [pfad])

  for (const [muster, bauen] of ROUTEN) {
    const params = passt(muster, pfad)
    if (params) return bauen(params)
  }
  return <NotFoundPage pfad={pfad} />
}
