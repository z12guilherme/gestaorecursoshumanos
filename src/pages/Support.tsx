import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Search, MessageSquare, CheckCircle2, Clock, AlertCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Ticket {
  id: string;
  ticket_num: string;
  employee_name: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  hr_notes: string;
  created_at: string;
}

const statusConfig = {
  open: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolvido', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  closed: { label: 'Fechado', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', hr_notes: '' });
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      toast({ title: 'Erro', description: 'Falha ao carregar chamados.', variant: 'destructive' });
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleEditClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditForm({ status: ticket.status, hr_notes: ticket.hr_notes || '' });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTicket) return;

    const { error } = await supabase
      .from('tickets')
      .update({
        status: editForm.status,
        hr_notes: editForm.hr_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedTicket.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar chamado.', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Chamado atualizado.' });
      fetchTickets();
      setIsDialogOpen(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Central de Chamados" subtitle="Gerencie solicitações e suporte aos colaboradores">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por protocolo, nome ou assunto..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando chamados...</p>
          ) : filteredTickets.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Nenhum chamado encontrado.</Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => handleEditClick(ticket)}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">#{ticket.ticket_num}</Badge>
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <Badge className={statusConfig[ticket.status as keyof typeof statusConfig]?.color}>
                          {statusConfig[ticket.status as keyof typeof statusConfig]?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Aberto por <strong>{ticket.employee_name}</strong> em {format(new Date(ticket.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{ticket.description}</p>
                    </div>
                    {ticket.hr_notes && (
                      <div className="md:w-1/3 bg-secondary/30 p-3 rounded-md text-sm border border-border">
                        <p className="font-medium text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Observação do RH
                        </p>
                        <p className="italic text-foreground/80 line-clamp-3">{ticket.hr_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Chamado #{selectedTicket?.ticket_num}</DialogTitle>
              <DialogDescription>Atualize o status e adicione observações para o colaborador.</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-medium">{selectedTicket?.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTicket?.description}</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Observações do RH (Visível ao funcionário)</label>
                <Textarea 
                  value={editForm.hr_notes} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, hr_notes: e.target.value }))} 
                  placeholder="Descreva a solução ou solicite mais informações..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}