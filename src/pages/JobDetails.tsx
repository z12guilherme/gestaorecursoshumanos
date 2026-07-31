import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Building2,
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Globe,
  Linkedin,
  Instagram,
  Share2,
  Clock,
  Send,
  User,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatPhoneMask(value: string): string {
  if (!value) return "";
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 && ["6", "7", "8", "9"].includes(digits[2])) {
    digits = `${digits.slice(0, 2)}9${digits.slice(2)}`;
  }
  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  status: string;
  created_at: string;
}

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentWhatsApp, setConsentWhatsApp] = useState(true);
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!jobId) return;
      try {
        const [jobRes, settingsRes] = await Promise.all([
          supabase.from("jobs").select("*").eq("id", jobId).single(),
          supabase
            .from("settings")
            .select("career_page_banner, career_page_description, social_links, company_name")
            .maybeSingle(),
        ]);

        if (jobRes.error) throw jobRes.error;
        setJob(jobRes.data);

        if (settingsRes.data) {
          setSettings(settingsRes.data);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos em formato PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: job?.title || "Vaga de Emprego",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link desta vaga foi copiado para a área de transferência.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

    try {
      let resumeUrl = null;

      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const fileName = `${job.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      const { error } = await supabase.from("candidates").insert([
        {
          job_id: job.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: job.title,
          resume_url: resumeUrl,
          status: "applied",
          notes: "",
        },
      ]);

      if (error) throw error;

      setSubmittedPhone(formData.phone);
      toast({
        title: "Candidatura enviada com sucesso!",
        description: `Notificações do processo seletivo serão enviadas para ${formData.phone} via WhatsApp.`,
      });
      setIsApplyOpen(false);
      setFormData({ name: "", email: "", phone: "" });
      setResumeFile(null);
    } catch (error: any) {
      console.error("Error applying:", error);
      toast({
        title: "Erro ao enviar candidatura",
        description: "Ocorreu um erro ao enviar sua candidatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Carregando detalhes da vaga…</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Esta oportunidade pode ter sido removida ou o link é inválido.
        </p>
        <Button onClick={() => navigate("/")} variant="default" className="mt-2">
          Voltar para o Início
        </Button>
      </div>
    );
  }

  const companyName = settings?.company_name || "Hospital DMI";
  const isOpen = job.status === "Aberta" || job.status === "open";

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 animate-in fade-in duration-500">
      {/* ── Banner Institucional Opcional ───────────────────────────────────── */}
      {settings?.career_page_banner && (
        <div
          className="w-full h-40 md:h-52 bg-cover bg-center border-b"
          style={{ backgroundImage: `url(${settings.career_page_banner})` }}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* ── Hero Header (Mesmo padrão de AuditLogs/Dashboard) ─────────────── */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
            <Briefcase className="h-36 w-36 text-primary" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {job.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`gap-1 px-2.5 py-0.5 font-semibold text-xs border ${
                      isOpen
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isOpen && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{companyName}</span> •{" "}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.created_at
                      ? `Publicada em ${format(new Date(job.created_at), "dd/MM/yyyy", { locale: ptBR })}`
                      : "Vaga ativa"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-3.5 w-3.5" /> Compartilhar
              </Button>
            </div>
          </div>
        </div>

        {/* ── Summary Stats Grid (Mesmo padrão do Dashboard) ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Localização
              </p>
              <p className="text-sm font-bold text-foreground">{job.location}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Modalidade
              </p>
              <p className="text-sm font-bold text-foreground">{job.type}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Departamento
              </p>
              <p className="text-sm font-bold text-foreground">{job.department}</p>
            </div>
          </div>
        </div>

        {/* ── Corpo com 2 colunas (Padrão da App) ──────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Coluna Esquerda: Detalhes */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card Sobre a Vaga */}
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-base text-foreground mb-3 pb-2 border-b">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Sobre a Vaga
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {job.description || "Nenhuma descrição fornecida."}
                  </div>
                </div>

                {/* Requisitos */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-base text-foreground mb-3 pb-2 border-b">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Requisitos e Qualificações
                    </div>
                    <div className="grid gap-2">
                      {job.requirements.map((req: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border bg-muted/20 p-3 text-sm font-medium text-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sobre a Empresa */}
                <div>
                  <div className="flex items-center gap-2 font-semibold text-base text-foreground mb-3 pb-2 border-b">
                    <Building2 className="h-4 w-4 text-primary" />
                    Sobre o {companyName}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {settings?.career_page_description ||
                      `${companyName} é referência em qualidade, atendimento humanizado e constante desenvolvimento profissional de sua equipe.`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociais */}
            {settings?.social_links &&
              (settings.social_links.website ||
                settings.social_links.linkedin ||
                settings.social_links.instagram) && (
                <Card className="rounded-2xl border bg-card shadow-sm">
                  <CardContent className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Conheça mais sobre a empresa
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {settings.social_links.website && (
                        <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                          <a
                            href={settings.social_links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-3.5 w-3.5 text-primary" /> Site Oficial
                          </a>
                        </Button>
                      )}
                      {settings.social_links.linkedin && (
                        <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                          <a
                            href={settings.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="h-3.5 w-3.5 text-blue-500" /> LinkedIn
                          </a>
                        </Button>
                      )}
                      {settings.social_links.instagram && (
                        <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                          <a
                            href={settings.social_links.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Coluna Direita: Card Resumo Sticky */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-3 font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Resumo da Vaga
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border bg-muted/10 p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Localização
                    </p>
                    <p className="font-semibold">{job.location}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/10 p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Modalidade
                    </p>
                    <p className="font-semibold">{job.type}</p>
                  </div>

                  <div className="rounded-xl border bg-muted/10 p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Departamento
                    </p>
                    <p className="font-semibold">{job.department}</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => setIsApplyOpen(true)}
                  disabled={!isOpen}
                  className="w-full gap-2 font-bold shadow-sm"
                >
                  {isOpen ? (
                    <>
                      <Send className="h-4 w-4" /> Candidatar-se Agora
                    </>
                  ) : (
                    "Vaga Encerrada"
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Envio seguro de dados e currículo em PDF.
                </p>
              </CardContent>
            </Card>

            {/* Dica Card */}
            <div className="rounded-2xl border bg-primary/5 p-4 text-center space-y-1">
              <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Dica de Candidatura
              </p>
              <p className="text-[11px] text-muted-foreground">
                Anexe seu currículo atualizado em PDF com telefone e e-mail válidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dialog Candidatura (Standard Shadcn Dialog) ────────────────────── */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-primary" />
              Candidatura: {job.title}
            </DialogTitle>
            <DialogDescription>
              Preencha seus dados de contato e anexe seu currículo em PDF.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                >
                  <User className="h-3.5 w-3.5" /> Nome Completo
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  className="h-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                  >
                    <Mail className="h-3.5 w-3.5" /> E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" /> Celular / WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhoneMask(e.target.value) })
                    }
                    placeholder="(81) 99999-8888"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Currículo (PDF)
                </Label>
                <div className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  {resumeFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-xs text-foreground">
                        {resumeFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" /> Remover
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-1">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Clique para selecionar o PDF
                      </p>
                      <p className="text-[10px] text-muted-foreground">Tamanho máximo: 5MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2 pb-1 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border">
                <input
                  type="checkbox"
                  id="consentWhatsApp"
                  checked={consentWhatsApp}
                  onChange={(e) => setConsentWhatsApp(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 shrink-0 cursor-pointer"
                />
                <label
                  htmlFor="consentWhatsApp"
                  className="cursor-pointer leading-relaxed text-[11px] text-foreground font-medium"
                >
                  Autorizo o <strong>RH da {companyName}</strong> a enviar atualizações do processo
                  seletivo e convites de entrevista via <strong>WhatsApp</strong> para este número.
                </label>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !resumeFile || !consentWhatsApp}
                className="gap-2 font-semibold"
              >
                {isSubmitting ? (
                  "Enviando…"
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Confirmar Candidatura
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Confirmação de Envio com WhatsApp ───────────────────── */}
      <Dialog open={!!submittedPhone} onOpenChange={(open) => !open && setSubmittedPhone(null)}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-bold">Candidatura Enviada! 🎉</DialogTitle>
            <DialogDescription className="text-sm text-foreground/80 space-y-3 pt-2">
              <p>
                Sua candidatura para a vaga de <strong>{job.title}</strong> foi registrada com
                sucesso.
              </p>
              <div className="rounded-xl border bg-emerald-500/10 border-emerald-500/20 p-3 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                📲 As notificações e convites para entrevista serão enviados via WhatsApp para:
                <div className="text-base font-extrabold mt-1 font-mono">{submittedPhone}</div>
              </div>
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button className="w-full font-bold" onClick={() => setSubmittedPhone(null)}>
              Entendido!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
