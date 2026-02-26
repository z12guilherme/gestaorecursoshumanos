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
import { Plus, Trash2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: Partial<Employee>) => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSave }: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    contractType: 'CLT',
    status: 'active',
    hireDate: '',
    birthDate: '',
    baseSalary: 0,
    fixedDiscounts: 0,
    contractedHours: 220,
    hasInsalubrity: false,
    hasNightShift: false,
    pisPasep: '',
    pixKey: '',
    vacationDueDate: '',
    vacationLimitDate: '',
    variable_discounts: [],
    variable_additions: [],
    avatar_url: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        contractType: 'CLT',
        status: 'active',
        hireDate: '',
        birthDate: '',
        baseSalary: 0,
        fixedDiscounts: 0,
        contractedHours: 220,
        hasInsalubrity: false,
        hasNightShift: false,
        pisPasep: '',
        pixKey: '',
        vacationDueDate: '',
        vacationLimitDate: '',
        variable_discounts: [],
        variable_additions: [],
        avatar_url: '',
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: employee ? 'Colaborador atualizado' : 'Colaborador cadastrado',
      description: `${formData.name} foi ${employee ? 'atualizado' : 'cadastrado'} com sucesso.`,
    });
    onOpenChange(false);
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
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                value={formData.contractType}
                onValueChange={(value) => setFormData({ ...formData, contractType: value as Employee['contractType'] })}
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
              <Label htmlFor="hireDate">Data de Admissão</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
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
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixedDiscounts">Descontos Fixos (R$)</Label>
              <Input
                id="fixedDiscounts"
                type="number"
                step="0.01"
                value={formData.fixedDiscounts}
                onChange={(e) => setFormData({ ...formData, fixedDiscounts: parseFloat(e.target.value) })}
              />
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
                value={formData.contractedHours}
                onChange={(e) => setFormData({ ...formData, contractedHours: parseInt(e.target.value) })}
                placeholder="Ex: 220"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasInsalubrity">Insalubridade</Label>
              <Select
                value={formData.hasInsalubrity ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, hasInsalubrity: value === "yes" })}
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
            {formData.hasInsalubrity && (
              <div className="space-y-2">
                <Label htmlFor="insalubrityAmount">Valor Insalubridade (R$)</Label>
                <Input
                  id="insalubrityAmount"
                  type="number"
                  step="0.01"
                  value={(formData as any).insalubrityAmount || ''}
                  onChange={(e) => setFormData({ ...formData, insalubrityAmount: parseFloat(e.target.value) } as any)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="hasNightShift">Adicional Noturno</Label>
              <Select
                value={formData.hasNightShift ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, hasNightShift: value === "yes" })}
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
            {formData.hasNightShift && (
              <div className="space-y-2">
                <Label htmlFor="nightShiftAmount">Valor Adicional Noturno (R$)</Label>
                <Input
                  id="nightShiftAmount"
                  type="number"
                  step="0.01"
                  value={(formData as any).nightShiftAmount || ''}
                  onChange={(e) => setFormData({ ...formData, nightShiftAmount: parseFloat(e.target.value) } as any)}
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
                value={formData.pisPasep || ''}
                onChange={(e) => setFormData({ ...formData, pisPasep: e.target.value })}
                placeholder="000.00000.00-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={formData.pixKey || ''}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="CPF, Email ou Aleatória"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacationDueDate">Vencimento Férias</Label>
              <Input
                id="vacationDueDate"
                type="date"
                value={formData.vacationDueDate || ''}
                onChange={(e) => setFormData({ ...formData, vacationDueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacationLimitDate">Limite para Gozo</Label>
              <Input
                id="vacationLimitDate"
                type="date"
                value={formData.vacationLimitDate || ''}
                onChange={(e) => setFormData({ ...formData, vacationLimitDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {employee ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
