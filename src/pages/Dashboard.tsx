import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase, Clock, UserPlus, Sparkles, TrendingUp, AlertTriangle, DollarSign, Thermometer, Moon } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRecruitment } from '@/hooks/useRecruitment';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { employees: dbEmployees, loading: loadingEmployees } = useEmployees();
  const { jobs, loading: loadingJobs } = useRecruitment();
  const { entries: timeEntries, loading: loadingTime } = useTimeEntries();

  const loading = loadingEmployees || loadingJobs || loadingTime;

  // Mapeia os dados do banco para o formato da UI
  const employees = dbEmployees.map((emp: any) => ({
    ...emp,
    baseSalary: emp.base_salary || 0,
    hasInsalubrity: emp.has_insalubrity || false,
    hasNightShift: emp.has_night_shift || false,
    vacationDueDate: emp.vacation_due_date,
  }));

  const stats = {
    total: employees.length,
    active: employees.filter(e => ['active', 'Ativo'].includes(e.status)).length,
    vacation: employees.filter(e => ['vacation', 'Férias'].includes(e.status)).length,
    openJobs: jobs.filter(j => ['open', 'Aberta'].includes(j.status)).length,
  };

  // Cálculos Financeiros e Operacionais
  const financialStats = employees.reduce((acc, emp) => {
    // Ignora demitidos
    if (['terminated', 'Desligado'].includes(emp.status)) return acc;

    const base = Number(emp.baseSalary) || 0;
    // Estimativas: Insalubridade (20% do mínimo 1412) e Noturno (20% do base)
    const insalubrityValue = emp.hasInsalubrity ? 1412 * 0.20 : 0;
    const nightShiftValue = emp.hasNightShift ? base * 0.20 : 0;

    acc.payroll += base + insalubrityValue + nightShiftValue;
    if (emp.hasInsalubrity) acc.insalubrityCount++;
    if (emp.hasNightShift) acc.nightShiftCount++;

    if (emp.vacationDueDate) {
      const due = new Date(emp.vacationDueDate);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 90) acc.vacationDueCount++; // Alerta para 3 meses
    }

    return acc;
  }, { payroll: 0, insalubrityCount: 0, nightShiftCount: 0, vacationDueCount: 0 });

  // Pega os 5 últimos registros de ponto
  const recentActivity = timeEntries.slice(0, 5).map(entry => {
    const emp = employees.find(e => e.id === entry.employee_id);
    return {
      ...entry,
      employeeName: emp?.name || 'Colaborador',
      employeeRole: emp?.role || '',
    };
  });

  // Insights da IA (Cálculos em tempo real)
  const longTenureEmployees = employees.filter(e => {
    if (!e.admission_date) return false;
    const years = (new Date().getTime() - new Date(e.admission_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years > 2 && e.status === 'active';
  }).length;

  const aiInsights = [
    {
      icon: AlertTriangle,
      color: "text-amber-500",
      text: `${longTenureEmployees} colaboradores completaram 2+ anos de casa. Considere agendar conversas de carreira para reduzir risco de turnover.`
    },
    {
      icon: TrendingUp,
      color: "text-emerald-500",
      text: `A taxa de ocupação de vagas está em ${stats.openJobs > 0 ? Math.round((stats.total / (stats.total + stats.openJobs)) * 100) : 100}%. O setor de Tecnologia tem a maior demanda.`
    }
  ];

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

        {/* Seção Financeira e Operacional */}
        <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Financeiro & Operacional</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Folha Estimada (Mensal)</p>
                <h3 className="text-2xl font-bold">
                  {loading ? '-' : `R$ ${financialStats.payroll.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Férias a Vencer (90 dias)</p>
                <h3 className="text-2xl font-bold">{loading ? '-' : financialStats.vacationDueCount}</h3>
                <p className="text-xs text-muted-foreground">Colaboradores em alerta</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Thermometer className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adicionais Ativos</p>
                <div className="flex gap-3 text-sm font-medium mt-1">
                  <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {financialStats.insalubrityCount} Insalub.</span>
                  <span className="flex items-center gap-1"><Moon className="h-3 w-3" /> {financialStats.nightShiftCount} Noturno</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights Card */}
          <Card className="col-span-1 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                Insights da IA
              </CardTitle>
              <CardDescription>Análise inteligente dos dados da sua empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-background/60 rounded-lg border border-border/50">
                    <insight.icon className={`h-5 w-5 shrink-0 ${insight.color} mt-0.5`} />
                    <p className="text-sm text-foreground">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
