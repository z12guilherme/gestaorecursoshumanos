import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, UserPlus, CalendarOff, UserCheck, Star, Cake, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useNotifications, AppNotification, NotificationType } from "@/hooks/useNotifications";
import { useSettings } from "@/hooks/useSettings";
import { DEFAULT_APP_NAME } from "@/lib/branding";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  time_off: <CalendarOff className="h-4 w-4 text-orange-500" />,
  new_employee: <UserPlus className="h-4 w-4 text-green-500" />,
  new_candidate: <UserCheck className="h-4 w-4 text-blue-500" />,
  performance: <Star className="h-4 w-4 text-yellow-500" />,
  birthday: <Cake className="h-4 w-4 text-pink-500" />,
};

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, formatRelativeTime } = useNotifications();
  const { settings } = useSettings();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const baseTitle = settings?.company_name || DEFAULT_APP_NAME;
    document.title = `${title} | ${baseTitle}`;
  }, [settings, title]);

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        variant="destructive"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[380px] overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-6 text-muted-foreground text-sm gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando notificações…
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 gap-2 text-muted-foreground">
                        <Bell className="h-8 w-8 opacity-30" />
                        <span className="text-sm">Nenhuma notificação recente</span>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notificationIcons[notification.type]}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between w-full gap-2">
                              <span className="font-medium text-sm truncate">
                                {notification.title}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatRelativeTime(notification.timestamp)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {notification.description}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="w-full justify-center text-sm font-medium text-primary cursor-pointer"
                        onClick={() => navigate("/employees")}
                      >
                        Ver todas as atividades
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-secondary/20 overflow-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
