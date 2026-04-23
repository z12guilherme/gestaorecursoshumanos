import { EmployeeDocuments } from './EmployeeDocuments';
import { useState, useEffect } from 'react';
import { Employee } from '@/types/hr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, KeyRound, Loader2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { supabase } from '@/lib/supabase';
import FinancialDataForm from './FinancialDataForm';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  // Usando 'any' temporariamente para permitir as chaves snake_case do banco de dados
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    role: '', // No banco é 'role', no front costuma ser 'position'
    department: '',
    contract_type: 'CLT',
    status: 'active',
    admission_date: '',
    termination_date: '',
    birth_date: '',
    base_salary: 0,
    fixed_discounts: 0,
    contracted_hours: 220,
    has_insalubrity: false,
    has_night_shift: false,
    insalubrity_amount: 0,
    night_shift_amount: 0,
    pis_pasep: '',
    pix_key: '',
    vacation_due_date: '',
    vacation_limit_date: '',
    variable_discounts: [],
    variable_additions: [],
    avatar_url: '',
  });

  useEffect(() => {
    if (employee) {
      // Mapeia os dados do objeto Employee (camelCase) para o formato do DB (snake_case)
      setFormData({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.position, // Mapeando position -> role
        department: employee.department,
        contract_type: employee.contractType,
        status: employee.status,
        admission_date: employee.hireDate,
        termination_date: (employee as any).termination_date || '',
        birth_date: employee.birthDate,
        base_salary: employee.baseSalary,
        fixed_discounts: employee.fixedDiscounts,
        contracted_hours: employee.contractedHours,
        has_insalubrity: employee.hasInsalubrity,
        has_night_shift: employee.hasNightShift,
        insalubrity_amount: (employee as any).insalubrityAmount || 0,
        night_shift_amount: (employee as any).nightShiftAmount || 0,
        pis_pasep: employee.pisPasep,
        pix_key: employee.pixKey,
        vacation_due_date: employee.vacationDueDate,
        vacation_limit_date: employee.vacationLimitDate,
        variable_discounts: employee.variable_discounts || [],
        variable_additions: employee.variable_additions || [],
        avatar_url: employee.avatar_url,
        inss_value: (employee as any).inssValue || 0,
        password: '' // Senha sempre vazia ao editar
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        contract_type: 'CLT',
        status: 'active',
        admission_date: '',
        termination_date: '',
        birth_date: '',
        base_salary: 0,
        fixed_discounts: 0,
        contracted_hours: 220,
        has_insalubrity: false,
        has_night_shift: false,
        insalubrity_amount: 0,
        night_shift_amount: 0,
        pis_pasep: '',
        pix_key: '',
        vacation_due_date: '',
        vacation_limit_date: '',
        variable_discounts: [],
        variable_additions: [],
        avatar_url: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // NOTA: Edge Function removida temporariamente para evitar erro 401/500.
    // Salvando diretamente no banco de dados.
    const payload = { ...formData };

    // Remove senha vazia para não sobrescrever na edição
    if (!payload.password) {
      delete payload.password;
    } else {
      // Se houver senha, ela será salva como texto plano por enquanto
    }

    // Se for novo cadastro e não tiver senha, define padrão '1234'
    if (!employee && !payload.password) {
      payload.password = '1234';
    }

    // Tratamento para a data de desligamento
    if (payload.status !== 'terminated' && payload.status !== 'Desligado') {
      payload.termination_date = null; // Limpa a data se não estiver desligado
    } else if (!payload.termination_date) {
      payload.termination_date = new Date().toISOString().split('T')[0]; // Previne erro no banco se enviar vazio
    }

    let error;

    if (employee?.id) {
      const { error: updateError } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', employee.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('employees')
        .insert([payload]);
      error = insertError;
    }

    setIsSaving(false);

    if (error) {
      console.error("Erro ao salvar colaborador:", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar os dados. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } else {
      toast({
        title: employee ? 'Colaborador atualizado' : 'Colaborador cadastrado',
        description: `${formData.name} foi ${employee ? 'atualizado' : 'cadastrado'} com sucesso.`,
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Atualize os dados e a foto do colaborador.' : 'Insira as informações para cadastrar um novo colaborador.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {employee?.id && (
            <div className="flex justify-center pb-4 border-b mb-4">
              <AvatarUpload
                uid={employee.id}
                url={formData.avatar_url}
                onUpload={(url) => {
                  setFormData(prev => ({ ...prev, avatar_url: url }));
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2 py-1">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractType">Tipo de Contrato</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                  <SelectItem value="Estágio">Estágio</SelectItem>
                  <SelectItem value="Temporário">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="leave">Afastado</SelectItem>
                  <SelectItem value="terminated">Desligado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.status === 'terminated' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="terminationDate" className="text-red-600 font-semibold">Data de Desligamento</Label>
                <Input
                  id="terminationDate"
                  type="date"
                  value={formData.termination_date || ''}
                  onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">Senha do Ponto (PIN)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={employee ? 'Deixe em branco para não alterar' : 'PIN de 4 a 6 dígitos'}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Data de Admissão</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>

            <FinancialDataForm formData={formData} setFormData={setFormData} />

            <EmployeeDocuments employeeId={employee?.id} />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Salvando...' : (employee ? 'Salvar Alterações' : 'Cadastrar Colaborador')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
