import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeDetailSheet } from '@/components/employees/EmployeeDetailSheet';
import { Employee } from '@/types/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Users, UserCheck, UserX, Calendar, LogOut, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/lib/AuthContext';
import { useTimeOff } from '@/hooks/useTimeOff';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function Employees() {
  const { 
    employees: dbEmployees, 
    loading, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    refetch 
  } = useEmployees();
  const { signOut } = useAuth();
  const { requests: timeOffRequests, updateRequest, refetch: refetchTimeOff } = useTimeOff();

  // Mapeia os dados do Supabase (DB) para o formato da UI (Employee)
  const employees: Employee[] = dbEmployees.map(dbEmp => ({
    id: dbEmp.id,
    name: dbEmp.name,
    email: dbEmp.email,
    position: dbEmp.role || '', // Mapeia role -> position
    department: dbEmp.department,
    status: dbEmp.status as any, // Cast simples para o status da UI
    hireDate: dbEmp.admission_date, // Mapeia admission_date -> hireDate
    // Campos que não estão no banco simplificado (preenchidos com padrão)
    phone: dbEmp.phone || '',
    contractType: dbEmp.contract_type || 'CLT',
    birthDate: dbEmp.birth_date || '',
    salary: dbEmp.salary || 0,
    manager: dbEmp.manager || '',
    workSchedule: dbEmp.work_schedule || '09:00 - 18:00',
    unit: dbEmp.unit || '',
    // Aliases para evitar ambiguidade em componentes que usam nomes diferentes
    role: dbEmp.role || '',
    admissionDate: dbEmp.admission_date,
    // Campos Financeiros (Mapeamento)
    baseSalary: dbEmp.base_salary || 0,
    fixedDiscounts: dbEmp.fixed_discounts || 0,
    hasInsalubrity: dbEmp.has_insalubrity || false,
    insalubrityAmount: dbEmp.insalubrity_amount || 0,
    hasNightShift: dbEmp.has_night_shift || false,
    nightShiftAmount: dbEmp.night_shift_amount || 0,
    contractedHours: dbEmp.contracted_hours || 220,
    pisPasep: dbEmp.pis_pasep || '',
    pixKey: dbEmp.pix_key || '',
    vacationDueDate: dbEmp.vacation_due_date || '',
    vacationLimitDate: dbEmp.vacation_limit_date || '',
  } as unknown as Employee));

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordToUpdate, setPasswordToUpdate] = useState('');
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);
  const { toast } = useToast();

  // Computa o status real baseado nas solicitações de férias ativas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employeesWithStatus = employees.map(emp => {
    // FIX: Se o funcionário estiver desligado, não sobrescreve o status com férias
    if (emp.status === 'terminated' || emp.status === 'Desligado') {
      return emp;
    }

    const isOnVacation = timeOffRequests.some(r => 
      r.employee_id === emp.id && 
      r.status === 'approved' && 
      r.type === 'vacation' &&
      new Date(r.start_date + 'T00:00:00') <= today &&
      new Date(r.end_date + 'T00:00:00') >= today
    );
    return isOnVacation ? { ...emp, status: 'vacation' } : emp;
  });

  const filteredEmployees = employeesWithStatus.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleSave = async (employeeData: Partial<Employee>) => {
    try {
      // Prepara o objeto para o formato do Banco de Dados
      const dbPayload = {
        name: employeeData.name!,
        email: employeeData.email!,
        role: employeeData.position || (employeeData as any).role || '', // UI (position) -> DB (role)
        department: employeeData.department!,
        status: employeeData.status || 'active',
        admission_date: employeeData.hireDate || (employeeData as any).admissionDate || new Date().toISOString(),
        phone: employeeData.phone,
        contract_type: employeeData.contractType,
        birth_date: employeeData.birthDate,
        salary: employeeData.salary,
        manager: employeeData.manager,
        work_schedule: employeeData.workSchedule,
        unit: employeeData.unit,
        // Campos Financeiros
        base_salary: (employeeData as any).baseSalary,
        fixed_discounts: (employeeData as any).fixedDiscounts,
        has_insalubrity: (employeeData as any).hasInsalubrity,
        insalubrity_amount: (employeeData as any).insalubrityAmount,
        has_night_shift: (employeeData as any).hasNightShift,
        night_shift_amount: (employeeData as any).nightShiftAmount,
        contracted_hours: (employeeData as any).contractedHours,
        pis_pasep: (employeeData as any).pisPasep,
        pix_key: (employeeData as any).pixKey,
        vacation_due_date: (employeeData as any).vacationDueDate,
        vacation_limit_date: (employeeData as any).vacationLimitDate,
      };

      let result;
      if (selectedEmployee) {
        result = await updateEmployee(selectedEmployee.id, dbPayload);
      } else {
        result = await addEmployee({ ...dbPayload, password: '1234' });
      }

      if (result.error) throw result.error;

      toast({ 
        title: "Sucesso", 
        description: selectedEmployee ? "Colaborador atualizado" : "Colaborador criado" 
      });
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao salvar colaborador.", 
        variant: "destructive" 
      });
    }
  };

  const handleEndVacation = async (employeeId: string) => {
    try {
      // 1. Encontra TODAS as solicitações de férias ativas para este funcionário
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeRequests = timeOffRequests.filter(r => 
        r.employee_id === employeeId && 
        r.status === 'approved' && 
        r.type === 'vacation' &&
        new Date(r.start_date + 'T00:00:00') <= today &&
        new Date(r.end_date + 'T00:00:00') >= today
      );

      // 2. Atualiza o status do funcionário para 'active'
      const { error: updateError } = await updateEmployee(employeeId, { status: 'active' });
      if (updateError) throw updateError;

      // 3. Se houver solicitações ativas, atualiza a data de término de TODAS para ontem
      if (activeRequests.length > 0) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
        
        // Atualiza todas as solicitações em paralelo e aguarda
        await Promise.all(activeRequests.map(req => updateRequest(req.id, { end_date: yesterdayStr })));
        
        await refetchTimeOff(); // Atualiza a lista de férias
      }
      
      await refetch(); // Atualiza a lista de colaboradores para garantir o status 'active'
      toast({
        title: "Férias encerradas",
        description: "O colaborador foi atualizado para 'Ativo'.",
      });
      setIsDetailOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Falha ao encerrar férias.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordClick = (employee: Employee) => {
    const dbEmp = dbEmployees.find(d => d.id === employee.id);
    setSelectedEmployee(employee);
    setPasswordToUpdate(dbEmp?.password || '');
    setIsPasswordDialogOpen(true);
  };

  const handleSavePassword = async () => {
    if (!selectedEmployee) return;
    
    await updateEmployee(selectedEmployee.id, { password: passwordToUpdate });

    toast({
      title: "Senha atualizada",
      description: `A senha de ponto de ${selectedEmployee.name} foi alterada com sucesso.`,
    });
    setIsPasswordDialogOpen(false);
  };

  const handleTerminateClick = (employee: Employee) => {
    setEmployeeToTerminate(employee);
  };

  const confirmTerminate = async () => {
    if (!employeeToTerminate) return;
    
    try {
      // Altera o status para 'terminated' em vez de deletar o registro
      const { error } = await updateEmployee(employeeToTerminate.id, { status: 'terminated' });

      if (error) throw error;

      await refetch();
      toast({
        title: "Colaborador Desligado",
        description: `O colaborador ${employeeToTerminate.name} foi desligado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao desligar",
        description: "Não foi possível realizar o desligamento. Tente novamente.",
        variant: "destructive"
      });
    }
    setEmployeeToTerminate(null);
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        "Nome": "João Silva",
        "Email": "joao.silva@empresa.com",
        "Cargo": "Desenvolvedor",
        "Departamento": "Tecnologia",
        "Telefone": "(11) 99999-9999",
        "Data de Admissão": "2024-01-15",
        "PIS/PASEP": "123.45678.90-0",
        "Chave PIX": "email@pix.com.br",
        "Vencimento Férias": "2025-01-15",
        "Limite Férias": "2025-12-15"
      },
      {
        "Nome": "Maria Santos",
        "Email": "maria.santos@empresa.com",
        "Cargo": "Analista de RH",
        "Departamento": "Recursos Humanos",
        "Telefone": "(11) 98888-8888",
        "Data de Admissão": "2024-02-01",
        "PIS/PASEP": "",
        "Chave PIX": "",
        "Vencimento Férias": "",
        "Limite Férias": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
    XLSX.writeFile(wb, "modelo_importacao_funcionarios.xlsx");
  };

  const handleImport = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let count = 0;
      for (const row of jsonData as any[]) {
        if (!row['Nome'] && !row['Nome Completo']) continue;
        
        await addEmployee({
          name: row['Nome'] || row['Nome Completo'],
          email: row['Email'] || '',
          role: row['Cargo'] || 'Novo Colaborador',
          department: row['Departamento'] || 'Geral',
          status: 'active',
          admission_date: row['Data de Admissão'] || new Date().toISOString(),
          password: '1234',
          pis_pasep: row['PIS/PASEP'] || '',
          pix_key: row['Chave PIX'] || '',
          vacation_due_date: row['Vencimento Férias'] || '',
          vacation_limit_date: row['Limite Férias'] || '',
        });
        count++;
      }

      if (count > 0) {
        toast({
          title: "Importação realizada",
          description: `${count} colaboradores foram importados com sucesso.`,
        });
      } else {
        toast({
          title: "Erro na importação",
          description: "Nenhum dado válido encontrado. Verifique o modelo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao ler arquivo",
        description: "Certifique-se de que o arquivo é um Excel ou CSV válido.",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: employeesWithStatus.length,
    active: employeesWithStatus.filter(e => e.status === 'active' || e.status === 'Ativo').length,
    vacation: employeesWithStatus.filter(e => e.status === 'vacation' || e.status === 'Férias').length,
    leave: employeesWithStatus.filter(e => e.status === 'leave' || e.status === 'Afastado').length,
    terminated: employeesWithStatus.filter(e => e.status === 'terminated' || e.status === 'Desligado').length,
  };

  return (
    <AppLayout title="Colaboradores" subtitle="Gerencie todos os colaboradores da empresa">
      <div className="space-y-6">
        {loading && <div className="text-sm text-muted-foreground">Carregando dados do servidor...</div>}
        
        {/* Stats */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.vacation}</p>
                <p className="text-xs text-muted-foreground">Férias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.leave}</p>
                <p className="text-xs text-muted-foreground">Afastados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.terminated}</p>
                <p className="text-xs text-muted-foreground">Desligados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <EmployeeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onAddEmployee={handleAddEmployee}
          onImport={handleImport}
          onDownloadTemplate={handleDownloadTemplate}
        />

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleTerminateClick}
          onEndVacation={handleEndVacation}
          onChangePassword={handlePasswordClick}
        />

        {/* Dialogs */}
        <EmployeeFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          employee={selectedEmployee}
          onSave={handleSave}
        />

        <EmployeeDetailSheet
          employee={selectedEmployee}
          timeOffRequests={timeOffRequests}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsFormOpen(true);
          }}
          onEndVacation={handleEndVacation}
          onChangePassword={() => selectedEmployee && handlePasswordClick(selectedEmployee)}
        />

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Senha de Ponto</DialogTitle>
              <DialogDescription>
                Visualize ou altere a senha (PIN) usada para o registro de ponto de {selectedEmployee?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pin" className="text-right">
                  Senha (PIN)
                </Label>
                <Input
                  id="pin"
                  value={passwordToUpdate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setPasswordToUpdate(value);
                  }}
                  className="col-span-3"
                  maxLength={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePassword}>Salvar Senha</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!employeeToTerminate} onOpenChange={(open) => !open && setEmployeeToTerminate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Desligamento</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja desligar o colaborador <strong>{employeeToTerminate?.name}</strong>? Esta ação alterará o status para "Desligado", mantendo o histórico no sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEmployeeToTerminate(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmTerminate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
