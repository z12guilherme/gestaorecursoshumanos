import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, ArrowLeft, UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

    try {
      let resumeUrl = null;

      // Upload do arquivo se existir
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${job.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        resumeUrl = publicUrl;
      }

      const { error } = await supabase
        .from('candidates')
        .insert([{
          job_id: job.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: job.title,
          resume_url: resumeUrl,
          status: 'applied',
          notes: ''
        }]);

      if (error) throw error;

      toast({
        title: "Candidatura enviada!",
        description: "Boa sorte! Entraremos em contato em breve.",
      });
      setIsApplyOpen(false);
      setFormData({ name: '', email: '', phone: '' });
      setResumeFile(null);
    } catch (error: any) {
      console.error('Error applying:', error);
      toast({ title: "Erro ao enviar", description: "Ocorreu um erro ao enviar sua candidatura.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
        <Button onClick={() => navigate('/')}>Voltar para Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Hero Section da Vaga */}
      <div className="bg-white dark:bg-slate-900 border-b shadow-sm mb-8">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{job.title}</h1>
                <Badge variant={job.status === "Aberta" ? "default" : "secondary"} className="text-sm">
                  {job.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400 mt-4">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Building2 className="h-4 w-4 text-primary" /> {job.department}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" /> {job.location}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Briefcase className="h-4 w-4 text-primary" /> {job.type}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo / Detalhes da Vaga */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md">
              <CardContent className="p-6 md:p-8 space-y-8 mt-4">
                {/* Seção Descrição */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
                    <Briefcase className="h-5 w-5 text-primary" /> Sobre a Vaga
                  </h2>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {job.description || "Nenhuma descrição fornecida."}
                  </div>
                </div>

                {/* Seção Requisitos */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" /> Requisitos e Qualificações
                    </h2>
                    <ul className="grid gap-3">
                      {job.requirements.map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Card Lateral de Resumo */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-none shadow-md sticky top-6">
              <CardContent className="p-6 mt-2">
                <h3 className="font-bold text-lg mb-6 border-b pb-2">Resumo da Vaga</h3>
                <div className="space-y-5 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Localização</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Modalidade</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{job.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Departamento</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{job.department}</p>
                  </div>

                  <div className="pt-4">
                    <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="lg"
                          className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                          disabled={job.status !== "Aberta"}
                        >
                          {job.status === "Aberta" ? "Candidatar-se Agora" : "Vaga Fechada"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Candidatura: {job.title}</DialogTitle>
                          <DialogDescription>
                            Preencha seus dados abaixo e anexe seu currículo atualizado para participar do processo.
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 py-2">
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Nome Completo</Label>
                              <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João da Silva" className="h-11" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" className="h-11" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Celular</Label>
                                <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" className="h-11" />
                              </div>
                            </div>

                            <div className="grid gap-2 pt-2">
                              <Label>Currículo (Apenas formato PDF)</Label>
                              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative group">
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                {resumeFile ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                      <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{resumeFile.name}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-8 mt-2 text-destructive hover:bg-destructive/10 z-20" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                                      <X className="h-4 w-4 mr-1" /> Remover
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                      <UploadCloud className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Clique ou arraste seu currículo aqui</p>
                                    <p className="text-xs text-slate-500 mt-1">Tamanho máximo recomendado: 5MB</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button type="submit" disabled={isSubmitting || !resumeFile} className="w-full h-11 text-base">
                              {isSubmitting ? "Enviando candidatura..." : "Enviar Candidatura"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}