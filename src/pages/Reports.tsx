import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOff } from '@/hooks/useTimeOff';
import { supabase } from '@/lib/supabase';
import { Download, User, Calendar, Star, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Reports() {
  const { employees, loading: loadingEmp } = useEmployees();
  const { requests } = useTimeOff();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [headcountData, setHeadcountData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
       // Busca configurações da empresa para o cabeçalho do PDF
       const { data: settings } = await supabase.from('settings').select('*').maybeSingle();
       setCompanySettings(settings);

       // Busca avaliações se um funcionário estiver selecionado
       if (selectedEmployeeId) {
         const { data: reviewsData } = await supabase
            .from('performance_reviews')
            .select('*')
            .eq('employee_id', selectedEmployeeId)
            .order('created_at', { ascending: false });
         setReviews(reviewsData || []);
       }
    }
    fetchData();
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
    }
  }, [employees]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const employeeRequests = requests.filter(r => r.employee_id === selectedEmployeeId);

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
        r.type === 'vacation' ? 'Férias' : 'Ausência',
        format(new Date(r.start_date), 'dd/MM/yyyy'),
        format(new Date(r.end_date), 'dd/MM/yyyy'),
        r.status === 'approved' ? 'Aprovado' : r.status === 'pending' ? 'Pendente' : 'Rejeitado'
    ]);

    if (timeOffData.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Tipo', 'Início', 'Fim', 'Status']],
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

    const reviewData = reviews.map(r => [
        r.period,
        Number(r.overall_score).toFixed(1),
        format(new Date(r.created_at), 'dd/MM/yyyy')
    ]);

    if (reviewData.length > 0) {
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Período', 'Nota Geral', 'Data']],
            body: reviewData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
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
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button disabled={!selectedEmployeeId} onClick={generatePDF}>
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
                                <Tooltip formatter={(value) => `${value} (${((value as number) / employees.length * 100).toFixed(1)}%)`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><BarChart2 className="h-4 w-4" /> Crescimento do Headcount (Últimos 6 Meses)</h3>
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
                </div>
            </CardContent>
         </Card>
       </div>
    </AppLayout>
  );
}