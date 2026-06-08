import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserCheck, Calendar, Briefcase, Clock, UserPlus, Star, Eye } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useRecruitment } from '@/hooks/useRecruitment';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { usePerformance, PerformanceReview } from '@/hooks/usePerformance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BirthdaysList } from '@/components/dashboard/BirthdaysList';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function Dashboard() {
    const { employees, loading: loadingEmployees } = useEmployees();
    const { jobs, loading: loadingJobs } = useRecruitment();
    const { entries: timeEntries, loading: loadingTime } = useTimeEntries();
    const { reviews, loading: loadingPerformance } = usePerformance();

    const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceReview | null>(null);

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

                    {/* Birthdays List */}
                    <div className="col-span-1">
                        <BirthdaysList employees={employees} />
                    </div>

                    {/* Card de Avaliações Recentes com Barra de Rolagem */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                Avaliações Recentes
                            </CardTitle>
                            <CardDescription>Últimos feedbacks de desempenho</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                                {reviews.slice(0, 5).map((evalItem) => (
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
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] font-bold">{evalItem.period}</Badge>
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
                                                <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Nota Geral</p>
                                                <p className="text-xl font-black text-primary">{evalItem.overall_score}</p>
                                            </div>
                                            <div className="text-center p-2 bg-background rounded-md border shadow-sm">
                                                <p className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Metas</p>
                                                <p className="text-xl font-black">{evalItem.goals.filter(g => g.achieved).length}/{evalItem.goals.length}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Competências</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {evalItem.competencies.map((comp) => (
                                                    <div key={comp.name} className="flex items-center justify-between text-xs bg-background/50 p-1.5 px-2 rounded border border-dashed">
                                                        <span className="font-medium truncate mr-2">{comp.name}</span>
                                                        <Badge variant="secondary" className="h-5 px-1.5 font-bold text-primary">{comp.score}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                                            <p className="text-xs italic text-muted-foreground pl-3 leading-relaxed">
                                                "{evalItem.feedback}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {reviews.length === 0 && !loading && (
                                    <p className="text-sm text-center py-8 text-muted-foreground">Nenhuma avaliação registrada recentemente.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Detalhes da Avaliação */}
            <Dialog open={!!selectedEvaluation} onOpenChange={(open) => !open && setSelectedEvaluation(null)}>
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
                                        {selectedEvaluation.employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedEvaluation.employeeName}</h3>
                                    <p className="text-sm text-muted-foreground">Avaliado por <span className="font-medium text-foreground">{selectedEvaluation.reviewer_name}</span> em <span className="font-medium text-foreground">{selectedEvaluation.period}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-wider">Nota Geral</p>
                                    <p className="text-4xl font-black text-primary">{selectedEvaluation.overall_score.toFixed(1)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border text-center">
                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-wider">Metas Atingidas</p>
                                    <p className="text-4xl font-black">{selectedEvaluation.goals.filter(g => g.achieved).length}/{selectedEvaluation.goals.length}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Competências Avaliadas</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedEvaluation.competencies.map((comp: any) => (
                                        <div key={comp.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                                            <span className="font-medium text-sm">{comp.name}</span>
                                            <Badge className="font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none">{comp.score}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Feedback do Gestor</h4>
                                <div className="p-5 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-900/50 italic text-foreground leading-relaxed whitespace-pre-wrap">
                                    "{selectedEvaluation.feedback}"
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}