import { Zap } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { GROUPS, KINDS, SECTIONS } from '@/data/sections.js'

/** Menu działów: na komputerze zwijany pasek boczny, na telefonie wysuwany panel. */
export default function AppSidebar({ section, sub, data }) {
  const { setOpenMobile } = useSidebar()
  const close = () => setOpenMobile(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild isActive={!section} tooltip="Start">
              <a href="#start" onClick={close}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap />
                </span>
                <span className="grid flex-1 leading-tight">
                  <span className="truncate font-semibold">Prąd elektryczny</span>
                  <span className="truncate text-xs text-muted-foreground">Fizyka · klasa 8</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((g) => (
          <SidebarGroup key={g.id} style={{ '--g': g.color }}>
            <SidebarGroupLabel className="text-g">{g.title}</SidebarGroupLabel>
            <SidebarMenu>
              {SECTIONS.filter((s) => s.group === g.id).map((s) => (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton asChild isActive={section === s} tooltip={s.title}>
                    <a href={`#${s.id}`} onClick={close}>
                      <s.icon className="text-g" />
                      <span>{s.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {data[s.id] && <SidebarMenuBadge>{data[s.id].ok}</SidebarMenuBadge>}
                  {section === s && s.subs && (
                    <SidebarMenuSub>
                      {s.subs.map((u) => {
                        const Kind = KINDS[u.kind].icon
                        return (
                          <SidebarMenuSubItem key={u.id}>
                            <SidebarMenuSubButton asChild isActive={u === sub}>
                              <a href={`#${s.id}/${u.id}`} onClick={close}>
                                <Kind />
                                <span>{u.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
