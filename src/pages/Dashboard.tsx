import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { HiringTrendChart } from '@/components/dashboard/HiringTrendChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { BirthdaysList } from '@/components/dashboard/BirthdaysList';
import { dashboardStats as initialStats, employees as mockEmployees, timeOffRequests as mockRequests } from '@/data/mockData';
import { Users, TrendingDown, Calendar, Briefcase, AlertCircle, Cake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const updateStats = () => {
      const employees = JSON.parse(localStorage.getItem('hr_employees') || 'null') || mockEmployees;
      const requests = JSON.parse(localStorage.getItem('hr_timeoff_requests') || 'null') || mockRequests;
      
      setStats(prev => ({
        ...prev,
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.status === 'active').length,
        onVacation: employees.filter((e: any) => e.status === 'vacation').length,
        onLeave: employees.filter((e: any) => e.status === 'leave').length,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
      }));
    };

    updateStats();
    window.addEventListener('storage', updateStats);

    return () => window.removeEventListener('storage', updateStats);
  }, []);

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do departamento de RH">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Colaboradores"
            value={stats.totalEmployees}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 3.2, label: 'vs mês anterior' }}
          />
          <StatCard
            title="Taxa de Turnover"
            value={`${stats.turnoverRate}%`}
            icon={<TrendingDown className="h-6 w-6" />}
            trend={{ value: -1.5, label: 'vs mês anterior' }}
          />
          <StatCard
            title="Vagas Abertas"
            value={stats.openPositions}
            icon={<Briefcase className="h-6 w-6" />}
            trend={{ value: 2, label: 'novas esta semana' }}
          />
          <StatCard
            title="Solicitações Pendentes"
            value={stats.pendingRequests}
            icon={<AlertCircle className="h-6 w-6" />}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeEmployees}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.onVacation}</p>
                <p className="text-sm text-muted-foreground">Em férias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.onLeave}</p>
                <p className="text-sm text-muted-foreground">Afastados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                <Cake className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.birthdaysThisMonth}</p>
                <p className="text-sm text-muted-foreground">Aniversariantes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HiringTrendChart />
          <DepartmentChart />
        </div>

        {/* Activity and Birthdays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <BirthdaysList />
        </div>
      </div>
    </AppLayout>
  );
}
