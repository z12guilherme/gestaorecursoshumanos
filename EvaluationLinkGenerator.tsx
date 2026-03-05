import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';

interface EvaluationLinkGeneratorProps {
  employees: Employee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvaluationLinkGenerator({ employees, open, onOpenChange }: EvaluationLinkGeneratorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedEmployee || !selectedReviewer) return;
    setLoading(true);
    
    try {
      const emp = employees.find(e => e.id === selectedEmployee);
      const rev = employees.find(e => e.id === selectedReviewer);
      const token = crypto.randomUUID();
      
      // Expira em 7 dias
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('evaluation_tokens').insert([{
        token,
        employee_id: selectedEmployee,
        reviewer_id: selectedReviewer,
        employee_name: emp?.name || 'Desconhecido',
        reviewer_name: rev?.name || 'Desconhecido',
        expires_at: expiresAt.toISOString()
      }]);

      if (error) throw error;

      // Constrói o link (ajuste a URL base conforme necessário)
      const link = `${window.location.origin}/avaliacao/${token}`;
      setGeneratedLink(link);
      
    } catch (error: any) {
      toast({ title: "Erro", description: "Falha ao gerar link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: "Copiado!", description: "Link copiado para a área de transferência." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Link de Avaliação Externa</DialogTitle>
          <DialogDescription>Crie um link único para o coordenador avaliar sem login.</DialogDescription>
        </DialogHeader>
        
        {!generatedLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quem será avaliado?</Label>
              <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quem é o avaliador (Coordenador)?</Label>
              <Select onValueChange={setSelectedReviewer} value={selectedReviewer}>
                <SelectTrigger><SelectValue placeholder="Selecione o coordenador" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-4" onClick={handleGenerate} disabled={loading || !selectedEmployee || !selectedReviewer}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Gerar Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-md border break-all">
              <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-mono">{generatedLink}</span>
            </div>
            <Button className="w-full" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copiar Link
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setGeneratedLink(''); setSelectedEmployee(''); setSelectedReviewer(''); }}>
              Gerar Outro
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}