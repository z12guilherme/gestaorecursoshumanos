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
  companyName = "Empresa Modelo Ltda", // Você pode puxar isso do contexto de Settings futuramente
  companyCNPJ = "00.000.000/0001-00",
  referenceDate = new Date()
}) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const generatePayslip = () => {
    const doc = new jsPDF();

    // --- Cabeçalho ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 14, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CNPJ: ${companyCNPJ}`, 14, 20);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGAMENTO DE SALÁRIO", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const period = format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase();
    doc.text(`Referência: ${period}`, 195, 20, { align: "right" });

    // --- Caixa de Dados do Funcionário ---
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 25, 182, 15, "F"); // Fundo
    doc.rect(14, 25, 182, 15); // Borda

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("CÓDIGO", 16, 29);
    doc.text("NOME DO FUNCIONÁRIO", 40, 29);
    doc.text("CARGO", 120, 29);
    doc.text("DEPARTAMENTO", 160, 29);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(employee.id.substring(0, 6).toUpperCase(), 16, 35); // Código fictício usando parte do ID
    doc.text(employee.name.toUpperCase(), 40, 35);
    doc.text(employee.role?.toUpperCase() || "-", 120, 35);
    doc.text(employee.department?.toUpperCase() || "-", 160, 35);

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
      startY: 45,
      head: [['Cód.', 'Descrição', 'Ref.', 'Vencimentos', 'Descontos']],
      body: rows,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 15 }, 1: { cellWidth: 80 }, 2: { cellWidth: 15 },
        3: { cellWidth: 35, halign: 'right' }, 4: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- Rodapé e Totais ---
    doc.setDrawColor(0);
    doc.line(14, finalY + 2, 196, finalY + 2);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    
    doc.text("Total Vencimentos", 110, finalY + 8);
    doc.text(formatCurrency(totalEarnings), 145, finalY + 8, { align: "right" });
    
    doc.text("Total Descontos", 160, finalY + 8);
    doc.text(formatCurrency(totalDiscounts), 195, finalY + 8, { align: "right" });

    // Caixa Líquido
    doc.setFillColor(230, 230, 230);
    doc.rect(140, finalY + 12, 56, 12, "F");
    doc.rect(140, finalY + 12, 56, 12);
    doc.setFontSize(11);
    doc.text("LÍQUIDO A RECEBER", 142, finalY + 20);
    doc.text(formatCurrency(netPay), 194, finalY + 20, { align: "right" });

    // Assinatura
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Declaramos ter recebido a importância líquida de ${formatCurrency(netPay)}`, 14, pageHeight - 40);
    doc.text(`Data: ____/____/________`, 14, pageHeight - 30);
    doc.line(100, pageHeight - 30, 190, pageHeight - 30);
    doc.text("Assinatura do Funcionário", 145, pageHeight - 25, { align: "center" });

    doc.save(`Holerite_${employee.name.replace(/\s+/g, '_')}_${format(referenceDate, 'MM-yyyy')}.pdf`);
  };

  return (
    <Button onClick={generatePayslip} variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Holerite PDF
    </Button>
  );
};