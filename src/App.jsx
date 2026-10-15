import { useEffect, useRef, useState } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { groupOf, resolveRoute } from './data/sections.js'
import { loadLastPage, saveLastPage, useProgress } from './lib/progress.js'
import AppSidebar from './layout/AppSidebar.jsx'
import AppHeader from './layout/AppHeader.jsx'
import BottomNav from './layout/BottomNav.jsx'
import Home from './layout/Home.jsx'
import Pager from './layout/Pager.jsx'
import SectionHeader from './layout/SectionHeader.jsx'
import SubNav from './layout/SubNav.jsx'
import Notes from './sections/Notes.jsx'
import CircuitSim from './sections/CircuitSim.jsx'
import SymbolGame from './sections/SymbolGame.jsx'
import DirectionGame from './sections/DirectionGame.jsx'
import Media from './sections/Media.jsx'
import Effects from './sections/Effects.jsx'
import Triangles from './sections/Triangles.jsx'
import FormulaTrainer from './sections/FormulaTrainer.jsx'
import FormulaToCalc from './sections/FormulaToCalc.jsx'
import Units from './sections/Units.jsx'
import Problems from './sections/Problems.jsx'
import Quiz from './sections/Quiz.jsx'
import Electrostatics from './sections/Electrostatics.jsx'
import CircuitPuzzles from './sections/CircuitPuzzles.jsx'

const VIEWS = {
  elektrostatyka: Electrostatics,
  obwod: CircuitSim,
  symbole: SymbolGame,
  zagadki: CircuitPuzzles,
  kierunki: DirectionGame,
  skutki: Effects,
  osrodki: Media,
  wzory: Triangles,
  trening: FormulaTrainer,
  jednostki: Units,
  'wzor-obliczenie': FormulaToCalc,
  zadania: Problems,
  quiz: Quiz,
  notatki: Notes,
}

const readHash = () => window.location.hash.replace('#', '') || 'start'

export default function App() {
  const [route, setRoute] = useState(readHash)
  const [last, setLast] = useState(loadLastPage)
  const { data, record, reset, resetSection } = useProgress()
  // zmiana klucza montuje dział od nowa – zerują się też wyniki w samych ćwiczeniach
  const [resetCount, setResetCount] = useState(0)
  const mainRef = useRef(null)

  useEffect(() => {
    const on = () => {
      setRoute(readHash())
      mainRef.current?.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const { section, sub } = resolveRoute(route)
  const View = section && VIEWS[section.id]

  useEffect(() => {
    if (!section) return
    saveLastPage(route)
    setLast(route)
  }, [route, section])

  return (
    <TooltipProvider>
      <SidebarProvider className="h-svh overflow-hidden" style={section ? { '--sec': groupOf(section).color } : undefined}>
        <AppSidebar section={section} sub={sub} data={data} />
        <SidebarInset className="min-w-0 overflow-hidden">
          <AppHeader section={section} sub={sub} />
          <div ref={mainRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 pb-12 md:px-8 md:pt-8">
              {section ? (
                <>
                  <SectionHeader
                    section={section}
                    progress={data[section.id]}
                    onReset={() => {
                      resetSection(section.id)
                      setResetCount((n) => n + 1)
                    }}
                  />
                  {sub && <SubNav section={section} sub={sub} />}
                  <View key={`${section.id}-${resetCount}`} record={record} sub={sub?.id} />
                  <Pager section={section} sub={sub} />
                </>
              ) : (
                <Home data={data} last={last} onResetAll={reset} />
              )}
            </div>
          </div>
          <BottomNav secId={section?.id} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
