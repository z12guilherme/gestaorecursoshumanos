import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogOut, MapPin, IdCard, User } from "lucide-react";
import { PayslipButton } from "@/components/PayslipButton";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmployeeBadge } from "@/components/EmployeeBadge";

interface SimpleEmployee {
  id: string;
  name: string;
}

export default function ClockIn() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<SimpleEmployee[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado do funcionário autenticado (com dados completos para o holerite)
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<any | null>(null);

  // Estados para atualização de dados do funcionário
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ email: '', phone: '' });
  const [updatePin, setUpdatePin] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .eq("status", "Ativo")
      .order("name");
    
    if (data) setEmployees(data);
    if (error) console.error("Erro ao buscar funcionários:", error);
  };

  const handleLogin = async () => {
    if (!selectedId || !pin) {
      toast({ title: "Erro", description: "Selecione seu nome e digite a senha.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Validação segura via Edge Function (Hash)
      const { data: validation, error: validationError } = await supabase.functions.invoke('validate-pin', {
        body: { employee_id: selectedId, pin: pin }
      });

      if (validationError || !validation || !validation.isValid) {
        throw new Error("Senha incorreta");
      }

      // 2. Se validou, busca dados completos para o Holerite (sem precisar checar senha aqui)
      const { data: employee, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", selectedId)
        .single();

      if (error || !employee) throw new Error("Funcionário não encontrado");

      setAuthenticatedEmployee(employee);
      setUpdateData({ email: employee.email || '', phone: employee.phone || '' });
      setPin(""); // Limpa o PIN por segurança
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toast({ title: "Acesso Negado", description: "Senha incorreta ou erro de conexão.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (type: 'in' | 'out') => {
    if (!authenticatedEmployee) return;
    setLoading(true);

    try {
      // Tenta pegar localização
      let location = null;
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (e) {
          console.log("Localização não permitida ou indisponível");
        }
      }

      const { error } = await supabase.from("time_entries").insert({
        employee_id: authenticatedEmployee.id,
        type: type,
        timestamp: new Date().toISOString(),
        latitude: location?.lat,
        longitude: location?.lng
      });

      if (error) throw error;

      toast({
        title: type === 'in' ? "Entrada Registrada!" : "Saída Registrada!",
        description: `Ponto registrado às ${new Date().toLocaleTimeString()}`,
        className: "bg-green-600 text-white border-none"
      });

      // Opcional: Deslogar automaticamente após registrar
      // handleLogout(); 

    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível registrar o ponto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateData = async () => {
    if (!updatePin) {
      toast({ title: "Erro", description: "Digite seu PIN para confirmar.", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      const { data: validation, error: validationError } = await supabase.functions.invoke('validate-pin', {
        body: { employee_id: authenticatedEmployee.id, pin: updatePin }
      });

      if (validationError || !validation || !validation.isValid) {
        throw new Error("PIN incorreto");
      }

      const { error } = await supabase
        .from('employees')
        .update({ email: updateData.email, phone: updateData.phone })
        .eq('id', authenticatedEmployee.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Dados atualizados com sucesso!" });
      setAuthenticatedEmployee({ ...authenticatedEmployee, email: updateData.email, phone: updateData.phone });
      setIsUpdateDialogOpen(false);
      setUpdatePin("");
    } catch (error) {
      toast({ title: "Erro", description: "PIN incorreto ou erro ao atualizar.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    setAuthenticatedEmployee(null);
    setSelectedId("");
    setPin("");
  };

  // --- TELA DE LOGIN ---
  if (!authenticatedEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Ponto Eletrônico</CardTitle>
            <CardDescription>Identifique-se para acessar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Colaborador</label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu nome" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha (PIN)</label>
              <Input 
                type="password" 
                placeholder="Digite sua senha" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleLogin} disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- TELA DO FUNCIONÁRIO (LOGADO) ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Olá, {authenticatedEmployee.name.split(' ')[0]}</CardTitle>
              <CardDescription>{authenticatedEmployee.role}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Área de Registro de Ponto */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="h-24 text-lg flex flex-col gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleClockIn('in')}
              disabled={loading}
            >
              <Clock className="h-6 w-6" />
              Entrada
            </Button>
            <Button 
              size="lg" 
              className="h-24 text-lg flex flex-col gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => handleClockIn('out')}
              disabled={loading}
            >
              <LogOut className="h-6 w-6" />
              Saída
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Documentos e Dados</span>
            </div>
          </div>

          {/* Área de Documentos e Crachá */}
          <div className="space-y-3">
            {/* Área do Holerite */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-900">
              <div className="flex flex-col">
                <span className="font-medium text-blue-900 dark:text-blue-300">Contra Cheque</span>
                <span className="text-xs text-blue-700 dark:text-blue-400">Baixar documento assinado</span>
              </div>
              
              <PayslipButton 
                employee={authenticatedEmployee} 
                referenceDate={new Date()}
              />
            </div>

            {/* Área do Crachá */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-slate-300">Crachá Funcional</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Visualizar versão digital</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <IdCard className="h-4 w-4" />
                    Ver Crachá
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm flex flex-col items-center justify-center p-8 bg-slate-50/95 dark:bg-slate-900/95 border-none shadow-2xl rounded-2xl">
                  <EmployeeBadge employee={authenticatedEmployee} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Área de Atualização de Dados */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-slate-300">Atualizar Cadastro</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Mantenha seus dados em dia</span>
              </div>
              
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Atualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Atualizar Meus Dados</DialogTitle>
                    <DialogDescription>
                      Atualize suas informações de contato. É necessário confirmar com seu PIN.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Pessoal</label>
                      <Input 
                        value={updateData.email} 
                        onChange={e => setUpdateData({...updateData, email: e.target.value})}
                        placeholder="seu.email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone / WhatsApp</label>
                      <Input 
                        value={updateData.phone} 
                        onChange={e => setUpdateData({...updateData, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                      <label className="text-sm font-medium text-amber-600 dark:text-amber-500">
                        Confirme com seu PIN
                      </label>
                      <Input 
                        type="password" 
                        maxLength={6}
                        value={updatePin} 
                        onChange={e => setUpdatePin(e.target.value)}
                        placeholder="Digite seu PIN"
                        className="text-center tracking-widest text-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateData} disabled={updating}>
                      {updating ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            Localização será registrada por segurança
          </div>

        </CardContent>
      </Card>
    </div>
  );
}