import { House, LayoutList, NotebookText, Trophy } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const item = 'flex flex-col items-center justify-center gap-0.5 text-[0.72rem] font-medium text-muted-foreground data-active:text-primary [&_svg]:size-5'

/** Szybka nawigacja na dole ekranu – tylko na telefonie. */
export default function BottomNav({ secId }) {
  const { openMobile, setOpenMobile } = useSidebar()
  const active = (on) => (on ? '' : undefined)

  return (
    <nav
      aria-label="Szybka nawigacja"
      className="grid h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 grid-cols-4 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <a href="#start" className={item} data-active={active(!secId && !openMobile)}>
        <House />
        Start
      </a>
      <button type="button" className={cn(item, 'cursor-pointer')} data-active={active(openMobile)} onClick={() => setOpenMobile(true)}>
        <LayoutList />
        Działy
      </button>
      <a href="#quiz" className={item} data-active={active(secId === 'quiz')}>
        <Trophy />
        Sprawdzian
      </a>
      <a href="#notatki" className={item} data-active={active(secId === 'notatki')}>
        <NotebookText />
        Ściąga
      </a>
    </nav>
  )
}
