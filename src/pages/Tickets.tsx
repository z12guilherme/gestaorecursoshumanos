import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { MessageSquare, AlertCircle, CheckCircle, Clock, X, Check, Palmtree, Thermometer, User, Download } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTimeOff } from '../hooks/useTimeOff';
import { useEmployees } from '../hooks/useEmployees';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ticket {
  id: string;
  ticket_num: string;
  employee_name: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

const typeConfig = {
  vacation: { label: 'Férias', icon: Palmtree, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  sick: { label: 'Atestado', icon: Thermometer, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  personal: { label: 'Pessoal', icon: User, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  maternity: { label: 'Licença Maternidade', icon: User, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  paternity: { label: 'Licença Paternidade', icon: User, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { requests, updateRequestStatus } = useTimeOff();
  const { updateEmployee } = useEmployees();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar chamados',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      toast({
        title: 'Status atualizado',
        description: `O chamado foi movido para ${newStatus === 'open' ? 'Aberto' : newStatus === 'in_progress' ? 'Em Andamento' : 'Concluído'}.`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Aberto</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Em Andamento</Badge>;
      case 'closed':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const pendingRequests = requests
    .map(r => ({
      ...r,
      employeeName: r.employee_name || 'Desconhecido',
      startDate: r.start_date,
      endDate: r.end_date
    }))
    .filter(r => r.status === 'pending');

  const handleApproveTimeOff = async (id: string) => {
    const request = requests.find(r => r.id === id);
    await updateRequestStatus(id, 'approved');

    if (request) {
      const newStatus = request.type === 'vacation' ? 'vacation' : 'leave';
      await updateEmployee(request.employee_id, { status: newStatus });
    }

    toast({
      title: 'Solicitação aprovada',
      description: 'A solicitação foi aprovada com sucesso.',
    });
  };

  const handleRejectTimeOff = async (id: string) => {
    await updateRequestStatus(id, 'rejected');
    toast({
      title: 'Solicitação rejeitada',
      description: 'A solicitação foi rejeitada.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Central de Chamados & RH</h1>
        <Button onClick={fetchTickets} variant="outline">
          Atualizar Lista
        </Button>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Chamados de Suporte</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox RH (Aprovações)
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tickets.filter((t) => t.status === 'open').length}
                </div>
                <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tickets.filter((t) => t.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">Sendo resolvidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tickets.filter((t) => t.status === 'closed').length}
                </div>
                <p className="text-xs text-muted-foreground">Finalizados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todos os Chamados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ticket</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando chamados...
                      </TableCell>
                    </TableRow>
                  ) : tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum chamado encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono font-medium">
                          {ticket.ticket_num}
                        </TableCell>
                        <TableCell>{ticket.employee_name}</TableCell>
                        <TableCell>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {ticket.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(ticket.priority)}
                            <span className="capitalize">
                              {ticket.priority === 'medium' ? 'Média' : ticket.priority === 'high' ? 'Alta' : 'Baixa'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            defaultValue={ticket.status}
                            onValueChange={(value) => handleStatusChange(ticket.id, value)}
                          >
                            <SelectTrigger className="w-[140px] ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Aberto</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="closed">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes (Férias e Afastamentos)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação pendente no momento.
                </p>
              ) : (
                pendingRequests.map((request) => {
                  const type = typeConfig[request.type as keyof typeof typeConfig] || typeConfig.personal;
                  const days = differenceInDays(new Date(request.endDate + 'T00:00:00'), new Date(request.startDate + 'T00:00:00')) + 1;
                  
                  return (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                              <Download className="h-3 w-3" /> Baixar anexo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRejectTimeOff(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApproveTimeOff(request.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
