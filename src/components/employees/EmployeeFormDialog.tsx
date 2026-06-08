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
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Loader2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { supabase } from '@/lib/supabase';
import FinancialDataForm from './FinancialDataForm';
import { useSettings } from '@/hooks/useSettings';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, type EmployeeFormData } from '@/lib/schemas';

const departments = [
  'Administrativo',
  'Central de Marcação',
  'Coordenação',
  'Enfermagem',
  'Farmácia',
  'Faturamento',
  'Financeiro',
  'Higienização',
  'Laboratório',
  'Lavanderia',
  'Manutenção',
  'Marketing',
  'Nutrição',
  'Radiologia',
  'Recepção Ambulatorial',
  'Recepção Urgência',
  'Recursos Humanos / Departamento Pessoal',
  'Remoção',
  'TI'
];

const defaultFormValues: EmployeeFormData = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  contract_type: 'CLT',
  status: 'active',
  admission_date: '',
  birth_date: '',
  cpf: '',
  password: '',
  termination_date: null,
  avatar_url: '',
  base_salary: 0,
  fixed_discounts: 0,
  inss_value: null,
  contracted_hours: 220,
  has_insalubrity: false,
  insalubrity_amount: 0,
  has_night_shift: false,
  night_shift_amount: 0,
  pis_pasep: '',
  pix_key: '',
  vacation_due_date: '',
  vacation_limit_date: '',
  variable_discounts: [],
  variable_additions: [],
  custom_fields: {},
};

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { settings } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultFormValues,
  });

  const watchStatus = watch('status');

  useEffect(() => {
    if (employee) {
      // Mapeia os dados do objeto Employee (camelCase) para o formato do DB (snake_case)
      reset({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        role: employee.position || '', // Mapeando position -> role
        department: employee.department || '',
        contract_type: employee.contractType || 'CLT',
        status: employee.status || 'active',
        admission_date: employee.hireDate || '',
        termination_date: (employee as any).termination_date || null,
        birth_date: employee.birthDate || '',
        cpf: (employee as any).cpf || '',
        password: '',
        avatar_url: employee.avatar_url || '',
        base_salary: employee.baseSalary || 0,
        fixed_discounts: employee.fixedDiscounts || 0,
        inss_value: (employee as any).inss_value !== undefined && (employee as any).inss_value !== null ? (employee as any).inss_value : null,
        contracted_hours: employee.contractedHours || 220,
        has_insalubrity: employee.hasInsalubrity || false,
        insalubrity_amount: (employee as any).insalubrityAmount || 0,
        has_night_shift: employee.hasNightShift || false,
        night_shift_amount: (employee as any).nightShiftAmount || 0,
        pis_pasep: employee.pisPasep || '',
        pix_key: employee.pixKey || '',
        vacation_due_date: employee.vacationDueDate || '',
        vacation_limit_date: employee.vacationLimitDate || '',
        variable_discounts: employee.variable_discounts || [],
        variable_additions: employee.variable_additions || [],
        custom_fields: (employee as any).custom_fields || {},
      });
    } else {
      reset(defaultFormValues);
    }
  }, [employee, open, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSaving(true);

    // Validar campos customizados obrigatórios
    if (settings?.employee_custom_fields_config) {
      for (const field of settings.employee_custom_fields_config) {
        if (field.required && !data.custom_fields?.[field.id]) {
          toast({ title: "Campo Obrigatório", description: `O campo "${field.name}" é obrigatório.`, variant: "destructive" });
          setIsSaving(false);
          return;
        }
      }
    }

    // Prepara o payload para o banco
    const payload: any = { ...data };

    // Remove senha vazia para não sobrescrever na edição
    if (!payload.password) {
      delete payload.password;
    }

    // Se for novo cadastro e não tiver senha, define padrão '1234'
    if (!employee && !payload.password) {
      payload.password = '1234';
    }

    // Tratamento para a data de desligamento
    if (payload.status !== 'terminated' && payload.status !== 'Desligado') {
      payload.termination_date = null;
    } else if (!payload.termination_date) {
      payload.termination_date = new Date().toISOString().split('T')[0];
    }

    // Remove cpf vazio para não salvar string vazia no banco
    if (payload.cpf === '') {
      delete payload.cpf;
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
        description: `${data.name} foi ${employee ? 'atualizado' : 'cadastrado'} com sucesso.`,
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
        <form onSubmit={handleSubmit(onSubmit)}>
          {employee?.id && (
            <div className="flex justify-center pb-4 border-b mb-4">
              <AvatarUpload
                uid={employee.id}
                url={watch('avatar_url') || ''}
                onUpload={(url) => {
                  setValue('avatar_url', url);
                }}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2 py-1">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input id="position" {...register('role')} />
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractType">Tipo de Contrato</Label>
              <Controller
                control={control}
                name="contract_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.contract_type && <p className="text-xs text-red-500 mt-1">{errors.contract_type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
            </div>
            {watchStatus === 'terminated' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="terminationDate" className="text-red-600 font-semibold">Data de Desligamento</Label>
                <Input
                  id="terminationDate"
                  type="date"
                  {...register('termination_date')}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">Senha do Ponto (PIN)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  placeholder={employee ? 'Deixe em branco para não alterar' : 'PIN de 4 a 6 dígitos'}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Data de Admissão</Label>
              <Input id="hireDate" type="date" {...register('admission_date')} />
              {errors.admission_date && <p className="text-xs text-red-500 mt-1">{errors.admission_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input id="birthDate" type="date" {...register('birth_date')} />
              {errors.birth_date && <p className="text-xs text-red-500 mt-1">{errors.birth_date.message}</p>}
            </div>

            <FinancialDataForm
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />

            {settings?.employee_custom_fields_config && settings.employee_custom_fields_config.length > 0 && (
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-4 text-muted-foreground">Campos Personalizados</h4>
                <div className="grid grid-cols-2 gap-4">
                  {settings.employee_custom_fields_config.map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
                      <Controller
                        control={control}
                        name={`custom_fields.${field.id}` as any}
                        render={({ field: formField }) => (
                          <Input
                            id={`custom-${field.id}`}
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={formField.value || ''}
                            onChange={formField.onChange}
                            required={field.required}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
