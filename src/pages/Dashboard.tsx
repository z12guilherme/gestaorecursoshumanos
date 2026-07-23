import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  Clock,
  UserPlus,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Thermometer,
  Moon,
  Star,
  Eye,
  Mail,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useEmployees } from "@/hooks/useEmployees";
import { useRecruitment } from "@/hooks/useRecruitment";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { usePerformance } from "@/hooks/usePerformance";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BirthdaysList } from "@/components/dashboard/BirthdaysList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { employees: dbEmployees, loading: loadingEmployees } = useEmployees();
  const { jobs, loading: loadingJobs } = useRecruitment();
  const { entries: timeEntries, loading: loadingTime } = useTimeEntries();
  const { reviews, loading: loadingPerformance, error: performanceError } = usePerformance();

  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  const loading = loadingEmployees || loadingJobs || loadingTime || loadingPerformance;

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
    active: employees.filter((e) => ["active", "Ativo"].includes(e.status)).length,
    vacation: employees.filter((e) => ["vacation", "Férias"].includes(e.status)).length,
    openJobs: jobs.filter((j) => ["open", "Aberta"].includes(j.status)).length,
  };

  // Cálculos Financeiros e Operacionais
  const financialStats = employees.reduce(
    (acc, emp) => {
      if (["terminated", "Desligado"].includes(emp.status)) return acc;

      const base = Number(emp.baseSalary) || 0;
      const insalubrityValue = Number(emp.insalubrity_amount) || 0;
      const nightShiftValue = Number(emp.night_shift_amount) || 0;
      const familySalary = Number(emp.family_salary_amount) || 0;
      const overtime = Number(emp.overtime_amount) || 0;
      const vacation = Number(emp.vacation_amount) || 0;
      const vacationThird = Number(emp.vacation_third_amount) || 0;

      let varAdditions = 0;
      try {
        const adds = Array.isArray(emp.variable_additions)
          ? emp.variable_additions
          : JSON.parse(emp.variable_additions || "[]");
        varAdditions = adds.reduce((s: number, a: any) => s + (Number(a.value) || 0), 0);
      } catch (e) {
        // Ignorar erro de parsing
      }

      let varDiscounts = 0;
      try {
        const discs = Array.isArray(emp.variable_discounts)
          ? emp.variable_discounts
          : JSON.parse(emp.variable_discounts || "[]");
        varDiscounts = discs.reduce(
          (s: number, d: any) => s + (Number(d.amount || d.value) || 0),
          0
        );
      } catch (e) {
        // Ignorar erro de parsing
      }

      const fixedDiscounts = Number(emp.fixed_discounts) || 0;

      let inss = 0;
      if (emp.inss_value !== undefined && emp.inss_value !== null) {
        inss = Number(String(emp.inss_value).replace(",", ".")) || 0;
      } else if (
        emp.contract_type !== "Terceirizado" &&
        emp.contract_type !== "PJ" &&
        emp.contractType !== "Terceirizado" &&
        emp.contractType !== "PJ"
      ) {
        inss = (base + insalubrityValue + nightShiftValue + overtime + varAdditions) * 0.09; // Estimativa 9%
      }

      const netSalary =
        base +
        insalubrityValue +
        nightShiftValue +
        familySalary +
        overtime +
        vacation +
        vacationThird +
        varAdditions -
        (fixedDiscounts + varDiscounts + inss);
      acc.payroll += netSalary > 0 ? netSalary : 0;

      if (emp.hasInsalubrity) acc.insalubrityCount++;
      if (emp.hasNightShift) acc.nightShiftCount++;

      if (emp.vacationDueDate) {
        const due = new Date(emp.vacationDueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 90) acc.vacationDueCount++;
      }

      return acc;
    },
    { payroll: 0, insalubrityCount: 0, nightShiftCount: 0, vacationDueCount: 0 }
  );

  // Pega os 5 últimos registros de ponto
  const recentActivity = timeEntries.slice(0, 5).map((entry) => {
    const emp = employees.find((e) => e.id === entry.employee_id);
    return {
      ...entry,
      employeeName: emp?.name || "Colaborador",
      employeeRole: emp?.role || "",
    };
  });

  // Mapeia e formata as 3 avaliações mais recentes do banco/mock
  const recentEvaluations = reviews.slice(0, 3).map((review: any) => {
    const achievedGoals = Array.isArray(review.goals)
      ? review.goals.filter((g: any) => g.achieved).length
      : 0;
    const totalGoals = Array.isArray(review.goals) ? review.goals.length : 0;

    return {
      id: review.id,
      employeeName: review.employee_name || "Colaborador",
      evaluatorName: review.reviewer_name || "Gestor",
      date:
        review.period || (review.created_at ? format(parseISO(review.created_at), "MM/yyyy") : "-"),
      score: review.overall_score || 0,
      goals: `${achievedGoals}/${totalGoals}`,
      competencies: Array.isArray(review.competencies)
        ? review.competencies.map((c: any) => ({
            name: c.name,
            value: c.score !== undefined ? c.score : c.value,
          }))
        : [],
      comment: review.feedback || "",
    };
  });

  // Insights da IA (Cálculos em tempo real)
  const longTenureEmployees = employees.filter((e) => {
    if (!e.admission_date) return false;
    const years =
      (new Date().getTime() - new Date(e.admission_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years > 2 && e.status === "active";
  }).length;

  const aiInsights = [
    {
      icon: AlertTriangle,
      color: "text-amber-500",
      text: `${longTenureEmployees} colaboradores completaram 2+ anos de casa. Considere agendar conversas de carreira para reduzir risco de turnover.`,
    },
    {
      icon: TrendingUp,
      color: "text-emerald-500",
      text: `A taxa de ocupação de vagas está em ${stats.openJobs > 0 ? Math.round((stats.total / (stats.total + stats.openJobs)) * 100) : 100}%. O setor de TI tem a maior demanda.`,
    },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da empresa">
      <div className="space-y-6">
        <Alert className="bg-primary/5 border-primary/20">
          <Mail className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold">Sugestões e Feedback</AlertTitle>
          <AlertDescription>
            Para sugestões de melhorias, adicionar funcionalidades ou correções de bugs, enviar
            email para{" "}
            <a
              href="mailto:ti.hospitaldmi@gmail.com"
              className="font-semibold text-primary hover:underline"
            >
              ti.hospitaldmi@gmail.com
            </a>
            , com nome, cargo e sugestão.
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Colaboradores</p>
                <h3 className="text-2xl font-bold">{loading ? "-" : stats.total}</h3>
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
                <h3 className="text-2xl font-bold">{loading ? "-" : stats.active}</h3>
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
                <h3 className="text-2xl font-bold">{loading ? "-" : stats.vacation}</h3>
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
                <h3 className="text-2xl font-bold">{loading ? "-" : stats.openJobs}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Financeira e Operacional */}
        <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">
          Financeiro & Operacional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Folha Estimada (Mensal)</p>
                <h3 className="text-2xl font-bold">
                  {loading
                    ? "-"
                    : `R$ ${financialStats.payroll.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Férias a Vencer (90 dias)
                </p>
                <h3 className="text-2xl font-bold">
                  {loading ? "-" : financialStats.vacationDueCount}
                </h3>
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
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" /> {financialStats.insalubrityCount} Insalub.
                  </span>
                  <span className="flex items-center gap-1">
                    <Moon className="h-3 w-3" /> {financialStats.nightShiftCount} Noturno
                  </span>
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
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 bg-background/60 rounded-lg border border-border/50"
                  >
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
                {loadingTime ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {activity.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{activity.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{activity.employeeRole}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={activity.type === "in" ? "outline" : "secondary"}
                          className={
                            activity.type === "in"
                              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                              : ""
                          }
                        >
                          {activity.type === "in" ? "Entrada" : "Saída"}
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
                {loadingJobs ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : (
                  jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.department} • {job.location}
                        </p>
                      </div>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                  ))
                )}
                {!loadingJobs && jobs.length === 0 && (
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
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                Avaliações Recentes
              </CardTitle>
              <CardDescription>Últimos feedbacks de desempenho do banco de dados</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingPerformance ? (
                <p className="text-sm text-muted-foreground py-4">Carregando avaliações...</p>
              ) : performanceError ? (
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive text-sm">
                  Erro ao carregar avaliações do banco de dados.
                </div>
              ) : recentEvaluations.length > 0 ? (
                <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                  {recentEvaluations.map((evalItem) => (
                    <div
                      key={evalItem.id}
                      className="space-y-4 p-4 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                              {evalItem.employeeName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm leading-none mb-1">
                              {evalItem.employeeName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Avaliado por {evalItem.evaluatorName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {evalItem.date}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => setSelectedEvaluation(evalItem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-background rounded-md border shadow-sm">
                          <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                            Nota Geral
                          </p>
                          <p className="text-xl font-black text-primary">{evalItem.score}</p>
                        </div>
                        <div className="text-center p-2 bg-background rounded-md border shadow-sm">
                          <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                            Metas
                          </p>
                          <p className="text-xl font-black">{evalItem.goals}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                          Competências
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {evalItem.competencies.map((comp) => (
                            <div
                              key={comp.name}
                              className="flex items-center justify-between text-xs bg-background/50 p-1.5 px-2 rounded border border-dashed"
                            >
                              <span className="font-medium">{comp.name}</span>
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 font-bold text-primary"
                              >
                                {comp.value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {evalItem.comment && (
                        <div className="relative">
                          <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                          <p className="text-xs italic text-muted-foreground pl-3 leading-relaxed">
                            "{evalItem.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  Nenhuma avaliação registrada recentemente.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalhes da Avaliação */}
      <Dialog
        open={!!selectedEvaluation}
        onOpenChange={(open) => !open && setSelectedEvaluation(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Avaliação Detalhada
            </DialogTitle>
            <DialogDescription>
              Feedback completo de desempenho técnico e comportamental
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {selectedEvaluation.employeeName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedEvaluation.employeeName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Avaliado por{" "}
                    <span className="font-medium text-foreground">
                      {selectedEvaluation.evaluatorName}
                    </span>{" "}
                    em{" "}
                    <span className="font-medium text-foreground">{selectedEvaluation.date}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-wider">
                    Nota Geral
                  </p>
                  <p className="text-4xl font-black text-primary">
                    {Number(selectedEvaluation.score).toFixed(1)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-wider">
                    Metas Atingidas
                  </p>
                  <p className="text-4xl font-black">{selectedEvaluation.goals}</p>
                </div>
              </div>

              {selectedEvaluation.competencies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    Competências Avaliadas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedEvaluation.competencies.map((comp: any) => (
                      <div
                        key={comp.name}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md border"
                      >
                        <span className="font-medium text-sm">{comp.name}</span>
                        <Badge className="font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none">
                          {comp.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvaluation.comment && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    Feedback do Gestor
                  </h4>
                  <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-900/50 italic text-foreground leading-relaxed whitespace-pre-wrap">
                    "{selectedEvaluation.comment}"
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
