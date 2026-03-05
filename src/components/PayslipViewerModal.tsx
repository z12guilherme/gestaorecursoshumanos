import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Employee } from '@/hooks/useEmployees'; // Usando o tipo base, mas ciente que mais campos virão
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

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
    variable_additions?: { description: string; value: number }[];
    variable_discounts?: { description: string; amount: number }[];
    fixed_discounts?: number;
    inss_value?: number;
};

export function PayslipViewerModal({ open, onOpenChange, employee, referenceDate }: PayslipViewerModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && employee) {
      const generatePdf = async () => {
        setLoading(true);
        setPdfUrl(null);

        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const fullEmployee = employee as FullEmployee;

        // --- Lógica de cálculo do holerite ---
        const base = Number(fullEmployee.base_salary || 0);
        const insalubrity = Number(fullEmployee.insalubrity_amount || 0);
        const night = Number(fullEmployee.night_shift_amount || 0);
        
        const additions = Array.isArray(fullEmployee.variable_additions) ? fullEmployee.variable_additions : [];
        const totalVariableAdditions = additions.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

        const discounts = Array.isArray(fullEmployee.variable_discounts) ? fullEmployee.variable_discounts : [];
        const totalVariableDiscounts = discounts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const fixedDiscounts = Number(fullEmployee.fixed_discounts || 0);
        const inss = Number(fullEmployee.inss_value || 0);

        const totalEarnings = base + insalubrity + night + totalVariableAdditions;
        const totalDeductions = totalVariableDiscounts + fixedDiscounts + inss;
        const netSalary = totalEarnings - totalDeductions;

        // --- Geração do PDF ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Demonstrativo de Pagamento', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período de Referência: ${format(referenceDate, 'MMMM/yyyy', { locale: ptBR })}`, 14, 30);
        doc.text(`Funcionário: ${fullEmployee.name}`, 14, 35);
        doc.text(`Cargo: ${fullEmployee.role}`, 14, 40);
        doc.text(`Departamento: ${fullEmployee.department}`, 14, 45);

        autoTable(doc, {
          startY: 55,
          head: [['Descrição', 'Proventos (R$)', 'Descontos (R$)']],
          body: [
            ['Salário Base', base.toFixed(2), ''],
            ...additions.map(add => [add.description, (Number(add.value) || 0).toFixed(2), '']),
            ['Adicional Insalubridade', insalubrity > 0 ? insalubrity.toFixed(2) : '', ''],
            ['Adicional Noturno', night > 0 ? night.toFixed(2) : '', ''],
            ['INSS', '', inss > 0 ? inss.toFixed(2) : ''],
            ...discounts.map(disc => [disc.description, '', (Number(disc.amount) || 0).toFixed(2)]),
            ['Descontos Fixos', '', fixedDiscounts > 0 ? fixedDiscounts.toFixed(2) : ''],
          ],
          foot: [
            [{ content: 'TOTAIS', styles: { fontStyle: 'bold' } }, { content: totalEarnings.toFixed(2), styles: { fontStyle: 'bold' } }, { content: totalDeductions.toFixed(2), styles: { fontStyle: 'bold' } }]
          ],
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] }, // Azul
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Salário Líquido:', 14, finalY + 10);
        doc.text(`R$ ${netSalary.toFixed(2)}`, 195, finalY + 10, { align: 'right' });

        const dataUrl = doc.output('datauristring');
        setPdfUrl(dataUrl);
        setLoading(false);
      };

      generatePdf();
    }
  }, [open, employee, referenceDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader><DialogTitle>Visualizar Holerite</DialogTitle></DialogHeader>
        <div className="flex-1 w-full flex items-center justify-center border rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {pdfUrl && !loading && <iframe src={pdfUrl} className="w-full h-full" title="Visualizador de Holerite" />}
          {!pdfUrl && !loading && <p className="text-muted-foreground">Erro ao gerar o documento.</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}