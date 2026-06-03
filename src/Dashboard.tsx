import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase, Clock, UserPlus, Star } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRecruitment } from '@/hooks/useRecruitment';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BirthdaysList } from '@/components/dashboard/BirthdaysList';

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

  // Mock de avaliações recentes para demonstração da interface com scrollbar
  const recentEvaluations = [
    {
      id: '1',
      employeeName: 'FLAVIA GEANE GOMES DE LIMA',
      evaluatorName: 'JESSICA MARQUES DE ARAUJO BARBOSA',
      date: '05/2026',
      score: 4.5,
      goals: '0/0',
      competencies: [
        { name: 'Comunicação', value: 4 },
        { name: 'Trabalho em Equipe', value: 5 },
        { name: 'Proatividade', value: 4 },
        { name: 'Liderança', value: 5 },
      ],
      comment: "Flávia é uma colaboradora muito simpática e competente no que faz. Embora faça parte da minha equipe, é alguém que percebo possuir algumas limitações de recursos"
    }
  ];

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

          {/* Birthdays List */}
          <div className="col-span-1">
            <BirthdaysList employees={employees} />
          </div>

          {/* Card de Avaliações Recentes com Barra de Rolagem */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                Avaliações Recentes
              </CardTitle>
              <CardDescription>Últimos feedbacks de desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[440px] overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                {recentEvaluations.map((evalItem) => (
                  <div key={evalItem.id} className="space-y-4 p-4 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {evalItem.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm leading-none mb-1">{evalItem.employeeName}</p>
                          <p className="text-[11px] text-muted-foreground">Avaliado por {evalItem.evaluatorName}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold">{evalItem.date}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-background rounded-md border shadow-sm">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Nota Geral</p>
                        <p className="text-xl font-black text-primary">{evalItem.score}</p>
                      </div>
                      <div className="text-center p-2 bg-background rounded-md border shadow-sm">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Metas</p>
                        <p className="text-xl font-black">{evalItem.goals}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Competências</p>
                      <div className="grid grid-cols-1 gap-2">
                        {evalItem.competencies.map((comp) => (
                          <div key={comp.name} className="flex items-center justify-between text-xs bg-background/50 p-1.5 px-2 rounded border border-dashed">
                            <span className="font-medium">{comp.name}</span>
                            <Badge variant="secondary" className="h-5 px-1.5 font-bold text-primary">{comp.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                      <p className="text-xs italic text-muted-foreground pl-3 leading-relaxed">
                        "{evalItem.comment}"
                      </p>
                    </div>
                  </div>
                ))}
                {recentEvaluations.length === 0 && (
                  <p className="text-sm text-center py-8 text-muted-foreground">Nenhuma avaliação registrada recentemente.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}