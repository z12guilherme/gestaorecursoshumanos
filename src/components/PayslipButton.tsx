import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import SignatureCanvas from "react-signature-canvas";
import { FileText, CheckCircle2, PenTool, Loader2, Eraser } from "lucide-react";
import emailjs from "@emailjs/browser";
import { Button } from "./ui/button";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { Employee } from "@/hooks/useEmployees";
import { DEFAULT_APP_NAME } from "@/lib/branding";
import { generatePayslipDocument, FullEmployee } from "@/lib/payslipGenerator";

interface PayslipButtonProps {
  employee: FullEmployee;
  companyName?: string;
  companyCNPJ?: string;
  referenceDate?: Date;
}

// Função auxiliar para remover espaços em branco da assinatura (substitui getTrimmedCanvas)
const trimCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
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
      const y = Math.floor(i / 4 / canvas.width);

      if (top === null) {
        top = y;
        bottom = y;
        left = x;
        right = x;
      } else {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  if (top === null || bottom === null || left === null || right === null) return null;

  const trimmed = document.createElement("canvas");
  trimmed.width = right - left + 1;
  trimmed.height = bottom - top + 1;
  trimmed
    .getContext("2d")
    ?.drawImage(
      canvas,
      left,
      top,
      trimmed.width,
      trimmed.height,
      0,
      0,
      trimmed.width,
      trimmed.height
    );
  return trimmed;
};

export const PayslipButton: React.FC<PayslipButtonProps> = ({
  employee,
  referenceDate = subMonths(new Date(), 1),
}) => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sigCanvas = useRef<any>(null);
  const { toast } = useToast();

  const companyName = settings?.company_name || DEFAULT_APP_NAME;
  const companyCNPJ = settings?.cnpj || "";

  // Carregar o logo e converter para Base64 para o PDF
  useEffect(() => {
    const loadLogo = async () => {
      if (!settings?.logo_url) {
        setLogoBase64(null);
        return;
      }
      try {
        const response = await fetch(settings.logo_url, { mode: "cors" });
        if (!response.ok) throw new Error("Logo fetch failed");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Erro ao carregar logo para o PDF:", error);
        setLogoBase64("ERROR");
      }
    };
    loadLogo();
  }, [settings?.logo_url]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value || 0
    );
  };

  const sendPayslipEmail = async (doc: jsPDF) => {
    if (!employee.email) return;

    try {
      // 1. Upload para o Supabase Storage (Bucket 'documents')
      const pdfBlob = doc.output("blob");
      // Cria um caminho organizado: payslips/ID_DO_FUNC/ANO-MES_TIMESTAMP.pdf
      const fileName = `payslips/${employee.id}/${format(referenceDate, "yyyy-MM")}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter Link Público
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("Configurações de e-mail não encontradas.");
      }

      // 3. Enviar Link por E-mail
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_name: employee.name,
          to_email: employee.email,
          name: companyName,
          title: `Holerite - ${format(referenceDate, "MM/yyyy")}`,
          message: "Seu holerite assinado está disponível para download.",
          link: publicUrl,
        },
        publicKey
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
        variant: "destructive",
      });
    }
  };

  const handleSignAndDownload = async () => {
    // Verificação preventiva de configurações
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      toast({
        title: "Erro de Configuração",
        description: "As credenciais de e-mail não foram configuradas no servidor.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar se o usuário desenhou algo
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        toast({
          title: "Assinatura obrigatória",
          description: "Por favor, assine no campo indicado antes de confirmar.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const originalCanvas = sigCanvas.current.getCanvas();
      const trimmedCanvas = trimCanvas(originalCanvas);
      const signatureImage = (trimmedCanvas || originalCanvas).toDataURL("image/png");

      // Captura de IP dinâmica para validade jurídica da assinatura
      let userIp = "0.0.0.0";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {
        console.error("Erro ao obter IP para auditoria:", e);
      }

      // 1. Registrar assinatura no banco
      const refDate = format(referenceDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("payslip_acknowledgments")
        .upsert(
          {
            employee_id: employee.id,
            reference_date: refDate,
            user_agent: navigator.userAgent,
            ip_address: userIp,
            signature_image: signatureImage,
            signed_at: new Date().toISOString(),
          },
          { onConflict: "employee_id, reference_date" }
        )
        .select()
        .single();

      if (error) throw error;

      setSignatureData(data);
      setIsDialogOpen(false);

      // 2. Gerar PDF com os dados da assinatura recém criada
      const doc = await generatePayslip(data);
      await sendPayslipEmail(doc);

      toast({
        title: "Sucesso",
        description: "Holerite assinado e baixado com sucesso.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      console.error("Erro detalhado ao assinar:", error);
      toast({
        title: "Erro ao registrar",
        description: error.message || "Ocorreu um erro ao salvar a assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const generatePayslip = async (currentSignatureData = signatureData) => {
    const doc = await generatePayslipDocument({
      employee,
      referenceDate,
      settings,
      logoBase64,
      signatureData: currentSignatureData,
    });
    doc.save(
      `Holerite_${employee.name.replace(/\s+/g, "_")}_${format(referenceDate, "MM-yyyy")}.pdf`
    );
    return doc;
  };

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} variant="default" size="sm" className="gap-2">
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
            <p>
              Eu, <strong>{employee.name}</strong>, declaro ter recebido a importância líquida
              discriminada neste recibo de pagamento.
            </p>
            <p className="mt-2 text-xs">
              Ao clicar em confirmar, será registrado o carimbo de tempo e dados do seu dispositivo
              como prova de assinatura.
            </p>

            <div className="mt-4 bg-white border border-dashed border-gray-400 rounded-md p-2 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-500 mb-1 w-full text-left">
                Desenhe sua assinatura abaixo:
              </p>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 400, height: 150, className: "sigCanvas cursor-crosshair" }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="mt-2 text-xs h-6"
              >
                <Eraser className="w-3 h-3 mr-1" /> Limpar Assinatura
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
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
