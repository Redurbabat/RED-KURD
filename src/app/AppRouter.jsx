// Alle Adressen der App an einer Stelle. Seiten sind ganz normale Komponenten
// ohne Eigenschaften — ihre Daten holen sie sich aus den Stores.
import { Suspense, lazy, useEffect } from 'react'
import { useRoute, navigiere, passt, loeseUmleitung } from './router.jsx'
import { appModus } from '../core/ui/uiStore.js'
import { LoadingState } from '../components/common/EmptyState.jsx'

// Der schnelle Lernpfad steckt im Start-Bundle: Heute, Sitzung, Kurs, Üben.
import TodayPage from '../modes/modern/pages/TodayPage.jsx'
import SessionPage from '../modes/modern/pages/SessionPage.jsx'
import CoursePage from '../modes/modern/pages/CoursePage.jsx'
import UnitPage from '../modes/modern/pages/UnitPage.jsx'
import LessonPage from '../modes/modern/pages/LessonPage.jsx'
import PracticePage from '../modes/modern/pages/PracticePage.jsx'
import NotFoundPage from '../modes/modern/pages/NotFoundPage.jsx'

// Alles Übrige lädt erst bei Bedarf — und unten im Leerlauf komplett nach,
// damit der Service Worker die Teile für den Offline-Betrieb einsammelt.
const NACHLADEN = []

function spaeter(laden) {
  NACHLADEN.push(laden)
  return lazy(laden)
}

const PracticeRunPage = spaeter(() => import('../modes/modern/pages/PracticeRunPage.jsx'))
const LanguagesPage = spaeter(() => import('../modes/modern/pages/LanguagesPage.jsx'))
const LanguageCoursePage = spaeter(() => import('../modes/modern/pages/LanguageCoursePage.jsx'))
const LanguageLessonPage = spaeter(() => import('../modes/modern/pages/LanguageLessonPage.jsx'))
const ExplorePage = spaeter(() => import('../modes/modern/pages/ExplorePage.jsx'))
const ProgressPage = spaeter(() => import('../modes/modern/pages/ProgressPage.jsx'))
const SettingsPage = spaeter(() => import('../modes/modern/pages/SettingsPage.jsx'))

const RedlingoHomePage = spaeter(() => import('../modes/redlingo/pages/RedlingoHomePage.jsx'))
const RedlingoProfilePage = spaeter(() => import('../modes/redlingo/pages/RedlingoProfilePage.jsx'))

const AdventureHomePage = spaeter(() => import('../modes/adventure/pages/AdventureHomePage.jsx'))
const WorldMapPage = spaeter(() => import('../modes/adventure/pages/WorldMapPage.jsx'))
const WorldDetailPage = spaeter(() => import('../modes/adventure/pages/WorldDetailPage.jsx'))
const AdventureLessonPage = spaeter(() => import('../modes/adventure/pages/AdventureLessonPage.jsx'))
const DailyTasksPage = spaeter(() => import('../modes/adventure/pages/DailyTasksPage.jsx'))
const ShopPage = spaeter(() => import('../modes/adventure/pages/ShopPage.jsx'))
const AdventureProfilePage = spaeter(() => import('../modes/adventure/pages/AdventureProfilePage.jsx'))
const AdventureCulturePage = spaeter(() => import('../modes/adventure/pages/AdventureCulturePage.jsx'))

/** Muster → Seite. Reihenfolge zählt: das erste passende Muster gewinnt. */
const ROUTEN = [
  ['/today', () => <TodayPage />],
  ['/session', () => <SessionPage />],

  ['/course', () => <CoursePage />],
  ['/course/:unitId', (p) => <UnitPage unitId={p.unitId} />],
  ['/course/:unitId/lesson/:lessonId', (p) => <LessonPage unitId={p.unitId} lessonId={p.lessonId} />],

  ['/languages', () => <LanguagesPage />],
  ['/languages/:languageId', (p) => <LanguageCoursePage languageId={p.languageId} />],
  [
    '/languages/:languageId/:chapterId',
    (p) => <LanguageLessonPage languageId={p.languageId} chapterId={p.chapterId} />,
  ],

  ['/practice', () => <PracticePage />],
  ['/practice/:trainingId', (p) => <PracticeRunPage trainingId={p.trainingId} />],

  ['/explore', () => <ExplorePage tab="start" />],
  ['/explore/dictionary', () => <ExplorePage tab="dictionary" />],
  ['/explore/reading', () => <ExplorePage tab="reading" />],
  ['/explore/script', () => <ExplorePage tab="script" />],
  ['/explore/culture', () => <ExplorePage tab="culture" />],

  ['/progress', () => <ProgressPage />],
  ['/settings', () => <SettingsPage />],

  ['/redlingo', () => <RedlingoHomePage />],
  ['/redlingo/profile', () => <RedlingoProfilePage />],

  ['/adventure', () => <AdventureHomePage />],
  ['/adventure/worlds', () => <WorldMapPage />],
  ['/adventure/world', () => <WorldMapPage />],
  ['/adventure/world/:worldId', (p) => <WorldDetailPage worldId={p.worldId} />],
  ['/adventure/lesson/:lessonId', (p) => <AdventureLessonPage unitId={p.lessonId} />],
  ['/adventure/quests', () => <DailyTasksPage />],
  ['/adventure/tasks', () => <DailyTasksPage />],
  ['/adventure/culture', () => <AdventureCulturePage />],
  ['/adventure/shop', () => <ShopPage />],
  ['/adventure/profile', () => <AdventureProfilePage />],
]

/** Gehört der Pfad zum Abenteuer-Modus? */
export function istAbenteuerPfad(pfad) {
  return pfad.startsWith('/adventure')
}

/** Gehört der Pfad zur eigenen Redlingo-Ansicht? */
export function istRedlingoPfad(pfad) {
  return pfad.startsWith('/redlingo')
}

export default function AppRouter() {
  const { pfad } = useRoute()

  // Alte Adressen umleiten. Die Startseite richtet sich nach dem gewählten Modus.
  useEffect(() => {
    if (pfad === '/' || pfad === '/index.html') {
      const modus = appModus()
      navigiere(
        modus === 'abenteuer' ? '/adventure' : modus === 'redlingo' ? '/redlingo' : '/today',
        { ersetzen: true }
      )
      return
    }
    const ziel = loeseUmleitung(pfad)
    if (ziel && ziel !== pfad) navigiere(ziel, { ersetzen: true })
  }, [pfad])

  // Nach dem Start in Ruhe alles nachladen: Der erste Aufbau bleibt klein,
  // und offline sind trotzdem alle Seiten da, sobald der Service Worker die
  // Teile einmal gesehen hat.
  useEffect(() => {
    const alles = () => NACHLADEN.forEach((laden) => laden().catch(() => {}))
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(alles, { timeout: 8000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(alles, 4000)
    return () => window.clearTimeout(id)
  }, [])

  let seite = <NotFoundPage pfad={pfad} />
  for (const [muster, bauen] of ROUTEN) {
    const params = passt(muster, pfad)
    if (params) {
      seite = bauen(params)
      break
    }
  }
  return <Suspense fallback={<LoadingState />}>{seite}</Suspense>
}
