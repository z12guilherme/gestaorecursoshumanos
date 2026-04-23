import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Coffee, LogIn, LogOut, MapPin, MessageSquare, Download, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from '@/hooks/useDebounce';
import { timeEntryService } from '@/services/timeEntryService';

interface TimeEntry {
  id: string;
  timestamp: string;
  type: 'in' | 'out' | 'lunch_start' | 'lunch_end';
  employee_id: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  employees: { name: string; } | null;
}

interface EmployeeStatus {
  id: string;
  name: string;
  department: string;
  hasRegistered: boolean;
  workedHours: string;
}

export default function Timesheet() {
  const { employees, loading: loadingEmployees } = useEmployees();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [dailyAllEntries, setDailyAllEntries] = useState<TimeEntry[]>([]);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | null>(null);
  const [mapLocation, setMapLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;
  const parentRef = useRef<HTMLDivElement>(null);
  const debouncedDate = useDebounce(selectedDate, 500);

  const rowVirtualizer = useVirtualizer({
    count: employeeStatus.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76, // Altura estimada do item + gap
    overscan: 5,
  });

  useEffect(() => {
    async function fetchEntries() {
      setLoadingEntries(true);
      try {
        const { data, count } = await timeEntryService.getEntries(page, pageSize, debouncedDate, filterEmployeeId);
        setEntries(data as any[]);
        setTotalCount(count);
      } catch (error) {
        console.error('Erro ao buscar registros paginados:', error);
      } finally {
        setLoadingEntries(false);
      }
    }

    fetchEntries();
  }, [debouncedDate, page, filterEmployeeId]);

  // Efeito secundário (apenas quando a data muda) para alimentar a coluna de status
  useEffect(() => {
    async function fetchDailySummary() {
      try {
        const data = await timeEntryService.getDailyEntriesForSummary(debouncedDate);
        setDailyAllEntries(data as any[]);
      } catch (error) {
        console.error('Erro ao buscar resumo diário:', error);
      }
    }
    fetchDailySummary();
  }, [debouncedDate]);

  // Reseta a página para 1 sempre que trocar a data ou o filtro de funcionário
  useEffect(() => {
    setPage(1);
  }, [debouncedDate, filterEmployeeId]);

  useEffect(() => {
    if (employees.length > 0) {
      const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'Ativo');

      const statusList = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        department: emp.department || 'N/A',
        hasRegistered: dailyAllEntries.some(e => e.employee_id === emp.id),
        workedHours: timeEntryService.calculateDailyHours(dailyAllEntries.filter(e => e.employee_id === emp.id) as any)
      }));
      setEmployeeStatus(statusList);
    }
  }, [employees, dailyAllEntries]);

  const loading = loadingEmployees || loadingEntries;

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><LogIn className="w-3 h-3 mr-1" /> Entrada</Badge>;
      case 'out':
        return <Badge variant="destructive"><LogOut className="w-3 h-3 mr-1" /> Saída</Badge>;
      case 'lunch_start':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Coffee className="w-3 h-3 mr-1" /> Almoço (Saída)</Badge>;
      case 'lunch_end':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Coffee className="w-3 h-3 mr-1" /> Almoço (Volta)</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleExport = async () => {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ponto Diário');

    worksheet.columns = [
      { header: 'Funcionário', key: 'Funcionário', width: 30 },
      { header: 'Departamento', key: 'Departamento', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Horas Trabalhadas', key: 'Horas Trabalhadas', width: 20 },
      { header: 'Data', key: 'Data', width: 15 }
    ];

    const dataToExport = employeeStatus.map(emp => ({
      'Funcionário': emp.name,
      'Departamento': emp.department,
      'Status': emp.hasRegistered ? 'Presente' : 'Ausente',
      'Horas Trabalhadas': emp.workedHours,
      'Data': format(new Date(selectedDate), 'dd/MM/yyyy')
    }));

    worksheet.addRows(dataToExport);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Espelho_Ponto_${selectedDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadCodeOfEthics = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CÓDIGO DE ÉTICA E CONDUTA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento estabelece os princípios éticos da nossa empresa.", 20, 40);
    doc.text("1. Respeito mútuo e diversidade.", 20, 50);
    doc.text("2. Integridade e transparência nas ações.", 20, 60);
    doc.text("3. Compromisso com a qualidade e segurança.", 20, 70);
    doc.text("4. Confidencialidade das informações.", 20, 80);

    doc.save("Codigo_de_Etica.pdf");
  };

  return (
    <AppLayout title="Controle de Ponto" subtitle="Registros de entrada e saída dos colaboradores">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={handleDownloadCodeOfEthics} className="gap-2">
          <FileText className="h-4 w-4" />
          Baixar Código de Ética
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Status Diário */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status do Ponto - {format(new Date(selectedDate + 'T12:00:00'), 'dd/MM/yyyy')}</CardTitle>
              <CardDescription>Verifique quem já registrou o ponto hoje.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4"
              />
              <div ref={parentRef} className="max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                  <p>Carregando...</p>
                ) : (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const emp = employeeStatus[virtualRow.index];
                      return (
                        <div
                          key={emp.id}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          className="pb-3"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors hover:bg-accent",
                              filterEmployeeId === emp.id ? "bg-accent border-primary" : ""
                            )}
                            onClick={() => setFilterEmployeeId(prev => prev === emp.id ? null : emp.id)}
                          >
                            <div>
                              <p className="font-medium text-sm">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.department}</p>
                              {emp.hasRegistered && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {emp.workedHours}
                                </p>
                              )}
                            </div>
                            <Badge variant={emp.hasRegistered ? 'default' : 'destructive'}>
                              {emp.hasRegistered ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {emp.hasRegistered ? 'Registrou' : 'Não Registrou'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {employeeStatus.length === 0 && !loading && <p className="text-sm text-muted-foreground text-center py-4">Nenhum funcionário ativo encontrado.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Registros */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registros do Dia {filterEmployeeId && "(Filtrado)"}</CardTitle>
                <CardDescription>
                  {filterEmployeeId ? "Exibindo registros do funcionário selecionado." : "Lista de todas as marcações de ponto para a data selecionada."}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><p className="text-muted-foreground">Carregando registros...</p></div>
              ) : entries.length > 0 ? (
                <>
                  <ul className="space-y-3">
                    {entries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                        <div>
                          <p className="font-semibold">{entry.employees?.name || 'Funcionário não encontrado'}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), 'HH:mm:ss')}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {entry.notes && (
                              <div className="flex items-center text-xs text-muted-foreground" title={entry.notes}>
                                <MessageSquare className="w-3 h-3 mr-1" /> {entry.notes}
                              </div>
                            )}
                            {entry.latitude !== undefined && entry.latitude !== null && entry.longitude !== undefined && entry.longitude !== null && (
                              <div className="flex items-center text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setMapLocation({ lat: entry.latitude!, lng: entry.longitude! })}>
                                <MapPin className="w-3 h-3 mr-1" /> Localização
                              </div>
                            )}
                          </div>
                        </div>
                        {getBadgeForType(entry.type)}
                      </li>
                    ))}
                  </ul>

                  {/* Controles de Paginação */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {entries.length} de {totalCount} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Página {page} de {Math.ceil(totalCount / pageSize) || 1}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p < Math.ceil(totalCount / pageSize) ? p + 1 : p)}
                        disabled={page >= Math.ceil(totalCount / pageSize) || totalCount === 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhum registro de ponto para esta data.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!mapLocation} onOpenChange={() => setMapLocation(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Localização do Registro</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative border border-border">
            {mapLocation && (
              <iframe
                width="100%"
                height="100%"
                src={`https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`}
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps?q=${mapLocation?.lat},${mapLocation?.lng}`, '_blank')}>
              Abrir no Google Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}