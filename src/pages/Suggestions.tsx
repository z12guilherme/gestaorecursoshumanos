import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, User, Phone, CheckSquare, QrCode, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('suggestions').update({ status: 'Lida' }).eq('id', id);
      if (error) throw error;
      fetchSuggestions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    {item.status === 'Nova' && (
                      <Badge>Nova</Badge>
                    )}
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