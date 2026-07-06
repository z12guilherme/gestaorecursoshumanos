import type jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Employee } from "@/hooks/useEmployees"; // Usando o tipo unificado
import { Settings } from "@/hooks/useSettings";

// Interface para os dados completos necessários para o holerite
export type FullEmployee = Employee & {
  base_salary?: number;
  family_salary_amount?: number;
  insalubrity_amount?: number;
  night_shift_amount?: number;
  overtime_amount?: number;
  vacation_amount?: number;
  vacation_third_amount?: number;
  fixed_discounts?: number;
  inss_value?: number;
  variable_discounts?: any;
  variable_additions?: any;
};

interface PayslipPdfOptions {
  employee: FullEmployee;
  referenceDate: Date;
  settings: Settings | null;
  logoBase64: string | null;
  signatureData?: any;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
};

const parseJsonbField = (field: any): any[] => {
  try {
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      const parsed = JSON.parse(field);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    }
    return [];
  } catch {
    return [];
  }
};

export const generatePayslipDocument = async (options: PayslipPdfOptions): Promise<jsPDF> => {
  const { employee, referenceDate, settings, logoBase64, signatureData } = options;

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  const companyName = settings?.company_name || "Empresa";
  const companyCNPJ = settings?.cnpj || "";
  const hasLogo = logoBase64 && logoBase64 !== "ERROR";

  // --- Cabeçalho ---
  if (hasLogo && logoBase64) {
    const format = logoBase64.toLowerCase().includes("png") ? "PNG" : "JPEG";
    doc.addImage(logoBase64, format, 14, 10, 25, 15);
  }

  const headerTextX = hasLogo ? 42 : 14;

  doc.setFontSize(12).setFont("helvetica", "bold").text(companyName, headerTextX, 15);
  if (companyCNPJ) {
    doc.setFontSize(9).setFont("helvetica", "normal").text(`CNPJ: ${companyCNPJ}`, headerTextX, 20);
  }

  doc
    .setFontSize(12)
    .setFont("helvetica", "bold")
    .text("RECIBO DE PAGAMENTO", 196, 15, { align: "right" });
  const period = format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase();
  doc
    .setFontSize(9)
    .setFont("helvetica", "normal")
    .text(`Referência: ${period}`, 196, 20, { align: "right" });

  // --- Caixa de Dados do Funcionário ---
  const boxY = 25;
  doc.setFillColor(250, 250, 250).rect(14, boxY, 182, 14, "F");
  doc.rect(14, boxY, 182, 14);

  doc.setFontSize(7).setTextColor(100);
  doc.text("CÓDIGO", 16, boxY + 4);
  doc.text("NOME DO FUNCIONÁRIO", 35, boxY + 4);
  doc.text("CARGO", 115, boxY + 4);
  doc.text("DEPARTAMENTO", 160, boxY + 4);

  doc.setFontSize(9).setTextColor(0).setFont("helvetica", "bold");
  doc.text(employee.id.substring(0, 6).toUpperCase(), 16, boxY + 10);
  doc.text(employee.name.toUpperCase().substring(0, 35), 35, boxY + 10);
  doc.text((employee.role?.toUpperCase() || "-").substring(0, 25), 115, boxY + 10);
  doc.text((employee.department?.toUpperCase() || "-").substring(0, 15), 160, boxY + 10);

  // --- Preparação dos Dados Financeiros ---
  const earnings = [
    { desc: "SALÁRIO BASE", value: Number(employee.base_salary || 0) },
    { desc: "HORAS EXTRAS", value: Number(employee.overtime_amount || 0) },
    { desc: "ADICIONAL NOTURNO", value: Number(employee.night_shift_amount || 0) },
    { desc: "INSALUBRIDADE", value: Number(employee.insalubrity_amount || 0) },
    { desc: "SALÁRIO FAMÍLIA", value: Number(employee.family_salary_amount || 0) },
    { desc: "FÉRIAS", value: Number(employee.vacation_amount || 0) },
    { desc: "1/3 FÉRIAS", value: Number(employee.vacation_third_amount || 0) },
  ].filter((item) => item.value > 0);

  const varAdditions = parseJsonbField(employee.variable_additions);
  varAdditions.forEach((d: any) => {
    let val = Number(d.value);
    if (isNaN(val) && typeof d.value === "string") val = Number(d.value.replace(",", "."));
    if (!isNaN(val) && val > 0) {
      earnings.push({
        desc: d.description ? d.description.toUpperCase() : "GRATIFICAÇÃO",
        value: val,
      });
    }
  });

  const discounts = [{ desc: "DESCONTOS FIXOS", value: Number(employee.fixed_discounts || 0) }];
  const hasManualInss = employee.inss_value !== undefined && employee.inss_value !== null;
  if (hasManualInss) {
    discounts.push({
      desc: `INSS (${format(referenceDate, "yyyy")})`,
      value: Number(employee.inss_value),
    });
  }

  const varDiscounts = parseJsonbField(employee.variable_discounts);
  varDiscounts.forEach((d: any) => {
    let val = Number(d.value);
    if (isNaN(val) && typeof d.value === "string") val = Number(d.value.replace(",", "."));
    if (!isNaN(val) && val > 0) {
      const description = d.description ? d.description.toUpperCase() : "OUTROS DESCONTOS";
      if (description.includes("INSS") && hasManualInss) return;
      discounts.push({ desc: description, value: val });
    }
  });

  const rows: any[] = [];
  earnings.forEach((e) => rows.push(["001", e.desc, "0,00", formatCurrency(e.value), "0,00"]));
  discounts.forEach((d) => rows.push(["002", d.desc, "0,00", "0,00", formatCurrency(d.value)]));

  const totalEarnings = earnings.reduce((acc, curr) => acc + curr.value, 0);
  const totalDiscounts = discounts.reduce((acc, curr) => acc + curr.value, 0);
  const netPay = totalEarnings - totalDiscounts;

  const nonIncidentalValue = Number(employee.family_salary_amount) || 0;
  const calculationBase = Math.max(0, totalEarnings - nonIncidentalValue);

  // --- Tabela ---
  autoTable(doc, {
    startY: boxY + 18,
    head: [["Cód.", "Descrição", "Ref.", "Vencimentos", "Descontos"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.1 },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 20,
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // --- Rodapé e Totais ---
  doc.setDrawColor(0).setLineWidth(0.1).line(14, finalY, 196, finalY);
  doc
    .setFontSize(9)
    .setFont("helvetica", "bold")
    .text("TOTAIS", 120, finalY + 6);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(totalEarnings), 164, finalY + 6, { align: "right" });
  doc.text(formatCurrency(totalDiscounts), 194, finalY + 6, { align: "right" });

  const netY = finalY + 10;
  doc.setFillColor(245, 245, 245).rect(14, netY, 182, 12, "F");
  doc.rect(14, netY, 182, 12);
  doc
    .setFontSize(10)
    .setFont("helvetica", "bold")
    .text("LÍQUIDO A RECEBER", 16, netY + 7.5);
  doc.setFontSize(12).text(formatCurrency(netPay), 194, netY + 7.5, { align: "right" });

  // --- Rodapé Informativo (Bases de Cálculo) ---
  const footerInfoY = netY + 16;
  const boxWidth = 182 / 4;

  doc.setFontSize(6).setFont("helvetica", "normal");
  const bases = [
    { label: "Salário Base", value: formatCurrency(Number(employee.base_salary || 0)) },
    { label: "Sal. Contr. INSS", value: formatCurrency(calculationBase) },
    { label: "Base Cálc. FGTS", value: formatCurrency(calculationBase) },
    { label: "FGTS do Mês (8%)", value: formatCurrency(calculationBase * 0.08) },
  ];

  bases.forEach((item, index) => {
    const x = 14 + index * boxWidth;
    doc.rect(x, footerInfoY, boxWidth, 10);
    doc.text(item.label, x + 2, footerInfoY + 3);
    doc
      .setFont("helvetica", "bold")
      .text(item.value, x + boxWidth - 2, footerInfoY + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
  });

  // Assinatura e Declaração
  const footerY = footerInfoY + 20;
  doc.setFontSize(8).setFont("helvetica", "normal");

  doc.text(
    `Declaramos ter recebido a importância líquida de ${formatCurrency(netPay)}, referente ao pagamento do salário do mês acima.`,
    14,
    footerY
  );

  const displayDate = signatureData?.signed_at
    ? format(new Date(signatureData.signed_at), "dd/MM/yyyy")
    : "____/____/________";
  doc.text(`Data: ${displayDate}`, 14, footerY + 12);

  // --- Assinatura da Empresa (Estática/Simulada) ---
  doc
    .setFont("helvetica", "bold")
    .text(companyName.toUpperCase(), 50, footerY + 16, { align: "center" });
  doc.line(20, footerY + 12, 80, footerY + 12);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(6)
    .text("ASSINATURA DO EMPREGADOR", 50, footerY + 19, { align: "center" });

  // --- Assinatura do Funcionário ---
  doc.line(110, footerY + 12, 190, footerY + 12);
  doc.setFontSize(8).text("Assinatura do Funcionário", 150, footerY + 16, { align: "center" });

  // --- Carimbo de Assinatura Digital (Se assinado) ---
  if (signatureData) {
    if (signatureData.signature_image) {
      doc.addImage(signatureData.signature_image, "PNG", 130, footerY - 2, 40, 15);
    }

    const signY = footerY + 22;
    doc.setDrawColor(0, 100, 0);
    doc.setTextColor(0, 100, 0);
    doc.setFontSize(6);

    const signDate = signatureData.signed_at
      ? format(new Date(signatureData.signed_at), "dd/MM/yyyy 'às' HH:mm:ss")
      : format(new Date(), "dd/MM/yyyy HH:mm:ss");

    doc.setFont("helvetica", "bold").text("ASSINADO DIGITALMENTE", 110, signY);
    doc.setFont("helvetica", "normal");
    doc.text(`Hash: ${signatureData.id}`, 110, signY + 3);
    doc.text(`Data: ${signDate}`, 110, signY + 6);
  }

  return doc;
};
