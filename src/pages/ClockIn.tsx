import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '@/types/hr';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogIn, LogOut, User, ArrowLeft, Megaphone, Pin, Building2, FileText, Download, LifeBuoy, Search, Copy, Check, MessageSquare } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useCommunication } from '@/hooks/useCommunication';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useDocuments } from '@/hooks/useDocuments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClockInPage() {
  const { employees, validateEmployeeLogin } = useEmployees();
  const { entries: clockEvents } = useTimeEntries();
  const { announcements } = useCommunication();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const { documents } = useDocuments(selectedEmployee?.id);
  
  // Support States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportTab, setSupportTab] = useState('new');
  const [newTicket, setNewTicket] = useState({ name: '', title: '', description: '' });
  const [createdTicketNum, setCreatedTicketNum] = useState<string | null>(null);
  const [trackTicketNum, setTrackTicketNum] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<any | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('company_name, cnpj').maybeSingle();
      if (data) setCompanySettings(data);
    }
    fetchSettings();
  }, []);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsPinDialogOpen(true);
    setError('');
    setPin('');
    setShowDocuments(false);
  };

  const handleClockAction = async (type: 'in' | 'out') => {
    if (!selectedEmployee) return;
    setIsClockingIn(true);

    // Valida a senha diretamente no banco de dados
    const isValid = await validateEmployeeLogin(selectedEmployee.id, pin);

    if (!isValid) {
      setError('Senha incorreta. Tente novamente.');
      setPin('');
      setIsClockingIn(false);
      return;
    }

    // Captura Geolocalização
    let locationData: { latitude?: number; longitude?: number } = {};
    
    toast({
       title: "Obtendo localização...",
       description: "Aguarde enquanto capturamos sua posição GPS.",
       duration: 4000,
    });

    try {
      if (!("geolocation" in navigator)) {
        toast({ title: "Erro", description: "Geolocalização não é suportada neste navegador. Não é possível registrar o ponto.", variant: "destructive" });
        setIsClockingIn(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000, // Aumentado para 10s
        });
      });
      locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      toast({ title: "Sucesso", description: "Localização obtida!" });
    } catch (error) {
      let errorMessage = "Localização não obtida. É necessário ativar o GPS para registrar o ponto.";
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = "Permissão de localização negada. Ative a localização no navegador para continuar.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = "Sinal de GPS indisponível. Verifique se o GPS está ativado.";
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = "Tempo esgotado ao buscar localização. Tente novamente.";
      }
      console.error("Erro ao obter localização:", error);
      toast({ title: "Erro de Localização", description: errorMessage, variant: "destructive" });
      setIsClockingIn(false);
      return;
    }

    // Inserção direta via Supabase para garantir envio dos campos de localização
    const { error } = await supabase.from('time_entries').insert({
      employee_id: selectedEmployee.id,
      timestamp: new Date().toISOString(),
      type,
      ...locationData,
    });

    if (error) {
        toast({ title: "Erro", description: "Falha ao registrar ponto.", variant: "destructive" });
        setIsClockingIn(false);
        return;
    }

    toast({
      title: `Ponto registrado com sucesso!`,
      description: `${selectedEmployee.name} - ${type === 'in' ? 'Entrada' : 'Saída'} às ${format(new Date(), 'HH:mm')}.`,
    });

    setIsClockingIn(false);
    setIsPinDialogOpen(false);
    setSelectedEmployee(null);
    setPin('');
  };

  const handleViewDocuments = async () => {
    if (!selectedEmployee) return;
    
    const isValid = await validateEmployeeLogin(selectedEmployee.id, pin);
    if (!isValid) {
      setError('Senha incorreta.');
      setPin('');
      return;
    }
    
    setShowDocuments(true);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.name || !newTicket.title || !newTicket.description) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    setLoadingSupport(true);
    const ticketNum = Math.random().toString(36).substr(2, 8).toUpperCase();

    const { error } = await supabase.from('tickets').insert({
      ticket_num: ticketNum,
      employee_name: newTicket.name,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: 'medium'
    });

    setLoadingSupport(false);

    if (error) {
      toast({ title: "Erro", description: "Falha ao abrir chamado.", variant: "destructive" });
    } else {
      setCreatedTicketNum(ticketNum);
      setNewTicket({ name: '', title: '', description: '' });
      toast({ title: "Chamado Aberto!", description: "Guarde seu número de protocolo." });
    }
  };

  const handleTrackTicket = async () => {
    if (!trackTicketNum) return;
    setLoadingSupport(true);
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_num', trackTicketNum.toUpperCase())
      .maybeSingle();

    setLoadingSupport(false);

    if (error) {
      toast({ title: "Erro", description: "Erro ao buscar chamado.", variant: "destructive" });
    } else if (!data) {
      toast({ title: "Não encontrado", description: "Nenhum chamado encontrado com este número.", variant: "destructive" });
      setTrackedTicket(null);
    } else {
      setTrackedTicket(data);
    }
  };

  const lastEventForSelected = selectedEmployee
    ? clockEvents.filter(e => e.employee_id === selectedEmployee.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const priorityConfig = {
    low: { label: 'Baixa', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    medium: { label: 'Média', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    high: { label: 'Alta', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              {companySettings?.company_name || 'Ponto Eletrônico'}
            </h1>
            {companySettings?.cnpj ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="h-3 w-3" /> CNPJ: {companySettings.cnpj}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Registro de Entrada e Saída</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsSupportOpen(true)}>
              <LifeBuoy className="mr-2 h-4 w-4" /> Suporte RH
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Área Administrativa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="lg:col-span-2">
             <p className="text-muted-foreground mb-4">Selecione seu perfil para registrar o ponto.</p>
          </div>
          
          {/* Mural de Avisos Simplificado */}
          <Card className="lg:col-span-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Mural de Avisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px] pr-4">
                <div className="space-y-4">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum aviso no momento.</p>
                  ) : (
                    announcements.slice(0, 3).map(announcement => (
                      <div key={announcement.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm flex items-center gap-2">
                            {announcement.priority === 'high' && <Pin className="h-3 w-3 text-red-500" />}
                            {announcement.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(announcement.created_at), 'dd/MM')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {employees.filter(e => e.status !== 'terminated').map(employee => (
            <Card
              key={employee.id}
              onClick={() => handleSelectEmployee(employee)}
              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-center p-4 flex flex-col items-center justify-center"
            >
              <Avatar className="h-16 w-16 mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm text-foreground">{employee.name}</p>
              <p className="text-xs text-muted-foreground">{employee.position}</p>
            </Card>
          ))}
        </div>
      </div>

      {selectedEmployee && (
        <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <DialogTitle className="text-xl">{selectedEmployee.name}</DialogTitle>
              <DialogDescription>
                {lastEventForSelected ? (
                  `Último registro: ${lastEventForSelected.type === 'in' ? 'Entrada' : 'Saída'} em ${format(new Date(lastEventForSelected.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
                ) : (
                  'Nenhum registro encontrado hoje.'
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {!showDocuments ? (
              <>
              <div className="space-y-2">
                <label htmlFor="pin" className="text-center block">Digite sua Senha</label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em]"
                  autoFocus
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(!lastEventForSelected || lastEventForSelected.type === 'out' || lastEventForSelected.type === 'lunch_start') ? (
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 w-full"
                    onClick={() => handleClockAction('in')}
                    disabled={isClockingIn}
                  >
                    {isClockingIn ? 'Registrando...' : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Registrar Entrada
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleClockAction('out')}
                    disabled={isClockingIn}
                  >
                    {isClockingIn ? 'Registrando...' : (
                      <>
                        <LogOut className="mr-2 h-5 w-5" />
                        Registrar Saída
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleViewDocuments}>
                  <FileText className="mr-2 h-4 w-4" />
                  Meus Documentos
                </Button>
              </div>
              </>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-medium text-center text-sm">Documentos Disponíveis</h3>
                  <ScrollArea className="h-[200px] pr-2">
                    {documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento encontrado.</p>
                    ) : (
                      documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 mb-2 rounded-md border bg-secondary/20">
                          <span className="text-sm truncate max-w-[180px]" title={doc.name}>{doc.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => window.open(doc.url, '_blank')}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  <Button variant="ghost" className="w-full" onClick={() => setShowDocuments(false)}>
                    Voltar
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setIsPinDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Suporte */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Central de Atendimento ao Colaborador</DialogTitle>
            <DialogDescription>Abra um chamado para o RH ou consulte o status de uma solicitação.</DialogDescription>
          </DialogHeader>
          
          <Tabs value={supportTab} onValueChange={setSupportTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">Abrir Chamado</TabsTrigger>
              <TabsTrigger value="track">Consultar Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="space-y-4 py-4">
              {!createdTicketNum ? (
                <>
                  <div className="space-y-2">
                    <Label>Seu Nome</Label>
                    <Input placeholder="Digite seu nome completo" value={newTicket.name} onChange={e => setNewTicket({...newTicket, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Assunto</Label>
                    <Input placeholder="Ex: Dúvida sobre holerite" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea placeholder="Descreva sua solicitação..." value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
                  </div>
                  <Button className="w-full" onClick={handleCreateTicket} disabled={loadingSupport}>
                    {loadingSupport ? 'Enviando...' : 'Abrir Chamado'}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Chamado Aberto com Sucesso!</h3>
                    <p className="text-sm text-muted-foreground">Guarde o número abaixo para consultar o status.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary p-3 rounded-md border">
                    <span className="text-xl font-mono font-bold tracking-wider">{createdTicketNum}</span>
                    <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(createdTicketNum); toast({ title: "Copiado!" }); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => { setCreatedTicketNum(null); setSupportTab('track'); }}>
                    Consultar Status
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="track" className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite o número do protocolo (Ex: X7Y2Z9)" 
                  value={trackTicketNum} 
                  onChange={e => setTrackTicketNum(e.target.value)} 
                  className="uppercase"
                />
                <Button onClick={handleTrackTicket} disabled={loadingSupport}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {trackedTicket && (
                <div className="bg-secondary/20 border rounded-lg p-4 space-y-3 animate-in fade-in-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{trackedTicket.title}</h4>
                      <p className="text-xs text-muted-foreground">Aberto em {format(new Date(trackedTicket.created_at), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <Badge variant={trackedTicket.status === 'resolved' ? 'default' : 'secondary'}>
                      {trackedTicket.status === 'open' ? 'Aberto' : 
                       trackedTicket.status === 'in_progress' ? 'Em Andamento' : 
                       trackedTicket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Sua mensagem:</span>
                    <p className="mt-1">{trackedTicket.description}</p>
                  </div>
                  {trackedTicket.hr_notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800 text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Resposta do RH:</span>
                      <p className="mt-1 text-blue-900 dark:text-blue-100">{trackedTicket.hr_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}