import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Megaphone, MessageSquare, Bell, Send, Pin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCommunication } from '@/hooks/useCommunication';
import { useAuth } from '@/lib/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';

const priorityConfig = {
  low: { label: 'Baixa', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Média', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  high: { label: 'Alta', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function Communication() {
  const { announcements, loading, addAnnouncement } = useCommunication();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const { toast } = useToast();

  const handlePublish = async () => {
    const currentEmployee = employees.find(e => e.email === user?.email);
    const authorName = currentEmployee?.name || (user?.email ? user.email.split('@')[0] : "Admin");

    const { error } = await addAnnouncement({
      title,
      content,
      priority,
      author: authorName,
    });

    if (error) {
      return toast({ title: 'Erro', description: 'Falha ao publicar aviso.', variant: 'destructive' });
    }

    setIsDialogOpen(false);
    setTitle(''); setContent(''); setPriority('medium');
    toast({
      title: 'Aviso publicado',
      description: 'O aviso foi publicado no mural com sucesso.',
    });
  };

  return (
    <AppLayout title="Comunicação Interna" subtitle="Mural de avisos e mensagens">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
                <p className="text-xs text-muted-foreground">Avisos ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-xs text-muted-foreground">Mensagens hoje</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Notificações</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mural de Avisos</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Aviso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publicar Novo Aviso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input 
                        id="title" 
                        placeholder="Digite o título do aviso" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea 
                        id="content" 
                        placeholder="Digite o conteúdo do aviso..." 
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handlePublish}>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading && <div className="text-center py-4 text-muted-foreground">Carregando avisos...</div>}

            <div className="space-y-4">
              {!loading && announcements.map((announcement) => {
                const priority = priorityConfig[announcement.priority];
                
                return (
                  <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {announcement.priority === 'high' && (
                            <Pin className="h-4 w-4 text-red-500" />
                          )}
                          <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                        </div>
                        <Badge className={priority.className}>{priority.label}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{announcement.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {announcement.author[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">{announcement.author}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {format(parseISO(announcement.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Message */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensagem Rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Destinatário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os colaboradores</SelectItem>
                      <SelectItem value="managers">Gestores</SelectItem>
                      <SelectItem value="tech">Tecnologia</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Digite sua mensagem..." 
                    rows={4}
                  />
                </div>
                <Button className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notificações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm text-foreground">Nova solicitação de férias</p>
                    <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                  <div>
                    <p className="text-sm text-foreground">Avaliação concluída</p>
                    <p className="text-xs text-muted-foreground">Há 1 hora</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                  <div>
                    <p className="text-sm text-foreground">Novo candidato inscrito</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
