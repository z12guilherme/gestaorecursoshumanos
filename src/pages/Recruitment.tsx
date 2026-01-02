import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/recruitment/KanbanBoard';
import { JobPostingCard } from '@/components/recruitment/JobPostingCard';
import { jobPostings, candidates as initialCandidates } from '@/data/mockData';
import { Candidate } from '@/types/hr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Recruitment() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
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
    ? candidates.filter(c => jobPostings.find(j => j.id === selectedJobId)?.title === c.position)
    : candidates;

  const stats = {
    openJobs: jobPostings.filter(j => j.status === 'open').length,
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

        <Tabs defaultValue="pipeline" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline de Candidatos</TabsTrigger>
              <TabsTrigger value="jobs">Vagas</TabsTrigger>
            </TabsList>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Vaga
            </Button>
          </div>

          <TabsContent value="pipeline" className="space-y-4">
            <KanbanBoard 
              candidates={filteredCandidates} 
              onMoveCandidate={handleMoveCandidate}
            />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobPostings.map((job) => (
                <JobPostingCard
                  key={job.id}
                  job={job}
                  onSelect={() => setSelectedJobId(job.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
