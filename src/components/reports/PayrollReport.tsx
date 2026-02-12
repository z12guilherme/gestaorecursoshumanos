// c:\Users\santa fe\Desktop\gestaorecursoshumanos\src\components\reports\PayrollReport.tsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { isSameDay, endOfMonth } from 'date-fns';

export default function PayrollReport() {
  const [loading, setLoading] = useState(false);
  const isLastDay = isSameDay(new Date(), endOfMonth(new Date()));

  const generatePayrollData = async () => {
    setLoading(true);
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active'); // Assuming 'active' is the status in DB

      if (error) throw error;

      const reportData = employees.map(emp => {
        const base = Number(emp.base_salary || 0);
        const family = Number(emp.family_salary_amount || 0);
        const insalubrity = Number(emp.insalubrity_amount || 0);
        const night = Number(emp.night_shift_amount || 0);
        const overtime = Number(emp.overtime_amount || 0);
        const vacation = Number(emp.vacation_amount || 0);
        const vacationThird = Number(emp.vacation_third_amount || 0);
        
        // Calcular total de descontos variáveis
        const discounts = Array.isArray(emp.variable_discounts) ? emp.variable_discounts : [];
        const totalVariableDiscounts = discounts.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
        const fixedDiscounts = Number(emp.fixed_discounts || 0);

        const totalEarnings = base + family + insalubrity + night + overtime + vacation + vacationThird;
        const totalDeductions = totalVariableDiscounts + fixedDiscounts;
        const netSalary = totalEarnings - totalDeductions;

        return {
          Nome: emp.name,
          Cargo: emp.role,
          'Chave PIX': emp.pix_key || 'N/A',
          'Salário Base': base,
          'Salário Família': family,
          'Insalubridade': insalubrity,
          'Adc. Noturno': night,
          'Hora Extra': overtime,
          'Férias': vacation,
          '1/3 Férias': vacationThird,
          'Descontos Variáveis': totalVariableDiscounts,
          'Descontos Fixos': fixedDiscounts,
          'Total Proventos': totalEarnings,
          'Total Descontos': totalDeductions,
          'Salário Líquido': netSalary
        };
      });

      return reportData;
    } catch (error) {
      console.error('Erro ao gerar folha:', error);
      alert('Erro ao gerar dados da folha.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const data = await generatePayrollData();
    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Folha de Pagamento");
    XLSX.writeFile(wb, `Folha_Pagamento_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const closeMonth = async () => {
    if (!confirm("Tem certeza? Isso irá ZERAR todos os valores variáveis (horas extras, descontos variáveis, etc) de todos os funcionários, mantendo apenas o salário base. Exporte a planilha antes!")) {
      return;
    }

    setLoading(true);
    try {
      // Zera os campos variáveis
      const { error } = await supabase
        .from('employees')
        .update({
          family_salary_amount: 0,
          night_shift_amount: 0,
          overtime_amount: 0,
          vacation_amount: 0,
          vacation_third_amount: 0,
          variable_discounts: [] // Zera a lista de descontos variáveis
        })
        .eq('status', 'active');

      if (error) throw error;
      alert("Mês fechado com sucesso! Valores variáveis foram reiniciados.");
    } catch (error) {
      console.error(error);
      alert("Erro ao fechar o mês.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Gestão de Folha de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        {isLastDay && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Atenção: Hoje é o último dia do mês!</p>
              <p className="text-sm">Recomendamos exportar a folha de pagamento agora e realizar o fechamento do mês para zerar as variáveis (horas extras, etc) para o próximo ciclo.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={exportToExcel}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Folha (Excel)
          </Button>

          <Button
            onClick={closeMonth}
            disabled={loading}
            variant="destructive"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Fechar Mês (Zerar Variáveis)
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          * O fechamento do mês zera horas extras, adicionais variáveis e descontos pontuais, mantendo o salário base e dados cadastrais.
        </p>
      </CardContent>
    </Card>
  );
}
