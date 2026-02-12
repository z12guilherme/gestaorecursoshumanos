import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, differenceInMinutes, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TimeSheetReport() {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const generateTimeSheetData = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth)));
      const endDate = endOfMonth(startDate);

      // 1. Buscar funcionários ativos
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*')
        .in('status', ['Ativo', 'active']);

      if (empError) throw empError;

      // 2. Buscar registros de ponto do mês selecionado
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (entriesError) throw entriesError;

      // 3. Processar dados por funcionário
      const reportData = employees.map(emp => {
        const empEntries = entries.filter(e => e.employee_id === emp.id);
        
        let totalMinutesWorked = 0;
        
        // Agrupar registros por dia (YYYY-MM-DD)
        const entriesByDay: Record<string, any[]> = {};
        empEntries.forEach(entry => {
            const day = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
            if (!entriesByDay[day]) entriesByDay[day] = [];
            entriesByDay[day].push(entry);
        });

        // Calcular horas trabalhadas em cada dia
        Object.keys(entriesByDay).forEach(day => {
            const dayEntries = entriesByDay[day];
            // Ordenar por horário para garantir a sequência correta
            dayEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            let startTime: Date | null = null;

            // Lógica: Entrada/FimAlmoço inicia contagem, Saída/InícioAlmoço para contagem
            dayEntries.forEach(entry => {
                const time = parseISO(entry.timestamp);
                
                if (entry.type === 'in' || entry.type === 'lunch_end') {
                    if (!startTime) startTime = time;
                } else if (entry.type === 'out' || entry.type === 'lunch_start') {
                    if (startTime) {
                        totalMinutesWorked += differenceInMinutes(time, startTime);
                        startTime = null;
                    }
                }
            });
        });

        const totalHoursWorked = totalMinutesWorked / 60;
        const contractedHours = Number(emp.contracted_hours) || 0; // Carga horária mensal contratada
        const balance = totalHoursWorked - contractedHours;

        return {
          'Funcionário': emp.name,
          'Departamento': emp.department || 'N/A',
          'Mês/Ano': `${parseInt(selectedMonth) + 1}/${selectedYear}`,
          'Horas Contratadas': contractedHours.toFixed(2),
          'Horas Trabalhadas': totalHoursWorked.toFixed(2),
          'Saldo de Horas': balance.toFixed(2),
          'Status Saldo': balance >= 0 ? 'Positivo (Crédito)' : 'Negativo (Débito)'
        };
      });

      return reportData;

    } catch (error) {
      console.error('Erro ao gerar relatório de ponto:', error);
      alert('Erro ao gerar dados do ponto. Verifique o console.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const data = await generateTimeSheetData();
    if (data.length === 0) {
        alert("Nenhum dado encontrado para o período selecionado ou erro na geração.");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Ponto");
    XLSX.writeFile(wb, `Ponto_Mensal_${parseInt(selectedMonth) + 1}_${selectedYear}.xlsx`);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Relatório de Ponto Mensal (Saldo de Horas)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mês de Referência</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={exportToExcel}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Gerando...' : 'Exportar Saldo de Horas (Excel)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
