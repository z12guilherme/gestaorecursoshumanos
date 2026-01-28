import { useState, useRef } from 'react';
import { Employee, TimeOffRequest } from '@/types/hr';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Calendar, Briefcase, Clock, Edit, User, Undo2, KeyRound, FileText, Upload, Trash2, Download } from "lucide-react";
import { format, differenceInDays, addDays, differenceInYears, addYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  timeOffRequests: TimeOffRequest[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onEndVacation: (employeeId: string) => void;
  onChangePassword: () => void;
}

export function EmployeeDetailSheet({ employee, timeOffRequests, open, onOpenChange, onEdit, onEndVacation, onChangePassword }: EmployeeDetailSheetProps) {
  if (!employee) return null;

  const { documents, uploadDocument, deleteDocument } = useDocuments(employee.id);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { error } = await uploadDocument(file, file.name);
    setIsUploading(false);

    if (error) {
      toast({ title: "Erro no upload", description: "Não foi possível salvar o documento.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Documento anexado à ficha do colaborador." });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    inactive: { label: 'Inativo', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    vacation: { label: 'Em Férias', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    leave: { label: 'Afastado', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  };

  // Cálculo dinâmico do saldo de férias
  const hireDate = employee.hireDate ? new Date(employee.hireDate + 'T00:00:00') : new Date();
  const today = new Date();
  const yearsOfService = differenceInYears(today, hireDate);
  
  // Período aquisitivo atual (aniversário de admissão deste ano até o próximo)
  const currentPeriodStart = addYears(hireDate, yearsOfService);
  const currentPeriodEnd = addYears(hireDate, yearsOfService + 1);

  // Calcula dias tirados no período atual
  const takenDays = timeOffRequests
    .filter(r => 
      r.employee_id === employee.id && 
      r.status === 'approved' && 
      r.type === 'vacation' &&
      new Date(r.start_date + 'T00:00:00') >= currentPeriodStart
    )
    .reduce((acc, r) => acc + (differenceInDays(new Date(r.end_date + 'T00:00:00'), new Date(r.start_date + 'T00:00:00')) + 1), 0);

  const vacationBalance = Math.max(0, 30 - takenDays);

  // Logic to find return date if on vacation
  let returnDate: Date | null = null;
  let daysLeft = 0;

  if (employee.status === 'vacation') {
    // Find the latest approved vacation request for this employee from props
    const activeRequest = timeOffRequests
      .filter((r) => r.employee_id === employee.id && r.status === 'approved' && r.type === 'vacation')
      .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];

    if (activeRequest) {
      const end = new Date(activeRequest.end_date + 'T00:00:00');
      const todayForDiff = new Date();
      todayForDiff.setHours(0, 0, 0, 0);
      if (end >= todayForDiff) {
          returnDate = addDays(end, 1); // Return date is the day after vacation ends
          daysLeft = differenceInDays(end, todayForDiff) + 1;
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <SheetTitle className="text-xl">{employee.name}</SheetTitle>
                <SheetDescription className="text-foreground font-medium">
                  {employee.position}
                </SheetDescription>
                <Badge variant="secondary" className={statusConfig[employee.status]?.className || ''}>
                  {statusConfig[employee.status]?.label || employee.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Vacation Status Card */}
          {employee.status === 'vacation' && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                  <Calendar className="h-4 w-4" />
                  <span>Status de Férias</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => onEndVacation(employee.id)}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Encerrar Férias
                </Button>
              </div>
              {returnDate && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Retorno</p>
                    <p className="font-medium text-lg">{format(returnDate, "dd 'de' MMM", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Restante</p>
                    <p className="font-medium text-lg">{daysLeft} dias</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grant Vacation Action */}
          {employee.status === 'active' && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Calendar className="h-4 w-4" />
                  <span>Ações Rápidas</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onChangePassword} className="bg-white dark:bg-slate-950">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Senha
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Vacation Balance Card */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Saldo de Férias</span>
                </div>
                <Badge variant="outline" className="bg-background">{today.getFullYear()}</Badge>
             </div>
             <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{vacationBalance}</span>
                <span className="text-sm text-muted-foreground mb-1">dias disponíveis</span>
             </div>
             <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '70%' }} />
             </div>
             <p className="text-xs text-muted-foreground">
                Período aquisitivo: {format(currentPeriodStart, 'dd/MM/yyyy')} - {format(currentPeriodEnd, 'dd/MM/yyyy')}
             </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações de Contato</h4>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone || 'Não informado'}</span>
              </div>
              {(employee as any).unit && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{(employee as any).unit}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dados Corporativos</h4>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Departamento</span>
                    <span>{employee.department}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Gestor</span>
                    <span>{employee.manager || 'Não definido'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Data de Admissão</span>
                    <span>{employee.hireDate ? format(new Date(employee.hireDate + 'T00:00:00'), 'dd/MM/yyyy') : 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentos & Laudos</h4>
              <div className="relative">
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="h-3 w-3 mr-2" />
                  {isUploading ? 'Enviando...' : 'Anexar'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhum documento anexado.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm truncate max-w-[180px]" title={doc.name}>{doc.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => window.open(doc.url, '_blank')}>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteDocument(doc.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}