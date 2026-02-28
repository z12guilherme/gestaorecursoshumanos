import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SignatureCanvas from 'react-signature-canvas';
import { FileText, CheckCircle2, PenTool, Loader2, Eraser } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Definição da interface baseada nos campos do banco de dados (employees)
interface Employee {
  id: string;
  name: string;
  email?: string;
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
  variable_additions?: any; // jsonb no banco
}

interface PayslipButtonProps {
  employee: Employee;
  companyName?: string;
  companyCNPJ?: string;
  referenceDate?: Date;
}

// Função auxiliar para remover espaços em branco da assinatura (substitui getTrimmedCanvas)
const trimCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const length = pixels.data.length;
  let top: number | null = null;
  let bottom: number | null = null;
  let left: number | null = null;
  let right: number | null = null;

  for (let i = 0; i < length; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);

      if (top === null) { top = y; bottom = y; left = x; right = x; }
      else {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top === null || bottom === null || left === null || right === null) return null;

  const trimmed = document.createElement('canvas');
  trimmed.width = right - left + 1;
  trimmed.height = bottom - top + 1;
  trimmed.getContext('2d')?.drawImage(canvas, left, top, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
  return trimmed;
};

export const PayslipButton: React.FC<PayslipButtonProps> = ({
  employee,
  companyName = "HOSPITAL DMI LTDA", 
  companyCNPJ = "30.882.426/0001-87",
  referenceDate = new Date()
}) => {

  const [loading, setLoading] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sigCanvas = useRef<any>(null);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const sendPayslipEmail = async (doc: jsPDF) => {
    if (!employee.email) return;

    try {
      // 1. Upload para o Supabase Storage (Bucket 'documents')
      const pdfBlob = doc.output('blob');
      // Cria um caminho organizado: payslips/ID_DO_FUNC/ANO-MES_TIMESTAMP.pdf
      const fileName = `payslips/${employee.id}/${format(referenceDate, 'yyyy-MM')}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter Link Público
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      // 3. Enviar Link por E-mail
      await emailjs.send(
        'service_z5ccatp',
        'template_u3pgt98',
        {
          to_name: employee.name,
          to_email: employee.email, // Importante: No template do EmailJS, o campo "To Email" deve ser {{to_email}}
          name: companyName, // Preenche o campo {{name}} (From Name) com o nome da empresa
          title: `Holerite - ${format(referenceDate, 'MM/yyyy')}`, // Preenche o campo {{title}} no Assunto
          message: 'Seu holerite assinado está disponível para download.',
          link: publicUrl // No seu template do EmailJS, use a variável {{link}}
        },
        '0ofiKy53c1RuwUoJ2'
      );
      
      toast({
        title: "E-mail enviado",
        description: `Enviado para ${employee.email}. Pode levar alguns minutos para chegar.`,
      });

    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({
        title: "Aviso",
        description: "Holerite baixado, mas houve um erro ao enviar a cópia por e-mail.",
        variant: "destructive"
      });
    }
  };

  const handleSignAndDownload = async () => {
    setLoading(true);
    try {
      // Verificar se o usuário desenhou algo
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        toast({
          title: "Assinatura obrigatória",
          description: "Por favor, assine no campo indicado antes de confirmar.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const originalCanvas = sigCanvas.current.getCanvas();
      const trimmedCanvas = trimCanvas(originalCanvas);
      const signatureImage = (trimmedCanvas || originalCanvas).toDataURL('image/png');

      // 1. Registrar assinatura no banco
      const refDate = format(referenceDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('payslip_acknowledgments')
        .upsert({
          employee_id: employee.id,
          reference_date: refDate,
          user_agent: navigator.userAgent,
          ip_address: 'IP_REGISTRADO_VIA_APP',
          signature_image: signatureImage,
          signed_at: new Date().toISOString()
        }, { onConflict: 'employee_id, reference_date' })
        .select()
        .single();

      if (error) throw error;

      setSignatureData(data);
      setIsDialogOpen(false);
      
      // 2. Gerar PDF com os dados da assinatura recém criada
      const doc = generatePayslip(data);
      await sendPayslipEmail(doc);

      toast({
        title: "Sucesso",
        description: "Holerite assinado e baixado com sucesso.",
        className: "bg-green-600 text-white border-none"
      });

    } catch (error: any) {
      console.error("Erro detalhado ao assinar:", error);
      toast({
        title: "Erro ao registrar",
        description: error.message || "Ocorreu um erro ao salvar a assinatura.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const generatePayslip = (currentSignatureData = signatureData) => {
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

    // Processar adicionais variáveis (JSONB)
    let varAdditions: any[] = [];
    try {
        if (Array.isArray(employee.variable_additions)) {
            varAdditions = employee.variable_additions;
        } else if (typeof employee.variable_additions === 'string') {
            varAdditions = JSON.parse(employee.variable_additions);
            if (typeof varAdditions === 'string') { varAdditions = JSON.parse(varAdditions); }
        }
    } catch (e) { varAdditions = []; }

    if (Array.isArray(varAdditions)) {
        varAdditions.forEach((d: any) => {
            let val = Number(d.value);
            if (isNaN(val) && typeof d.value === 'string') { val = Number(d.value.replace(',', '.')); }
            if (!isNaN(val) && val > 0) {
                earnings.push({ 
                    desc: d.description ? d.description.toUpperCase() : "GRATIFICAÇÃO", 
                    value: val 
                });
            }
        });
    }

    const discounts = [
      { desc: "DESCONTOS FIXOS", value: Number(employee.fixed_discounts) }
    ];

    // Processar descontos variáveis (JSONB)
    let varDiscounts: any[] = [];
    try {
        if (Array.isArray(employee.variable_discounts)) {
            varDiscounts = employee.variable_discounts;
        } else if (typeof employee.variable_discounts === 'string') {
            varDiscounts = JSON.parse(employee.variable_discounts);
            // Proteção extra para strings aninhadas
            if (typeof varDiscounts === 'string') { varDiscounts = JSON.parse(varDiscounts); }
        }
    } catch (e) {
        varDiscounts = [];
    }
    
    if (Array.isArray(varDiscounts)) {
        varDiscounts.forEach((d: any) => {
            let val = Number(d.value);
            if (isNaN(val) && typeof d.value === 'string') { val = Number(d.value.replace(',', '.')); }
            if (!isNaN(val) && val > 0) {
                discounts.push({ 
                    desc: d.description ? d.description.toUpperCase() : "OUTROS DESCONTOS", 
                    value: val 
                });
            }
        });
    }

    // Montar linhas da tabela
    const rows: any[] = [];
    earnings.forEach(e => rows.push(["001", e.desc, "", formatCurrency(e.value), "0,00"]));
    discounts.forEach(d => rows.push(["002", d.desc, "", "0,00", formatCurrency(d.value)]));

    const totalEarnings = earnings.reduce((acc, curr) => acc + curr.value, 0);
    const totalDiscounts = discounts.reduce((acc, curr) => acc + curr.value, 0);
    const netPay = totalEarnings - totalDiscounts;
    
    // Cálculo das Bases (Excluindo Salário Família que não incide FGTS/INSS)
    const nonIncidentalValue = Number(employee.family_salary_amount) || 0;
    const calculationBase = Math.max(0, totalEarnings - nonIncidentalValue);

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
    // Linha de Totais
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAIS", 120, finalY + 6);
    
    doc.setFont("helvetica", "normal");
    doc.text(formatCurrency(totalEarnings), 164, finalY + 6, { align: "right" });
    doc.text(formatCurrency(totalDiscounts), 194, finalY + 6, { align: "right" });

    // Caixa Líquido
    const netY = finalY + 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, netY, 182, 12, "F");
    doc.rect(14, netY, 182, 12);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("LÍQUIDO A RECEBER", 16, netY + 7.5);
    
    doc.setFontSize(12);
    doc.text(formatCurrency(netPay), 194, netY + 7.5, { align: "right" });

    // --- Rodapé Informativo (Bases de Cálculo) ---
    const footerInfoY = netY + 16;
    const boxWidth = 182 / 4; // 4 colunas
    
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    
    // Dados estimados para compor o visual (em um cenário real, viriam do cálculo exato)
    const bases = [
        { label: "Salário Base", value: formatCurrency(Number(employee.base_salary)) },
        { label: "Sal. Contr. INSS", value: formatCurrency(calculationBase) },
        { label: "Base Cálc. FGTS", value: formatCurrency(calculationBase) },
        { label: "FGTS do Mês (8%)", value: formatCurrency(calculationBase * 0.08) },
    ];

    bases.forEach((item, index) => {
        const x = 14 + (index * boxWidth);
        doc.rect(x, footerInfoY, boxWidth, 10);
        doc.text(item.label, x + 2, footerInfoY + 3);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, x + boxWidth - 2, footerInfoY + 8, { align: "right" });
        doc.setFont("helvetica", "normal");
    });

    // Assinatura e Declaração
    const footerY = footerInfoY + 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Declaramos ter recebido a importância líquida de ${formatCurrency(netPay)}, referente ao pagamento do salário do mês acima.`, 14, footerY);
    
    const displayDate = currentSignatureData?.signed_at 
      ? format(new Date(currentSignatureData.signed_at), "dd/MM/yyyy")
      : "____/____/________";
    doc.text(`Data: ${displayDate}`, 14, footerY + 12);
    
    // --- Assinatura da Empresa (Estática/Simulada) ---
    // Aqui você poderia carregar uma imagem de assets se tivesse
    doc.setFont("helvetica", "bold");
    doc.text(companyName.toUpperCase(), 50, footerY + 16, { align: "center" });
    doc.line(20, footerY + 12, 80, footerY + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("ASSINATURA DO EMPREGADOR", 50, footerY + 19, { align: "center" });

    // --- Assinatura do Funcionário ---
    doc.line(110, footerY + 12, 190, footerY + 12);
    doc.setFontSize(8);
    doc.text("Assinatura do Funcionário", 150, footerY + 16, { align: "center" });

    // --- Carimbo de Assinatura Digital (Se assinado) ---
    if (currentSignatureData) {
      // Inserir a imagem da assinatura desenhada
      if (currentSignatureData.signature_image) {
        // doc.addImage(imagem, formato, x, y, largura, altura)
        doc.addImage(currentSignatureData.signature_image, 'PNG', 120, footerY - 8, 60, 20);
      }

      const signY = footerY + 22;
      doc.setDrawColor(0, 100, 0); // Verde escuro
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(6);
      
      const signDate = currentSignatureData.signed_at 
        ? format(new Date(currentSignatureData.signed_at), "dd/MM/yyyy 'às' HH:mm:ss")
        : format(new Date(), "dd/MM/yyyy HH:mm:ss");

      doc.setFont("helvetica", "bold");
      doc.text("ASSINADO DIGITALMENTE", 110, signY);
      doc.setFont("helvetica", "normal");
      doc.text(`Hash: ${currentSignatureData.id}`, 110, signY + 3);
      doc.text(`Data: ${signDate}`, 110, signY + 6);
    }

    doc.save(`Holerite_${employee.name.replace(/\s+/g, '_')}_${format(referenceDate, 'MM-yyyy')}.pdf`);
    return doc;
  };

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)} 
        variant="default" 
        size="sm" 
        className="gap-2"
      >
        <PenTool className="h-4 w-4" />
        Assinar e Baixar
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Recebimento</DialogTitle>
            <DialogDescription>
              Para baixar seu holerite, você precisa confirmar o recebimento digitalmente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
            <p>Eu, <strong>{employee.name}</strong>, declaro ter recebido a importância líquida discriminada neste recibo de pagamento.</p>
            <p className="mt-2 text-xs">Ao clicar em confirmar, será registrado o carimbo de tempo e dados do seu dispositivo como prova de assinatura.</p>
            
            <div className="mt-4 bg-white border border-dashed border-gray-400 rounded-md p-2 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-500 mb-1 w-full text-left">Desenhe sua assinatura abaixo:</p>
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{width: 400, height: 150, className: 'sigCanvas cursor-crosshair'}}
              />
              <Button variant="ghost" size="sm" onClick={clearSignature} className="mt-2 text-xs h-6">
                <Eraser className="w-3 h-3 mr-1" /> Limpar Assinatura
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSignAndDownload} disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};