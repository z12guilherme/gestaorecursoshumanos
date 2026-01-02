import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, ArrowLeft } from 'lucide-react';

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
              <Button size="lg" className="w-full md:w-auto">
                Candidatar-se para esta vaga
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}