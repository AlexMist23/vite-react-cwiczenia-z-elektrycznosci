import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { groupOf, isStepped } from '@/data/lessons.jsx'

/** Górny pasek: przycisk menu i ścieżka Grupa › Lekcja › Krok. */
export default function AppHeader({ lesson, step }) {
  const stepped = lesson && isStepped(lesson)
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {lesson ? (
            <>
              <BreadcrumbItem className="hidden lg:inline-flex">
                <span className="text-sec">{groupOf(lesson).title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden lg:block" />
              <BreadcrumbItem className="min-w-0">
                {stepped ? (
                  <BreadcrumbLink href={`#${lesson.id}`} className="truncate">
                    {lesson.title}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{lesson.title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {stepped && (
                <>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
                    <BreadcrumbPage className="truncate">{step.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Start</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
