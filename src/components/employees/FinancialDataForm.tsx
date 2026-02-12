// c:\Users\santa fe\Desktop\gestaorecursoshumanos\src\components\employees\FinancialDataForm.tsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Discount {
  description: string;
  amount: number;
}

interface FinancialDataProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function FinancialDataForm({ formData, setFormData }: FinancialDataProps) {
  const [newDiscountDesc, setNewDiscountDesc] = useState('');
  const [newDiscountValue, setNewDiscountValue] = useState('');

  // Garante que variable_discounts seja um array
  const discounts: Discount[] = Array.isArray(formData.variable_discounts) ? formData.variable_discounts : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;

    if (type === 'number') {
      val = parseFloat(value) || 0;
    }

    setFormData({ ...formData, [name]: val });
  };
  
  const handleInsalubrityChange = (value: string) => {
      const hasInsalubrity = value === 'yes';
      setFormData({
          ...formData, 
          has_insalubrity: hasInsalubrity,
          insalubrity_amount: hasInsalubrity ? formData.insalubrity_amount : 0
      });
  }

  const handleNightShiftChange = (value: string) => {
      const hasNightShift = value === 'yes';
      setFormData({
          ...formData, 
          has_night_shift: hasNightShift,
          night_shift_amount: hasNightShift ? formData.night_shift_amount : 0
      });
  }

  const addDiscount = () => {
    if (!newDiscountDesc || !newDiscountValue) return;
    const newDiscount: Discount = {
      description: newDiscountDesc,
      amount: parseFloat(newDiscountValue) || 0
    };
    
    setFormData({
      ...formData,
      variable_discounts: [...discounts, newDiscount]
    });

    setNewDiscountDesc('');
    setNewDiscountValue('');
  };

  const removeDiscount = (index: number) => {
    const newDiscounts = [...discounts];
    newDiscounts.splice(index, 1);
    setFormData({ ...formData, variable_discounts: newDiscounts });
  };

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-lg font-medium border-b pb-2">Dados Financeiros e Folha</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Salário Base */}
        <div className="space-y-2">
          <Label>Salário Base (R$)</Label>
          <Input
            type="number"
            name="base_salary"
            value={formData.base_salary || ''}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>

        {/* Chave PIX */}
        <div className="space-y-2">
          <Label>Chave PIX</Label>
          <Input
            type="text"
            name="pix_key"
            value={formData.pix_key || ''}
            onChange={handleInputChange}
            placeholder="CPF, Email ou Aleatória"
          />
        </div>

        {/* Salário Família */}
        <div className="space-y-2">
          <Label>Salário Família (R$)</Label>
          <Input
            type="number"
            name="family_salary_amount"
            value={formData.family_salary_amount || ''}
            onChange={handleInputChange}
          />
        </div>

        {/* Insalubridade */}
        <div className="col-span-1 md:col-span-2 bg-secondary/20 p-4 rounded-md border">
            <Label className="mb-2 block">Insalubridade</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <RadioGroup 
                    defaultValue={formData.has_insalubrity ? "yes" : "no"} 
                    onValueChange={handleInsalubrityChange}
                    className="flex items-center gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="insalubrity_no" />
                        <Label htmlFor="insalubrity_no">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="insalubrity_yes" />
                        <Label htmlFor="insalubrity_yes">Sim</Label>
                    </div>
                </RadioGroup>
                
                {formData.has_insalubrity && (
                    <div className="flex-1">
                        <Input
                            type="number"
                            name="insalubrity_amount"
                            value={formData.insalubrity_amount || ''}
                            onChange={handleInputChange}
                            placeholder="Valor R$"
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Adicional Noturno */}
        <div className="col-span-1 md:col-span-2 bg-secondary/20 p-4 rounded-md border">
            <Label className="mb-2 block">Adicional Noturno</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <RadioGroup 
                    defaultValue={formData.has_night_shift ? "yes" : "no"} 
                    onValueChange={handleNightShiftChange}
                    className="flex items-center gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="night_shift_no" />
                        <Label htmlFor="night_shift_no">Não</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="night_shift_yes" />
                        <Label htmlFor="night_shift_yes">Sim</Label>
                    </div>
                </RadioGroup>
                
                {formData.has_night_shift && (
                    <div className="flex-1">
                        <Input
                            type="number"
                            name="night_shift_amount"
                            value={formData.night_shift_amount || ''}
                            onChange={handleInputChange}
                            placeholder="Valor R$"
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Hora Extra */}
        <div className="space-y-2">
          <Label>Hora Extra (Valor R$)</Label>
          <Input
            type="number"
            name="overtime_amount"
            value={formData.overtime_amount || ''}
            onChange={handleInputChange}
          />
        </div>

        {/* Férias */}
        <div className="space-y-2">
          <Label>Férias (Valor R$)</Label>
          <Input
            type="number"
            name="vacation_amount"
            value={formData.vacation_amount || ''}
            onChange={handleInputChange}
          />
        </div>

        {/* Terço de Férias */}
        <div className="space-y-2">
          <Label>1/3 de Férias (Valor R$)</Label>
          <Input
            type="number"
            name="vacation_third_amount"
            value={formData.vacation_third_amount || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Seção de Descontos */}
      <div className="mt-6">
        <Label className="mb-2 block">Descontos Variáveis</Label>
        <div className="bg-secondary/20 p-4 rounded-md border">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newDiscountDesc}
              onChange={(e) => setNewDiscountDesc(e.target.value)}
              placeholder="Descrição (ex: Atraso, Vale)"
              className="flex-1"
            />
            <Input
              type="number"
              value={newDiscountValue}
              onChange={(e) => setNewDiscountValue(e.target.value)}
              placeholder="Valor R$"
              className="w-32"
            />
            <Button
              type="button"
              onClick={addDiscount}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {discounts.map((discount, index) => (
              <div key={index} className="flex justify-between items-center bg-background p-2 rounded border">
                <span className="text-sm">{discount.description}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-red-600">- R$ {discount.amount.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeDiscount(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {discounts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center italic">Nenhum desconto lançado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
