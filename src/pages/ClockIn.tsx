import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { LogIn, LogOut, ArrowLeft, Megaphone, Pin, FileText, Download, LifeBuoy, Search, Copy, Check, MessageSquare, KeyRound, Clock, Calendar } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCommunication } from '@/hooks/useCommunication';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useDocuments } from '@/hooks/useDocuments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PayslipButton } from '@/components/PayslipButton';
import { PayslipViewerModal } from '@/components/PayslipViewerModal';

export default function ClockInPage() {
  const { employees } = useEmployees();
  const { announcements } = useCommunication();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companySettings, setCompanySettings] = useState<any>({
    company_name: 'Hospital Santa Fé',
    cnpj: '04.232.442/0001-14'
  });
  
  // Documents State
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [identifiedEmployee, setIdentifiedEmployee] = useState<Employee | null>(null);
  const [isPayslipViewerOpen, setIsPayslipViewerOpen] = useState(false);
  const { documents } = useDocuments(identifiedEmployee?.id);
  
  // Support States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportTab, setSupportTab] = useState('new');
  const [newTicket, setNewTicket] = useState({ name: '', title: '', description: '' });
  const [createdTicketNum, setCreatedTicketNum] = useState<string | null>(null);
  const [trackTicketNum, setTrackTicketNum] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<any | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('company_name, cnpj').maybeSingle();
      if (data) setCompanySettings((prev: any) => ({ ...prev, ...data }));
    }
    fetchSettings();
    return () => clearInterval(timer);
  }, []);

  const getEmployeeByPin = async (inputPin: string) => {
    // 1. Tenta encontrar na lista carregada (se disponível)
    let employee = employees.find(e => e.password === inputPin);
    if (employee) return employee;

    try {
      // 2. Tenta via RPC (Bypass de RLS seguro para Anon)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_employee_by_pin', { pin_input: inputPin });
      if (!rpcError && rpcData && rpcData.length > 0) return rpcData[0];

      // 3. Tenta via Query Direta (Fallback)
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('password', inputPin)
        .maybeSingle();
      
      if (data) return data;
    } catch (err) {
      console.error("Erro ao buscar funcionário:", err);
    }
    
    toast({
      title: "Acesso Negado",
      description: "Senha não encontrada. Verifique suas credenciais.",
      variant: "destructive"
    });
    return null;
  };

  const handleClockAction = async (type: 'in' | 'out') => {
    if (!pin) return;
    setLoading(true);

    const employee = await getEmployeeByPin(pin);
    if (!employee) {
        setLoading(false);
        setPin("");
        return;
    }

    // Validação de sequência de ponto
    const { data: lastEntry } = await supabase
      .from('time_entries')
      .select('type')
      .eq('employee_id', employee.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Se não há registro anterior, a primeira ação deve ser 'in'
    if (!lastEntry && type !== 'in') {
      toast({
        title: "Ação Inválida",
        description: "Seu primeiro registro do dia deve ser uma entrada.",
        variant: "destructive"
      });
      setLoading(false);
      setPin('');
      return;
    }

    if (lastEntry) {
      const isLastIn = lastEntry.type === 'in' || lastEntry.type === 'lunch_end';
      const isLastOut = lastEntry.type === 'out' || lastEntry.type === 'lunch_start';

      if ((type === 'in' && isLastIn) || (type === 'out' && isLastOut)) {
        toast({
          title: "Ação Inválida",
          description: `Você já possui um registro de ${isLastIn ? 'entrada' : 'saída'}. A próxima ação deve ser de ${isLastIn ? 'saída' : 'entrada'}.`,
          variant: "destructive"
        });
        setLoading(false);
        setPin('');
        return;
      }
    }

    // Captura Geolocalização
    let locationData: { latitude?: number; longitude?: number } = {};
    
    toast({
       title: "Obtendo localização...",
       description: "Aguarde enquanto capturamos sua posição GPS.",
       duration: 2000,
    });

    try {
      if (!("geolocation" in navigator)) {
        toast({ title: "Erro", description: "Geolocalização não é suportada neste navegador.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error: any) {
      let errorMessage = "Localização não obtida. É necessário ativar o GPS.";
      if (error.code === 1) errorMessage = "Permissão de localização negada.";
      else if (error.code === 2) errorMessage = "Sinal de GPS indisponível.";
      else if (error.code === 3) errorMessage = "Tempo esgotado ao buscar localização.";
      
      console.error("Erro ao obter localização:", error);
      toast({ title: "Erro de Localização", description: errorMessage, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('time_entries').insert({
      employee_id: employee.id,
      timestamp: new Date().toISOString(),
      type,
      ...locationData,
    });

    if (error) {
        toast({ title: "Erro", description: "Falha ao registrar ponto.", variant: "destructive" });
    } else {
        toast({
            title: `Ponto Registrado!`,
            description: `${employee.name} - ${type === 'in' ? 'Entrada' : 'Saída'} às ${format(new Date(), 'HH:mm')}.`,
            className: "bg-green-600 text-white border-none"
        });
    }

    setLoading(false);
    setPin('');
  };

  const handleAccessDocuments = async () => {
      if (!pin) return;
      setLoading(true);
      const employee = await getEmployeeByPin(pin);
      
      if (employee) {
        setIdentifiedEmployee(employee);
        setShowDocumentsDialog(true);
        setPin('');
      }
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
       {/* Top Bar */}
       <header className="bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm z-10">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                SF
             </div>
             <div>
                <h1 className="font-bold text-slate-800 leading-tight">{companySettings?.company_name}</h1>
                <p className="text-xs text-slate-500">Portal do Colaborador</p>
             </div>
          </div>
          {/* Time & Date (Desktop) */}
          <div className="hidden md:flex flex-col items-end">
             <span className="text-xl font-bold text-slate-800 font-mono">
               {format(currentTime, 'HH:mm')}
             </span>
             <span className="text-xs text-slate-500 capitalize">
               {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
             </span>
          </div>
       </header>

       <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Actions (Terminal) - Spans 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">
             {/* Welcome / Clock Card */}
             <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Clock className="w-64 h-64" />
                </div>
                <CardContent className="p-8 relative z-10">
                   <p className="text-blue-100 font-medium mb-1">Bem-vindo ao seu portal</p>
                   <h2 className="text-3xl md:text-4xl font-bold mb-6">O que você deseja fazer hoje?</h2>
                   
                   <div className="flex flex-wrap gap-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 flex items-center gap-3 border border-white/10">
                         <Calendar className="w-8 h-8 text-blue-100" />
                         <div>
                            <p className="text-xs text-blue-200">Data de Hoje</p>
                            <p className="font-bold">{format(currentTime, 'dd/MM/yyyy')}</p>
                         </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 flex items-center gap-3 border border-white/10">
                         <Clock className="w-8 h-8 text-blue-100" />
                         <div>
                            <p className="text-xs text-blue-200">Hora Atual</p>
                            <p className="font-bold font-mono">{format(currentTime, 'HH:mm:ss')}</p>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* PIN & Actions */}
             <Card className="border-none shadow-md flex-1">
                <CardHeader>
                   <CardTitle>Acesso Rápido</CardTitle>
                   <CardDescription>Digite seu PIN para liberar as ações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="max-w-sm mx-auto">
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-slate-400" />
                         </div>
                         <Input
                            type="password"
                            placeholder="Digite seu PIN (4 dígitos)"
                            className="pl-10 text-center text-2xl tracking-widest h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="h-24 flex flex-col gap-2 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 text-emerald-700 hover:text-emerald-800 shadow-sm"
                        variant="outline"
                        onClick={() => handleClockAction('in')}
                      >
                         <LogIn className="w-8 h-8" />
                         <span className="font-bold text-lg">Registrar Entrada</span>
                      </Button>
                      <Button 
                        className="h-24 flex flex-col gap-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-100 text-amber-700 hover:text-amber-800 shadow-sm"
                        variant="outline"
                        onClick={() => handleClockAction('out')}
                      >
                         <LogOut className="w-8 h-8" />
                         <span className="font-bold text-lg">Registrar Saída</span>
                      </Button>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="h-16 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                        variant="ghost"
                        onClick={handleAccessDocuments}
                      >
                         <FileText className="w-5 h-5" />
                         Meus Documentos
                      </Button>
                      <Button 
                        className="h-16 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                        variant="ghost"
                        onClick={() => setIsSupportOpen(true)}
                      >
                         <LifeBuoy className="w-5 h-5" />
                         Suporte / Ajuda
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Right Column: Info & Announcements - Spans 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* Announcements */}
             <Card className="flex-1 border-none shadow-md flex flex-col">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                   <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                         <Megaphone className="w-5 h-5 text-blue-600" />
                         Mural de Avisos
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                         {announcements.length} Novos
                      </Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                   <ScrollArea className="h-[500px] p-6">
                      <div className="space-y-4">
                         {/* Fixed Notice */}
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                               <Pin className="w-4 h-4 text-blue-400 fill-blue-400" />
                            </div>
                            <h4 className="font-bold text-blue-900 mb-2 pr-6">Como acessar seu Holerite?</h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                               Digite sua senha no painel ao lado e clique em "Meus Documentos". 
                               Você poderá visualizar, assinar e baixar seu contra cheque do mês atual instantaneamente (Verifique com o RH se foram feitas as atualizações mensais).
                            </p>
                         </div>

                         {announcements.map((announcement) => (
                            <div key={announcement.id} className="group bg-white border border-slate-100 hover:border-blue-200 rounded-xl p-4 transition-all shadow-sm hover:shadow-md">
                               <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                     {announcement.title}
                                  </h4>
                                  {announcement.priority === 'high' && (
                                     <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2" title="Alta Prioridade" />
                                  )}
                               </div>
                               <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                  {announcement.content}
                               </p>
                               <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>{format(new Date(announcement.created_at), "d 'de' MMM", { locale: ptBR })}</span>
                                  <span>{announcement.author || 'RH'}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </ScrollArea>
                </CardContent>
             </Card>
             
             {/* Admin Link */}
             <div className="text-center">
                <Button variant="link" className="text-slate-400 hover:text-slate-600 text-xs" onClick={() => navigate('/login')}>
                   <ArrowLeft className="mr-1 h-3 w-3" /> Acesso Administrativo
                </Button>
             </div>
          </div>

       </main>

      <PayslipViewerModal 
        open={isPayslipViewerOpen}
        onOpenChange={setIsPayslipViewerOpen}
        employee={identifiedEmployee}
        referenceDate={new Date()}
      />

      {/* Dialog de Documentos */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Documentos de {identifiedEmployee?.name}</DialogTitle>
                <DialogDescription>Visualize ou baixe seus documentos.</DialogDescription>
            </DialogHeader>
            
            {identifiedEmployee && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-900 mt-4">
                <div className="flex flex-col">
                  <span className="font-medium text-blue-900 dark:text-blue-300">Contra Cheque</span>
                  <span className="text-xs text-blue-700 dark:text-blue-400">Mês Atual</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPayslipViewerOpen(true)}>Visualizar</Button>
                  <PayslipButton employee={identifiedEmployee as any} referenceDate={new Date()} />
                </div>
              </div>
            )}

            <div className="py-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Outros Arquivos</h4>
                <ScrollArea className="h-[300px] pr-4">
                    {documents.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>Nenhum documento disponível.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-primary/10 p-2 rounded-md">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium truncate">{doc.name}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => window.open(doc.url, '_blank')}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
            <DialogFooter>
                <Button onClick={() => setShowDocumentsDialog(false)}>Fechar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

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
