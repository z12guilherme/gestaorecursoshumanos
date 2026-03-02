import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { Download, Calculator, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PayslipButton } from '@/components/PayslipButton';
import { supabase } from '@/lib/supabase';
import { payrollExportService } from '@/services/payrollExportService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Payroll() {
  const { employees: dbEmployees, loading } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mapeia os dados do banco (snake_case) para o formato esperado (camelCase)
  const employees = dbEmployees.map((emp: any) => {
    // Garante que os campos JSON sejam arrays, mesmo se vierem como string do banco
    let varDiscounts = [];
    try { varDiscounts = typeof emp.variable_discounts === 'string' ? JSON.parse(emp.variable_discounts) : (emp.variable_discounts || []); } catch { varDiscounts = []; }

    let varAdditions = [];
    try { varAdditions = typeof emp.variable_additions === 'string' ? JSON.parse(emp.variable_additions) : (emp.variable_additions || []); } catch { varAdditions = []; }

    return {
      ...emp,
      baseSalary: emp.base_salary || 0,
      contractedHours: emp.contracted_hours || 220,
      hasInsalubrity: emp.has_insalubrity || false,
      hasNightShift: emp.has_night_shift || false,
      fixedDiscounts: emp.fixed_discounts || 0,
      variable_discounts: varDiscounts,
      variable_additions: varAdditions
    };
  });

  // Estado local para horas extras (simulação de input mensal)
  const [overtimeData, setOvertimeData] = useState<Record<string, number>>({});

  const handleOvertimeChange = (id: string, hours: string) => {
    setOvertimeData(prev => ({ ...prev, [id]: Number(hours) || 0 }));
  };

  // Constantes de Cálculo (Exemplos)
  const MINIMUM_WAGE = 1412.00; // Salário Mínimo 2024
  const INSALUBRITY_RATE = 0.20; // 20% (Grau Médio)
  const NIGHT_SHIFT_RATE = 0.20; // 20%

  // Estado para armazenar a tabela do INSS (pode vir do banco)
  const [inssTable, setInssTable] = useState([
    { limit: 1621.00, rate: 0.075 },
    { limit: 2902.84, rate: 0.09 },
    { limit: 4354.27, rate: 0.12 },
    { limit: 8475.55, rate: 0.14 }
  ]);

  // Buscar tabela atualizada do banco ao carregar
  useEffect(() => {
    const fetchTaxTable = async () => {
      const { data } = await supabase
        .from('payroll_configurations')
        .select('value')
        .eq('key', 'inss_table')
        .single();
      
      if (data && Array.isArray(data.value)) {
        setInssTable(data.value);
      }
    };
    fetchTaxTable();
  }, []);

  // Função para cálculo progressivo do INSS (Dinâmica)
  const calculateINSS = (grossSalary: number) => {
    let discount = 0;
    let previousLimit = 0;

    for (const range of inssTable) {
      if (grossSalary > previousLimit) {
        // Calcula a parcela do salário que cai nesta faixa
        const salaryInThisRange = Math.min(grossSalary, range.limit) - previousLimit;
        discount += salaryInThisRange * range.rate;
        previousLimit = range.limit;
      } else {
        break;
      }
    }

    return discount;
  };

  const calculatePayroll = (employee: any) => {
    const baseSalary = Number(employee.baseSalary) || 0;
    const hours = Number(employee.contractedHours) || 220;
    const hourlyRate = hours > 0 ? baseSalary / hours : 0;
    
    // Adicionais
    const insalubrity = employee.hasInsalubrity ? (Number(employee.insalubrity_amount) || 0) : 0;
    const nightShift = employee.hasNightShift ? (Number(employee.night_shift_amount) || 0) : 0;
    
    // Horas Extras (50% de acréscimo exemplo)
    const overtimeHours = overtimeData[employee.id] || 0;
    const overtimeValue = overtimeHours * hourlyRate * 1.5;

    // Descontos
    const discounts = Number(employee.fixedDiscounts) || 0;

    // Adicionais Variáveis
    let variableAdditionsTotal = 0;
    try {
      const additions = Array.isArray(employee.variable_additions) ? employee.variable_additions : [];
      variableAdditionsTotal = additions.reduce((acc: number, curr: any) => {
        let val = Number(curr.value);
        if (isNaN(val) && typeof curr.value === 'string') { val = Number(curr.value.replace(',', '.')); }
        return acc + (val || 0);
      }, 0);
    } catch (e) {
      variableAdditionsTotal = 0;
    }

    const totalAdditions = insalubrity + nightShift + overtimeValue + variableAdditionsTotal;
    
    // Base de Cálculo do INSS (Salário Base + Adicionais)
    const inssBase = baseSalary + totalAdditions;
    const estimatedTax = employee.inss_value ? Number(employee.inss_value) : calculateINSS(inssBase);

    const totalDiscounts = discounts + estimatedTax;
    const netSalary = baseSalary + totalAdditions - totalDiscounts;

    return {
      baseSalary,
      insalubrity,
      nightShift,
      overtimeValue,
      totalDiscounts,
      netSalary,
      estimatedTax
    };
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Folha de Pagamento Mensal', 14, 22);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 30);

    const tableData = filteredEmployees.map(emp => {
      const calc = calculatePayroll(emp);
      return [
        emp.name,
        emp.role,
        calc.baseSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        calc.insalubrity.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        calc.overtimeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        calc.totalDiscounts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        calc.netSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ];
    });

    autoTable(doc, {
      head: [['Colaborador', 'Cargo', 'Salário Base', 'Insalub.', 'H. Extra', 'Descontos', 'Líquido']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('folha_pagamento.pdf');
  };

  const handleExportCNAB = () => {
    const dataToExport = filteredEmployees.map(emp => {
      const calc = calculatePayroll(emp);
      return {
        name: emp.name,
        cpf: emp.pis_pasep || '000.000.000-00', // Fallback caso não tenha CPF cadastrado
        netSalary: calc.netSalary,
        pixKey: emp.pix_key,
        // Dados bancários simulados (idealmente viriam do cadastro do colaborador)
        bankCode: '341',
        bankAgency: '0000',
        bankAccount: '00000-0'
      };
    });

    const fileContent = payrollExportService.generateCNAB240(dataToExport, {
      name: 'Empresa Demo LTDA',
      cnpj: '12.345.678/0001-90',
      bankCode: '341'
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remessa_salarios_${format(new Date(), 'yyyyMMdd')}.rem`;
    a.click();
  };

  const handleExportCSV = () => {
    const dataToExport = filteredEmployees.map(emp => {
      const calc = calculatePayroll(emp);
      return {
        name: emp.name,
        cpf: emp.pis_pasep || '',
        netSalary: calc.netSalary,
        pixKey: emp.pix_key
      };
    });

    const fileContent = payrollExportService.generateCSV(dataToExport);
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folha_pagamento_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  return (
    <AppLayout title="Salários e Pagamentos" subtitle="Gestão financeira e folha de ponto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <Input 
              placeholder="Buscar colaborador..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={generatePDF} className="cursor-pointer">
                Relatório PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                Arquivo CSV (Contabilidade)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCNAB} className="cursor-pointer">
                Arquivo CNAB 240 (Banco)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Cálculo de Folha (Estimativa)
            </CardTitle>
            <CardDescription>
              Insira as horas extras do mês para calcular o valor final.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Salário Base</TableHead>
                  <TableHead>Adicionais</TableHead>
                  <TableHead>Horas Extras</TableHead>
                  <TableHead>Descontos</TableHead>
                  <TableHead className="text-right">Salário Líquido</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Carregando dados...</TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Nenhum colaborador encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => {
                    const calc = calculatePayroll(emp);
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-xs text-muted-foreground">{emp.role}</div>
                        </TableCell>
                        <TableCell>R$ {calc.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {emp.hasInsalubrity && <Badge variant="outline" className="w-fit text-[10px] border-orange-200 bg-orange-50 text-orange-700">Insalubridade</Badge>}
                            {emp.hasNightShift && <Badge variant="outline" className="w-fit text-[10px] border-indigo-200 bg-indigo-50 text-indigo-700">Adc. Noturno</Badge>}
                            {!emp.hasInsalubrity && !emp.hasNightShift && <span className="text-xs text-muted-foreground">-</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              className="w-20 h-8" 
                              placeholder="0h"
                              min="0"
                              onChange={(e) => handleOvertimeChange(emp.id, e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">{calc.overtimeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-600">- R$ {calc.totalDiscounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          R$ {calc.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <PayslipButton 
                            employee={{
                              ...emp,
                              insalubrity_amount: calc.insalubrity,
                              night_shift_amount: calc.nightShift,
                              overtime_amount: calc.overtimeValue,
                              variable_additions: emp.variable_additions || [],
                              variable_discounts: [
                                ...(Array.isArray(emp.variable_discounts) ? emp.variable_discounts : []),
                                { description: "INSS (2026)", value: calc.estimatedTax }
                              ]
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}