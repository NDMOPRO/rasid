import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Bell,
  ChevronDown,
  PanelRight,
  Bot,
} from "lucide-react";
import { CSSProperties, useState, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/eAXbruiTdhpCTGaH.png";
const CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bplMgZcUFrzRMDas.png";

interface NavGroup {
  label: string;
  icon: any;
  basePath: string;
  items: { label: string; path: string; icon?: any }[];
}

const navGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    icon: LayoutDashboard,
    basePath: "/app/overview",
    items: [
      { label: "لوحة المؤشرات", path: "/app/overview" },
    ],
  },
  {
    label: "الخصوصية",
    icon: Shield,
    basePath: "/app/privacy",
    items: [
      { label: "لوحة الخصوصية", path: "/app/privacy" },
      { label: "المواقع", path: "/app/privacy/sites" },
    ],
  },
  {
    label: "التسربات",
    icon: AlertTriangle,
    basePath: "/app/incidents",
    items: [
      { label: "لوحة التسربات", path: "/app/incidents" },
      { label: "الوقائع", path: "/app/incidents/list" },
    ],
  },
  {
    label: "المتابعات",
    icon: ClipboardList,
    basePath: "/app/followups",
    items: [
      { label: "قائمة المتابعات", path: "/app/followups" },
    ],
  },
  {
    label: "التقارير",
    icon: FileText,
    basePath: "/app/reports",
    items: [
      { label: "التقارير", path: "/app/reports" },
    ],
  },
  {
    label: "لوحتي",
    icon: BarChart3,
    basePath: "/app/my",
    items: [
      { label: "لوحتي المخصصة", path: "/app/my" },
    ],
  },
  {
    label: "راصد الذكي",
    icon: Bot,
    basePath: "/app/smart-rasid",
    items: [
      { label: "محادثة جديدة", path: "/app/smart-rasid" },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    label: "الإدارة",
    icon: Settings,
    basePath: "/admin",
    items: [
      { label: "المستخدمون", path: "/admin/users", icon: Users },
      { label: "الإعدادات", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen page-bg">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img src={CHARACTER_URL} alt="راصد" className="h-32 w-auto" />
          <div className="flex flex-col items-center gap-4">
            <img src={LOGO_URL} alt="منصة راصد" className="h-12 w-auto" />
            <p className="text-sm text-muted-foreground text-center">
              يرجى تسجيل الدخول للوصول إلى المنصة
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "260px" } as CSSProperties}
    >
      <SidebarNav isAdmin={isAdmin}>
        {children}
      </SidebarNav>
    </SidebarProvider>
  );
}

function SidebarNav({ children, isAdmin }: { children: ReactNode; isAdmin: boolean }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const unreadCount = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const allGroups = isAdmin ? [...navGroups, ...adminNavGroups] : navGroups;

  return (
    <>
      <Sidebar collapsible="icon" className="border-l-0 border-r border-border/50" side="right">
        <SidebarHeader className="h-16 justify-center border-b border-border/30">
          <div className="flex items-center gap-3 px-3">
            {!isCollapsed && (
              <img src={LOGO_URL} alt="راصد" className="h-8 w-auto" />
            )}
            {isCollapsed && (
              <img src={LOGO_URL} alt="راصد" className="h-7 w-auto mx-auto" />
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 pt-2">
          <SidebarMenu className="px-2">
            {allGroups.map((group) => {
              const isActive = location.startsWith(group.basePath);
              const hasSingleItem = group.items.length === 1;

              if (hasSingleItem) {
                const item = group.items[0];
                const itemActive = location === item.path;
                return (
                  <SidebarMenuItem key={group.basePath}>
                    <SidebarMenuButton
                      isActive={itemActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={group.label}
                      className="h-10"
                    >
                      <group.icon className={`h-4 w-4 ${itemActive ? "text-gold" : ""}`} />
                      <span>{group.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible key={group.basePath} defaultOpen={isActive}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.label}
                        className="h-10"
                        isActive={isActive}
                      >
                        <group.icon className={`h-4 w-4 ${isActive ? "text-gold" : ""}`} />
                        <span>{group.label}</span>
                        <ChevronDown className="mr-auto h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => {
                          const itemActive = location === item.path;
                          return (
                            <SidebarMenuSubItem key={item.path}>
                              <SidebarMenuSubButton
                                isActive={itemActive}
                                onClick={() => setLocation(item.path)}
                                className={itemActive ? "text-gold" : ""}
                              >
                                <span>{item.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors w-full text-right group-data-[collapsible=icon]:justify-center focus:outline-none">
                <Avatar className="h-9 w-9 border border-gold/30 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-gold/10 text-gold">
                    {user?.name?.charAt(0)?.toUpperCase() || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium truncate leading-none">
                    {user?.name || "مستخدم"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user?.email || ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation("/app/notifications")}>
                <Bell className="ml-2 h-4 w-4" />
                <span>الإشعارات</span>
                {(unreadCount.data ?? 0) > 0 && (
                  <Badge variant="destructive" className="mr-auto text-[10px] px-1.5 py-0">
                    {unreadCount.data}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <div className="flex border-b border-border/30 h-14 items-center justify-between bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setLocation("/app/notifications")}
            >
              <Bell className="h-4 w-4" />
              {(unreadCount.data ?? 0) > 0 && (
                <span className="absolute -top-0.5 -left-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                  {unreadCount.data}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 page-bg min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
