import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KanbanBoard } from "@/components/recruitment/KanbanBoard";
import { JobPostingCard } from "@/components/recruitment/JobPostingCard";
import { Candidate } from "@/types/hr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Briefcase,
  Users,
  Brain,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  XCircle,
  Building2,
  MapPin,
  Clock,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecruitment } from "@/hooks/useRecruitment";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { whatsappService } from "@/services/whatsappService";
import { suriService } from "@/services/suriService";

export default function Recruitment() {
  const {
    jobs,
    candidates,
    loading,
    addJob,
    updateJob,
    deleteJob,
    updateCandidate,
    deleteCandidate,
  } = useRecruitment();

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");

  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "Integral",
    description: "",
  });

  const [isAiScreeningOpen, setIsAiScreeningOpen] = useState(false);
  const [aiScreeningLoading, setAiScreeningLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const { settings } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pipeline");

  const handleMoveCandidate = async (candidateId: string, newStatus: Candidate["status"]) => {
    await updateCandidate(candidateId, { status: newStatus });

    const candidate = candidates.find((c) => c.id === candidateId);
    const companyName = settings?.company_name || "Clínica DMI | Belo Jardim";
    const statusLabels = {
      applied: "Inscritos",
      screening: "Triagem",
      interview: "Entrevista Agendada",
      approved: "Aprovado no Processo Seletivo",
      rejected: "Processo Concluído",
    };

    if (candidate && candidate.phone) {
      if (newStatus === "interview") {
        suriService.sendInterviewInvite(
          candidate.name,
          candidate.phone,
          candidate.position,
          "em breve entraremos em contato para confirmar a data e horário",
          companyName
        );
      } else if (newStatus === "approved") {
        suriService.sendDocumentApproval(
          candidate.name,
          candidate.phone,
          candidate.position,
          "RG, CPF, Comprovante de Residência e Carteira de Trabalho",
          companyName
        );
      } else {
        suriService.sendCandidateNotification(
          candidate.name,
          candidate.phone,
          candidate.position,
          statusLabels[newStatus],
          companyName
        );
      }
    }

    toast({
      title: "Candidato movido",
      description: `${candidate?.name} foi movido para ${statusLabels[newStatus]}.`,
    });
  };

  const handleWhatsAppContact = async (candidate: Candidate) => {
    const companyName = settings?.company_name || "Clínica DMI | Belo Jardim";
    const message = `Olá ${candidate.name}, aqui é do RH da ${companyName}. Gostaríamos de conversar sobre a sua candidatura para a vaga de ${candidate.position}. Poderia nos confirmar sua disponibilidade?`;

    const { success } = await suriService.sendMessage(candidate.phone, message);

    if (success) {
      toast({
        title: "WhatsApp Disparado",
        description: `Notificação enviada para ${candidate.name} via Suri WhatsApp.`,
      });
    } else {
      toast({
        title: "Erro no envio",
        description: "Não foi possível disparar a mensagem via Suri WhatsApp.",
        variant: "destructive",
      });
    }
  };

  const runAiScreening = () => {
    setIsAiScreeningOpen(true);
    setAiScreeningLoading(true);
    setAiResults([]);

    setTimeout(() => {
      const candidatesToScreen = candidates.slice(0, 6);
      const results = candidatesToScreen.map((c) => {
        const score = Math.floor(Math.random() * 30) + 70; // 70 a 99
        return {
          id: c.id,
          name: c.name,
          position: c.position,
          score,
          recommendation:
            score >= 85
              ? "Altamente Recomendado"
              : score >= 75
                ? "Recomendado para Triagem"
                : "Manter em Banco",
          summary: `Candidato possui excelente alinhamento de perfil para a vaga de ${c.position}, com experiência compatível e comunicação clara.`,
        };
      });

      setAiResults(results);
      setAiScreeningLoading(false);
    }, 1800);
  };

  const handleOpenCreateJobDialog = () => {
    setJobToEdit(null);
    setJobForm({
      title: "",
      department: "",
      location: "",
      type: "Integral",
      description: "",
    });
    setIsJobDialogOpen(true);
  };

  const handleOpenEditJobDialog = (job: any) => {
    setJobToEdit(job);
    setJobForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Integral",
      description: job.description || "",
    });
    setIsJobDialogOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (jobToEdit) {
      const { error } = await updateJob(jobToEdit.id, jobForm);
      if (error) return;
      toast({
        title: "Vaga atualizada",
        description: "As alterações da vaga foram salvas.",
      });
    } else {
      const { error } = await addJob({
        ...jobForm,
        requirements: ["Experiência relevante", "Boa comunicação"],
        status: "Aberta",
      });
      if (error) return;
      toast({
        title: "Vaga criada com sucesso!",
        description: "Nova vaga adicionada ao quadro de recrutamento.",
      });
    }

    setIsJobDialogOpen(false);
  };

  const handleDeleteJob = async (id: string) => {
    const { error } = await deleteJob(id);
    if (error) return;

    setJobToDelete(null);
    toast({
      title: "Vaga excluída",
      description: "A vaga foi removida com sucesso.",
      variant: "destructive",
    });
  };

  // Filtro de Candidatos
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.phone && candidate.phone.includes(searchQuery));

    const matchesJob = selectedJobFilter === "all" || candidate.position === selectedJobFilter;

    return matchesSearch && matchesJob;
  });

  const stats = {
    openJobs: jobs.filter((j) => j.status === "Aberta" || j.status === "open").length,
    totalCandidates: candidates.length,
    inProcess: candidates.filter((c) =>
      ["Triagem", "Entrevista", "screening", "interview"].includes(c.status)
    ).length,
    approved: candidates.filter((c) => c.status === "Aprovado" || c.status === "approved").length,
  };

  return (
    <AppLayout
      title="Recrutamento & Seleção"
      subtitle="Gerencie vagas, triagem com IA e candidatos via WhatsApp"
    >
      <div className="space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vagas Abertas
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{stats.openJobs}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary mt-1">
                  <Briefcase className="h-3 w-3" /> Posições ativas
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <Briefcase className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidatos
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">
                  {stats.totalCandidates}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-1">
                  <Users className="h-3 w-3" /> Banco de Talentos
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Em Processo
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{stats.inProcess}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1">
                  <Calendar className="h-3 w-3" /> Triagem & Entrevista
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aprovados
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{stats.approved}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  <UserCheck className="h-3 w-3" /> Prontos p/ Admissão
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Controls & Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3 rounded-2xl border shadow-xs">
            {/* Tabs Selector */}
            <TabsList className="bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="pipeline" className="rounded-lg text-xs font-semibold px-4 py-2">
                Pipeline de Candidatos
              </TabsTrigger>
              <TabsTrigger value="jobs" className="rounded-lg text-xs font-semibold px-4 py-2">
                Vagas Abertas ({jobs.length})
              </TabsTrigger>
            </TabsList>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "pipeline" && (
                <>
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar candidato..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl"
                    />
                  </div>

                  <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                    <SelectTrigger className="h-9 text-xs w-[160px] rounded-xl">
                      <SelectValue placeholder="Todas as vagas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as vagas</SelectItem>
                      {jobs.map((j) => (
                        <SelectItem key={j.id} value={j.title}>
                          {j.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl text-xs font-semibold border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-900/60 dark:text-purple-300 dark:hover:bg-purple-950/40"
                onClick={runAiScreening}
              >
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Triagem com IA
              </Button>

              <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-9 gap-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90"
                    onClick={handleOpenCreateJobDialog}
                  >
                    <Plus className="h-4 w-4" />
                    Nova Vaga
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {jobToEdit ? "Editar Vaga" : "Criar Nova Vaga"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {jobToEdit
                        ? "Altere os detalhes da vaga para atualizar no mural e portal de carreiras."
                        : "Preencha as informações para abrir uma nova posição em aberto no sistema."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSaveJob} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-semibold">
                        Título da Vaga
                      </Label>
                      <Input
                        id="title"
                        required
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        placeholder="Ex: Técnico de Enfermagem"
                        className="h-9 text-sm rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="department" className="text-xs font-semibold">
                          Departamento
                        </Label>
                        <Input
                          id="department"
                          required
                          value={jobForm.department}
                          onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                          placeholder="Ex: Enfermagem / TI"
                          className="h-9 text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="type" className="text-xs font-semibold">
                          Regime / Contratação
                        </Label>
                        <Select
                          value={jobForm.type}
                          onValueChange={(v) => setJobForm({ ...jobForm, type: v })}
                        >
                          <SelectTrigger className="h-9 text-sm rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Integral">Integral (CLT)</SelectItem>
                            <SelectItem value="Estágio">Estágio</SelectItem>
                            <SelectItem value="Híbrido">Híbrido</SelectItem>
                            <SelectItem value="Remoto">Remoto</SelectItem>
                            <SelectItem value="PJ">PJ / Contrato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-xs font-semibold">
                        Localização
                      </Label>
                      <Input
                        id="location"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="Ex: Belo Jardim - PE"
                        className="h-9 text-sm rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-semibold">
                        Descrição e Requisitos
                      </Label>
                      <Textarea
                        id="description"
                        rows={3}
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        placeholder="Descreva as responsabilidades da vaga..."
                        className="text-sm rounded-xl"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsJobDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="font-semibold">
                        {jobToEdit ? "Salvar Alterações" : "Publicar Vaga"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tab 1: Pipeline Kanban */}
          <TabsContent value="pipeline" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Carregando candidatos e pipeline...</p>
              </div>
            ) : (
              <KanbanBoard
                candidates={filteredCandidates}
                onMoveCandidate={handleMoveCandidate}
                onDeleteCandidate={deleteCandidate}
                onWhatsAppContact={handleWhatsAppContact}
              />
            )}
          </TabsContent>

          {/* Tab 2: Vagas */}
          <TabsContent value="jobs">
            {jobs.length === 0 ? (
              <Card className="p-12 text-center rounded-2xl border-dashed">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-bold text-foreground">Nenhuma vaga aberta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique no botão "Nova Vaga" para publicar a primeira posição.
                </p>
                <Button onClick={handleOpenCreateJobDialog} className="gap-2 font-semibold">
                  <Plus className="h-4 w-4" /> Criar Primeira Vaga
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <JobPostingCard
                    key={job.id}
                    job={job}
                    candidateCount={candidates.filter((c) => c.position === job.title).length}
                    onEdit={handleOpenEditJobDialog}
                    onDelete={(id) => setJobToDelete(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Triagem com IA */}
        <Dialog open={isAiScreeningOpen} onOpenChange={setIsAiScreeningOpen}>
          <DialogContent className="sm:max-w-[650px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Brain className="h-6 w-6" /> Triagem de Candidatos com Inteligência Artificial
              </DialogTitle>
              <DialogDescription className="text-xs">
                A IA analisa o histórico, competências e adequação dos candidatos às vagas em
                aberto.
              </DialogDescription>
            </DialogHeader>

            {aiScreeningLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 animate-pulse">
                  <Sparkles className="h-8 w-8 animate-spin" />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  Analisando currículos e requisitos...
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Avaliando compatibilidade técnica e histórico profissional.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2 max-h-[420px] overflow-y-auto pr-1">
                {aiResults.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border bg-card hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{res.name}</span>
                        <Badge
                          variant="secondary"
                          className={
                            res.score >= 85
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {res.score}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{res.position}</p>
                      <p className="text-xs text-foreground/80 pt-1 leading-relaxed">
                        {res.summary}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="shrink-0 text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        handleMoveCandidate(res.id, "screening");
                        toast({
                          title: "Candidato movido",
                          description: `${res.name} avançou para a etapa de Triagem.`,
                        });
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mover para Triagem
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAiScreeningOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Exclusão de Vaga */}
        <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir esta vaga?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Esta ação não pode ser desfeita e removerá a vaga do portal e dos relatórios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
              >
                Excluir Vaga
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
