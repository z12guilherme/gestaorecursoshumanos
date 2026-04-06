import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, User, Phone, CheckSquare, QrCode, Printer, Trash2, Brain, AlertTriangle, Smile, Meh } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  customer_name: string;
  contact_info: string;
  content: string;
  created_at: string;
  status: string;
}

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { toast } = useToast();
  const publicLink = `${window.location.origin}/sugestoes-publico`;

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAiSentiment = (text: string) => {
    const criticalWords = ['processo', 'assédio', 'assedio', 'absurdo', 'péssimo', 'pessimo', 'ruim', 'demora', 'procon', 'advogado', 'lixo', 'urgente'];
    const positiveWords = ['excelente', 'ótimo', 'otimo', 'parabéns', 'parabens', 'bom', 'rápido', 'gostei', 'elogio', 'incrível', 'maravilhoso'];
    
    const lowerText = text.toLowerCase();
    if (criticalWords.some(w => lowerText.includes(w))) {
      return { label: 'Crítico', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200', icon: AlertTriangle, action: 'Ação sugerida: Encaminhar imediatamente para a diretoria/jurídico.' };
    }
    if (positiveWords.some(w => lowerText.includes(w))) {
      return { label: 'Positivo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200', icon: Smile, action: 'Ação sugerida: Compartilhar elogio com a equipe envolvida.' };
    }
    return { label: 'Neutro', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200', icon: Meh, action: 'Ação sugerida: Acompanhamento padrão pelo atendimento.' };
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('suggestions').update({ status: 'Lida' }).eq('id', id);
      if (error) throw error;
      fetchSuggestions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem permanentemente?')) return;

    try {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (error) throw error;
      
      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Sucesso', description: 'Mensagem excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({ title: 'Erro', description: 'Não foi possível excluir a mensagem.', variant: 'destructive' });
    }
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>QR Code Ouvidoria</title></head><body style="text-align:center; font-family: sans-serif; padding: 40px;">');
        printWindow.document.write('<h1 style="margin-bottom: 10px;">Ouvidoria & Sugestões</h1>');
        printWindow.document.write('<p style="font-size: 18px; color: #555;">Escaneie o QR Code abaixo para enviar sua sugestão ou reclamação.</p>');
        printWindow.document.write(`<div style="margin: 30px 0;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicLink)}" style="width: 300px; height: 300px;" /></div>`);
        printWindow.document.write(`<p style="font-family: monospace; background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">${publicLink}</p>`);
        printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    }
  };

  return (
    <AppLayout title="Ouvidoria" subtitle="Sugestões e reclamações de clientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h2 className="text-lg font-semibold">Mensagens Recebidas</h2>
             <p className="text-sm text-muted-foreground">Gerencie o feedback recebido através do canal público.</p>
           </div>
           
           <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      Gerar QR Code
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md text-center">
                  <DialogHeader>
                      <DialogTitle>QR Code para Sugestões</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center py-6">
                      <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicLink)}`} 
                          alt="QR Code" 
                          className="border p-2 rounded-lg"
                      />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 break-all bg-secondary p-2 rounded font-mono">{publicLink}</p>
                  <Button onClick={handlePrintQr} className="w-full gap-2">
                      <Printer className="h-4 w-4" /> Imprimir Cartaz
                  </Button>
              </DialogContent>
           </Dialog>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((item) => (
              <Card key={item.id} className={`border-l-4 ${item.status === 'Nova' ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                  {(() => {
                    const sentiment = getAiSentiment(item.content);
                    return (
                      <>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'Nova' && (
                        <Badge>Nova</Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDelete(item.id)}
                        title="Excluir mensagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">{item.content}</p>
                  
                  <div className="border-t pt-3 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center mb-1">
                      <User className="h-3 w-3 mr-2" />
                      {item.customer_name || 'Anônimo'}
                    </div>
                    {item.contact_info && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {item.contact_info}
                      </div>
                    )}
                  </div>

                  {/* Análise de IA */}
                  <div className="bg-secondary/40 p-3 rounded-md mt-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Brain className="h-3 w-3 text-purple-500" /> Análise de IA
                      </span>
                      <Badge variant="outline" className={`${sentiment.color} text-[10px] py-0 h-5`}>
                        <sentiment.icon className="h-3 w-3 mr-1" />
                        {sentiment.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{sentiment.action}</p>
                  </div>

                  {item.status === 'Nova' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => markAsRead(item.id)}
                    >
                      <CheckSquare className="h-3 w-3 mr-2" /> Marcar como lida
                    </Button>
                  )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
            {suggestions.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-10">Nenhuma sugestão recebida ainda.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}