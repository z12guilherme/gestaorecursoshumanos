import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Employee } from '@/hooks/useEmployees'; // Usando o tipo base, mas ciente que mais campos virão
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Download } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface PayslipViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  referenceDate: Date;
}

// Tipo estendido para incluir todos os campos financeiros
type FullEmployee = Employee & {
  base_salary?: number;
  insalubrity_amount?: number;
  night_shift_amount?: number;
  overtime_amount?: number;
  family_salary_amount?: number;
  variable_additions?: { description: string; value: number }[];
  variable_discounts?: { description: string; amount: number }[];
  fixed_discounts?: number;
  inss_value?: number;
};

export function PayslipViewerModal({ open, onOpenChange, employee, referenceDate }: PayslipViewerModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<any>(null);

  // Carregar o logo e converter para Base64 para o PDF
  useEffect(() => {
    const loadLogo = async () => {
      if (!open || !settings?.logo_url) {
        setLogoBase64(null);
        return;
      }
      try {
        const response = await fetch(settings.logo_url, { mode: 'cors', cache: 'no-cache' });
        if (!response.ok) throw new Error("Logo fetch failed");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Erro ao carregar logo para o visualizador:", error);
        setLogoBase64("ERROR");
      }
    };
    loadLogo();
  }, [open, settings?.logo_url]);

  useEffect(() => {
    // Só gera o PDF se o colaborador estiver carregado e, se houver logo_url, esperar o logoBase64
    const shouldWaitLogo = settings?.logo_url && logoBase64 === null;
    if (open && employee && !shouldWaitLogo) {
      const generatePdf = async () => {
        setLoading(true);
        setPdfUrl(null);

        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const fullEmployee = employee as FullEmployee;

        const companyName = settings?.company_name || "EMPRESA NÃO CONFIGURADA";
        const companyCNPJ = settings?.cnpj || "00.000.000/0000-00";
        const hasLogo = logoBase64 && logoBase64 !== "ERROR";
        const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

        const parseJsonb = (field: any) => {
          try {
            if (Array.isArray(field)) return field;
            if (typeof field === 'string') {
              const p = JSON.parse(field);
              return typeof p === 'string' ? JSON.parse(p) : p;
            }
            return [];
          } catch { return []; }
        };

        // --- Geração do PDF ---
        if (hasLogo && logoBase64 && logoBase64 !== "ERROR") {
          const format = logoBase64.toLowerCase().includes('png') ? 'PNG' : 'JPEG';
          doc.addImage(logoBase64, format, 14, 10, 25, 15);
        }

        const headerTextX = hasLogo ? 42 : 14;
        doc.setFontSize(12).setFont("helvetica", "bold").text(companyName, headerTextX, 15);
        doc.setFontSize(9).setFont("helvetica", "normal").text(`CNPJ: ${companyCNPJ}`, headerTextX, 20);
        doc.setFontSize(12).setFont("helvetica", "bold").text("RECIBO DE PAGAMENTO", 196, 15, { align: "right" });
        doc.setFontSize(9).setFont("helvetica", "normal");
        const period = format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase();
        doc.text(`Referência: ${period}`, 196, 20, { align: "right" });

        // Dados Funcionário
        const boxY = 25;
        doc.setFillColor(250, 250, 250).rect(14, boxY, 182, 14, "F");
        doc.rect(14, boxY, 182, 14);
        doc.setFontSize(7).setTextColor(100);
        doc.text("CÓDIGO", 16, boxY + 4).text("NOME DO FUNCIONÁRIO", 35, boxY + 4).text("CARGO", 115, boxY + 4).text("DEPARTAMENTO", 160, boxY + 4);
        doc.setFontSize(9).setTextColor(0).setFont("helvetica", "bold");
        doc.text(fullEmployee.id.substring(0, 6).toUpperCase(), 16, boxY + 10);
        doc.text(fullEmployee.name.toUpperCase().substring(0, 35), 35, boxY + 10);
        doc.text((fullEmployee.role?.toUpperCase() || "-").substring(0, 25), 115, boxY + 10);
        doc.text((fullEmployee.department?.toUpperCase() || "-").substring(0, 15), 160, boxY + 10);

        // Cálculos
        const earnings = [
          { desc: "SALÁRIO BASE", value: Number(fullEmployee.base_salary || 0) },
          { desc: "HORAS EXTRAS", value: Number(fullEmployee.overtime_amount || 0) },
          { desc: "ADICIONAL NOTURNO", value: Number(fullEmployee.night_shift_amount || 0) },
          { desc: "INSALUBRIDADE", value: Number(fullEmployee.insalubrity_amount || 0) },
          { desc: "SALÁRIO FAMÍLIA", value: Number(fullEmployee.family_salary_amount || 0) },
        ].filter(i => i.value > 0);

        parseJsonb(fullEmployee.variable_additions).forEach((a: any) => {
          const v = Number(a.value || a.amount);
          if (v > 0) earnings.push({ desc: (a.description || "ADICIONAL").toUpperCase(), value: v });
        });

        const inss = Number(fullEmployee.inss_value || 0);
        const discounts = [
          { desc: "DESCONTOS FIXOS", value: Number(fullEmployee.fixed_discounts || 0) }
        ];
        if (inss > 0) discounts.push({ desc: `INSS (${format(referenceDate, 'yyyy')})`, value: inss });

        parseJsonb(fullEmployee.variable_discounts).forEach((d: any) => {
          const v = Number(d.value || d.amount);
          const desc = (d.description || "DESCONTO").toUpperCase();
          if (v > 0 && !(desc.includes("INSS") && inss > 0)) {
            discounts.push({ desc, value: v });
          }
        });

        const rows = [
          ...earnings.map(e => ["001", e.desc, "0,00", formatCurrency(e.value), "0,00"]),
          ...discounts.map(d => ["002", d.desc, "0,00", "0,00", formatCurrency(d.value)])
        ];

        autoTable(doc, {
          startY: boxY + 18,
          head: [['Cód.', 'Descrição', 'Ref.', 'Vencimentos', 'Descontos']],
          body: rows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [240, 240, 240], textColor: 20 },
          columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
        });

        const totalEarnings = earnings.reduce((a, b) => a + b.value, 0);
        const totalDiscounts = discounts.reduce((a, b) => a + b.value, 0);
        const netPay = totalEarnings - totalDiscounts;
        const finalY = (doc as any).lastAutoTable.finalY;

        doc.setFontSize(9).setFont("helvetica", "bold").text("TOTAIS", 120, finalY + 6);
        doc.setFont("helvetica", "normal").text(formatCurrency(totalEarnings), 164, finalY + 6, { align: "right" });
        doc.text(formatCurrency(totalDiscounts), 194, finalY + 6, { align: "right" });

        const netY = finalY + 10;
        doc.setFillColor(245, 245, 245).rect(14, netY, 182, 12, "F");
        doc.rect(14, netY, 182, 12);
        doc.setFontSize(10).setFont("helvetica", "bold").text("LÍQUIDO A RECEBER", 16, netY + 7.5);
        doc.setFontSize(12).text(formatCurrency(netPay), 194, netY + 7.5, { align: "right" });

        // Bases
        const footerInfoY = netY + 16;
        const boxWidth = 182 / 4;
        const calcBase = Math.max(0, totalEarnings - Number(fullEmployee.family_salary_amount || 0));
        const bases = [
          { label: "Salário Base", value: formatCurrency(Number(fullEmployee.base_salary || 0)) },
          { label: "Sal. Contr. INSS", value: formatCurrency(calcBase) },
          { label: "Base Cálc. FGTS", value: formatCurrency(calcBase) },
          { label: "FGTS do Mês (8%)", value: formatCurrency(calcBase * 0.08) },
        ];

        bases.forEach((item, i) => {
          const x = 14 + (i * boxWidth);
          doc.setFontSize(6).setFont("helvetica", "normal").rect(x, footerInfoY, boxWidth, 10);
          doc.text(item.label, x + 2, footerInfoY + 3);
          doc.setFont("helvetica", "bold").text(item.value, x + boxWidth - 2, footerInfoY + 8, { align: "right" });
        });

        const dataUrl = doc.output('datauristring');
        setCurrentDoc(doc);
        setPdfUrl(dataUrl);
        setLoading(false);
      };

      generatePdf();
    }
  }, [open, employee, referenceDate, logoBase64, settings]);

  const handleDownload = () => {
    if (currentDoc && employee) {
      const fileName = `Holerite_${employee.name.replace(/\s+/g, '_')}_${format(referenceDate, 'MM-yyyy')}.pdf`;
      currentDoc.save(fileName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader><DialogTitle>Visualizar Holerite</DialogTitle></DialogHeader>
        <div className="flex-1 w-full flex items-center justify-center border rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {pdfUrl && !loading && <iframe src={pdfUrl} className="w-full h-full" title="Visualizador de Holerite" />}
          {!pdfUrl && !loading && <p className="text-muted-foreground">Erro ao gerar o documento.</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          {pdfUrl && (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}