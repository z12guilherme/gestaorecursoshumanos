import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Users, Calendar, Briefcase, FileChartColumn, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOff } from '@/hooks/useTimeOff';
import { useJobPostings } from '@/hooks/useJobPostings';

export default function Reports() {
  const { employees, loading: loadingEmployees } = useEmployees();
  const { requests, loading: loadingRequests } = useTimeOff();
  const { jobPostings, loading: loadingJobs } = useJobPostings();

  const generatePDF = (title: string, subtitle: string, columns: string[], data: any[][], filename: string) => {
    const doc = new jsPDF();

    // Configuração de cores e fontes
    const primaryColor = [30, 41, 59]; // Slate 800
    const secondaryColor = [100, 116, 139]; // Slate 500

    // Cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(subtitle, 14, 28);

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    // Metadados
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 40);
    doc.text('Sistema de Gestão de RH', 14, 45);

    // Tabela
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 50,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' }, // Slate 950
      alternateRowStyles: { fillColor: [241, 245, 249] }, // Slate 100
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Rodapé com paginação
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    doc.save(filename);
  };

  const handleEmployeeReport = () => {
    const columns = ["Nome", "Cargo", "Departamento", "Status", "Admissão"];
    const rows = employees.map((emp) => [
      emp.name,
      emp.role || emp.position, // Fallback para compatibilidade com tipos diferentes
      emp.department,
      emp.status === 'active' ? 'Ativo' : emp.status === 'vacation' ? 'Férias' : emp.status === 'terminated' ? 'Desligado' : 'Afastado',
      (emp.admission_date || emp.hireDate) ? format(new Date(emp.admission_date || emp.hireDate), 'dd/MM/yyyy') : '-'
    ]);

    generatePDF(
      "Relatório de Colaboradores",
      "Listagem completa do quadro de funcionários",
      columns,
      rows,
      "relatorio_colaboradores.pdf"
    );
  };

  const handleTimeOffReport = () => {
    const columns = ["Colaborador", "Tipo", "Início", "Fim", "Status"];
    const rows = requests.map((req) => [
      req.employeeName,
      req.type === 'vacation' ? 'Férias' : req.type === 'sick' ? 'Atestado' : 'Outro',
      format(new Date(req.startDate), 'dd/MM/yyyy'),
      format(new Date(req.endDate), 'dd/MM/yyyy'),
      req.status === 'approved' ? 'Aprovado' : req.status === 'pending' ? 'Pendente' : 'Rejeitado'
    ]);

    generatePDF(
      "Relatório de Férias e Ausências",
      "Histórico de solicitações de afastamento",
      columns,
      rows,
      "relatorio_ferias.pdf"
    );
  };

  const handleRecruitmentReport = () => {
    const columns = ["Vaga", "Departamento", "Tipo", "Local", "Candidatos", "Status"];
    const rows = jobPostings.map((job) => [
      job.title,
      job.department,
      job.type,
      job.location,
      job.applicants?.toString() || job.applicants_count?.toString() || "0",
      job.status === 'open' ? 'Aberta' : 'Fechada'
    ]);

    generatePDF(
      "Relatório de Recrutamento",
      "Visão geral das vagas e processos seletivos",
      columns,
      rows,
      "relatorio_vagas.pdf"
    );
  };

  const isLoading = loadingEmployees || loadingRequests || loadingJobs;

  const reportTypes = [
    {
      title: "Colaboradores",
      description: "Lista completa de funcionários, cargos e status atual.",
      icon: Users,
      action: handleEmployeeReport,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      disabled: loadingEmployees
    },
    {
      title: "Férias e Ponto",
      description: "Histórico de solicitações, férias agendadas e ausências.",
      icon: Calendar,
      action: handleTimeOffReport,
      color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
      disabled: loadingRequests
    },
    {
      title: "Recrutamento",
      description: "Status das vagas abertas e volume de candidatos.",
      icon: Briefcase,
      action: handleRecruitmentReport,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
      disabled: loadingJobs
    }
  ];

  return (
    <AppLayout title="Relatórios" subtitle="Gere documentos PDF detalhados para análise">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription className="mt-2">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Espaço para filtros futuros (ex: DatePicker) */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full gap-2" 
                onClick={report.action} 
                disabled={report.disabled}
              >
                {report.disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {report.disabled ? 'Carregando...' : 'Gerar PDF'}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Card Promocional / Futuro */}
        <Card className="flex flex-col border-dashed border-2 bg-muted/50">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted text-muted-foreground">
              <FileChartColumn className="h-6 w-6" />
            </div>
            <CardTitle className="text-muted-foreground">Relatório Personalizado</CardTitle>
            <CardDescription>Em breve você poderá criar relatórios customizados com métricas específicas.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button variant="ghost" disabled className="w-full">Em breve</Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
