import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Coffee, LogIn, LogOut, MapPin, MessageSquare, Download, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterEmployeeId, setFilterEmployeeId] = useState<string | null>(null);
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      setLoadingEntries(true);
      const { data, error } = await supabase
        .from('time_entries')
        .select('id, timestamp, type, employee_id, latitude, longitude, notes, employees(name)')
        .gte('timestamp', `${selectedDate}T00:00:00.000Z`)
        .lte('timestamp', `${selectedDate}T23:59:59.999Z`)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching time entries:', error);
        setEntries([]);
      } else {
        setEntries(data as TimeEntry[]);
      }
      setLoadingEntries(false);
    }

    fetchEntries();
  }, [selectedDate]);

  const calculateDailyHours = (empEntries: TimeEntry[]) => {
    const sorted = [...empEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let totalMs = 0;
    let lastInTime: number | null = null;

    sorted.forEach(entry => {
      const time = new Date(entry.timestamp).getTime();
      if (entry.type === 'in' || entry.type === 'lunch_end') {
        if (lastInTime === null) lastInTime = time;
      } else if (entry.type === 'out' || entry.type === 'lunch_start') {
        if (lastInTime !== null) {
          totalMs += time - lastInTime;
          lastInTime = null;
        }
      }
    });

    const totalMinutes = Math.floor(totalMs / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (h === 0 && m === 0) return '-';
    return `${h}h ${m}m`;
  };

  useEffect(() => {
      if (employees.length > 0) {
          const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'Ativo');

          const statusList = activeEmployees.map(emp => ({
              id: emp.id,
              name: emp.name,
              department: emp.department || 'N/A',
              hasRegistered: entries.some(e => e.employee_id === emp.id),
              workedHours: calculateDailyHours(entries.filter(e => e.employee_id === emp.id))
          }));
          setEmployeeStatus(statusList);
      }
  }, [employees, entries]);

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

  const handleExport = () => {
    const dataToExport = employeeStatus.map(emp => ({
        'Funcionário': emp.name,
        'Departamento': emp.department,
        'Status': emp.hasRegistered ? 'Presente' : 'Ausente',
        'Horas Trabalhadas': emp.workedHours,
        'Data': format(new Date(selectedDate), 'dd/MM/yyyy')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ponto Diário");
    XLSX.writeFile(wb, `Espelho_Ponto_${selectedDate}.xlsx`);
  };

  const handleDownloadCodeOfEthics = () => {
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
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {loading ? (
                            <p>Carregando...</p>
                        ) : (
                            employeeStatus.map(emp => (
                                <div 
                                    key={emp.id} 
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
                            ))
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
                <div className="text-center py-10">Carregando registros...</div>
              ) : entries.length > 0 ? (
                <ul className="space-y-3">
                  {entries
                    .filter(e => !filterEmployeeId || e.employee_id === filterEmployeeId)
                    .map((entry) => (
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