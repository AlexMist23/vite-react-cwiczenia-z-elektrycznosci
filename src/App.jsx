import { useEffect, useRef, useState } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { groupOf, resolveRoute, stepHash } from './data/lessons.jsx'
import { loadLastPage, saveLastPage, useProgress, useSteps } from './lib/progress.js'
import AppSidebar from './layout/AppSidebar.jsx'
import AppHeader from './layout/AppHeader.jsx'
import BottomNav from './layout/BottomNav.jsx'
import Home from './layout/Home.jsx'
import LessonView from './layout/LessonView.jsx'

const readHash = () => window.location.hash.replace('#', '') || 'start'

export default function App() {
  const [route, setRoute] = useState(readHash)
  const [last, setLast] = useState(loadLastPage)
  const { data, record, reset, resetSection } = useProgress()
  const { done, markDone, resetLesson, resetAll } = useSteps()
  // zmiana klucza montuje krok od nowa – zerują się też wyniki w samych ćwiczeniach
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

  const { lesson, step } = resolveRoute(route)
  const hash = lesson && stepHash(lesson, step)

  useEffect(() => {
    if (!hash) return
    saveLastPage(hash)
    setLast(hash)
  }, [hash])

  return (
    <TooltipProvider>
      <SidebarProvider className="h-svh overflow-hidden" style={lesson ? { '--sec': groupOf(lesson).color } : undefined}>
        <AppSidebar lesson={lesson} step={step} done={done} />
        <SidebarInset className="min-w-0 overflow-hidden">
          <AppHeader lesson={lesson} step={step} />
          <div ref={mainRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 pb-12 md:px-8 md:pt-8">
              {lesson ? (
                <LessonView
                  lesson={lesson}
                  step={step}
                  progress={data[lesson.id]}
                  done={done}
                  record={record}
                  markDone={markDone}
                  resetCount={resetCount}
                  onReset={() => {
                    resetSection(lesson.id)
                    resetLesson(lesson.id)
                    setResetCount((n) => n + 1)
                  }}
                />
              ) : (
                <Home
                  data={data}
                  done={done}
                  last={last}
                  onResetAll={() => {
                    reset()
                    resetAll()
                  }}
                />
              )}
            </div>
          </div>
          <BottomNav secId={lesson?.id} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
