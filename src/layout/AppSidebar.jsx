import { Check, Zap } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  GROUPS,
  KINDS,
  LESSONS,
  isStepped,
  lessonNo,
  stepHash,
} from "@/data/lessons.jsx";

/** Menu lekcji: na komputerze zwijany pasek boczny, na telefonie wysuwany panel. */
export default function AppSidebar({ lesson, step, done }) {
  const { setOpenMobile } = useSidebar();
  const close = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              isActive={!lesson}
              tooltip="Start"
            >
              <a href="#start" onClick={close}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap />
                </span>
                <span className="grid flex-1 leading-tight">
                  <span className="truncate font-semibold">
                    Prąd elektryczny
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Fizyka
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((g) => (
          <SidebarGroup key={g.id} style={{ "--g": g.color }}>
            <SidebarGroupLabel className="text-g">{g.title}</SidebarGroupLabel>
            <SidebarMenu>
              {LESSONS.filter((l) => l.group === g.id).map((l) => {
                const stepped = isStepped(l);
                const finished = l.steps.filter(
                  (s) => done[stepHash(l, s)],
                ).length;
                const no = lessonNo(l);
                return (
                  <SidebarMenuItem key={l.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={lesson === l}
                      tooltip={l.title}
                    >
                      <a href={`#${l.id}`} onClick={close}>
                        <l.icon className="text-g" />
                        <span>
                          {no > 0 && (
                            <span className="text-muted-foreground">
                              {no}.{" "}
                            </span>
                          )}
                          {l.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                    {stepped && finished > 0 && (
                      <SidebarMenuBadge>
                        {finished === l.steps.length ?
                          <Check className="size-3.5 text-success" />
                        : `${finished}/${l.steps.length}`}
                      </SidebarMenuBadge>
                    )}
                    {lesson === l && stepped && (
                      <SidebarMenuSub>
                        {l.steps.map((s) => {
                          const isDone = done[stepHash(l, s)];
                          const Icon = isDone ? Check : KINDS[s.kind].icon;
                          return (
                            <SidebarMenuSubItem key={s.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={s === step}
                              >
                                <a href={`#${stepHash(l, s)}`} onClick={close}>
                                  <Icon
                                    className={
                                      isDone ? "text-success!" : undefined
                                    }
                                  />
                                  <span>{s.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
