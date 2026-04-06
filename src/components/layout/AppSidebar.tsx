import { useEmployees } from '@/hooks/useEmployees';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Star, 
  Calendar, 
  MessageSquare,
  Settings,
  Bot,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Workflow,
  FileText,
  Clock,
  LifeBuoy,
  MessageCircle,
  DollarSign,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Colaboradores', url: '/employees', icon: Users },
  { title: 'Salários e Pagamentos', url: '/payroll', icon: DollarSign },
  { title: 'Recrutamento', url: '/recruitment', icon: Briefcase },
  { title: 'Avaliações', url: '/performance', icon: Star },
  { title: 'Férias & Ausências', url: '/absences', icon: Calendar },
  { title: 'Controle de Ponto', url: '/timesheet', icon: Clock },
  { title: 'Chamados', url: '/tickets', icon: LifeBuoy },
  { title: 'Relatórios', url: '/reports', icon: FileText },
  { title: 'Comunicação', url: '/communication', icon: MessageSquare },
  { title: 'Ouvidoria', url: '/suggestions', icon: MessageCircle },
];

const toolsNavItems = [
  { title: 'Assistente IA', url: '/ai-assistant', icon: Bot },
  { title: 'Automações', url: '/automations', icon: Workflow },
  { title: 'Auditoria', url: '/audit-logs', icon: ShieldAlert },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut, session, profile, loading: authLoading } = useAuth();
  const { employees } = useEmployees();
  const isCollapsed = state === 'collapsed';
  
  // Tenta encontrar o funcionário correspondente para definir o cargo (Role)
  const currentEmployee = employees.find(e => e.email === session?.user?.email);

  // Prioriza os dados do perfil (tabela profiles), depois funcionário, depois sessão
  const userProfile = {
    name: profile?.full_name || currentEmployee?.name || session?.user?.user_metadata?.name || "Usuário",
    email: profile?.email || session?.user?.email || "",
    avatar: profile?.avatar_url || currentEmployee?.avatar_url || "",
    role: profile?.display_role || currentEmployee?.role || "Administrador"
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border z-[100]">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/icone.png" 
            alt="Logo" 
            className="h-10 w-10 rounded-lg object-contain"
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground"> RH - Rede DMI</span>
              <span className="text-xs text-muted-foreground">Gestão de Pessoas</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="p-2">
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <NavLink to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {toolsNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <NavLink to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors outline-none">
              {authLoading ? (
                <>
                  <Skeleton className="h-9 w-9 rounded-full" />
                  {!isCollapsed && (
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userProfile.name ? userProfile.name.substring(0, 2).toUpperCase() : "US"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex flex-col items-start text-left flex-1 overflow-hidden">
                        <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                          {userProfile.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {userProfile.role}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </>
                  )}
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[110]">
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Modo Escuro
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Modo Claro
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
