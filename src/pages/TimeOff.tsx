import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Check, X, Clock, Plus, Palmtree, Thermometer, User, KeyRound, Search, Undo2, BarChart3, Paperclip, Download } from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useTimeOff } from '@/hooks/useTimeOff';
import { useEmployees } from '@/hooks/useEmployees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const typeConfig = {
  vacation: { label: 'Férias', icon: Palmtree, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  sick: { label: 'Atestado', icon: Thermometer, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  personal: { label: 'Pessoal', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  maternity: { label: 'Licença Maternidade', icon: User, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  paternity: { label: 'Licença Paternidade', icon: User, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

const statusConfig = {
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function TimeOff() {
  const { requests, loading: loadingRequests, updateRequestStatus, addRequest } = useTimeOff();
  const { employees, loading: loadingEmployees, updateEmployee } = useEmployees();

  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const { toast } = useToast();
  const [newRequestData, setNewRequestData] = useState<{
    employee_id: string;
    type: string;
    date_range: DateRange | undefined;
    reason: string;
  }>({
    employee_id: '',
    type: 'vacation',
    date_range: {
      from: undefined,
      to: undefined,
    },
    reason: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleApprove = async (id: string) => {
    const request = requests.find(r => r.id === id);
    await updateRequestStatus(id, 'approved');

    if (request) {
      // Atualiza o status do funcionário para 'vacation' ou 'leave'
      const newStatus = request.type === 'vacation' ? 'vacation' : 'leave';
      await updateEmployee(request.employee_id, { status: newStatus });
    }

    toast({
      title: 'Solicitação aprovada',
      description: 'A solicitação foi aprovada com sucesso.',
    });
  };

  const handleReject = async (id: string) => {
    await updateRequestStatus(id, 'rejected');
    toast({
      title: 'Solicitação rejeitada',
      description: 'A solicitação foi rejeitada.',
      variant: 'destructive',
    });
  };

  const handlePinChange = async (employeeId: string, newPin: string) => {
    // Apenas números
    if (newPin && !/^\d*$/.test(newPin)) return;

    await updateEmployee(employeeId, { password: newPin });
    toast({ title: "Senha atualizada", description: "Senha de ponto atualizada." });
  };

  const handleEndVacation = async (employeeId: string) => {
    await updateEmployee(employeeId, { status: 'active' });
    toast({
      title: "Férias encerradas",
      description: "O status do colaborador foi atualizado para 'Ativo'.",
    });
  };

  const handleSaveNewRequest = async () => {
    if (!newRequestData.employee_id || !newRequestData.date_range?.from) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o colaborador e o período.",
        variant: "destructive",
      });
      return;
    }

    let attachmentUrl = null;
    if (attachment) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('time-off-attachments')
        .upload(fileName, attachment);

      if (uploadError) {
        console.error(uploadError);
        toast({ title: "Erro no upload", description: "Falha ao enviar o anexo.", variant: "destructive" });
        return;
      }

      const { data } = supabase.storage.from('time-off-attachments').getPublicUrl(fileName);
      attachmentUrl = data.publicUrl;
    }

    const { error } = await addRequest({
      employee_id: newRequestData.employee_id,
      type: newRequestData.type,
      start_date: format(newRequestData.date_range.from, 'yyyy-MM-dd'),
      end_date: format(newRequestData.date_range.to || newRequestData.date_range.from, 'yyyy-MM-dd'),
      reason: newRequestData.reason,
      attachment_url: attachmentUrl
    });

    if (error) {
      toast({ title: "Erro", description: "Falha ao criar solicitação.", variant: "destructive" });
      return;
    }

    toast({ title: "Solicitação criada", description: "A nova solicitação foi registrada." });
    setIsRequestDialogOpen(false);
    setNewRequestData({
      employee_id: '',
      type: 'vacation',
      date_range: undefined,
      reason: ''
    });
    setAttachment(null);
  };

  // Mapeia os campos do banco para o que a UI espera
  const mappedRequests = requests.map(r => ({
    ...r,
    employeeName: r.employee_name || 'Desconhecido',
    startDate: r.start_date,
    endDate: r.end_date
  }));

  const pendingRequests = mappedRequests.filter(r => r.status === 'pending');
  const processedRequests = mappedRequests.filter(r => r.status !== 'pending');

  const employeesOnVacation = employees.filter(e => e.status === 'vacation' || e.status === 'Férias');

  const getRemainingInDept = (department: string) => {
    return employees.filter(e => e.department === department && (e.status === 'active' || e.status === 'Ativo')).length;
  };

  const filteredRequests = departmentFilter === 'all'
    ? mappedRequests
    : mappedRequests.filter(r => r.employee_department === departmentFilter);

  // Cálculo de estatísticas por departamento para o gráfico
  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);
  const departmentStats = uniqueDepartments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept && e.status !== 'terminated');
    const total = deptEmployees.length;
    const absent = deptEmployees.filter(e => ['vacation', 'leave', 'Férias', 'Afastado'].includes(e.status)).length;
    const available = total - absent;
    
    return {
      name: dept,
      total,
      available,
      absent,
    };
  });

  return (
    <AppLayout title="Férias & Ausências" subtitle="Gerencie solicitações de férias e ausências">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Palmtree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employeesOnVacation.length}</p>
                <p className="text-xs text-muted-foreground">Em férias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Atestados hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Absence Report List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Capacidade e Ausências por Setor
              </div>
              <div className="ml-auto w-full max-w-[200px]">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por setor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Setores</SelectItem>
                    {[...new Set(employees.map(e => e.department))].map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.filter(r => r.status === 'approved').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma ausência programada para este setor.
                </p>
              ) : (
                filteredRequests
                  .filter(r => r.status === 'approved')
                  .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                  .map((request) => {
                    const typeLabel = typeConfig[request.type as keyof typeof typeConfig]?.label.toLowerCase() || 'ausência';
                    // Formata data manualmente para evitar problemas de fuso horário (YYYY-MM-DD -> DD/MM/YYYY)
                    const startDate = request.start_date.split('-').reverse().join('/');
                    const endDate = request.end_date.split('-').reverse().join('/');
                    
                    return (
                      <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {request.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{request.employeeName}</span> está de {typeLabel} do dia <strong>{startDate}</strong> até <strong>{endDate}</strong>.
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Férias Ativas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palmtree className="h-5 w-5 text-blue-500" />
              Relatório de Férias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employeesOnVacation.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum colaborador está de férias no momento.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employeesOnVacation.map((employee) => {
                  const activeRequest = filteredRequests.find(r => r.employee_id === employee.id && r.status === 'approved' && r.type === 'vacation');
                  const returnDate = activeRequest ? addDays(new Date(activeRequest.end_date + 'T00:00:00'), 1) : null;
                  return (
                    <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {returnDate && (
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Retorna em</p>
                            <p className="font-bold text-sm text-foreground">{format(returnDate, 'dd/MM/yy')}</p>
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEndVacation(employee.id)}>
                          <Undo2 className="h-4 w-4 mr-1" />
                          Encerrar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Solicitações Pendentes</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setIsPinDialogOpen(true)}>
                <KeyRound className="h-4 w-4" />
                Senhas de Ponto
              </Button>
              <Button className="gap-2" onClick={() => setIsRequestDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma solicitação pendente
              </p>
            ) : (
              pendingRequests.map((request) => {
                const type = typeConfig[request.type as keyof typeof typeConfig];
                const days = differenceInDays(new Date(request.endDate + 'T00:00:00'), new Date(request.startDate + 'T00:00:00')) + 1;
                
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{request.employeeName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`flex items-center gap-1 ${type.color}`}>
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm">{type.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{days} dia(s)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(request.startDate + 'T00:00:00'), "dd 'de' MMM", { locale: ptBR })} - {format(new Date(request.endDate + 'T00:00:00'), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                        {(request as any).attachment_url && (
                          <a href={(request as any).attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            <Paperclip className="h-3 w-3" /> Ver Anexo
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedRequests.map((request) => {
              const type = typeConfig[request.type as keyof typeof typeConfig];
              const status = statusConfig[request.status as keyof typeof statusConfig];
              
              return (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{request.employeeName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{type.label}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(request.startDate + 'T00:00:00'), "dd/MM", { locale: ptBR })} - {format(new Date(request.endDate + 'T00:00:00'), "dd/MM", { locale: ptBR })}
                        </span>
                        {(request as any).attachment_url && (
                          <a href={(request as any).attachment_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800" title="Ver Anexo">
                            <Paperclip className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Nova Solicitação */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Solicitação</DialogTitle>
            <DialogDescription>
              Registre uma nova ausência ou período de férias para um colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Colaborador</Label>
              <Select
                value={newRequestData.employee_id}
                onValueChange={(value) => setNewRequestData(prev => ({ ...prev, employee_id: value }))}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newRequestData.type}
                  onValueChange={(value) => setNewRequestData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="period"
                      variant={"outline"}
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRequestData.date_range?.from ? (
                        newRequestData.date_range.to ? (
                          <>
                            {format(newRequestData.date_range.from, "dd/MM/yy")} - {format(newRequestData.date_range.to, "dd/MM/yy")}
                          </>
                        ) : (
                          format(newRequestData.date_range.from, "dd/MM/yy")
                        )
                      ) : (
                        <span>Selecione as datas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={newRequestData.date_range} onSelect={(range) => setNewRequestData(prev => ({ ...prev, date_range: range }))} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo (Opcional)</Label>
              <Textarea id="reason" placeholder="Descreva o motivo da solicitação..." value={newRequestData.reason} onChange={(e) => setNewRequestData(prev => ({ ...prev, reason: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment">Anexo (Atestado/Comprovante)</Label>
              <Input id="attachment" type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNewRequest}>Salvar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Senhas de Ponto</DialogTitle>
            <DialogDescription>Defina as senhas (PIN) numéricas de 4 dígitos para os colaboradores.</DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar colaborador..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
             </div>

             <div className="flex-1 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Senha (PIN)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees
                      .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              {employee.name}
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          <Input 
                              className="w-24 font-mono text-center" 
                              maxLength={4} 
                              placeholder="----"
                              value={employee.password || ''}
                              onChange={(e) => handlePinChange(employee.id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
          </div>
          <DialogFooter>
              <Button onClick={() => setIsPinDialogOpen(false)}>Concluído</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
