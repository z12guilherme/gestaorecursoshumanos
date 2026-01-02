import { Employee } from '@/types/hr';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, Calendar, FileText, Edit } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  vacation: { label: 'Férias', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  leave: { label: 'Afastado', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  terminated: { label: 'Desligado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function EmployeeDetailSheet({ employee, open, onOpenChange, onEdit }: EmployeeDetailSheetProps) {
  if (!employee) return null;

  const status = statusConfig[employee.status];
  const yearsAtCompany = differenceInYears(new Date(), parseISO(employee.hireDate));
  const age = differenceInYears(new Date(), parseISO(employee.birthDate));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Detalhes do Colaborador</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{employee.name}</h3>
              <p className="text-muted-foreground">{employee.position}</p>
              <Badge className={`mt-2 ${status.className}`}>{status.label}</Badge>
            </div>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{employee.phone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Informações Profissionais</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p className="text-sm font-medium text-foreground">{employee.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Contrato</p>
                <p className="text-sm font-medium text-foreground">{employee.contractType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data de Admissão</p>
                <p className="text-sm font-medium text-foreground">
                  {format(parseISO(employee.hireDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tempo de Casa</p>
                <p className="text-sm font-medium text-foreground">{yearsAtCompany} ano(s)</p>
              </div>
              {employee.manager && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Gestor</p>
                  <p className="text-sm font-medium text-foreground">{employee.manager}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Informações Pessoais</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="text-sm font-medium text-foreground">
                  {format(parseISO(employee.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="text-sm font-medium text-foreground">{age} anos</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
