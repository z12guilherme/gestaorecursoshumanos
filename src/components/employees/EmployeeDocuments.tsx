import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FileText, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface EmployeeDocumentsProps {
  employeeId: string;
}

export function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${employeeId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // 3. Salvar referência no Banco
      const { error: dbError } = await supabase
        .from("employee_documents")
        .insert({
          employee_id: employeeId,
          name: file.name,
          url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({ title: "Sucesso", description: "Documento enviado com sucesso!" });
      fetchDocuments();
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Erro", description: "Falha ao enviar documento.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    try {
      // Extrair o path do arquivo da URL para deletar do storage
      // Ex: .../documents/uuid/file.pdf -> uuid/file.pdf
      const path = url.split("/documents/")[1];

      if (path) {
        await supabase.storage.from("documents").remove([path]);
      }

      const { error } = await supabase
        .from("employee_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Deletado", description: "Documento removido." });
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({ title: "Erro", description: "Não foi possível deletar.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documentos Digitalizados</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Novo Documento
            </label>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum documento anexado.</div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Enviado em {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id, doc.url)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}