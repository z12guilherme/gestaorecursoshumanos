import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definição da interface baseada nos campos do banco de dados (employees)
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  admission_date: string | Date;
  base_salary: number;
  family_salary_amount: number;
  insalubrity_amount: number;
  night_shift_amount: number;
  overtime_amount: number;
  vacation_amount: number;
  vacation_third_amount: number;
  fixed_discounts: number;
  variable_discounts: any; // jsonb no banco
}

interface PayslipButtonProps {
  employee: Employee;
  companyName?: string;
  companyCNPJ?: string;
  referenceDate?: Date;
}

export const PayslipButton: React.FC<PayslipButtonProps> = ({
  employee,
  companyName = "HOSPITAL DMI LTDA", // Você pode puxar isso do contexto de Settings futuramente
  companyCNPJ = "30.882.426/0001-87",
  referenceDate = new Date()
}) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const generatePayslip = () => {
    const doc = new jsPDF();

    // --- Cabeçalho ---
    // Lado Esquerdo: Empresa
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 14, 15);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`CNPJ: ${companyCNPJ}`, 14, 20);
    
    // Lado Direito: Título e Referência
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGAMENTO", 196, 15, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const period = format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase();
    doc.text(`Referência: ${period}`, 196, 20, { align: "right" });

    // --- Caixa de Dados do Funcionário ---
    const boxY = 25;
    doc.setDrawColor(0);
    doc.setFillColor(250, 250, 250);
    doc.rect(14, boxY, 182, 14, "F"); // Fundo
    doc.rect(14, boxY, 182, 14); // Borda

    // Rótulos
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text("CÓDIGO", 16, boxY + 4);
    doc.text("NOME DO FUNCIONÁRIO", 35, boxY + 4);
    doc.text("CARGO", 115, boxY + 4);
    doc.text("DEPARTAMENTO", 160, boxY + 4);

    // Valores
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    
    // Usando substring para evitar sobreposição se o texto for muito longo
    doc.text(employee.id.substring(0, 6).toUpperCase(), 16, boxY + 10);
    doc.text(employee.name.toUpperCase().substring(0, 35), 35, boxY + 10);
    doc.text((employee.role?.toUpperCase() || "-").substring(0, 25), 115, boxY + 10);
    doc.text((employee.department?.toUpperCase() || "-").substring(0, 15), 160, boxY + 10);

    // --- Preparação dos Dados Financeiros ---
    const earnings = [
      { desc: "SALÁRIO BASE", value: Number(employee.base_salary) },
      { desc: "HORAS EXTRAS", value: Number(employee.overtime_amount) },
      { desc: "ADICIONAL NOTURNO", value: Number(employee.night_shift_amount) },
      { desc: "INSALUBRIDADE", value: Number(employee.insalubrity_amount) },
      { desc: "SALÁRIO FAMÍLIA", value: Number(employee.family_salary_amount) },
      { desc: "FÉRIAS", value: Number(employee.vacation_amount) },
      { desc: "1/3 FÉRIAS", value: Number(employee.vacation_third_amount) },
    ].filter(item => item.value > 0);

    const discounts = [
      { desc: "DESCONTOS FIXOS (INSS/VT)", value: Number(employee.fixed_discounts) }
    ];

    // Processar descontos variáveis (JSONB)
    let varDiscounts: any[] = [];
    if (Array.isArray(employee.variable_discounts)) {
        varDiscounts = employee.variable_discounts;
    } else if (typeof employee.variable_discounts === 'string') {
        try { varDiscounts = JSON.parse(employee.variable_discounts); } catch (e) { varDiscounts = []; }
    }
    
    varDiscounts.forEach((d: any) => {
        if (d.value > 0) discounts.push({ desc: d.description || "DIVERSOS", value: Number(d.value) });
    });

    // Montar linhas da tabela
    const rows: any[] = [];
    earnings.forEach(e => rows.push(["001", e.desc, "", formatCurrency(e.value), "0,00"]));
    discounts.forEach(d => rows.push(["002", d.desc, "", "0,00", formatCurrency(d.value)]));

    const totalEarnings = earnings.reduce((acc, curr) => acc + curr.value, 0);
    const totalDiscounts = discounts.reduce((acc, curr) => acc + curr.value, 0);
    const netPay = totalEarnings - totalDiscounts;

    // --- Tabela ---
    autoTable(doc, {
      startY: boxY + 18,
      head: [['Cód.', 'Descrição', 'Ref.', 'Vencimentos', 'Descontos']],
      body: rows,
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: 20, 
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 12 }, 
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' }, 
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- Rodapé e Totais ---
    // Caixa de Totais
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, finalY, 182, 8, "F");
    doc.rect(14, finalY, 182, 8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    
    doc.text("TOTAIS", 120, finalY + 5.5);
    
    // Alinhamento manual com as colunas da tabela (margem direita 14, col 4 width 30, col 3 width 30)
    // Coluna Descontos termina em 196 (210 - 14). Centro ~181.
    // Coluna Vencimentos termina em 166. Centro ~151.
    doc.text(formatCurrency(totalEarnings), 164, finalY + 5.5, { align: "right" });
    doc.text(formatCurrency(totalDiscounts), 194, finalY + 5.5, { align: "right" });

    // Caixa Líquido
    const netY = finalY + 12;
    doc.setFillColor(255, 255, 255);
    doc.rect(14, netY, 182, 12); // Caixa transparente ou branca
    
    doc.setFontSize(9);
    doc.text("LÍQUIDO A RECEBER", 16, netY + 8);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(netPay), 194, netY + 8, { align: "right" });

    // Assinatura e Declaração
    const footerY = netY + 25;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Declaramos ter recebido a importância líquida de ${formatCurrency(netPay)}, referente ao pagamento do salário do mês acima.`, 14, footerY);
    
    doc.text(`Data: ____/____/________`, 14, footerY + 15);
    
    doc.line(100, footerY + 15, 190, footerY + 15);
    doc.text("Assinatura do Funcionário", 145, footerY + 20, { align: "center" });

    doc.save(`Holerite_${employee.name.replace(/\s+/g, '_')}_${format(referenceDate, 'MM-yyyy')}.pdf`);
  };

  return (
    <Button onClick={generatePayslip} variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Holerite PDF
    </Button>
  );
};