import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, ArrowLeft, Upload, FileText, X } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {job.title}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-wrap gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </span>
                </CardDescription>
              </div>
              <Badge variant={job.status === 'Aberta' ? 'default' : 'secondary'} className="w-fit text-sm">
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Sobre a vaga</h3>
              <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Requisitos</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t">
              <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    Candidatar-se para esta vaga
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Candidatura para {job.title}</DialogTitle>
                    <DialogDescription>
                      Preencha seus dados e anexe seu currículo para se candidatar.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          required 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Currículo (PDF)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <Input 
                          type="file" 
                          accept=".pdf" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleFileChange}
                        />
                        {resumeFile ? (
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <FileText className="h-8 w-8" />
                            <span>{resumeFile.name}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-2 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setResumeFile(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Clique ou arraste seu arquivo PDF aqui
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Enviando..." : "Enviar Candidatura"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}