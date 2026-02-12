import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOff } from '@/hooks/useTimeOff';
import { supabase } from '@/lib/supabase';
import { Download, User, Calendar, Star, BarChart2, PieChart as PieChartIcon, CheckCircle2, XCircle, Users, Clock, Palmtree, DollarSign, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PayrollReport from '@/components/reports/PayrollReport';
import TimeSheetReport from '@/components/reports/TimeSheetReport';

const requestTypeLabels: Record<string, string> = {
  vacation: 'Férias',
  sick: 'Atestado',
  personal: 'Pessoal',
  maternity: 'Licença Maternidade',
  paternity: 'Licença Paternidade',
};

const requestStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const requestStatusClasses: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function Reports() {
  const { employees: dbEmployees, loading: loadingEmp } = useEmployees();
  const { requests, loading: loadingRequests } = useTimeOff();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [headcountData, setHeadcountData] = useState<any[]>([]);

  // Mapeia os dados do banco para o formato da UI
  const employees = useMemo(() => dbEmployees.map((emp: any) => ({
    ...emp,
    baseSalary: emp.base_salary || 0,
    hasInsalubrity: emp.has_insalubrity || false,
    hasNightShift: emp.has_night_shift || false,
    vacationDueDate: emp.vacation_due_date,
  })), [dbEmployees]);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const { data: settings, error } = await supabase.from('settings').select('*').maybeSingle();
        if (error) throw error;
        if (isMounted) setCompanySettings(settings);
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      if (!selectedEmployeeId) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      try {
        setLoadingReviews(true);
        const { data: reviewsData, error } = await supabase
          .from('performance_reviews')
          .select('*')
          .eq('employee_id', selectedEmployeeId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) setReviews(reviewsData || []);
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (employees.length > 0) {
      // 1. Department Distribution Data
      const deptCounts = employees.reduce((acc, emp) => {
          const dept = emp.department || 'Não definido';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      const deptChartData = Object.keys(deptCounts).map(key => ({
          name: key,
          value: deptCounts[key]
      }));
      setDepartmentData(deptChartData);

      // 2. Headcount Growth Data
      const hiresByMonth: Record<string, number> = {};
      employees.forEach(emp => {
          if (emp.admission_date) {
              const monthKey = format(new Date(emp.admission_date), 'yyyy-MM');
              hiresByMonth[monthKey] = (hiresByMonth[monthKey] || 0) + 1;
          }
      });

      const months = [];
      let cumulativeCount = employees.filter(e => e.admission_date && new Date(e.admission_date) < subMonths(new Date(), 6)).length;

      for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const monthKey = format(date, 'yyyy-MM');
          const monthName = format(date, 'MMM/yy', { locale: ptBR });
          
          cumulativeCount += (hiresByMonth[monthKey] || 0);

          months.push({ name: monthName, Total: cumulativeCount });
      }
      setHeadcountData(months);
    } else {
      setDepartmentData([]);
      setHeadcountData([]);
    }
  }, [employees]);

  const normalizeStatus = (value?: string) => (value || '').toLowerCase();
  const totalEmployees = employees.length;
  const totalEmployeesForPercent = totalEmployees || 1;
  const activeEmployees = employees.filter((emp) => ['active', 'ativo'].includes(normalizeStatus(emp.status))).length;
  const awayEmployees = employees.filter((emp) => ['vacation', 'leave', 'férias', 'afastado'].includes(normalizeStatus(emp.status))).length;
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const isLoading = loadingEmp || loadingRequests || loadingSettings;

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const employeeRequests = requests.filter(r => r.employee_id === selectedEmployeeId);
  const latestEmployeeRequests = employeeRequests.slice(0, 5);
  const averageReviewScore = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.overall_score || 0), 0) / reviews.length
    : null;
  const latestReviewDate = reviews.length ? format(new Date(reviews[0].created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : null;

  // Cálculos Financeiros para Relatórios
  const financialStats = employees.reduce((acc, emp) => {
    if (['terminated', 'Desligado'].includes(emp.status)) return acc;
    const base = Number(emp.baseSalary) || 0;
    const insalubrityValue = Number(emp.insalubrity_amount) || 0;
    const nightShiftValue = Number(emp.night_shift_amount) || 0;
    acc.payroll += base + insalubrityValue + nightShiftValue;
    
    if (emp.vacationDueDate) {
        const due = new Date(emp.vacationDueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 90) acc.vacationDueCount++;
    }
    return acc;
  }, { payroll: 0, vacationDueCount: 0 });

  const generatePDF = () => {
    if (!selectedEmployee) return;

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text(companySettings?.company_name || 'GestãoRH', 14, 20);
    doc.setFontSize(12);
    doc.text('Dossiê do Colaborador', 14, 28);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 34);

    // Linha divisória
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);
    
    // 1. Dados Pessoais
    doc.setFontSize(14);
    doc.text('Dados Pessoais e Contratuais', 14, 48);
    
    const empData = [
        ['Nome:', selectedEmployee.name],
        ['Cargo:', selectedEmployee.role],
        ['Departamento:', selectedEmployee.department],
        ['Email:', selectedEmployee.email || '-'],
        ['Telefone:', selectedEmployee.phone || '-'],
        ['Admissão:', selectedEmployee.admission_date ? format(new Date(selectedEmployee.admission_date), 'dd/MM/yyyy') : '-'],
        ['Status:', selectedEmployee.status]
    ];

    autoTable(doc, {
        startY: 52,
        head: [],
        body: empData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // 2. Histórico de Férias
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Histórico de Férias e Ausências', 14, finalY);
    
    const timeOffData = employeeRequests.map(r => [
        requestTypeLabels[r.type] || 'Ausência',
        format(new Date(r.start_date), 'dd/MM/yyyy'),
        format(new Date(r.end_date), 'dd/MM/yyyy'),
        requestStatusLabels[r.status] || r.status,
        r.attachment_url ? 'Sim' : 'Não'
    ]);

    if (timeOffData.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Tipo', 'Início', 'Fim', 'Status', 'Anexo']],
            body: timeOffData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });
    } else {
        doc.setFontSize(10);
        doc.text('Nenhum registro encontrado.', 14, finalY + 8);
        (doc as any).lastAutoTable.finalY = finalY + 10;
    }

    // 3. Avaliações
    finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Avaliações de Desempenho', 14, finalY);

    const reviewData = reviews.map(r => {
        const goalsMet = r.goals ? r.goals.filter((g: any) => g.achieved).length : 0;
        const totalGoals = r.goals ? r.goals.length : 0;
        return [
            r.period,
            Number(r.overall_score).toFixed(1),
            `${goalsMet}/${totalGoals}`,
            r.feedback || '',
            format(new Date(r.created_at), 'dd/MM/yyyy')
        ];
    });

    if (reviewData.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Período', 'Nota', 'Metas', 'Feedback', 'Data']],
            body: reviewData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: { 3: { cellWidth: 70 } }
        });
    } else {
        doc.setFontSize(10);
        doc.text('Nenhuma avaliação encontrada.', 14, finalY + 8);
    }

    doc.save(`Relatorio_${selectedEmployee.name.replace(/\s+/g, '_')}.pdf`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF42A1', '#42A1FF'];

  return (
    <AppLayout title="Relatórios" subtitle="Geração de documentos e análises">
       <div className="space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
           {isLoading ? (
             <>
               <Skeleton className="h-24" />
               <Skeleton className="h-24" />
               <Skeleton className="h-24" />
               <Skeleton className="h-24" />
             </>
           ) : (
             <>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                     <Users className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
                     <p className="text-xs text-muted-foreground">Colaboradores</p>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                     <CheckCircle2 className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                     <p className="text-xs text-muted-foreground">Ativos</p>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                     <Palmtree className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold text-foreground">{awayEmployees}</p>
                     <p className="text-xs text-muted-foreground">Em férias/ausência</p>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                     <Clock className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                     <p className="text-xs text-muted-foreground">Solicitações pendentes</p>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                     <DollarSign className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-lg font-bold text-foreground">R$ {(financialStats.payroll / 1000).toFixed(1)}k</p>
                     <p className="text-xs text-muted-foreground">Folha Est.</p>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                     <AlertTriangle className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold text-foreground">{financialStats.vacationDueCount}</p>
                     <p className="text-xs text-muted-foreground">Férias Vencendo</p>
                   </div>
                 </CardContent>
               </Card>
             </>
           )}
         </div>

         <PayrollReport />
         <TimeSheetReport />

         <Card>
            <CardHeader>
                <CardTitle>Relatório Geral por Funcionário</CardTitle>
                <CardDescription>Selecione um colaborador para visualizar e exportar seu dossiê completo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/2 space-y-2">
                        <label className="text-sm font-medium">Colaborador</label>
                        <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                            <SelectTrigger disabled={loadingEmp || employees.length === 0}>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.length === 0 && (
                                    <SelectItem value="none" disabled>Nenhum colaborador encontrado.</SelectItem>
                                )}
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button disabled={!selectedEmployeeId || loadingSettings} onClick={generatePDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </Button>
                </div>

                {selectedEmployee && (
                    <div className="border rounded-lg p-6 bg-secondary/10 space-y-6 animate-in fade-in-50">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-background">
                                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                    {selectedEmployee.name.substring(0,2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                                <p className="text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.department}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6 flex items-center gap-3">
                                    <User className="h-8 w-8 text-primary/60" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Admissão</p>
                                        <p className="font-medium">
                                            {selectedEmployee.admission_date ? format(new Date(selectedEmployee.admission_date), 'dd/MM/yyyy') : '-'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 flex items-center gap-3">
                                    <Calendar className="h-8 w-8 text-blue-500/60" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Férias/Ausências</p>
                                        <p className="font-medium">{employeeRequests.length} registros</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 flex items-center gap-3">
                                    <Star className="h-8 w-8 text-amber-500/60" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avaliações</p>
                                        <p className="font-medium">{reviews.length} ciclos</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Resumo de Avaliações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {loadingReviews ? (
                                        <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
                                    ) : reviews.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Média geral</span>
                                                <span className="font-semibold">{averageReviewScore?.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Última avaliação</span>
                                                <span className="font-semibold">{latestReviewDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Ciclos registrados</span>
                                                <span className="font-semibold">{reviews.length}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Solicitações Recentes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {latestEmployeeRequests.length > 0 ? (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead>Período</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Anexo</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {latestEmployeeRequests.map((request) => (
                                                        <TableRow key={request.id}>
                                                            <TableCell className="text-xs font-medium">
                                                                {requestTypeLabels[request.type] || 'Ausência'}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {format(new Date(request.start_date), 'dd/MM/yy')} - {format(new Date(request.end_date), 'dd/MM/yy')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={requestStatusClasses[request.status] || ''}>
                                                                    {requestStatusLabels[request.status] || request.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs">
                                                                {request.attachment_url ? (
                                                                    <a
                                                                        href={request.attachment_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                                    >
                                                                        <Download className="h-3 w-3" />
                                                                        Baixar
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-muted-foreground">—</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Sem solicitações registradas.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Histórico Detalhado de Avaliações */}
                        {reviews.length > 0 && (
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    Histórico de Avaliações
                                </h3>
                                <div className="grid gap-4">
                                    {reviews.map((review) => (
                                        <Card key={review.id} className="bg-card">
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-lg">{review.period}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Realizada em {format(new Date(review.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full text-amber-700 dark:text-amber-400 font-bold">
                                                        <Star className="h-4 w-4 fill-current" />
                                                        {Number(review.overall_score).toFixed(1)}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm font-medium mb-2 text-muted-foreground">Metas e Objetivos</p>
                                                        <ul className="space-y-2">
                                                            {review.goals?.map((g: any, i: number) => (
                                                                <li key={i} className="text-sm flex items-start gap-2">
                                                                    {g.achieved ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                                                    )}
                                                                    <span className={g.achieved ? "text-foreground" : "text-muted-foreground line-through decoration-border"}>
                                                                        {g.description}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium mb-2 text-muted-foreground">Feedback do Gestor</p>
                                                        <div className="bg-secondary/30 p-3 rounded-md text-sm italic text-foreground/80">
                                                            "{review.feedback || 'Sem feedback registrado.'}"
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
                <CardTitle>Análises Gerais da Empresa</CardTitle>
                <CardDescription>Visão gráfica da composição e crescimento da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                    <h3 className="font-medium text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><PieChartIcon className="h-4 w-4" /> Distribuição por Departamento</h3>
                    {departmentData.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            Nenhum dado de departamento disponível.
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (percent as number) > 0.05 ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">{(percent * 100).toFixed(0)}%</text> : null;
                                    }}>
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} (${((value as number) / totalEmployeesForPercent * 100).toFixed(1)}%)`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><BarChart2 className="h-4 w-4" /> Crescimento do Headcount (Últimos 6 Meses)</h3>
                    {headcountData.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            Nenhum dado de admissões disponível.
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={headcountData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                    <Bar dataKey="Total" fill="hsl(var(--primary))" name="Total de Colaboradores" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </CardContent>
         </Card>
       </div>
    </AppLayout>
  );
}
