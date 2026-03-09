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

    // A função hash-password já trata o caso de a senha vir vazia (não atualiza)
    const { error } = await supabase.functions.invoke('hash-password', {
      body: { record: formData },
    });

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
      onSuccess();
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
            
            {/* Novos Campos Financeiros */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-4 text-muted-foreground">Dados Financeiros & Folha</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseSalary">Salário Base (R$)</Label>
              <Input
                id="baseSalary"
                type="number"
                step="0.01"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedDiscounts">Descontos Fixos (R$)</Label>
              <Input
                id="fixedDiscounts"
                type="number"
                step="0.01"
                value={formData.fixed_discounts}
                onChange={(e) => setFormData({ ...formData, fixed_discounts: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inss_value">INSS Manual (R$)</Label>
              <Input
                id="inss_value"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={(formData as any).inss_value || ''}
                onChange={(e) => setFormData({ ...formData, inss_value: parseFloat(e.target.value) } as any)}
              />
              <p className="text-[10px] text-muted-foreground">Se preenchido, substitui o cálculo automático.</p>
            </div>

            {/* Adicionais Variáveis */}
            <div className="col-span-2 space-y-3 border p-4 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-emerald-700 dark:text-emerald-300">Adicionais / Gratificações</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = (formData as any).variable_additions || [];
                    setFormData({ 
                      ...formData, 
                      variable_additions: [...current, { description: "", value: 0 }] 
                    } as any);
                  }}
                  className="h-7 text-xs gap-1 border-emerald-200 hover:bg-emerald-100 text-emerald-700"
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              
              {((formData as any).variable_additions || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nenhum adicional lançado.</p>
              )}

              {((formData as any).variable_additions || []).map((item: any, index: number) => (
                <div key={index} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="flex-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Descrição</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...((formData as any).variable_additions || [])];
                        newItems[index].description = e.target.value;
                        setFormData({ ...formData, variable_additions: newItems } as any);
                      }}
                      placeholder="Ex: Bônus Meta"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <Label className="text-[10px] uppercase text-muted-foreground">Valor (R$)</Label>
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => {
                        const newItems = [...((formData as any).variable_additions || [])];
                        newItems[index].value = Number(e.target.value);
                        setFormData({ ...formData, variable_additions: newItems } as any);
                      }}
                      placeholder="0.00"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      const newItems = ((formData as any).variable_additions || []).filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, variable_additions: newItems } as any);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Descontos Variáveis */}
            <div className="col-span-2 space-y-3 border p-4 rounded-md bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">Descontos Variáveis / Eventuais</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = (formData as any).variable_discounts || [];
                    setFormData({ 
                      ...formData, 
                      variable_discounts: [...current, { description: "", value: 0 }] 
                    } as any);
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              
              {((formData as any).variable_discounts || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nenhum desconto variável adicionado.</p>
              )}

              {((formData as any).variable_discounts || []).map((discount: any, index: number) => (
                <div key={index} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-1">
                  <div className="flex-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Descrição</Label>
                    <Input
                      value={discount.description}
                      onChange={(e) => {
                        const newDiscounts = [...((formData as any).variable_discounts || [])];
                        newDiscounts[index].description = e.target.value;
                        setFormData({ ...formData, variable_discounts: newDiscounts } as any);
                      }}
                      placeholder="Ex: Farmácia"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <Label className="text-[10px] uppercase text-muted-foreground">Valor (R$)</Label>
                    <Input
                      type="number"
                      value={discount.value}
                      onChange={(e) => {
                        const newDiscounts = [...((formData as any).variable_discounts || [])];
                        newDiscounts[index].value = Number(e.target.value);
                        setFormData({ ...formData, variable_discounts: newDiscounts } as any);
                      }}
                      placeholder="0.00"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      const newDiscounts = ((formData as any).variable_discounts || []).filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, variable_discounts: newDiscounts } as any);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractedHours">Carga Horária Mensal</Label>
              <Input
                id="contractedHours"
                type="number"
                value={formData.contracted_hours}
                onChange={(e) => setFormData({ ...formData, contracted_hours: parseInt(e.target.value) })}
                placeholder="Ex: 220"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasInsalubrity">Insalubridade</Label>
              <Select
                value={formData.has_insalubrity ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, has_insalubrity: value === "yes" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.has_insalubrity && (
              <div className="space-y-2">
                <Label htmlFor="insalubrityAmount">Valor Insalubridade (R$)</Label>
                <Input
                  id="insalubrityAmount"
                  type="number"
                  step="0.01"
                  value={formData.insalubrity_amount || ''}
                  onChange={(e) => setFormData({ ...formData, insalubrity_amount: parseFloat(e.target.value) })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="hasNightShift">Adicional Noturno</Label>
              <Select
                value={formData.has_night_shift ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, has_night_shift: value === "yes" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.has_night_shift && (
              <div className="space-y-2">
                <Label htmlFor="nightShiftAmount">Valor Adicional Noturno (R$)</Label>
                <Input
                  id="nightShiftAmount"
                  type="number"
                  step="0.01"
                  value={formData.night_shift_amount || ''}
                  onChange={(e) => setFormData({ ...formData, night_shift_amount: parseFloat(e.target.value) })}
                />
              </div>
            )}

            {/* Novos Campos de Documentação */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-4 text-muted-foreground">Documentação & Prazos</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pisPasep">PIS/PASEP</Label>
              <Input
                id="pisPasep"
                value={formData.pis_pasep || ''}
                onChange={(e) => setFormData({ ...formData, pis_pasep: e.target.value })}
                placeholder="000.00000.00-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={formData.pix_key || ''}
                onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                placeholder="CPF, Email ou Aleatória"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacationDueDate">Vencimento Férias</Label>
              <Input
                id="vacationDueDate"
                type="date"
                value={formData.vacation_due_date || ''}
                onChange={(e) => setFormData({ ...formData, vacation_due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacationLimitDate">Limite para Gozo</Label>
              <Input
                id="vacationLimitDate"
                type="date"
                value={formData.vacation_limit_date || ''}
                onChange={(e) => setFormData({ ...formData, vacation_limit_date: e.target.value })}
              />
            </div>
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
