import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Candidate {
  id: string;
  job_id: string | null;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  rating: number;
  notes: string;
  applied_at: string;
}

export function useRecruitment() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Busca vagas e candidatos em paralelo
      const [jobsResponse, candidatesResponse] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('applied_at', { ascending: false })
      ]);

      if (jobsResponse.error) throw jobsResponse.error;
      if (candidatesResponse.error) throw candidatesResponse.error;

      setJobs(jobsResponse.data || []);
      setCandidates(candidatesResponse.data || []);
    } catch (err: any) {
      console.error('Erro ao buscar dados de recrutamento:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Vagas ---

  const addJob = async (job: Omit<Job, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase.from('jobs').insert([job]).select().single();
      if (error) throw error;
      setJobs(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      setJobs(prev => prev.map(j => j.id === id ? data : j));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      setJobs(prev => prev.filter(j => j.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // --- Funções de Candidatos ---

  const addCandidate = async (candidate: Omit<Candidate, 'id' | 'applied_at'>) => {
    try {
      const { data, error } = await supabase.from('candidates').insert([candidate]).select().single();
      if (error) throw error;
      setCandidates(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      const { data, error } = await supabase.from('candidates').update(updates).eq('id', id).select().single();
      if (error) throw error;
      setCandidates(prev => prev.map(c => c.id === id ? data : c));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { jobs, candidates, loading, error, refetch: fetchData, addJob, updateJob, deleteJob, addCandidate, updateCandidate };
}