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
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  useFieldArray,
} from 'react-hook-form';
import type { EmployeeFormData } from '@/lib/schemas';

interface FinancialDataProps {
  control: Control<EmployeeFormData>;
  register: UseFormRegister<EmployeeFormData>;
  errors: FieldErrors<EmployeeFormData>;
  watch: UseFormWatch<EmployeeFormData>;
  setValue: UseFormSetValue<EmployeeFormData>;
}

export default function FinancialDataForm({ control, register, errors, watch, setValue }: FinancialDataProps) {
  const hasInsalubrity = watch('has_insalubrity');
  const hasNightShift = watch('has_night_shift');

  const {
    fields: additionFields,
    append: appendAddition,
    remove: removeAddition,
  } = useFieldArray({ control, name: 'variable_additions' });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({ control, name: 'variable_discounts' });

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
          {...register('base_salary', { valueAsNumber: true })}
        />
        {errors.base_salary && <p className="text-xs text-red-500 mt-1">{errors.base_salary.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="fixedDiscounts">Descontos Fixos (R$)</Label>
        <Input
          id="fixedDiscounts"
          type="number"
          step="0.01"
          {...register('fixed_discounts', { valueAsNumber: true })}
        />
        {errors.fixed_discounts && <p className="text-xs text-red-500 mt-1">{errors.fixed_discounts.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="inss_value">INSS Manual (R$)</Label>
        <Controller
          control={control}
          name="inss_value"
          render={({ field }) => (
            <Input
              id="inss_value"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={field.value !== undefined && field.value !== null ? field.value : ''}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === "" ? null : parseFloat(val));
              }}
            />
          )}
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
            onClick={() => appendAddition({ description: "", value: 0 })}
            className="h-7 text-xs gap-1 border-emerald-200 hover:bg-emerald-100 text-emerald-700"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </div>

        {additionFields.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nenhum adicional lançado.</p>
        )}

        {additionFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-1">
            <div className="flex-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Descrição</Label>
              <Input
                {...register(`variable_additions.${index}.description`)}
                placeholder="Ex: Bônus Meta"
                className="h-8 text-sm"
              />
            </div>
            <div className="w-28">
              <Label className="text-[10px] uppercase text-muted-foreground">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`variable_additions.${index}.value`, { valueAsNumber: true })}
                placeholder="0.00"
                className="h-8 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => removeAddition(index)}
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
            onClick={() => appendDiscount({ description: "", value: 0 })}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </div>

        {discountFields.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Nenhum desconto variável adicionado.</p>
        )}

        {discountFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-1">
            <div className="flex-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Descrição</Label>
              <Input
                {...register(`variable_discounts.${index}.description`)}
                placeholder="Ex: Farmácia"
                className="h-8 text-sm"
              />
            </div>
            <div className="w-28">
              <Label className="text-[10px] uppercase text-muted-foreground">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`variable_discounts.${index}.value`, { valueAsNumber: true })}
                placeholder="0.00"
                className="h-8 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => removeDiscount(index)}
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
          {...register('contracted_hours', { valueAsNumber: true })}
          placeholder="Ex: 220"
        />
        {errors.contracted_hours && <p className="text-xs text-red-500 mt-1">{errors.contracted_hours.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hasInsalubrity">Insalubridade</Label>
        <Controller
          control={control}
          name="has_insalubrity"
          render={({ field }) => (
            <Select
              value={field.value ? "yes" : "no"}
              onValueChange={(value) => field.onChange(value === "yes")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Não</SelectItem>
                <SelectItem value="yes">Sim</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {hasInsalubrity && (
        <div className="space-y-2">
          <Label htmlFor="insalubrityAmount">Valor Insalubridade (R$)</Label>
          <Input
            id="insalubrityAmount"
            type="number"
            step="0.01"
            {...register('insalubrity_amount', { valueAsNumber: true })}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="hasNightShift">Adicional Noturno</Label>
        <Controller
          control={control}
          name="has_night_shift"
          render={({ field }) => (
            <Select
              value={field.value ? "yes" : "no"}
              onValueChange={(value) => field.onChange(value === "yes")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Não</SelectItem>
                <SelectItem value="yes">Sim</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {hasNightShift && (
        <div className="space-y-2">
          <Label htmlFor="nightShiftAmount">Valor Adicional Noturno (R$)</Label>
          <Input
            id="nightShiftAmount"
            type="number"
            step="0.01"
            {...register('night_shift_amount', { valueAsNumber: true })}
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
          {...register('pis_pasep')}
          placeholder="000.00000.00-0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pixKey">Chave PIX</Label>
        <Input
          id="pixKey"
          {...register('pix_key')}
          placeholder="CPF, Email ou Aleatória"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vacationDueDate">Vencimento Férias</Label>
        <Input
          id="vacationDueDate"
          type="date"
          {...register('vacation_due_date')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vacationLimitDate">Limite para Gozo</Label>
        <Input
          id="vacationLimitDate"
          type="date"
          {...register('vacation_limit_date')}
        />
      </div>
    </>
  );
}
