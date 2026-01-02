import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '@/types/hr';
import { employees as mockEmployees } from '@/data/mockData';
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
import { LogIn, LogOut, User, ArrowLeft } from 'lucide-react';

interface ClockEvent {
  id: string;
  employeeId: string;
  timestamp: string;
  type: 'in' | 'out';
}

export default function ClockInPage() {
  const [employees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_employees');
    const initial = saved ? JSON.parse(saved) : mockEmployees;
    return initial.map((e: any) => ({ ...e, pin: e.pin || '1234' })); // Garante PIN padrão para teste
  });

  const [clockEvents, setClockEvents] = useState<ClockEvent[]>(() => {
    const saved = localStorage.getItem('hr_clock_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hr_clock_events', JSON.stringify(clockEvents));
  }, [clockEvents]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsPinDialogOpen(true);
    setError('');
    setPin('');
  };

  const handleClockAction = (type: 'in' | 'out') => {
    if (!selectedEmployee || !selectedEmployee.pin) {
      setError('Senha não configurada para este colaborador.');
      return;
    }

    if (pin !== selectedEmployee.pin) {
      setError('Senha incorreta. Tente novamente.');
      setPin('');
      return;
    }

    const newEvent: ClockEvent = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      timestamp: new Date().toISOString(),
      type,
    };

    setClockEvents(prev => [...prev, newEvent]);
    toast({
      title: `Ponto registrado com sucesso!`,
      description: `${selectedEmployee.name} - ${type === 'in' ? 'Entrada' : 'Saída'} às ${format(new Date(), 'HH:mm')}.`,
    });

    setIsPinDialogOpen(false);
    setSelectedEmployee(null);
    setPin('');
  };

  const lastEventForSelected = selectedEmployee
    ? clockEvents.filter(e => e.employeeId === selectedEmployee.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">Ponto Eletrônico</h1>
          <Button variant="outline" onClick={() => navigate('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Área Administrativa
          </Button>
        </div>
        <p className="text-center text-muted-foreground mb-8">Selecione seu perfil para registrar o ponto.</p>
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
                  disabled={lastEventForSelected?.type === 'in'}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Registrar Entrada
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => handleClockAction('out')}
                  disabled={!lastEventForSelected || lastEventForSelected.type === 'out'}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Registrar Saída
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