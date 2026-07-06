import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee } from "@/hooks/useEmployees";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { DEFAULT_APP_NAME } from "@/lib/branding";
import { generatePayslipDocument, FullEmployee } from "@/lib/payslipGenerator";

interface PayslipViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  referenceDate: Date;
}

export function PayslipViewerModal({
  open,
  onOpenChange,
  employee,
  referenceDate,
}: PayslipViewerModalProps) {
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
        const response = await fetch(settings.logo_url, { mode: "cors", cache: "no-cache" });
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

        const doc = await generatePayslipDocument({
          employee: employee as FullEmployee,
          referenceDate,
          settings,
          logoBase64,
          // Nenhuma assinatura é passada aqui, pois é apenas uma visualização
        });

        const dataUrl = doc.output("datauristring");
        setCurrentDoc(doc);
        setPdfUrl(dataUrl);
        setLoading(false);
      };

      generatePdf();
    }
  }, [open, employee, referenceDate, logoBase64, settings]);

  const handleDownload = () => {
    if (currentDoc && employee) {
      const fileName = `Holerite_${employee.name.replace(/\s+/g, "_")}_${format(referenceDate, "MM-yyyy")}.pdf`;
      currentDoc.save(fileName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Visualizar Holerite</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full flex items-center justify-center border rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {pdfUrl && !loading && (
            <iframe src={pdfUrl} className="w-full h-full" title="Visualizador de Holerite" />
          )}
          {!pdfUrl && !loading && (
            <p className="text-muted-foreground">Erro ao gerar o documento.</p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
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
