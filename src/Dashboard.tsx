import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase, Clock, UserPlus } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRecruitment } from '@/hooks/useRecruitment';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { employees, loading: loadingEmployees } = useEmployees();
  const { jobs, loading: loadingJobs } = useRecruitment();
  const { entries: timeEntries, loading: loadingTime } = useTimeEntries();

  const loading = loadingEmployees || loadingJobs || loadingTime;

  const stats = {
    total: employees.length,
    active: employees.filter(e => ['active', 'Ativo'].includes(e.status)).length,
    vacation: employees.filter(e => ['vacation', 'Férias'].includes(e.status)).length,
    openJobs: jobs.filter(j => ['open', 'Aberta'].includes(j.status)).length,
  };

  // Pega os 5 últimos registros de ponto
  const recentActivity = timeEntries.slice(0, 5).map(entry => {
    const emp = employees.find(e => e.id === entry.employee_id);
    return {
      ...entry,
      employeeName: emp?.name || 'Colaborador',
      employeeRole: emp?.role || '',
    };
  });

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da empresa">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Colaboradores</p>
                <h3 className="text-2xl font-bold">{loading ? '-' : stats.total}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <h3 className="text-2xl font-bold">{loading ? '-' : stats.active}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Férias</p>
                <h3 className="text-2xl font-bold">{loading ? '-' : stats.vacation}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vagas Abertas</p>
                <h3 className="text-2xl font-bold">{loading ? '-' : stats.openJobs}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Últimos Registros de Ponto
              </CardTitle>
              <CardDescription>Atividades recentes dos colaboradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {activity.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{activity.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{activity.employeeRole}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.type === 'in' ? 'outline' : 'secondary'} className={activity.type === 'in' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}>
                          {activity.type === 'in' ? 'Entrada' : 'Saída'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(activity.timestamp), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions Preview */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Vagas Recentes
              </CardTitle>
              <CardDescription>Oportunidades em aberto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.department} • {job.location}</p>
                    </div>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                ))}
                {!loading && jobs.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma vaga aberta no momento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}