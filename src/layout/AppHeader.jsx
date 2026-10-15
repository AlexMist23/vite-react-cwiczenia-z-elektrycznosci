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
import { groupOf } from '@/data/sections.js'

/** Górny pasek: przycisk menu i ścieżka Grupa › Dział › Podstrona. */
export default function AppHeader({ section, sub }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {section ? (
            <>
              <BreadcrumbItem className="hidden lg:inline-flex">
                <span className="text-(--sec)">{groupOf(section).title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden lg:block" />
              <BreadcrumbItem className="min-w-0">
                {sub ? (
                  <BreadcrumbLink href={`#${section.id}`} className="truncate">
                    {section.title}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{section.title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {sub && (
                <>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
                    <BreadcrumbPage className="truncate">{sub.title}</BreadcrumbPage>
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
