import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '@/types/hr';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { LogIn, LogOut, User, ArrowLeft, Megaphone, Pin, Building2, FileText, Download, LifeBuoy, Search, Copy, Check, MessageSquare, KeyRound } from 'lucide-react';
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
  const { employees } = useEmployees();
  const { announcements } = useCommunication();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companySettings, setCompanySettings] = useState<any>(null);
  
  // Documents State
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [identifiedEmployee, setIdentifiedEmployee] = useState<Employee | null>(null);
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
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('company_name, cnpj').maybeSingle();
      if (data) setCompanySettings(data);
    }
    fetchSettings();
  }, []);

  const findEmployeeByPin = (inputPin: string) => {
    const employee = employees.find(e => e.password === inputPin);
    if (!employee) {
      toast({
        title: "Acesso Negado",
        description: "Senha não encontrada. Verifique suas credenciais.",
        variant: "destructive"
      });
      return null;
    }
    const duplicates = employees.filter(e => e.password === inputPin);
    if (duplicates.length > 1) {
       toast({
        title: "Conflito de Senha",
        description: "Existem múltiplos funcionários com esta senha. Contate o RH.",
        variant: "destructive"
      });
      return null;
    }
    return employee;
  };

  const handleClockAction = async (type: 'in' | 'out') => {
    if (!pin) return;
    setLoading(true);

    const employee = findEmployeeByPin(pin);
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

    if (lastEntry) {
      const isLastIn = lastEntry.type === 'in' || lastEntry.type === 'lunch_end';
      const isLastOut = lastEntry.type === 'out' || lastEntry.type === 'lunch_start';

      if ((type === 'in' && isLastIn) || (type === 'out' && isLastOut)) {
        toast({
          title: "Ação Inválida",
          description: type === 'in' ? "Você já registrou entrada. Registre a saída primeiro." : "Você já registrou saída. Registre a entrada primeiro.",
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

  const handleAccessDocuments = () => {
      if (!pin) return;
      const employee = findEmployeeByPin(pin);
      if (employee) {
          setIdentifiedEmployee(employee);
          setShowDocumentsDialog(true);
          setPin('');
      }
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
          {/* Main Clock In Area */}
          <div className="lg:col-span-2 flex items-center justify-center">
             <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-2 pb-2">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Registro de Ponto</CardTitle>
                  <p className="text-muted-foreground">Digite sua senha (PIN) para registrar</p>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-4">
                  <div className="flex justify-center">
                    <Input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="text-center text-3xl tracking-[0.5em] h-16 w-48 font-mono border-2 focus-visible:ring-primary"
                      maxLength={4}
                      placeholder="----"
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      size="lg" 
                      className="h-14 text-lg bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95"
                      onClick={() => handleClockAction('in')}
                      disabled={loading || pin.length < 4}
                    >
                      <LogIn className="mr-2 h-6 w-6" />
                      Entrada
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="destructive"
                      className="h-14 text-lg transition-all active:scale-95"
                      onClick={() => handleClockAction('out')}
                      disabled={loading || pin.length < 4}
                    >
                      <LogOut className="mr-2 h-6 w-6" />
                      Saída
                    </Button>
                  </div>

                  <div className="pt-2">
                     <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleAccessDocuments}
                        disabled={loading || pin.length < 4}
                     >
                        <FileText className="mr-2 h-4 w-4" />
                        Acessar Meus Documentos
                     </Button>
                  </div>
                </CardContent>
             </Card>
          </div>
          
          {/* Mural de Avisos */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Mural de Avisos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4 max-h-[400px]">
                  <div className="space-y-4">
                    {announcements.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum aviso no momento.</p>
                    ) : (
                      announcements.map(announcement => (
                        <div key={announcement.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm flex items-center gap-2">
                              {announcement.priority === 'high' && <Pin className="h-3 w-3 text-red-500" />}
                              {announcement.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {format(new Date(announcement.created_at), 'dd/MM')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{announcement.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de Documentos */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Documentos de {identifiedEmployee?.name}</DialogTitle>
                <DialogDescription>Visualize ou baixe seus documentos.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
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
