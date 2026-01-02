import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeDetailSheet } from '@/components/employees/EmployeeDetailSheet';
import { employees as initialEmployees } from '@/data/mockData';
import { Employee } from '@/types/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast({
      title: "Colaborador excluído",
      description: "O colaborador foi removido com sucesso.",
    });
  };

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    vacation: employees.filter(e => e.status === 'vacation').length,
    leave: employees.filter(e => e.status === 'leave').length,
  };

  return (
    <AppLayout title="Colaboradores" subtitle="Gerencie todos os colaboradores da empresa">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        />

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        />
      </div>
    </AppLayout>
  );
}
