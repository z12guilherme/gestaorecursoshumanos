// c:\Users\santa fe\Desktop\gestaorecursoshumanos\src\components\employees\FinancialDataForm.tsx
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FinancialDataProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function FinancialDataForm({ formData, setFormData }: FinancialDataProps) {
  return (
    <>
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
    </>
  );
}
