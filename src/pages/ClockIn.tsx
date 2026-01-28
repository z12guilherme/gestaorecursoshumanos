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
import { LogIn, LogOut, User, ArrowLeft, Megaphone, Pin, Building2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useCommunication } from '@/hooks/useCommunication';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

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

  const lastEventForSelected = selectedEmployee
    ? clockEvents.filter(e => e.employee_id === selectedEmployee.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const priorityConfig = {
    low: { label: 'Baixa', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    medium: { label: 'Média', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    high: { label: 'Alta', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
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
          <Button variant="outline" onClick={() => navigate('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Área Administrativa
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleClockAction('in')}
                  disabled={lastEventForSelected?.type === 'in' || isClockingIn}
                >
                  {isClockingIn ? 'Registrando...' : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Registrar Entrada
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => handleClockAction('out')}
                  disabled={!lastEventForSelected || lastEventForSelected.type === 'out' || isClockingIn}
                >
                  {isClockingIn ? 'Registrando...' : (
                    <>
                      <LogOut className="mr-2 h-5 w-5" />
                      Registrar Saída
                    </>
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsPinDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}