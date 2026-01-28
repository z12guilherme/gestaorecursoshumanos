import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Trash2, Edit, Pin, AlertCircle } from 'lucide-react';
import { useCommunication, Announcement } from '@/hooks/useCommunication';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Communication() {
  const { announcements, loading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useCommunication();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    author: 'RH'
  });

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        author: announcement.author
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        author: 'RH'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    if (editingAnnouncement) {
      const { error } = await updateAnnouncement(editingAnnouncement.id, formData);
      if (error) {
        toast({ title: "Erro", description: "Falha ao atualizar aviso.", variant: "destructive" });
      } else {
        toast({ title: "Sucesso", description: "Aviso atualizado." });
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await addAnnouncement(formData);
      if (error) {
        toast({ title: "Erro", description: "Falha ao criar aviso.", variant: "destructive" });
      } else {
        toast({ title: "Sucesso", description: "Aviso publicado." });
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteAnnouncement(deleteId);
    if (error) {
      toast({ title: "Erro", description: "Falha ao excluir aviso.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Aviso removido." });
    }
    setDeleteId(null);
  };

  const priorityConfig = {
    low: { label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
    medium: { label: 'Média', color: 'bg-amber-100 text-amber-800' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800' },
  };

  // Stats calculation based on REAL data
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total: announcements.length,
    today: announcements.filter(a => a.created_at.startsWith(today)).length,
    highPriority: announcements.filter(a => a.priority === 'high').length
  };

  return (
    <AppLayout title="Comunicação Interna" subtitle="Mural de avisos e comunicados">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Avisos</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Pin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publicados Hoje</p>
                <h3 className="text-2xl font-bold">{stats.today}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <h3 className="text-2xl font-bold">{stats.highPriority}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Mural de Avisos</h2>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Aviso
          </Button>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando avisos...</p>
          ) : announcements.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Nenhum aviso publicado.
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden">
                <div className={`h-1 w-full ${announcement.priority === 'high' ? 'bg-red-500' : announcement.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <Badge variant="secondary" className={priorityConfig[announcement.priority].color}>
                          {priorityConfig[announcement.priority].label}
                        </Badge>
                      </div>
                      <CardDescription>
                        Por {announcement.author} • {format(new Date(announcement.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(announcement)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(announcement.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-foreground/80">{announcement.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog Create/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
              <DialogDescription>Preencha as informações do comunicado.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Manutenção no Servidor"
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite a mensagem..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Delete */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Aviso</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este aviso? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}