import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeDetailSheet } from '@/components/employees/EmployeeDetailSheet';
import { employees as initialEmployees } from '@/data/mockData';
import { Employee, TimeOffRequest } from '@/types/hr';
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
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  useEffect(() => {
    localStorage.setItem('hr_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('hr_employees');
      setEmployees(saved ? JSON.parse(saved) : initialEmployees);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);
  const [vacationDays, setVacationDays] = useState(30);
  const { toast } = useToast();

  const filteredEmployees = employees.filter((employee) => {
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

  const handleSave = (employeeData: Partial<Employee>) => {
    if (selectedEmployee) {
      setEmployees(prev => 
        prev.map(e => e.id === selectedEmployee.id ? { ...e, ...employeeData } : e)
      );
    } else {
      const newEmployee: Employee = {
        ...employeeData as Employee,
        id: Date.now().toString(),
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
  };

  const handleEndVacation = (employeeId: string) => {
    setEmployees(prev =>
      prev.map(e => (e.id === employeeId ? { ...e, status: 'active' } : e))
    );
    toast({
      title: "Férias encerradas",
      description: "O colaborador foi marcado como ativo.",
    });
    // Fecha o painel de detalhes após a ação
    setIsDetailOpen(false);
  };

  const handleEndVacationFromTable = (employee: Employee) => {
    handleEndVacation(employee.id);
  };

  const handleGrantVacationFromTable = (employee: Employee) => {
    handleGrantVacationClick(employee.id);
  };

  const handleTerminateClick = (employee: Employee) => {
    setEmployeeToTerminate(employee);
  };

  const confirmTerminate = () => {
    if (!employeeToTerminate) return;
    setEmployees(prev =>
      prev.map(e => e.id === employeeToTerminate.id ? { ...e, status: 'terminated' } : e)
    );
    toast({
      title: "Colaborador Desligado",
      description: `O status de ${employeeToTerminate.name} foi alterado para "Desligado".`,
      variant: "destructive"
    });
    setEmployeeToTerminate(null);
  };

  const handleGrantVacationClick = (employeeId: string) => {
    setSelectedEmployee(employees.find(e => e.id === employeeId) || null);
    setVacationDays(30); // Reset to default
    setIsVacationDialogOpen(true);
  };

  const confirmGrantVacation = () => {
    if (!selectedEmployee) return;

    const days = vacationDays;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);

    const newRequest: TimeOffRequest = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      type: 'vacation',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'approved',
      reason: 'Concedido manualmente via Painel de Colaboradores',
    };

    // Update requests
    const currentRequests = JSON.parse(localStorage.getItem('hr_timeoff_requests') || '[]');
    localStorage.setItem('hr_timeoff_requests', JSON.stringify([...currentRequests, newRequest]));

    // Update employee status
    setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, status: 'vacation' } : e));

    toast({
      title: "Férias concedidas",
      description: `Férias de ${days} dias registradas para ${selectedEmployee.name}.`,
    });

    setIsVacationDialogOpen(false);
    setIsDetailOpen(false);
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        "Nome": "João Silva",
        "Email": "joao.silva@empresa.com",
        "Cargo": "Desenvolvedor",
        "Departamento": "Tecnologia",
        "Telefone": "(11) 99999-9999",
        "Data de Admissão": "2024-01-15"
      },
      {
        "Nome": "Maria Santos",
        "Email": "maria.santos@empresa.com",
        "Cargo": "Analista de RH",
        "Departamento": "Recursos Humanos",
        "Telefone": "(11) 98888-8888",
        "Data de Admissão": "2024-02-01"
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

      const newEmployees: Employee[] = jsonData.map((row: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: row['Nome'] || row['Nome Completo'] || '',
        email: row['Email'] || '',
        position: row['Cargo'] || 'Novo Colaborador',
        department: row['Departamento'] || 'Geral',
        phone: row['Telefone'] || '',
        status: 'active',
        contractType: 'CLT',
        hireDate: row['Data de Admissão'] || new Date().toISOString().split('T')[0],
      })).filter((e: any) => e.name); // Filtra linhas vazias

      if (newEmployees.length > 0) {
        setEmployees(prev => [...prev, ...newEmployees]);
        toast({
          title: "Importação realizada",
          description: `${newEmployees.length} colaboradores foram importados com sucesso.`,
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
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    vacation: employees.filter(e => e.status === 'vacation').length,
    leave: employees.filter(e => e.status === 'leave').length,
    terminated: employees.filter(e => e.status === 'terminated').length,
  };

  return (
    <AppLayout title="Colaboradores" subtitle="Gerencie todos os colaboradores da empresa">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
          onGrantVacation={handleGrantVacationFromTable}
          onEndVacation={handleEndVacationFromTable}
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
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsFormOpen(true);
          }}
          onEndVacation={handleEndVacation}
          onGrantVacation={handleGrantVacationClick}
        />

        <Dialog open={isVacationDialogOpen} onOpenChange={setIsVacationDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Conceder Férias</DialogTitle>
              <DialogDescription>
                Defina o período de férias para {selectedEmployee?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="days" className="text-right">
                  Dias
                </Label>
                <Input
                  id="days"
                  type="number"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVacationDialogOpen(false)}>Cancelar</Button>
              <Button onClick={confirmGrantVacation}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!employeeToTerminate} onOpenChange={(open) => !open && setEmployeeToTerminate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar desligamento</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja desligar o colaborador <strong>{employeeToTerminate?.name}</strong>? Esta ação mudará o status para "Desligado".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEmployeeToTerminate(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmTerminate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Desligar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
