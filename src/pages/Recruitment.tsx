import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/recruitment/KanbanBoard';
import { JobPostingCard } from '@/components/recruitment/JobPostingCard';
import { jobPostings as initialJobs, candidates as initialCandidates } from '@/data/mockData';
import { Candidate } from '@/types/hr';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsProps } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Recruitment() {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('hr_candidates');
    return saved ? JSON.parse(saved) : initialCandidates;
  });

  const [jobs, setJobs] = useState<any[]>(() => {
    const saved = localStorage.getItem('hr_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  useEffect(() => {
    localStorage.setItem('hr_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('hr_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCandidates = localStorage.getItem('hr_candidates');
      setCandidates(savedCandidates ? JSON.parse(savedCandidates) : initialCandidates);

      const savedJobs = localStorage.getItem('hr_jobs');
      setJobs(savedJobs ? JSON.parse(savedJobs) : initialJobs);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', type: 'Integral', description: '' });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMoveCandidate = (candidateId: string, newStatus: Candidate['status']) => {
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
    );
    
    const candidate = candidates.find(c => c.id === candidateId);
    const statusLabels = {
      applied: 'Inscritos',
      screening: 'Triagem',
      interview: 'Entrevista',
      approved: 'Aprovados',
      rejected: 'Reprovados',
    };

    toast({
      title: 'Candidato movido',
      description: `${candidate?.name} foi movido para ${statusLabels[newStatus]}.`,
    });
  };

  const filteredCandidates = selectedJobId 
    ? candidates.filter(c => jobs.find(j => j.id === selectedJobId)?.title.toLowerCase() === c.position.toLowerCase())
    : candidates;

  const handleOpenCreateJobDialog = () => {
    setJobToEdit(null);
    setJobForm({ title: '', department: '', location: '', type: 'Integral', description: '' });
    setIsJobDialogOpen(true);
  };

  const handleOpenEditJobDialog = (job: any) => {
    setJobToEdit(job);
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
    });
    setIsJobDialogOpen(true);
  };

  const handleSaveJob = () => {
    if (jobToEdit) {
      setJobs(jobs.map(j => j.id === jobToEdit.id ? { ...jobToEdit, ...jobForm } : j));
      toast({ title: 'Vaga atualizada', description: 'A vaga foi atualizada com sucesso.' });
    } else {
      const newJob = {
        id: Date.now().toString(),
        ...jobForm,
        applicants: 0,
        postedAt: new Date().toISOString(),
        status: 'open',
        requirements: ['Experiência relevante', 'Boa comunicação'], // Mock default
      };
      setJobs([newJob, ...jobs]);
      toast({ title: 'Vaga criada', description: 'A nova vaga foi publicada com sucesso.' });
    }
    setIsJobDialogOpen(false);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
    setJobToDelete(null);
    toast({ title: 'Vaga excluída', description: 'A vaga foi removida com sucesso.', variant: 'destructive' });
  };

  const [activeTab, setActiveTab] = useState('pipeline');

  const stats = {
    openJobs: jobs.filter(j => j.status === 'open').length,
    totalCandidates: candidates.length,
    inProcess: candidates.filter(c => ['screening', 'interview'].includes(c.status)).length,
    approved: candidates.filter(c => c.status === 'approved').length,
  };

  return (
    <AppLayout title="Recrutamento & Seleção" subtitle="Gerencie vagas e candidatos">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.openJobs}</p>
                <p className="text-xs text-muted-foreground">Vagas abertas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCandidates}</p>
                <p className="text-xs text-muted-foreground">Candidatos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProcess}</p>
                <p className="text-xs text-muted-foreground">Em processo</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Aprovados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline de Candidatos</TabsTrigger>
              <TabsTrigger value="jobs">Vagas</TabsTrigger>
            </TabsList>
            
            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={handleOpenCreateJobDialog}>
                  <Plus className="h-4 w-4" />
                  Nova Vaga
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{jobToEdit ? 'Editar Vaga' : 'Criar Nova Vaga'}</DialogTitle>
                  <DialogDescription>
                    {jobToEdit ? 'Altere os detalhes da vaga abaixo.' : 'Preencha os detalhes da nova posição em aberto.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título do Cargo</Label>
                    <Input id="title" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="Ex: Desenvolvedor Frontend" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input id="department" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} placeholder="Ex: Tecnologia" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={jobForm.type} onValueChange={v => setJobForm({...jobForm, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Integral">Integral</SelectItem>
                          <SelectItem value="Estágio">Estágio</SelectItem>
                          <SelectItem value="Híbrido">Híbrido</SelectItem>
                          <SelectItem value="Remoto">Remoto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input id="location" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Ex: São Paulo, SP" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Breve descrição da vaga..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveJob}>{jobToEdit ? 'Salvar Alterações' : 'Criar Vaga'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="pipeline" className="space-y-4">
            <KanbanBoard 
              candidates={filteredCandidates} 
              onMoveCandidate={handleMoveCandidate}
            />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobPostingCard
                  key={job.id}
                  job={job}
                  onSelect={() => {
                    setSelectedJobId(job.id);
                    setActiveTab('pipeline');
                  }}
                  onEdit={() => handleOpenEditJobDialog(job)}
                  onDelete={() => setJobToDelete(job.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
