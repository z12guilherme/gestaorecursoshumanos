import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';

export function EmployeeDocuments({ employeeId }: { employeeId?: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) fetchDocs();
  }, [employeeId]);

  const fetchDocs = async () => {
    if (!employeeId) return;
    const { data, error } = await supabase.storage.from('documents').list(employeeId);
    if (error) {
      console.error("Erro ao listar:", error);
      return;
    }
    if (data) {
      const docsWithUrls = data.filter(d => d.name !== '.emptyFolderPlaceholder').map(d => {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`${employeeId}/${d.name}`);
        return { name: d.name, url: urlData.publicUrl, id: d.id };
      });
      setDocs(docsWithUrls);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !employeeId) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const { error } = await supabase.storage.from('documents').upload(`${employeeId}/${Date.now()}_${file.name}`, file);
      if (error) throw error;
      toast({ title: 'Documento salvo!' });
      fetchDocs();
    } catch (err) {
      toast({ title: 'Erro ao fazer upload', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = ''; // clear input
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm('Excluir documento permanentemente?')) return;
    
    const { error } = await supabase.storage.from('documents').remove([`${employeeId}/${name}`]);
    
    if (error) {
      console.error('Erro ao deletar:', error);
      toast({ 
        title: 'Erro ao excluir', 
        description: 'Sem permissão para deletar. Verifique as políticas (RLS) no Supabase.', 
        variant: 'destructive' 
      });
    } else {
      toast({ title: 'Documento excluído com sucesso!' });
      fetchDocs();
    }
  };

  if (!employeeId) {
    return (
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-2">Documentação Anexada</h3>
        <p className="text-sm text-muted-foreground">Salve o colaborador recém-criado primeiro para poder anexar documentos a ele.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Documentação Anexada</h3>
      <div className="flex items-center gap-4 mb-4">
        <Input type="file" onChange={handleUpload} disabled={uploading} className="max-w-md" />
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md border p-4 max-h-[250px] overflow-y-auto">
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento encontrado nesta pasta.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                  <span className="text-sm font-medium truncate" title={doc.name}>
                    {doc.name.split('_').slice(1).join('_') || doc.name}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button type="button" size="icon" variant="ghost" onClick={() => window.open(doc.url, '_blank')} title="Baixar/Visualizar">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(doc.name)} title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}